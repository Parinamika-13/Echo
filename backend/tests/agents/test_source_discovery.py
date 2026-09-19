"""Tests for Agent 02: PSA Source Discovery & Collection Agent."""

import pytest
from backend.app.agents.base_agent import BaseAgent
from backend.app.agents.psa.source_discovery_agent import PsaSourceDiscoveryAgent
from backend.app.agents.registry import registry
from backend.app.schemas.agent import AgentExecutionStatus, AgentRequest, AgentResult


def test_source_discovery_contract():
    agent = PsaSourceDiscoveryAgent()
    assert isinstance(agent, BaseAgent)
    assert agent.agent_id == "ECHO-PSA-SOURCE"
    assert agent.version == "0.1.0"
    assert "ECHO-PSA-SOURCE" in registry.list_agent_ids()


def test_source_discovery_execution():
    agent = PsaSourceDiscoveryAgent()
    req = AgentRequest(
        run_id="run_src_01",
        agent_id="ECHO-PSA-SOURCE",
        parameters={"source_urls": ["https://example.com/property/123"]},
    )
    res = agent.execute(req)
    assert isinstance(res, AgentResult)
    assert res.success is True
    assert res.status == AgentExecutionStatus.SUCCESS
    assert "sources" in res.data
    assert len(res.data["sources"]) == 1
    assert res.data["sources"][0]["source_name"] == "example.com"


def test_source_discovery_invalid_input():
    agent = PsaSourceDiscoveryAgent()
    req = AgentRequest(
        run_id="run_src_invalid",
        agent_id="ECHO-PSA-SOURCE",
        parameters={},  # Missing targets
    )
    res = agent.execute(req)
    assert res.success is False
    assert res.status == AgentExecutionStatus.FAILED
