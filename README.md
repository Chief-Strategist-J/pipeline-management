# Pipeline & Infrastructure Management

This repository contains Kubernetes-native Jenkins pipeline configurations, infrastructure gateway routing definitions, and reverse proxy compilation utilities.

---

## 📂 Project Structure

* [deploy/kubernetes/](file:///home/btpl-lap-22/live/pipeline-management/deploy/kubernetes/) — Production Kustomize manifests for running Jenkins agents and proxy gateways in Kubernetes.
* [infra-gateway/](file:///home/btpl-lap-22/live/pipeline-management/infra-gateway/) — Centralized reverse proxy configuration, routing policies, and the CLI compiler tool.
* [Load Balancing & Domains Docs](file:///home/btpl-lap-22/live/pipeline-management/infra-gateway/architecture/load-balancing-and-domains.md) — Math formulas for distribution models (Round Robin, Least Connections, IP Hash) and DNS strategies.
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

## 🛠️ How to Use the Gateway CLI

### 1. Compile Proxy Configurations
Run the compiler tool from the `infra-gateway/runtime-adapters/` directory:
```bash
# Generate configs for Nginx, Apache, and Traefik
python3 infra-gateway/runtime-adapters/compiler.py --proxy all

# Generate configs for a single proxy only
python3 infra-gateway/runtime-adapters/compiler.py --proxy nginx
python3 infra-gateway/runtime-adapters/compiler.py --proxy traefik
python3 infra-gateway/runtime-adapters/compiler.py --proxy apache
```

### 2. Defining New Routes
To deploy a new path or microservice:
1. Open the routes config: [routing/rules/example-app/routes](file:///home/btpl-lap-22/live/pipeline-management/infra-gateway/routing/rules/example-app/routes).
2. Append your new routing rules:
   ```yaml
     - path: "/v1/new-service"
       upstream: "new-service"
       methods: [GET, POST]
       auth_required: true
   ```
3. Run the compiler command above.

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
