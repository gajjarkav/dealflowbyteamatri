import uuid
from datetime import datetime, date
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field

from app.models.enums import QuotationStatus, EventType

class QuotationLineBase(BaseModel):
    product_id: uuid.UUID
    variant_id: Optional[uuid.UUID] = None
    qty: Decimal = Field(gt=0, default=Decimal("1.000"))
    discount_pct: Decimal = Field(ge=0, le=100, default=Decimal("0.00"))

class QuotationLineCreate(QuotationLineBase):
    pass

class QuotationLineUpdate(BaseModel):
    qty: Optional[Decimal] = Field(None, gt=0)
    discount_pct: Optional[Decimal] = Field(None, ge=0, le=100)

class QuotationLineResponse(QuotationLineBase):
    id: uuid.UUID
    quotation_id: uuid.UUID
    description: str
    category_id: uuid.UUID
    unit_price: Decimal
    cost_price: Decimal
    tax_pct: Decimal
    is_recurring: bool
    plan_id: Optional[uuid.UUID] = None
    line_subtotal: Decimal
    line_discount: Decimal
    line_tax: Decimal
    line_total: Decimal
    allowed_discount_pct: Optional[Decimal] = None
    excess_pts: Optional[Decimal] = None
    added_via: str
    sort_order: int

    class Config:
        from_attributes = True

class QuotationBase(BaseModel):
    customer_id: uuid.UUID
    notes: Optional[str] = None
    promised_date: Optional[date] = None

class QuotationCreate(QuotationBase):
    pass

class QuotationUpdate(BaseModel):
    notes: Optional[str] = None
    promised_date: Optional[date] = None
    order_discount_pct: Optional[Decimal] = Field(None, ge=0, le=100)

class QuotationEventResponse(BaseModel):
    id: uuid.UUID
    type: EventType
    actor_id: Optional[uuid.UUID] = None
    message: Optional[str] = None
    payload: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True

class QuotationResponse(QuotationBase):
    id: uuid.UUID
    number: str
    rep_id: uuid.UUID
    status: QuotationStatus
    currency: str
    order_discount_pct: Decimal
    subtotal: Decimal
    discount_total: Decimal
    tax_total: Decimal
    total: Decimal
    cost_total: Decimal
    margin_pct: Decimal
    risk_score: Optional[Decimal] = None
    risk_breakdown: Optional[dict] = None
    current_approval_request_id: Optional[uuid.UUID] = None
    portal_token: Optional[str] = None
    dismissed_suggestions: List[uuid.UUID] = []
    sent_at: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None
    last_activity_at: datetime
    created_at: datetime
    updated_at: datetime
    
    # We will expand this in the endpoint if needed, but for the base response, lines is good.
    lines: List[QuotationLineResponse] = []

    class Config:
        from_attributes = True

class RiskPreviewResponse(BaseModel):
    risk_score: Decimal
    blended: Decimal
    worst_line: Decimal
    margin_penalty: Decimal
    margin_pct: Decimal
    target_margin: Decimal
    weights: dict
    lines: List[dict]
    violations_count: int
    would_require: List[str] = []

class SuggestionResponse(BaseModel):
    product_id: uuid.UUID
    name: str
    category: str
    unit_price: Decimal
    margin_pct: Decimal
    margin_delta: Decimal
    is_promoted: bool
    reason: str
    rule_id: uuid.UUID
