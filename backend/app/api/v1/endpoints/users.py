import uuid
from typing import List
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api.dependencies import get_db, get_current_internal_user, get_current_user, require_roles
from app.models.user import User
from app.models.enums import RoleEnum, PurposeEnum
from app.models.auth import VerificationCode
from app.schemas.user import UserResponse, UserCreate, UserUpdate
from app.schemas.auth import ChangePasswordRequest
from app.services.auth.security import get_password_hash, verify_password, generate_random_token
from app.services.auth.auth_service import revoke_all_refresh_tokens
from app.services.smtp.email_service import send_email
from app.services.audit_service import log_audit
from app.core.exceptions import BadRequestError, ForbiddenError, NotFoundError
from datetime import datetime, timezone, timedelta

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_internal_user)):
    """Get current internal user info."""
    return current_user

@router.post("/change-password")
async def change_password(data: ChangePasswordRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not verify_password(data.old_password, current_user.password_hash):
        raise BadRequestError("Incorrect old password")
        
    current_user.password_hash = get_password_hash(data.new_password)
    current_user.must_change_password = False
    current_user.token_version += 1 # Invalidate all sessions
    
    await log_audit(db, "user", current_user.id, "change_password", current_user.id)
    await revoke_all_refresh_tokens(db, current_user.id)
    await db.commit()
    return {"message": "Password changed successfully."}

@router.get("/", response_model=List[UserResponse])
async def list_users(db: AsyncSession = Depends(get_db), current_user: User = Depends(require_roles(RoleEnum.admin))):
    """Admin: List all users."""
    stmt = select(User)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/", response_model=UserResponse)
async def create_user(
    data: UserCreate, 
    background_tasks: BackgroundTasks, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(require_roles(RoleEnum.admin))
):
    """Admin: Create an internal user or admin."""
    if data.role == RoleEnum.customer:
        raise BadRequestError("Cannot create customer role from this endpoint.")
        
    stmt = select(User).where(User.email == data.email.lower())
    result = await db.execute(stmt)
    if result.scalars().first():
        raise BadRequestError("Email already registered.")

    # Auto-generate password if not provided
    temp_password = data.password if data.password else generate_random_token(12)
    
    user = User(
        full_name=data.full_name,
        email=data.email.lower(),
        password_hash=get_password_hash(temp_password),
        mobile_number=data.mobile_number,
        role=data.role,
        is_active=True,
        is_email_verified=True,
        must_change_password=True,
        created_by=current_user.id
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    await log_audit(db, "user", user.id, "create", current_user.id, "Admin created user", {"role": data.role.value})

    # Send invite email
    html = f"""
    <p>Hello {user.full_name},</p>
    <p>An account has been created for you with the role <strong>{user.role.value}</strong>.</p>
    <p>Your temporary password is: <strong>{temp_password}</strong></p>
    <p>Please log in and change your password immediately.</p>
    """
    background_tasks.add_task(send_email, user.email, "Welcome to DealFlow API", html)

    return user

@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.admin))
):
    """Admin: Update an existing user."""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user:
        raise NotFoundError("User not found.")

    if user.is_system and user.id != current_user.id:
        raise ForbiddenError("Cannot modify the system user.")
        
    if data.role == RoleEnum.customer:
        raise BadRequestError("Cannot change an internal user to customer.")
        
    if data.role and data.role != RoleEnum.admin and user.id == current_user.id:
        raise ForbiddenError("Cannot demote yourself.")
        
    role_changed = data.role is not None and data.role != user.role

    if data.full_name is not None:
        user.full_name = data.full_name
    if data.mobile_number is not None:
        user.mobile_number = data.mobile_number
    if data.role is not None:
        user.role = data.role
    if data.is_active is not None:
        user.is_active = data.is_active

    if role_changed:
        user.token_version += 1
        await revoke_all_refresh_tokens(db, user.id)

    await log_audit(db, "user", user.id, "update", current_user.id, "Admin updated user", data.model_dump(exclude_unset=True, mode='json'))

    await db.commit()
    await db.refresh(user)
    return user

@router.post("/{user_id}/deactivate")
async def deactivate_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.admin))
):
    """Admin: Deactivate a user."""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user:
        raise NotFoundError("User not found.")

    if user.id == current_user.id:
        raise BadRequestError("Cannot deactivate yourself.")

    if user.is_system:
        raise ForbiddenError("Cannot deactivate the system user.")

    if user.role == RoleEnum.admin:
        stmt_admins = select(User).where(User.role == RoleEnum.admin, User.is_active == True)
        result_admins = await db.execute(stmt_admins)
        active_admins = result_admins.scalars().all()
        if len(active_admins) <= 1:
            raise BadRequestError("Cannot deactivate the last active admin.")

    user.is_active = False
    user.token_version += 1 # Invalidate sessions
    
    await log_audit(db, "user", user.id, "deactivate", current_user.id, "Admin deactivated user")
    await revoke_all_refresh_tokens(db, user.id)
    await db.commit()
    
    return {"message": f"User {user.email} deactivated."}
