import uuid
from typing import Optional
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.user import Customer
from app.models.catalog import Product, ProductVariant
from app.models.pricing import PriceList, PriceListItem
from app.schemas.pricing import PriceResolutionResponse
from app.core.exceptions import NotFoundError

async def resolve_price_for_customer(
    db: AsyncSession,
    product_id: uuid.UUID,
    customer_id: Optional[uuid.UUID] = None,
    variant_id: Optional[uuid.UUID] = None,
    qty: int = 1,
) -> PriceResolutionResponse:
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
