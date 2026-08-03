from __future__ import annotations

from typing import List, Optional, Protocol
from gateway_cli.features.sandbox_generator.types import CreateSandboxRequest, SandboxResponse


class SandboxPort(Protocol):
    def create_sandbox(self, request: CreateSandboxRequest) -> SandboxResponse:
        ...

    def list_sandboxes(self) -> List[SandboxResponse]:
        ...

    def get_sandbox(self, sandbox_id: str) -> Optional[SandboxResponse]:
        ...

    def destroy_sandbox(self, sandbox_id: str) -> bool:
        ...
