#!/usr/bin/env python3
import os
import sys
import argparse

import yaml

# Parse YAML config using standard PyYAML library
def parse_simple_yaml(filepath):
    if not os.path.exists(filepath):
        return {}
    with open(filepath, 'r') as f:
        try:
            data = yaml.safe_load(f)
            return data if data is not None else {}
        except Exception as e:
            print(f"Error parsing {filepath}: {e}")
            return {}

def generate_nginx(base_dir, output_dir):
    os.makedirs(os.path.join(output_dir, "nginx"), exist_ok=True)
    
    # Read core config files
    tls_config = parse_simple_yaml(os.path.join(base_dir, "edge/tls/termination-config"))
    headers_config = parse_simple_yaml(os.path.join(base_dir, "edge/security-headers/policy"))
    enrichment_config = parse_simple_yaml(os.path.join(base_dir, "edge/request-enrichment/policy"))
    
    # Read routes
    routes_dir = os.path.join(base_dir, "routing/rules")
    apps = []
    if os.path.exists(routes_dir):
        apps = os.listdir(routes_dir)
    
    upstreams = []
    vhosts = []
    
    for app in apps:
        app_routes_file = os.path.join(routes_dir, app, "routes")
        app_data = parse_simple_yaml(app_routes_file)
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
        vhost_content.append(f"    # Security Headers")
        headers = headers_config.get("headers", {})
        for h_key, h_val in headers.items():
            vhost_content.append(f"    add_header {h_key} \"{h_val}\" always;")
            
        vhost_content.append(f"")
        vhost_content.append(f"    # Request Enrichment")
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
            upstream_data = parse_simple_yaml(upstream_file)
            targets = upstream_data.get("targets", [])
            
            # Format upstream block if not already defined
            upstream_name = f"{upstream}_pool"
            upstream_definition = [
                f"upstream {upstream_name} {{",
                f"    zone {upstream}_backend 64k;"
            ]
            for target in targets:
                upstream_definition.append(f"    server {target};")
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
        f.write("    # Upstreams\n")
        f.write("\n\n".join(upstreams))
        f.write("\n\n    # Virtual Servers / Virtual Hosts\n")
        f.write("\n\n".join(vhosts))
        f.write("\n}\n")
        
    print(f"Generated Nginx configuration at: {nginx_conf_path}")

def generate_apache(base_dir, output_dir):
    os.makedirs(os.path.join(output_dir, "apache"), exist_ok=True)
    
    # Read core config files
    tls_config = parse_simple_yaml(os.path.join(base_dir, "edge/tls/termination-config"))
    headers_config = parse_simple_yaml(os.path.join(base_dir, "edge/security-headers/policy"))
    enrichment_config = parse_simple_yaml(os.path.join(base_dir, "edge/request-enrichment/policy"))
    
    # Read routes
    routes_dir = os.path.join(base_dir, "routing/rules")
    apps = []
    if os.path.exists(routes_dir):
        apps = os.listdir(routes_dir)
        
    vhosts = []
    
    for app in apps:
        app_routes_file = os.path.join(routes_dir, app, "routes")
        app_data = parse_simple_yaml(app_routes_file)
        if not app_data:
            continue
            
        domain = app_data.get("domain", "localhost")
        virtual_ip = app_data.get("virtual_ip", "*")
        routes = app_data.get("routes", [])
        
        vhost_content = []
        vhost_content.append(f"<VirtualHost {virtual_ip}:443>")
        vhost_content.append(f"    ServerName {domain}")
        vhost_content.append(f"")
        vhost_content.append(f"    # SSL Configuration")
        vhost_content.append(f"    SSLEngine on")
        vhost_content.append(f"    SSLCertificateFile \"/etc/ssl/certs/{domain}.crt\"")
        vhost_content.append(f"    SSLCertificateKeyFile \"/etc/ssl/private/{domain}.key\"")
        
        ssl_protocols = tls_config.get("ssl_protocols", ["TLSv1.2", "TLSv1.3"])
        ssl_ciphers = tls_config.get("ssl_ciphers", "high")
        
        # Apache protocol format adjustment (e.g. +TLSv1.2 +TLSv1.3)
        apache_protocols = " ".join([f"+{p.replace('v', '')}" for p in ssl_protocols])
        vhost_content.append(f"    SSLProtocol all -SSLv3 {apache_protocols}")
        vhost_content.append(f"    SSLCipherSuite {ssl_ciphers}")
        vhost_content.append(f"    SSLHonorCipherOrder on")
        vhost_content.append(f"")
        
        vhost_content.append(f"    # Security Headers")
        headers = headers_config.get("headers", {})
        for h_key, h_val in headers.items():
            vhost_content.append(f"    Header always set {h_key} \"{h_val}\"")
            
        vhost_content.append(f"")
        vhost_content.append(f"    # Request Enrichment")
        enrich_headers = enrichment_config.get("inject_headers", {})
        for e_key, e_val in enrich_headers.items():
            # Use request_id placeholder compatible with Apache if needed
            val_to_use = "expr=%{ENV:UNIQUE_ID}" if "request_id" in e_val else f"\"{e_val}\""
            vhost_content.append(f"    RequestHeader set {e_key} {val_to_use}")
            
        vhost_content.append(f"")
        vhost_content.append(f"    ProxyPreserveHost On")
        vhost_content.append(f"")
        
        # Route processing
        for route in routes:
            path = route.get("path")
            upstream = route.get("upstream")
            
            # Find upstream targets
            upstream_file = os.path.join(base_dir, "routing/upstreams", upstream, "pool-config")
            upstream_data = parse_simple_yaml(upstream_file)
            targets = upstream_data.get("targets", [])
            
            if targets:
                # Use the first target as standard proxy pass, or balancer member
                target = targets[0]
                vhost_content.append(f"    # Routing for {path} -> {upstream}")
                vhost_content.append(f"    ProxyPass \"{path}\" \"http://{target}{path}\"")
                vhost_content.append(f"    ProxyPassReverse \"{path}\" \"http://{target}{path}\"")
                vhost_content.append(f"")
                
        vhost_content.append(f"</VirtualHost>")
        vhosts.append("\n".join(vhost_content))
        
    apache_conf_path = os.path.join(output_dir, "apache", "httpd.conf")
    with open(apache_conf_path, "w") as f:
        f.write("# Generated by gateway compiler.py\n\n")
        f.write("LoadModule ssl_module modules/mod_ssl.so\n")
        f.write("LoadModule proxy_module modules/mod_proxy.so\n")
        f.write("LoadModule proxy_http_module modules/mod_proxy_http.so\n")
        f.write("LoadModule headers_module modules/mod_headers.so\n\n")
        f.write("Listen 443\n\n")
        f.write("\n\n".join(vhosts))
        f.write("\n")
        
    print(f"Generated Apache configuration at: {apache_conf_path}")

def generate_traefik(base_dir, output_dir):
    os.makedirs(os.path.join(output_dir, "traefik"), exist_ok=True)
    
    # Read core configs
    tls_config = parse_simple_yaml(os.path.join(base_dir, "edge/tls/termination-config"))
    headers_config = parse_simple_yaml(os.path.join(base_dir, "edge/security-headers/policy"))
    enrichment_config = parse_simple_yaml(os.path.join(base_dir, "edge/request-enrichment/policy"))
    
    # Read routes
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
                }
            }
        }
    }
    
    # Fill in CSP, Referrer, Permissions headers if present
    sec_headers = headers_config.get("headers", {})
    if "Content-Security-Policy" in sec_headers:
        traefik_dynamic["http"]["middlewares"]["security-headers"]["headers"]["contentSecurityPolicy"] = sec_headers["Content-Security-Policy"]
    if "Referrer-Policy" in sec_headers:
        traefik_dynamic["http"]["middlewares"]["security-headers"]["headers"]["referrerPolicy"] = sec_headers["Referrer-Policy"]
    if "Permissions-Policy" in sec_headers:
        traefik_dynamic["http"]["middlewares"]["security-headers"]["headers"]["permissionsPolicy"] = sec_headers["Permissions-Policy"]
        
    for app in apps:
        app_routes_file = os.path.join(routes_dir, app, "routes")
        app_data = parse_simple_yaml(app_routes_file)
        if not app_data:
            continue
            
        domain = app_data.get("domain", "localhost")
        routes = app_data.get("routes", [])
        
        for idx, route in enumerate(routes):
            path = route.get("path")
            upstream = route.get("upstream")
            
            router_name = f"{app}-{upstream}-{idx}"
            
            # Traefik Router
            traefik_dynamic["http"]["routers"][router_name] = {
                "rule": f"Host(`{domain}`) && PathPrefix(`{path}`)",
                "service": upstream,
                "entryPoints": ["websecure"],
                "middlewares": ["security-headers", "request-enrichment"],
                "tls": {}
            }
            
            # Find upstream targets
            upstream_file = os.path.join(base_dir, "routing/upstreams", upstream, "pool-config")
            upstream_data = parse_simple_yaml(upstream_file)
            targets = upstream_data.get("targets", [])
            
            # Traefik Service
            traefik_dynamic["http"]["services"][upstream] = {
                "loadBalancer": {
                    "servers": [{"url": f"http://{target}"} for target in targets]
                }
            }
            
    traefik_conf_path = os.path.join(output_dir, "traefik", "traefik.yaml")
    with open(traefik_conf_path, "w") as f:
        f.write("# Generated by gateway compiler.py\n")
        yaml.safe_dump(traefik_dynamic, f, default_flow_style=False)
        
    print(f"Generated Traefik configuration at: {traefik_conf_path}")

def main():
    parser = argparse.ArgumentParser(description="Compile abstract gateway routing configuration to proxy files.")
    parser.add_argument("--proxy", choices=["nginx", "apache", "traefik", "all"], default="all", help="Target proxy configuration to generate")
    args = parser.parse_args()
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(current_dir)
    
    if args.proxy in ["nginx", "all"]:
        generate_nginx(base_dir, current_dir)
    if args.proxy in ["apache", "all"]:
        generate_apache(base_dir, current_dir)
    if args.proxy in ["traefik", "all"]:
        generate_traefik(base_dir, current_dir)

if __name__ == "__main__":
    main()
