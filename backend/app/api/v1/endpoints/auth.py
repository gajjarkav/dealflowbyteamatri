from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Union
from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.enums import PurposeEnum
from app.schemas.user import CustomerRegister
from app.schemas.auth import LoginRequest, TokenResponse, OTPVerifyRequest, Login2FAResponse, RefreshTokenRequest, ForgotPasswordRequest, ResetPasswordRequest, ResendOTPRequest, ChangePasswordRequest
from app.services.auth.auth_service import register_customer, verify_otp_signup, login_user, verify_login_2fa, refresh_access_token, logout_user, forgot_password, reset_password, resend_otp

router = APIRouter()

@router.post("/register")
async def register(data: CustomerRegister, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Customer registration flow: creates customer and user, sends OTP."""
    return await register_customer(db, data, background_tasks)

@router.post("/verify-email", response_model=TokenResponse)
async def verify_email(data: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    """Verify email via OTP and return tokens."""
    return await verify_otp_signup(db, data.email, data.code)

@router.post("/login", response_model=Union[TokenResponse, Login2FAResponse])
async def login(data: LoginRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Login and get JWT or 2FA challenge."""
    return await login_user(db, data, background_tasks)

@router.post("/verify-login-2fa", response_model=TokenResponse)
async def verify_2fa(data: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    """Verify 2FA OTP and get JWT."""
    return await verify_login_2fa(db, data.email, data.code)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Refresh access token."""
    return await refresh_access_token(db, data.refresh_token)

@router.post("/logout")
async def logout(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Logout by revoking the refresh token and invalidating all access tokens."""
    return await logout_user(db, current_user, data.refresh_token)

@router.post("/forgot-password")
async def handle_forgot_password(data: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Request a password reset code."""
    return await forgot_password(db, data.email, background_tasks)

@router.post("/reset-password")
async def handle_reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset password using OTP code."""
    return await reset_password(db, data.email, data.code, data.new_password)

@router.post("/resend-otp")
async def handle_resend_otp(data: ResendOTPRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Resend OTP code for any valid purpose."""
    purpose = PurposeEnum(data.purpose)
    return await resend_otp(db, data.email, purpose, background_tasks)
