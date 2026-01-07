# Week 1 — Linux, Networking & Bash

**Goal:** Comfort on a Linux server + write scripts StackPilot will use to deploy apps.

**Time:** ~12–15 hours (or **~6 hours** if you use the short video path below)

---

## Short video path (~90 min total) — use this if you're low on time

Watch these, then **learn the rest by doing** the Day 1–7 commands in this file.

| Order | Video | Length | Why |
|-------|--------|--------|-----|
| 1 | [Linux in 100 Seconds (Fireship)](https://www.youtube.com/watch?v=IVquott5IgQ) | ~2 min | Big-picture mental model |
| 2 | [Linux Crash Course (Traversy Media)](https://www.youtube.com/watch?v=ROjZy1WbCIA) | ~35 min | Commands you will use every day |
| 3 | [SSH, Explained (NetworkChuck)](https://www.youtube.com/watch?v=YS5Zh7KExyE) | ~12 min | Needed before AWS Week 5 |
| 4 | [Bash Scripting in 8 Minutes (Fireship)](https://www.youtube.com/watch?v=WR9qQzKHn7g) | ~8 min | Enough to read `scripts/*.sh` |

**Optional later (not Week 1):** [freeCodeCamp Linux full course](https://www.youtube.com/watch?v=sWbUDq4S6Y8) — bookmark for deep dive.

**Minimum commands to memorize** (type daily until automatic):

`pwd` `ls` `cd` `mkdir` `cat` `rm` `chmod +x` `./script.sh` `ssh` `scp` `ps` `ss -tlnp` `sudo`

---

## Day 1 — Mindset + setup (2 hrs)

### Learn (30–40 min — short path)

- [ ] Watch: [Linux in 100 Seconds](https://www.youtube.com/watch?v=IVquott5IgQ) + [Linux Crash Course](https://www.youtube.com/watch?v=ROjZy1WbCIA)
- [ ] Install WSL2 Ubuntu if on Windows: https://learn.microsoft.com/en-us/windows/wsl/install

### Do (75 min)

- [ ] Open terminal (WSL Ubuntu or Mac/Linux terminal)
- [ ] Run these until you understand what each does:

```bash
pwd          # where am I?
ls -la       # list files including hidden
cd ~         # home directory
mkdir stackpilot-lab && cd stackpilot-lab
touch hello.txt
echo "StackPilot" > hello.txt
cat hello.txt
rm hello.txt
```

- [ ] Create GitHub account + install Git
- [ ] Clone this project:

```bash
cd ~
git clone <YOUR_GITHUB_URL>/StackPilot.git
cd StackPilot
```

---

## Day 2 — Files, permissions, processes (2 hrs)

### Learn (15 min)

- [ ] Skim Traversy video section on permissions (`chmod`, `chown`) — or read: https://ubuntu.com/tutorials/command-line-for-beginners

### Do (90 min)

```bash
# Permissions lab
echo '#!/bin/bash' > deploy.sh
echo 'echo "Deploying..."' >> deploy.sh
chmod +x deploy.sh
./deploy.sh

# Processes & ports
ps aux | head
# Install net-tools if needed: sudo apt install net-tools
ss -tlnp | head    # or: netstat -tlnp
```

**Concept check (write answers in a notebook):**

1. What is port 80 used for?  
2. What is port 443?  
3. What is `localhost` / `127.0.0.1`?

---

## Day 3 — SSH (2 hrs)

### Learn (45 min)

- [ ] Watch: [SSH - YouTube NetworkChuck](https://www.youtube.com/watch?v=YS5Zh7KExyE)

### Do (75 min)

You will SSH into a real server in Week 5. Practice locally:

```bash
# Generate SSH key (no passphrase for lab; use passphrase in production)
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub
```

- [ ] Understand: **private key** stays on laptop, **public key** goes on server

---

## Day 4 — Bash scripting (2.5 hrs)

### Learn (10 min — short path)

- [ ] Watch: [Bash Scripting in 8 Minutes (Fireship)](https://www.youtube.com/watch?v=WR9qQzKHn7g)
- [ ] Optional deep dive later: [Bash full course](https://www.youtube.com/watch?v=tK9Oc6AEnR4) — only if you enjoy scripting

### Do (90 min)

Study and run the project scripts:

```bash
cd ~/StackPilot/scripts
bash vm-setup.sh --help 2>/dev/null || bash vm-setup.sh
```

- [ ] Open `scripts/deploy-app.sh` — read every line with comments
- [ ] Modify: add `echo "Deployed at $(date)"` at the end
- [ ] Run with a fake app name: `bash deploy-app.sh demo-app ./samples/node-hello`

---

## Day 5 — Networking + DNS (2 hrs)

### Learn (15 min — short path)

- [ ] Watch: [DNS in 100 Seconds (Fireship)](https://www.youtube.com/watch?v=UVR9ZUct21s) (~2 min)
- [ ] Watch: [HTTP in 100 Seconds (Fireship)](https://www.youtube.com/watch?v=ieYrCksdsTU) (~2 min)
- [ ] Optional: [NetworkChuck subnetting](https://www.youtube.com/watch?v=7ISavPgM7FU) — first 15 min only

### Do (75 min)

**Draw on paper:**

```
Browser → DNS → Your Server IP → Nginx (port 80) → App (port 3000)
```

- [ ] Read: https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview

---

## Day 6–7 — Week 1 deliverable (4 hrs)

### Build

- [ ] Run `scripts/vm-setup.sh` in WSL (installs docker, nginx basics — read script first)
- [ ] Complete **Week 1 checklist** in [00-START-HERE.md](../00-START-HERE.md)
- [ ] `git add . && git commit -m "week1: linux lab and vm setup scripts"`

### Week 1 exit quiz (must answer yes)

- [ ] I can SSH, use `ls/cd/cat`, and write a 5-line bash script  
- [ ] I know what a port is and what a reverse proxy does (high level)  
- [ ] I pushed at least one commit to GitHub  

**Next:** [WEEK-02.md](WEEK-02.md)
