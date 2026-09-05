"""
Quotation system models:
  Quotation → QuotationLine (cascade)
  ApprovalRequest → ApprovalStep (cascade)
  QuotationEvent (chatter / audit timeline)
"""
import uuid
from datetime import datetime, timezone, date
from typing import Optional, List
from decimal import Decimal
from sqlalchemy import (
    String, Boolean, ForeignKey, DateTime, Date, Numeric,
    Integer, Text, Index, UniqueConstraint, Sequence
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from .base import Base
from .enums import QuotationStatus, ApprovalStatus, ApprovalTrigger, EventType


# ── Sequence for human-readable Q-YYYY-NNNN number ───────────────────────────
quotation_seq = Sequence("quotation_seq", start=1, increment=1)


class Quotation(Base):
    __tablename__ = "quotations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Human-readable number, generated from DB sequence in service layer
    number: Mapped[str] = mapped_column(String(20), unique=True, index=True)

    customer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("customers.id"))
    rep_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    status: Mapped[str] = mapped_column(
        String(30), default=QuotationStatus.draft, index=True
    )
    currency: Mapped[str] = mapped_column(String(10), default="USD")

    order_discount_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    promised_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # Stored totals — recomputed server-side on every line mutation
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    discount_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    tax_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    cost_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    margin_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)

    # Risk engine output
    risk_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 2), nullable=True)
    risk_breakdown: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    # Active approval request (FK set after flush — deferred)
    current_approval_request_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("approval_requests.id", use_alter=True, name="fk_quotation_current_approval"),
        nullable=True,
    )

    # Portal counter-offer (Phase 5)
    portal_token: Mapped[Optional[str]] = mapped_column(String, nullable=True, index=True)
    dismissed_suggestions: Mapped[Optional[list]] = mapped_column(JSONB, default=list)

    # Timestamps
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_activity_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    customer: Mapped["Customer"] = relationship("Customer", foreign_keys=[customer_id])
    rep: Mapped["User"] = relationship("User", foreign_keys=[rep_id])
    lines: Mapped[List["QuotationLine"]] = relationship(
        "QuotationLine", back_populates="quotation",
        cascade="all, delete-orphan", order_by="QuotationLine.sort_order"
    )
    approval_requests: Mapped[List["ApprovalRequest"]] = relationship(
        "ApprovalRequest",
        back_populates="quotation",
        foreign_keys="ApprovalRequest.quotation_id",
        cascade="all, delete-orphan",
    )
    current_approval: Mapped[Optional["ApprovalRequest"]] = relationship(
        "ApprovalRequest",
        foreign_keys=[current_approval_request_id],
        post_update=True,
    )
    events: Mapped[List["QuotationEvent"]] = relationship(
        "QuotationEvent", back_populates="quotation", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_quotation_rep_status", "rep_id", "status"),
        Index("ix_quotation_customer", "customer_id"),
        Index("ix_quotation_status_activity", "status", "last_activity_at"),
    )


class QuotationLine(Base):
    __tablename__ = "quotation_lines"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quotation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quotations.id", ondelete="CASCADE")
    )

    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id"))
    variant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("product_variants.id"), nullable=True
    )

    # Snapshots — written once at add-time so line is stable after product edits
    description: Mapped[str] = mapped_column(String)        # product name + variant
    category_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("product_categories.id"))
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))   # pricing engine snapshot
    cost_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))   # snapshot
    tax_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    plan_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subscription_plans.id"), nullable=True
    )

    qty: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=1)
    discount_pct: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)

    # Computed line totals (stored for fast aggregation)
    line_subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)  # qty × unit_price
    line_discount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)  # subtotal × discount
    line_tax: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)       # (sub-disc) × tax
    line_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)     # sub - disc + tax

    # Risk engine writes these per-line
    allowed_discount_pct: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    excess_pts: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 2), nullable=True)

    added_via: Mapped[str] = mapped_column(String(20), default="manual")  # "manual" | "upsell"
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    # ── Relationships ─────────────────────────────────────────────────────────
    quotation: Mapped["Quotation"] = relationship("Quotation", back_populates="lines")
    product: Mapped["Product"] = relationship("Product", foreign_keys=[product_id])
    variant: Mapped[Optional["ProductVariant"]] = relationship("ProductVariant", foreign_keys=[variant_id])
    category: Mapped["ProductCategory"] = relationship("ProductCategory", foreign_keys=[category_id])
    plan: Mapped[Optional["SubscriptionPlan"]] = relationship("SubscriptionPlan", foreign_keys=[plan_id])


class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quotation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quotations.id", ondelete="CASCADE")
    )

    trigger: Mapped[str] = mapped_column(String(30), default=ApprovalTrigger.rep_confirm)
    risk_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(6, 2), nullable=True)
    risk_breakdown: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    rule_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("approval_rules.id"), nullable=True
    )
    status: Mapped[str] = mapped_column(String(20), default=ApprovalStatus.pending)
    current_step_seq: Mapped[int] = mapped_column(Integer, default=1)

    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # ── Relationships ─────────────────────────────────────────────────────────
    quotation: Mapped["Quotation"] = relationship(
        "Quotation", back_populates="approval_requests", foreign_keys=[quotation_id]
    )
    rule: Mapped[Optional["ApprovalRule"]] = relationship("ApprovalRule", foreign_keys=[rule_id])
    creator: Mapped["User"] = relationship("User", foreign_keys=[created_by])
    steps: Mapped[List["ApprovalStep"]] = relationship(
        "ApprovalStep", back_populates="request",
        cascade="all, delete-orphan", order_by="ApprovalStep.seq"
    )


class ApprovalStep(Base):
    __tablename__ = "approval_steps"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("approval_requests.id", ondelete="CASCADE")
    )
    seq: Mapped[int] = mapped_column(Integer)
    required_role: Mapped[str] = mapped_column(String(30))  # sales_manager | finance

    status: Mapped[str] = mapped_column(String(20), default=ApprovalStatus.pending)
    acted_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    acted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # ── Relationships ─────────────────────────────────────────────────────────
    request: Mapped["ApprovalRequest"] = relationship("ApprovalRequest", back_populates="steps")
    actor: Mapped[Optional["User"]] = relationship("User", foreign_keys=[acted_by])

    __table_args__ = (
        UniqueConstraint("request_id", "seq", name="uq_approval_step_seq"),
    )


class QuotationEvent(Base):
    """Chatter / audit timeline — one row per event on a quotation."""
    __tablename__ = "quotation_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quotation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quotations.id", ondelete="CASCADE")
    )
    type: Mapped[str] = mapped_column(String(30))           # EventType value
    actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    payload: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    quotation: Mapped["Quotation"] = relationship("Quotation", back_populates="events")
    actor: Mapped[Optional["User"]] = relationship("User", foreign_keys=[actor_id])

    __table_args__ = (
        Index("ix_quotation_events_qid_ts", "quotation_id", "created_at"),
    )
