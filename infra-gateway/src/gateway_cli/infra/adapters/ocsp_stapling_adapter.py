from __future__ import annotations

import os

import yaml

from gateway_cli.features.ocsp_stapling_engine.types import (
    OCSPCacheConfig,
    OCSPResolverConfig,
    OCSPResponderConfig,
    OCSPStaplingPolicy,
)


class OCSPStaplingFileAdapter:

    def read_policy(self, policy_path: str) -> OCSPStaplingPolicy:
        if not os.path.exists(policy_path):
            return OCSPStaplingPolicy(enabled=False, verify=False)

        raw = self._load_yaml(policy_path)
        if raw is None:
            return OCSPStaplingPolicy(enabled=False, verify=False)

        return self._map_to_policy(raw)

    @staticmethod
    def _load_yaml(filepath: str) -> dict | None:
        with open(filepath, "r") as f:
            try:
                data = yaml.safe_load(f)
                return data if isinstance(data, dict) else None
            except yaml.YAMLError:
                return None

    @staticmethod
    def _map_to_policy(raw: dict) -> OCSPStaplingPolicy:
        stapling_section = raw.get("ocsp_stapling", {})
        resolver_section = raw.get("resolver", {})
        cache_section = raw.get("cache", {})
        responder_section = raw.get("responder", {})

        resolver = OCSPResolverConfig(
            nameservers=resolver_section.get("nameservers", ["8.8.8.8", "8.8.4.4"]),
            valid_duration=str(resolver_section.get("valid_duration", "300s")),
            timeout=str(resolver_section.get("timeout", "5s")),
        )

        cache = OCSPCacheConfig(
            type=str(cache_section.get("type", "shared")),
            shared_zone_name=str(cache_section.get("shared_zone_name", "ocsp_cache")),
            shared_zone_size=str(cache_section.get("shared_zone_size", "10m")),
            file_path=str(cache_section.get("file_path", "/var/cache/nginx/ocsp")),
        )

        responder = OCSPResponderConfig(
            override_url=str(responder_section.get("override_url", "")),
            trusted_certificate=str(responder_section.get("trusted_certificate", "")),
        )

        return OCSPStaplingPolicy(
            enabled=bool(stapling_section.get("enabled", True)),
            verify=bool(stapling_section.get("verify", True)),
            resolver=resolver,
            cache=cache,
            responder=responder,
        )
