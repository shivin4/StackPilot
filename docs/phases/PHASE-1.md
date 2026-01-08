# Phase 1 — Core Platform

## Features

1. User registration & login (JWT)
2. Create project linked to GitHub repo URL (or local path for dev)
3. Build Docker image from repo
4. Run container on Docker host
5. Assign subdomain URL via Nginx
6. Dashboard: status (pending / building / running / failed)

## Tasks (in order)

- [ ] Week 1–2: Linux + Docker local setup
- [ ] Week 3: API auth + projects + deployments tables
- [ ] Week 3: `deployer.py` builds & runs containers
- [ ] Week 3: Frontend login + deploy button
- [ ] Week 5: Same stack on EC2 with public IP

## Success criteria

Record a 30-second video: user logs in → pastes repo → clicks Deploy → opens `http://<subdomain>.yourdomain.com`
