import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, func
from sqlalchemy.orm import selectinload

from app.api.dependencies import get_db, get_current_internal_user, require_roles
from app.models.user import User
from app.models.enums import RoleEnum
from app.models.catalog import ProductCategory, Product, ProductVariant
from app.schemas.catalog import (
    CategoryCreate, CategoryUpdate, CategoryResponse,
    ProductCreate, ProductUpdate, ProductResponse,
    VariantCreate, VariantUpdate, VariantResponse,
)
from app.schemas.common import Paginated
from app.services.crud_base import paginate
from app.core.exceptions import NotFoundError, BadRequestError

router = APIRouter()

# ─── Categories ──────────────────────────────────────────

@router.get("/categories", response_model=Paginated[CategoryResponse])
async def list_categories(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    total = (await db.execute(select(func.count()).select_from(ProductCategory))).scalar_one()
    items = (await db.execute(select(ProductCategory).offset((page-1)*size).limit(size))).scalars().all()
    return paginate([CategoryResponse.model_validate(c) for c in items], total, page, size)

@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    cat = ProductCategory(**data.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return CategoryResponse.model_validate(cat)

@router.patch("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: uuid.UUID,
    data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    cat = (await db.execute(select(ProductCategory).where(ProductCategory.id == category_id))).scalars().first()
    if not cat:
        raise NotFoundError("Category not found.")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(cat, k, v)
    await db.commit()
    await db.refresh(cat)
    return CategoryResponse.model_validate(cat)

# ─── Products ─────────────────────────────────────────────

@router.get("/products", response_model=Paginated[ProductResponse])
async def list_products(
    category_id: Optional[uuid.UUID] = None,
    search: Optional[str] = None,
    is_recurring: Optional[bool] = None,
    is_active: Optional[bool] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    filters = []
    if category_id:
        filters.append(Product.category_id == category_id)
    if search:
        filters.append(Product.name.ilike(f"%{search}%"))
    if is_recurring is not None:
        filters.append(Product.is_recurring == is_recurring)
    if is_active is not None:
        filters.append(Product.is_active == is_active)

    stmt = select(Product).options(selectinload(Product.variants))
    count_stmt = select(func.count()).select_from(Product)
    if filters:
        stmt = stmt.where(and_(*filters))
        count_stmt = count_stmt.where(and_(*filters))

    total = (await db.execute(count_stmt)).scalar_one()
    items = (await db.execute(stmt.offset((page-1)*size).limit(size))).scalars().all()
    return paginate([ProductResponse.from_orm_with_margin(p) for p in items], total, page, size)

@router.post("/products", response_model=ProductResponse)
async def create_product(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    # Validate category
    cat = (await db.execute(select(ProductCategory).where(ProductCategory.id == data.category_id))).scalars().first()
    if not cat:
        raise NotFoundError("Category not found.")
    product = Product(**data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    # Reload with variants
    result = await db.execute(select(Product).options(selectinload(Product.variants)).where(Product.id == product.id))
    return ProductResponse.from_orm_with_margin(result.scalars().first())

@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_internal_user),
):
    result = await db.execute(select(Product).options(selectinload(Product.variants)).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise NotFoundError("Product not found.")
    return ProductResponse.from_orm_with_margin(product)

@router.patch("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: uuid.UUID,
    data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    result = await db.execute(select(Product).options(selectinload(Product.variants)).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise NotFoundError("Product not found.")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(product, k, v)
    await db.commit()
    await db.refresh(product)
    return ProductResponse.from_orm_with_margin(product)

@router.delete("/products/{product_id}", response_model=ProductResponse)
async def soft_delete_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    result = await db.execute(select(Product).options(selectinload(Product.variants)).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise NotFoundError("Product not found.")
    product.is_active = False
    await db.commit()
    await db.refresh(product)
    return ProductResponse.from_orm_with_margin(product)

# ─── Variants ─────────────────────────────────────────────

@router.post("/products/{product_id}/variants", response_model=VariantResponse)
async def add_variant(
    product_id: uuid.UUID,
    data: VariantCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    product = (await db.execute(select(Product).where(Product.id == product_id))).scalars().first()
    if not product:
        raise NotFoundError("Product not found.")
    variant = ProductVariant(product_id=product_id, **data.model_dump())
    db.add(variant)
    await db.commit()
    await db.refresh(variant)
    return VariantResponse.model_validate(variant)

@router.patch("/variants/{variant_id}", response_model=VariantResponse)
async def update_variant(
    variant_id: uuid.UUID,
    data: VariantUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    variant = (await db.execute(select(ProductVariant).where(ProductVariant.id == variant_id))).scalars().first()
    if not variant:
        raise NotFoundError("Variant not found.")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(variant, k, v)
    await db.commit()
    await db.refresh(variant)
    return VariantResponse.model_validate(variant)

@router.delete("/variants/{variant_id}")
async def delete_variant(
    variant_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles(RoleEnum.admin)),
):
    variant = (await db.execute(select(ProductVariant).where(ProductVariant.id == variant_id))).scalars().first()
    if not variant:
        raise NotFoundError("Variant not found.")
    await db.delete(variant)
    await db.commit()
    return {"message": "Variant deleted."}
