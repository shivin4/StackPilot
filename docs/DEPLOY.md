# Deploy StackPilot to AWS EC2 (public resume link)

This guide gets you a **working URL** like `http://54.x.x.x` (or `https://stackpilot.yourdomain.com`) for your resume.

**Time:** ~45–60 minutes (first time)

---

## What you need

- AWS account (free tier)
- GitHub repo with this code pushed
- Windows: WSL2 + Docker Desktop, or deploy only on EC2

---

## Step 1 — Launch EC2 (15 min)

1. AWS Console → **EC2** → **Launch instance**
2. Settings:
   - **Name:** `stackpilot-prod`
   - **AMI:** Ubuntu Server 22.04 LTS
   - **Type:** `t2.micro` or `t3.micro` (free tier)
   - **Key pair:** Create → download `.pem`
   - **Security group:**
     - SSH (22) — **My IP only**
     - HTTP (80) — Anywhere `0.0.0.0/0`
     - HTTPS (443) — Anywhere `0.0.0.0/0`
3. Launch → copy **Public IPv4** (e.g. `54.123.45.67`)

---

## Step 2 — SSH and install (10 min)

From your laptop (PowerShell / WSL):

```bash
chmod 400 ~/Downloads/stackpilot-key.pem
ssh -i ~/Downloads/stackpilot-key.pem ubuntu@54.123.45.67
```

On the server:

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/StackPilot/main/scripts/install-ec2.sh | bash
# Or if repo is private, clone first:
git clone https://github.com/YOUR_USERNAME/StackPilot.git
cd StackPilot
bash scripts/install-ec2.sh
```

Log out and back in (docker group):

```bash
exit
ssh -i ~/Downloads/stackpilot-key.pem ubuntu@54.123.45.67
```

---

## Step 3 — Configure environment (5 min)

```bash
cd ~/StackPilot
cp .env.production.example .env
nano .env
```

Set:

| Variable | Example |
|----------|---------|
| `POSTGRES_PASSWORD` | long random string |
| `SECRET_KEY` | `python3 -c "import secrets; print(secrets.token_urlsafe(32))"` |
| `PLATFORM_BASE_URL` | `http://54.123.45.67` (your EC2 public IP) |
| `DATABASE_URL` | same password as POSTGRES |

Save (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## Step 4 — Start StackPilot (10 min)

```bash
cd ~/StackPilot
docker compose up -d --build
docker compose ps
```

All services should be **running**. First build takes 5–10 minutes.

Open in browser: **http://54.123.45.67** (your IP)

---

## Step 5 — Demo for resume (5 min)

1. Register an account on the dashboard
2. Create project:
   - Name: `demo-node`
   - Path: `/samples/node-hello`
3. Click **Deploy now**
4. Wait until status = **running**
5. Open **Live app** link → should show JSON hello message

**Resume link:** `http://YOUR_EC2_IP`  
**Live app example:** `http://YOUR_EC2_IP/apps/1/`

---

## Step 6 — GitHub Actions auto-deploy (optional)

In GitHub → repo → **Settings → Secrets**:

| Secret | Value |
|--------|--------|
| `EC2_HOST` | `54.123.45.67` |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | entire `.pem` file contents |

Push to `main` → Actions runs `deploy.yml` → updates server.

---

## HTTPS with a domain (optional, +20 min)

1. Point domain A record to EC2 IP (Namecheap, Cloudflare, etc.)
2. On EC2:

```bash
sudo apt install -y certbot
sudo certbot certonly --standalone -d stackpilot.yourdomain.com
```

3. Update `.env`: `PLATFORM_BASE_URL=https://stackpilot.yourdomain.com`
4. Add SSL nginx config (see `nginx/conf.d/ssl.example.conf` if added) or use Caddy

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Can't open site | Check security group allows port 80 |
| Deploy stays `building` | `docker compose logs -f api` |
| App URL 503 | Wait 30s; check `docker ps` for student container |
| API DB error | Check `.env` `DATABASE_URL` matches postgres password |

```bash
docker compose logs -f api
docker compose restart api
docker ps
```

---

## Resume bullet (copy)

> Deployed **StackPilot** (FastAPI, React, PostgreSQL, Docker, Nginx) on **AWS EC2** with GitHub Actions CI/CD — a self-hosted PaaS that builds and runs containerized student apps with public URLs at [http://YOUR_IP](http://YOUR_IP).
