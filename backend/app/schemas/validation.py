"""ECHO Validation (SVEA) Schemas."""

import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from backend.app.utils.timestamps import utc_now


class ValidationStatus(str, Enum):
    """Validation outcomes for property and intelligence records."""
    VALIDATED = "VALIDATED"
    CONFLICT = "CONFLICT"
    UNVERIFIED = "UNVERIFIED"
    REJECTED = "REJECTED"
    PARTIAL = "PARTIAL"


class ConflictRecord(BaseModel):
    """Explicitly captured discrepancy between two or more evidence sources."""
    conflict_id: str = Field(default_factory=lambda: f"cnf_{uuid.uuid4().hex[:12]}")
    field_name: str = Field(..., description="Attribute under conflict, e.g. price, possession_date")
    source_a: str = Field(..., description="First source identifier or name")
    source_b: str = Field(..., description="Second source identifier or name")
    value_a: Any = Field(..., description="Value asserted by source A")
    value_b: Any = Field(..., description="Value asserted by source B")
    conflict_type: str = Field(default="VALUE_MISMATCH", description="Type: VALUE_MISMATCH, DATE_DISCREPANCY, STATUS_CONFLICT")
    severity: str = Field(default="MEDIUM", description="Severity: LOW, MEDIUM, HIGH, CRITICAL")
    timestamp: datetime = Field(default_factory=utc_now)
    resolved: bool = Field(default=False)
    resolution_notes: Optional[str] = None


class ValidationResult(BaseModel):
    """Source and evidence validation summary compiled by SVEA."""
    validation_id: str = Field(..., description="Unique validation ID")
    entity_id: str = Field(..., description="Target entity ID validated")
    status: ValidationStatus = Field(..., description="Aggregate validation status")
    conflicts: List[ConflictRecord] = Field(default_factory=list, description="All detected conflicts")
    verified_fields: List[str] = Field(default_factory=list, description="Fields validated without discrepancy")
    unverified_fields: List[str] = Field(default_factory=list, description="Fields lacking corroborating evidence")
    freshness_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    completeness_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    overall_confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    timestamp: datetime = Field(default_factory=utc_now)
    metadata: Dict[str, Any] = Field(default_factory=dict)
