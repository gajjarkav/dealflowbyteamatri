import uuid
import secrets
import string
import hashlib
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import BackgroundTasks
from app.models.user import User, Customer
from app.models.auth import VerificationCode, RefreshToken
from app.models.enums import RoleEnum, TierEnum, PurposeEnum
from app.schemas.user import CustomerRegister
from app.schemas.auth import LoginRequest
from app.services.auth.security import get_password_hash, verify_password, create_access_token, generate_random_token
from app.services.smtp.email_service import send_email
from app.services.audit_service import log_audit
from app.core.exceptions import BadRequestError, UnauthorizedError, ForbiddenError

def generate_otp() -> str:
    return "".join(secrets.choice(string.digits) for _ in range(6))

def hash_token_sha256(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

async def revoke_all_refresh_tokens(db: AsyncSession, user_id: uuid.UUID):
    stmt = select(RefreshToken).where(
        RefreshToken.user_id == user_id,
        RefreshToken.revoked_at.is_(None)
    )
    result = await db.execute(stmt)
    for token in result.scalars().all():
        token.revoked_at = datetime.now(timezone.utc)

async def check_otp_rate_limit(db: AsyncSession, user_id: uuid.UUID, purpose: PurposeEnum):
    stmt = select(VerificationCode).where(
        VerificationCode.user_id == user_id,
        VerificationCode.purpose == purpose,
        VerificationCode.consumed_at.is_(None)
    ).order_by(VerificationCode.created_at.desc())
    result = await db.execute(stmt)
    last_otp = result.scalars().first()
    
    if last_otp:
        if datetime.now(timezone.utc) - last_otp.created_at < timedelta(seconds=60):
            raise BadRequestError("Please wait 60 seconds before requesting a new code.")
        # Invalidate the old OTP
        last_otp.consumed_at = datetime.now(timezone.utc)
        await db.commit()

async def register_customer(db: AsyncSession, data: CustomerRegister, background_tasks: BackgroundTasks):
    stmt = select(User).where(User.email == data.email.lower())
    result = await db.execute(stmt)
    existing_user = result.scalars().first()

    if existing_user:
        if existing_user.is_email_verified:
            # We don't reveal that the email exists, just return generic success.
            # But we don't send an email or change password.
            return {"message": "Registration successful. Please verify your email with the OTP sent."}
        else:
            # Unverified user. Update details and resend OTP.
            existing_user.full_name = data.full_name
            existing_user.password_hash = get_password_hash(data.password)
            existing_user.mobile_number = data.mobile_number
            await check_otp_rate_limit(db, existing_user.id, PurposeEnum.signup_verify)
            
            otp = generate_otp()
            v_code = VerificationCode(
                user_id=existing_user.id,
                purpose=PurposeEnum.signup_verify,
                code_hash=get_password_hash(otp),
                expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
            )
            db.add(v_code)
            await db.commit()
            background_tasks.add_task(send_email, existing_user.email, "Verify your DealFlow Account", f"Your OTP is: <strong>{otp}</strong>. It expires in 10 minutes.")
            return {"message": "Registration successful. Please verify your email with the OTP sent."}

    # Create new customer
    customer = Customer(company_name=data.company_name)
    db.add(customer)
    await db.flush()

    user = User(
        full_name=data.full_name,
        email=data.email.lower(),
        password_hash=get_password_hash(data.password),
        mobile_number=data.mobile_number,
        role=RoleEnum.customer,
        customer_id=customer.id,
        is_email_verified=False
    )
    db.add(user)
    await db.flush()

    otp = generate_otp()
    v_code = VerificationCode(
        user_id=user.id,
        purpose=PurposeEnum.signup_verify,
        code_hash=get_password_hash(otp),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
    )
    db.add(v_code)
    await db.commit()

    background_tasks.add_task(send_email, user.email, "Verify your DealFlow Account", f"Your OTP is: <strong>{otp}</strong>. It expires in 10 minutes.")
    return {"message": "Registration successful. Please verify your email with the OTP sent."}

async def verify_otp_signup(db: AsyncSession, email: str, code: str):
    stmt = select(User).where(User.email == email.lower())
    result = await db.execute(stmt)
    user = result.scalars().first()
    if not user:
        raise BadRequestError("Invalid email or code.")
    
    if user.is_email_verified:
        raise BadRequestError("Already verified, please log in")

    stmt = select(VerificationCode).where(
        VerificationCode.user_id == user.id,
        VerificationCode.purpose == PurposeEnum.signup_verify,
        VerificationCode.consumed_at.is_(None)
    ).order_by(VerificationCode.created_at.desc())
    
    result = await db.execute(stmt)
    v_code = result.scalars().first()

    if not v_code:
        raise BadRequestError("No active OTP found.")

    if v_code.expires_at < datetime.now(timezone.utc):
        raise BadRequestError("OTP expired.")
        
    if v_code.attempts >= 5:
        raise BadRequestError("Too many attempts. Request a new OTP.")

    if not verify_password(code, v_code.code_hash):
        v_code.attempts += 1
        await db.commit()
        raise BadRequestError("Invalid OTP.")

    v_code.consumed_at = datetime.now(timezone.utc)
    user.is_email_verified = True
    await db.commit()

    return await _issue_tokens(db, user)

async def login_user(db: AsyncSession, data: LoginRequest, background_tasks: BackgroundTasks):
    stmt = select(User).where(User.email == data.email.lower())
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user or not user.is_active:
        raise UnauthorizedError("Invalid credentials or inactive account.")
    
    if user.locked_until:
        if user.locked_until > datetime.now(timezone.utc):
            raise UnauthorizedError("Account is temporarily locked.")
        else:
            # Lock has expired, reset attempts
            user.failed_login_attempts = 0
            user.locked_until = None

    if not verify_password(data.password, user.password_hash):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= 5:
            user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=15)
            await log_audit(db, "user", user.id, "lockout", user.id, "Exceeded login attempts")
        await db.commit()
        raise UnauthorizedError("Invalid credentials.")

    if not user.is_email_verified:
        raise ForbiddenError("Please verify your email first.")

    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = datetime.now(timezone.utc)
    
    if user.role in [RoleEnum.admin, RoleEnum.finance]:
        await check_otp_rate_limit(db, user.id, PurposeEnum.login_2fa)
        otp = generate_otp()
        v_code = VerificationCode(
            user_id=user.id,
            purpose=PurposeEnum.login_2fa,
            code_hash=get_password_hash(otp),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
        )
        db.add(v_code)
        await db.commit()
        background_tasks.add_task(send_email, user.email, "Your 2FA Login Code", f"Your OTP is: <strong>{otp}</strong>. It expires in 10 minutes.")
        return {
            "require_2fa": True,
            "message": "OTP sent to your email.",
            "email": user.email
        }

    await db.commit()
    return await _issue_tokens(db, user)

async def verify_login_2fa(db: AsyncSession, email: str, code: str):
    stmt = select(User).where(User.email == email.lower())
    result = await db.execute(stmt)
    user = result.scalars().first()
    if not user:
        raise BadRequestError("Invalid email or code.")

    stmt = select(VerificationCode).where(
        VerificationCode.user_id == user.id,
        VerificationCode.purpose == PurposeEnum.login_2fa,
        VerificationCode.consumed_at.is_(None)
    ).order_by(VerificationCode.created_at.desc())
    
    result = await db.execute(stmt)
    v_code = result.scalars().first()

    if not v_code:
        raise BadRequestError("No active OTP found.")

    if v_code.expires_at < datetime.now(timezone.utc):
        raise BadRequestError("OTP expired.")
        
    if v_code.attempts >= 5:
        raise BadRequestError("Too many attempts. Request a new OTP.")

    if not verify_password(code, v_code.code_hash):
        v_code.attempts += 1
        await db.commit()
        raise BadRequestError("Invalid OTP.")

    v_code.consumed_at = datetime.now(timezone.utc)
    await db.commit()

    return await _issue_tokens(db, user)

async def _issue_tokens(db: AsyncSession, user: User):
    token = create_access_token(
        subject=user.id,
        additional_claims={
            "role": user.role.value,
            "customer_id": str(user.customer_id) if user.customer_id else None,
            "token_version": user.token_version
        }
    )

    refresh_token_str = generate_random_token(64)
    refresh_token_db = RefreshToken(
        user_id=user.id,
        token_hash=hash_token_sha256(refresh_token_str),
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    db.add(refresh_token_db)
    await db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "refresh_token": refresh_token_str,
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name,
        "must_change_password": user.must_change_password,
        "customer_id": user.customer_id
    }

async def refresh_access_token(db: AsyncSession, refresh_token: str):
    hashed_rt = hash_token_sha256(refresh_token)
    stmt = select(RefreshToken).where(
        RefreshToken.token_hash == hashed_rt,
        RefreshToken.revoked_at.is_(None),
        RefreshToken.expires_at > datetime.now(timezone.utc)
    )
    result = await db.execute(stmt)
    valid_token_db = result.scalars().first()

    if not valid_token_db:
        raise UnauthorizedError("Invalid or expired refresh token.")

    stmt = select(User).where(User.id == valid_token_db.user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user or not user.is_active:
        raise UnauthorizedError("User not active.")
        
    valid_token_db.revoked_at = datetime.now(timezone.utc)
    await db.commit()

    return await _issue_tokens(db, user)

async def logout_user(db: AsyncSession, user: User, refresh_token: str):
    # Revoke the specific refresh token
    hashed_rt = hash_token_sha256(refresh_token)
    stmt = select(RefreshToken).where(
        RefreshToken.token_hash == hashed_rt,
        RefreshToken.user_id == user.id,
        RefreshToken.revoked_at.is_(None)
    )
    result = await db.execute(stmt)
    valid_token_db = result.scalars().first()

    if valid_token_db:
        valid_token_db.revoked_at = datetime.now(timezone.utc)
    
    # Bump token version to revoke ALL active access tokens immediately
    user.token_version += 1
    await revoke_all_refresh_tokens(db, user.id)
    await db.commit()

    return {"message": "Successfully logged out from all devices."}

async def forgot_password(db: AsyncSession, email: str, background_tasks: BackgroundTasks):
    stmt = select(User).where(User.email == email.lower())
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user or not user.is_active:
        # Don't leak existence, return success anyway
        return {"message": "If that email exists, a reset code has been sent."}

    await check_otp_rate_limit(db, user.id, PurposeEnum.password_reset)
    
    otp = generate_otp()
    v_code = VerificationCode(
        user_id=user.id,
        purpose=PurposeEnum.password_reset,
        code_hash=get_password_hash(otp),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
    )
    db.add(v_code)
    await db.commit()

    background_tasks.add_task(send_email, user.email, "Password Reset Request", f"Your password reset code is: <strong>{otp}</strong>. It expires in 10 minutes.")
    return {"message": "If that email exists, a reset code has been sent."}

async def reset_password(db: AsyncSession, email: str, code: str, new_password: str):
    stmt = select(User).where(User.email == email.lower())
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user or not user.is_active:
        raise BadRequestError("Invalid email or code.")

    stmt = select(VerificationCode).where(
        VerificationCode.user_id == user.id,
        VerificationCode.purpose == PurposeEnum.password_reset,
        VerificationCode.consumed_at.is_(None)
    ).order_by(VerificationCode.created_at.desc())
    
    result = await db.execute(stmt)
    v_code = result.scalars().first()

    if not v_code:
        raise BadRequestError("No active reset code found.")

    if v_code.expires_at < datetime.now(timezone.utc):
        raise BadRequestError("Reset code expired.")
        
    if v_code.attempts >= 5:
        raise BadRequestError("Too many attempts. Request a new code.")

    if not verify_password(code, v_code.code_hash):
        v_code.attempts += 1
        await db.commit()
        raise BadRequestError("Invalid reset code.")

    v_code.consumed_at = datetime.now(timezone.utc)
    user.password_hash = get_password_hash(new_password)
    # Lockout all old sessions
    user.token_version += 1
    # Reset lockouts just in case
    user.failed_login_attempts = 0
    user.locked_until = None
    
    await log_audit(db, "user", user.id, "reset_password", user.id)
    await revoke_all_refresh_tokens(db, user.id)
    await db.commit()

    return {"message": "Password successfully reset. You can now log in."}

async def resend_otp(db: AsyncSession, email: str, purpose: PurposeEnum, background_tasks: BackgroundTasks):
    stmt = select(User).where(User.email == email.lower())
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user or not user.is_active:
        return {"message": "If that email exists, a new code has been sent."}
        
    if purpose not in [PurposeEnum.signup_verify, PurposeEnum.password_reset]:
        raise BadRequestError("Cannot resend this type of OTP.")

    await check_otp_rate_limit(db, user.id, purpose)

    otp = generate_otp()
    v_code = VerificationCode(
        user_id=user.id,
        purpose=purpose,
        code_hash=get_password_hash(otp),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
    )
    db.add(v_code)
    await db.commit()

    background_tasks.add_task(send_email, user.email, "Your Verification Code", f"Your new code is: <strong>{otp}</strong>. It expires in 10 minutes.")
    return {"message": "If that email exists, a new code has been sent."}
