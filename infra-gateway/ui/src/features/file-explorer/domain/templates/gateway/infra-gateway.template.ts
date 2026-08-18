import { createGenericTree } from "../builder/sub-package-tree.builder";

export const INFRA_GATEWAY_TEMPLATE = createGenericTree(
  "infra-gateway-policy",
  "Infrastructure Gateway Architecture (gateway-folder-structure.md)",
  "Official Tiered Gateway layout: edge (TLS/rate-limit), routing (upstreams/timeouts), auth, observability, runtime-adapters",
  "gateway",
  "infra-gateway",
  [
    {
      id: "root-gw",
      name: "infra-gateway",
      path: "infra-gateway",
      type: "folder",
      children: [
        {
          id: "gw-arch",
          name: "architecture",
          path: "infra-gateway/architecture",
          type: "folder",
          children: [
            {
              id: "gw-layers",
              name: "layers.md",
              path: "infra-gateway/architecture/layers.md",
              type: "file",
              content: "# Tier Model\nLayer 1: Edge (TLS, DDoS, Rate Limit)\nLayer 2: Router (Path -> Service)\nLayer 3: Auth (Token validation)",
            },
            {
              id: "gw-traffic",
              name: "traffic-flow.md",
              path: "infra-gateway/architecture/traffic-flow.md",
              type: "file",
              content: "# Traffic Flow\nClient -> Edge -> Router -> Auth -> Upstream",
            },
          ],
        },
        {
          id: "gw-edge",
          name: "edge",
          path: "infra-gateway/edge",
          type: "folder",
          children: [
            {
              id: "gw-tls",
              name: "tls",
              path: "infra-gateway/edge/tls",
              type: "folder",
              children: [
                {
                  id: "gw-tls-cfg",
                  name: "termination.config",
                  path: "infra-gateway/edge/tls/termination.config",
                  type: "file",
                  content: "tls_min_version: 1.3\nciphers: ECDHE-ECDSA-AES256-GCM-SHA384",
                },
              ],
            },
            {
              id: "gw-rate-limit",
              name: "rate-limiting",
              path: "infra-gateway/edge/rate-limiting",
              type: "folder",
              children: [
                {
                  id: "gw-rl-ip",
                  name: "per-ip.config",
                  path: "infra-gateway/edge/rate-limiting/per-ip.config",
                  type: "file",
                  content: "rate: 100r/s\nburst: 20",
                },
              ],
            },
          ],
        },
        {
          id: "gw-routing",
          name: "routing",
          path: "infra-gateway/routing",
          type: "folder",
          children: [
            {
              id: "gw-upstreams",
              name: "upstreams",
              path: "infra-gateway/routing/upstreams",
              type: "folder",
              children: [
                {
                  id: "gw-upstream-pool",
                  name: "pool-config",
                  path: "infra-gateway/routing/upstreams/pool-config",
                  type: "file",
                  content: "max_connections: 1000\ntimeout_ms: 3000",
                },
              ],
            },
          ],
        },
        {
          id: "gw-auth",
          name: "auth",
          path: "infra-gateway/auth",
          type: "folder",
          children: [
            {
              id: "gw-auth-strat",
              name: "strategy.md",
              path: "infra-gateway/auth/strategy.md",
              type: "file",
              content: "# Auth Strategy\nValidate JWT claims at gateway edge.",
            },
          ],
        },
        {
          id: "gw-observability",
          name: "observability",
          path: "infra-gateway/observability",
          type: "folder",
          children: [
            {
              id: "gw-access-log",
              name: "access-log-format",
              path: "infra-gateway/observability/access-log-format",
              type: "file",
              content: "json_format: request_id, client_ip, upstream, status, latency_ms",
            },
          ],
        },
      ],
    },
  ]
);
