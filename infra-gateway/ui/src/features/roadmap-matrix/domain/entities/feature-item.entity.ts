export interface FeatureItem {
  id: number;
  name: string;
  category: string;
  description: string;
  status: "completed" | "critical" | "high" | "medium";
}

export const ROADMAP_FEATURES: FeatureItem[] = [
  { id: 1, name: "Dynamic Sandbox Generator", category: "Environment Setup", description: "Provisions isolated namespaces, virtual networks, and mock dependencies.", status: "completed" },
  { id: 2, name: "AI Agent Script Engine", category: "Workload Automation", description: "Generates tailored mini-scripts on target nodes via secure URL protocols.", status: "critical" },
  { id: 3, name: "Sandbox Penetration Auditor", category: "Security Audit", description: "Runs automated vulnerability scans (port scanning, path traversal) on compiled virtual environments.", status: "critical" },
  { id: 4, name: "Shadow Traffic Copier", category: "Testing", description: "Copies/shadows live production HTTP requests to test code changes with real traffic patterns.", status: "critical" },
  { id: 5, name: "Stateful GitOps Rollbacks", category: "Immutable State", description: "Tracks compiled configurations using Git hashes and performs instant rollbacks.", status: "critical" },
  { id: 6, name: "Zero-Trust Network Policy Verify", category: "Network Security", description: "Verifies no unauthorized ingress/egress occurs inside virtual test networks.", status: "critical" },
  { id: 7, name: "Active L7 WAF Compiler", category: "Edge Security", description: "Translates declarative security policies into ModSecurity or Coraza WAF rules.", status: "critical" },
  { id: 8, name: "Mutually Authenticated TLS (mTLS)", category: "Cryptography", description: "Enforces client certificate validation for secure subdomains and microservices.", status: "critical" },
  { id: 9, name: "Behavioral Rate Limiting", category: "DDoS Mitigation", description: "Adjusts Token Bucket limits dynamically on clients exhibiting abusive behaviors.", status: "critical" },
  { id: 10, name: "Vault Secret Integration", category: "Secrets", description: "Sources backend passwords, DB tokens, and SSL private keys from HashiCorp Vault at runtime.", status: "critical" },
  { id: 11, name: "IP Blacklist & GeoIP Synchronizer", category: "Security", description: "Syncs firewalls and proxies with malicious IP feeds and restricts traffic by country code.", status: "critical" },
  { id: 12, name: "W3C Security Headers Enforcement", category: "Policy", description: "Compiles dynamic CSP, HSTS, and Permissions-Policy on all virtual hosts.", status: "critical" },
  { id: 13, name: "JWT Claim-to-Header Translator", category: "Auth Validation", description: "Decrypts and validates JWTs at the edge, stripping bearer token and injecting claims.", status: "critical" },
  { id: 14, name: "CORS Policy Compiler", category: "Access Control", description: "Translates CORS rules into proxy-specific directives per route path.", status: "critical" },
  { id: 15, name: "Kernel Egress Firewall Translator", category: "Network Security", description: "Compiles egress routing rules directly into host-level nftables/iptables rules.", status: "critical" },
  { id: 16, name: "OCSP Stapling Engine", category: "Performance", description: "Automatically resolves and caches CA revocation statuses at proxy edge to reduce TLS latency.", status: "completed" },
  { id: 17, name: "TLS Session Resumption (Tickets)", category: "Performance", description: "Enables returning clients to execute 0-RTT handshakes without renegotiations.", status: "high" },
  { id: 18, name: "Brotli Compression Adapter", category: "Speed", description: "Compiles Nginx and Traefik compression adapters supporting Brotli while avoiding BREACH attacks.", status: "high" },
  { id: 19, name: "HTTP/3 (QUIC) Engine", category: "Protocol", description: "Generates configurations for UDP-based HTTP/3 traffic routing (0-RTT).", status: "high" },
  { id: 20, name: "Zero-Overhead IPVS Compiler", category: "Load Balancing", description: "Translates load-balancing rules into Linux Kernel IPVS hash tables (O(1) lookup).", status: "high" },
  { id: 21, name: "Split-Horizon DNS Sync Engine", category: "DNS Strategy", description: "Synchronizes public cloud DNS mappings with local VPN configurations.", status: "medium" },
  { id: 22, name: "L7 Circuit Breaker & Failover", category: "Resilience", description: "Trips routes dynamically based on HTTP error ratios and redirects to static fallback pages.", status: "medium" },
  { id: 23, name: "K8s Gateway API (v1) Mapping", category: "API Standard", description: "Compiles abstract routing configuration directly into Kubernetes IngressRoute and Gateway API manifests.", status: "medium" },
  { id: 24, name: "LoadBalancer Auto-Provisioner", category: "Cloud Integration", description: "Connects to Cloud APIs (AWS, GCP) to provision and configure Cloud Load Balancers.", status: "medium" },
  { id: 25, name: "Syntax Dry-Run Sandbox", category: "Validation", description: "Spins up micro-Docker containers to validate generated config syntax before production reload.", status: "medium" },
];
