import uuid
from typing import Optional, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit import AuditLog

async def log_audit(
    db: AsyncSession,
    entity: str,
    entity_id: uuid.UUID,
    action: str,
    actor_id: Optional[uuid.UUID] = None,
    reason: Optional[str] = None,
    diff: Optional[Dict] = None
) -> None:
    """
    Asynchronously write an audit log entry.
    """
    audit = AuditLog(
        entity=entity,
        entity_id=entity_id,
        action=action,
        actor_id=actor_id,
        reason=reason,
        diff=diff
    )
    db.add(audit)
    # We do not commit here to ensure the audit log is committed atomically
    # alongside the primary transaction that caused the action.
