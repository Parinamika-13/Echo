"""Investigations API Routes."""

from fastapi import APIRouter, HTTPException, status

from backend.app.schemas.investigation import (
    InvestigationRequest,
    InvestigationResult,
)
from backend.app.services.investigation_service import investigation_service

router = APIRouter()


@router.post(
    "/investigations",
    response_model=InvestigationResult,
    status_code=status.HTTP_201_CREATED,
)
def create_investigation(request: InvestigationRequest) -> InvestigationResult:
    """Trigger a new coordinated multi-agent investigation pipeline."""
    return investigation_service.create_and_execute(request)


@router.get(
    "/investigations/{run_id}",
    response_model=InvestigationResult,
)
def get_investigation_status(run_id: str) -> InvestigationResult:
    """Retrieve the current state and results for an existing investigation run."""
    result = investigation_service.get_investigation(run_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Investigation run with ID '{run_id}' not found.",
        )
    return result
