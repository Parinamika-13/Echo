"""ECHO Investigation Schemas."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from backend.app.schemas.agent import AgentResult
from backend.app.utils.timestamps import utc_now


class InvestigationStatus(str, Enum):
    """Investigation lifecycle statuses."""
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    PARTIAL_SUCCESS = "PARTIAL_SUCCESS"


class WorkflowType(str, Enum):
    """Pre-configured orchestrated workflow types."""
    PROPERTY_DISCOVERY = "PROPERTY_DISCOVERY"
    PROPERTY_ANALYSIS = "PROPERTY_ANALYSIS"
    INVESTMENT_ANALYSIS = "INVESTMENT_ANALYSIS"
    SIGNAL_ANALYSIS = "SIGNAL_ANALYSIS"
    RISK_ANALYSIS = "RISK_ANALYSIS"
    FULL_ANALYSIS = "FULL_ANALYSIS"


class InvestigationRequest(BaseModel):
    """Client request schema for triggering an orchestrated investigation."""
    request_type: str = Field(default="PROPERTY_ANALYSIS", description="Type of request")
    property_id: Optional[str] = Field(default=None, description="Known canonical property ID if existing")
    source_urls: List[str] = Field(default_factory=list, description="Target URLs to discover/extract from")
    query: Optional[str] = Field(default=None, description="Search query or property name/locality")
    workflow: WorkflowType = Field(default=WorkflowType.FULL_ANALYSIS, description="Orchestration workflow to execute")
    options: Dict[str, Any] = Field(default_factory=dict, description="Custom pipeline execution options")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Client metadata")


class InvestigationResult(BaseModel):
    """Comprehensive result returned by orchestrator upon workflow completion."""
    run_id: str = Field(..., description="Unique investigation run ID")
    workflow: WorkflowType = Field(..., description="Orchestration workflow executed")
    status: InvestigationStatus = Field(..., description="Investigation status")
    created_at: datetime = Field(default_factory=utc_now, description="Initiation timestamp")
    completed_at: Optional[datetime] = Field(default=None, description="Completion timestamp")
    duration_ms: Optional[float] = Field(default=None, description="Overall pipeline duration in ms")
    executed_agents: List[str] = Field(default_factory=list, description="Ordered list of agent IDs invoked")
    agent_results: Dict[str, AgentResult] = Field(default_factory=dict, description="Results mapped by agent ID")
    summary: Dict[str, Any] = Field(default_factory=dict, description="High-level rollup intelligence")
    warnings: List[str] = Field(default_factory=list, description="Aggregated pipeline warnings")
    errors: List[str] = Field(default_factory=list, description="Aggregated pipeline errors")
