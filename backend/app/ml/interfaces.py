"""ECHO Machine Learning and Predictive Model Interfaces."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class ExtractionModel(ABC):
    """Interface for text information extraction models (e.g. GLiNER, IndicBERT, LLM)."""

    @abstractmethod
    def extract_entities(self, text: str) -> Dict[str, Any]:
        pass


class ClassificationModel(ABC):
    """Interface for classification models (e.g. signal classification, document categorization)."""

    @abstractmethod
    def classify(self, features: Dict[str, Any]) -> Dict[str, Any]:
        pass


class EmbeddingModel(ABC):
    """Interface for dense vector representation models."""

    @abstractmethod
    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        pass


class RiskModel(ABC):
    """Interface for risk scoring and anomaly detection models (e.g. Isolation Forest)."""

    @abstractmethod
    def score_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        pass


class PredictionModel(ABC):
    """Interface for predictive analytics models (e.g. price trends, yield forecasting)."""

    @abstractmethod
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        pass
