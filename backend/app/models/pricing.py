import uuid
from datetime import datetime, timezone
from typing import Optional
from decimal import Decimal
from sqlalchemy import String, Boolean, ForeignKey, DateTime, Numeric, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base
from .enums import TierEnum

class PriceList(Base):
    __tablename__ = "price_lists"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, unique=True, index=True)
    tier: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # nullable = generic
    currency: Mapped[str] = mapped_column(String, default="USD")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    items: Mapped[list["PriceListItem"]] = relationship("PriceListItem", back_populates="price_list", cascade="all, delete-orphan")

class PriceListItem(Base):
    __tablename__ = "price_list_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    price_list_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("price_lists.id", ondelete="CASCADE"))
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"))
    variant_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("product_variants.id", ondelete="CASCADE"), nullable=True)
    fixed_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    discount_pct: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    min_qty: Mapped[int] = mapped_column(Integer, default=1)

    price_list: Mapped["PriceList"] = relationship("PriceList", back_populates="items")
    product: Mapped["Product"] = relationship("Product", foreign_keys=[product_id])
    variant: Mapped[Optional["ProductVariant"]] = relationship("ProductVariant", foreign_keys=[variant_id])
