import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from app.api.dependencies import get_db, require_roles
from app.models.user import User
from app.models.enums import RoleEnum, ApprovalStatus
from app.models.quotation import ApprovalRequest, ApprovalStep, Quotation

from app.schemas.common import Paginated
from app.schemas.approval import ApprovalRequestResponse, ApprovalStepResponse, ApprovalActionRequest
from app.services.crud_base import paginate
from app.services.approval_router import act
from app.core.exceptions import NotFoundError, ForbiddenError

router = APIRouter()

@router.get("", response_model=Paginated[ApprovalRequestResponse])
async def list_approvals(
    status: Optional[ApprovalStatus] = ApprovalStatus.pending,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.sales_manager, RoleEnum.finance)),
):
    stmt = select(ApprovalRequest).options(
        selectinload(ApprovalRequest.steps),
        selectinload(ApprovalRequest.quotation).selectinload(Quotation.lines)
    )
    
    if status:
        stmt = stmt.where(ApprovalRequest.status == status)
        
    # If not admin, only show requests where there is an active step matching their role
    if current_user.role != RoleEnum.admin:
        stmt = stmt.join(ApprovalStep, ApprovalStep.request_id == ApprovalRequest.id).where(
            ApprovalStep.seq == ApprovalRequest.current_step_seq,
            ApprovalStep.required_role == current_user.role,
            ApprovalStep.status == ApprovalStatus.pending
        )
        
    stmt = stmt.order_by(ApprovalRequest.created_at.desc())
    
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    items = (await db.execute(stmt.offset((page-1)*size).limit(size))).scalars().all()
    
    return paginate([ApprovalRequestResponse.from_orm(req) for req in items], total, page, size)

@router.get("/{request_id}", response_model=ApprovalRequestResponse)
async def get_approval(
    request_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.sales_manager, RoleEnum.finance)),
):
    req = (await db.execute(
        select(ApprovalRequest).options(
            selectinload(ApprovalRequest.steps),
            selectinload(ApprovalRequest.quotation).selectinload(Quotation.lines)
        ).where(ApprovalRequest.id == request_id)
    )).scalars().first()
    
    if not req:
        raise NotFoundError()
        
    return ApprovalRequestResponse.from_orm(req)

@router.post("/steps/{step_id}/approve", response_model=ApprovalRequestResponse)
async def approve_step(
    step_id: uuid.UUID,
    data: ApprovalActionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.sales_manager, RoleEnum.finance)),
):
    req = await act(db, step_id, "approve", current_user, data.comment)
    
    # Reload for full response
    req = (await db.execute(
        select(ApprovalRequest).options(
            selectinload(ApprovalRequest.steps),
            selectinload(ApprovalRequest.quotation).selectinload(Quotation.lines)
        ).where(ApprovalRequest.id == req.id)
    )).scalars().first()
    
    return ApprovalRequestResponse.from_orm(req)

@router.post("/steps/{step_id}/reject", response_model=ApprovalRequestResponse)
async def reject_step(
    step_id: uuid.UUID,
    data: ApprovalActionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.sales_manager, RoleEnum.finance)),
):
    req = await act(db, step_id, "reject", current_user, data.comment)
    
    req = (await db.execute(
        select(ApprovalRequest).options(
            selectinload(ApprovalRequest.steps),
            selectinload(ApprovalRequest.quotation).selectinload(Quotation.lines)
        ).where(ApprovalRequest.id == req.id)
    )).scalars().first()
    
    return ApprovalRequestResponse.from_orm(req)

@router.post("/steps/{step_id}/return", response_model=ApprovalRequestResponse)
async def return_step(
    step_id: uuid.UUID,
    data: ApprovalActionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.sales_manager, RoleEnum.finance)),
):
    req = await act(db, step_id, "return", current_user, data.comment)
    
    req = (await db.execute(
        select(ApprovalRequest).options(
            selectinload(ApprovalRequest.steps),
            selectinload(ApprovalRequest.quotation).selectinload(Quotation.lines)
        ).where(ApprovalRequest.id == req.id)
    )).scalars().first()
    
    return ApprovalRequestResponse.from_orm(req)
