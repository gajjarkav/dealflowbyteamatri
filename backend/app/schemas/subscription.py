from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from app.models.enums import IntervalEnum, ProrationRuleEnum, CancellationRuleEnum

class PlanBase(BaseModel):
    name: str
    interval: IntervalEnum = IntervalEnum.monthly
    proration_rule: ProrationRuleEnum = ProrationRuleEnum.daily
    cancellation_rule: CancellationRuleEnum = CancellationRuleEnum.no_refund
    refund_window_days: int = 0
    min_term_cycles: int = 1
    is_active: bool = True

class PlanCreate(PlanBase):
    pass

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    interval: Optional[IntervalEnum] = None
    proration_rule: Optional[ProrationRuleEnum] = None
    cancellation_rule: Optional[CancellationRuleEnum] = None
    refund_window_days: Optional[int] = None
    min_term_cycles: Optional[int] = None
    is_active: Optional[bool] = None

class PlanResponse(PlanBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)
