# Jenkins on Kubernetes (K8s) Setup

This directory contains the Kubernetes manifests required to run a Kubernetes-native Jenkins instance.

## Manifests

1. **`namespace.yaml`**: Creates a dedicated `jenkins` namespace.
2. **`volume.yaml`**: Configures a `PersistentVolumeClaim` (PVC) named `jenkins-pvc` with `10Gi` storage for persistent storage of Jenkins data.
3. **`service-account.yaml`**: Configures a service account `jenkins-admin` with RBAC cluster role bindings allowing Jenkins to dynamically spawn/manage worker agents inside Kubernetes.
4. **`deployment.yaml`**: Runs the LTS version of Jenkins (`jenkins/jenkins:lts`) container.
5. **`service.yaml`**: Exposes Jenkins UI on NodePort `32000` and agent port on NodePort `32500`.

## Installation

Apply the manifests in the following order:

```bash
kubectl apply -f namespace.yaml
kubectl apply -f volume.yaml
kubectl apply -f service-account.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

Once running, access Jenkins in your browser at `http://<node-ip>:32000`.
To retrieve the initial administrator password, run:

```bash
kubectl exec -it $(kubectl get pods -n jenkins -l app=jenkins-server -o jsonpath='{.items[0].metadata.name}') -n jenkins -- cat /var/jenkins_home/secrets/initialAdminPassword
```
