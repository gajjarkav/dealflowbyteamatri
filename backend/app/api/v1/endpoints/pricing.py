import uuid
from typing import Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_
from sqlalchemy.orm import selectinload

from app.api.dependencies import get_db, get_current_internal_user, require_roles
from app.models.user import User, Customer
from app.models.enums import RoleEnum
from app.models.catalog import Product, ProductVariant
from app.models.pricing import PriceList, PriceListItem
from app.schemas.pricing import (
    PriceListCreate, PriceListUpdate, PriceListResponse,
    PriceListItemCreate, PriceListItemUpdate, PriceListItemResponse,
    PriceResolutionResponse,
)
from app.services.pricing_service import resolve_price_for_customer
from app.schemas.common import Paginated
from app.services.crud_base import paginate
from app.core.exceptions import NotFoundError, BadRequestError

router = APIRouter()

# ─── Price Lists ──────────────────────────────────────────

@router.get("/pricelists", response_model=Paginated[PriceListResponse])
async def list_pricelists(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    total = (await db.execute(select(func.count()).select_from(PriceList))).scalar_one()
    items = (await db.execute(select(PriceList).offset((page-1)*size).limit(size))).scalars().all()
    return paginate([PriceListResponse.model_validate(p) for p in items], total, page, size)

@router.post("/pricelists", response_model=PriceListResponse)
async def create_pricelist(
    data: PriceListCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    pl = PriceList(**data.model_dump())
    db.add(pl)
    await db.commit()
    await db.refresh(pl)
    return PriceListResponse.model_validate(pl)

@router.get("/pricelists/{pricelist_id}", response_model=PriceListResponse)
async def get_pricelist(
    pricelist_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    pl = (await db.execute(select(PriceList).where(PriceList.id == pricelist_id))).scalars().first()
    if not pl:
        raise NotFoundError("Pricelist not found.")
    return PriceListResponse.model_validate(pl)

@router.patch("/pricelists/{pricelist_id}", response_model=PriceListResponse)
async def update_pricelist(
    pricelist_id: uuid.UUID,
    data: PriceListUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    pl = (await db.execute(select(PriceList).where(PriceList.id == pricelist_id))).scalars().first()
    if not pl:
        raise NotFoundError("Pricelist not found.")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(pl, k, v)
    await db.commit()
    await db.refresh(pl)
    return PriceListResponse.model_validate(pl)

@router.delete("/pricelists/{pricelist_id}")
async def delete_pricelist(
    pricelist_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    pl = (await db.execute(select(PriceList).where(PriceList.id == pricelist_id))).scalars().first()
    if not pl:
        raise NotFoundError("Pricelist not found.")
    await db.delete(pl)
    await db.commit()
    return {"message": "Pricelist deleted."}

# ─── Pricelist Items ──────────────────────────────────────

@router.get("/pricelists/{pricelist_id}/items", response_model=Paginated[PriceListItemResponse])
async def list_pricelist_items(
    pricelist_id: uuid.UUID,
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    f = PriceListItem.price_list_id == pricelist_id
    total = (await db.execute(select(func.count()).select_from(PriceListItem).where(f))).scalar_one()
    items = (await db.execute(select(PriceListItem).where(f).offset((page-1)*size).limit(size))).scalars().all()
    return paginate([PriceListItemResponse.model_validate(i) for i in items], total, page, size)

@router.post("/pricelists/{pricelist_id}/items", response_model=PriceListItemResponse)
async def add_pricelist_item(
    pricelist_id: uuid.UUID,
    data: PriceListItemCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    pl = (await db.execute(select(PriceList).where(PriceList.id == pricelist_id))).scalars().first()
    if not pl:
        raise NotFoundError("Pricelist not found.")
    item = PriceListItem(price_list_id=pricelist_id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return PriceListItemResponse.model_validate(item)

@router.patch("/pricelist-items/{item_id}", response_model=PriceListItemResponse)
async def update_pricelist_item(
    item_id: uuid.UUID,
    data: PriceListItemUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    item = (await db.execute(select(PriceListItem).where(PriceListItem.id == item_id))).scalars().first()
    if not item:
        raise NotFoundError("Item not found.")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    await db.commit()
    await db.refresh(item)
    return PriceListItemResponse.model_validate(item)

@router.delete("/pricelist-items/{item_id}")
async def delete_pricelist_item(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    item = (await db.execute(select(PriceListItem).where(PriceListItem.id == item_id))).scalars().first()
    if not item:
        raise NotFoundError("Item not found.")
    await db.delete(item)
    await db.commit()
    return {"message": "Item deleted."}

# ─── Price Resolution ─────────────────────────────────────

@router.get("/pricing/resolve", response_model=PriceResolutionResponse)
async def resolve_price(
    product_id: uuid.UUID,
    customer_id: Optional[uuid.UUID] = None,
    variant_id: Optional[uuid.UUID] = None,
    qty: int = Query(1, ge=1),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    return await resolve_price_for_customer(db, product_id, customer_id, variant_id, qty)
