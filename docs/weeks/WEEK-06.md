# Week 6 — Monitoring (Prometheus + Grafana)

**Goal:** Dashboard showing CPU, memory, and container health.

---

## Day 1–2 — Learn (3 hrs)

- [ ] https://www.youtube.com/watch?v=9TJx7AgIKb0
- [ ] https://www.youtube.com/watch?v=h4Sl21AKiDg (first 90 min)

---

## Day 3–4 — Run locally (3 hrs)

```bash
docker compose up -d prometheus grafana
```

- [ ] Grafana: http://localhost:3001 (default `admin` / `admin` in `.env`)
- [ ] Add Prometheus data source: `http://prometheus:9090`
- [ ] Import dashboard ID **193** (Docker monitoring) or build simple panels

---

## Day 5 — Alerts (2 hrs)

- [ ] Panel: container memory usage
- [ ] Panel: API request rate (if metrics exposed)
- [ ] Write `docs/runbooks/HIGH-MEMORY.md` — what to do when RAM > 80%

---

## Day 6–7 — Production

- [ ] Expose Grafana on EC2 (subdomain + auth, or SSH tunnel only for demo)
- [ ] Screenshot for resume / PPT

**Next:** [WEEK-07.md](WEEK-07.md)
