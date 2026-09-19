"""Tests for Agent 10: RSA — Risk & Signal Assessment Agent."""

import pytest
from backend.app.agents.base_agent import BaseAgent
from backend.app.agents.registry import registry
from backend.app.agents.rsa_agent import RsaAgent
from backend.app.schemas.agent import AgentExecutionStatus, AgentRequest, AgentResult
from backend.app.schemas.risk import RiskDimension


def test_rsa_contract():
    agent = RsaAgent()
    assert isinstance(agent, BaseAgent)
    assert agent.agent_id == "ECHO-RSA"
    assert agent.version == "0.1.0"
    assert "ECHO-RSA" in registry.list_agent_ids()


def test_rsa_explainable_risk_assessment():
    agent = RsaAgent()
    # Input with data quality conflict and missing RERA
    req = AgentRequest(
        run_id="run_rsa_01",
        agent_id="ECHO-RSA",
        parameters={
            "validation": {
                "conflicts": [
                    {
                        "conflict_id": "cnf_001",
                        "field_name": "possession_date",
                        "source_a": "src_1",
                        "source_b": "src_2",
                    }
                ]
            },
            "property": {
                "property_id": "ent_test_prop",
                "regulatory": {"rera_number": None},  # Missing RERA
            },
        },
    )
    res = agent.execute(req)
    assert res.success is True
    assert res.status == AgentExecutionStatus.SUCCESS
    assessment = res.data
    factors = assessment["factors"]
    assert len(factors) == 2

    types = [f["risk_type"] for f in factors]
    assert RiskDimension.DATA_QUALITY_RISK.value in types
    assert RiskDimension.REGULATORY_RISK.value in types

    # Verify explainability: each risk has a reason and calculation_method
    for f in factors:
        assert f["reason"]
        assert f["calculation_method"]
        assert f["risk_id"].startswith("risk_")
