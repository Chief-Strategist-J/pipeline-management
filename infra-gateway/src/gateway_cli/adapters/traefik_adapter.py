import os
import yaml
from .base import ProxyAdapter

class TraefikAdapter(ProxyAdapter):

    def generate(self, base_dir: str, output_dir: str) -> None:
        os.makedirs(os.path.join(output_dir, "traefik"), exist_ok=True)
        
        tls_config = self.parse_yaml(os.path.join(base_dir, "edge/tls/termination-config"))
        headers_config = self.parse_yaml(os.path.join(base_dir, "edge/security-headers/policy"))
        enrichment_config = self.parse_yaml(os.path.join(base_dir, "edge/request-enrichment/policy"))
        ocsp_config = self.parse_yaml(os.path.join(base_dir, "edge/tls/ocsp-stapling-policy"))
        
        routes_dir = os.path.join(base_dir, "routing/rules")
        apps = []
        if os.path.exists(routes_dir):
            apps = os.listdir(routes_dir)
            
        traefik_dynamic = {
            "http": {
                "routers": {},
                "services": {},
                "middlewares": {
                    "security-headers": {
                        "headers": {
                            "sslRedirect": True,
                            "forceSTSHeader": True,
                            "stsSeconds": tls_config.get("hsts", {}).get("max_age", 31536000),
                            "stsIncludeSubdomains": tls_config.get("hsts", {}).get("include_subdomains", True),
                            "stsPreload": tls_config.get("hsts", {}).get("preload", True),
                            "frameDeny": True,
                            "contentTypeNosniff": True,
                            "browserXssFilter": True,
                        }
                    },
                    "request-enrichment": {
                        "headers": {
                            "customRequestHeaders": enrichment_config.get("inject_headers", {})
                        }
                    },
                    "ddos-rate-limit": {
                        "rateLimit": {
                            "average": 10,
                            "burst": 20
                        }
                    }
                }
            }
        }
        
        sec_headers = headers_config.get("headers", {})
        if "Content-Security-Policy" in sec_headers:
            traefik_dynamic["http"]["middlewares"]["security-headers"]["headers"]["contentSecurityPolicy"] = sec_headers["Content-Security-Policy"]
        if "Referrer-Policy" in sec_headers:
            traefik_dynamic["http"]["middlewares"]["security-headers"]["headers"]["referrerPolicy"] = sec_headers["Referrer-Policy"]
        if "Permissions-Policy" in sec_headers:
            traefik_dynamic["http"]["middlewares"]["security-headers"]["headers"]["permissionsPolicy"] = sec_headers["Permissions-Policy"]

        ocsp_stapling = ocsp_config.get("ocsp_stapling", {})
        ocsp_tls_options = {}
        if ocsp_stapling.get("enabled", False):
            ocsp_tls_options["ocspStapling"] = True
            if ocsp_stapling.get("verify", False):
                ocsp_tls_options["ocspStaplingVerify"] = True
            responder_cfg = ocsp_config.get("responder", {})
            trusted_cert = responder_cfg.get("trusted_certificate", "")
            if trusted_cert:
                ocsp_tls_options["trustedCA"] = trusted_cert

        for app in apps:
            app_routes_file = os.path.join(routes_dir, app, "routes")
            app_data = self.parse_yaml(app_routes_file)
            if not app_data:
                continue
                
            domain = app_data.get("domain", "localhost")
            routes = app_data.get("routes", [])
            
            for idx, route in enumerate(routes):
                path = route.get("path")
                upstream = route.get("upstream")
                
                router_name = f"{app}-{upstream}-{idx}"
                
                tls_block = {}
                tls_block.update(ocsp_tls_options)
                
                traefik_dynamic["http"]["routers"][router_name] = {
                    "rule": f"Host(`{domain}`) && PathPrefix(`{path}`)",
                    "service": upstream,
                    "entryPoints": ["websecure"],
                    "middlewares": ["security-headers", "request-enrichment", "ddos-rate-limit"],
                    "tls": tls_block
                }
                
                upstream_file = os.path.join(base_dir, "routing/upstreams", upstream, "pool-config")
                upstream_data = self.parse_yaml(upstream_file)
                targets = upstream_data.get("targets", [])
                
                traefik_dynamic["http"]["services"][upstream] = {
                    "loadBalancer": {
                        "servers": [{"url": f"http://{target}"} for target in targets],
                        "healthCheck": {
                            "path": "/healthz",
                            "interval": "10s",
                            "timeout": "2s"
                        },
                        "circuitBreaker": {
                            "expression": "NetworkErrorRatio() > 0.30 || ResponseCodeRatio(500, 600, 0, 1) > 0.30"
                        }
                    }
                }
                
        traefik_conf_path = os.path.join(output_dir, "traefik", "traefik.yaml")
        with open(traefik_conf_path, "w") as f:
            yaml.safe_dump(traefik_dynamic, f, default_flow_style=False)
            
        print(f"Generated Traefik configuration at: {traefik_conf_path}")

