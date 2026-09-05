from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from uuid import UUID
from decimal import Decimal

# ─── Category ───────────────────────────────────────────
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

# ─── Product Variant ─────────────────────────────────────
class VariantBase(BaseModel):
    attribute_name: str
    attribute_value: str
    extra_price: Decimal = Decimal("0")
    sku_suffix: Optional[str] = None

class VariantCreate(VariantBase):
    pass

class VariantUpdate(BaseModel):
    attribute_name: Optional[str] = None
    attribute_value: Optional[str] = None
    extra_price: Optional[Decimal] = None
    sku_suffix: Optional[str] = None

class VariantResponse(VariantBase):
    id: UUID
    product_id: UUID
    model_config = ConfigDict(from_attributes=True)

# ─── Product ─────────────────────────────────────────────
class ProductBase(BaseModel):
    name: str
    sku: str
    category_id: UUID
    list_price: Decimal = Decimal("0")
    cost_price: Decimal = Decimal("0")
    unit: str = "each"
    tax_pct: Decimal = Decimal("0")
    description: Optional[str] = None
    is_recurring: bool = False
    default_plan_id: Optional[UUID] = None
    is_promoted: bool = False
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category_id: Optional[UUID] = None
    list_price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    unit: Optional[str] = None
    tax_pct: Optional[Decimal] = None
    description: Optional[str] = None
    is_recurring: Optional[bool] = None
    default_plan_id: Optional[UUID] = None
    is_promoted: Optional[bool] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: UUID
    variants: List[VariantResponse] = []
    margin_pct: Optional[Decimal] = None

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_with_margin(cls, obj) -> "ProductResponse":
        data = cls.model_validate(obj)
        if obj.list_price and obj.list_price > 0:
            data.margin_pct = round((obj.list_price - obj.cost_price) / obj.list_price * 100, 2)
        return data
