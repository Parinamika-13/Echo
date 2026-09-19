"""ECHO Investigation Management Service."""

from typing import Dict, Optional
from sqlalchemy.orm import Session

from backend.app.agents.orchestrator_agent import EchoOrchestratorAgent
from backend.app.agents.registry import registry
from backend.app.database.connection import SessionLocal
from backend.app.database.models import AgentRunModel
from backend.app.schemas.agent import AgentExecutionStatus
from backend.app.schemas.investigation import (
    InvestigationRequest,
    InvestigationResult,
    InvestigationStatus,
)
from backend.app.utils.ids import generate_run_id


class InvestigationService:
    """Service layer managing investigation requests and orchestrator executions."""

    def __init__(self):
        # In-memory fast cache for quick lookup of active/completed investigations
        self._investigations: Dict[str, InvestigationResult] = {}

    def create_and_execute(
        self,
        request: InvestigationRequest,
    ) -> InvestigationResult:
        """Create a new run_id and execute the orchestrated workflow."""
        run_id = generate_run_id("echo_inv")
        orchestrator: EchoOrchestratorAgent = registry.get_agent("ECHO-ORCH")  # type: ignore

        if not orchestrator:
            # Fallback direct instantiation if registry is not loaded
            orchestrator = EchoOrchestratorAgent()

        # Execute investigation workflow
        result = orchestrator.execute_workflow(request, run_id=run_id)

        # Store in cache
        self._investigations[run_id] = result

        # Persist execution run metrics in database
        self._persist_agent_runs(result)

        return result

    def get_investigation(self, run_id: str) -> Optional[InvestigationResult]:
        """Retrieve cached or stored investigation status by run_id."""
        return self._investigations.get(run_id)

    def _persist_agent_runs(self, result: InvestigationResult) -> None:
        """Record agent run telemetry in relational database."""
        db: Session = SessionLocal()
        try:
            for agent_id, agent_res in result.agent_results.items():
                run_entry = AgentRunModel(
                    run_id=result.run_id,
                    agent_id=agent_id,
                    agent_version=agent_res.agent_version,
                    status=agent_res.status.value,
                    duration_ms=agent_res.duration_ms,
                    warnings=agent_res.warnings,
                    errors=agent_res.errors,
                )
                db.add(run_entry)
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()


investigation_service = InvestigationService()
