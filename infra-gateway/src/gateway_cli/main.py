#!/usr/bin/env python3
import os
import argparse

from gateway_cli.commands.compile import run_compile
from gateway_cli.commands.watch import run_watch
from gateway_cli.commands.reload import run_reload

def main():
    parser = argparse.ArgumentParser(description="Gateway-CLI: Manage and compile your proxy routing configurations.")
    subparsers = parser.add_subparsers(dest="command", help="Sub-commands to execute")
    
    # 1. Compile Command
    parser_compile = subparsers.add_parser("compile", help="Compile abstract config rules to target proxy config files.")
    parser_compile.add_argument("--proxy", choices=["nginx", "apache", "traefik", "all"], default="all", help="Target proxy runtime adapter")
    
    # 2. Watch Command
    parser_watch = subparsers.add_parser("watch", help="Watch routing rules for changes and trigger auto reloads.")
    
    # 3. Reload Command
    parser_reload = subparsers.add_parser("reload", help="Trigger a graceful configuration reload across proxy containers.")
    
    args = parser.parse_args()
    
    # Locate base paths
    current_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    if args.command == "compile":
        # Compile maps output to runtime-adapters directory
        run_compile(args.proxy, current_dir, os.path.join(current_dir, "runtime-adapters"))
    elif args.command == "watch":
        run_watch(current_dir)
    elif args.command == "reload":
        run_reload(current_dir)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
