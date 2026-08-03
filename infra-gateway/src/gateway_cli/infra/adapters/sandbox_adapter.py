from __future__ import annotations

import datetime
import uuid
from typing import Dict, List, Optional

from gateway_cli.features.sandbox_generator.types import CreateSandboxRequest, SandboxResponse


class MemorySandboxAdapter:
    def __init__(self) -> None:
        self._sandboxes: Dict[str, SandboxResponse] = {}

    def create_sandbox(self, request: CreateSandboxRequest) -> SandboxResponse:
        sandbox_id = f"sbx-{uuid.uuid4().hex[:7]}"
        namespace = f"sandbox-{sandbox_id}"
        created_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        response = SandboxResponse(
            sandbox_id=sandbox_id,
            name=request.name,
            status="active",
            namespace=namespace,
            isolated_network=request.isolated_network,
            mock_dependencies=request.mock_dependencies,
            created_at=created_at,
        )
        self._sandboxes[sandbox_id] = response
        return response

    def list_sandboxes(self) -> List[SandboxResponse]:
        return list(self._sandboxes.values())

    def get_sandbox(self, sandbox_id: str) -> Optional[SandboxResponse]:
        return self._sandboxes.get(sandbox_id)

    def destroy_sandbox(self, sandbox_id: str) -> bool:
        if sandbox_id in self._sandboxes:
            del self._sandboxes[sandbox_id]
            return True
        return False
