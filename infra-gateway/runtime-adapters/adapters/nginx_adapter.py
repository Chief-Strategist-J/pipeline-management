import os
from .base import ProxyAdapter

class NginxAdapter(ProxyAdapter):
    """Adapter translating abstract configurations to Nginx config files."""

    def generate(self, base_dir: str, output_dir: str) -> None:
        os.makedirs(os.path.join(output_dir, "nginx"), exist_ok=True)
        
        # Read core config files
        tls_config = self.parse_yaml(os.path.join(base_dir, "edge/tls/termination-config"))
        headers_config = self.parse_yaml(os.path.join(base_dir, "edge/security-headers/policy"))
        enrichment_config = self.parse_yaml(os.path.join(base_dir, "edge/request-enrichment/policy"))
        
        # Read routes
        routes_dir = os.path.join(base_dir, "routing/rules")
        apps = []
        if os.path.exists(routes_dir):
            apps = os.listdir(routes_dir)
        
        upstreams = []
        vhosts = []
        
        for app in apps:
            app_routes_file = os.path.join(routes_dir, app, "routes")
            app_data = self.parse_yaml(app_routes_file)
            if not app_data:
                continue
            
            domain = app_data.get("domain", "localhost")
            virtual_ip = app_data.get("virtual_ip")
            routes = app_data.get("routes", [])
            
            vhost_content = []
            vhost_content.append(f"server {{")
            if virtual_ip:
                vhost_content.append(f"    listen {virtual_ip}:443 ssl http2;")
            else:
                vhost_content.append(f"    listen 443 ssl http2;")
            vhost_content.append(f"    server_name {domain};")
            vhost_content.append(f"")
            vhost_content.append(f"    # SSL Configuration")
            vhost_content.append(f"    ssl_certificate /etc/ssl/certs/{domain}.crt;")
            vhost_content.append(f"    ssl_certificate_key /etc/ssl/private/{domain}.key;")
            
            ssl_protocols = tls_config.get("ssl_protocols", ["TLSv1.2", "TLSv1.3"])
            ssl_ciphers = tls_config.get("ssl_ciphers", "high")
            vhost_content.append(f"    ssl_protocols {' '.join(ssl_protocols)};")
            vhost_content.append(f"    ssl_ciphers {ssl_ciphers};")
            vhost_content.append(f"    ssl_prefer_server_ciphers on;")
            vhost_content.append(f"")
            
            # Security Headers
            headers = headers_config.get("headers", {})
            for h_key, h_val in headers.items():
                vhost_content.append(f"    add_header {h_key} \"{h_val}\" always;")
                
            vhost_content.append(f"")
            # Request Enrichment
            enrich_headers = enrichment_config.get("inject_headers", {})
            for e_key, e_val in enrich_headers.items():
                vhost_content.append(f"    proxy_set_header {e_key} \"{e_val}\";")
                
            vhost_content.append(f"")
            
            # Route processing
            for route in routes:
                path = route.get("path")
                upstream = route.get("upstream")
                auth_req = route.get("auth_required", False)
                
                # Find upstream targets
                upstream_file = os.path.join(base_dir, "routing/upstreams", upstream, "pool-config")
                upstream_data = self.parse_yaml(upstream_file)
                targets = upstream_data.get("targets", [])
                
                # Read Circuit Breaker settings from Health Checks if available
                health_file = os.path.join(base_dir, "routing/health-checks", upstream, "config")
                health_data = self.parse_yaml(health_file)
                unhealthy_threshold = health_data.get("unhealthy_threshold", 3)
                timeout = health_data.get("timeout", "10s")
                if isinstance(timeout, int):
                    timeout = f"{timeout}s"
                
                # Format upstream block with Circuit Breaking parameters
                upstream_name = f"{upstream}_pool"
                upstream_definition = [
                    f"upstream {upstream_name} {{",
                    f"    zone {upstream}_backend 64k;"
                ]
                for target in targets:
                    upstream_definition.append(f"    server {target} max_fails={unhealthy_threshold} fail_timeout={timeout};")
                upstream_definition.append(f"}}")
                
                upstreams.append("\n".join(upstream_definition))
                
                vhost_content.append(f"    location {path} {{")
                vhost_content.append(f"        proxy_pass http://{upstream_name};")
                vhost_content.append(f"        proxy_http_version 1.1;")
                vhost_content.append(f"        proxy_set_header Connection \"\";")
                vhost_content.append(f"        proxy_set_header Host $host;")
                vhost_content.append(f"        proxy_set_header X-Real-IP $remote_addr;")
                vhost_content.append(f"        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;")
                vhost_content.append(f"        proxy_set_header X-Forwarded-Proto $scheme;")
                vhost_content.append(f"")
                vhost_content.append(f"        # W3C Distributed Tracing propagation")
                vhost_content.append(f"        proxy_set_header traceparent $http_traceparent;")
                vhost_content.append(f"        proxy_set_header tracestate $http_tracestate;")
                vhost_content.append(f"")
                vhost_content.append(f"        # DDoS Mitigation & Rate Limiting")
                vhost_content.append(f"        limit_req zone=ip_limit_zone burst=20 nodelay;")
                
                if auth_req:
                    vhost_content.append(f"        # Auth required - gateway validation placeholder")
                    vhost_content.append(f"        # auth_request /_auth_validate;")
                vhost_content.append(f"    }}")
                vhost_content.append(f"")
                
            vhost_content.append(f"}}")
            vhosts.append("\n".join(vhost_content))
            
        # Write combined configs
        nginx_conf_path = os.path.join(output_dir, "nginx", "nginx.conf")
        with open(nginx_conf_path, "w") as f:
            f.write("# Generated by gateway compiler.py\n\n")
            f.write("pid /tmp/nginx.pid;\n\n")
            f.write("events {\n    worker_connections 1024;\n}\n\n")
            f.write("http {\n")
            f.write("    include mime.types;\n")
            f.write("    default_type application/octet-stream;\n\n")
            f.write("    # Edge DDoS Protection: Rate Limit Zones\n")
            f.write("    limit_req_zone $binary_remote_addr zone=ip_limit_zone:10m rate=10r/s;\n\n")
            f.write("    # Upstreams\n")
            f.write("\n\n".join(upstreams))
            f.write("\n\n    # Virtual Servers / Virtual Hosts\n")
            f.write("\n\n".join(vhosts))
            f.write("\n}\n")
            
        print(f"Generated Nginx configuration at: {nginx_conf_path}")
