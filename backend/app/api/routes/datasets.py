"""ECHO Dataset Ingestion and Inspection Endpoints."""

from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from backend.app.services.dataset_service import dataset_service

router = APIRouter(prefix="/datasets")


class IngestRequest(BaseModel):
    file_path: Optional[str] = Field(default=None, description="Optional custom path to dataset Excel file")
    limit: Optional[int] = Field(default=None, ge=1, description="Optional limit of rows to ingest for testing")


@router.get("/inspect")
async def inspect_dataset(
    file_path: Optional[str] = Query(default=None, description="Optional custom path to Excel file")
) -> Dict[str, Any]:
    """Inspect dataset workbook sheets and summary statistics without persisting."""
    try:
        return dataset_service.inspect_dataset(file_path=file_path)
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=404, detail=str(fnf))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to inspect dataset: {str(exc)}")


@router.post("/ingest")
async def ingest_dataset(request: IngestRequest = IngestRequest()) -> Dict[str, Any]:
    """Idempotently ingest the ECHO synthetic dataset into the database."""
    try:
        result = dataset_service.ingest_dataset(
            file_path=request.file_path,
            limit=request.limit,
        )
        return result
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=404, detail=str(fnf))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Ingestion failure: {str(exc)}")
