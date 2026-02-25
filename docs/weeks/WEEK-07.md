# Week 7 — Kubernetes Basics

**Goal:** Deploy one StackPilot component (or sample app) on Minikube.

---

## Day 1 — Install Minikube (2 hrs)

Windows (WSL):

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
minikube start
kubectl get nodes
```

### Learn

- [ ] https://www.youtube.com/watch?v=X48VuDVv0do
- [ ] https://www.youtube.com/watch?v=X74XlIVfEJc (sections on Deployment, Service, Ingress)

---

## Day 2–4 — Apply manifests (4 hrs)

```bash
cd k8s
kubectl apply -f namespace.yaml
kubectl apply -f sample-app/
kubectl get pods -n stackpilot
minikube service -n stackpilot sample-app --url
```

- [ ] Draw: Pod → Service → Ingress
- [ ] `kubectl logs`, `kubectl describe pod`

---

## Day 5–7 — Interview prep

Be able to explain:

| Object | Purpose |
|--------|---------|
| Pod | Smallest runnable unit (1+ containers) |
| Deployment | Manages replica pods |
| Service | Stable network endpoint |
| Ingress | HTTP routing from outside cluster |

**Next:** [WEEK-08.md](WEEK-08.md)
