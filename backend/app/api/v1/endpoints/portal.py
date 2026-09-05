from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_customer
from app.models.user import User
from app.schemas.user import PortalMeResponse

router = APIRouter()

@router.get("/me", response_model=PortalMeResponse)
async def get_portal_me(current_customer: User = Depends(get_current_customer)):
    """Get current customer info."""
    return current_customer
