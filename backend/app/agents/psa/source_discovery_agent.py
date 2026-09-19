"""ECHO Agent 02: PSA Source Discovery & Collection Agent."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

from backend.app.agents.base_agent import BaseAgent
from backend.app.schemas.agent import (
    AgentExecutionStatus,
    AgentRequest,
    AgentResult,
)
from backend.app.schemas.source import (
    CollectionStatus,
    SourceRecord,
    SourceType,
)
from backend.app.utils.ids import generate_source_id
from backend.app.utils.timestamps import utc_now


class SourceAdapter(ABC):
    """Abstract adapter for retrieving source material across diverse transport protocols."""

    @abstractmethod
    def collect(self, target: str, options: Optional[Dict[str, Any]] = None) -> SourceRecord:
        """Acquire source record from target identifier or URL."""
        pass


class WebSourceAdapter(SourceAdapter):
    """Baseline adapter for web URLs (returns registered source record for processing)."""

    def collect(self, target: str, options: Optional[Dict[str, Any]] = None) -> SourceRecord:
        parsed = urlparse(target)
        domain = parsed.netloc or "web_source"
        source_id = generate_source_id(source_name=domain, source_url=target)
        raw_content = (options or {}).get("raw_content")

        return SourceRecord(
            source_id=source_id,
            source_name=domain,
            source_type=SourceType.WEB,
            source_url=target,
            retrieved_at=utc_now(),
            content_type="text/html",
            raw_content=raw_content,
            collection_status=CollectionStatus.SUCCESS if (raw_content or target) else CollectionStatus.PENDING,
            metadata={"adapter": "WebSourceAdapter", "scheme": parsed.scheme},
        )


class ApiSourceAdapter(SourceAdapter):
    """Adapter for structured REST/JSON API endpoints."""

    def collect(self, target: str, options: Optional[Dict[str, Any]] = None) -> SourceRecord:
        source_id = generate_source_id(source_name="api_endpoint", source_url=target)
        return SourceRecord(
            source_id=source_id,
            source_name="API Endpoint",
            source_type=SourceType.API,
            source_url=target,
            retrieved_at=utc_now(),
            content_type="application/json",
            collection_status=CollectionStatus.SUCCESS,
            metadata={"adapter": "ApiSourceAdapter"},
        )


class BrowserSourceAdapter(SourceAdapter):
    """Placeholder adapter for future headless browser crawling (e.g. Playwright / Selenium)."""

    def collect(self, target: str, options: Optional[Dict[str, Any]] = None) -> SourceRecord:
        source_id = generate_source_id(source_name="browser_automation", source_url=target)
        return SourceRecord(
            source_id=source_id,
            source_name="Browser Automation",
            source_type=SourceType.BROWSER,
            source_url=target,
            retrieved_at=utc_now(),
            content_type="text/html",
            collection_status=CollectionStatus.SKIPPED,
            metadata={
                "adapter": "BrowserSourceAdapter",
                "status": "NOT_IMPLEMENTED",
                "message": "Headless browser scraping will be enabled in subsequent phase.",
            },
        )


class FileSourceAdapter(SourceAdapter):
    """Adapter for local or staging file ingestion."""

    def collect(self, target: str, options: Optional[Dict[str, Any]] = None) -> SourceRecord:
        source_id = generate_source_id(source_name="local_file", source_url=target)
        return SourceRecord(
            source_id=source_id,
            source_name="Local File",
            source_type=SourceType.FILE,
            source_url=target,
            retrieved_at=utc_now(),
            content_type="application/octet-stream",
            collection_status=CollectionStatus.SUCCESS,
            metadata={"adapter": "FileSourceAdapter", "file_path": target},
        )


class PsaSourceDiscoveryAgent(BaseAgent):
    """Agent 02: Responsible for discovering and registering raw sources."""

    agent_id: str = "ECHO-PSA-SOURCE"
    name: str = "PSA Source Discovery & Collection Agent"
    version: str = "0.1.0"
    description: str = (
        "Discovers, registers, and collects raw source materials from web URLs, "
        "APIs, files, and external registries with full acquisition provenance."
    )
    capabilities: List[str] = [
        "source_registration",
        "url_discovery",
        "web_collection",
        "api_collection",
        "file_collection",
    ]

    def __init__(self):
        super().__init__()
        self._adapters: Dict[SourceType, SourceAdapter] = {
            SourceType.WEB: WebSourceAdapter(),
            SourceType.API: ApiSourceAdapter(),
            SourceType.BROWSER: BrowserSourceAdapter(),
            SourceType.FILE: FileSourceAdapter(),
        }

    def validate_input(self, request: AgentRequest) -> bool:
        if not super().validate_input(request):
            return False
        params = request.parameters
        # Needs at least one target source URL, query, or file
        if not (params.get("source_urls") or params.get("sources") or params.get("query") or params.get("raw_content")):
            # It's valid if context has sources from previous run
            if not request.context.get("sources"):
                return False
        return True

    def _run(self, request: AgentRequest) -> AgentResult:
        urls: List[str] = request.parameters.get("source_urls", [])
        raw_sources: List[Dict[str, Any]] = request.parameters.get("sources", [])
        raw_content: Optional[str] = request.parameters.get("raw_content")
        collected_sources: List[Dict[str, Any]] = []
        warnings: List[str] = []

        # Process explicit source URLs
        for url in urls:
            adapter = self._adapters[SourceType.WEB]
            record = adapter.collect(url, options={"raw_content": raw_content})
            collected_sources.append(record.model_dump())

        # Process pre-configured source objects
        for src in raw_sources:
            s_type = SourceType(src.get("source_type", SourceType.WEB.value))
            adapter = self._adapters.get(s_type, self._adapters[SourceType.WEB])
            target = src.get("source_url") or src.get("target") or "unknown_target"
            record = adapter.collect(target, options=src)
            collected_sources.append(record.model_dump())

        # If only raw content provided without URL, create ad-hoc source
        if not collected_sources and raw_content:
            adhoc_id = generate_source_id("inline_payload")
            record = SourceRecord(
                source_id=adhoc_id,
                source_name="Direct Input Payload",
                source_type=SourceType.FILE,
                content_type="text/plain",
                raw_content=raw_content,
                collection_status=CollectionStatus.SUCCESS,
                metadata={"source": "direct_input"},
            )
            collected_sources.append(record.model_dump())

        if not collected_sources:
            warnings.append("No source targets were resolved or acquired.")
            return AgentResult(
                success=True,
                status=AgentExecutionStatus.PARTIAL_SUCCESS,
                agent_id=self.agent_id,
                agent_version=self.version,
                run_id=request.run_id,
                data={"sources": [], "total_collected": 0},
                warnings=warnings,
            )

        return AgentResult(
            success=True,
            status=AgentExecutionStatus.SUCCESS,
            agent_id=self.agent_id,
            agent_version=self.version,
            run_id=request.run_id,
            data={"sources": collected_sources, "total_collected": len(collected_sources)},
            warnings=warnings,
            metadata={"collector": "PsaSourceDiscoveryAgent"},
        )
