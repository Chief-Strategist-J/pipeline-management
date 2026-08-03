import unittest
from gateway_cli.features.types import AgentScriptRequest, AuditRequest, ShadowTrafficRequest, WAFRuleRequest
from gateway_cli.features.services import (
    AgentScriptEngineService,
    SandboxPenetrationAuditorService,
    ShadowTrafficCopierService,
    WAFCompilerService
)


class TestUpcomingFeatures(unittest.TestCase):
    def test_agent_script_engine(self) -> None:
        svc = AgentScriptEngineService()
        req = AgentScriptRequest(agent_id="agent-01", target_node="node-a", script_type="bash")
        res = svc.execute_script(req)
        self.assertEqual(res.status, "completed")
        self.assertTrue(res.execution_id.startswith("exec-"))

    def test_sandbox_penetration_auditor(self) -> None:
        svc = SandboxPenetrationAuditorService()
        req = AuditRequest(sandbox_id="sbx-123", target_host="127.0.0.1", target_port=80, scan_types=["port_scan"])
        res = svc.run_audit(req)
        self.assertTrue(res.passed)
        self.assertGreaterEqual(res.score, 70)

    def test_shadow_traffic_copier(self) -> None:
        svc = ShadowTrafficCopierService()
        req = ShadowTrafficRequest(source_route="/api/v1/orders", target_sandbox_id="sbx-123", sample_rate=0.1)
        res = svc.start_shadowing(req)
        self.assertTrue(res.active)
        self.assertEqual(res.copied_requests_count, 100)

    def test_waf_compiler(self) -> None:
        svc = WAFCompilerService()
        req = WAFRuleRequest(rule_name="default-protection", sqli_protection=True, xss_protection=True)
        res = svc.compile_waf_rule(req)
        self.assertTrue(res.rule_id.startswith("waf-"))
        self.assertIn("@detectSQLi", res.modsecurity_directives)
        self.assertIn("@detectXSS", res.modsecurity_directives)


if __name__ == "__main__":
    unittest.main()
