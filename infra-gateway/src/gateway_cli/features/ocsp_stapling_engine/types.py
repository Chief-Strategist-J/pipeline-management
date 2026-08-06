from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class OCSPResolverConfig:
    nameservers: List[str] = field(default_factory=lambda: ["8.8.8.8", "8.8.4.4"])
    valid_duration: str = "300s"
    timeout: str = "5s"


@dataclass
class OCSPCacheConfig:
    type: str = "shared"
    shared_zone_name: str = "ocsp_cache"
    shared_zone_size: str = "10m"
    file_path: str = "/var/cache/nginx/ocsp"


@dataclass
class OCSPResponderConfig:
    override_url: str = ""
    trusted_certificate: str = ""


@dataclass
class OCSPStaplingPolicy:
    enabled: bool = True
    verify: bool = True
    resolver: OCSPResolverConfig = field(default_factory=OCSPResolverConfig)
    cache: OCSPCacheConfig = field(default_factory=OCSPCacheConfig)
    responder: OCSPResponderConfig = field(default_factory=OCSPResponderConfig)


@dataclass
class OCSPCompileResult:
    proxy_target: str
    directives: str
    enabled: bool
