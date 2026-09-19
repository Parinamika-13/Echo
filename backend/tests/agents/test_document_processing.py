"""Tests for Agent 03: PSA Document Processing Agent."""

import pytest
from backend.app.agents.base_agent import BaseAgent
from backend.app.agents.psa.document_processing_agent import PsaDocumentProcessingAgent
from backend.app.agents.registry import registry
from backend.app.schemas.agent import AgentExecutionStatus, AgentRequest, AgentResult


def test_document_processing_contract():
    agent = PsaDocumentProcessingAgent()
    assert isinstance(agent, BaseAgent)
    assert agent.agent_id == "ECHO-PSA-DOC"
    assert agent.version == "0.1.0"
    assert "ECHO-PSA-DOC" in registry.list_agent_ids()


def test_document_processing_html_execution():
    agent = PsaDocumentProcessingAgent()
    raw_html = "<html><head><title>Test Property Listing</title></head><body><h1>Prestige Falcon</h1><p>Price is 95 Lakhs. Area is 1200 sqft.</p></body></html>"
    req = AgentRequest(
        run_id="run_doc_01",
        agent_id="ECHO-PSA-DOC",
        parameters={"raw_content": raw_html},
    )
    res = agent.execute(req)
    assert res.success is True
    assert res.status == AgentExecutionStatus.SUCCESS
    assert "documents" in res.data
    assert "chunks" in res.data
    doc = res.data["documents"][0]
    assert doc["title"] == "Test Property Listing"
    assert "Prestige Falcon" in doc["text_content"]


def test_document_processing_invalid_input():
    agent = PsaDocumentProcessingAgent()
    req = AgentRequest(
        run_id="run_doc_err",
        agent_id="ECHO-PSA-DOC",
        parameters={},
    )
    res = agent.execute(req)
    assert res.success is False
    assert res.status == AgentExecutionStatus.FAILED
