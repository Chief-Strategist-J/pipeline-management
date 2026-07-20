# Authentication Strategy

All user authentication must be performed at the Gateway layer, before forwarding requests to backend upstreams.

## Key Principles:
1. **Unified Token Ingress**: Clients present JWTs or API keys to the gateway.
2. **Decentralized Verification**: Gateway checks signatures against an identity provider (IdP) public keys (JWKS).
3. **Identity Headers**: Upon validation, the gateway injects `X-User-ID`, `X-User-Roles`, and `X-Tenant-ID` downstream.
4. **Service Trust**: Upstreams assume that incoming requests containing these headers are already authenticated by the gateway.
