"""ECHO Source Schemas."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

from backend.app.utils.timestamps import utc_now


class SourceType(str, Enum):
    """Supported source acquisition adapters."""
    API = "API"
    WEB = "WEB"
    BROWSER = "BROWSER"
    FILE = "FILE"


class CollectionStatus(str, Enum):
    """Status of raw source collection."""
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    PENDING = "PENDING"
    SKIPPED = "SKIPPED"


class SourceRecord(BaseModel):
    """Raw collected source record adhering to Section 7 specification."""
    source_id: str = Field(..., description="Unique source identifier")
    source_name: str = Field(..., description="Name of source provider or portal")
    source_type: SourceType = Field(default=SourceType.WEB, description="Source acquisition channel")
    source_url: Optional[str] = Field(default=None, description="Original source URL")
    retrieved_at: datetime = Field(default_factory=utc_now, description="Timestamp when data was acquired")
    published_at: Optional[datetime] = Field(default=None, description="Published timestamp if reported by source")
    content_type: str = Field(default="text/html", description="MIME type or format of raw content")
    raw_reference: Optional[str] = Field(default=None, description="URI or path to raw payload store")
    raw_content: Optional[str] = Field(default=None, description="Inline raw content snippet or payload if small")
    collection_status: CollectionStatus = Field(default=CollectionStatus.SUCCESS, description="Collection status")
    reliability_score: Optional[float] = Field(default=None, description="Historical source reliability score")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Custom source metadata")
