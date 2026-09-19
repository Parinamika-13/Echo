"""ECHO Audit and Historical Writeback (SSR) Schemas."""

import uuid
from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

from backend.app.utils.timestamps import utc_now


class HistoricalChangeRecord(BaseModel):
    """Immutable audit trail for field updates (e.g. price shifts) preserving full change lineage."""
    change_id: str = Field(default_factory=lambda: f"chg_{uuid.uuid4().hex[:12]}")
    entity_id: str = Field(..., description="Target canonical entity ID")
    field_name: str = Field(..., description="Attribute name updated, e.g. price")
    old_value: Any = Field(default=None, description="Previous historical value")
    new_value: Any = Field(default=None, description="New updated value")
    changed_at: datetime = Field(default_factory=utc_now, description="When change was recorded")
    source_id: Optional[str] = Field(default=None, description="Source where change originated")
    signal_id: Optional[str] = Field(default=None, description="Associated minted signal ID")
    agent_id: str = Field(default="ECHO-SSR", description="Agent committing the writeback")
    agent_version: str = Field(default="0.1.0")
    run_id: str = Field(..., description="Orchestration run ID")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AuditEvent(BaseModel):
    """Event log record for any mutation in ECHO intelligence store."""
    event_id: str = Field(default_factory=lambda: f"evt_{uuid.uuid4().hex[:12]}")
    entity_id: Optional[str] = Field(default=None)
    event_type: str = Field(..., description="Classification: CREATED, UPDATED, VALIDATED, MINTED, MERGED")
    actor_agent_id: str = Field(..., description="Agent triggering the event")
    agent_version: str = Field(default="0.1.0")
    run_id: str = Field(..., description="Pipeline run ID")
    timestamp: datetime = Field(default_factory=utc_now)
    details: Dict[str, Any] = Field(default_factory=dict)


class AuditRecord(BaseModel):
    """Structured audit payload persisted by SSR."""
    record_id: str = Field(..., description="Unique record audit ID")
    entity_id: str = Field(..., description="Canonical property or entity ID")
    record_version: int = Field(default=1, description="Sequential version index")
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    source_id: Optional[str] = None
    source_timestamp: Optional[datetime] = None
    agent_id: str = Field(default="ECHO-SSR")
    agent_version: str = Field(default="0.1.0")
    run_id: str = Field(...)
    confidence: Optional[float] = None
    evidence_reference: Optional[str] = None
    payload_type: str = Field(..., description="Type: PROPERTY, SIGNAL, ANALYSIS, INVESTMENT, RISK")
    payload: Dict[str, Any] = Field(default_factory=dict)
