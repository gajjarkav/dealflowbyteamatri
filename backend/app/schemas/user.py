from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.enums import RoleEnum, TierEnum

class CustomerBase(BaseModel):
    company_name: str
    tier: TierEnum = TierEnum.bronze
    currency: str = "USD"
    billing_address: Optional[str] = None
    tax_id: Optional[str] = None
    is_active: bool = True

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    mobile_number: Optional[str] = None
    role: RoleEnum = RoleEnum.customer
    is_active: bool = True
    team_id: Optional[UUID] = None

class UserCreate(UserBase):
    password: Optional[str] = Field(None, min_length=8)
    customer_id: Optional[UUID] = None
    is_system: bool = False

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    mobile_number: Optional[str] = None
    role: Optional[RoleEnum] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: UUID
    customer_id: Optional[UUID]
    is_email_verified: bool
    must_change_password: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class CustomerRegister(BaseModel):
    company_name: str
    full_name: str
    email: EmailStr
    password: str = Field(..., min_length=8)
    mobile_number: Optional[str] = None
