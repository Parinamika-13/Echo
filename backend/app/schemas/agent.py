"""ECHO Agent Schemas and Contracts."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from backend.app.utils.timestamps import utc_now


class AgentExecutionStatus(str, Enum):
    """Execution status for agent runs."""
    SUCCESS = "SUCCESS"
    PARTIAL_SUCCESS = "PARTIAL_SUCCESS"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"
    NOT_IMPLEMENTED = "NOT_IMPLEMENTED"


class AgentMetadata(BaseModel):
    """Metadata describing a registered agent and its capabilities."""
    agent_id: str = Field(..., description="Unique agent identifier, e.g. ECHO-ORCH")
    name: str = Field(..., description="Human-readable name of the agent")
    version: str = Field(default="0.1.0", description="Semantic version of the agent")
    description: str = Field(..., description="Description of the agent's role and responsibilities")
    capabilities: List[str] = Field(default_factory=list, description="List of capabilities supported")
    status: str = Field(default="ACTIVE", description="Operational status: ACTIVE, DEGRADED, MAINTENANCE")


class AgentRequest(BaseModel):
    """Standardized input contract for all ECHO agents."""
    run_id: str = Field(..., description="Unique run/investigation execution ID")
    agent_id: str = Field(..., description="Target agent ID")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Agent-specific parameters")
    context: Dict[str, Any] = Field(default_factory=dict, description="Execution context passed from prior steps")
    parent_run_id: Optional[str] = Field(default=None, description="Parent workflow run ID if nested")


class AgentResult(BaseModel):
    """Standardized output contract returned by all ECHO agents."""
    success: bool = Field(..., description="Whether the execution completed without unhandled failure")
    status: AgentExecutionStatus = Field(..., description="Execution status code")
    agent_id: str = Field(..., description="ID of executing agent")
    agent_version: str = Field(default="0.1.0", description="Version of executing agent")
    run_id: str = Field(..., description="Execution run ID")
    timestamp: datetime = Field(default_factory=utc_now, description="Completion timestamp")
    duration_ms: float = Field(default=0.0, description="Duration of agent execution in milliseconds")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Typed output payload")
    confidence: Optional[float] = Field(default=None, description="Calculated confidence score between 0.0 and 1.0, or None")
    evidence: List[Dict[str, Any]] = Field(default_factory=list, description="Associated evidence or provenance references")
    warnings: List[str] = Field(default_factory=list, description="Non-fatal warnings encountered")
    errors: List[str] = Field(default_factory=list, description="Errors encountered during execution")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional execution telemetry and metadata")


class AgentRun(BaseModel):
    """Audit record capturing an agent's execution lifecycle."""
    run_id: str
    agent_id: str
    agent_version: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_ms: Optional[float] = None
    status: AgentExecutionStatus
    parameters: Dict[str, Any] = Field(default_factory=dict)
    result: Optional[AgentResult] = None
    error_message: Optional[str] = None
