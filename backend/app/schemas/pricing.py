from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from decimal import Decimal

# ─── PriceList ────────────────────────────────────────────
class PriceListBase(BaseModel):
    name: str
    tier: Optional[str] = None  # None = generic
    currency: str = "USD"
    is_active: bool = True

class PriceListCreate(PriceListBase):
    pass

class PriceListUpdate(BaseModel):
    name: Optional[str] = None
    tier: Optional[str] = None
    currency: Optional[str] = None
    is_active: Optional[bool] = None

class PriceListResponse(PriceListBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

# ─── PriceListItem ────────────────────────────────────────
class PriceListItemBase(BaseModel):
    product_id: UUID
    variant_id: Optional[UUID] = None
    fixed_price: Optional[Decimal] = None
    discount_pct: Optional[Decimal] = None
    min_qty: int = 1

class PriceListItemCreate(PriceListItemBase):
    pass

class PriceListItemUpdate(BaseModel):
    fixed_price: Optional[Decimal] = None
    discount_pct: Optional[Decimal] = None
    min_qty: Optional[int] = None

class PriceListItemResponse(PriceListItemBase):
    id: UUID
    price_list_id: UUID
    model_config = ConfigDict(from_attributes=True)

# ─── Price Resolution ─────────────────────────────────────
class PriceResolutionResponse(BaseModel):
    unit_price: Decimal
    cost_price: Decimal
    source: str  # "pricelist" | "list_price"
    currency: str
    margin_pct: Optional[Decimal] = None
