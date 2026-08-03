# Pipeline & Infrastructure Management

This repository contains Kubernetes-native Jenkins pipeline configurations, infrastructure gateway routing definitions, dynamic sandbox provisioning utilities, and reverse proxy compilation tools.

---

## 📂 Project Structure

* [deploy/kubernetes/](./deploy/kubernetes/) — Production Kustomize manifests for running Jenkins agents and proxy gateways in Kubernetes.
* [infra-gateway/](./infra-gateway/) — Centralized reverse proxy configuration, sandbox generator, routing policies, and the CLI compiler tool.
* [OpenAPI v1 Contract](./infra-gateway/contracts/openapi/v1.yaml) — OpenAPI specification for Dynamic Sandbox creation and management endpoints.
* [Load Balancing & Domains Docs](./infra-gateway/architecture/load-balancing-and-domains.md) — Math formulas for distribution models (Round Robin, Least Connections, IP Hash) and DNS strategies.
* [Kubernetes Networking & Services Docs](./infra-gateway/architecture/kubernetes-networking-and-services.md) — Architectural overview of K8s CNI, ClusterIP, kube-proxy iptables/IPVS distribution, and NetworkPolicies.
* [Upcoming Features Matrix](./infra-gateway/architecture/upcoming-roadmap-matrix.md) — Detailed matrix of 25 critical security, routing, and AI-deployment automation features.
* [policies/](./policies/) — Architecture policies, folder structure rules, and deployment non-negotiables.
* [Jenkinsfile](./Jenkinsfile) — Root Jenkins declarative pipeline for building and testing applications.

---

## 🚀 Virtual Server Gateway & Sandbox Management

The repository provides a centralized CLI tool to define routing, compile proxy configurations, and provision dynamic isolated sandbox environments for testing.

### ⏱️ Key Developer Benefits
* **Dynamic Sandbox Generator**: Auto-provision isolated Docker bridge networks and mock backends (`redis`, `postgres`, `nginx`) on demand in seconds.
* **Configure Once, Target Many**: Write routes once in abstract YAML and compile to Nginx (`nginx.conf`), Apache (`httpd.conf`), or Traefik (`traefik.yaml`).
* **Zero Syntax Errors**: Automatically applies standard production ciphers, HSTS, security headers, and reverse proxy forwardings.
* **Kubernetes Ready**: Pre-built non-root deployment manifests that load these compiled configurations via ConfigMaps.

---

## 💡 What You Can Do with the Gateway CLI

1. **Provision Dynamic Isolated Sandboxes**: Instantly launch and teardown isolated test environments with mock backends via `gateway-cli sandbox`.
2. **Deploy Frontend & Backend Apps Instantly**: Map new domains (e.g. `xyz.com`) to Python FastAPI, React, Node, or static HTML servers by adding simple YAML definitions.
3. **Compile Production Configurations**: Generate complex, secure reverse proxy configurations with upstreams, load-balancing pools, SSL setups, and security headers.
4. **Execute Zero-Downtime Hot-Reloads**: Start the file watcher daemon (`gateway-cli watch`) to automatically compile and gracefully reload proxy workers in the background without dropping active user connections.
5. **Enforce Edge DDoS Mitigation**: Protect backend servers with rate limiting (`limit_req_zone` / `rateLimit`) and secure HTTP response headers.
6. **Propagate Distributed Tracing**: Track requests across microservices using W3C standard OpenTelemetry `traceparent` headers injected at the gateway.

---

## 🛠️ How to Use the Gateway CLI

### 1. Installation
To install the CLI tool locally in developer mode:
```bash
pip install -e infra-gateway/
```

### 2. Sandbox Generator CLI Reference
```bash
# Provision a new isolated sandbox with Redis and Postgres mocks
gateway-cli sandbox create --name integration-test-env --mock redis,postgres

# List all active sandboxes and their network namespaces
gateway-cli sandbox list

# Destroy an isolated sandbox and clean up all Docker containers/networks
gateway-cli sandbox destroy --sandbox-id sbx-XXXXXXX
```

### 3. Proxy Configuration & Compiler CLI Reference
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

| Feature Name | Status | Category | Description |
| :--- | :--- | :--- | :--- |
| **Dynamic Sandbox Generator** | **Completed** ✅ | Environment Setup | Automatically provisions isolated namespaces, virtual networks, and mock dependencies for testing. |
| **AI Agent Deployment Protocol** | **Critical** | Workload Automation | Dynamically generate and execute mini-scripts to deploy autonomous AI agents on target nodes triggered via secure domain/URL webhook endpoints. |
| **Envoy & Caddy Runtime Adapters** | High | CLI Extensibility | Expand the compiler to generate configs for Envoy and Caddy proxy adaptors. |
| **Dynamic WAF ModSecurity Engine** | Medium | Security | Integrate Web Application Firewall (WAF) deep packet inspection at Layer 7. |
| **L7 Circuit Breaker Dashboard** | Medium | Observability | Visual dashboard displaying tripped circuits and real-time backend health statuses. |

---

## 🧪 Testing and Sandboxing

### Run Unit and Infrastructure Tests
Verify compiler logic, hexagonal sandbox architecture, and Docker integration:
```bash
PYTHONPATH=infra-gateway/src python3 -m unittest discover -s infra-gateway/tests
```

### Run Sandbox Concurrency Load Test
Execute 5-worker concurrent load testing benchmark:
```bash
python3 infra-gateway/tests/load_test_sandbox.py
```

### Run Local End-to-End Gateway Tests
Launch a live sandbox stack containing Nginx, Traefik, mock backends, and HTTPS test queries:
```bash
./infra-gateway/run-live-test.sh
```
*(Requires Docker and Docker Compose to be installed locally)*

