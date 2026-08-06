import unittest
import os
import sys
import shutil
import tempfile

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from gateway_cli.infra.adapters.ocsp_stapling_adapter import OCSPStaplingFileAdapter
from gateway_cli.features.ocsp_stapling_engine.service import OCSPStaplingService
from gateway_cli.features.ocsp_stapling_engine.types import (
    OCSPStaplingPolicy,
    OCSPResolverConfig,
    OCSPCacheConfig,
    OCSPResponderConfig,
    OCSPCompileResult,
)
from gateway_cli.adapters.nginx_adapter import NginxAdapter
from gateway_cli.adapters.traefik_adapter import TraefikAdapter
from gateway_cli.adapters.apache_adapter import ApacheAdapter


class TestOCSPPolicyLoading(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def _write_policy(self, content: str) -> str:
        path = os.path.join(self.test_dir, "ocsp-stapling-policy")
        with open(path, "w") as f:
            f.write(content)
        return path

    def test_load_enabled_policy(self) -> None:
        path = self._write_policy(
            "ocsp_stapling:\n  enabled: true\n  verify: true\n"
            "resolver:\n  nameservers:\n    - '1.1.1.1'\n  valid_duration: '600s'\n  timeout: '10s'\n"
            "cache:\n  type: shared\n  shared_zone_name: ocsp_zone\n  shared_zone_size: 20m\n"
            "responder:\n  override_url: ''\n  trusted_certificate: ''\n"
        )
        adapter = OCSPStaplingFileAdapter()
        policy = adapter.read_policy(path)

        self.assertTrue(policy.enabled)
        self.assertTrue(policy.verify)
        self.assertEqual(policy.resolver.nameservers, ["1.1.1.1"])
        self.assertEqual(policy.resolver.valid_duration, "600s")
        self.assertEqual(policy.resolver.timeout, "10s")
        self.assertEqual(policy.cache.type, "shared")
        self.assertEqual(policy.cache.shared_zone_name, "ocsp_zone")
        self.assertEqual(policy.cache.shared_zone_size, "20m")

    def test_load_disabled_policy(self) -> None:
        path = self._write_policy(
            "ocsp_stapling:\n  enabled: false\n  verify: false\n"
        )
        adapter = OCSPStaplingFileAdapter()
        policy = adapter.read_policy(path)

        self.assertFalse(policy.enabled)
        self.assertFalse(policy.verify)

    def test_missing_file_returns_disabled_default(self) -> None:
        adapter = OCSPStaplingFileAdapter()
        policy = adapter.read_policy("/nonexistent/path/ocsp-policy")

        self.assertFalse(policy.enabled)
        self.assertFalse(policy.verify)

    def test_empty_file_returns_disabled_default(self) -> None:
        path = self._write_policy("")
        adapter = OCSPStaplingFileAdapter()
        policy = adapter.read_policy(path)

        self.assertFalse(policy.enabled)
        self.assertFalse(policy.verify)

    def test_partial_config_uses_defaults(self) -> None:
        path = self._write_policy(
            "ocsp_stapling:\n  enabled: true\n"
        )
        adapter = OCSPStaplingFileAdapter()
        policy = adapter.read_policy(path)

        self.assertTrue(policy.enabled)
        self.assertEqual(policy.resolver.nameservers, ["8.8.8.8", "8.8.4.4"])
        self.assertEqual(policy.cache.shared_zone_name, "ocsp_cache")


class TestOCSPServiceCompilation(unittest.TestCase):

    def _make_service(self) -> OCSPStaplingService:
        adapter = OCSPStaplingFileAdapter()
        return OCSPStaplingService(port=adapter)

    def _make_enabled_policy(self) -> OCSPStaplingPolicy:
        return OCSPStaplingPolicy(
            enabled=True,
            verify=True,
            resolver=OCSPResolverConfig(
                nameservers=["8.8.8.8", "8.8.4.4"],
                valid_duration="300s",
                timeout="5s",
            ),
            cache=OCSPCacheConfig(
                type="shared",
                shared_zone_name="ocsp_cache",
                shared_zone_size="10m",
            ),
            responder=OCSPResponderConfig(),
        )

    def _make_disabled_policy(self) -> OCSPStaplingPolicy:
        return OCSPStaplingPolicy(enabled=False, verify=False)

    def test_nginx_compile_enabled(self) -> None:
        svc = self._make_service()
        result = svc.compile_directives(self._make_enabled_policy(), "nginx")

        self.assertTrue(result.enabled)
        self.assertEqual(result.proxy_target, "nginx")
        self.assertIn("ssl_stapling on;", result.directives)
        self.assertIn("ssl_stapling_verify on;", result.directives)
        self.assertIn("resolver 8.8.8.8 8.8.4.4 valid=300s;", result.directives)
        self.assertIn("resolver_timeout 5s;", result.directives)
        self.assertIn("ssl_ocsp_cache shared:ocsp_cache:10m;", result.directives)

    def test_nginx_compile_disabled(self) -> None:
        svc = self._make_service()
        result = svc.compile_directives(self._make_disabled_policy(), "nginx")

        self.assertFalse(result.enabled)
        self.assertEqual(result.directives, "")

    def test_traefik_compile_enabled(self) -> None:
        svc = self._make_service()
        result = svc.compile_directives(self._make_enabled_policy(), "traefik")

        self.assertTrue(result.enabled)
        self.assertEqual(result.proxy_target, "traefik")
        self.assertIn("ocsp_stapling: true", result.directives)
        self.assertIn("ocsp_stapling_verify: true", result.directives)

    def test_traefik_compile_disabled(self) -> None:
        svc = self._make_service()
        result = svc.compile_directives(self._make_disabled_policy(), "traefik")

        self.assertFalse(result.enabled)
        self.assertEqual(result.directives, "")

    def test_apache_compile_enabled(self) -> None:
        svc = self._make_service()
        result = svc.compile_directives(self._make_enabled_policy(), "apache")

        self.assertTrue(result.enabled)
        self.assertEqual(result.proxy_target, "apache")
        self.assertIn("SSLUseStapling On", result.directives)
        self.assertIn("SSLStaplingResponderTimeout 5", result.directives)
        self.assertIn("SSLStaplingReturnResponderErrors Off", result.directives)
        self.assertIn('SSLStaplingCache "shmcb:/var/run/ocsp(10485760)"', result.directives)

    def test_apache_compile_disabled(self) -> None:
        svc = self._make_service()
        result = svc.compile_directives(self._make_disabled_policy(), "apache")

        self.assertFalse(result.enabled)
        self.assertEqual(result.directives, "")

    def test_unknown_proxy_returns_disabled(self) -> None:
        svc = self._make_service()
        result = svc.compile_directives(self._make_enabled_policy(), "caddy")

        self.assertFalse(result.enabled)
        self.assertEqual(result.directives, "")

    def test_responder_override_url_in_nginx(self) -> None:
        svc = self._make_service()
        policy = self._make_enabled_policy()
        policy.responder.override_url = "http://ocsp.example.com"
        result = svc.compile_directives(policy, "nginx")

        self.assertIn("ssl_stapling_responder http://ocsp.example.com;", result.directives)

    def test_trusted_certificate_in_nginx(self) -> None:
        svc = self._make_service()
        policy = self._make_enabled_policy()
        policy.responder.trusted_certificate = "/etc/ssl/ca-chain.pem"
        result = svc.compile_directives(policy, "nginx")

        self.assertIn("ssl_trusted_certificate /etc/ssl/ca-chain.pem;", result.directives)

    def test_file_cache_type_in_apache(self) -> None:
        svc = self._make_service()
        policy = self._make_enabled_policy()
        policy.cache.type = "file"
        policy.cache.file_path = "/var/cache/httpd/ocsp"
        result = svc.compile_directives(policy, "apache")

        self.assertIn('SSLStaplingCache "dbm:/var/cache/httpd/ocsp"', result.directives)


class TestProxyAdapterOCSPIntegration(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.output_dir = tempfile.mkdtemp()

        os.makedirs(os.path.join(self.test_dir, "edge/tls"))
        os.makedirs(os.path.join(self.test_dir, "edge/security-headers"))
        os.makedirs(os.path.join(self.test_dir, "edge/request-enrichment"))
        os.makedirs(os.path.join(self.test_dir, "routing/rules/test-app"))
        os.makedirs(os.path.join(self.test_dir, "routing/upstreams/test-service"))

        with open(os.path.join(self.test_dir, "edge/tls/termination-config"), "w") as f:
            f.write("ssl_protocols:\n  - TLSv1.2\n  - TLSv1.3\nssl_ciphers: HIGH\nhsts:\n  max_age: 100\n")

        with open(os.path.join(self.test_dir, "edge/security-headers/policy"), "w") as f:
            f.write("headers:\n  X-Frame-Options: DENY\n")

        with open(os.path.join(self.test_dir, "edge/request-enrichment/policy"), "w") as f:
            f.write('inject_headers:\n  X-Test: "yes"\n')

        with open(os.path.join(self.test_dir, "routing/rules/test-app/routes"), "w") as f:
            f.write('domain: "test.com"\nroutes:\n  - path: "/api"\n    upstream: "test-service"\n')

        with open(os.path.join(self.test_dir, "routing/upstreams/test-service/pool-config"), "w") as f:
            f.write('targets:\n  - "1.1.1.1:80"\n')

    def tearDown(self):
        shutil.rmtree(self.test_dir)
        shutil.rmtree(self.output_dir)

    def _write_ocsp_policy(self, enabled: bool) -> None:
        content = f"ocsp_stapling:\n  enabled: {str(enabled).lower()}\n  verify: {str(enabled).lower()}\n"
        if enabled:
            content += (
                "resolver:\n  nameservers:\n    - '8.8.8.8'\n    - '8.8.4.4'\n"
                "  valid_duration: '300s'\n  timeout: '5s'\n"
                "cache:\n  type: shared\n  shared_zone_name: ocsp_cache\n  shared_zone_size: 10m\n"
                "responder:\n  override_url: ''\n  trusted_certificate: ''\n"
            )
        with open(os.path.join(self.test_dir, "edge/tls/ocsp-stapling-policy"), "w") as f:
            f.write(content)

    def test_nginx_includes_ocsp_when_enabled(self) -> None:
        self._write_ocsp_policy(True)
        NginxAdapter().generate(self.test_dir, self.output_dir)

        with open(os.path.join(self.output_dir, "nginx/nginx.conf")) as f:
            content = f.read()

        self.assertIn("ssl_stapling on;", content)
        self.assertIn("ssl_stapling_verify on;", content)
        self.assertIn("resolver 8.8.8.8 8.8.4.4 valid=300s;", content)
        self.assertIn("ssl_ocsp_cache shared:ocsp_cache:10m;", content)

    def test_nginx_omits_ocsp_when_disabled(self) -> None:
        self._write_ocsp_policy(False)
        NginxAdapter().generate(self.test_dir, self.output_dir)

        with open(os.path.join(self.output_dir, "nginx/nginx.conf")) as f:
            content = f.read()

        self.assertNotIn("ssl_stapling on;", content)
        self.assertNotIn("ssl_stapling_verify on;", content)

    def test_traefik_includes_ocsp_when_enabled(self) -> None:
        self._write_ocsp_policy(True)
        TraefikAdapter().generate(self.test_dir, self.output_dir)

        with open(os.path.join(self.output_dir, "traefik/traefik.yaml")) as f:
            content = f.read()

        self.assertIn("ocspStapling: true", content)
        self.assertIn("ocspStaplingVerify: true", content)

    def test_traefik_omits_ocsp_when_disabled(self) -> None:
        self._write_ocsp_policy(False)
        TraefikAdapter().generate(self.test_dir, self.output_dir)

        with open(os.path.join(self.output_dir, "traefik/traefik.yaml")) as f:
            content = f.read()

        self.assertNotIn("ocspStapling", content)

    def test_apache_includes_ocsp_when_enabled(self) -> None:
        self._write_ocsp_policy(True)
        ApacheAdapter().generate(self.test_dir, self.output_dir)

        with open(os.path.join(self.output_dir, "apache/httpd.conf")) as f:
            content = f.read()

        self.assertIn("SSLUseStapling On", content)
        self.assertIn("SSLStaplingResponderTimeout 5", content)
        self.assertIn("SSLStaplingReturnResponderErrors Off", content)
        self.assertIn('SSLStaplingCache "shmcb:/var/run/ocsp(10485760)"', content)

    def test_apache_omits_ocsp_when_disabled(self) -> None:
        self._write_ocsp_policy(False)
        ApacheAdapter().generate(self.test_dir, self.output_dir)

        with open(os.path.join(self.output_dir, "apache/httpd.conf")) as f:
            content = f.read()

        self.assertNotIn("SSLUseStapling", content)
        self.assertNotIn("SSLStaplingCache", content)

    def test_nginx_no_ocsp_file_means_no_ocsp(self) -> None:
        NginxAdapter().generate(self.test_dir, self.output_dir)

        with open(os.path.join(self.output_dir, "nginx/nginx.conf")) as f:
            content = f.read()

        self.assertNotIn("ssl_stapling on;", content)


if __name__ == "__main__":
    unittest.main()
