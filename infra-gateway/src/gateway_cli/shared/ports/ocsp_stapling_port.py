from __future__ import annotations

from typing import Protocol

from gateway_cli.features.ocsp_stapling_engine.types import OCSPStaplingPolicy


class OCSPStaplingPort(Protocol):

    def read_policy(self, policy_path: str) -> OCSPStaplingPolicy:
        ...
