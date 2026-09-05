import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.api.dependencies import get_db, get_current_internal_user, require_roles
from app.models.user import User
from app.models.enums import RoleEnum
from app.models.upsell import UpsellRule
from app.schemas.upsell import UpsellRuleCreate, UpsellRuleUpdate, UpsellRuleResponse
from app.schemas.common import Paginated
from app.services.crud_base import paginate
from app.core.exceptions import NotFoundError

router = APIRouter()

@router.get("/upsell-rules", response_model=Paginated[UpsellRuleResponse])
async def list_upsell_rules(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    total = (await db.execute(select(func.count()).select_from(UpsellRule))).scalar_one()
    items = (await db.execute(select(UpsellRule).offset((page-1)*size).limit(size))).scalars().all()
    return paginate([UpsellRuleResponse.model_validate(r) for r in items], total, page, size)

@router.post("/upsell-rules", response_model=UpsellRuleResponse)
async def create_upsell_rule(
    data: UpsellRuleCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    rule = UpsellRule(**data.model_dump())
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return UpsellRuleResponse.model_validate(rule)

@router.get("/upsell-rules/{rule_id}", response_model=UpsellRuleResponse)
async def get_upsell_rule(
    rule_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    rule = (await db.execute(select(UpsellRule).where(UpsellRule.id == rule_id))).scalars().first()
    if not rule:
        raise NotFoundError("Upsell rule not found.")
    return UpsellRuleResponse.model_validate(rule)

@router.patch("/upsell-rules/{rule_id}", response_model=UpsellRuleResponse)
async def update_upsell_rule(
    rule_id: uuid.UUID,
    data: UpsellRuleUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    rule = (await db.execute(select(UpsellRule).where(UpsellRule.id == rule_id))).scalars().first()
    if not rule:
        raise NotFoundError("Upsell rule not found.")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(rule, k, v)
    await db.commit()
    await db.refresh(rule)
    return UpsellRuleResponse.model_validate(rule)

@router.delete("/upsell-rules/{rule_id}")
async def delete_upsell_rule(
    rule_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    rule = (await db.execute(select(UpsellRule).where(UpsellRule.id == rule_id))).scalars().first()
    if not rule:
        raise NotFoundError("Upsell rule not found.")
    rule.is_active = False
    await db.commit()
    return {"message": "Upsell rule deactivated."}
