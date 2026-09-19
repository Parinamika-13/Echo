"""ECHO Multi-Agent System Core Package."""

from backend.app.agents.base_agent import BaseAgent
from backend.app.agents.era_agent import EraAgent
from backend.app.agents.isdaa_agent import IsdaaAgent
from backend.app.agents.orchestrator_agent import EchoOrchestratorAgent
from backend.app.agents.psa.document_processing_agent import PsaDocumentProcessingAgent
from backend.app.agents.psa.entity_resolution_agent import PsaEntityResolutionAgent
from backend.app.agents.psa.property_extraction_agent import PsaPropertyExtractionAgent
from backend.app.agents.psa.source_discovery_agent import PsaSourceDiscoveryAgent
from backend.app.agents.registry import AgentRegistry, registry
from backend.app.agents.rsa_agent import RsaAgent
from backend.app.agents.signal_agent import SignalAgent
from backend.app.agents.ssr_agent import SsrAgent
from backend.app.agents.svea_agent import SveaAgent

ALL_AGENT_CLASSES = [
    EchoOrchestratorAgent,
    PsaSourceDiscoveryAgent,
    PsaDocumentProcessingAgent,
    PsaPropertyExtractionAgent,
    PsaEntityResolutionAgent,
    SignalAgent,
    EraAgent,
    IsdaaAgent,
    SveaAgent,
    RsaAgent,
    SsrAgent,
]


def register_all_agents(target_registry: AgentRegistry = registry) -> None:
    """Register all 11 ECHO primary agents in the provided registry."""
    for agent_cls in ALL_AGENT_CLASSES:
        target_registry.register(agent_cls)


# Automatically populate registry on package load
register_all_agents()

__all__ = [
    "ALL_AGENT_CLASSES",
    "AgentRegistry",
    "BaseAgent",
    "EchoOrchestratorAgent",
    "EraAgent",
    "IsdaaAgent",
    "PsaDocumentProcessingAgent",
    "PsaEntityResolutionAgent",
    "PsaPropertyExtractionAgent",
    "PsaSourceDiscoveryAgent",
    "RsaAgent",
    "SignalAgent",
    "SsrAgent",
    "SveaAgent",
    "register_all_agents",
    "registry",
]
