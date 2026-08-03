from __future__ import annotations

import argparse
from gateway_cli.features.sandbox_generator.index import SandboxService, CreateSandboxRequest
from gateway_cli.infra.adapters.docker_sandbox_adapter import DockerSandboxAdapter

_adapter = DockerSandboxAdapter()
_service = SandboxService(_adapter)


def run_sandbox_command(args: argparse.Namespace) -> None:
    if args.sandbox_action == "create":
        req = CreateSandboxRequest(
            name=args.name,
            isolated_network=not args.no_network,
            mock_dependencies=args.mock.split(",") if args.mock else []
        )
        res = _service.provision(req)
        print(f"[Sandbox Created] ID: {res.sandbox_id} | Name: {res.name} | Namespace: {res.namespace} | Status: {res.status}")
    elif args.sandbox_action == "list":
        sandboxes = _service.list_all()
        if not sandboxes:
            print("No active sandboxes found.")
        for sb in sandboxes:
            print(f"- {sb.sandbox_id} | {sb.name} | Namespace: {sb.namespace} | Status: {sb.status}")
    elif args.sandbox_action == "destroy":
        success = _service.terminate(args.sandbox_id)
        if success:
            print(f"[Sandbox Destroyed] ID: {args.sandbox_id}")
        else:
            print(f"[Error] Sandbox {args.sandbox_id} not found.")
