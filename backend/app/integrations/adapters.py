"""ECHO External Service Integration Interfaces."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class BaseScrapingService(ABC):
    """Abstract interface for web scraping and raw HTML retrieval."""

    @abstractmethod
    def fetch_url(self, url: str, timeout: int = 30) -> Dict[str, Any]:
        pass


class BaseLLMService(ABC):
    """Abstract interface for future LLM integration."""

    @abstractmethod
    def generate_completion(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        pass

    @abstractmethod
    def extract_structured_json(self, text: str, schema: Dict[str, Any]) -> Dict[str, Any]:
        pass


class BaseEmbeddingService(ABC):
    """Abstract interface for text embedding generation."""

    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        pass

    @abstractmethod
    def embed_documents(self, documents: List[str]) -> List[List[float]]:
        pass


class BaseGeocodingService(ABC):
    """Abstract interface for geospatial address resolution."""

    @abstractmethod
    def geocode_address(self, address: str) -> Optional[Dict[str, float]]:
        pass


class BaseStorageService(ABC):
    """Abstract interface for raw document and artifact persistence."""

    @abstractmethod
    def store_raw(self, key: str, data: bytes, content_type: str) -> str:
        pass

    @abstractmethod
    def retrieve_raw(self, key: str) -> Optional[bytes]:
        pass
