import os
from .base import ProxyAdapter

class ApacheAdapter(ProxyAdapter):

    def generate(self, base_dir: str, output_dir: str) -> None:
        os.makedirs(os.path.join(output_dir, "apache"), exist_ok=True)
        
        tls_config = self.parse_yaml(os.path.join(base_dir, "edge/tls/termination-config"))
        headers_config = self.parse_yaml(os.path.join(base_dir, "edge/security-headers/policy"))
        enrichment_config = self.parse_yaml(os.path.join(base_dir, "edge/request-enrichment/policy"))
        ocsp_config = self.parse_yaml(os.path.join(base_dir, "edge/tls/ocsp-stapling-policy"))
        
        routes_dir = os.path.join(base_dir, "routing/rules")
        apps = []
        if os.path.exists(routes_dir):
            apps = os.listdir(routes_dir)
            
        vhosts = []
        
        for app in apps:
            app_routes_file = os.path.join(routes_dir, app, "routes")
            app_data = self.parse_yaml(app_routes_file)
            if not app_data:
                continue
                
            domain = app_data.get("domain", "localhost")
            virtual_ip = app_data.get("virtual_ip", "*")
            routes = app_data.get("routes", [])
            
            vhost_content = []
            vhost_content.append(f"<VirtualHost {virtual_ip}:443>")
            vhost_content.append(f"    ServerName {domain}")
            vhost_content.append(f"")
            vhost_content.append(f"    SSLEngine on")
            vhost_content.append(f'    SSLCertificateFile "/etc/ssl/certs/{domain}.crt"')
            vhost_content.append(f'    SSLCertificateKeyFile "/etc/ssl/private/{domain}.key"')
            
            ssl_protocols = tls_config.get("ssl_protocols", ["TLSv1.2", "TLSv1.3"])
            ssl_ciphers = tls_config.get("ssl_ciphers", "high")
            
            apache_protocols = " ".join([f"+{p}" for p in ssl_protocols])
            vhost_content.append(f"    SSLProtocol all -SSLv3 {apache_protocols}")
            vhost_content.append(f"    SSLCipherSuite {ssl_ciphers}")
            vhost_content.append(f"    SSLHonorCipherOrder on")
            vhost_content.append(f"")

            ocsp_stapling = ocsp_config.get("ocsp_stapling", {})
            if ocsp_stapling.get("enabled", False):
                vhost_content.append(f"    SSLUseStapling On")
                resolver_cfg = ocsp_config.get("resolver", {})
                timeout = str(resolver_cfg.get("timeout", "5s")).rstrip("s")
                vhost_content.append(f"    SSLStaplingResponderTimeout {timeout}")
                vhost_content.append(f"    SSLStaplingReturnResponderErrors Off")
                responder_cfg = ocsp_config.get("responder", {})
                override_url = responder_cfg.get("override_url", "")
                if override_url:
                    vhost_content.append(f"    SSLStaplingForceURL {override_url}")
                vhost_content.append(f"")
            
            headers = headers_config.get("headers", {})
            for h_key, h_val in headers.items():
                vhost_content.append(f'    Header always set {h_key} "{h_val}"')
                
            vhost_content.append(f"")
            enrich_headers = enrichment_config.get("inject_headers", {})
            for e_key, e_val in enrich_headers.items():
                val_to_use = "expr=%{ENV:UNIQUE_ID}" if "request_id" in e_val else f'"{e_val}"'
                vhost_content.append(f"    RequestHeader set {e_key} {val_to_use}")
                
            vhost_content.append(f"")
            vhost_content.append(f"    ProxyPreserveHost On")
            vhost_content.append(f"")
            
            for route in routes:
                path = route.get("path")
                upstream = route.get("upstream")
                
                upstream_file = os.path.join(base_dir, "routing/upstreams", upstream, "pool-config")
                upstream_data = self.parse_yaml(upstream_file)
                targets = upstream_data.get("targets", [])
                
                if targets:
                    target = targets[0]
                    vhost_content.append(f'    ProxyPass "{path}" "http://{target}{path}"')
                    vhost_content.append(f'    ProxyPassReverse "{path}" "http://{target}{path}"')
                    vhost_content.append(f"")
                    
            vhost_content.append(f"</VirtualHost>")
            vhosts.append("\n".join(vhost_content))
            
        apache_conf_path = os.path.join(output_dir, "apache", "httpd.conf")
        with open(apache_conf_path, "w") as f:
            f.write("LoadModule ssl_module modules/mod_ssl.so\n")
            f.write("LoadModule proxy_module modules/mod_proxy.so\n")
            f.write("LoadModule proxy_http_module modules/mod_proxy_http.so\n")
            f.write("LoadModule headers_module modules/mod_headers.so\n")
            ocsp_stapling = ocsp_config.get("ocsp_stapling", {})
            if ocsp_stapling.get("enabled", False):
                cache_cfg = ocsp_config.get("cache", {})
                if cache_cfg.get("type") == "shared":
                    f.write("LoadModule socache_shmcb_module modules/mod_socache_shmcb.so\n")
            f.write("\nListen 443\n\n")

            ocsp_stapling = ocsp_config.get("ocsp_stapling", {})
            if ocsp_stapling.get("enabled", False):
                cache_cfg = ocsp_config.get("cache", {})
                if cache_cfg.get("type") == "shared":
                    raw_size = str(cache_cfg.get("shared_zone_size", "10m")).strip().lower()
                    if raw_size.endswith("m"):
                        bytes_size = str(int(raw_size[:-1]) * 1024 * 1024)
                    elif raw_size.endswith("k"):
                        bytes_size = str(int(raw_size[:-1]) * 1024)
                    elif raw_size.isdigit():
                        bytes_size = raw_size
                    else:
                        bytes_size = "512000"
                    f.write(f'SSLStaplingCache "shmcb:/var/run/ocsp({bytes_size})"\n\n')
                elif cache_cfg.get("type") == "file":
                    file_path = cache_cfg.get("file_path", "/var/cache/httpd/ocsp")
                    f.write(f'SSLStaplingCache "dbm:{file_path}"\n\n')

            f.write("\n\n".join(vhosts))
            f.write("\n")
            
        print(f"Generated Apache configuration at: {apache_conf_path}")
