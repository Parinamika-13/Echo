"""ECHO Timestamp Utilities."""

from datetime import datetime, timezone
from typing import Optional


def utc_now() -> datetime:
    """Return current timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)


def utc_iso() -> str:
    """Return current UTC timestamp formatted as ISO 8601 string."""
    return utc_now().isoformat()


def to_iso(dt: Optional[datetime]) -> Optional[str]:
    """Convert datetime to ISO 8601 string with UTC normalization."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


def parse_iso(iso_string: str) -> datetime:
    """Parse ISO 8601 timestamp string into timezone-aware datetime."""
    dt = datetime.fromisoformat(iso_string)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def duration_ms(start_time: datetime, end_time: Optional[datetime] = None) -> float:
    """Calculate duration in milliseconds between two datetimes."""
    end = end_time or utc_now()
    return max(0.0, (end - start_time).total_seconds() * 1000.0)
