from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Union
from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.user import CustomerRegister
from app.schemas.auth import LoginRequest, TokenResponse, OTPVerifyRequest, Login2FAResponse, RefreshTokenRequest
from app.services.auth.auth_service import register_customer, verify_otp_signup, login_user, verify_login_2fa, refresh_access_token, logout_user

router = APIRouter()

@router.post("/register")
async def register(data: CustomerRegister, db: AsyncSession = Depends(get_db)):
    """Customer registration flow: creates customer and user, sends OTP."""
    return await register_customer(db, data)

@router.post("/verify-email")
async def verify_email(data: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    """Verify email via OTP."""
    return await verify_otp_signup(db, data.email, data.code)

@router.post("/login", response_model=Union[TokenResponse, Login2FAResponse])
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login and get JWT or 2FA challenge."""
    return await login_user(db, data)

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
    """Logout by revoking the refresh token."""
    return await logout_user(db, current_user, data.refresh_token)
