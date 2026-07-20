#!/usr/bin/env python3
import os
import sys

# Compatibility wrapper for watcher-agent.py pointing to new gateway_cli package
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../infra-gateway/src')))
from gateway_cli.main import main

if __name__ == "__main__":
    sys.argv = [sys.argv[0], "watch"]
    main()
