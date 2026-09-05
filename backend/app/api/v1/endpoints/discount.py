import uuid
from typing import Optional, List
from decimal import Decimal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.api.dependencies import get_db, get_current_internal_user, require_roles
from app.models.user import User, Customer
from app.models.enums import RoleEnum
from app.models.discount import DiscountTier, CategoryDiscountCeiling, ApprovalRule, AppSetting
from app.schemas.discount import (
    DiscountTierUpsert, DiscountTierResponse,
    CategoryCeilingCreate, CategoryCeilingUpdate, CategoryCeilingResponse,
    ApprovalRuleCreate, ApprovalRuleUpdate, ApprovalRuleResponse,
    AppSettingUpdate, AppSettingResponse,
    EffectiveDiscountResponse,
)
from app.schemas.common import Paginated
from app.services.crud_base import paginate
from app.core.exceptions import NotFoundError, BadRequestError

router = APIRouter()

# ─── Discount Tiers ───────────────────────────────────────

@router.get("/discount-tiers", response_model=List[DiscountTierResponse])
async def list_discount_tiers(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    rows = (await db.execute(select(DiscountTier))).scalars().all()
    return [DiscountTierResponse.model_validate(r) for r in rows]

@router.put("/discount-tiers", response_model=List[DiscountTierResponse])
async def upsert_discount_tiers(
    data: List[DiscountTierUpsert],
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    """Upsert all 3 tier rows at once."""
    for item in data:
        existing = (await db.execute(select(DiscountTier).where(DiscountTier.tier == item.tier))).scalars().first()
        if existing:
            existing.max_discount_pct = item.max_discount_pct
        else:
            db.add(DiscountTier(tier=item.tier, max_discount_pct=item.max_discount_pct))
    await db.commit()
    rows = (await db.execute(select(DiscountTier))).scalars().all()
    return [DiscountTierResponse.model_validate(r) for r in rows]

# ─── Category Ceilings ────────────────────────────────────

@router.get("/category-ceilings", response_model=Paginated[CategoryCeilingResponse])
async def list_ceilings(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    total = (await db.execute(select(func.count()).select_from(CategoryDiscountCeiling))).scalar_one()
    items = (await db.execute(select(CategoryDiscountCeiling).offset((page-1)*size).limit(size))).scalars().all()
    return paginate([CategoryCeilingResponse.model_validate(c) for c in items], total, page, size)

@router.post("/category-ceilings", response_model=CategoryCeilingResponse)
async def create_ceiling(
    data: CategoryCeilingCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    ceiling = CategoryDiscountCeiling(**data.model_dump())
    db.add(ceiling)
    await db.commit()
    await db.refresh(ceiling)
    return CategoryCeilingResponse.model_validate(ceiling)

@router.patch("/category-ceilings/{ceiling_id}", response_model=CategoryCeilingResponse)
async def update_ceiling(
    ceiling_id: uuid.UUID,
    data: CategoryCeilingUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    ceiling = (await db.execute(select(CategoryDiscountCeiling).where(CategoryDiscountCeiling.id == ceiling_id))).scalars().first()
    if not ceiling:
        raise NotFoundError("Ceiling not found.")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(ceiling, k, v)
    await db.commit()
    await db.refresh(ceiling)
    return CategoryCeilingResponse.model_validate(ceiling)

@router.delete("/category-ceilings/{ceiling_id}")
async def delete_ceiling(
    ceiling_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    ceiling = (await db.execute(select(CategoryDiscountCeiling).where(CategoryDiscountCeiling.id == ceiling_id))).scalars().first()
    if not ceiling:
        raise NotFoundError("Ceiling not found.")
    await db.delete(ceiling)
    await db.commit()
    return {"message": "Ceiling deleted."}

# ─── Approval Rules ───────────────────────────────────────

@router.get("/approval-rules", response_model=Paginated[ApprovalRuleResponse])
async def list_approval_rules(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    total = (await db.execute(select(func.count()).select_from(ApprovalRule))).scalar_one()
    items = (await db.execute(select(ApprovalRule).offset((page-1)*size).limit(size))).scalars().all()
    return paginate([ApprovalRuleResponse.model_validate(r) for r in items], total, page, size)

@router.post("/approval-rules", response_model=ApprovalRuleResponse)
async def create_approval_rule(
    data: ApprovalRuleCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    rule = ApprovalRule(**data.model_dump())
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return ApprovalRuleResponse.model_validate(rule)

@router.patch("/approval-rules/{rule_id}", response_model=ApprovalRuleResponse)
async def update_approval_rule(
    rule_id: uuid.UUID,
    data: ApprovalRuleUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    rule = (await db.execute(select(ApprovalRule).where(ApprovalRule.id == rule_id))).scalars().first()
    if not rule:
        raise NotFoundError("Rule not found.")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(rule, k, v)
    await db.commit()
    await db.refresh(rule)
    return ApprovalRuleResponse.model_validate(rule)

@router.delete("/approval-rules/{rule_id}")
async def delete_approval_rule(
    rule_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    rule = (await db.execute(select(ApprovalRule).where(ApprovalRule.id == rule_id))).scalars().first()
    if not rule:
        raise NotFoundError("Rule not found.")
    await db.delete(rule)
    await db.commit()
    return {"message": "Rule deleted."}

# ─── App Settings ─────────────────────────────────────────

@router.get("/settings", response_model=List[AppSettingResponse])
async def list_settings(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    rows = (await db.execute(select(AppSetting))).scalars().all()
    return [AppSettingResponse.model_validate(r) for r in rows]

@router.patch("/settings/{key}", response_model=AppSettingResponse)
async def update_setting(
    key: str,
    data: AppSettingUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    setting = (await db.execute(select(AppSetting).where(AppSetting.key == key))).scalars().first()
    if not setting:
        setting = AppSetting(key=key, value=data.value)
        db.add(setting)
    else:
        setting.value = data.value
    await db.commit()
    await db.refresh(setting)
    return AppSettingResponse.model_validate(setting)

# ─── Effective Discount Policy ────────────────────────────

@router.get("/discount-policy/effective", response_model=EffectiveDiscountResponse)
async def get_effective_discount(
    customer_id: uuid.UUID,
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    """Returns min(tier_ceiling, category_ceiling) for the quotation builder."""
    customer = (await db.execute(select(Customer).where(Customer.id == customer_id))).scalars().first()
    if not customer:
        raise NotFoundError("Customer not found.")

    tier_str = customer.tier.value if customer.tier else "bronze"
    tier_row = (await db.execute(select(DiscountTier).where(DiscountTier.tier == tier_str))).scalars().first()
    tier_ceiling = tier_row.max_discount_pct if tier_row else Decimal("0")

    cat_row = (await db.execute(
        select(CategoryDiscountCeiling).where(
            CategoryDiscountCeiling.tier == tier_str,
            CategoryDiscountCeiling.category_id == category_id
        )
    )).scalars().first()
    category_ceiling = cat_row.max_discount_pct if cat_row else None

    if category_ceiling is not None and category_ceiling < tier_ceiling:
        allowed = category_ceiling
        source = "category"
    else:
        allowed = tier_ceiling
        source = "tier"

    return EffectiveDiscountResponse(
        allowed_pct=allowed,
        tier_ceiling=tier_ceiling,
        category_ceiling=category_ceiling,
        binding_source=source,
    )
