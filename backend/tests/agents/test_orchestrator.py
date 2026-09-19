"""Tests for Agent 01: ECHO Orchestrator Agent."""

import pytest
from backend.app.agents.base_agent import BaseAgent
from backend.app.agents.orchestrator_agent import EchoOrchestratorAgent
from backend.app.agents.registry import registry
from backend.app.schemas.agent import AgentExecutionStatus, AgentRequest, AgentResult
from backend.app.schemas.investigation import InvestigationRequest, InvestigationResult, WorkflowType


def test_orchestrator_instantiation_and_contract():
    agent = EchoOrchestratorAgent()
    assert isinstance(agent, BaseAgent)
    assert agent.agent_id == "ECHO-ORCH"
    assert agent.version == "0.1.0"
    assert "ECHO-ORCH" in registry.list_agent_ids()


def test_orchestrator_health_check():
    agent = EchoOrchestratorAgent()
    hc = agent.health_check()
    assert hc["status"] == "HEALTHY"
    assert hc["agent_id"] == "ECHO-ORCH"


def test_orchestrator_input_validation():
    agent = EchoOrchestratorAgent()
    valid_req = AgentRequest(run_id="run_test_01", agent_id="ECHO-ORCH", parameters={"workflow": "PROPERTY_DISCOVERY"})
    assert agent.validate_input(valid_req) is True

    invalid_req = AgentRequest(run_id="", agent_id="ECHO-ORCH", parameters={})
    assert agent.validate_input(invalid_req) is False


def test_orchestrator_execute_workflow_full_analysis():
    agent = EchoOrchestratorAgent()
    inv_req = InvestigationRequest(
        workflow=WorkflowType.PROPERTY_DISCOVERY,
        options={
            "raw_content": (
                "Project: Prestige Lakeside Habitat. Developer: Prestige Group. "
                "Location: Varthur, Bengaluru. Pincode: 560087. "
                "Price: 1.25 Cr. Specs: 3 BHK, 1500 sq ft. "
                "RERA: PRM/KA/RERA/1251/310/PR/170915/000176."
            )
        },
    )
    result = agent.execute_workflow(inv_req)
    assert isinstance(result, InvestigationResult)
    assert result.status in ("COMPLETED", "PARTIAL_SUCCESS")
    assert len(result.executed_agents) > 0
    assert "ECHO-PSA-DOC" in result.executed_agents
    assert "ECHO-PSA-EXTRACT" in result.executed_agents
