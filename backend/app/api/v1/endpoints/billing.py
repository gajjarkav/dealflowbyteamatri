from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Any

from app.api.dependencies import get_db, get_current_user
from app.models.billing import Invoice
from app.schemas.billing import InvoiceResponse, InvoiceCreate
from app.schemas.common import Paginated
from app.models.user import User

router = APIRouter()

@router.get("/invoices", response_model=Paginated[InvoiceResponse])
async def list_invoices(
    page: int = 1,
    size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    skip = (page - 1) * size
    query = select(Invoice)
    
    total = await db.scalar(select(func.count(Invoice.id)))
    result = await db.execute(query.offset(skip).limit(size))
    items = result.scalars().all()
    
    pages = (total + size - 1) // size if total > 0 else 1
    return {"items": items, "total": total, "page": page, "size": size, "pages": pages}

@router.post("/invoices", response_model=InvoiceResponse)
async def create_invoice(
    data: InvoiceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    obj = Invoice(**data.model_dump())
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj

@router.patch("/invoices/{id}/pay", response_model=InvoiceResponse)
async def pay_invoice(
    id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await db.execute(select(Invoice).filter(Invoice.id == id))
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    inv.status = "Paid"
    await db.commit()
    await db.refresh(inv)
    return inv
