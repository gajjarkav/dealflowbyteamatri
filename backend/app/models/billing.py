from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.models.base import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    invoice_number = Column(String, unique=True, index=True)
    quotation_id = Column(String, ForeignKey("quotations.id"), nullable=True)
    customer_id = Column(String, ForeignKey("customers.id"))
    customer_name = Column(String)
    
    amount = Column(Float, default=0.0)
    due_date = Column(Date, nullable=True)
    payment_method = Column(String, nullable=True)
    status = Column(String, default="Draft") # Draft, Sent, Paid, Overdue
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
