from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from uuid import UUID
from decimal import Decimal

# ─── DiscountTier ─────────────────────────────────────────
class DiscountTierUpsert(BaseModel):
    tier: str  # bronze | silver | gold
    max_discount_pct: Decimal

class DiscountTierResponse(BaseModel):
    tier: str
    max_discount_pct: Decimal
    model_config = ConfigDict(from_attributes=True)

# ─── CategoryDiscountCeiling ──────────────────────────────
class CategoryCeilingBase(BaseModel):
    tier: str
    category_id: UUID
    max_discount_pct: Decimal

class CategoryCeilingCreate(CategoryCeilingBase):
    pass

class CategoryCeilingUpdate(BaseModel):
    max_discount_pct: Optional[Decimal] = None

class CategoryCeilingResponse(CategoryCeilingBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

# ─── ApprovalRule ─────────────────────────────────────────
class ApprovalRuleBase(BaseModel):
    name: str
    min_risk: Decimal
    max_risk: Optional[Decimal] = None
    steps: List[str] = []
    absolute_discount_amount_cap: Optional[Decimal] = None
    is_active: bool = True

class ApprovalRuleCreate(ApprovalRuleBase):
    pass

class ApprovalRuleUpdate(BaseModel):
    name: Optional[str] = None
    min_risk: Optional[Decimal] = None
    max_risk: Optional[Decimal] = None
    steps: Optional[List[str]] = None
    absolute_discount_amount_cap: Optional[Decimal] = None
    is_active: Optional[bool] = None

class ApprovalRuleResponse(ApprovalRuleBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

# ─── AppSetting ───────────────────────────────────────────
class AppSettingUpdate(BaseModel):
    value: Any

class AppSettingResponse(BaseModel):
    key: str
    value: Any
    model_config = ConfigDict(from_attributes=True)

# ─── Effective Discount ───────────────────────────────────
class EffectiveDiscountResponse(BaseModel):
    allowed_pct: Decimal
    tier_ceiling: Decimal
    category_ceiling: Optional[Decimal] = None
    binding_source: str  # "tier" | "category"
