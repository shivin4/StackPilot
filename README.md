# StackPilot

**A self-hosted Platform-as-a-Service (PaaS) for deploying student web apps** — think mini Heroku or Render, built for cloud & DevOps portfolios.

Connect a public GitHub repository (or a bundled sample app), click **Deploy**, and get a live URL with build logs in the dashboard. StackPilot clones the repo, builds a Docker image, runs the container, and routes traffic through Nginx and a FastAPI gateway.

[![Architecture](https://img.shields.io/badge/docs-architecture-blue)](docs/ARCHITECTURE.md)
[![Deploy Azure](https://img.shields.io/badge/deploy-Azure%20(students)-0078D4)](docs/DEPLOY-AZURE.md)
[![Deploy AWS](https://img.shields.io/badge/deploy-AWS%20EC2-FF9900)](docs/DEPLOY.md)

---

## Table of contents

- [Features](#features)
- [How it works](#how-it-works)
- [Quick start (local)](#quick-start-local)
- [Deploy StackPilot to the cloud](#deploy-stackpilot-to-the-cloud)
- [Deploy your app on StackPilot](#deploy-your-app-on-stackpilot)
- [Sample applications](#sample-applications)
- [API reference](#api-reference)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [Tech stack](#tech-stack)
- [Monitoring (optional)](#monitoring-optional)
- [Learning path](#learning-path)
- [Limitations & roadmap](#limitations--roadmap)
- [Troubleshooting](#troubleshooting)
- [Resume bullet](#resume-bullet)

---

## Features

| Capability | Description |
|------------|-------------|
| **One-click deploy** | Git clone → `docker build` → `docker run` from the dashboard |
| **Multi-runtime** | Node.js and Python apps (any stack that fits in Docker) |
| **Public URLs** | Each deployment gets `http://your-platform/apps/<id>/` |
| **Reverse proxy** | Nginx + FastAPI gateway forward `/apps/{id}/` to container ports |
| **Auth** | JWT registration/login; projects scoped per user |
| **Live logs** | Build and runtime output in the deployment panel |
| **Cancel / stop / restart** | Cancel in-progress builds; stop running apps; restart stopped or failed deployments |
| **Remove deployments** | Delete deployment records and clean up Docker images/containers |
| **Student-tier safeguards** | Dashboard warnings and blocks for repos too heavy for ~1 GiB RAM VMs |
| **Demo repo** | One-click suggestion to deploy [GoodNotes](https://github.com/shivin4/goodnotes) |
| **Sample apps** | Built-in Node and Python hello-world for instant demos |
| **Production-ready compose** | PostgreSQL, API, React UI, Nginx in one `docker compose` |
| **CI/CD** | GitHub Actions for tests; optional deploy script for VM updates |
| **Observability** | Prometheus + Grafana + Alertmanager + Node Exporter + cAdvisor |

---

## How it works

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

**Deploy flow**

1. User registers and creates a **Project** with a `repo_url` (GitHub HTTPS URL or local sample path).
2. User clicks **Deploy** → API creates a deployment (`pending` → `building` → `running` or `failed`).
3. Background worker clones source, requires a root **`Dockerfile`**, detects **`EXPOSE`** port, builds the image, and starts a container on a random host port.
4. Gateway proxies `GET/POST … /apps/<deployment_id>/…` to `http://<host>:<port>/…` (path prefix stripped).
5. Dashboard polls every few seconds; user opens the **Live app** link.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for CI/CD and multi-cloud notes.

---

## Quick start (local)

**Requirements:** Docker Desktop (or Docker Engine + Compose v2), 4 GB+ RAM recommended.

```bash
git clone https://github.com/shivin4/StackPilot.git
cd StackPilot
cp .env.example .env
docker compose up --build
```

| URL | Purpose |
|-----|---------|
| http://localhost | Dashboard (Nginx → React) |
| http://localhost/api/docs | OpenAPI / Swagger UI |
| http://localhost/api/health | API health check |

**First deploy (no GitHub needed)**

1. Open http://localhost  
2. **Register** → log in  
3. **New project** — name: `demo`, repo: `/samples/node-hello` or `https://github.com/shivin4/goodnotes.git`  
4. **Deploy** → when status is `running`, open **Live app** (e.g. http://localhost/apps/1/)

Use **Cancel** on stuck `building` deployments; **Restart** / **Remove** on stopped or failed ones.

Stop with `Ctrl+C` or `docker compose down`.

---

## Deploy StackPilot to the cloud

Host the platform itself on a VM so others can use your dashboard.

| Provider | Guide | Best for |
|----------|--------|----------|
| **Azure for Students** | **[docs/DEPLOY-AZURE.md](docs/DEPLOY-AZURE.md)** | No credit card; students |
| **AWS EC2** | [docs/DEPLOY.md](docs/DEPLOY.md) | AWS on resume; free tier |

**Azure quick steps**

```bash
# On Ubuntu Azure VM (user: azureuser)
git clone https://github.com/shivin4/StackPilot.git
cd StackPilot
bash scripts/install-azure.sh
# Re-login after script installs Docker, then:
cp .env.production.example .env
# Edit .env: PLATFORM_BASE_URL=http://YOUR_VM_PUBLIC_IP
# Optional free hostname: http://stackpilot.duckdns.org (see DuckDNS + cron on VM)
docker compose up -d --build
```

**VM sizing:** Azure **B2ats_v2** (1 GiB RAM) works for the platform and **small** student apps. Avoid heavy multi-stage React builds on the same VM.

**After deploy — replace `YOUR_VM_IP` or your DuckDNS name:**

| URL | Purpose |
|-----|---------|
| http://YOUR_VM_IP | Dashboard |
| http://YOUR_VM_IP/api/docs | API docs |
| http://YOUR_VM_IP/apps/1/ | First deployed student app |

**VM requirements:** Ubuntu 22.04+, Docker socket available to the API container, ports **80** (and optionally **8000** for direct API access) open in the cloud firewall.

---

## Deploy your app on StackPilot

Anyone with access to your StackPilot instance can deploy **their** project if it meets these rules.

**Recommended first test:** `https://github.com/shivin4/goodnotes.git` (lightweight notes + todos, built for 1 GiB VMs).

The dashboard shows **student-tier warnings** by default. Large stacks (Next.js monorepos, databases, multi-service apps) are blocked or require confirming your repo is a **minimal single-service** project with a root `Dockerfile`.

### Checklist

| # | Requirement |
|---|-------------|
| 1 | **Account** on your StackPilot site (register / login) |
| 2 | Code in a **public** GitHub repo (`https://github.com/user/repo.git`) |
| 3 | **`Dockerfile` at repository root** (not in a subfolder) |
| 4 | **`EXPOSE`** line matching the port your app listens on |
| 5 | Process binds **`0.0.0.0`** (not only `127.0.0.1`) |
| 6 | Prefer ports **3000**, **8000**, **5000**, or **8080** |
| 7 | **Small build** — avoid React/Vite/Next multi-stage Docker builds on 1 GiB RAM |
| 8 | **API paths** — if the UI is served under `/apps/<id>/`, call `/apps/<id>/api/...` or use relative URLs |

Private repos are **not** supported yet (clone uses anonymous `git clone --depth 1`).

### Dashboard steps

1. **New project** — project name + GitHub URL  
   Example: `https://github.com/shivin4/goodnotes.git`
2. Select the project → **Deploy now**
3. Wait for status **`running`**
4. Open **Live app** → `http://YOUR_PLATFORM_IP/apps/<deployment-id>/`

### Dockerfile templates

**Node.js (Express / static build)**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY . .
# If you build a frontend: RUN npm run build
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server/index.js"]
```

**Python (FastAPI)**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Port detection

StackPilot reads `EXPOSE` from the Dockerfile. If omitted, it defaults to **3000**. It may retry **3000, 8000, 5000, 8080** if the container exits on the first port.

The API container does **not** inject a `PORT` environment variable today — use the same port in your app and in `EXPOSE`.

### Routing under `/apps/<id>/`

The gateway strips `/apps/<deployment_id>/` before forwarding:

- Browser: `http://platform/apps/5/api/notes`  
- Container: `http://container:port/api/notes`

APIs rooted at `/api/...` and servers that serve a SPA from `/` work well.

**SPA / Vite caveat:** default Vite `base: '/'` loads assets from `/assets/...`, which breaks under a subpath. Use relative assets:

```js
// vite.config.js
export default defineConfig({
  base: './',
  // ...
});
```

Or serve the built frontend from the same Node process (see [goodnotes](https://github.com/shivin4/goodnotes)).

### Example repos

| Repo | Stack | Port |
|------|--------|------|
| [goodnotes](https://github.com/shivin4/goodnotes) | Node + static HTML notes & todos (StackPilot-ready) | 3000 |
| `samples/node-hello` (in this repo) | Express JSON API | 3000 |
| `samples/python-hello` (in this repo) | FastAPI | 8000 |

---

## Sample applications

Bundled under `samples/` (mounted read-only at `/samples` in the API container):

| Path | Description |
|------|-------------|
| `/samples/node-hello` | Express app, `GET /` and `/health` |
| `/samples/python-hello` | FastAPI app on port 8000 |

Use these paths in **repo URL** when testing locally or on a VM without pushing to GitHub.

---

## API reference

Base URL: `/api` (Nginx rewrites `/api/*` → FastAPI `/*`).

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | No | Create account |
| `POST` | `/auth/login` | No | OAuth2 form → JWT |
| `GET` | `/health` | No | API health |
| `GET` | `/projects` | JWT | List your projects |
| `POST` | `/projects` | JWT | `{ "name", "repo_url" }` |
| `GET` | `/deployments` | JWT | List deployments |
| `POST` | `/deployments` | JWT | `{ "project_id" }` — starts build |
| `GET` | `/deployments/{id}` | JWT | Status + logs |
| `POST` | `/deployments/{id}/stop` | JWT | Stop running app or **cancel** pending/building |
| `POST` | `/deployments/{id}/restart` | JWT | Redeploy stopped or failed deployment |
| `DELETE` | `/deployments/{id}` | JWT | Remove deployment and clean up Docker resources |
| `*` | `/apps/{id}/…` | No* | Gateway to running app |

\* Gateway is public; only **running** deployments respond. Manage deployments via JWT.

Interactive docs: **http://localhost/api/docs** (or your production host).

---

## Configuration

Copy `.env.example` (local) or `.env.production.example` (VM).

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret (32+ random chars in production) |
| `PLATFORM_BASE_URL` | Public platform URL, no trailing slash (used in live app links) |
| `VITE_API_URL` | Frontend API prefix (usually `/api`) |
| `DEPLOY_HOST` | Hostname API uses to reach Docker on the VM (`host.docker.internal` in Compose) |
| `POSTGRES_*` | Database credentials |

Generate a secret:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Project structure

```
StackPilot/
├── backend/           # FastAPI API, deployer, gateway, auth
├── frontend/          # React dashboard (Vite)
├── nginx/             # Reverse proxy (UI, /api, /apps)
├── samples/           # node-hello, python-hello
├── scripts/           # install-azure.sh, install-ec2.sh, deploy-stackpilot.sh
├── docs/              # Deploy guides, architecture, 8-week learning plan
├── monitoring/        # Prometheus, Alertmanager, Grafana provisioning, alert rules
├── k8s/               # Sample Kubernetes manifests (learning)
├── docker-compose.yml
└── .github/workflows/ # CI + CD
```

---

## Tech stack

| Layer | Technology |
|-------|------------|
| API | FastAPI, SQLAlchemy, PostgreSQL, JWT (python-jose, passlib/bcrypt) |
| Deploy engine | Docker SDK, git clone, host port mapping |
| Frontend | React 18, Vite |
| Edge | Nginx |
| Runtime | Docker Compose |
| CI/CD | GitHub Actions |
| Cloud targets | Azure VM, AWS EC2 (documented) |

---

## Monitoring (Prometheus + Grafana + Alertmanager)

StackPilot includes a complete observability stack for **VM health**, **containers**, **FastAPI performance**, and **deployment reliability**.

### Monitoring architecture

```
Node Exporter ─┐
               ├──> Prometheus ───> Grafana Dashboards
cAdvisor ──────┤         │
               │         └──> Alertmanager (rules + notifications)
FastAPI /metrics ┘
```

### What is monitored

- **Infrastructure (Node Exporter):** CPU, memory, disk usage, network traffic, system load
- **Containers (cAdvisor):** per-container CPU/memory/network and restart behavior
- **FastAPI metrics:** request count, latency histogram, error rate, active requests
- **Deployment metrics:** deployments by status (`pending/building/running/failed/stopped`)

### Start the full stack

```bash
docker compose --profile monitoring up -d --build
```

> If you already run StackPilot, this command adds monitoring services and keeps existing app services.

### Azure VM deployment steps (monitoring enabled)

```bash
# SSH into VM
ssh -i ~/.ssh/stackpilot-new.pem azureuser@YOUR_VM_IP

cd ~/StackPilot
git pull

# Ensure env exists (first run only)
cp .env.production.example .env

# Start app + monitoring stack
docker compose --profile monitoring up -d --build

# Verify services
docker compose --profile monitoring ps
```

### Service endpoints

| Service | URL |
|---------|-----|
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (default `admin` / `admin`) |
| Alertmanager | http://localhost:9093 |
| Node Exporter | http://localhost:9100/metrics |
| cAdvisor | http://localhost:8081 |
| FastAPI metrics | http://localhost/api/metrics |

### Built-in Grafana dashboards

Dashboards are auto-provisioned on startup:

1. **StackPilot - VM Health**
   - CPU utilization (%)
   - Memory utilization (%)
   - Disk utilization (%)
   - System load
2. **StackPilot - Container Health**
   - Container CPU and memory usage
   - Container network throughput
   - Container restart changes
3. **StackPilot - FastAPI Performance**
   - Request rate
   - P95 latency
   - Error rate
   - Active requests
4. **StackPilot - Deployment Statistics**
   - Deployments by status
   - Total deployments
   - Failed deployments
   - Deploy endpoint traffic

### Alert rules (preconfigured)

- CPU > 80% (5m)
- Memory > 85% (5m)
- Disk > 90% (10m)
- FastAPI metrics endpoint down
- Failed deployment present
- Container crash/restart loop signals

Alert rules live in:

- `monitoring/alert-rules.yml`
- `monitoring/alertmanager.yml`

### Alertmanager notification setup

By default, Alertmanager is configured with a local receiver placeholder (no external notification target).

To enable notifications, edit `monitoring/alertmanager.yml` and add integrations like Slack/Email/Webhook, then restart:

```bash
docker compose --profile monitoring restart alertmanager
```

### Screenshot placeholders for README/docs

Capture and store screenshots under `docs/screenshots/monitoring/`:

- `vm-health.png`
- `container-health.png`
- `fastapi-performance.png`
- `deployment-statistics.png`
- `alertmanager-alerts.png`

Then embed them in docs, for example:

```md
![VM Health Dashboard](docs/screenshots/monitoring/vm-health.png)
```

### Monitoring workflow

1. Prometheus scrapes Node Exporter, cAdvisor, and FastAPI `/metrics`
2. Grafana reads Prometheus and renders operational dashboards
3. Prometheus evaluates alert rules every 15s
4. Firing alerts are sent to Alertmanager for routing/grouping
5. Alertmanager delivers notifications to configured receivers

### Container Health shows “No data”

1. In Prometheus, run `count(container_memory_usage_bytes)`. If the result is **0**, cAdvisor is not exporting container metrics yet.
2. Recreate cAdvisor after pulling the latest `docker-compose.yml` (needs `privileged`, cgroup mount, and Docker socket):

```bash
git pull
docker compose --profile monitoring up -d --force-recreate cadvisor prometheus grafana
```

3. On the VM, confirm cAdvisor sees containers: `curl -s localhost:8081/metrics | grep -c container_memory_usage_bytes` (should be greater than 0).
4. In Prometheus, verify Docker cgroup metrics exist (on cgroup v2 the `image` label is often empty):

```promql
count(container_memory_usage_bytes{id!="/"})
```

On cgroup v2 VMs the `image` label is often empty. The dashboard filters on Docker Compose service names (`container_label_com_docker_compose_service`). Verify:

```promql
count(container_memory_usage_bytes{container_label_com_docker_compose_service!=""})
```

If that is 0 but you see `ModemManager.service` in Grafana, cAdvisor is reporting host systemd cgroups — recreate it:

```bash
docker compose --profile monitoring up -d --force-recreate cadvisor
```

Then pull dashboard version 7 and restart Grafana.

---

## Learning path

Structured **8-week** cloud & DevOps curriculum with weekly docs and YouTube links:

**[docs/00-START-HERE.md](docs/00-START-HERE.md)**

Phases: Docker & Compose → CI/CD → production VM → Kubernetes samples → multi-cloud extras.

---

## Limitations & roadmap

| Current limitation | Planned / workaround |
|--------------------|----------------------|
| Public GitHub repos only | Add deploy keys or PAT for private repos |
| Root `Dockerfile` required | Buildpack auto-detection (future) |
| No `PORT` env injection | Match `EXPOSE` in Dockerfile |
| Single VM / Docker host (~1 GiB RAM on student SKU) | Use lightweight apps; add swap on VM if builds OOM |
| SPA asset paths under subpath | `base: './'` in Vite, or plain HTML + relative `/apps/<id>/api` paths |
| No HTTPS in default compose | Terminate TLS at Nginx + Let's Encrypt |
| GitHub OAuth fields in `.env` | Optional Phase 2+ |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Register returns 500 | On VM: `docker compose exec api pip install bcrypt==4.0.1` then `docker compose restart api` |
| `git clone failed` | Repo must be **public**; URL must be `https://github.com/...git` |
| `No Dockerfile` | Add `Dockerfile` at repo root |
| Container `failed` | Check deployment logs in UI; verify `EXPOSE` and `0.0.0.0` bind |
| App 404 on assets | Set Vite `base: './'` or serve static files from Node |
| App loads but API broken (`undefined` data) | Frontend must call `/apps/<id>/api/...` or use relative API base (see GoodNotes) |
| Build stuck on `building` | Click **Cancel** in dashboard; `docker system prune -f` on VM if needed |
| Deploy OOM on 1 GiB VM | Use [goodnotes](https://github.com/shivin4/goodnotes) or single-stage Dockerfile; add 2G swap |
| Azure region blocked | Use East Asia / South India / East US (see [DEPLOY-AZURE.md](docs/DEPLOY-AZURE.md)) |
| SSH key permission denied (Windows) | Use WSL or fix key permissions; see deploy guide |

---

## Resume bullet

> Integrated Prometheus and Grafana dashboards for monitoring infrastructure health, resource utilization, deployment reliability, and proactive incident detection through automated alerting.

---

## Documentation index

| Doc | Content |
|-----|---------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design & deploy flow |
| [docs/DEPLOY-AZURE.md](docs/DEPLOY-AZURE.md) | Student-friendly Azure VM setup |
| [docs/DEPLOY.md](docs/DEPLOY.md) | AWS EC2 production setup |
| [docs/00-START-HERE.md](docs/00-START-HERE.md) | 8-week learning roadmap |

---

**StackPilot** — ship student apps from GitHub to a live URL in minutes.
