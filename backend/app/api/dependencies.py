from typing import Generator, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.db.session import AsyncSessionLocal
from app.core.config import settings
from app.models.user import User
from app.models.enums import RoleEnum
from app.core.exceptions import UnauthorizedError, ForbiddenError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_db() -> Generator:
    async with AsyncSessionLocal() as session:
        yield session

async def get_current_user(
    db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        token_version: int = payload.get("token_version")
        token_typ: str = payload.get("typ")
        
        if user_id is None or token_version is None or token_typ != "access":
            raise UnauthorizedError("Invalid token payload")
    except jwt.PyJWTError:
        raise UnauthorizedError("Could not validate credentials")

    stmt = select(User).where(User.id == user_id).options(selectinload(User.customer))
    result = await db.execute(stmt)
    user = result.scalars().first()

    if user is None or not user.is_active:
        raise UnauthorizedError("User inactive or not found")

    # Check for token revocation via token_version bump
    if user.token_version != token_version:
        raise UnauthorizedError("Token has been revoked")

    return user

async def get_current_internal_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role == RoleEnum.customer:
        raise ForbiddenError("Portal tokens cannot access internal API")
    return current_user

def require_roles(*roles: RoleEnum):
    async def role_checker(current_user: User = Depends(get_current_internal_user)) -> User:
        if current_user.role == RoleEnum.admin:
            return current_user
        if current_user.role not in roles:
            raise ForbiddenError("You do not have the required role to access this resource.")
        return current_user
    return role_checker

async def get_current_customer(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != RoleEnum.customer:
        raise ForbiddenError("Internal tokens cannot access portal API")
    if not current_user.customer_id:
        raise ForbiddenError("Not a valid customer account")
    return current_user
