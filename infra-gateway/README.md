# Infrastructure Gateway (infra-gateway)

This directory defines the structure, policies, and runtime adapters for our edge proxy and routing layer.

## Responsibility
- **OWNS**: TLS termination, DDoS protection, rate limiting, routing path-to-upstream mapping, edge security headers, and request enrichment (e.g. injecting `Request-ID`).
- **DOES NOT OWN**: Authentication logic (only token validation/claims forwarding), business logic, or service-to-service internal contracts.

## Folder Structure
Conforming to [gateway-folder-structure.md](file:///home/btpl-lap-22/live/pipeline-management/policies/rules/folderStructure/gateway-folder-structure.md):
- `/architecture`: Routing layer documentation and flowcharts.
- `/edge`: TLS, rate limiting, security headers, and enrichment.
- `/routing`: Path matching rules, upstream pool configs, and health checks.
- `/auth`: Edge auth strategies and token validations.
- `/observability`: Log formatting, tracing context, and metrics definitions.
- `/runtime-adapters`: Target-specific configurations (Nginx, Apache, Traefik) compiled from the core definitions.

---

## 🚀 CLI Compiler Usage

The routing compiler acts as an automated CLI tool that generates deployment-ready configurations for Nginx, Apache, and Traefik reverse proxies.

### Commands

1. **Generate All Configs**:
   ```bash
   python3 runtime-adapters/compiler.py --proxy all
   ```
2. **Generate Nginx Configs Only**:
   ```bash
   python3 runtime-adapters/compiler.py --proxy nginx
   ```
3. **Generate Traefik Configs Only**:
   ```bash
   python3 runtime-adapters/compiler.py --proxy traefik
   ```
4. **Generate Apache Configs Only**:
   ```bash
   python3 runtime-adapters/compiler.py --proxy apache
   ```

---

## ⏱️ Time Saved & Developer Efficiency

* **Multi-Proxy Support**: Configure routes once, and run one CLI command to update Nginx, Apache, and Traefik config files automatically.
* **No Syntax Errors**: The tool generates exact directives for security headers, TLS ciphers, HSTS rules, and location blocks, preventing syntax or runtime startup errors.
* **Developer Onboarding**: Future developers only need to edit simple YAML files under `routing/rules/` instead of learning Nginx, Apache, or Traefik config syntaxes from scratch.

---

## 🧪 Testing and Sandbox Environments

### Running Unit Tests
Validate the CLI compiler logic:
```bash
python3 -m unittest tests/test_compiler.py
```

### Running Local Live End-to-End Test Suite
To verify generated proxy configs function correctly in a real sandbox:
```bash
./run-live-test.sh
```
This script will auto-generate SSL certs, boot up docker containers for backends, run Nginx and Traefik reverse proxies, test real HTTPS curls, and cleanly tear down afterwards.
