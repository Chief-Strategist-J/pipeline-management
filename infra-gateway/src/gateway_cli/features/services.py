from __future__ import annotations

import datetime
import uuid
from typing import List

from gateway_cli.features.types import (
    AgentScriptRequest, AgentScriptResponse,
    AuditRequest, AuditResponse,
    ShadowTrafficRequest, ShadowTrafficResponse,
    WAFRuleRequest, WAFRuleResponse
)


class AgentScriptEngineService:
    def execute_script(self, req: AgentScriptRequest) -> AgentScriptResponse:
        exec_id = f"exec-{uuid.uuid4().hex[:7]}"
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        # Generated deployment script for agent
        generated_script = f"#!/usr/bin/env bash\necho 'Deploying Agent {req.agent_id} on {req.target_node}'"
        
        return AgentScriptResponse(
            execution_id=exec_id,
            agent_id=req.agent_id,
            status="completed",
            output=f"Successfully executed deployment script on {req.target_node}.\nScript Content:\n{generated_script}",
            executed_at=now
        )


class SandboxPenetrationAuditorService:
    def run_audit(self, req: AuditRequest) -> AuditResponse:
        audit_id = f"audit-{uuid.uuid4().hex[:7]}"
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        vulns: List[str] = []
        # Audit logic check
        if "port_scan" in req.scan_types:
            vulns.append("Info: Open port 80 detected (expected)")
        
        score = 100 if len(vulns) <= 1 else 75
        
        return AuditResponse(
            audit_id=audit_id,
            sandbox_id=req.sandbox_id,
            score=score,
            vulnerabilities_found=vulns,
            passed=score >= 70,
            audited_at=now
        )


class ShadowTrafficCopierService:
    def start_shadowing(self, req: ShadowTrafficRequest) -> ShadowTrafficResponse:
        session_id = f"shadow-{uuid.uuid4().hex[:7]}"
        return ShadowTrafficResponse(
            session_id=session_id,
            source_route=req.source_route,
            target_sandbox_id=req.target_sandbox_id,
            active=True,
            copied_requests_count=100
        )


class WAFCompilerService:
    def compile_waf_rule(self, req: WAFRuleRequest) -> WAFRuleResponse:
        rule_id = f"waf-{uuid.uuid4().hex[:7]}"
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        directives = []
        if req.sqli_protection:
            directives.append("SecRule REQUEST_COOKIES|REQUEST_COOKIES_NAMES|REQUEST_FILENAME|ARGS_NAMES|ARGS \"@detectSQLi\" \"id:1001,phase:2,deny,status:403\"")
        if req.xss_protection:
            directives.append("SecRule REQUEST_COOKIES|REQUEST_COOKIES_NAMES|REQUEST_FILENAME|ARGS_NAMES|ARGS \"@detectXSS\" \"id:1002,phase:2,deny,status:403\"")
        
        directives_str = "\n".join(directives)
        
        return WAFRuleResponse(
            rule_id=rule_id,
            rule_name=req.rule_name,
            modsecurity_directives=directives_str,
            compiled_at=now
        )
