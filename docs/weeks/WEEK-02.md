# Week 2 — Docker & Docker Compose

**Goal:** Run StackPilot locally with `docker compose up`.

---

## Day 1 — Docker concepts (2 hrs)

### Learn

- [ ] https://www.youtube.com/watch?v=Gjnup-PuquQ (100 seconds)
- [ ] https://www.youtube.com/watch?v=fqMOX6JJhGo — watch 0:00–3:00:00

### Vocabulary (flash cards)

| Term | Meaning |
|------|---------|
| Image | Blueprint (read-only) |
| Container | Running instance of image |
| Dockerfile | Recipe to build image |
| Volume | Persistent disk for container |
| Network | How containers talk |

---

## Day 2 — Dockerfile hands-on (2 hrs)

### Do

```bash
cd ~/StackPilot/samples/node-hello
docker build -t node-hello:local .
docker run -p 3000:3000 node-hello:local
# Visit http://localhost:3000
docker ps
docker stop <container_id>
```

- [ ] Repeat with `samples/python-hello`

---

## Day 3 — Docker Compose (2 hrs)

### Learn

- [ ] https://www.youtube.com/watch?v=HG6yIjZapSA

### Do

```bash
cd ~/StackPilot
cp .env.example .env
# Edit .env: set POSTGRES_PASSWORD, SECRET_KEY (any random string)
docker compose up --build
```

- [ ] API docs: http://localhost:8000/docs  
- [ ] DB healthy: `docker compose ps`  
- [ ] Stop: `Ctrl+C` then `docker compose down`

---

## Day 4 — Debug Docker (2 hrs)

Practice these — you will use them in interviews:

```bash
docker compose logs -f api
docker compose exec api bash
docker inspect <container>
docker system df
```

**Break something on purpose:** wrong env var → read logs → fix → rebuild.

---

## Day 5–7 — Deliverable

- [ ] All services in `docker-compose.yml` start green
- [ ] You can explain each service: `api`, `db`, `frontend`, `nginx`, `prometheus`, `grafana`
- [ ] Commit: `week2: local docker compose running`

**Next:** [WEEK-03.md](WEEK-03.md)
