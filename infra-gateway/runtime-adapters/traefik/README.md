# Traefik Runtime Adapter

This adapter compiles the gateway specification into a Traefik HTTP router dynamic configuration provider file.

## Generated Files
Running `compiler.py` generates:
- `traefik.yaml`: The dynamic configuration containing routes, services, and middlewares (headers).

## Target Mapping
- **TLS Configuration**: Maps to router `tls` directives and HSTS headers.
- **Security Headers**: Generated inside the `security-headers` middleware.
- **Request Enrichment**: Maps to `customRequestHeaders` within the `request-enrichment` middleware.
- **Routing Rules**: Translates to HTTP routers and dynamic services mapping to downstream targets.
