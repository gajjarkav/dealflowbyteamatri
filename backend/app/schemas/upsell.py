from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from decimal import Decimal

class UpsellRuleBase(BaseModel):
    product_id: UUID
    suggested_product_id: UUID
    co_purchase_count: int = 0
    min_margin_pct: Decimal = Decimal("0")
    is_active: bool = True

class UpsellRuleCreate(UpsellRuleBase):
    pass

class UpsellRuleUpdate(BaseModel):
    co_purchase_count: Optional[int] = None
    min_margin_pct: Optional[Decimal] = None
    is_active: Optional[bool] = None

class UpsellRuleResponse(UpsellRuleBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)
