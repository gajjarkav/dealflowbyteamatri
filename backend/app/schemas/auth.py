from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from app.models.enums import RoleEnum

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None
    user_id: UUID
    role: RoleEnum
    customer_id: Optional[UUID] = None

class Login2FAResponse(BaseModel):
    require_2fa: bool = True
    message: str = "OTP sent to your email."
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    code: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str
