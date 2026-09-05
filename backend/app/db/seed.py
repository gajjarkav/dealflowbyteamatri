import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import AsyncSessionLocal
from app.core.config import settings
from app.models.user import User, Customer
from app.models.enums import RoleEnum
from app.services.auth.security import get_password_hash

logger = logging.getLogger(__name__)

async def seed_db(db: AsyncSession):
    # Create System Admin
    stmt = select(User).where(User.email == settings.FIRST_SUPERUSER_EMAIL.lower())
    result = await db.execute(stmt)
    admin = result.scalars().first()
    
    if not admin:
        admin = User(
            full_name=settings.FIRST_SUPERUSER_NAME,
            email=settings.FIRST_SUPERUSER_EMAIL.lower(),
            password_hash=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
            role=RoleEnum.admin,
            is_active=True,
            is_email_verified=True,
            is_system=True
        )
        db.add(admin)
        logger.info(f"Created admin user: {admin.email}")
    else:
        logger.info("Admin user already exists.")

    # Demo internal users
    internal_users = [
        {"email": "manager@dealflow.local", "name": "Demo Manager", "role": RoleEnum.sales_manager},
        {"email": "rep@dealflow.local", "name": "Demo Rep", "role": RoleEnum.sales_rep},
        {"email": "finance@dealflow.local", "name": "Demo Finance", "role": RoleEnum.finance}
    ]

    for data in internal_users:
        stmt = select(User).where(User.email == data["email"].lower())
        result = await db.execute(stmt)
        if not result.scalars().first():
            user = User(
                full_name=data["name"],
                email=data["email"].lower(),
                password_hash=get_password_hash("password123"),
                role=data["role"],
                is_active=True,
                is_email_verified=True,
                must_change_password=True
            )
            db.add(user)
            logger.info(f"Created internal user: {data['email']}")
            
    # Demo Customer
    stmt = select(Customer).where(Customer.company_name == "Acme Corp Demo")
    result = await db.execute(stmt)
    demo_cust = result.scalars().first()
    
    if not demo_cust:
        demo_cust = Customer(company_name="Acme Corp Demo")
        db.add(demo_cust)
        await db.flush()
        
        cust_user = User(
            full_name="Acme Admin",
            email="acme@dealflow.local",
            password_hash=get_password_hash("password123"),
            role=RoleEnum.customer,
            customer_id=demo_cust.id,
            is_active=True,
            is_email_verified=True
        )
        db.add(cust_user)
        logger.info("Created demo customer: acme@dealflow.local")

    await db.commit()
    logger.info("Database seeding completed.")

async def main():
    async with AsyncSessionLocal() as session:
        await seed_db(session)

if __name__ == "__main__":
    asyncio.run(main())
