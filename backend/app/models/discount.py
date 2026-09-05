import uuid
from datetime import datetime, timezone
from typing import Optional
from decimal import Decimal
from sqlalchemy import String, Boolean, ForeignKey, DateTime, Numeric, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from .base import Base

class DiscountTier(Base):
    """Max discount % allowed per customer tier (3 rows: bronze/silver/gold)."""
    __tablename__ = "discount_tiers"

    tier: Mapped[str] = mapped_column(String, primary_key=True)
    max_discount_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)

class CategoryDiscountCeiling(Base):
    """Per-tier, per-category override ceiling."""
    __tablename__ = "category_discount_ceilings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tier: Mapped[str] = mapped_column(String)
    category_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("product_categories.id", ondelete="CASCADE"))
    max_discount_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)

    category: Mapped["ProductCategory"] = relationship("ProductCategory", foreign_keys=[category_id])

    __table_args__ = (
        UniqueConstraint("tier", "category_id", name="uq_tier_category"),
    )

class ApprovalRule(Base):
    """Defines approval steps required for a given risk score range."""
    __tablename__ = "approval_rules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String)
    min_risk: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=0)
    max_risk: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 2), nullable=True)  # null = ∞
    steps: Mapped[list] = mapped_column(JSONB, default=list)  # e.g. ["sales_manager"] or ["sales_manager","finance"]
    absolute_discount_amount_cap: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class AppSetting(Base):
    """Key-value table for global app configuration."""
    __tablename__ = "app_settings"

    key: Mapped[str] = mapped_column(String, primary_key=True)
    value: Mapped[dict] = mapped_column(JSONB, default=dict)
