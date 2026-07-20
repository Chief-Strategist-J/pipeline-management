#!/usr/bin/env python3
import unittest
import os
import sys
import shutil
import tempfile

# Add src directory to path to import gateway_cli
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))
from gateway_cli.adapters.nginx_adapter import NginxAdapter
from gateway_cli.adapters.apache_adapter import ApacheAdapter
from gateway_cli.adapters.traefik_adapter import TraefikAdapter

class TestGatewayCompiler(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        
        # Recreate expected structure
        os.makedirs(os.path.join(self.test_dir, "edge/tls"))
        os.makedirs(os.path.join(self.test_dir, "edge/security-headers"))
        os.makedirs(os.path.join(self.test_dir, "edge/request-enrichment"))
        os.makedirs(os.path.join(self.test_dir, "routing/rules/test-app"))
        os.makedirs(os.path.join(self.test_dir, "routing/upstreams/test-service"))
        
        # Write dummy configs
        with open(os.path.join(self.test_dir, "edge/tls/termination-config"), "w") as f:
            f.write("ssl_protocols:\n  - TLSv1.2\n  - TLSv1.3\nssl_ciphers: HIGH\nhsts:\n  max_age: 100\n")
            
        with open(os.path.join(self.test_dir, "edge/security-headers/policy"), "w") as f:
            f.write("headers:\n  Content-Security-Policy: \"default-src 'self'\"\n")
            
        with open(os.path.join(self.test_dir, "edge/request-enrichment/policy"), "w") as f:
            f.write("inject_headers:\n  X-Test: \"yes\"\n")
            
        with open(os.path.join(self.test_dir, "routing/rules/test-app/routes"), "w") as f:
            f.write("domain: \"test.com\"\nroutes:\n  - path: \"/api\"\n    upstream: \"test-service\"\n")
            
        with open(os.path.join(self.test_dir, "routing/upstreams/test-service/pool-config"), "w") as f:
            f.write("targets:\n  - \"1.1.1.1:80\"\n")

    def tearDown(self):
        shutil.rmtree(self.test_dir)

    def test_parse_yaml(self):
        adapter = NginxAdapter()
        data = adapter.parse_yaml(os.path.join(self.test_dir, "edge/tls/termination-config"))
        self.assertEqual(data.get("ssl_ciphers"), "HIGH")
        self.assertIn("TLSv1.3", data.get("ssl_protocols", []))

    def test_nginx_generation(self):
        adapter = NginxAdapter()
        output_dir = tempfile.mkdtemp()
        try:
            adapter.generate(self.test_dir, output_dir)
            nginx_conf = os.path.join(output_dir, "nginx/nginx.conf")
            self.assertTrue(os.path.exists(nginx_conf))
            with open(nginx_conf, 'r') as f:
                content = f.read()
                self.assertIn("server_name test.com;", content)
                self.assertIn("proxy_pass http://test-service_pool;", content)
        finally:
            shutil.rmtree(output_dir)

    def test_apache_generation(self):
        adapter = ApacheAdapter()
        output_dir = tempfile.mkdtemp()
        try:
            adapter.generate(self.test_dir, output_dir)
            httpd_conf = os.path.join(output_dir, "apache/httpd.conf")
            self.assertTrue(os.path.exists(httpd_conf))
            with open(httpd_conf, 'r') as f:
                content = f.read()
                self.assertIn("ServerName test.com", content)
                self.assertIn("ProxyPass \"/api\" \"http://1.1.1.1:80/api\"", content)
        finally:
            shutil.rmtree(output_dir)

    def test_traefik_generation(self):
        adapter = TraefikAdapter()
        output_dir = tempfile.mkdtemp()
        try:
            adapter.generate(self.test_dir, output_dir)
            traefik_yaml = os.path.join(output_dir, "traefik/traefik.yaml")
            self.assertTrue(os.path.exists(traefik_yaml))
            with open(traefik_yaml, 'r') as f:
                content = f.read()
                self.assertIn("rule: Host(`test.com`) && PathPrefix(`/api`)", content)
                self.assertIn("url: http://1.1.1.1:80", content)
        finally:
            shutil.rmtree(output_dir)

if __name__ == "__main__":
    unittest.main()
