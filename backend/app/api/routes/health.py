"""Health Check API Route."""

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class HealthResponse(BaseModel):
    status: str = Field(default="healthy")
    service: str = Field(default="ECHO backend")


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """Return backend operational health status."""
    return HealthResponse(status="healthy", service="ECHO backend")
