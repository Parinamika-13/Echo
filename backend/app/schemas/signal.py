"""ECHO Signal Schemas."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

from backend.app.utils.timestamps import utc_now


class SignalType(str, Enum):
    """Categorization of detected real-estate and financial signals."""
    PRICE_CHANGE = "PRICE_CHANGE"
    PRICE_DROP = "PRICE_DROP"
    PRICE_INCREASE = "PRICE_INCREASE"
    LISTING_NEW = "LISTING_NEW"
    LISTING_REMOVED = "LISTING_REMOVED"
    AVAILABILITY_CHANGE = "AVAILABILITY_CHANGE"
    POSSESSION_UPDATE = "POSSESSION_UPDATE"
    PROJECT_STATUS_CHANGE = "PROJECT_STATUS_CHANGE"
    DEVELOPER_UPDATE = "DEVELOPER_UPDATE"
    REGULATORY_UPDATE = "REGULATORY_UPDATE"
    MARKET_MOVEMENT = "MARKET_MOVEMENT"
    RISK_EVENT = "RISK_EVENT"
    ANOMALY_EVENT = "ANOMALY_EVENT"


class SignalSeverity(str, Enum):
    """Impact / priority rating of signals."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SignalStatus(str, Enum):
    """Lifecycle status of minted signal."""
    ACTIVE = "ACTIVE"
    RESOLVED = "RESOLVED"
    SUPERSEDED = "SUPERSEDED"
    UNVERIFIED = "UNVERIFIED"


class Signal(BaseModel):
    """Minted signal record representing a verified event or shift."""
    signal_id: str = Field(..., description="Deterministic unique signal ID")
    signal_type: SignalType = Field(..., description="Signal classification")
    entity_id: str = Field(..., description="Target canonical entity ID")
    timestamp: datetime = Field(default_factory=utc_now, description="Mint timestamp")
    severity: SignalSeverity = Field(default=SignalSeverity.MEDIUM, description="Severity rating")
    importance: float = Field(default=5.0, ge=0.0, le=10.0, description="Importance scale from 0 to 10")
    description: str = Field(..., description="Human-readable explanation of the signal")
    source_reference: Optional[str] = Field(default=None, description="Linked source ID or URL")
    evidence_reference: Optional[str] = Field(default=None, description="Linked evidence record ID")
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Confidence in signal validity")
    status: SignalStatus = Field(default=SignalStatus.ACTIVE, description="Status of signal")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Custom context and metrics")
