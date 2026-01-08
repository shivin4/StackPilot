# Phase 2 — DevOps Features

## Features

1. GitHub Actions CI on every PR/push
2. CD deploy to EC2 on merge to `main`
3. Deployment logs streamed/stored
4. `/health` on deployed apps + StackPilot health aggregation
5. Rollback: redeploy previous image tag
6. Auto-restart: Docker `restart: unless-stopped`

## Tasks

- [ ] Enable `ci.yml` — lint + test backend
- [ ] Configure GitHub secrets for EC2 SSH
- [ ] `deploy.yml` runs `scripts/deploy-stackpilot.sh` on server
- [ ] API endpoint `GET /deployments/{id}/logs`
- [ ] `POST /deployments/{id}/rollback`

## Success criteria

Push to `main` → Actions green → production updates without manual SSH.
