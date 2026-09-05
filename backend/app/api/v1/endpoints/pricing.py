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
    """
    Resolution order:
    1. Active pricelist matching customer tier + currency + min_qty <= qty
    2. Generic pricelist (tier=NULL) matching currency + min_qty <= qty
    3. Product list_price + variant extra_price
    """
    product = (await db.execute(select(Product).where(Product.id == product_id))).scalars().first()
    if not product:
        raise NotFoundError("Product not found.")

    variant_extra = Decimal("0")
    if variant_id:
        variant = (await db.execute(select(ProductVariant).where(ProductVariant.id == variant_id))).scalars().first()
        if not variant:
            raise NotFoundError("Variant not found.")
        variant_extra = variant.extra_price

    # Find customer tier + currency
    customer_tier = None
    customer_currency = "USD"
    if customer_id:
        customer = (await db.execute(select(Customer).where(Customer.id == customer_id))).scalars().first()
        if customer:
            customer_tier = customer.tier.value if customer.tier else None
            customer_currency = customer.currency

    # --- Search pricelist items ---
    # Build query: join PriceListItem → PriceList, filter active, product_id, min_qty <= qty
    stmt = (
        select(PriceListItem, PriceList)
        .join(PriceList, PriceListItem.price_list_id == PriceList.id)
        .where(
            PriceListItem.product_id == product_id,
            PriceList.is_active == True,
            PriceList.currency == customer_currency,
            PriceListItem.min_qty <= qty,
        )
    )
    if variant_id:
        stmt = stmt.where(
            (PriceListItem.variant_id == variant_id) | (PriceListItem.variant_id.is_(None))
        )
    rows = (await db.execute(stmt.order_by(PriceListItem.min_qty.desc()))).all()

    # First prefer tier-matched, then generic
    best = None
    for item, pl in rows:
        if customer_tier and pl.tier == customer_tier:
            best = (item, pl)
            break
    if not best:
        for item, pl in rows:
            if pl.tier is None:
                best = (item, pl)
                break

    base_price = product.list_price + variant_extra

    if best:
        item, pl = best
        if item.fixed_price is not None:
            unit_price = item.fixed_price + variant_extra
        else:
            discount = item.discount_pct / Decimal("100") if item.discount_pct else Decimal("0")
            unit_price = base_price * (1 - discount)
        margin_pct = None
        if unit_price > 0:
            margin_pct = round((unit_price - product.cost_price) / unit_price * 100, 2)
        return PriceResolutionResponse(
            unit_price=unit_price,
            cost_price=product.cost_price,
            source="pricelist",
            currency=pl.currency,
            margin_pct=margin_pct,
        )

    # Fallback to list_price
    margin_pct = None
    if base_price > 0:
        margin_pct = round((base_price - product.cost_price) / base_price * 100, 2)
    return PriceResolutionResponse(
        unit_price=base_price,
        cost_price=product.cost_price,
        source="list_price",
        currency=customer_currency,
        margin_pct=margin_pct,
    )
