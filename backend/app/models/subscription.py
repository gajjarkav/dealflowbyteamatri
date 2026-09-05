import uuid
from datetime import datetime, timezone
from typing import Optional
from decimal import Decimal
from sqlalchemy import String, Boolean, ForeignKey, DateTime, Numeric, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base
from .enums import TierEnum, IntervalEnum, ProrationRuleEnum, CancellationRuleEnum

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, unique=True)
    interval: Mapped[str] = mapped_column(String, default=IntervalEnum.monthly)
    proration_rule: Mapped[str] = mapped_column(String, default=ProrationRuleEnum.daily)
    cancellation_rule: Mapped[str] = mapped_column(String, default=CancellationRuleEnum.no_refund)
    refund_window_days: Mapped[int] = mapped_column(Integer, default=0)
    min_term_cycles: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
