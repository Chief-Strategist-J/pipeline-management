# Gateway Failure Modes

This document details common gateway failures and fallback actions.

| Failure Scenario | Detecting Layer | Fallback Behavior / Action | Status Code |
|---|---|---|---|
| Invalid TLS Certificate / Cipher Handshake | Layer 1 (Edge) | Reject Connection immediately | None (TCP Reset) |
| Rate Limit Exceeded | Layer 1 (Edge) | Serve HTTP 429 Too Many Requests | 429 |
| Upstream Unreachable (DNS/Connect Failure) | Layer 2 (Router) | Attempt next server, or serve static Maintenance Page | 502 / 503 |
| Upstream Connection Timeout | Layer 2 (Router) | Terminate downstream connection | 504 Gateway Timeout |
| Expired / Invalid JWT Token | Layer 3 (Auth) | Reject request, do not pass to upstream | 401 Unauthorized |
| Missing Required Headers / Claims | Layer 3 (Auth) | Reject request | 403 Forbidden |
