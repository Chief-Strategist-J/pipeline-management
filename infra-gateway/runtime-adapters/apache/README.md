# Apache Runtime Adapter

This adapter compiles the gateway specification into Apache httpd `<VirtualHost>` blocks, relying on `mod_ssl`, `mod_proxy`, and `mod_proxy_http`.

## Generated Files
Running `compiler.py` generates:
- `httpd.conf`: The main Apache config file containing module loading, VirtualHosts, and route proxy entries.

## Target Mapping
- **TLS Configuration**: Maps to `SSLProtocol` and `SSLCipherSuite`.
- **Security Headers**: Generated as `Header always set` directives.
- **Request Enrichment**: Maps to `RequestHeader set` directives.
- **Routing Rules**: Translates into `ProxyPass` and `ProxyPassReverse` statements routing traffic to pool targets.
