from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional


# Feature 2: AI Agent Script Engine
@dataclass
class AgentScriptRequest:
    agent_id: str
    target_node: str
    script_type: str  # bash, python, docker
    environment_vars: Dict[str, str] = field(default_factory=dict)

@dataclass
class AgentScriptResponse:
    execution_id: str
    agent_id: str
    status: str
    output: str
    executed_at: str


# Feature 3: Sandbox Penetration Auditor
@dataclass
class AuditRequest:
    sandbox_id: str
    target_host: str
    target_port: int
    scan_types: List[str] = field(default_factory=list)  # port_scan, path_traversal, header_audit

@dataclass
class AuditResponse:
    audit_id: str
    sandbox_id: str
    score: int  # 0-100 security score
    vulnerabilities_found: List[str]
    passed: bool
    audited_at: str


# Feature 4: Shadow Traffic Copier
@dataclass
class ShadowTrafficRequest:
    source_route: str
    target_sandbox_id: str
    sample_rate: float  # 0.0 - 1.0 (e.g. 0.1 for 10% traffic copy)

@dataclass
class ShadowTrafficResponse:
    session_id: str
    source_route: str
    target_sandbox_id: str
    active: bool
    copied_requests_count: int


# Feature 7: Active L7 WAF Compiler
@dataclass
class WAFRuleRequest:
    rule_name: str
    sqli_protection: bool = True
    xss_protection: bool = True
    rate_limit_rpm: int = 600

@dataclass
class WAFRuleResponse:
    rule_id: str
    rule_name: str
    modsecurity_directives: str
    compiled_at: str
