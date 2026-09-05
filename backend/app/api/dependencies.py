from typing import Generator, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import AsyncSessionLocal
from app.core.config import settings
from app.models.user import User
from app.models.enums import RoleEnum

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_db() -> Generator:
    async with AsyncSessionLocal() as session:
        yield session

async def get_current_user(
    db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        token_version: int = payload.get("token_version")
        if user_id is None or token_version is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if user is None or not user.is_active:
        raise credentials_exception

    # Check for token revocation via token_version bump
    if user.token_version != token_version:
        raise credentials_exception

    return user

def require_internal_roles(roles: List[RoleEnum]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role == RoleEnum.customer:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Portal tokens cannot access internal API")
            
        # Admin is superset for internal roles
        if current_user.role == RoleEnum.admin:
            return current_user
            
        if current_user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
        return current_user
    return role_checker

async def get_current_customer(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != RoleEnum.customer:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Internal tokens cannot access portal API")
    if not current_user.customer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a valid customer account")
    return current_user
