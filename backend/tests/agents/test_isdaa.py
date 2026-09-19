"""Tests for Agent 08: ISDAA — Investment & Scenario Decision Analysis Agent."""

import pytest
from backend.app.agents.base_agent import BaseAgent
from backend.app.agents.isdaa_agent import IsdaaAgent
from backend.app.agents.registry import registry
from backend.app.schemas.agent import AgentExecutionStatus, AgentRequest, AgentResult


def test_isdaa_contract():
    agent = IsdaaAgent()
    assert isinstance(agent, BaseAgent)
    assert agent.agent_id == "ECHO-ISDAA"
    assert agent.version == "0.1.0"
    assert "ECHO-ISDAA" in registry.list_agent_ids()


def test_isdaa_scenarios_computation():
    agent = IsdaaAgent()
    req = AgentRequest(
        run_id="run_isdaa_01",
        agent_id="ECHO-ISDAA",
        parameters={
            "purchase_price": 10000000.0,
            "monthly_rent": 30000.0,
        },
    )
    res = agent.execute(req)
    assert res.success is True
    assert res.status == AgentExecutionStatus.SUCCESS
    scenarios = res.data["scenarios"]
    assert "BASE" in scenarios
    assert "CONSERVATIVE" in scenarios
    assert "OPTIMISTIC" in scenarios

    base = scenarios["BASE"]
    assert base["purchase_price"] == 10000000.0
    assert base["down_payment"] == 2000000.0
    assert base["transaction_costs"] == 600000.0
    assert len(base["assumptions"]) > 0
    assert "formula_roi" in base["breakdown"]


def test_isdaa_invalid_input():
    agent = IsdaaAgent()
    req = AgentRequest(
        run_id="run_isdaa_invalid",
        agent_id="ECHO-ISDAA",
        parameters={"purchase_price": -500.0},
    )
    res = agent.execute(req)
    assert res.success is False
    assert res.status == AgentExecutionStatus.FAILED
