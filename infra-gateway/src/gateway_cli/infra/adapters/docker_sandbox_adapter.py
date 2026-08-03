from __future__ import annotations

import datetime
import json
import os
import subprocess
import uuid
from typing import Dict, List, Optional

from gateway_cli.features.sandbox_generator.types import CreateSandboxRequest, SandboxResponse


class DockerSandboxAdapter:
    """Real infrastructure adapter using Docker networks and containers with state file persistence."""

    STATE_FILE = os.path.expanduser("~/.gateway_sandbox_state.json")
    MOCK_IMAGES = {
        "redis": "redis:7-alpine",
        "postgres": "postgres:15-alpine",
        "nginx": "nginx:alpine",
    }

    def __init__(self) -> None:
        self._sandboxes: Dict[str, SandboxResponse] = self._load_state()

    def _load_state(self) -> Dict[str, SandboxResponse]:
        if not os.path.exists(self.STATE_FILE):
            return {}
        try:
            with open(self.STATE_FILE, "r") as f:
                data = json.load(f)
                return {k: SandboxResponse(**v) for k, v in data.items()}
        except Exception:
            return {}

    def _save_state(self) -> None:
        with open(self.STATE_FILE, "w") as f:
            data = {k: v.__dict__ for k, v in self._sandboxes.items()}
            json.dump(data, f, indent=2)

    def create_sandbox(self, request: CreateSandboxRequest) -> SandboxResponse:
        sandbox_id = f"sbx-{uuid.uuid4().hex[:7]}"
        network_name = f"net-{sandbox_id}"
        created_at = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # 1. Create Docker network if isolated_network is enabled
        if request.isolated_network:
            subprocess.run(
                ["docker", "network", "create", network_name],
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )

        # 2. Spin up mock dependency containers attached to the network
        container_ids: List[str] = []
        for mock_name in request.mock_dependencies:
            image = self.MOCK_IMAGES.get(mock_name.lower(), "alpine:latest")
            container_name = f"{sandbox_id}-{mock_name}"
            
            cmd = ["docker", "run", "-d", "--name", container_name]
            if request.isolated_network:
                cmd.extend(["--network", network_name])
            if mock_name.lower() == "postgres":
                cmd.extend(["-e", "POSTGRES_PASSWORD=postgres"])
            cmd.append(image)

            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if res.returncode == 0:
                container_ids.append(container_name)

        response = SandboxResponse(
            sandbox_id=sandbox_id,
            name=request.name,
            status="active",
            namespace=network_name if request.isolated_network else "default",
            isolated_network=request.isolated_network,
            mock_dependencies=request.mock_dependencies,
            created_at=created_at,
        )
        self._sandboxes[sandbox_id] = response
        self._save_state()
        return response

    def list_sandboxes(self) -> List[SandboxResponse]:
        return list(self._sandboxes.values())

    def get_sandbox(self, sandbox_id: str) -> Optional[SandboxResponse]:
        return self._sandboxes.get(sandbox_id)

    def destroy_sandbox(self, sandbox_id: str) -> bool:
        sb = self._sandboxes.get(sandbox_id)
        if not sb:
            return False

        # 1. Stop and remove dependency containers
        for mock_name in sb.mock_dependencies:
            container_name = f"{sandbox_id}-{mock_name}"
            subprocess.run(["docker", "rm", "-f", container_name], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        # 2. Remove Docker isolated network
        if sb.isolated_network and sb.namespace.startswith("net-"):
            subprocess.run(["docker", "network", "rm", sb.namespace], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        del self._sandboxes[sandbox_id]
        self._save_state()
        return True
