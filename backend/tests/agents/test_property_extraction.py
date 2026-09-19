"""Tests for Agent 04: PSA Property Extraction & Normalization Agent."""

import pytest
from backend.app.agents.base_agent import BaseAgent
from backend.app.agents.psa.property_extraction_agent import PsaPropertyExtractionAgent
from backend.app.agents.registry import registry
from backend.app.schemas.agent import AgentExecutionStatus, AgentRequest, AgentResult


def test_property_extraction_contract():
    agent = PsaPropertyExtractionAgent()
    assert isinstance(agent, BaseAgent)
    assert agent.agent_id == "ECHO-PSA-EXTRACT"
    assert agent.version == "0.1.0"
    assert "ECHO-PSA-EXTRACT" in registry.list_agent_ids()


def test_property_extraction_rule_based_normalization():
    agent = PsaPropertyExtractionAgent()
    text = (
        "Project: Godrej Splendour. Developer: Godrej Properties. "
        "Price: 1.25 Cr. Specs: 3 BHK, 1450 sq ft. "
        "Locality: Whitefield. Pincode: 560066. "
        "RERA: PRM/KA/RERA/1251/446/PR/220616/004996."
    )
    req = AgentRequest(
        run_id="run_ext_01",
        agent_id="ECHO-PSA-EXTRACT",
        parameters={"raw_text": text},
    )
    res = agent.execute(req)
    assert res.success is True
    assert res.status == AgentExecutionStatus.SUCCESS
    cands = res.data["candidates"]
    assert len(cands) == 1
    cand = cands[0]
    assert cand["identity"]["property_name"] == "Godrej Splendour"
    assert cand["identity"]["developer"] == "Godrej Properties"
    assert cand["financials"]["price"] == 12_500_000.0
    assert cand["specs"]["bedrooms"] == 3.0
    assert cand["specs"]["area"] == 1450.0
    assert cand["location"]["pincode"] == "560066"
    assert len(res.evidence) > 0


def test_property_extraction_invalid_input():
    agent = PsaPropertyExtractionAgent()
    req = AgentRequest(
        run_id="run_ext_invalid",
        agent_id="ECHO-PSA-EXTRACT",
        parameters={},
    )
    res = agent.execute(req)
    assert res.success is False
    assert res.status == AgentExecutionStatus.FAILED
