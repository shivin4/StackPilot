# Deploy StackPilot on Azure (no credit card — student)

Use this guide first if you **don't have a credit card**. **Azure for Students** works with your **college email** and renews while you're a student.

Later you can add AWS using [DEPLOY.md](DEPLOY.md).

**Time:** ~45–60 minutes (first time)

---

## What you need

- **College / university email** (e.g. `name@college.edu.in`)
- GitHub repo with StackPilot pushed
- Windows: PowerShell or WSL for SSH

---

## Step 1 — Azure for Students signup (10 min)

1. Open: **https://azure.microsoft.com/free/students/**
2. Click **Activate now** / **Sign up**
3. Sign in with your **school email** (not personal Gmail if possible)
4. Verify student status (Microsoft may ask for academic confirmation)
5. **No credit card** required for the student offer

After signup, open: **https://portal.azure.com**

---

## Step 2 — Create a Linux VM (15 min)

### 2.1 Resource group

1. Portal search: **Resource groups** → **Create**
2. Name: `stackpilot-rg`
3. Region: **Central India** (or closest to you)
4. **Create**

### 2.2 Virtual machine

1. Search: **Virtual machines** → **Create** → **Azure virtual machine**

| Setting | Value |
|---------|--------|
| Resource group | `stackpilot-rg` |
| VM name | `stackpilot-vm` |
| Region | Same as resource group |
| Image | **Ubuntu Server 22.04 LTS** |
| Size | **Standard_B1s** (1 vCPU, 1 GB) — shows "Free tier eligible" or cheap |
| Authentication | **SSH public key** (recommended) |
| Username | `azureuser` (default — remember this) |
| SSH key | **Generate new key pair** → download `.pem` file |

### 2.3 Networking (important)

Under **Networking** → **NIC network security group** → **Advanced**:

| Rule | Port | Source |
|------|------|--------|
| SSH | 22 | **My IP address** |
| HTTP | 80 | **Any** (or Internet) |
| HTTPS | 443 | **Any** (optional) |

Or after creation: VM → **Networking** → **Add inbound port rule** → port **80**, **443**.

### 2.4 Public IP

- **Public inbound ports:** Allow selected ports → **22, 80** (and 443 if you want)
- **Public IP:** keep default (new IP)

Click **Review + create** → **Create**.

### 2.5 Copy public IP

When deployment finishes:

- VM → **Overview** → copy **Public IP address** (e.g. `20.123.45.67`)

---

## Step 3 — SSH into the VM (5 min)

### Windows PowerShell

```powershell
# Move key to safe folder, restrict permissions (first time only)
cd $HOME\Downloads
icacls stackpilot-vm_key.pem /inheritance:r
icacls stackpilot-vm_key.pem /grant:r "$($env:USERNAME):(R)"

# SSH (replace IP and key filename)
ssh -i stackpilot-vm_key.pem azureuser@20.123.45.67
```

Type `yes` if asked about host fingerprint.

> Azure Ubuntu VMs use user **`azureuser`**, not `ubuntu`.

---

## Step 4 — Install Docker on the VM (10 min)

On the VM (after SSH):

```bash
git clone https://github.com/YOUR_USERNAME/StackPilot.git
cd StackPilot
bash scripts/install-azure.sh
```

Log out and back in (docker group):

```bash
exit
```

SSH again, then:

```bash
cd ~/StackPilot
```

---

## Step 5 — Configure `.env` (5 min)

```bash
cp .env.production.example .env
nano .env
```

Set:

| Variable | Example |
|----------|---------|
| `POSTGRES_PASSWORD` | long random password |
| `SECRET_KEY` | `python3 -c "import secrets; print(secrets.token_urlsafe(32))"` |
| `PLATFORM_BASE_URL` | `http://20.123.45.67` (your Azure public IP, no trailing slash) |
| `DATABASE_URL` | `postgresql://stackpilot:YOUR_PASSWORD@db:5432/stackpilot` |

Save: `Ctrl+O`, Enter, `Ctrl+X`.

---

## Step 6 — Start StackPilot (10 min)

```bash
docker compose up -d --build
docker compose ps
```

First build takes **5–10 minutes**.

Open in browser: **http://YOUR_AZURE_PUBLIC_IP**

---

## Step 7 — Resume demo (5 min)

1. Register on the dashboard  
2. Create project: name `demo`, path `/samples/node-hello`  
3. **Deploy now** → wait for **running**  
4. Open **Live app** link  

**Put on resume:**

- Platform: `http://YOUR_AZURE_PUBLIC_IP`
- Sample app: `http://YOUR_AZURE_PUBLIC_IP/apps/1/`

---

## Step 8 — Stop VM when not demoing (save credits)

Azure Portal → VM → **Stop** (deallocates — you don't pay compute while stopped).

Start again before interviews: **Start** → wait 2 min → same IP (if you kept static IP) or check new IP and update `.env`.

---

## GitHub Actions deploy to Azure (optional)

Same as EC2 — use SSH deploy workflow with secrets:

| Secret | Value |
|--------|--------|
| `EC2_HOST` | Azure public IP (name is legacy; value is IP) |
| `EC2_USER` | `azureuser` |
| `EC2_SSH_KEY` | contents of your `.pem` file |

---

## Add AWS later (when you have a card)

1. Follow [DEPLOY.md](DEPLOY.md) on a small EC2 instance  
2. Resume line: *"Deployed on Azure VM; extended with AWS EC2 for multi-cloud comparison."*

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Can't sign up Azure for Students | Use official college email; try [aka.ms/studentverify](https://aka.ms/studentverify) |
| SSH connection timeout | NSG must allow port **22** from your IP |
| Site won't load | NSG allow port **80**; check `docker compose ps` |
| `Permission denied` SSH | User must be `azureuser`; check `.pem` path |
| Deploy stuck | `docker compose logs -f api` |
| Out of memory on B1s | Normal for first build — wait; or resize to **B2s** if credits allow |

```bash
docker compose logs -f api
docker ps
free -h
```

---

## Resume bullet (Azure — copy now)

> Deployed **StackPilot** (FastAPI, React, PostgreSQL, Docker, Nginx) on **Azure VM** (Ubuntu) with GitHub Actions CI/CD — a self-hosted PaaS that containerizes student apps and exposes public deployment URLs.
