from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class CreateSandboxRequest:
    name: str
    isolated_network: bool = True
    mock_dependencies: List[str] = field(default_factory=list)
    env_vars: Dict[str, str] = field(default_factory=dict)


@dataclass
class SandboxResponse:
    sandbox_id: str
    name: str
    status: str
    namespace: str
    isolated_network: bool
    mock_dependencies: List[str]
    created_at: str
