from fastapi import APIRouter
from .v1.endpoints import auth, users, portal

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(portal.router, prefix="/portal", tags=["portal"])
