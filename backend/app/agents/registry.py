"""ECHO Agent Registry."""

import threading
from typing import Dict, List, Optional, Type

from backend.app.agents.base_agent import BaseAgent
from backend.app.schemas.agent import AgentMetadata


class AgentRegistry:
    """Thread-safe registry for discovering, inspecting, and retrieving ECHO agents."""

    _instance: Optional["AgentRegistry"] = None
    _lock = threading.Lock()

    def __init__(self):
        self._classes: Dict[str, Type[BaseAgent]] = {}
        self._instances: Dict[str, BaseAgent] = {}

    @classmethod
    def get_instance(cls) -> "AgentRegistry":
        """Return the singleton instance of AgentRegistry."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def register(self, agent_cls: Type[BaseAgent]) -> None:
        """Register an agent class by its agent_id."""
        agent_id = getattr(agent_cls, "agent_id", None)
        if not agent_id:
            raise ValueError(f"Cannot register agent {agent_cls.__name__} without agent_id.")
        self._classes[agent_id] = agent_cls

    def get_class(self, agent_id: str) -> Optional[Type[BaseAgent]]:
        """Retrieve the class for a given agent_id."""
        return self._classes.get(agent_id)

    def get_agent(self, agent_id: str) -> Optional[BaseAgent]:
        """Get or instantiate a singleton agent instance for the given agent_id."""
        if agent_id in self._instances:
            return self._instances[agent_id]

        cls = self._classes.get(agent_id)
        if cls is None:
            return None

        with self._lock:
            if agent_id not in self._instances:
                self._instances[agent_id] = cls()
            return self._instances[agent_id]

    def list_agents(self) -> List[AgentMetadata]:
        """Return metadata for all registered agents."""
        metadata_list: List[AgentMetadata] = []
        for agent_id in sorted(self._classes.keys()):
            instance = self.get_agent(agent_id)
            if instance:
                metadata_list.append(instance.get_metadata())
        return metadata_list

    def list_agent_ids(self) -> List[str]:
        """Return list of all registered agent IDs."""
        return sorted(list(self._classes.keys()))

    def clear(self) -> None:
        """Clear the registry (useful in tests)."""
        with self._lock:
            self._classes.clear()
            self._instances.clear()


registry = AgentRegistry.get_instance()
