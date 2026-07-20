# Runtime Adapters

This directory contains the runtime adapters that translate the abstract configuration defined in `/edge` and `/routing` into concrete, deployable configurations for specific reverse proxies.

Currently supported proxies:
- **Nginx**: Location block mapping, upstream groups, limits.
- **Apache (httpd)**: VirtualHost, ProxyPass, and ProxyPassReverse configs.

## Translation
Use the provided `compiler.py` script to generate fresh Nginx or Apache config files from the base rules:
```bash
python3 compiler.py --proxy nginx
python3 compiler.py --proxy apache
```
