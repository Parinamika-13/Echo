"""ECHO Agent 03: PSA Document Processing Agent."""

import re
import uuid
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from backend.app.agents.base_agent import BaseAgent
from backend.app.schemas.agent import (
    AgentExecutionStatus,
    AgentRequest,
    AgentResult,
)
from backend.app.schemas.evidence import (
    DocumentFormat,
    DocumentRecord,
    ExtractedChunk,
)
from backend.app.utils.timestamps import utc_now


class DocumentProcessor(ABC):
    """Abstract interface for parsing and extracting clean text from format-specific payloads."""

    @abstractmethod
    def process(self, raw_data: str, source_id: str, source_url: Optional[str] = None) -> DocumentRecord:
        pass


class HtmlProcessor(DocumentProcessor):
    """Baseline HTML sanitizer extracting plain text and basic headings."""

    def process(self, raw_data: str, source_id: str, source_url: Optional[str] = None) -> DocumentRecord:
        # Strip script and style blocks
        clean_text = re.sub(r"<(script|style).*?</\1>", "", raw_data, flags=re.DOTALL | re.IGNORECASE)
        # Extract title if present
        title_match = re.search(r"<title>(.*?)</title>", clean_text, flags=re.IGNORECASE)
        title = title_match.group(1).strip() if title_match else "Parsed HTML Document"
        # Strip HTML tags
        text = re.sub(r"<[^>]+>", " ", clean_text)
        # Normalize whitespace
        text = re.sub(r"\s+", " ", text).strip()

        doc_id = f"doc_{uuid.uuid4().hex[:12]}"
        return DocumentRecord(
            document_id=doc_id,
            source_id=source_id,
            source_url=source_url,
            format=DocumentFormat.HTML,
            title=title,
            text_content=text,
            language="en",
            created_at=utc_now(),
            metadata={"processor": "HtmlProcessor"},
        )


class TextProcessor(DocumentProcessor):
    """Baseline plain text processor."""

    def process(self, raw_data: str, source_id: str, source_url: Optional[str] = None) -> DocumentRecord:
        doc_id = f"doc_{uuid.uuid4().hex[:12]}"
        return DocumentRecord(
            document_id=doc_id,
            source_id=source_id,
            source_url=source_url,
            format=DocumentFormat.TEXT,
            title="Text Document",
            text_content=raw_data.strip(),
            language="en",
            created_at=utc_now(),
            metadata={"processor": "TextProcessor"},
        )


class PdfProcessor(DocumentProcessor):
    """Placeholder interface for PDF parsing."""

    def process(self, raw_data: str, source_id: str, source_url: Optional[str] = None) -> DocumentRecord:
        doc_id = f"doc_{uuid.uuid4().hex[:12]}"
        return DocumentRecord(
            document_id=doc_id,
            source_id=source_id,
            source_url=source_url,
            format=DocumentFormat.PDF,
            title="PDF Document",
            text_content="",
            metadata={
                "processor": "PdfProcessor",
                "status": "NOT_IMPLEMENTED",
                "message": "Full PDF visual/table extraction will be enabled in subsequent phase.",
            },
        )


class OcrProcessor(DocumentProcessor):
    """Placeholder interface for OCR scanned document processing."""

    def process(self, raw_data: str, source_id: str, source_url: Optional[str] = None) -> DocumentRecord:
        doc_id = f"doc_{uuid.uuid4().hex[:12]}"
        return DocumentRecord(
            document_id=doc_id,
            source_id=source_id,
            source_url=source_url,
            format=DocumentFormat.IMAGE,
            title="Scanned Image Document",
            text_content="",
            metadata={
                "processor": "OcrProcessor",
                "status": "NOT_IMPLEMENTED",
                "message": "OCR engine integration will be enabled in subsequent phase.",
            },
        )


class PsaDocumentProcessingAgent(BaseAgent):
    """Agent 03: Responsible for processing raw source contents into structured documents and chunks."""

    agent_id: str = "ECHO-PSA-DOC"
    name: str = "PSA Document Processing Agent"
    version: str = "0.1.0"
    description: str = (
        "Parses, extracts, and segments text from raw HTML, text, and documents "
        "preserving the provenance chain (SOURCE -> DOCUMENT -> CHUNK)."
    )
    capabilities: List[str] = [
        "html_parsing",
        "text_normalization",
        "document_segmentation",
        "provenance_preservation",
    ]

    def __init__(self):
        super().__init__()
        self._html_processor = HtmlProcessor()
        self._text_processor = TextProcessor()
        self._pdf_processor = PdfProcessor()
        self._ocr_processor = OcrProcessor()

    def validate_input(self, request: AgentRequest) -> bool:
        if not super().validate_input(request):
            return False
        # Needs sources either in parameters, context, or raw_content
        sources = request.parameters.get("sources") or request.context.get("sources")
        raw_content = request.parameters.get("raw_content") or request.context.get("raw_content")
        return bool(sources or raw_content)

    def _run(self, request: AgentRequest) -> AgentResult:
        sources: List[Dict[str, Any]] = (
            request.parameters.get("sources")
            or request.context.get("sources", [])
        )
        raw_content = request.parameters.get("raw_content") or request.context.get("raw_content")

        processed_docs: List[Dict[str, Any]] = []
        extracted_chunks: List[Dict[str, Any]] = []

        # If sources list is empty but raw content exists, synthesize an ad-hoc source
        if not sources and raw_content:
            sources = [{
                "source_id": f"src_adhoc_{request.run_id[:8]}",
                "source_url": None,
                "raw_content": raw_content,
                "content_type": "text/html" if ("<html" in raw_content or "<div" in raw_content) else "text/plain",
            }]

        for src in sources:
            source_id = src.get("source_id", f"src_{uuid.uuid4().hex[:8]}")
            source_url = src.get("source_url")
            content = src.get("raw_content") or raw_content or ""
            c_type = src.get("content_type", "text/html")

            if "html" in c_type:
                doc = self._html_processor.process(content, source_id=source_id, source_url=source_url)
            elif "pdf" in c_type:
                doc = self._pdf_processor.process(content, source_id=source_id, source_url=source_url)
            elif "image" in c_type:
                doc = self._ocr_processor.process(content, source_id=source_id, source_url=source_url)
            else:
                doc = self._text_processor.process(content, source_id=source_id, source_url=source_url)

            processed_docs.append(doc.model_dump())

            # Perform deterministic chunk segmentation (splitting text into paragraph/sentence blocks)
            text = doc.text_content or ""
            paragraphs = [p.strip() for p in re.split(r"\n\s*\n|\.\s+", text) if p.strip()]

            for idx, p in enumerate(paragraphs):
                chunk = ExtractedChunk(
                    chunk_id=f"chk_{uuid.uuid4().hex[:12]}",
                    document_id=doc.document_id,
                    source_id=source_id,
                    source_url=source_url,
                    content=p,
                    chunk_index=idx,
                )
                extracted_chunks.append(chunk.model_dump())

        return AgentResult(
            success=True,
            status=AgentExecutionStatus.SUCCESS,
            agent_id=self.agent_id,
            agent_version=self.version,
            run_id=request.run_id,
            data={
                "documents": processed_docs,
                "chunks": extracted_chunks,
                "total_documents": len(processed_docs),
                "total_chunks": len(extracted_chunks),
            },
            evidence=[{"source_id": d["source_id"], "document_id": d["document_id"]} for d in processed_docs],
            metadata={"processor": "PsaDocumentProcessingAgent"},
        )
