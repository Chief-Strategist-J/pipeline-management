#!/usr/bin/env python3
import os
import argparse

from adapters.nginx_adapter import NginxAdapter
from adapters.apache_adapter import ApacheAdapter
from adapters.traefik_adapter import TraefikAdapter

def main():
    parser = argparse.ArgumentParser(description="Compile abstract gateway routing configuration to proxy files.")
    parser.add_argument("--proxy", choices=["nginx", "apache", "traefik", "all"], default="all", help="Target proxy configuration to generate")
    args = parser.parse_args()
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(current_dir)
    
    adapters = {
        "nginx": NginxAdapter(),
        "apache": ApacheAdapter(),
        "traefik": TraefikAdapter()
    }
    
    if args.proxy == "all":
        for name, adapter in adapters.items():
            adapter.generate(base_dir, current_dir)
    else:
        adapters[args.proxy].generate(base_dir, current_dir)

if __name__ == "__main__":
    main()
