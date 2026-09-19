"""ECHO Risk Assessment (RSA) Schemas."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from backend.app.utils.timestamps import utc_now


class RiskDimension(str, Enum):
    """Categorization of risk dimensions evaluated by RSA."""
    PRICE_RISK = "PRICE_RISK"
    MARKET_RISK = "MARKET_RISK"
    LIQUIDITY_RISK = "LIQUIDITY_RISK"
    REGULATORY_RISK = "REGULATORY_RISK"
    PROJECT_RISK = "PROJECT_RISK"
    DEVELOPER_RISK = "DEVELOPER_RISK"
    DATA_QUALITY_RISK = "DATA_QUALITY_RISK"
    SOURCE_RISK = "SOURCE_RISK"
    ANOMALY_RISK = "ANOMALY_RISK"
    CONCENTRATION_RISK = "CONCENTRATION_RISK"


class RiskSeverity(str, Enum):
    """Severity ratings for risk factors."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class RiskFactor(BaseModel):
    """Discrete, explainable risk finding with explicit evidence lineage."""
    risk_id: str = Field(..., description="Unique risk factor identifier")
    risk_type: RiskDimension = Field(..., description="Classified risk dimension")
    severity: RiskSeverity = Field(default=RiskSeverity.MEDIUM, description="Assigned severity")
    reason: str = Field(..., description="Explainable justification for why this risk exists")
    evidence: List[str] = Field(default_factory=list, description="IDs of supporting evidence records or sources")
    supporting_signals: List[str] = Field(default_factory=list, description="IDs of supporting minted signals")
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Confidence in risk determination")
    calculation_method: str = Field(..., description="Rule, model or heuristic method applied")
    created_at: datetime = Field(default_factory=utc_now)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class RiskAssessment(BaseModel):
    """Aggregated risk profile for a property entity."""
    assessment_id: str = Field(..., description="Unique assessment ID")
    entity_id: str = Field(..., description="Target property ID")
    factors: List[RiskFactor] = Field(default_factory=list, description="Identified risk factors")
    primary_concerns: List[str] = Field(default_factory=list, description="Key high-severity bullet points")
    overall_risk_rating: Optional[str] = Field(default="NOT_CALCULATED", description="Rating: LOW, MODERATE, ELEVATED, SEVERE, or NOT_CALCULATED")
    overall_confidence: Optional[float] = Field(default=None)
    created_at: datetime = Field(default_factory=utc_now)
    status: str = Field(default="COMPLETED")
    metadata: Dict[str, Any] = Field(default_factory=dict)
