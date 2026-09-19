"""ECHO Abstract Base Agent."""

from abc import ABC, abstractmethod
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime

from backend.app.core.logging import log_agent_event, logger as default_logger
from backend.app.schemas.agent import (
    AgentExecutionStatus,
    AgentMetadata,
    AgentRequest,
    AgentResult,
)
from backend.app.utils.timestamps import duration_ms, utc_now


class BaseAgent(ABC):
    """Abstract base class for all ECHO intelligence pipeline agents.

    Provides standardized lifecycle management:
    Input Validation -> Context Setup -> Safe Execution -> Output Validation -> Logging & Metrics.
    """

    agent_id: str
    name: str
    version: str = "0.1.0"
    description: str
    capabilities: List[str] = []
    status: str = "ACTIVE"

    def __init__(self, logger: Optional[logging.Logger] = None):
        if not hasattr(self, "agent_id") or not self.agent_id:
            raise ValueError(f"Agent class {self.__class__.__name__} must define a unique 'agent_id'.")
        if not hasattr(self, "name") or not self.name:
            raise ValueError(f"Agent class {self.__class__.__name__} must define a 'name'.")
        if not hasattr(self, "description") or not self.description:
            raise ValueError(f"Agent class {self.__class__.__name__} must define a 'description'.")

        self.logger = logger or default_logger

    def get_metadata(self) -> AgentMetadata:
        """Return standardized agent descriptor."""
        return AgentMetadata(
            agent_id=self.agent_id,
            name=self.name,
            version=self.version,
            description=self.description,
            capabilities=self.capabilities,
            status=self.status,
        )

    def validate_input(self, request: AgentRequest) -> bool:
        """Validate that the incoming request complies with this agent's contract.

        Default implementation checks that run_id and agent_id are present and target matches.
        Subclasses should override to perform specific parameter checks.
        """
        if not request.run_id or not request.run_id.strip():
            return False
        if request.agent_id != self.agent_id:
            # Tolerant if sent generically to pipeline, but log warning
            self.logger.debug(f"Request agent_id {request.agent_id} directed to {self.agent_id}")
        return True

    def validate_output(self, result: AgentResult) -> bool:
        """Validate that the outgoing result conforms to ECHO standards."""
        if not isinstance(result, AgentResult):
            return False
        if result.agent_id != self.agent_id:
            return False
        if result.status not in AgentExecutionStatus:
            return False
        return True

    def health_check(self) -> Dict[str, Any]:
        """Verify agent operational readiness."""
        return {
            "agent_id": self.agent_id,
            "status": "HEALTHY",
            "version": self.version,
            "timestamp": utc_now().isoformat(),
        }

    def execute(self, request: AgentRequest) -> AgentResult:
        """Execute agent workflow lifecycle with automatic instrumentation and fault isolation."""
        start_time = utc_now()
        log_agent_event(
            self.logger,
            event="agent_started",
            agent_id=self.agent_id,
            agent_version=self.version,
            run_id=request.run_id,
            status="STARTED",
        )

        # 1. Validate Input
        try:
            if not self.validate_input(request):
                elapsed = duration_ms(start_time)
                err_msg = f"Invalid input request payload for agent {self.agent_id}"
                self.logger.error(err_msg)
                result = AgentResult(
                    success=False,
                    status=AgentExecutionStatus.FAILED,
                    agent_id=self.agent_id,
                    agent_version=self.version,
                    run_id=request.run_id,
                    duration_ms=elapsed,
                    errors=[err_msg],
                    metadata={"stage": "input_validation"},
                )
                log_agent_event(
                    self.logger,
                    event="agent_failed",
                    agent_id=self.agent_id,
                    agent_version=self.version,
                    run_id=request.run_id,
                    status=result.status.value,
                    duration_ms=elapsed,
                )
                return result
        except Exception as val_exc:
            elapsed = duration_ms(start_time)
            self.logger.exception(f"Exception during input validation in {self.agent_id}: {val_exc}")
            return AgentResult(
                success=False,
                status=AgentExecutionStatus.FAILED,
                agent_id=self.agent_id,
                agent_version=self.version,
                run_id=request.run_id,
                duration_ms=elapsed,
                errors=[f"Input validation error: {str(val_exc)}"],
                metadata={"stage": "input_validation_exception"},
            )

        # 2. Execute concrete business logic
        try:
            result = self._run(request)
        except Exception as exc:
            elapsed = duration_ms(start_time)
            self.logger.exception(f"Unhandled exception during execution of agent {self.agent_id}: {exc}")
            result = AgentResult(
                success=False,
                status=AgentExecutionStatus.FAILED,
                agent_id=self.agent_id,
                agent_version=self.version,
                run_id=request.run_id,
                duration_ms=elapsed,
                errors=[str(exc)],
                metadata={"stage": "execution_unhandled_exception"},
            )

        # 3. Post-execution instrumentation & output validation
        elapsed = duration_ms(start_time)
        result.duration_ms = elapsed
        result.agent_id = self.agent_id
        result.agent_version = self.version
        result.run_id = request.run_id

        if not self.validate_output(result):
            result.warnings.append("Output result failed structural validation checks.")

        log_agent_event(
            self.logger,
            event="agent_completed",
            agent_id=self.agent_id,
            agent_version=self.version,
            run_id=request.run_id,
            status=result.status.value,
            duration_ms=elapsed,
        )

        return result

    @abstractmethod
    def _run(self, request: AgentRequest) -> AgentResult:
        """Subclasses must implement their business execution logic in this method."""
        pass
