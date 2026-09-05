import uuid
from datetime import datetime, timezone
from typing import Optional
from decimal import Decimal
from sqlalchemy import String, Boolean, ForeignKey, DateTime, Numeric, Integer, UniqueConstraint, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base
from .enums import MovementReasonEnum

class Warehouse(Base):
    __tablename__ = "warehouses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String)
    code: Mapped[str] = mapped_column(String, unique=True, index=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    shipping_cost_weight: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=1.0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    stock_levels: Mapped[list["StockLevel"]] = relationship("StockLevel", back_populates="warehouse", cascade="all, delete-orphan")

class StockLevel(Base):
    __tablename__ = "stock_levels"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    warehouse_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("warehouses.id", ondelete="CASCADE"))
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"))
    qty_on_hand: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=0)
    qty_reserved: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=0)
    reorder_point: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=0)

    warehouse: Mapped["Warehouse"] = relationship("Warehouse", back_populates="stock_levels")
    product: Mapped["Product"] = relationship("Product", foreign_keys=[product_id])

    __table_args__ = (
        UniqueConstraint("warehouse_id", "product_id", name="uq_warehouse_product"),
    )

class StockMovement(Base):
    __tablename__ = "stock_movements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    warehouse_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("warehouses.id"))
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id"))
    delta: Mapped[Decimal] = mapped_column(Numeric(12, 3))  # positive = in, negative = out
    reason: Mapped[str] = mapped_column(String, default=MovementReasonEnum.adjustment)
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    warehouse: Mapped["Warehouse"] = relationship("Warehouse", foreign_keys=[warehouse_id])
    product: Mapped["Product"] = relationship("Product", foreign_keys=[product_id])
    actor: Mapped[Optional["User"]] = relationship("User", foreign_keys=[created_by])
