# Week 4 — CI/CD with GitHub Actions

**Goal:** Every push to `main` runs tests and can deploy to your server.

---

## Day 1 — Concepts (2 hrs)

- [ ] https://www.youtube.com/watch?v=scEDHsr3APg
- [ ] https://www.youtube.com/watch?v=R8_veQiYBjI

**CI** = build & test on each push  
**CD** = deploy automatically after CI passes

---

## Day 2 — CI pipeline (2 hrs)

- [ ] Push repo to GitHub
- [ ] Open **Actions** tab — watch `.github/workflows/ci.yml` run
- [ ] Fix any failing step (read logs line by line)

---

## Day 3 — Secrets (1 hr)

In GitHub: **Settings → Secrets and variables → Actions**

| Secret | Value |
|--------|--------|
| `EC2_HOST` | (Week 5 — your server IP) |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | contents of private key file |

---

## Day 4–7 — CD to EC2 (5 hrs)

After Week 5 EC2 exists:

- [ ] Enable deploy job in `.github/workflows/deploy.yml`
- [ ] Push to `main` → SSH deploy script runs on server
- [ ] Verify live URL updates

**Deliverable:** Screenshot of green GitHub Actions + live app URL.

**Next:** [WEEK-05.md](WEEK-05.md)
