"""ECHO Serialization Utilities."""

import json
from datetime import date, datetime
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel


class EchoJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder handling datetimes, enums, sets, and Pydantic models."""

    def default(self, o: Any) -> Any:
        if isinstance(o, (datetime, date)):
            return o.isoformat()
        if isinstance(o, Enum):
            return o.value
        if isinstance(o, set):
            return list(o)
        if isinstance(o, BaseModel):
            return o.model_dump()
        return super().default(o)


def to_dict(obj: Any) -> Any:
    """Convert Pydantic model or arbitrary structure into clean dictionary."""
    if isinstance(obj, BaseModel):
        return obj.model_dump()
    if isinstance(obj, dict):
        return {k: to_dict(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [to_dict(i) for i in obj]
    if isinstance(obj, Enum):
        return obj.value
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    return obj


def to_json_str(data: Any, indent: Optional[int] = None) -> str:
    """Serialize data structure to JSON string using EchoJSONEncoder."""
    return json.dumps(data, cls=EchoJSONEncoder, indent=indent)


def from_json_str(data_str: str) -> Dict[str, Any]:
    """Parse JSON string into dictionary."""
    return json.loads(data_str)
