# StackPilot — Your Complete Roadmap (Start Here)

You said you want to treat this like you know nothing. **Good.** This doc is your single source of truth. Do not skip weeks — each week unlocks the next.

---

## How to use this repo

1. Read this page once (15 min).
2. Open **only** the current week file: `docs/weeks/WEEK-0X.md`.
3. Finish every **checkbox** in that week before moving on.
4. Commit your work to GitHub after each week (builds your portfolio history).

| Week | Topic | File |
|------|--------|------|
| 1 | Linux, SSH, Bash | [WEEK-01.md](weeks/WEEK-01.md) |
| 2 | Docker & Compose | [WEEK-02.md](weeks/WEEK-02.md) |
| 3 | FastAPI + PostgreSQL | [WEEK-03.md](weeks/WEEK-03.md) |
| 4 | GitHub Actions CI/CD | [WEEK-04.md](weeks/WEEK-04.md) |
| 5 | AWS EC2 production | [WEEK-05.md](weeks/WEEK-05.md) |
| 6 | Prometheus + Grafana | [WEEK-06.md](weeks/WEEK-06.md) |
| 7 | Kubernetes basics | [WEEK-07.md](weeks/WEEK-07.md) |
| 8 | Polish, demo, resume | [WEEK-08.md](weeks/WEEK-08.md) |

**Daily time:** 1.5–2 hours on weekdays, 3–4 hours on one weekend day = ~12–15 hrs/week.

---

## What you are building (simple picture)

```
Student uploads GitHub repo URL
        ↓
StackPilot API clones repo → builds Docker image → runs container
        ↓
Nginx gives public URL: https://myapp.stackpilot.yourdomain.com
        ↓
Dashboard shows: status, logs, CPU/RAM (later weeks)
```

You are **not** building another CRUD todo app. You are building the **machine that deploys** other apps.

---

## Accounts to create (Week 1, Day 1)

Do these in one sitting (~45 min):

| Service | Why | Free tier |
|---------|-----|-----------|
| [GitHub](https://github.com/join) | Code + Actions CI/CD | Free |
| [Docker Hub](https://hub.docker.com/signup) | Push images (optional Week 2+) | Free |
| [AWS](https://aws.amazon.com/free/) | EC2 host (Week 5) | 12 months free tier |
| [Azure](https://azure.microsoft.com/free/) | Blob storage (Phase 3) | $200 credit |
| [Google Cloud](https://cloud.google.com/free) | Cloud Run demo (Phase 3) | Free tier |
| [Grafana Cloud](https://grafana.com/auth/sign-up/create-user) | Optional hosted Grafana | Free tier |

**Do not put secret keys in Git.** Use `.env` locally and GitHub Secrets in CI.

---

## Tools to install on your laptop (Week 1)

| Tool | Install | Verify |
|------|---------|--------|
| Git | https://git-scm.com/downloads | `git --version` |
| VS Code or Cursor | https://cursor.com | — |
| Docker Desktop | https://www.docker.com/products/docker-desktop/ | `docker --version` |
| Python 3.11+ | https://www.python.org/downloads/ | `python --version` |
| Node.js 20 LTS | https://nodejs.org | `node --version` |
| WSL2 (Windows) | https://learn.microsoft.com/en-us/windows/wsl/install | `wsl` |

On Windows, **run all deployment scripts inside WSL2 Ubuntu** when possible — matches real Linux servers.

---

## Master YouTube playlist (curated)

Watch in order within each week. Pause and type commands yourself.

### Foundations (Week 1)

**Short path (~90 min):** use these if you are low on time; learn the rest by doing [WEEK-01.md](weeks/WEEK-01.md) labs.

| # | Topic | Video | Length |
|---|--------|-------|--------|
| 1 | Linux overview | https://www.youtube.com/watch?v=IVquott5IgQ | ~2 min |
| 2 | Linux commands (main watch) | https://www.youtube.com/watch?v=ROjZy1WbCIA | ~35 min |
| 3 | SSH | https://www.youtube.com/watch?v=YS5Zh7KExyE | ~12 min |
| 4 | Bash scripts | https://www.youtube.com/watch?v=WR9qQzKHn7g | ~8 min |
| 5 | DNS + HTTP (networking) | https://www.youtube.com/watch?v=UVR9ZUct21s + https://www.youtube.com/watch?v=ieYrCksdsTU | ~4 min |

**Deep dive later (optional):** [freeCodeCamp Linux full course](https://www.youtube.com/watch?v=sWbUDq4S6Y8)

### Docker (Week 2)

| # | Topic | Video |
|---|--------|-------|
| 1 | Docker in 100 seconds (overview) | https://www.youtube.com/watch?v=Gjnup-PuquQ |
| 2 | Docker full course (hands-on) | https://www.youtube.com/watch?v=fqMOX6JJhGo |
| 3 | Docker Compose | https://www.youtube.com/watch?v=HG6yIjZapSA |

### Backend (Week 3)

| # | Topic | Video |
|---|--------|-------|
| 1 | FastAPI full course | https://www.youtube.com/watch?v=0sOvCWFmrtA |
| 2 | PostgreSQL + SQL basics | https://www.youtube.com/watch?v=qw--VYLpxG4 |

### CI/CD (Week 4)

| # | Topic | Video |
|---|--------|-------|
| 1 | GitHub Actions tutorial | https://www.youtube.com/watch?v=R8_veQiYBjI |
| 2 | CI/CD concepts | https://www.youtube.com/watch?v=scEDHsr3APg |

### AWS (Week 5)

| # | Topic | Video |
|---|--------|-------|
| 1 | AWS EC2 for beginners | https://www.youtube.com/watch?v=iHX6tmKth9c |
| 2 | Deploy app on EC2 | https://www.youtube.com/watch?v=afXJxKkN1jY |
| 3 | Nginx reverse proxy | https://www.youtube.com/watch?v=JKxlsvZXG7c |

### Monitoring (Week 6)

| # | Topic | Video |
|---|--------|-------|
| 1 | Prometheus & Grafana | https://www.youtube.com/watch?v=9TJx7AgIKb0 |
| 2 | TechWorld with Nana — full DevOps monitoring | https://www.youtube.com/watch?v=h4Sl21AKiDg |

### Kubernetes (Week 7)

| # | Topic | Video |
|---|--------|-------|
| 1 | Kubernetes in 15 min (concepts) | https://www.youtube.com/watch?v=X48VuDVv0do |
| 2 | Kubernetes full course | https://www.youtube.com/watch?v=X74XlIVfEJc |

---

## Phase checklist (what “done” looks like)

### Phase 1 — Core platform ([PHASE-1.md](phases/PHASE-1.md))

- [ ] Register / login with JWT
- [ ] Connect GitHub repo URL
- [ ] Build Docker image from repo
- [ ] Run container and show **live URL**
- [ ] View deployment status in dashboard

### Phase 2 — DevOps ([PHASE-2.md](phases/PHASE-2.md))

- [ ] GitHub Actions builds on every push
- [ ] Stream deployment logs to UI
- [ ] Health check endpoint + auto-restart
- [ ] Rollback to previous image

### Phase 3 — Cloud ([PHASE-3.md](phases/PHASE-3.md))

- [ ] Logs archived to Azure Blob (or S3)
- [ ] HTTPS via Let’s Encrypt on EC2
- [ ] Grafana dashboard for CPU/RAM/requests
- [ ] One service on Kubernetes (Minikube)
- [ ] Optional: demo deploy to GCP Cloud Run

---

## Resume bullets (copy when Phase 1+2 done)

Use these on your resume / LinkedIn:

1. **Developed StackPilot**, a self-hosted PaaS enabling one-click Docker deployments from GitHub repos with JWT auth, PostgreSQL metadata store, and Nginx-based subdomain routing on AWS EC2.

2. **Automated CI/CD** with GitHub Actions (build, test, deploy) and Bash deployment scripts for zero-downtime container updates.

3. **Implemented observability** using Prometheus and Grafana for container CPU, memory, and HTTP metrics; centralized logs with structured streaming to the dashboard.

4. **Applied multi-cloud patterns**: primary compute on **AWS EC2**, artifact/log storage on **Azure Blob**, and serverless demo workloads on **GCP Cloud Run**.

---

## Interview talking points (memorize these 4 stories)

1. **End-to-end deploy flow:** “User submits repo → API validates Dockerfile → `docker build` → `docker run` with env vars → Nginx `server_name` routes subdomain → user hits HTTPS URL.”

2. **Failure you handled:** “Container exited OOM — I added memory limits in compose, health checks, and auto-restart policy.”

3. **Security:** “JWT for API, secrets in GitHub Actions secrets not repo, non-root Docker user, security groups only 80/443/22.”

4. **Scaling (honest):** “Phase 1 is single-node; Phase 3 adds horizontal idea via K8s Deployments — I can explain pod vs service vs ingress.”

---

## When you are stuck

1. Read the error message **out loud** (seriously — it helps).
2. Check `docker compose logs -f api` or `docker logs <container>`.
3. Search exact error on Stack Overflow.
4. Ask in project Issues with: OS, command you ran, full error text.

---

## Next step

Open **[WEEK-01.md](weeks/WEEK-01.md)** and start Day 1 tasks today.
