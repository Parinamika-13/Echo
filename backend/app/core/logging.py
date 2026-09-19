"""ECHO Structured Logging."""

import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any, Dict, Optional


class JSONLogFormatter(logging.Formatter):
    """Custom formatter that outputs JSON log records for structured observability."""

    def format(self, record: logging.LogRecord) -> str:
        log_payload: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Include structured extra fields if provided
        for attr in ("run_id", "agent_id", "agent_version", "event", "duration_ms", "status", "extra_data"):
            if hasattr(record, attr):
                log_payload[attr] = getattr(record, attr)

        if record.exc_info:
            log_payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_payload, default=str)


def setup_logging(log_level: str = "INFO", json_format: bool = False) -> logging.Logger:
    """Configure and return root logger for ECHO."""
    logger = logging.getLogger("echo")
    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    logger.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    if json_format:
        handler.setFormatter(JSONLogFormatter())
    else:
        handler.setFormatter(
            logging.Formatter("[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s")
        )

    logger.addHandler(handler)
    return logger


def log_agent_event(
    logger: logging.Logger,
    event: str,
    agent_id: str,
    agent_version: str,
    run_id: str,
    status: str,
    duration_ms: Optional[float] = None,
    extra_data: Optional[Dict[str, Any]] = None,
    level: int = logging.INFO,
) -> None:
    """Helper to emit structured log for agent lifecycle events."""
    extra = {
        "event": event,
        "agent_id": agent_id,
        "agent_version": agent_version,
        "run_id": run_id,
        "status": status,
        "duration_ms": duration_ms,
        "extra_data": extra_data or {},
    }
    msg = f"Agent {agent_id} ({agent_version}) - {event} [{status}] run_id={run_id}"
    if duration_ms is not None:
        msg += f" duration={duration_ms:.2f}ms"
    logger.log(level, msg, extra=extra)


logger = setup_logging()
