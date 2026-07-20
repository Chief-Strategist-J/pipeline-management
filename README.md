# Pipeline & Infrastructure Management

This repository contains Kubernetes-native Jenkins pipeline configurations, infrastructure gateway routing definitions, and reverse proxy compilation utilities.

---

## 📂 Project Structure

* [deploy/kubernetes/](file:///home/btpl-lap-22/live/pipeline-management/deploy/kubernetes/) — Production Kustomize manifests for running Jenkins agents and proxy gateways in Kubernetes.
* [infra-gateway/](file:///home/btpl-lap-22/live/pipeline-management/infra-gateway/) — Centralized reverse proxy configuration, routing policies, and the CLI compiler tool.
* [Load Balancing & Domains Docs](file:///home/btpl-lap-22/live/pipeline-management/infra-gateway/architecture/load-balancing-and-domains.md) — Math formulas for distribution models (Round Robin, Least Connections, IP Hash) and DNS strategies.
* [Kubernetes Networking & Services Docs](file:///home/btpl-lap-22/live/pipeline-management/infra-gateway/architecture/kubernetes-networking-and-services.md) — Architectural overview of K8s CNI, ClusterIP, kube-proxy iptables/IPVS distribution, and NetworkPolicies.
* [Upcoming Features Matrix](file:///home/btpl-lap-22/live/pipeline-management/infra-gateway/architecture/upcoming-roadmap-matrix.md) — Detailed matrix of 25 critical security, routing, and AI-deployment automation features.
* [policies/](file:///home/btpl-lap-22/live/pipeline-management/policies/) — Architecture policies, folder structure rules, and deployment non-negotiables.
* [Jenkinsfile](file:///home/btpl-lap-22/live/pipeline-management/Jenkinsfile) — Root Jenkins declarative pipeline for building and testing applications.

---

## 🚀 Virtual Server Gateway (Nginx, Apache, Traefik)

The repository provides a centralized CLI tool to define routing, TLS, security headers, and rate limits in a single configuration workspace, compiling them dynamically for Nginx, Apache, and Traefik reverse proxies.

### ⏱️ Key Developer Benefits
* **Configure Once, Target Many**: Write routes once in abstract YAML and compile to Nginx (`nginx.conf`), Apache (`httpd.conf`), or Traefik (`traefik.yaml`).
* **Zero Syntax Errors**: Automatically applies standard production ciphers, HSTS, security headers, and reverse proxy forwardings.
* **Kubernetes Ready**: Pre-built non-root deployment manifests that load these compiled configurations via ConfigMaps.

---

## 💡 What You Can Do with the Gateway CLI

1. **Deploy Frontend & Backend Apps Instantly**: Map new domains (e.g. `xyz.com`) to Python FastAPI, React, Node, or static HTML servers by adding simple YAML definitions.
2. **Compile Production Configurations**: Generate complex, secure reverse proxy configurations with upstreams, load-balancing pools, SSL setups, and security headers.
3. **Execute Zero-Downtime Hot-Reloads**: Start the file watcher daemon (`gateway-cli watch`) to automatically compile and gracefully reload proxy workers in the background without dropping active user connections.
4. **Enforce Edge DDoS Mitigation**: Protect backend servers with rate limiting (`limit_req_zone` / `rateLimit`) and secure HTTP response headers.
5. **Propagate Distributed Tracing**: Track requests across microservices using W3C standard OpenTelemetry `traceparent` headers injected at the gateway.

---

## 🛠️ How to Use the Gateway CLI

### 1. Installation
To install the CLI tool locally in developer mode:
```bash
pip install -e infra-gateway/
```

### 2. CLI Command Reference
```bash
# Compile abstract config rules to target proxy config files
gateway-cli compile --proxy all

# Watch routing rules for changes and trigger auto reloads dynamically
gateway-cli watch

# Manually trigger a graceful config reload across proxy containers
gateway-cli reload
```

---

## 🗺️ Upcoming Critical Features (Roadmap)

The next major releases will focus on protocol development and dynamic workload execution:

| Feature Name | Priority | Category | Description |
| :--- | :--- | :--- | :--- |
| **AI Agent Deployment Protocol** | **Critical** | Workload Automation | Dynamically generate and execute mini-scripts to deploy autonomous AI agents on target nodes triggered via secure domain/URL webhook endpoints. |
| **Envoy & Caddy Runtime Adapters** | High | CLI Extensibility | Expand the compiler to generate configs for Envoy and Caddy proxy adaptors. |
| **Dynamic WAF ModSecurity Engine** | Medium | Security | Integrate Web Application Firewall (WAF) deep packet inspection at Layer 7. |
| **L7 Circuit Breaker Dashboard** | Medium | Observability | Visual dashboard displaying tripped circuits and real-time backend health statuses. |

---

## 🧪 Testing and Sandboxing

### Run Compiler Unit Tests
Verify the parser and compiler logic:
```bash
python3 -m unittest infra-gateway/tests/test_compiler.py
```

### Run Local End-to-End Tests
Launch a live sandbox stack containing Nginx, Traefik, mock backends, and HTTPS test queries:
```bash
./infra-gateway/run-live-test.sh
```
*(Requires Docker and Docker Compose to be installed locally)*
