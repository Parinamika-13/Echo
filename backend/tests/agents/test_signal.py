"""Tests for Agent 06: Signal Classification & Signal Minting Agent."""

import pytest
from backend.app.agents.base_agent import BaseAgent
from backend.app.agents.registry import registry
from backend.app.agents.signal_agent import SignalAgent
from backend.app.schemas.agent import AgentExecutionStatus, AgentRequest, AgentResult


def test_signal_agent_contract():
    agent = SignalAgent()
    assert isinstance(agent, BaseAgent)
    assert agent.agent_id == "ECHO-SIGNAL"
    assert agent.version == "0.1.0"
    assert "ECHO-SIGNAL" in registry.list_agent_ids()


def test_signal_minting_price_drop():
    agent = SignalAgent()
    req = AgentRequest(
        run_id="run_sig_01",
        agent_id="ECHO-SIGNAL",
        parameters={
            "changes": [
                {
                    "entity_id": "ent_test_01",
                    "field": "price",
                    "old_value": 15000000.0,
                    "new_value": 14000000.0,
                    "source_id": "src_99acres",
                }
            ]
        },
    )
    res = agent.execute(req)
    assert res.success is True
    assert res.status == AgentExecutionStatus.SUCCESS
    signals = res.data["signals"]
    assert len(signals) == 1
    assert signals[0]["signal_type"] == "PRICE_DROP"
    assert signals[0]["signal_id"].startswith("sig_")


def test_signal_agent_no_duplicates():
    agent = SignalAgent()
    change = {
        "entity_id": "ent_test_01",
        "field": "price",
        "old_value": 15000000.0,
        "new_value": 14000000.0,
    }
    req = AgentRequest(
        run_id="run_sig_dup",
        agent_id="ECHO-SIGNAL",
        parameters={"changes": [change, change]},  # Duplicated change
    )
    res = agent.execute(req)
    assert res.success is True
    # Should deduplicate to 1 minted signal
    assert len(res.data["signals"]) == 1
