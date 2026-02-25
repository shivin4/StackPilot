# Week 8 — Finalization & Portfolio

**Goal:** Resume-ready project with demo assets.

---

## Documentation (Day 1–2)

- [ ] Update root `README.md` with architecture diagram (draw.io or Excalidraw)
- [ ] Add `docs/ARCHITECTURE.md` — components + data flow
- [ ] Add `docs/DEMO.md` — how to run live demo in 5 minutes

---

## Demo video (Day 3)

Record 3–5 minutes:

1. Problem statement (15 sec)
2. Register + connect repo (60 sec)
3. Deploy + show URL (60 sec)
4. Logs + Grafana (60 sec)
5. Mention AWS + Azure + GCP (30 sec)

Upload unlisted to YouTube — link in README.

---

## PPT for college / placements (Day 4)

Slides:

1. Title + your name  
2. Problem (students can't deploy easily)  
3. Architecture diagram  
4. Tech stack  
5. Live demo screenshot  
6. DevOps practices (CI/CD, Docker, monitoring)  
7. Multi-cloud  
8. Challenges & learnings  
9. Future work (K8s scaling, billing)  
10. Q&A  

---

## Security pass (Day 5)

- [ ] No secrets in Git (`git grep -i password`)
- [ ] JWT secret from env only
- [ ] EC2 security group: SSH restricted to your IP
- [ ] Docker containers run as non-root where possible
- [ ] CORS configured for your domain only

---

## Stress test (Day 6)

```bash
# Install hey or use autocannon
hey -n 1000 -c 10 http://<your-api>/health
```

Note requests/sec in README — shows you tested.

---

## Resume & LinkedIn (Day 7)

- [ ] GitHub repo public with good README
- [ ] Pin repo on GitHub profile
- [ ] LinkedIn post: 3 bullets + architecture image + demo link
- [ ] Resume bullets from [00-START-HERE.md](../00-START-HERE.md)

---

## You are done when

- [ ] Live public URL  
- [ ] CI/CD green  
- [ ] Grafana screenshot  
- [ ] K8s `kubectl get pods` screenshot  
- [ ] Demo video link  

**Congratulations — you built a real DevOps platform.**
