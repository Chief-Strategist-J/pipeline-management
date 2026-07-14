# Jenkins on Kubernetes (K8s) Setup

This directory contains the Kubernetes manifests required to run a Kubernetes-native Jenkins instance using Kustomize.

## Directory Structure

```
deploy/kubernetes/
├── base/
│   ├── kustomization.yaml
│   ├── namespace.yaml
│   ├── volume.yaml
│   ├── service-account.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── network-policy.yaml
│   └── pdb.yaml
└── overlays/
    ├── dev/
    │   └── kustomization.yaml
    └── prod/
        ├── kustomization.yaml
        └── hpa.yaml
```

## How to Apply

### Development Environment
To deploy the dev version:
```bash
kubectl apply -k deploy/kubernetes/overlays/dev
```

### Production Environment
To deploy the production version (pockets image version to a specific sha256 digest, adds HPA):
```bash
kubectl apply -k deploy/kubernetes/overlays/prod
```
