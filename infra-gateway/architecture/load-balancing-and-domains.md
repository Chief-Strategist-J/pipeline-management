# Load Balancing Algorithms & Domain Configurations

This document explains the mathematical formulas behind our load balancing algorithms and describes the gateway domain routing configurations.

---

## ⚖️ Load Balancing Algorithms & Formulas

When you specify `load_balancing` in a service's [pool-config](file:///home/btpl-lap-22/live/pipeline-management/infra-gateway/routing/upstreams/user-service/pool-config), the gateways translate it into one of these mathematical distribution models:

### 1. Round Robin (RR)
Requests are distributed sequentially across the pool of $N$ servers.
* **Selection Formula**:
  $$S_k = k \pmod N$$
  Where $S_k$ is the chosen server index for the $k$-th incoming request.
* **Weighted Round Robin (WRR)**:
  If backends have different capacities represented by weight $W_i$:
  $$P(\text{Server}_i) = \frac{W_i}{\sum_{j=1}^{N} W_j}$$
  The server with weight $W_i$ receives a proportional probability $P$ of traffic allocation.

### 2. Least Connections (LC)
Requests are routed to the backend server with the lowest number of active concurrent connections.
* **Selection Formula**:
  $$\text{Target} = \arg\min_{i \in [1, N]} (C_i)$$
  Where $C_i$ is the active connection count on backend server $i$. In case of a tie, standard Round Robin is applied among the tied servers.

### 3. IP Hash / Consistent Hashing
Secures session stickiness by hashing the client's IP address.
* **Basic Hash Formula**:
  $$\text{Target} = H(\text{Client IP}) \pmod N$$
  Where $H$ is a hashing algorithm (like MurmurHash or MD5) yielding a 32-bit integer, and $N$ is the count of active servers.
* **Consistent Hashing (Ketama Ring)**:
  Used to prevent rehashing of all keys when a server node is added/removed:
  $$\text{Target} = \text{ClockwiseClosestNode}(H(\text{Client IP}))$$

---

## 🌐 Domain Configurations & DNS Strategy

### 1. DNS Split-Horizon Routing
To secure backend topologies, we implement split-horizon DNS:
* **External Clients**: Resolve `api.example.com` to the gateway's Public LoadBalancer IP (Layer 1 Edge).
* **Internal/VPN Nodes**: Resolve `api.example.com` to the private cluster gateway VIP, bypassing public edge firewalls.

### 2. Abstract Domain Specification
Domains are defined at the root level of your rules file (e.g. `domain: "api.example.com"`).
* **Wildcards**: Supports wildcards (e.g., `domain: "*.example.com"`) for multi-tenant SaaS routing.
* **Multi-Domain Mapping**:
  To add another domain, create a new sub-folder in [routing/rules/](file:///home/btpl-lap-22/live/pipeline-management/infra-gateway/routing/rules/) (e.g., `customer-portal/`) containing a dedicated `routes` definition file.
