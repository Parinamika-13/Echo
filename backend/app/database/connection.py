"""ECHO Database Connection Management."""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from backend.app.core.config import settings
from backend.app.utils.serialization import to_json_str

# Engine configuration with dialect-specific settings
db_url = settings.effective_db_url
connect_args = {}
engine_kwargs = {
    "json_serializer": to_json_str,
    "echo": settings.DEBUG,
    "future": True,
}

if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    # PostgreSQL / production pool configuration
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20
    engine_kwargs["pool_pre_ping"] = True

engine = create_engine(
    db_url,
    connect_args=connect_args,
    **engine_kwargs,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,

    bind=engine,
    future=True,
)


def init_db() -> None:
    """Initialize database tables."""
    from backend.app.database.models import Base
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency for providing a transactional database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
