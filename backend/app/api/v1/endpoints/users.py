from fastapi import APIRouter, Depends
from typing import List
from app.api.dependencies import require_internal_roles
from app.models.user import User
from app.models.enums import RoleEnum

router = APIRouter()

@router.get("/me")
async def get_me(current_user: User = Depends(require_internal_roles([RoleEnum.sales_manager, RoleEnum.sales_rep, RoleEnum.finance]))):
    """Get current internal user info."""
    return current_user
