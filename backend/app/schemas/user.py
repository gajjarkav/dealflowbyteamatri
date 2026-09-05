from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator, model_validator
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

    @field_validator('email', mode='before')
    @classmethod
    def to_lower(cls, v: str) -> str:
        if isinstance(v, str):
            return v.lower()
        return v

class UserCreate(UserBase):
    password: Optional[str] = Field(None, min_length=8)

class PortalMeResponse(BaseModel):
    full_name: str
    email: EmailStr
    company_name: str
    tier: TierEnum
    
    model_config = ConfigDict(from_attributes=True)
    
    @model_validator(mode='before')
    @classmethod
    def extract_customer_info(cls, data: any):
        if hasattr(data, 'customer') and data.customer:
            return {
                "full_name": data.full_name,
                "email": data.email,
                "company_name": data.customer.company_name,
                "tier": data.customer.tier
            }
        return data

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

    @field_validator('email', mode='before')
    @classmethod
    def to_lower(cls, v: str) -> str:
        if isinstance(v, str):
            return v.lower()
        return v
