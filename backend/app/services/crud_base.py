"""
Generic CRUDBase service to eliminate boilerplate across all resource modules.
Usage:
    from app.services.crud_base import CRUDBase
    crud_product = CRUDBase(Product)
    items, total = await crud_product.get_multi(db, page=1, size=20, filters=[Product.is_active == True])
"""
from typing import Generic, TypeVar, Type, List, Tuple, Optional, Any, Sequence
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase
import math

ModelType = TypeVar("ModelType")

class CRUDBase(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def get(self, db: AsyncSession, id: Any) -> Optional[ModelType]:
        result = await db.execute(select(self.model).where(self.model.id == id))
        return result.scalars().first()

    async def get_multi(
        self,
        db: AsyncSession,
        page: int = 1,
        size: int = 20,
        filters: Optional[List] = None,
        order_by: Optional[Any] = None,
    ) -> Tuple[List[ModelType], int]:
        stmt = select(self.model)
        count_stmt = select(func.count()).select_from(self.model)

        if filters:
            stmt = stmt.where(and_(*filters))
            count_stmt = count_stmt.where(and_(*filters))

        if order_by is not None:
            stmt = stmt.order_by(order_by)

        total_result = await db.execute(count_stmt)
        total = total_result.scalar_one()

        stmt = stmt.offset((page - 1) * size).limit(size)
        result = await db.execute(stmt)
        return list(result.scalars().all()), total

    async def create(self, db: AsyncSession, obj_in: dict) -> ModelType:
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(self, db: AsyncSession, db_obj: ModelType, updates: dict) -> ModelType:
        for field, value in updates.items():
            setattr(db_obj, field, value)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def soft_delete(self, db: AsyncSession, db_obj: ModelType) -> ModelType:
        db_obj.is_active = False  # type: ignore
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


def paginate(items: List, total: int, page: int, size: int) -> dict:
    """Build the dict for Paginated[T]."""
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": math.ceil(total / size) if size else 1,
    }
