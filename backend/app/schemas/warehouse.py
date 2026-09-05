from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from decimal import Decimal

# ─── Warehouse ────────────────────────────────────────────
class WarehouseBase(BaseModel):
    name: str
    code: str
    address: Optional[str] = None
    shipping_cost_weight: Decimal = Decimal("1.0")
    is_active: bool = True

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    shipping_cost_weight: Optional[Decimal] = None
    is_active: Optional[bool] = None

class WarehouseResponse(WarehouseBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

# ─── StockLevel ───────────────────────────────────────────
class StockLevelResponse(BaseModel):
    id: UUID
    warehouse_id: UUID
    product_id: UUID
    qty_on_hand: Decimal
    qty_reserved: Decimal
    qty_available: Decimal  # computed: on_hand - reserved
    reorder_point: Decimal
    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm(cls, obj) -> "StockLevelResponse":
        return cls(
            id=obj.id,
            warehouse_id=obj.warehouse_id,
            product_id=obj.product_id,
            qty_on_hand=obj.qty_on_hand,
            qty_reserved=obj.qty_reserved,
            qty_available=max(obj.qty_on_hand - obj.qty_reserved, Decimal("0")),
            reorder_point=obj.reorder_point,
        )

# ─── StockAdjust ──────────────────────────────────────────
class StockAdjustRequest(BaseModel):
    product_id: UUID
    delta: Decimal
    reason: str = "adjustment"
    note: Optional[str] = None

# ─── StockAvailability ────────────────────────────────────
class StockAvailabilityItem(BaseModel):
    warehouse_id: UUID
    warehouse_name: str
    qty_available: Decimal

class StockAvailabilityResponse(BaseModel):
    product_id: UUID
    availability: List[StockAvailabilityItem]
