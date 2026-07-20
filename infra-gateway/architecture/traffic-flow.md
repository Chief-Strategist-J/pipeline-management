# Traffic Flow Through Gateway

```mermaid
graph TD
    Client[Client Request] --> L1[Layer 1: Edge Proxy]
    L1 -->|TLS, Rate Limiting, Enrichment| L2[Layer 2: Router]
    L2 -->|Path Mapping, Upstream Selection| L3[Layer 3: Auth Validation]
    L3 -->|Inject User Claims| Upstream[Upstream Service]
```

1. **Client** initiates connection to the Edge.
2. **Layer 1** terminates TLS, applies rate limits, injects headers (`X-Request-ID`), and checks IP blacklists.
3. **Layer 2** matches request path against routing patterns and decides target upstream group.
4. **Layer 3** extracts bearer tokens, verifies signatures/expiry, and injects identity context headers.
5. **Upstream** receives fully validated, enriched request.
