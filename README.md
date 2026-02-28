# StackPilot

**Cloud-Native DevOps Platform for Deploying Student Apps** — mini Heroku / Render clone.

[![Live Demo](https://img.shields.io/badge/demo-deploy%20to%20EC2-blue)](docs/DEPLOY.md)

Upload a Node.js or Python app → Docker build → live URL → logs in dashboard.

## Live demo (after deploy)

Replace with your EC2 IP:

- **Dashboard:** http://YOUR_EC2_IP
- **API docs:** http://YOUR_EC2_IP/api/docs
- **Sample app:** http://YOUR_EC2_IP/apps/1/

## Deploy to production (resume link)

**Follow:** [docs/DEPLOY.md](docs/DEPLOY.md) — AWS EC2 step-by-step (~1 hour).

Quick version:

```bash
# On Ubuntu EC2
git clone https://github.com/YOUR_USERNAME/StackPilot.git
cd StackPilot
bash scripts/install-ec2.sh
# re-login, then:
cp .env.production.example .env   # set PLATFORM_BASE_URL + passwords
docker compose up -d --build
```

## Run locally

```bash
cp .env.example .env
docker compose up --build
```

- Dashboard: http://localhost
- API: http://localhost:8000/docs

**Test deploy:** Register → project path `/samples/node-hello` → Deploy → open `/apps/1/`

## Architecture

```
Browser → Nginx :80 → React dashboard
                    → /api → FastAPI
                    → /apps/{id} → gateway → Docker app on host port
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Learning path

8-week plan: [docs/00-START-HERE.md](docs/00-START-HERE.md)

## Tech stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI, PostgreSQL, JWT |
| Frontend | React, Vite, Nginx |
| DevOps | Docker, Compose, GitHub Actions, Bash |
| Proxy | Nginx + API gateway |
| Cloud | AWS EC2 (primary), Azure/GCP optional |

## Resume one-liner

> Built and deployed **StackPilot**, a self-hosted PaaS on **AWS EC2** using **Docker**, **FastAPI**, **PostgreSQL**, **Nginx**, and **GitHub Actions**, enabling one-click containerized deployments with public URLs for student applications.
