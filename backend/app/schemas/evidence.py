"""ECHO Evidence and Provenance Schemas."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

from backend.app.utils.timestamps import utc_now


class DocumentFormat(str, Enum):
    """Document format classifications."""
    HTML = "HTML"
    PDF = "PDF"
    TEXT = "TEXT"
    JSON = "JSON"
    CSV = "CSV"
    IMAGE = "IMAGE"
    SCANNED = "SCANNED"


class DocumentRecord(BaseModel):
    """Processed document derived from raw source material."""
    document_id: str = Field(..., description="Unique document ID")
    source_id: str = Field(..., description="Parent source identifier")
    source_url: Optional[str] = Field(default=None, description="Original source URL")
    format: DocumentFormat = Field(default=DocumentFormat.HTML, description="Original document format")
    title: Optional[str] = Field(default=None, description="Extracted document title")
    text_content: Optional[str] = Field(default=None, description="Full normalized plain text")
    language: str = Field(default="en", description="Detected language code")
    created_at: datetime = Field(default_factory=utc_now, description="Processing timestamp")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Document metadata")


class ExtractedChunk(BaseModel):
    """Segmented chunk of document content preserving source provenance."""
    chunk_id: str = Field(..., description="Unique chunk ID")
    document_id: str = Field(..., description="Parent document ID")
    source_id: str = Field(..., description="Original source ID")
    source_url: Optional[str] = Field(default=None, description="Original source URL")
    content: str = Field(..., description="Extracted text chunk")
    chunk_index: int = Field(default=0, description="Sequential index within document")
    section: Optional[str] = Field(default=None, description="Section heading or layout label")
    page_number: Optional[int] = Field(default=None, description="Page number for paginated docs")
    confidence: Optional[float] = Field(default=None, description="Extraction confidence score")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class EvidenceRecord(BaseModel):
    """Discrete evidentiary atomic fact supporting extracted property attributes or signals."""
    evidence_id: str = Field(..., description="Unique evidence ID")
    source_id: str = Field(..., description="Source ID of origin")
    document_id: Optional[str] = Field(default=None, description="Document ID of origin")
    chunk_id: Optional[str] = Field(default=None, description="Chunk ID of origin")
    source_url: Optional[str] = Field(default=None, description="URL of origin")
    field_name: Optional[str] = Field(default=None, description="Property or signal field supported")
    extracted_value: Any = Field(default=None, description="Value extracted from evidence")
    context_snippet: Optional[str] = Field(default=None, description="Verbatim text context supporting the value")
    retrieved_at: datetime = Field(default_factory=utc_now, description="When evidence was acquired")
    confidence: Optional[float] = Field(default=None, description="Evidentiary certainty rating")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ProvenanceRecord(BaseModel):
    """Complete audit provenance trail for any critical data point in ECHO."""
    source_id: str = Field(..., description="Origin source ID")
    source_url: Optional[str] = Field(default=None, description="Origin URL")
    source_timestamp: Optional[datetime] = Field(default=None, description="Timestamp recorded by source")
    retrieved_at: datetime = Field(default_factory=utc_now, description="Acquisition timestamp")
    agent_id: str = Field(..., description="Agent that produced the record")
    agent_version: str = Field(default="0.1.0", description="Agent version")
    run_id: str = Field(..., description="Pipeline execution run ID")
    evidence_id: Optional[str] = Field(default=None, description="Linked evidence ID")
