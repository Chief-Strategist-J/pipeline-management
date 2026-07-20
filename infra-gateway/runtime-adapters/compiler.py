#!/usr/bin/env python3
import os
import sys

# Compatibility wrapper for compiler.py pointing to new gateway_cli package
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))
from gateway_cli.main import main

if __name__ == "__main__":
    # Simulate the compile command format for legacy callers
    if len(sys.argv) == 1:
        sys.argv.extend(["compile", "--proxy", "all"])
    elif "--proxy" in sys.argv:
        proxy_idx = sys.argv.index("--proxy")
        if proxy_idx + 1 < len(sys.argv):
            target = sys.argv[proxy_idx + 1]
            sys.argv = [sys.argv[0], "compile", "--proxy", target]
            
    main()
