"""ECHO API Route Handlers."""

from fastapi import APIRouter
from backend.app.api.routes.health import router as health_router
from backend.app.api.routes.agents import router as agents_router
from backend.app.api.routes.investigations import router as investigations_router
from backend.app.api.routes.datasets import router as datasets_router
from backend.app.api.routes.properties import router as properties_router
from backend.app.api.routes.signals import router as signals_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(agents_router, tags=["Agents"])
api_router.include_router(investigations_router, tags=["Investigations"])
api_router.include_router(datasets_router, tags=["Datasets"])
api_router.include_router(properties_router, tags=["Properties"])
api_router.include_router(signals_router, tags=["Signals"])

__all__ = ["api_router"]

