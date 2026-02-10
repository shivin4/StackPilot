# StackPilot Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Browser   │────▶│    Nginx     │────▶│ React Dashboard │
└─────────────┘     │  (port 80)   │     └─────────────────┘
                    │              │     ┌─────────────────┐
                    └──────┬───────┴────▶│  FastAPI (API)  │
                           │             └────────┬────────┘
                           │                      │
                           │              ┌───────▼────────┐
                           │              │  PostgreSQL    │
                           │              └────────────────┘
                           │                      │
                           │              ┌───────▼────────┐
                           └─────────────▶│ Docker Engine  │
                                          │ (student apps) │
                                          └────────────────┘
```

## Deploy flow

1. User creates **Project** with `repo_url`.
2. User triggers **Deployment** → API inserts row (`pending`).
3. Background task: clone/copy source → `docker build` → `docker run`.
4. Nginx routes `/apps/<id>/` to the container port (Phase 2 enhancement).
5. Dashboard polls deployment status and shows logs.

## CI/CD

- **CI:** GitHub Actions runs tests on push/PR.
- **CD:** On `main`, SSH to EC2 runs `scripts/deploy-stackpilot.sh`.

## Multi-cloud (Phase 3)

| Cloud | Use |
|-------|-----|
| AWS EC2 | Host StackPilot + Docker |
| Azure Blob | Archive deployment logs |
| GCP Cloud Run | Demo deploy of sample app |
