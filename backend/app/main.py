"""ECHO Multi-Agent Financial & Real-Estate Intelligence Platform - FastAPI Main."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.agents import register_all_agents
from backend.app.api.routes import api_router
from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.database.connection import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for initialization and graceful shutdown."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} ({settings.ENVIRONMENT})")
    # Initialize database schema
    init_db()
    # Ensure all 11 agents are registered
    register_all_agents()
    logger.info("Database schema initialized and all 11 agents registered.")
    yield
    logger.info("Shutting down ECHO Intelligence Platform.")


def create_app() -> FastAPI:
    """FastAPI Application Factory."""
    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "ECHO is an AI-powered financial and real-estate intelligence platform "
            "transforming fragmented real-estate and financial information into structured, "
            "explainable, traceable intelligence via coordinated multi-agent pipelines."
        ),
        lifespan=lifespan,
    )

    # CORS Middleware allowing local frontend communication
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Permits React/Vite development server
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount routes at root level (as specified in technology requirements)
    application.include_router(api_router)

    # Also mount under API_PREFIX for standard REST versioning
    if settings.API_PREFIX:
        application.include_router(api_router, prefix=settings.API_PREFIX)

    return application


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
