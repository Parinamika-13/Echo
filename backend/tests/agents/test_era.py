"""Tests for Agent 07: ERA — Real Estate Analysis Agent."""

import pytest
from backend.app.agents.base_agent import BaseAgent
from backend.app.agents.era_agent import EraAgent
from backend.app.agents.registry import registry
from backend.app.schemas.agent import AgentExecutionStatus, AgentRequest, AgentResult


def test_era_contract():
    agent = EraAgent()
    assert isinstance(agent, BaseAgent)
    assert agent.agent_id == "ECHO-ERA"
    assert agent.version == "0.1.0"
    assert "ECHO-ERA" in registry.list_agent_ids()


def test_era_metrics_computation():
    agent = EraAgent()
    prop_data = {
        "property_id": "ent_era_01",
        "financials": {"price": 12000000.0, "rental_price": 40000.0},
        "specs": {"area": 1500.0, "bedrooms": 3.0},
    }
    req = AgentRequest(
        run_id="run_era_01",
        agent_id="ECHO-ERA",
        parameters={"property": prop_data},
    )
    res = agent.execute(req)
    assert res.success is True
    assert res.status == AgentExecutionStatus.SUCCESS
    analyses = res.data["analyses"]
    assert len(analyses) == 1
    analysis = analyses[0]
    # Check price per sqft: 12,000,000 / 1500 = 8000
    sqft_metric = analysis["price_per_sqft"]
    assert sqft_metric["value"] == 8000.0
    assert sqft_metric["unit"] == "INR/sqft"
    assert len(sqft_metric["assumptions"]) > 0

    # Check rental yield: (40,000 * 12) / 12,000,000 * 100 = 4.0%
    yield_metric = analysis["rental_yield"]
    assert yield_metric["value"] == 4.0
    assert yield_metric["unit"] == "%"


def test_era_missing_rental_data_not_faked():
    agent = EraAgent()
    prop_data = {
        "property_id": "ent_era_02",
        "financials": {"price": 10000000.0},  # No rental price
        "specs": {"area": 1000.0},
    }
    req = AgentRequest(
        run_id="run_era_02",
        agent_id="ECHO-ERA",
        parameters={"property": prop_data},
    )
    res = agent.execute(req)
    assert res.success is True
    yield_metric = res.data["analyses"][0]["rental_yield"]
    # Explicitly verify we did NOT fabricate a fake rental yield
    assert yield_metric["value"] is None
    assert yield_metric["calculation_method"] == "NOT_CALCULATED"
