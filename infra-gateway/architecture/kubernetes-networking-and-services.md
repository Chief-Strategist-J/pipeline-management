# Kubernetes Services & Networking Architecture

This document describes how Kubernetes manages internal networking, services, traffic distribution, and network security policies under the hood.

---

## 1. The Pod Network (CNI - Container Network Interface)

In Kubernetes, every Pod gets its own unique, routable IP address within the cluster.
* **Flat Network Design**: The CNI (e.g., Calico, Flannel, Cilium) ensures that all Pods can communicate with all other Pods directly across nodes without requiring Network Address Translation (NAT).
* **IP-per-Pod**: Containers inside the same Pod share the same network namespace and IP address, communicating with each other via `localhost`.

---

## 2. Kubernetes Services (Traffic Abstraction)

Since Pods are ephemeral (they can die and get recreated with new IP addresses), Kubernetes uses **Services** to provide a persistent IP and DNS name to route traffic to a dynamic group of Pods.

```
External Traffic ──> Ingress/Gateway ──> Service (ClusterIP) ──> Pod A / Pod B (Targets)
```

### Service Types

| Service Type | Scope | How It Works |
| :--- | :--- | :--- |
| **ClusterIP** | Internal | Creates a stable, internal-only Virtual IP (VIP) inside the cluster. |
| **NodePort** | External | Opens a static port (usually 30000-32767) on every Kubernetes Node's IP, forwarding traffic to the ClusterIP. |
| **LoadBalancer** | External | Provisions a cloud provider's external load balancer (e.g., AWS ALB, GCP LB) that routes directly into the NodePorts. |

---

## 3. How Traffic is Distributed (Kube-Proxy)

Every node runs a component called **`kube-proxy`**. It is responsible for monitoring the Kubernetes API server for additions/removals of Services and Endpoint slices, and translating them into raw network rules on the host node.

`kube-proxy` operates in one of two modes:

### A. iptables Mode (Default)
* **Mechanism**: `kube-proxy` writes `iptables` rules in the host's Linux kernel.
* **Distribution Algorithm**: Randomized distribution using `statistic` modules.
* **Math/Logic**: For $N$ target pods, the probability of selecting the $i$-th pod is:
  $$P(\text{Pod}_i) = \frac{1}{N - i + 1}$$
* **Limitation**: `iptables` evaluates rules sequentially (an $O(N)$ lookup time), which degrades performance in clusters with thousands of services.

### B. IPVS Mode (IP Virtual Server)
* **Mechanism**: Netfilter-based L4 load-balancing inside the Linux kernel.
* **Distribution Algorithm**: Supports true load-balancing algorithms like Round Robin, Least Connections, and Destination Hashing.
* **Math/Logic**: $O(1)$ constant time lookup via hash tables, making it highly scalable for massive clusters.

---

## 4. Edge Traffic Control (Ingress & Gateway API)

While a Service handles TCP/UDP routing, **Ingress Controllers** (like our compiled Nginx/Traefik setups) handle Layer 7 HTTP/HTTPS traffic routing:
1. External client hits the Ingress LoadBalancer on Port 443.
2. Ingress terminates SSL/TLS and inspects the HTTP Host Header (`api.xyz.com`) and Path (`/api`).
3. Ingress uses Kubernetes DNS to resolve the target Service (e.g. `python-service.gateway.svc.cluster.local`).
4. Traffic is routed directly to the active Pod IPs bypassed via endpoints, avoiding double-hop kube-proxy latency.

---

## 5. Network Security (NetworkPolicies)

To secure traffic between Pods, Kubernetes uses **NetworkPolicies** (Layer 3/4 firewalls).
* **Default Allow**: By default, all Pods accept traffic from any source.
* **Zero-Trust**: Once a `NetworkPolicy` is applied, the CNI enforces a whitelist-only firewall:
  * **Ingress rules**: Filter who can connect *to* the Pod.
  * **Egress rules**: Filter who the Pod can connect *out to*.
  * **Identifiers**: Filtering is done using `podSelector` and `namespaceSelector` labels (e.g., allowing only the `gateway` namespace to talk to `user-service`).
