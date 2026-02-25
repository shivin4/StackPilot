# Week 5 — AWS EC2 Production Deployment

**Goal:** StackPilot publicly accessible on the internet.

---

## Day 1 — AWS account + EC2 (3 hrs)

### Learn

- [ ] https://www.youtube.com/watch?v=iHX6tmKth9c

### Do (step-by-step)

1. Sign in to [AWS Console](https://console.aws.amazon.com/)
2. **EC2 → Launch instance**
   - Name: `stackpilot-prod`
   - AMI: **Ubuntu 22.04 LTS**
   - Instance type: **t2.micro** or **t3.micro** (free tier)
   - Key pair: create new → download `.pem` → store safely
   - Security group — allow:
     - SSH (22) — **Your IP only**
     - HTTP (80) — 0.0.0.0/0
     - HTTPS (443) — 0.0.0.0/0
     - Custom TCP 8000 — optional for API testing
3. Launch → note **Public IPv4**

---

## Day 2 — SSH into server (2 hrs)

```bash
chmod 400 ~/Downloads/stackpilot-key.pem
ssh -i ~/Downloads/stackpilot-key.pem ubuntu@<EC2_PUBLIC_IP>
```

On server:

```bash
git clone <YOUR_REPO_URL>
cd StackPilot
bash scripts/vm-setup.sh
cp .env.example .env
nano .env   # set production passwords
docker compose up -d --build
```

- [ ] Visit `http://<EC2_PUBLIC_IP>` (Nginx)

---

## Day 3 — Nginx + domain (2 hrs)

### Learn

- [ ] https://www.youtube.com/watch?v=JKxlsvZXG7c

### Do

- Point a domain (or free subdomain from DuckDNS / No-IP) to EC2 IP
- Update `nginx/nginx.conf` `server_name`
- Reload: `docker compose exec nginx nginx -s reload`

---

## Day 4 — HTTPS (2 hrs)

On EC2 (host, not container) — install certbot:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
# Follow certbot prompts after Nginx serves your domain on port 80
```

- [ ] Site loads `https://`

---

## Day 5 — Azure touch (1 hr)

**Requirement:** use Azure lightly.

1. Create [Azure Storage Account](https://portal.azure.com/)
2. Create container `stackpilot-logs`
3. Copy connection string to `.env` as `AZURE_STORAGE_CONNECTION_STRING`
4. Week 6+: enable log upload in API

Doc: https://learn.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-python

---

## Day 6 — GCP touch (1 hr)

**Requirement:** use GCP lightly.

Deploy **one** sample app to Cloud Run (not full StackPilot):

```bash
# Install gcloud CLI, then:
cd samples/python-hello
gcloud run deploy hello-gcp --source . --region us-central1 --allow-unauthenticated
```

Doc: https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-python-service

Screenshot for portfolio.

---

## Day 7 — Deliverable

- [ ] Public URL works
- [ ] GitHub Actions deploys on push
- [ ] Commit: `week5: production ec2 deployment`

**Next:** [WEEK-06.md](WEEK-06.md)
