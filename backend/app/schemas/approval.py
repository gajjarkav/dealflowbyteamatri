import uuid
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field

from app.models.enums import ApprovalStatus, ApprovalTrigger
from app.schemas.quotation import QuotationResponse

class ApprovalStepResponse(BaseModel):
    id: uuid.UUID
    request_id: uuid.UUID
    seq: int
    required_role: str
    status: ApprovalStatus
    acted_by: Optional[uuid.UUID] = None
    acted_at: Optional[datetime] = None
    comment: Optional[str] = None

    class Config:
        from_attributes = True

class ApprovalRequestResponse(BaseModel):
    id: uuid.UUID
    quotation_id: uuid.UUID
    trigger: ApprovalTrigger
    risk_score: Optional[Decimal] = None
    risk_breakdown: Optional[dict] = None
    rule_id: Optional[uuid.UUID] = None
    status: ApprovalStatus
    current_step_seq: int
    created_by: uuid.UUID
    created_at: datetime
    resolved_at: Optional[datetime] = None
    steps: List[ApprovalStepResponse] = []
    
    # We will sometimes embed the quotation
    quotation: Optional[QuotationResponse] = None

    class Config:
        from_attributes = True

class ApprovalActionRequest(BaseModel):
    comment: Optional[str] = Field(None, max_length=1000)
