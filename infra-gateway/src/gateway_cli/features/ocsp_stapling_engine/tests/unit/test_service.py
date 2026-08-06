import unittest

from gateway_cli.features.ocsp_stapling_engine.types import (
    OCSPStaplingPolicy,
    OCSPResolverConfig,
    OCSPCacheConfig,
    OCSPResponderConfig,
    OCSPCompileResult,
)
from gateway_cli.features.ocsp_stapling_engine.service import OCSPStaplingService
from gateway_cli.infra.adapters.ocsp_stapling_adapter import OCSPStaplingFileAdapter


class TestOCSPStaplingServiceUnit(unittest.TestCase):

    def _make_service(self) -> OCSPStaplingService:
        return OCSPStaplingService(port=OCSPStaplingFileAdapter())

    def test_compile_nginx_enabled_produces_stapling_directives(self) -> None:
        svc = self._make_service()
        policy = OCSPStaplingPolicy(enabled=True, verify=True)
        result = svc.compile_directives(policy, "nginx")

        self.assertTrue(result.enabled)
        self.assertIn("ssl_stapling on;", result.directives)

    def test_compile_nginx_disabled_produces_empty(self) -> None:
        svc = self._make_service()
        policy = OCSPStaplingPolicy(enabled=False)
        result = svc.compile_directives(policy, "nginx")

        self.assertFalse(result.enabled)
        self.assertEqual(result.directives, "")

    def test_compile_traefik_enabled(self) -> None:
        svc = self._make_service()
        policy = OCSPStaplingPolicy(enabled=True, verify=True)
        result = svc.compile_directives(policy, "traefik")

        self.assertTrue(result.enabled)
        self.assertIn("ocsp_stapling: true", result.directives)

    def test_compile_apache_enabled(self) -> None:
        svc = self._make_service()
        policy = OCSPStaplingPolicy(enabled=True, verify=True)
        result = svc.compile_directives(policy, "apache")

        self.assertTrue(result.enabled)
        self.assertIn("SSLUseStapling On", result.directives)

    def test_compile_unknown_proxy_returns_disabled(self) -> None:
        svc = self._make_service()
        policy = OCSPStaplingPolicy(enabled=True)
        result = svc.compile_directives(policy, "haproxy")

        self.assertFalse(result.enabled)
        self.assertEqual(result.proxy_target, "haproxy")

    def test_responder_override_in_apache(self) -> None:
        svc = self._make_service()
        policy = OCSPStaplingPolicy(
            enabled=True,
            responder=OCSPResponderConfig(override_url="http://ocsp.ca.example.com"),
        )
        result = svc.compile_directives(policy, "apache")

        self.assertIn("SSLStaplingForceURL http://ocsp.ca.example.com", result.directives)

    def test_trusted_ca_in_traefik(self) -> None:
        svc = self._make_service()
        policy = OCSPStaplingPolicy(
            enabled=True,
            responder=OCSPResponderConfig(trusted_certificate="/etc/ssl/ca.pem"),
        )
        result = svc.compile_directives(policy, "traefik")

        self.assertIn("trusted_ca: /etc/ssl/ca.pem", result.directives)


if __name__ == "__main__":
    unittest.main()
