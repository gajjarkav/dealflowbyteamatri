from fastapi import APIRouter
from .v1.endpoints import auth, users, portal, customers, catalog, pricing, discount, warehouse, subscriptions, upsell, quotations, approvals

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(portal.router, prefix="/portal", tags=["portal"])
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(catalog.router, prefix="", tags=["catalog"])
api_router.include_router(pricing.router, prefix="", tags=["pricing"])
api_router.include_router(discount.router, prefix="", tags=["discount"])
api_router.include_router(warehouse.router, prefix="", tags=["warehouse"])
api_router.include_router(subscriptions.router, prefix="", tags=["subscriptions"])
api_router.include_router(upsell.router, prefix="", tags=["upsell"])
api_router.include_router(quotations.router, prefix="/quotations", tags=["quotations"])
api_router.include_router(approvals.router, prefix="/approvals", tags=["approvals"])

