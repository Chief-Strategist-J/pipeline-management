# Gateway Tier Model / Layers

The gateway functions in three distinct, isolated layers:

## Layer 1: Edge
- **TLS Termination**: Handles HTTPS decryption and cipher negotiation.
- **Security Headers**: Injects HSTS, CSP, CORS, and clickjacking protection headers.
- **DDoS & Rate Limiting**: Basic ingress rate limiters to block brute force or abusive IPs.
- **Request Enrichment**: Injects `X-Request-ID` and logs incoming client IP.

## Layer 2: Router
- **Path Matching**: Evaluates route rules to map URI paths/domains to their respective upstreams.
- **Timeout & Retries**: Enforces configured proxy timeouts and retry policies.
- **Fallback / Mocking**: Serves static pages or maintenance notices if upstreams are unreachable.

## Layer 3: Auth Validation
- **Token Validation**: Performs signature checks on JWTs or validates API keys.
- **Claims Injection**: Extracts payload claims and injects them as downstream headers (e.g. `X-User-ID`, `X-User-Roles`).
- **No Authorization**: Business authorization rules remain inside service boundaries; the gateway only verifies identity.
