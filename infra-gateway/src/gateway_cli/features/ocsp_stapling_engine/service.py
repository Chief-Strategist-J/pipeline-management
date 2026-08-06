from __future__ import annotations

from gateway_cli.features.ocsp_stapling_engine.types import (
    OCSPCompileResult,
    OCSPStaplingPolicy,
)
from gateway_cli.shared.ports.ocsp_stapling_port import OCSPStaplingPort


class _NginxDirectiveCompiler:

    def compile(self, policy: OCSPStaplingPolicy) -> OCSPCompileResult:
        if not policy.enabled:
            return OCSPCompileResult(proxy_target="nginx", directives="", enabled=False)

        lines = [
            "ssl_stapling on;",
        ]

        if policy.verify:
            lines.append("ssl_stapling_verify on;")

        nameservers = " ".join(policy.resolver.nameservers)
        valid = policy.resolver.valid_duration
        lines.append(f"resolver {nameservers} valid={valid};")
        lines.append(f"resolver_timeout {policy.resolver.timeout};")

        if policy.cache.type == "shared":
            zone_name = policy.cache.shared_zone_name
            zone_size = policy.cache.shared_zone_size
            lines.append(f"ssl_ocsp_cache shared:{zone_name}:{zone_size};")

        if policy.responder.override_url:
            lines.append(f"ssl_stapling_responder {policy.responder.override_url};")

        if policy.responder.trusted_certificate:
            lines.append(f"ssl_trusted_certificate {policy.responder.trusted_certificate};")

        directives = "\n".join(lines)
        return OCSPCompileResult(proxy_target="nginx", directives=directives, enabled=True)


class _TraefikDirectiveCompiler:

    def compile(self, policy: OCSPStaplingPolicy) -> OCSPCompileResult:
        if not policy.enabled:
            return OCSPCompileResult(proxy_target="traefik", directives="", enabled=False)

        lines = [
            "ocsp_stapling: true",
        ]

        if policy.verify:
            lines.append("ocsp_stapling_verify: true")

        if policy.responder.trusted_certificate:
            lines.append(f"trusted_ca: {policy.responder.trusted_certificate}")

        directives = "\n".join(lines)
        return OCSPCompileResult(proxy_target="traefik", directives=directives, enabled=True)


class _ApacheDirectiveCompiler:

    def compile(self, policy: OCSPStaplingPolicy) -> OCSPCompileResult:
        if not policy.enabled:
            return OCSPCompileResult(proxy_target="apache", directives="", enabled=False)

        lines = [
            "SSLUseStapling On",
        ]

        timeout = policy.resolver.timeout.rstrip("s")
        lines.append(f"SSLStaplingResponderTimeout {timeout}")
        lines.append("SSLStaplingReturnResponderErrors Off")

        if policy.cache.type == "shared":
            bytes_size = self._to_bytes(policy.cache.shared_zone_size)
            lines.append(f'SSLStaplingCache "shmcb:/var/run/ocsp({bytes_size})"')
        elif policy.cache.type == "file":
            lines.append(f'SSLStaplingCache "dbm:{policy.cache.file_path}"')

        if policy.responder.override_url:
            lines.append(f"SSLStaplingForceURL {policy.responder.override_url}")

        directives = "\n".join(lines)
        return OCSPCompileResult(proxy_target="apache", directives=directives, enabled=True)

    @staticmethod
    def _to_bytes(size_str: str) -> str:
        s = size_str.strip().lower()
        if s.endswith("m"):
            return str(int(s[:-1]) * 1024 * 1024)
        if s.endswith("k"):
            return str(int(s[:-1]) * 1024)
        if s.isdigit():
            return s
        return "512000"


_COMPILER_REGISTRY = {
    "nginx": _NginxDirectiveCompiler(),
    "traefik": _TraefikDirectiveCompiler(),
    "apache": _ApacheDirectiveCompiler(),
}


class OCSPStaplingService:

    def __init__(self, port: OCSPStaplingPort) -> None:
        self._port = port

    def load_policy(self, policy_path: str) -> OCSPStaplingPolicy:
        return self._port.read_policy(policy_path)

    def compile_directives(self, policy: OCSPStaplingPolicy, proxy_target: str) -> OCSPCompileResult:
        compiler = _COMPILER_REGISTRY.get(proxy_target)
        if compiler is None:
            return OCSPCompileResult(proxy_target=proxy_target, directives="", enabled=False)
        return compiler.compile(policy)
