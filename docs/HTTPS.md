# HTTPS for StackPilot (DuckDNS + Let's Encrypt)

Mobile browsers often fail on plain **HTTP** or auto-upgrade to **HTTPS** when no certificate exists. Use **Let's Encrypt** (free) on your Azure VM.

**Domain used below:** `stackpilot.duckdns.org` — replace if yours differs.

---

## Prerequisites

1. **DuckDNS** A record points to your VM public IP (same IP as Azure Overview).
2. **Azure NSG** allows inbound **80** and **443** from **Any** (`0.0.0.0/0`).
3. StackPilot already works on `http://stackpilot.duckdns.org`.

---

## Step 1 — Open port 443 (Azure)

Portal → your VM → **Networking** → **Add inbound port rule**:

| Field | Value |
|-------|--------|
| Port | **443** |
| Protocol | TCP |
| Source | **Any** |
| Action | Allow |

---

## Step 2 — Get certificate (on the VM)

SSH in, then **stop Nginx** so port 80 is free for Certbot:

```bash
cd ~/StackPilot
docker compose stop nginx

sudo apt update
sudo apt install -y certbot

sudo certbot certonly --standalone \
  -d stackpilot.duckdns.org \
  --email YOUR_EMAIL@example.com \
  --agree-tos \
  --no-eff-email
```

Certificates are saved under:

```text
/etc/letsencrypt/live/stackpilot.duckdns.org/fullchain.pem
/etc/letsencrypt/live/stackpilot.duckdns.org/privkey.pem
```

Test renewal (optional):

```bash
sudo certbot renew --dry-run
```

---

## Step 3 — Enable HTTPS in Nginx (Docker)

### 3a. Copy SSL config

```bash
cd ~/StackPilot
cp nginx/conf.d/ssl-stackpilot.conf.example nginx/conf.d/ssl-stackpilot.conf
# Edit if your domain is not stackpilot.duckdns.org:
nano nginx/conf.d/ssl-stackpilot.conf
```

### 3b. Expose port 443 and mount certs

Edit `docker-compose.yml` **nginx** service — add `443` and the Let's Encrypt volume:

```yaml
  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
```

### 3c. Start Nginx again

```bash
docker compose up -d nginx
```

Check:

```bash
curl -I https://stackpilot.duckdns.org
```

You should see `HTTP/2 200` or `301` then `200`.

---

## Step 4 — Update platform URL

```bash
nano ~/StackPilot/.env
```

Set:

```env
PLATFORM_BASE_URL=https://stackpilot.duckdns.org
```

Restart API so new deployment links use HTTPS:

```bash
docker compose up -d api
```

---

## Step 5 — Auto-renew (every ~90 days)

Create a renew hook so Nginx restarts after renewal:

```bash
sudo tee /etc/letsencrypt/renewal-hooks/deploy/restart-stackpilot-nginx.sh <<'EOF'
#!/bin/bash
cd /home/azureuser/StackPilot || exit 1
docker compose stop nginx
docker compose start nginx
EOF
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/restart-stackpilot-nginx.sh
```

Certbot timer usually runs twice daily. For standalone plugin renewals, use pre/post hooks:

```bash
sudo tee /etc/letsencrypt/renewal-hooks/pre/stop-nginx.sh <<'EOF'
#!/bin/bash
cd /home/azureuser/StackPilot && docker compose stop nginx
EOF
sudo tee /etc/letsencrypt/renewal-hooks/post/start-nginx.sh <<'EOF'
#!/bin/bash
cd /home/azureuser/StackPilot && docker compose start nginx
EOF
sudo chmod +x /etc/letsencrypt/renewal-hooks/pre/stop-nginx.sh
sudo chmod +x /etc/letsencrypt/renewal-hooks/post/start-nginx.sh
```

---

## Use on phone

Open:

```text
https://stackpilot.duckdns.org
https://stackpilot.duckdns.org/apps/<deployment-id>/
```

Do **not** use `http://` in bookmarks after this (browser may still redirect if you kept the HTTP → HTTPS redirect in the SSL config).

---

## Monitoring URLs (optional)

Grafana/Prometheus on `:3001` / `:9090` are still **HTTP** unless you put them behind Nginx with SSL too. For resume, link the main platform with `https://`; monitoring ports can stay as-is or behind a subdomain later.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Certbot "connection refused" | NSG must allow 80; `docker compose stop nginx` before `certbot` |
| Nginx won't start | Paths in `ssl-stackpilot.conf` must match your domain folder under `/etc/letsencrypt/live/` |
| Certificate name mismatch | `server_name` in SSL config must equal `-d` domain used in certbot |
| Mobile still broken | Clear Safari cache; use `https://` explicitly |
| Apps broken after HTTPS | Redeploy or ensure app uses relative API paths under `/apps/<id>/` |

---

## Resume link

```text
https://stackpilot.duckdns.org
```
