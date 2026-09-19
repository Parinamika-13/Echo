"""ECHO Real Estate Analysis (ERA) Schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from backend.app.utils.timestamps import utc_now


class MetricAssumption(BaseModel):
    """Explicit assumption used within a real-estate calculation."""
    assumption_name: str = Field(..., description="Name of assumed parameter, e.g. carpet_area_ratio")
    assumption_value: Any = Field(..., description="Value assigned to the assumption")
    assumption_source: str = Field(..., description="Source/rationale: RERA norms, historical average, user input")


class AnalysisMetric(BaseModel):
    """Transparent calculation unit exposing full lineage: INPUT -> FORMULA -> ASSUMPTION -> RESULT."""
    metric_name: str = Field(..., description="Standardized name of metric")
    value: Optional[float] = Field(default=None, description="Calculated numeric value")
    unit: str = Field(default="", description="Unit of measurement, e.g. INR/sqft, %")
    calculation_method: str = Field(..., description="Formula or algorithm name applied")
    input_values: Dict[str, Any] = Field(default_factory=dict, description="Raw input values supplied")
    input_sources: Dict[str, str] = Field(default_factory=dict, description="Source provenance of input values")
    assumptions: List[MetricAssumption] = Field(default_factory=list, description="Explicit assumptions")
    confidence: Optional[float] = Field(default=None, description="Calculated confidence rating")


class RealEstateAnalysis(BaseModel):
    """Structured output record from ERA (Real Estate Analysis Agent)."""
    analysis_id: str = Field(..., description="Unique analysis record ID")
    entity_id: str = Field(..., description="Canonical property entity ID analyzed")
    price_per_sqft: Optional[AnalysisMetric] = Field(default=None)
    rental_yield: Optional[AnalysisMetric] = Field(default=None)
    appreciation_indicator: Optional[AnalysisMetric] = Field(default=None)
    additional_metrics: Dict[str, AnalysisMetric] = Field(default_factory=dict)
    comparables: List[Dict[str, Any]] = Field(default_factory=list)
    locality_analysis: Dict[str, Any] = Field(default_factory=dict)
    confidence: Optional[float] = Field(default=None)
    created_at: datetime = Field(default_factory=utc_now)
    status: str = Field(default="COMPLETED")
    metadata: Dict[str, Any] = Field(default_factory=dict)
