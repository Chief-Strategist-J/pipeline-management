from __future__ import annotations

from typing import List, Optional
from gateway_cli.features.sandbox_generator.types import CreateSandboxRequest, SandboxResponse
from gateway_cli.shared.ports.sandbox_port import SandboxPort


class SandboxService:
    def __init__(self, port: SandboxPort) -> None:
        self._port = port

    def provision(self, request: CreateSandboxRequest) -> SandboxResponse:
        return self._port.create_sandbox(request)

    def list_all(self) -> List[SandboxResponse]:
        return self._port.list_sandboxes()

    def get_by_id(self, sandbox_id: str) -> Optional[SandboxResponse]:
        return self._port.get_sandbox(sandbox_id)

    def terminate(self, sandbox_id: str) -> bool:
        return self._port.destroy_sandbox(sandbox_id)
