"""Agents Discovery API Routes."""

from typing import List
from fastapi import APIRouter, HTTPException, status

from backend.app.schemas.agent import AgentMetadata
from backend.app.services.agent_service import agent_service

router = APIRouter()


@router.get("/agents", response_model=List[AgentMetadata])
def list_agents() -> List[AgentMetadata]:
    """Retrieve metadata and capabilities for all registered ECHO intelligence agents."""
    return agent_service.list_agents()


@router.get("/agents/{agent_id}", response_model=AgentMetadata)
def get_agent_details(agent_id: str) -> AgentMetadata:
    """Retrieve metadata, version, capabilities, and status for a specific agent."""
    metadata = agent_service.get_agent(agent_id)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID '{agent_id}' is not registered.",
        )
    return metadata
