import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from app.api.dependencies import get_db, get_current_internal_user, require_roles
from app.models.user import User
from app.models.enums import RoleEnum, QuotationStatus, ApprovalTrigger
from app.models.quotation import Quotation, QuotationLine, QuotationEvent, ApprovalRequest

from app.schemas.common import Paginated
from app.schemas.quotation import (
    QuotationResponse, QuotationCreate, QuotationUpdate,
    QuotationLineCreate, QuotationLineUpdate,
    RiskPreviewResponse, SuggestionResponse, QuotationEventResponse
)
from app.services.crud_base import paginate
from app.services.quotation_service import (
    create_quotation, add_line, update_line, remove_line, update_meta, generate_risk_preview
)
from app.services.upsell import suggest, add as add_upsell, dismiss as dismiss_upsell
from app.services.approval_router import submit
from app.core.exceptions import NotFoundError, ForbiddenError, BadRequestError

router = APIRouter()

def _load_options():
    return [
        selectinload(Quotation.lines),
        selectinload(Quotation.approval_requests),
        selectinload(Quotation.events)
    ]

@router.get("", response_model=Paginated[QuotationResponse])
async def list_quotations(
    status: Optional[QuotationStatus] = None,
    customer_id: Optional[uuid.UUID] = None,
    rep_id: Optional[uuid.UUID] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_internal_user),
):
    stmt = select(Quotation).options(*_load_options())
    
    # Ownership guard: rep can only see their own
    if current_user.role == RoleEnum.sales_rep:
        stmt = stmt.where(Quotation.rep_id == current_user.id)
    else:
        if rep_id:
            stmt = stmt.where(Quotation.rep_id == rep_id)
            
    if status:
        stmt = stmt.where(Quotation.status == status)
    if customer_id:
        stmt = stmt.where(Quotation.customer_id == customer_id)
    if search:
        stmt = stmt.where(Quotation.number.ilike(f"%{search}%"))
        
    stmt = stmt.order_by(Quotation.updated_at.desc())
        
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    items = (await db.execute(stmt.offset((page-1)*size).limit(size))).scalars().all()
    
    return paginate([QuotationResponse.from_orm(q) for q in items], total, page, size)

@router.post("", response_model=QuotationResponse)
async def create(
    data: QuotationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_internal_user),
):
    q = await create_quotation(db, data.customer_id, current_user, data.notes, data.promised_date)
    return QuotationResponse.from_orm(q)

@router.get("/{id}", response_model=QuotationResponse)
async def get_quotation(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_internal_user),
):
    q = (await db.execute(select(Quotation).options(*_load_options()).where(Quotation.id == id))).scalars().first()
    if not q:
        raise NotFoundError("Quotation not found")
        
    if current_user.role == RoleEnum.sales_rep and q.rep_id != current_user.id:
        raise ForbiddenError("You do not have access to this quotation.")
        
    return QuotationResponse.from_orm(q)

@router.patch("/{id}", response_model=QuotationResponse)
async def update_quotation(
    id: uuid.UUID,
    data: QuotationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_internal_user),
):
    q = (await db.execute(select(Quotation).options(*_load_options()).where(Quotation.id == id))).scalars().first()
    if not q:
        raise NotFoundError()
    q = await update_meta(db, q, data.notes, data.promised_date, data.order_discount_pct, current_user)
    return QuotationResponse.from_orm(q)

@router.post("/{id}/lines", response_model=QuotationResponse)
async def add_quotation_line(
    id: uuid.UUID,
    data: QuotationLineCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_internal_user),
):
    q = (await db.execute(select(Quotation).options(*_load_options()).where(Quotation.id == id))).scalars().first()
    if not q:
        raise NotFoundError()
    q = await add_line(db, q, data.product_id, data.variant_id, data.qty, data.discount_pct, current_user)
    return QuotationResponse.from_orm(q)

@router.patch("/{id}/lines/{line_id}", response_model=QuotationResponse)
async def modify_quotation_line(
    id: uuid.UUID,
    line_id: uuid.UUID,
    data: QuotationLineUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_internal_user),
):
    q = (await db.execute(select(Quotation).options(*_load_options()).where(Quotation.id == id))).scalars().first()
    if not q:
        raise NotFoundError()
    q = await update_line(db, q, line_id, data.qty, data.discount_pct, current_user)
    return QuotationResponse.from_orm(q)

@router.delete("/{id}/lines/{line_id}", response_model=QuotationResponse)
async def remove_quotation_line(
    id: uuid.UUID,
    line_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_internal_user),
):
    q = (await db.execute(select(Quotation).options(*_load_options()).where(Quotation.id == id))).scalars().first()
    if not q:
        raise NotFoundError()
    q = await remove_line(db, q, line_id, current_user)
    return QuotationResponse.from_orm(q)

@router.get("/{id}/risk-preview", response_model=RiskPreviewResponse)
async def preview_risk(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_internal_user),
):
    q = (await db.execute(select(Quotation).options(*_load_options()).where(Quotation.id == id))).scalars().first()
    if not q:
        raise NotFoundError()
    if current_user.role == RoleEnum.sales_rep and q.rep_id != current_user.id:
        raise ForbiddenError()
        
    risk_data = await generate_risk_preview(db, q)
    return RiskPreviewResponse(**risk_data)

@router.post("/{id}/confirm", response_model=QuotationResponse)
async def confirm_quotation(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_internal_user),
):
    q = (await db.execute(select(Quotation).options(*_load_options()).where(Quotation.id == id))).scalars().first()
    if not q:
        raise NotFoundError()
    if current_user.role == RoleEnum.sales_rep and q.rep_id != current_user.id:
        raise ForbiddenError()
    if q.status not in [QuotationStatus.draft, QuotationStatus.revision_requested, QuotationStatus.under_negotiation]:
        raise BadRequestError("Cannot confirm quotation in this state.")
        
    # Re-generate risk just in case
    await generate_risk_preview(db, q)
    
    await submit(db, q, ApprovalTrigger.rep_confirm, current_user)
    
    # Refetch to get updated status and relations
    q = (await db.execute(select(Quotation).options(*_load_options()).where(Quotation.id == id))).scalars().first()
    return QuotationResponse.from_orm(q)

@router.post("/{id}/cancel", response_model=QuotationResponse)
async def cancel_quotation(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_internal_user),
):
    q = (await db.execute(select(Quotation).options(*_load_options()).where(Quotation.id == id))).scalars().first()
    if not q:
        raise NotFoundError()
    if current_user.role == RoleEnum.sales_rep and q.rep_id != current_user.id:
        raise ForbiddenError()
        
    q.status = QuotationStatus.cancelled
    await db.commit()
    return QuotationResponse.from_orm(q)

@router.get("/{id}/suggestions", response_model=List[SuggestionResponse])
async def get_suggestions(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_internal_user),
):
    q = (await db.execute(select(Quotation).options(*_load_options()).where(Quotation.id == id))).scalars().first()
    if not q:
        raise NotFoundError()
    if current_user.role == RoleEnum.sales_rep and q.rep_id != current_user.id:
        raise ForbiddenError()
        
    suggestions = await suggest(db, q)
    return [SuggestionResponse(**s) for s in suggestions]

@router.post("/{id}/suggestions/{product_id}/add", response_model=QuotationResponse)
async def apply_suggestion(
    id: uuid.UUID,
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_internal_user),
):
    q = (await db.execute(select(Quotation).options(*_load_options()).where(Quotation.id == id))).scalars().first()
    if not q:
        raise NotFoundError()
    q = await add_upsell(db, q, product_id, current_user)
    return QuotationResponse.from_orm(q)

@router.post("/{id}/suggestions/{product_id}/dismiss", response_model=QuotationResponse)
async def ignore_suggestion(
    id: uuid.UUID,
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_internal_user),
):
    q = (await db.execute(select(Quotation).options(*_load_options()).where(Quotation.id == id))).scalars().first()
    if not q:
        raise NotFoundError()
    q = await dismiss_upsell(db, q, product_id, current_user)
    return QuotationResponse.from_orm(q)

@router.get("/{id}/timeline", response_model=List[QuotationEventResponse])
async def get_timeline(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_internal_user),
):
    q = (await db.execute(select(Quotation).where(Quotation.id == id))).scalars().first()
    if not q:
        raise NotFoundError()
    if current_user.role == RoleEnum.sales_rep and q.rep_id != current_user.id:
        raise ForbiddenError()
        
    events = (await db.execute(
        select(QuotationEvent)
        .where(QuotationEvent.quotation_id == id)
        .order_by(QuotationEvent.created_at.desc())
    )).scalars().all()
    
    return [QuotationEventResponse.from_orm(e) for e in events]
