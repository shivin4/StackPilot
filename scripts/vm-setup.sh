#!/usr/bin/env bash
# StackPilot — first-time Linux VM setup (Ubuntu 22.04)
# Usage: bash scripts/vm-setup.sh

set -euo pipefail

echo "==> StackPilot VM setup"

if [[ $EUID -ne 0 ]]; then
  echo "Run with sudo or as root: sudo bash scripts/vm-setup.sh"
  exit 1
fi

apt-get update
apt-get install -y git curl ca-certificates gnupg lsb-release ufw

# Docker
if ! command -v docker &>/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

# Allow ubuntu user to run docker (if user exists)
if id ubuntu &>/dev/null; then
  usermod -aG docker ubuntu
fi

# Firewall basics
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable || true

echo "==> Done. Log out and back in if you were added to docker group."
echo "Next: clone repo, cp .env.example .env, docker compose up -d --build"
