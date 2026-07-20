import os
from gateway_cli.adapters.nginx_adapter import NginxAdapter
from gateway_cli.adapters.apache_adapter import ApacheAdapter
from gateway_cli.adapters.traefik_adapter import TraefikAdapter

def run_compile(target_proxy: str, base_dir: str, output_dir: str):
    adapters = {
        "nginx": NginxAdapter(),
        "apache": ApacheAdapter(),
        "traefik": TraefikAdapter()
    }
    
    if target_proxy == "all":
        for name, adapter in adapters.items():
            adapter.generate(base_dir, output_dir)
    elif target_proxy in adapters:
        adapters[target_proxy].generate(base_dir, output_dir)
    else:
        print(f"Error: Unknown proxy target '{target_proxy}'")
