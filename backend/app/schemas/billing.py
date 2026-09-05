from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date

class InvoiceBase(BaseModel):
    invoice_number: str
    quotation_id: Optional[str] = None
    customer_id: str
    customer_name: Optional[str] = None
    amount: float
    due_date: Optional[date] = None
    payment_method: Optional[str] = None
    status: str = "Draft"

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceResponse(InvoiceBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
