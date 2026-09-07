from sqlalchemy.orm import Session
from app.models.audit import AuditLog
from typing import Any, Dict, Optional

def log_action(db: Session, actor_user_id: str, action: str, target_user_id: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None):
    log = AuditLog(
        actor_user_id=actor_user_id,
        action=action,
        target_user_id=target_user_id,
        metadata_json=metadata
    )
    db.add(log)
    db.commit()
