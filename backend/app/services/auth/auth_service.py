import uuid
import random
import string
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from app.models.user import User, Customer
from app.models.auth import VerificationCode, RefreshToken
from app.models.enums import RoleEnum, TierEnum, PurposeEnum
from app.schemas.user import CustomerRegister
from app.schemas.auth import LoginRequest
from app.services.auth.security import get_password_hash, verify_password, create_access_token, generate_random_token
from app.services.smtp.email_service import send_email

def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))

async def register_customer(db: AsyncSession, data: CustomerRegister):
    # Check if email exists
    stmt = select(User).where(User.email == data.email.lower())
    result = await db.execute(stmt)
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered.")
    
    # Create customer
    customer = Customer(
        company_name=data.company_name,
    )
    db.add(customer)
    await db.flush()

    # Create user
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

    # Create OTP
    otp = generate_otp()
    v_code = VerificationCode(
        user_id=user.id,
        purpose=PurposeEnum.signup_verify,
        code_hash=get_password_hash(otp),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
    )
    db.add(v_code)
    await db.commit()
    await db.refresh(user)

    # Send email
    send_email(user.email, "Verify your DealFlow Account", f"Your OTP is: <strong>{otp}</strong>. It expires in 10 minutes.")

    return {"message": "Registration successful. Please verify your email with the OTP sent."}

async def verify_otp_signup(db: AsyncSession, email: str, code: str):
    stmt = select(User).where(User.email == email.lower())
    result = await db.execute(stmt)
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or code.")
    
    if user.is_email_verified:
        return {"message": "Email already verified."}

    # Find active OTP
    stmt = select(VerificationCode).where(
        VerificationCode.user_id == user.id,
        VerificationCode.purpose == PurposeEnum.signup_verify,
        VerificationCode.consumed_at.is_(None)
    ).order_by(VerificationCode.created_at.desc())
    
    result = await db.execute(stmt)
    v_code = result.scalars().first()

    if not v_code:
        raise HTTPException(status_code=400, detail="No active OTP found.")

    if v_code.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired.")
        
    if v_code.attempts >= 5:
        raise HTTPException(status_code=400, detail="Too many attempts. Request a new OTP.")

    if not verify_password(code, v_code.code_hash):
        v_code.attempts += 1
        await db.commit()
        raise HTTPException(status_code=400, detail="Invalid OTP.")

    # Success
    v_code.consumed_at = datetime.now(timezone.utc)
    user.is_email_verified = True
    await db.commit()

    return {"message": "Email verified successfully."}

async def login_user(db: AsyncSession, data: LoginRequest):
    stmt = select(User).where(User.email == data.email.lower())
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid credentials or inactive account.")
    
    if user.locked_until and user.locked_until > datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Account is temporarily locked.")

    if not verify_password(data.password, user.password_hash):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= 5:
            user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=15)
        await db.commit()
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    if not user.is_email_verified:
        raise HTTPException(status_code=403, detail="Please verify your email first.")

    # Success login
    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = datetime.now(timezone.utc)
    
    if user.role in [RoleEnum.admin, RoleEnum.finance]:
        otp = generate_otp()
        v_code = VerificationCode(
            user_id=user.id,
            purpose=PurposeEnum.login_2fa,
            code_hash=get_password_hash(otp),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
        )
        db.add(v_code)
        await db.commit()
        send_email(user.email, "Your 2FA Login Code", f"Your OTP is: <strong>{otp}</strong>. It expires in 10 minutes.")
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
        raise HTTPException(status_code=400, detail="Invalid email or code.")

    stmt = select(VerificationCode).where(
        VerificationCode.user_id == user.id,
        VerificationCode.purpose == PurposeEnum.login_2fa,
        VerificationCode.consumed_at.is_(None)
    ).order_by(VerificationCode.created_at.desc())
    
    result = await db.execute(stmt)
    v_code = result.scalars().first()

    if not v_code:
        raise HTTPException(status_code=400, detail="No active OTP found.")

    if v_code.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="OTP expired.")
        
    if v_code.attempts >= 5:
        raise HTTPException(status_code=400, detail="Too many attempts. Request a new OTP.")

    if not verify_password(code, v_code.code_hash):
        v_code.attempts += 1
        await db.commit()
        raise HTTPException(status_code=400, detail="Invalid OTP.")

    # Success
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
        token_hash=get_password_hash(refresh_token_str),
        expires_at=datetime.now(timezone.utc) + timedelta(days=30)
    )
    db.add(refresh_token_db)
    await db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "refresh_token": refresh_token_str,
        "user_id": user.id,
        "role": user.role,
        "customer_id": user.customer_id
    }

async def refresh_access_token(db: AsyncSession, refresh_token: str):
    # Find all active refresh tokens and verify the hash
    stmt = select(RefreshToken).where(
        RefreshToken.revoked_at.is_(None),
        RefreshToken.expires_at > datetime.now(timezone.utc)
    )
    result = await db.execute(stmt)
    active_tokens = result.scalars().all()

    valid_token_db = None
    for token_db in active_tokens:
        if verify_password(refresh_token, token_db.token_hash):
            valid_token_db = token_db
            break

    if not valid_token_db:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token.")

    # Get user
    stmt = select(User).where(User.id == valid_token_db.user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not active.")
        
    # Revoke old refresh token (optional, for token rotation)
    valid_token_db.revoked_at = datetime.now(timezone.utc)
    await db.commit()

    return await _issue_tokens(db, user)

async def logout_user(db: AsyncSession, user: User, refresh_token: str):
    # Find all active refresh tokens and verify the hash
    stmt = select(RefreshToken).where(
        RefreshToken.user_id == user.id,
        RefreshToken.revoked_at.is_(None)
    )
    result = await db.execute(stmt)
    active_tokens = result.scalars().all()

    valid_token_db = None
    for token_db in active_tokens:
        if verify_password(refresh_token, token_db.token_hash):
            valid_token_db = token_db
            break

    if valid_token_db:
        valid_token_db.revoked_at = datetime.now(timezone.utc)
        await db.commit()

    return {"message": "Successfully logged out."}
