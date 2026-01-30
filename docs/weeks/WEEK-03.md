# Week 3 — FastAPI Backend + PostgreSQL

**Goal:** Working auth + create deployment records via API.

---

## Day 1–2 — FastAPI (4 hrs)

### Learn

- [ ] https://www.youtube.com/watch?v=0sOvCWFmrtA (0:00–4:00:00)

### Do

```bash
cd ~/StackPilot/backend
# With compose running:
curl http://localhost:8000/health
```

- [ ] Open http://localhost:8000/docs
- [ ] Register user: `POST /auth/register`
- [ ] Login: `POST /auth/login` → copy `access_token`
- [ ] Click **Authorize** in Swagger, paste token
- [ ] Create project: `POST /projects`
- [ ] Create deployment: `POST /deployments`

---

## Day 3 — PostgreSQL (2 hrs)

### Learn

- [ ] https://www.youtube.com/watch?v=qw--VYLpxG4 (first 90 min)

### Do

```bash
docker compose exec db psql -U stackpilot -d stackpilot
\dt
SELECT * FROM users;
\q
```

---

## Day 4 — Wire deploy logic (3 hrs)

- [ ] Read `backend/app/services/deployer.py`
- [ ] Deploy sample app via API with `repo_path` pointing to `samples/node-hello`
- [ ] Confirm container appears: `docker ps`

---

## Day 5–7 — Frontend dashboard (4 hrs)

```bash
cd frontend
npm install
npm run dev
```

- [ ] Login page calls API
- [ ] List projects
- [ ] Trigger deploy button

**Deliverable:** Demo screen recording (30 sec): register → create project → deploy → show URL.

**Next:** [WEEK-04.md](WEEK-04.md)
