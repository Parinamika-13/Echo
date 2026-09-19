"""Tests for Agent 05: PSA Entity Resolution & Deduplication Agent."""

import pytest
from backend.app.agents.base_agent import BaseAgent
from backend.app.agents.psa.entity_resolution_agent import PsaEntityResolutionAgent
from backend.app.agents.registry import registry
from backend.app.schemas.agent import AgentExecutionStatus, AgentRequest, AgentResult


def test_entity_resolution_contract():
    agent = PsaEntityResolutionAgent()
    assert isinstance(agent, BaseAgent)
    assert agent.agent_id == "ECHO-PSA-ENTITY"
    assert agent.version == "0.1.0"
    assert "ECHO-PSA-ENTITY" in registry.list_agent_ids()


def test_entity_resolution_deduplication():
    agent = PsaEntityResolutionAgent()
    candidate_a = {
        "candidate_id": "cand_1",
        "identity": {"project_name": "Prestige Lakeside Habitat", "developer": "Prestige Group"},
        "location": {"locality": "Whitefield", "pincode": "560087"},
        "financials": {"price": 12000000.0},
        "specs": {"area": 1500.0, "bedrooms": 3.0},
    }
    candidate_b = {
        "candidate_id": "cand_2",
        "identity": {"project_name": "Prestige Lakeside Habitat Apartments", "developer": "Prestige Group"},
        "location": {"locality": "Varthur Whitefield", "pincode": "560087"},
        "financials": {"price": 12200000.0},
        "specs": {"area": 1500.0, "bedrooms": 3.0},
    }

    req = AgentRequest(
        run_id="run_dedup_01",
        agent_id="ECHO-PSA-ENTITY",
        parameters={"candidates": [candidate_a, candidate_b]},
    )
    res = agent.execute(req)
    assert res.success is True
    assert res.status == AgentExecutionStatus.SUCCESS
    props = res.data["canonical_properties"]
    # Both candidates should resolve to 1 canonical entity
    assert len(props) == 1
    assert len(props[0]["matched_candidate_ids"]) == 2
    assert props[0]["property_id"].startswith("ent_")
