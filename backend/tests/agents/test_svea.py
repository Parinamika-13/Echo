"""Tests for Agent 09: SVEA — Source & Evidence Validation Agent."""

import pytest
from backend.app.agents.base_agent import BaseAgent
from backend.app.agents.registry import registry
from backend.app.agents.svea_agent import SveaAgent
from backend.app.schemas.agent import AgentExecutionStatus, AgentRequest, AgentResult
from backend.app.schemas.validation import ValidationStatus


def test_svea_contract():
    agent = SveaAgent()
    assert isinstance(agent, BaseAgent)
    assert agent.agent_id == "ECHO-SVEA"
    assert agent.version == "0.1.0"
    assert "ECHO-SVEA" in registry.list_agent_ids()


def test_svea_conflict_detection():
    agent = SveaAgent()
    # Two sources reporting conflicting prices: 1.20 Cr vs 1.35 Cr
    cand_a = {
        "candidate_id": "c1",
        "source_id": "src_magicbricks",
        "financials": {"price": 12000000.0},
        "specs": {"bedrooms": 3.0},
    }
    cand_b = {
        "candidate_id": "c2",
        "source_id": "src_housing",
        "financials": {"price": 13500000.0},
        "specs": {"bedrooms": 3.0},
    }

    req = AgentRequest(
        run_id="run_svea_conflict",
        agent_id="ECHO-SVEA",
        parameters={"candidates": [cand_a, cand_b]},
    )
    res = agent.execute(req)
    assert res.success is True
    data = res.data
    assert data["status"] == ValidationStatus.CONFLICT.value
    assert len(data["conflicts"]) == 1
    conf = data["conflicts"][0]
    assert conf["field_name"] == "price"
    assert conf["value_a"] == 12000000.0
    assert conf["value_b"] == 13500000.0
    assert conf["source_a"] == "src_magicbricks"
    assert conf["source_b"] == "src_housing"


def test_svea_consistent_validation():
    agent = SveaAgent()
    cand_a = {
        "candidate_id": "c1",
        "source_id": "src_1",
        "financials": {"price": 10000000.0},
        "specs": {"bedrooms": 2.0},
    }
    cand_b = {
        "candidate_id": "c2",
        "source_id": "src_2",
        "financials": {"price": 10000000.0},
        "specs": {"bedrooms": 2.0},
    }
    req = AgentRequest(
        run_id="run_svea_valid",
        agent_id="ECHO-SVEA",
        parameters={"candidates": [cand_a, cand_b]},
    )
    res = agent.execute(req)
    assert res.success is True
    assert res.data["status"] == ValidationStatus.VALIDATED.value
    assert len(res.data["conflicts"]) == 0
    assert "price" in res.data["verified_fields"]
