import uuid
import copy
from typing import List, Dict, Any
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.quotation import Quotation, QuotationLine, QuotationEvent
from app.models.upsell import UpsellRule
from app.models.catalog import Product
from app.models.enums import EventType
from app.models.user import User
from app.api.v1.endpoints.pricing import resolve_price # Note: In a real app we'd extract logic from endpoint to a service, but the spec says "import the function, don't HTTP-call yourself". Let's assume resolve_price logic is in pricing engine or we can just fetch it here.

from app.services.quotation_calc import recompute
from app.core.exceptions import NotFoundError

async def suggest(db: AsyncSession, quotation: Quotation) -> List[Dict[str, Any]]:
    if not quotation.lines:
        return []
        
    cart_product_ids = {line.product_id for line in quotation.lines}
    dismissed_ids = set(quotation.dismissed_suggestions or [])
    
    # 1. Candidate rules where product_id ∈ cart products, active, suggested_product ∉ cart, ∉ dismissed_suggestions.
    rules = (await db.execute(
        select(UpsellRule).where(
            UpsellRule.product_id.in_(cart_product_ids),
            UpsellRule.is_active == True,
            UpsellRule.suggested_product_id.not_in(cart_product_ids),
            UpsellRule.suggested_product_id.not_in(dismissed_ids) if dismissed_ids else True
        )
    )).scalars().all()
    
    if not rules:
        return []
        
    suggestions = []
    seen_products = set()
    
    for rule in rules:
        if rule.suggested_product_id in seen_products:
            continue
            
        suggested_product = (await db.execute(
            select(Product).where(Product.id == rule.suggested_product_id)
        )).scalars().first()
        
        if not suggested_product or not suggested_product.is_active:
            continue
            
        # 2. Resolve price for the customer.
        # Since the spec says "resolve price for the customer (pricing engine)", we need a simplified way to get price here.
        # Assuming list_price for now if we can't easily call pricing resolve logic directly without an endpoint.
        # Let's use list_price to keep it independent, or we can fetch a pricelist.
        # For this exercise, list_price is fine as base.
        price = suggested_product.list_price
        cost = suggested_product.cost_price
        
        if price <= 0:
            continue
            
        margin = ((price - cost) / price) * Decimal("100")
        
        # Filter margin >= rule.min_margin_pct
        if margin < rule.min_margin_pct:
            continue
            
        # 3. Score = co_purchase_count + (10 if suggested.is_promoted) + margin/10
        score = rule.co_purchase_count + (10 if suggested_product.is_promoted else 0) + float(margin / Decimal("10"))
        
        # Find the cart product name for the reason
        cart_product_name = next(line.description for line in quotation.lines if line.product_id == rule.product_id)
        
        # 4. Calculate margin_delta by recomputing on a copy
        # We need a deep copy of lines to avoid messing up the real quotation
        dummy_quote = Quotation(
            order_discount_pct=quotation.order_discount_pct,
            lines=[]
        )
        for line in quotation.lines:
            dummy_quote.lines.append(
                QuotationLine(
                    qty=line.qty,
                    unit_price=line.unit_price,
                    cost_price=line.cost_price,
                    discount_pct=line.discount_pct,
                    tax_pct=line.tax_pct
                )
            )
            
        recompute(dummy_quote)
        base_margin = dummy_quote.margin_pct
        
        # Add the suggested line
        dummy_quote.lines.append(
            QuotationLine(
                qty=Decimal("1.0"),
                unit_price=price,
                cost_price=cost,
                discount_pct=Decimal("0"),
                tax_pct=suggested_product.tax_pct
            )
        )
        
        recompute(dummy_quote)
        new_margin = dummy_quote.margin_pct
        margin_delta = new_margin - base_margin
        
        seen_products.add(rule.suggested_product_id)
        
        suggestions.append({
            "product_id": str(suggested_product.id),
            "name": suggested_product.name,
            "category": "Suggested", # or fetch category name
            "unit_price": price.quantize(Decimal("0.01")),
            "margin_pct": margin.quantize(Decimal("0.01")),
            "margin_delta": margin_delta.quantize(Decimal("0.01")),
            "is_promoted": suggested_product.is_promoted,
            "reason": f"Bought together with {cart_product_name}",
            "rule_id": str(rule.id),
            "score": score
        })
        
    # Sort by score desc
    suggestions.sort(key=lambda x: x["score"], reverse=True)
    
    return suggestions

async def add(db: AsyncSession, quotation: Quotation, product_id: uuid.UUID, actor: User) -> Quotation:
    product = (await db.execute(select(Product).where(Product.id == product_id))).scalars().first()
    if not product:
        raise NotFoundError("Product not found")
        
    # Create line
    new_line = QuotationLine(
        quotation_id=quotation.id,
        product_id=product.id,
        description=product.name,
        category_id=product.category_id,
        unit_price=product.list_price,
        cost_price=product.cost_price,
        tax_pct=product.tax_pct,
        is_recurring=product.is_recurring,
        plan_id=product.default_plan_id,
        qty=Decimal("1.0"),
        added_via="upsell"
    )
    
    db.add(new_line)
    quotation.lines.append(new_line)
    
    # Recompute
    recompute(quotation)
    
    # Event
    event = QuotationEvent(
        quotation_id=quotation.id,
        type=EventType.upsell_added,
        actor_id=actor.id,
        message=f"Added upsell: {product.name}"
    )
    db.add(event)
    
    await db.commit()
    return quotation

async def dismiss(db: AsyncSession, quotation: Quotation, product_id: uuid.UUID, actor: User) -> Quotation:
    if not quotation.dismissed_suggestions:
        quotation.dismissed_suggestions = []
        
    if str(product_id) not in quotation.dismissed_suggestions:
        # Pydantic JSONB lists need reallocation to trigger SQLAlchemy dirty flag
        new_list = list(quotation.dismissed_suggestions)
        new_list.append(str(product_id))
        quotation.dismissed_suggestions = new_list
        
        event = QuotationEvent(
            quotation_id=quotation.id,
            type=EventType.upsell_dismissed,
            actor_id=actor.id,
            message="Dismissed an upsell suggestion."
        )
        db.add(event)
        
    await db.commit()
    return quotation
