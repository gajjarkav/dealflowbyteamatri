import uuid
from decimal import Decimal
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.quotation import Quotation, QuotationLine, QuotationEvent, quotation_seq
from app.models.user import User, Customer
from app.models.catalog import Product, ProductVariant
from app.models.enums import QuotationStatus, EventType, RoleEnum, ApprovalTrigger
from app.models.discount import AppSetting
from app.core.exceptions import NotFoundError, BadRequestError, ForbiddenError

from app.services.quotation_calc import recompute
from app.services.risk_score import calculate_risk, RiskSettings
from app.services.discount_policy import get_discount_cache
from app.services.approval_router import reopen_if_needed

# Simple dependency or getter for settings
async def get_risk_settings(db: AsyncSession) -> RiskSettings:
    rows = (await db.execute(select(AppSetting))).scalars().all()
    d = {r.key: r.value for r in rows}
    
    weights = d.get("risk_weights", {})
    return RiskSettings(
        risk_weights_blended=Decimal(weights.get("blended", 1)),
        risk_weights_worst_line=Decimal(weights.get("worst_line", 0.5)),
        risk_weights_margin_penalty=Decimal(weights.get("margin_penalty", 0.25)),
        target_margin_pct=Decimal(d.get("target_margin_pct", 30))
    )

def _enforce_edit_guard(quotation: Quotation):
    allowed_states = [QuotationStatus.draft, QuotationStatus.revision_requested, QuotationStatus.under_negotiation]
    if quotation.status not in allowed_states:
        raise BadRequestError(f"Cannot edit quotation in {quotation.status} state.")

def _enforce_ownership(quotation: Quotation, user: User):
    if user.role == RoleEnum.sales_rep and quotation.rep_id != user.id:
        raise ForbiddenError("You do not have permission to access this quotation.")

async def _get_next_number(db: AsyncSession) -> str:
    # Get sequence nextval
    result = await db.execute(func.nextval("quotation_seq"))
    val = result.scalar()
    year = datetime.now(timezone.utc).year
    return f"Q-{year}-{val:04d}"

async def _trigger_reopen_if_needed(db: AsyncSession, quotation: Quotation, actor: User):
    # Phase 5 hook
    if quotation.status in [QuotationStatus.approved, QuotationStatus.sent]:
        await reopen_if_needed(db, quotation, ApprovalTrigger.edit_after_approval, actor)

async def create_quotation(db: AsyncSession, customer_id: uuid.UUID, rep: User, notes: Optional[str] = None, promised_date: Optional[datetime] = None) -> Quotation:
    customer = (await db.execute(select(Customer).where(Customer.id == customer_id))).scalars().first()
    if not customer:
        raise NotFoundError("Customer not found")
        
    number = await _get_next_number(db)
    
    q = Quotation(
        number=number,
        customer_id=customer_id,
        rep_id=rep.id,
        currency=customer.currency or "USD",
        notes=notes,
        promised_date=promised_date
    )
    db.add(q)
    await db.flush() # get id
    
    event = QuotationEvent(
        quotation_id=q.id,
        type=EventType.created,
        actor_id=rep.id,
        message=f"Quotation {number} created."
    )
    db.add(event)
    await db.commit()
    await db.refresh(q)
    return q

async def add_line(db: AsyncSession, quotation: Quotation, product_id: uuid.UUID, variant_id: Optional[uuid.UUID], qty: Decimal, discount_pct: Decimal, actor: User) -> Quotation:
    _enforce_edit_guard(quotation)
    _enforce_ownership(quotation, actor)
    
    product = (await db.execute(select(Product).where(Product.id == product_id))).scalars().first()
    if not product:
        raise NotFoundError("Product not found")
        
    variant = None
    if variant_id:
        variant = (await db.execute(select(ProductVariant).where(ProductVariant.id == variant_id))).scalars().first()
        if not variant or variant.product_id != product.id:
            raise NotFoundError("Variant not found or doesn't belong to product")
            
    # Resolve price using pricing logic
    from app.services.pricing_service import resolve_price_for_customer
    customer = (await db.execute(select(Customer).where(Customer.id == quotation.customer_id))).scalars().first()
    
    price_info = await resolve_price_for_customer(
        db=db,
        product_id=product.id,
        customer_id=customer.id if customer else None,
        variant_id=variant.id if variant else None,
        qty=int(qty)
    )
    unit_price = Decimal(price_info.unit_price)
    
    desc = product.name
    if variant:
        desc += f" ({variant.attribute_name}: {variant.attribute_value})"
        
    # Get allowed ceiling
    cache = get_discount_cache()
    tier_str = customer.tier.value if customer.tier else "bronze"
    allowed_disc = await cache.get_effective_ceiling(db, tier_str, product.category_id)
    
    sort_order = len(quotation.lines)
    
    line = QuotationLine(
        quotation_id=quotation.id,
        product_id=product.id,
        variant_id=variant_id,
        description=desc,
        category_id=product.category_id,
        unit_price=unit_price,
        cost_price=product.cost_price,
        tax_pct=product.tax_pct,
        is_recurring=product.is_recurring,
        plan_id=product.default_plan_id,
        qty=qty,
        discount_pct=discount_pct,
        allowed_discount_pct=allowed_disc,
        sort_order=sort_order
    )
    
    db.add(line)
    quotation.lines.append(line)
    await db.flush()
    
    await _trigger_reopen_if_needed(db, quotation, actor)
    
    recompute(quotation)
    await generate_risk_preview(db, quotation) # Updates quotation risk fields inline
    
    event = QuotationEvent(
        quotation_id=quotation.id,
        type=EventType.line_added,
        actor_id=actor.id,
        message=f"Added {qty}x {desc}"
    )
    db.add(event)
    
    await db.commit()
    return quotation

async def update_line(db: AsyncSession, quotation: Quotation, line_id: uuid.UUID, qty: Optional[Decimal], discount_pct: Optional[Decimal], actor: User) -> Quotation:
    _enforce_edit_guard(quotation)
    _enforce_ownership(quotation, actor)
    
    line = next((l for l in quotation.lines if l.id == line_id), None)
    if not line:
        raise NotFoundError("Line not found")
        
    updates = []
    if qty is not None and qty != line.qty:
        updates.append(f"Qty {line.qty} -> {qty}")
        line.qty = qty
        
        # We should technically re-resolve price if qty changes and hits a volume break,
        # but for simplicity we keep the snapshot unless they explicitly re-add it.
        # The prompt says: unit_price resolved at add-time (snapshot).
        
    if discount_pct is not None and discount_pct != line.discount_pct:
        updates.append(f"Discount {line.discount_pct}% -> {discount_pct}%")
        line.discount_pct = discount_pct
        
    if updates:
        await _trigger_reopen_if_needed(db, quotation, actor)
        recompute(quotation)
        await generate_risk_preview(db, quotation)
        
        event = QuotationEvent(
            quotation_id=quotation.id,
            type=EventType.line_updated,
            actor_id=actor.id,
            message=f"Updated {line.description}: " + ", ".join(updates)
        )
        db.add(event)
        await db.commit()
        
    return quotation

async def remove_line(db: AsyncSession, quotation: Quotation, line_id: uuid.UUID, actor: User) -> Quotation:
    _enforce_edit_guard(quotation)
    _enforce_ownership(quotation, actor)
    
    line = next((l for l in quotation.lines if l.id == line_id), None)
    if not line:
        raise NotFoundError("Line not found")
        
    desc = line.description
    await db.delete(line)
    quotation.lines.remove(line)
    
    await _trigger_reopen_if_needed(db, quotation, actor)
    recompute(quotation)
    await generate_risk_preview(db, quotation)
    
    event = QuotationEvent(
        quotation_id=quotation.id,
        type=EventType.line_removed,
        actor_id=actor.id,
        message=f"Removed {desc}"
    )
    db.add(event)
    await db.commit()
    return quotation

async def update_meta(db: AsyncSession, quotation: Quotation, notes: Optional[str], promised_date: Optional[datetime], order_discount_pct: Optional[Decimal], actor: User) -> Quotation:
    _enforce_edit_guard(quotation)
    _enforce_ownership(quotation, actor)
    
    updates = []
    if notes is not None:
        quotation.notes = notes
    if promised_date is not None:
        quotation.promised_date = promised_date
    if order_discount_pct is not None and order_discount_pct != quotation.order_discount_pct:
        quotation.order_discount_pct = order_discount_pct
        updates.append(f"Order discount -> {order_discount_pct}%")
        
    if updates:
        await _trigger_reopen_if_needed(db, quotation, actor)
        recompute(quotation)
        await generate_risk_preview(db, quotation)
        
        event = QuotationEvent(
            quotation_id=quotation.id,
            type=EventType.discount_changed,
            actor_id=actor.id,
            message=", ".join(updates)
        )
        db.add(event)
        
    await db.commit()
    return quotation

async def generate_risk_preview(db: AsyncSession, quotation: Quotation) -> dict:
    """
    Generates the risk breakdown and updates the quotation's risk fields.
    Does not commit by itself.
    """
    settings = await get_risk_settings(db)
    
    # We need to construct the lines dict for calculate_risk
    lines_data = []
    for line in quotation.lines:
        lines_data.append({
            "id": str(line.id),
            "product_name": line.description,
            "category_name": "Category", # simplified
            "line_subtotal": line.line_subtotal,
            "discount_pct": line.discount_pct,
            "allowed_discount_pct": line.allowed_discount_pct or Decimal("0")
        })
        
    risk_data = calculate_risk(
        lines_data,
        quotation.order_discount_pct or Decimal("0"),
        quotation.margin_pct or Decimal("0"),
        settings
    )
    
    from fastapi.encoders import jsonable_encoder
    quotation.risk_score = risk_data["risk"]
    quotation.risk_breakdown = jsonable_encoder(risk_data)
    
    # Keep 'risk' for risk_breakdown, but add 'risk_score' for schema compatibility
    risk_data["risk_score"] = risk_data["risk"]
    
    # Write excess back to lines if we can
    for line_info in risk_data.get("lines", []):
        lid = uuid.UUID(line_info["line_id"])
        line = next((l for l in quotation.lines if l.id == lid), None)
        if line:
            line.excess_pts = Decimal(line_info["excess"])
            
    # Calculate would_require
    from app.services.approval_router import resolve_rule
    rule = await resolve_rule(db, quotation.risk_score, quotation.discount_total)
    
    risk_data["would_require"] = rule.steps if rule else []
    
    return risk_data
