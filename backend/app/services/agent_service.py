"""ECHO Agent Management Service."""

from typing import Any, Dict, List, Optional

from backend.app.agents.registry import registry
from backend.app.schemas.agent import (
    AgentExecutionStatus,
    AgentMetadata,
    AgentRequest,
    AgentResult,
)


class AgentService:
    """Service layer mediating between API/workflows and the Agent Registry."""

    def __init__(self, agent_registry=registry):
        self.registry = agent_registry

    def list_agents(self) -> List[AgentMetadata]:
        """Return descriptors for all registered agents."""
        return self.registry.list_agents()

    def get_agent(self, agent_id: str) -> Optional[AgentMetadata]:
        """Retrieve metadata for a specific agent ID."""
        agent = self.registry.get_agent(agent_id)
        if not agent:
            return None
        return agent.get_metadata()

    def execute_agent(self, request: AgentRequest) -> AgentResult:
        """Directly invoke an individual agent through its execution lifecycle."""
        agent = self.registry.get_agent(request.agent_id)
        if not agent:
            return AgentResult(
                success=False,
                status=AgentExecutionStatus.FAILED,
                agent_id=request.agent_id,
                agent_version="0.0.0",
                run_id=request.run_id,
                errors=[f"Agent {request.agent_id} is not found in registry."],
            )
        return agent.execute(request)

    def health_check(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Check operational status of a single agent."""
        agent = self.registry.get_agent(agent_id)
        if not agent:
            return None
        return agent.health_check()


agent_service = AgentService()
