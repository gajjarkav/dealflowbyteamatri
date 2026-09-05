import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.api.dependencies import get_db, get_current_internal_user, require_roles
from app.models.user import User
from app.models.enums import RoleEnum
from app.models.subscription import SubscriptionPlan
from app.schemas.subscription import PlanCreate, PlanUpdate, PlanResponse
from app.schemas.common import Paginated
from app.services.crud_base import paginate
from app.core.exceptions import NotFoundError

router = APIRouter()

@router.get("/plans", response_model=Paginated[PlanResponse])
async def list_plans(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    total = (await db.execute(select(func.count()).select_from(SubscriptionPlan))).scalar_one()
    items = (await db.execute(select(SubscriptionPlan).offset((page-1)*size).limit(size))).scalars().all()
    return paginate([PlanResponse.model_validate(p) for p in items], total, page, size)

@router.post("/plans", response_model=PlanResponse)
async def create_plan(
    data: PlanCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    plan = SubscriptionPlan(**data.model_dump())
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return PlanResponse.model_validate(plan)

@router.get("/plans/{plan_id}", response_model=PlanResponse)
async def get_plan(
    plan_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    plan = (await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id))).scalars().first()
    if not plan:
        raise NotFoundError("Plan not found.")
    return PlanResponse.model_validate(plan)

@router.patch("/plans/{plan_id}", response_model=PlanResponse)
async def update_plan(
    plan_id: uuid.UUID,
    data: PlanUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    plan = (await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id))).scalars().first()
    if not plan:
        raise NotFoundError("Plan not found.")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(plan, k, v)
    await db.commit()
    await db.refresh(plan)
    return PlanResponse.model_validate(plan)

@router.delete("/plans/{plan_id}")
async def delete_plan(
    plan_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    plan = (await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id))).scalars().first()
    if not plan:
        raise NotFoundError("Plan not found.")
    plan.is_active = False
    await db.commit()
    return {"message": "Plan deactivated."}
