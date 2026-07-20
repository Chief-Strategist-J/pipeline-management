# Nginx Runtime Adapter

This adapter compiles the gateway specification into Nginx `server` blocks and `upstream` pools.

## Generated Files
Running `compiler.py` generates:
- `nginx.conf`: The main Nginx configuration containing upstreams and HTTP block with all compiled virtual hosts.

## Target Mapping
- **TLS Configuration**: Maps to `ssl_protocols` and `ssl_ciphers`.
- **Security Headers**: Generated as `add_header` statements.
- **Request Enrichment**: Maps to `proxy_set_header` values.
- **Routing Rules**: Translates into `location` blocks within server blocks, proxying to matching upstream groups.
