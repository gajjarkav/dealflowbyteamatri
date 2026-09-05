import uuid
from typing import Optional
from fastapi import APIRouter, Depends, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api.dependencies import get_db, get_current_internal_user, require_roles
from app.models.user import User, Customer
from app.models.enums import RoleEnum, TierEnum
from app.schemas.user import CustomerResponse, UserResponse
from app.schemas.common import Paginated
from app.services.crud_base import CRUDBase, paginate
from app.services.auth.security import get_password_hash, generate_random_token
from app.services.smtp.email_service import send_email
from app.services.audit_service import log_audit
from app.core.exceptions import BadRequestError, NotFoundError, ForbiddenError
from pydantic import BaseModel, EmailStr
from typing import List

router = APIRouter()
crud = CRUDBase(Customer)

class CustomerWithUsers(CustomerResponse):
    users: List[UserResponse] = []

class CustomerCreate(BaseModel):
    company_name: str
    tier: TierEnum = TierEnum.bronze
    currency: str = "USD"
    billing_address: Optional[str] = None
    tax_id: Optional[str] = None
    # Optional: invite a portal user immediately
    portal_email: Optional[EmailStr] = None
    portal_full_name: Optional[str] = None

class CustomerUpdate(BaseModel):
    company_name: Optional[str] = None
    tier: Optional[TierEnum] = None
    currency: Optional[str] = None
    billing_address: Optional[str] = None
    tax_id: Optional[str] = None
    is_active: Optional[bool] = None


@router.get("/", response_model=Paginated[CustomerWithUsers])
async def list_customers(
    search: Optional[str] = None,
    tier: Optional[TierEnum] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    """All internal roles: list customers with pagination + filters."""
    stmt = select(Customer).options(selectinload(Customer.users))
    count_stmt = select
    filters = []
    if search:
        filters.append(Customer.company_name.ilike(f"%{search}%"))
    if tier:
        filters.append(Customer.tier == tier)

    from sqlalchemy import func, and_
    count_q = select(func.count()).select_from(Customer)
    if filters:
        stmt = stmt.where(and_(*filters))
        count_q = count_q.where(and_(*filters))

    total = (await db.execute(count_q)).scalar_one()
    stmt = stmt.offset((page - 1) * size).limit(size)
    items = (await db.execute(stmt)).scalars().all()

    return paginate([CustomerWithUsers.model_validate(c) for c in items], total, page, size)


@router.post("/", response_model=CustomerWithUsers)
async def create_customer(
    data: CustomerCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.sales_rep)),
):
    """Admin/Rep: Create a company. Optionally invite a portal user."""
    customer = Customer(
        company_name=data.company_name,
        tier=data.tier,
        currency=data.currency,
        billing_address=data.billing_address,
        tax_id=data.tax_id,
    )
    db.add(customer)
    await db.flush()

    portal_user = None
    if data.portal_email and data.portal_full_name:
        # Check not already taken
        existing = (await db.execute(select(User).where(User.email == data.portal_email.lower()))).scalars().first()
        if existing:
            raise BadRequestError(f"Email {data.portal_email} is already registered.")
        temp_pass = generate_random_token(12)
        portal_user = User(
            full_name=data.portal_full_name,
            email=data.portal_email.lower(),
            password_hash=get_password_hash(temp_pass),
            role=RoleEnum.customer,
            customer_id=customer.id,
            is_active=True,
            is_email_verified=True,
            must_change_password=True,
            created_by=current_user.id,
        )
        db.add(portal_user)
        html = f"""<p>Hello {portal_user.full_name},</p>
<p>An account has been created for you at DealFlow for <strong>{customer.company_name}</strong>.</p>
<p>Temporary password: <strong>{temp_pass}</strong></p>
<p>Please log in and change your password immediately.</p>"""
        background_tasks.add_task(send_email, portal_user.email, "Your DealFlow Portal Invitation", html)

    await db.commit()
    await db.refresh(customer)
    await log_audit(db, "customer", customer.id, "create", current_user.id, "Created customer", {"company": data.company_name})
    await db.commit()

    # Reload with users
    result = await db.execute(select(Customer).options(selectinload(Customer.users)).where(Customer.id == customer.id))
    return CustomerWithUsers.model_validate(result.scalars().first())


@router.get("/{customer_id}", response_model=CustomerWithUsers)
async def get_customer(
    customer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    """All internal: get one customer including its portal users."""
    result = await db.execute(
        select(Customer).options(selectinload(Customer.users)).where(Customer.id == customer_id)
    )
    customer = result.scalars().first()
    if not customer:
        raise NotFoundError("Customer not found.")
    return CustomerWithUsers.model_validate(customer)


@router.patch("/{customer_id}", response_model=CustomerWithUsers)
async def update_customer(
    customer_id: uuid.UUID,
    data: CustomerUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.admin)),
):
    """Admin: Update customer tier, currency, address, etc."""
    result = await db.execute(
        select(Customer).options(selectinload(Customer.users)).where(Customer.id == customer_id)
    )
    customer = result.scalars().first()
    if not customer:
        raise NotFoundError("Customer not found.")

    updates = data.model_dump(exclude_unset=True, mode="json")
    for k, v in updates.items():
        setattr(customer, k, v)

    await log_audit(db, "customer", customer.id, "update", current_user.id, "Admin updated customer", updates)
    await db.commit()
    await db.refresh(customer)
    return CustomerWithUsers.model_validate(customer)
