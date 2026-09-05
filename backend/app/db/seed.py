"""
Seed v2 — idempotent.
Runs on app startup via lifespan, or manually: python -m app.db.seed
"""
import asyncio
import logging
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import AsyncSessionLocal
from app.core.config import settings
from app.models.user import User, Customer
from app.models.enums import RoleEnum, TierEnum
from app.models.catalog import ProductCategory, Product
from app.models.discount import DiscountTier, CategoryDiscountCeiling, ApprovalRule, AppSetting
from app.models.warehouse import Warehouse, StockLevel
from app.models.subscription import SubscriptionPlan
from app.models.upsell import UpsellRule
from app.services.auth.security import get_password_hash

logger = logging.getLogger(__name__)


async def _get_or_create(db, model, filter_kwargs, create_kwargs=None):
    """Generic upsert helper."""
    stmt = select(model).filter_by(**filter_kwargs)
    result = await db.execute(stmt)
    obj = result.scalars().first()
    if obj:
        return obj, False
    kwargs = {**filter_kwargs, **(create_kwargs or {})}
    obj = model(**kwargs)
    db.add(obj)
    await db.flush()
    return obj, True


async def seed_db(db: AsyncSession):
    logger.info("Starting seed v2...")

    # ── System admin ─────────────────────────────────────────────────────────
    admin, created = await _get_or_create(
        db, User,
        {"email": settings.FIRST_SUPERUSER_EMAIL.lower()},
        {
            "full_name": settings.FIRST_SUPERUSER_NAME,
            "password_hash": get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
            "role": RoleEnum.admin,
            "is_active": True, "is_email_verified": True, "is_system": True,
        }
    )
    if created:
        logger.info(f"Created admin: {admin.email}")

    # ── Internal demo users ───────────────────────────────────────────────────
    for email, name, role in [
        ("manager@dealflow.local", "Sarah Manager", RoleEnum.sales_manager),
        ("rep@dealflow.local", "Tom Rep", RoleEnum.sales_rep),
        ("finance@dealflow.local", "Finance User", RoleEnum.finance),
    ]:
        _, created = await _get_or_create(
            db, User, {"email": email},
            {"full_name": name, "password_hash": get_password_hash("password123"),
             "role": role, "is_active": True, "is_email_verified": True, "must_change_password": True}
        )
        if created:
            logger.info(f"Created internal user: {email}")

    # ── Subscription Plans ────────────────────────────────────────────────────
    plan_monthly, _ = await _get_or_create(db, SubscriptionPlan, {"name": "Monthly"}, {
        "interval": "monthly", "proration_rule": "daily",
        "cancellation_rule": "prorated_credit", "refund_window_days": 3, "min_term_cycles": 1,
    })
    plan_quarterly, _ = await _get_or_create(db, SubscriptionPlan, {"name": "Quarterly"}, {
        "interval": "quarterly", "proration_rule": "daily",
        "cancellation_rule": "no_refund", "refund_window_days": 0, "min_term_cycles": 1,
    })
    plan_annual, _ = await _get_or_create(db, SubscriptionPlan, {"name": "Annual"}, {
        "interval": "yearly", "proration_rule": "full_period",
        "cancellation_rule": "full_refund_within_days", "refund_window_days": 14, "min_term_cycles": 1,
    })
    logger.info("Plans seeded.")

    # ── Product Categories ─────────────────────────────────────────────────────
    cat_hw, _ = await _get_or_create(db, ProductCategory, {"name": "Hardware"}, {"description": "Physical devices and equipment"})
    cat_svc, _ = await _get_or_create(db, ProductCategory, {"name": "Services"}, {"description": "Professional & managed services"})
    cat_sub, _ = await _get_or_create(db, ProductCategory, {"name": "Subscriptions"}, {"description": "SaaS and recurring plans"})
    logger.info("Categories seeded.")

    # ── Products (12) ─────────────────────────────────────────────────────────
    product_defs = [
        # Hardware
        ("Enterprise Switch 24-port", "HW-SW-24", cat_hw.id, Decimal("1800.00"), Decimal("1100.00"), "unit", Decimal("18"), False, None),
        ("Rack Server 1U", "HW-SRV-1U", cat_hw.id, Decimal("3500.00"), Decimal("2200.00"), "unit", Decimal("18"), False, None),
        ("SSD 1TB Enterprise", "HW-SSD-1T", cat_hw.id, Decimal("350.00"), Decimal("200.00"), "unit", Decimal("18"), False, None),
        ("UPS 1500VA", "HW-UPS-1500", cat_hw.id, Decimal("600.00"), Decimal("380.00"), "unit", Decimal("18"), False, None),
        # Services
        ("Implementation Service", "SVC-IMPL", cat_svc.id, Decimal("5000.00"), Decimal("2500.00"), "project", Decimal("18"), False, None),
        ("Annual Support Pack", "SVC-SUP-ANN", cat_svc.id, Decimal("1200.00"), Decimal("600.00"), "contract", Decimal("18"), False, None),
        ("Managed Network – Monthly", "SVC-MN-M", cat_svc.id, Decimal("800.00"), Decimal("450.00"), "month", Decimal("18"), True, plan_monthly.id),
        ("Security Audit", "SVC-AUDIT", cat_svc.id, Decimal("2500.00"), Decimal("1500.00"), "project", Decimal("18"), False, None),
        # Subscriptions
        ("DealFlow CRM – Monthly", "SUB-CRM-M", cat_sub.id, Decimal("99.00"), Decimal("20.00"), "license", Decimal("18"), True, plan_monthly.id),
        ("DealFlow CRM – Annual", "SUB-CRM-A", cat_sub.id, Decimal("999.00"), Decimal("200.00"), "license", Decimal("18"), True, plan_annual.id),
        ("Analytics Pro – Monthly", "SUB-ANA-M", cat_sub.id, Decimal("49.00"), Decimal("10.00"), "license", Decimal("18"), True, plan_monthly.id),
        ("Analytics Pro – Annual", "SUB-ANA-A", cat_sub.id, Decimal("490.00"), Decimal("100.00"), "license", Decimal("18"), True, plan_annual.id),
    ]

    products = {}
    for name, sku, cat_id, list_p, cost_p, unit, tax, recurring, plan_id in product_defs:
        prod, created = await _get_or_create(db, Product, {"sku": sku}, {
            "name": name, "category_id": cat_id, "list_price": list_p, "cost_price": cost_p,
            "unit": unit, "tax_pct": tax, "is_recurring": recurring, "default_plan_id": plan_id,
            "is_active": True,
        })
        products[sku] = prod
        if created:
            logger.info(f"Created product: {sku}")

    # ── Discount Tiers ────────────────────────────────────────────────────────
    for tier, pct in [("bronze", Decimal("5")), ("silver", Decimal("10")), ("gold", Decimal("15"))]:
        dt = (await db.execute(select(DiscountTier).where(DiscountTier.tier == tier))).scalars().first()
        if not dt:
            db.add(DiscountTier(tier=tier, max_discount_pct=pct))
        else:
            dt.max_discount_pct = pct
    logger.info("Discount tiers seeded.")

    # ── Category Ceilings (Gold overrides) ────────────────────────────────────
    for tier, cat, pct in [
        ("gold", cat_svc.id, Decimal("10")),
        ("gold", cat_hw.id, Decimal("15")),
    ]:
        ex = (await db.execute(
            select(CategoryDiscountCeiling).where(
                CategoryDiscountCeiling.tier == tier,
                CategoryDiscountCeiling.category_id == cat
            )
        )).scalars().first()
        if not ex:
            db.add(CategoryDiscountCeiling(tier=tier, category_id=cat, max_discount_pct=pct))
    logger.info("Category ceilings seeded.")

    # ── Approval Rules ────────────────────────────────────────────────────────
    _, c1 = await _get_or_create(db, ApprovalRule, {"name": "Low Risk"}, {
        "min_risk": Decimal("0"), "max_risk": Decimal("5"),
        "steps": ["sales_manager"], "is_active": True,
    })
    _, c2 = await _get_or_create(db, ApprovalRule, {"name": "High Risk"}, {
        "min_risk": Decimal("5"), "max_risk": None,
        "steps": ["sales_manager", "finance"], "is_active": True,
    })
    logger.info("Approval rules seeded.")

    # ── App Settings ──────────────────────────────────────────────────────────
    default_settings = {
        "risk_weights": {"blended": 1, "worst_line": 0.5, "margin_penalty": 0.25},
        "target_margin_pct": 30,
        "stalled_days": 14,
        "anomaly_threshold_pts": 8,
    }
    from app.models.discount import AppSetting
    for key, value in default_settings.items():
        existing = (await db.execute(select(AppSetting).where(AppSetting.key == key))).scalars().first()
        if not existing:
            db.add(AppSetting(key=key, value=value))
    logger.info("App settings seeded.")

    # ── Customers ─────────────────────────────────────────────────────────────
    acme, acme_new = await _get_or_create(db, Customer, {"company_name": "Acme Corp"}, {
        "tier": TierEnum.gold, "currency": "USD",
    })
    beta, beta_new = await _get_or_create(db, Customer, {"company_name": "Beta Industries"}, {
        "tier": TierEnum.bronze, "currency": "USD",
    })
    if acme_new:
        logger.info("Created customer: Acme Corp (Gold)")
    if beta_new:
        logger.info("Created customer: Beta Industries (Bronze)")

    # Portal users for customers
    for email, name, cust in [
        ("acme@dealflow.local", "Acme Admin", acme),
        ("beta@dealflow.local", "Beta Admin", beta),
    ]:
        _, created = await _get_or_create(db, User, {"email": email}, {
            "full_name": name, "password_hash": get_password_hash("password123"),
            "role": RoleEnum.customer, "customer_id": cust.id,
            "is_active": True, "is_email_verified": True,
        })
        if created:
            logger.info(f"Created portal user: {email}")

    # ── Warehouses & Stock ────────────────────────────────────────────────────
    wh_main, _ = await _get_or_create(db, Warehouse, {"code": "MAIN"}, {
        "name": "Main Warehouse", "address": "123 Industrial Blvd", "shipping_cost_weight": Decimal("1.0"),
    })
    wh_east, _ = await _get_or_create(db, Warehouse, {"code": "EAST"}, {
        "name": "East Depot", "address": "456 East Park Ave", "shipping_cost_weight": Decimal("1.2"),
    })
    logger.info("Warehouses seeded.")

    # Stock levels — arrange so Server 1U splits between warehouses (needs 50 but only 20 at MAIN, 30 at EAST)
    stock_data = [
        # (warehouse, product_sku, on_hand, reserved, reorder)
        (wh_main, "HW-SW-24", Decimal("25"), Decimal("5"), Decimal("5")),
        (wh_main, "HW-SRV-1U", Decimal("20"), Decimal("10"), Decimal("5")),   # ← split scenario
        (wh_main, "HW-SSD-1T", Decimal("100"), Decimal("20"), Decimal("20")),
        (wh_main, "HW-UPS-1500", Decimal("15"), Decimal("0"), Decimal("5")),
        (wh_main, "SVC-IMPL", Decimal("999"), Decimal("0"), Decimal("0")),    # services = unlimited
        (wh_east, "HW-SW-24", Decimal("10"), Decimal("0"), Decimal("5")),
        (wh_east, "HW-SRV-1U", Decimal("30"), Decimal("5"), Decimal("5")),   # ← split scenario
        (wh_east, "HW-SSD-1T", Decimal("80"), Decimal("10"), Decimal("20")),
        (wh_east, "HW-UPS-1500", Decimal("8"), Decimal("2"), Decimal("5")),
    ]
    for wh, sku, on_hand, reserved, reorder in stock_data:
        if sku not in products:
            continue
        prod = products[sku]
        existing = (await db.execute(
            select(StockLevel).where(
                StockLevel.warehouse_id == wh.id,
                StockLevel.product_id == prod.id
            )
        )).scalars().first()
        if not existing:
            db.add(StockLevel(
                warehouse_id=wh.id, product_id=prod.id,
                qty_on_hand=on_hand, qty_reserved=reserved, reorder_point=reorder
            ))
    logger.info("Stock levels seeded.")

    # ── Upsell Rules (5 pairs) ────────────────────────────────────────────────
    upsell_pairs = [
        ("HW-SRV-1U", "HW-SSD-1T"),    # Server → SSD
        ("HW-SRV-1U", "HW-UPS-1500"),  # Server → UPS
        ("HW-SW-24", "SVC-IMPL"),       # Switch → Implementation
        ("SUB-CRM-M", "SUB-ANA-M"),     # CRM → Analytics
        ("SUB-CRM-A", "SUB-ANA-A"),     # CRM Annual → Analytics Annual
    ]
    for src_sku, sug_sku in upsell_pairs:
        if src_sku not in products or sug_sku not in products:
            continue
        src = products[src_sku]
        sug = products[sug_sku]
        existing = (await db.execute(
            select(UpsellRule).where(
                UpsellRule.product_id == src.id,
                UpsellRule.suggested_product_id == sug.id
            )
        )).scalars().first()
        if not existing:
            db.add(UpsellRule(
                product_id=src.id, suggested_product_id=sug.id,
                co_purchase_count=0, min_margin_pct=Decimal("20"), is_active=True
            ))
    logger.info("Upsell rules seeded.")

    await db.commit()
    logger.info("✅ Seed v2 complete.")


async def main():
    async with AsyncSessionLocal() as session:
        await seed_db(session)

if __name__ == "__main__":
    asyncio.run(main())
