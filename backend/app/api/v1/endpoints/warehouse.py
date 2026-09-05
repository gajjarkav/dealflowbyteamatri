import uuid
from typing import Optional, List
from decimal import Decimal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_
from sqlalchemy.orm import selectinload

from app.api.dependencies import get_db, get_current_internal_user, require_roles
from app.models.user import User
from app.models.enums import RoleEnum
from app.models.warehouse import Warehouse, StockLevel, StockMovement
from app.models.catalog import Product
from app.schemas.warehouse import (
    WarehouseCreate, WarehouseUpdate, WarehouseResponse,
    StockLevelResponse, StockAdjustRequest,
    StockAvailabilityResponse, StockAvailabilityItem,
)
from app.schemas.common import Paginated
from app.services.crud_base import paginate
from app.core.exceptions import NotFoundError, BadRequestError

router = APIRouter()

# ─── Warehouses ───────────────────────────────────────────

@router.get("/warehouses", response_model=Paginated[WarehouseResponse])
async def list_warehouses(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    total = (await db.execute(select(func.count()).select_from(Warehouse))).scalar_one()
    items = (await db.execute(select(Warehouse).offset((page-1)*size).limit(size))).scalars().all()
    return paginate([WarehouseResponse.model_validate(w) for w in items], total, page, size)

@router.post("/warehouses", response_model=WarehouseResponse)
async def create_warehouse(
    data: WarehouseCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    wh = Warehouse(**data.model_dump())
    db.add(wh)
    await db.commit()
    await db.refresh(wh)
    return WarehouseResponse.model_validate(wh)

@router.get("/warehouses/{warehouse_id}", response_model=WarehouseResponse)
async def get_warehouse(
    warehouse_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    wh = (await db.execute(select(Warehouse).where(Warehouse.id == warehouse_id))).scalars().first()
    if not wh:
        raise NotFoundError("Warehouse not found.")
    return WarehouseResponse.model_validate(wh)

@router.patch("/warehouses/{warehouse_id}", response_model=WarehouseResponse)
async def update_warehouse(
    warehouse_id: uuid.UUID,
    data: WarehouseUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    wh = (await db.execute(select(Warehouse).where(Warehouse.id == warehouse_id))).scalars().first()
    if not wh:
        raise NotFoundError("Warehouse not found.")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(wh, k, v)
    await db.commit()
    await db.refresh(wh)
    return WarehouseResponse.model_validate(wh)

@router.delete("/warehouses/{warehouse_id}")
async def deactivate_warehouse(
    warehouse_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    wh = (await db.execute(select(Warehouse).where(Warehouse.id == warehouse_id))).scalars().first()
    if not wh:
        raise NotFoundError("Warehouse not found.")
    wh.is_active = False
    await db.commit()
    return {"message": f"Warehouse {wh.name} deactivated."}

# ─── Stock ────────────────────────────────────────────────

@router.get("/warehouses/{warehouse_id}/stock", response_model=List[StockLevelResponse])
async def get_warehouse_stock(
    warehouse_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    wh = (await db.execute(select(Warehouse).where(Warehouse.id == warehouse_id))).scalars().first()
    if not wh:
        raise NotFoundError("Warehouse not found.")
    levels = (await db.execute(
        select(StockLevel).where(StockLevel.warehouse_id == warehouse_id)
    )).scalars().all()
    return [StockLevelResponse.from_orm(s) for s in levels]

@router.post("/warehouses/{warehouse_id}/stock/adjust", response_model=StockLevelResponse)
async def adjust_stock(
    warehouse_id: uuid.UUID,
    data: StockAdjustRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.sales_manager)),
):
    """Adjust stock on-hand. Creates a StockMovement record. delta can be negative (removal)."""
    wh = (await db.execute(select(Warehouse).where(Warehouse.id == warehouse_id))).scalars().first()
    if not wh:
        raise NotFoundError("Warehouse not found.")

    product = (await db.execute(select(Product).where(Product.id == data.product_id))).scalars().first()
    if not product:
        raise NotFoundError("Product not found.")

    # Get or create stock level
    sl = (await db.execute(
        select(StockLevel).where(
            StockLevel.warehouse_id == warehouse_id,
            StockLevel.product_id == data.product_id,
        )
    )).scalars().first()

    if not sl:
        sl = StockLevel(
            warehouse_id=warehouse_id,
            product_id=data.product_id,
            qty_on_hand=Decimal("0"),
            qty_reserved=Decimal("0"),
            reorder_point=Decimal("0"),
        )
        db.add(sl)
        await db.flush()

    new_qty = sl.qty_on_hand + data.delta
    if new_qty < 0:
        raise BadRequestError(f"Adjustment would result in negative stock ({new_qty}).")

    sl.qty_on_hand = new_qty

    movement = StockMovement(
        warehouse_id=warehouse_id,
        product_id=data.product_id,
        delta=data.delta,
        reason=data.reason,
        note=data.note,
        created_by=current_user.id,
    )
    db.add(movement)
    await db.commit()
    await db.refresh(sl)
    return StockLevelResponse.from_orm(sl)

# ─── Stock Availability ───────────────────────────────────

@router.get("/stock/availability", response_model=StockAvailabilityResponse)
async def get_stock_availability(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    """Returns per-warehouse available qty (on_hand - reserved) for a product."""
    product = (await db.execute(select(Product).where(Product.id == product_id))).scalars().first()
    if not product:
        raise NotFoundError("Product not found.")

    levels = (await db.execute(
        select(StockLevel, Warehouse)
        .join(Warehouse, StockLevel.warehouse_id == Warehouse.id)
        .where(StockLevel.product_id == product_id, Warehouse.is_active == True)
    )).all()

    items = [
        StockAvailabilityItem(
            warehouse_id=sl.warehouse_id,
            warehouse_name=wh.name,
            qty_available=max(sl.qty_on_hand - sl.qty_reserved, Decimal("0")),
        )
        for sl, wh in levels
    ]
    return StockAvailabilityResponse(product_id=product_id, availability=items)
