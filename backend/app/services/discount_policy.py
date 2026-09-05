from typing import Dict, Optional, Tuple
from decimal import Decimal
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.discount import DiscountTier, CategoryDiscountCeiling

# Request-scoped cache
# In a real system, you might attach this to the request state. 
# For now, we can use a class instance to hold cache during a single request lifecycle,
# or simply fetch all tiers/ceilings at once per request and hold them.

class DiscountPolicyCache:
    def __init__(self):
        self.tiers: Dict[str, Decimal] = {}
        self.ceilings: Dict[Tuple[str, uuid.UUID], Decimal] = {}
        self.loaded = False

    async def load(self, db: AsyncSession):
        if self.loaded:
            return
            
        # Load all tiers
        tier_rows = (await db.execute(select(DiscountTier))).scalars().all()
        for t in tier_rows:
            self.tiers[t.tier.value if hasattr(t.tier, 'value') else str(t.tier)] = t.max_discount_pct
            
        # Load all category ceilings
        ceil_rows = (await db.execute(select(CategoryDiscountCeiling))).scalars().all()
        for c in ceil_rows:
            tier_str = c.tier.value if hasattr(c.tier, 'value') else str(c.tier)
            self.ceilings[(tier_str, c.category_id)] = c.max_discount_pct
            
        self.loaded = True

    async def get_effective_ceiling(self, db: AsyncSession, tier: str, category_id: uuid.UUID) -> Decimal:
        await self.load(db)
        
        tier_str = str(tier)
        tier_ceiling = self.tiers.get(tier_str, Decimal("0.00"))
        
        cat_ceiling = self.ceilings.get((tier_str, category_id))
        
        if cat_ceiling is not None and cat_ceiling < tier_ceiling:
            return cat_ceiling
        
        return tier_ceiling

# Expose a default instance or dependency pattern. 
# We'll instantiate this per request in the router, or simply pass it around.
# Actually, the spec says "Cache the tier & ceiling tables per request."
# We'll create a factory function that returns a new cache instance.

def get_discount_cache() -> DiscountPolicyCache:
    return DiscountPolicyCache()
