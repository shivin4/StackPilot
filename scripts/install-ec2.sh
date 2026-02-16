#!/usr/bin/env bash
# One-time setup for Ubuntu 22.04 EC2 — Docker + git + firewall
set -euo pipefail

echo "==> StackPilot EC2 install"

export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -y
sudo apt-get install -y git curl ca-certificates gnupg lsb-release ufw

# Docker Engine + Compose plugin
if ! command -v docker &>/dev/null; then
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

sudo usermod -aG docker "$USER" || true

# Firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable || true

echo ""
echo "==> Done. IMPORTANT:"
echo "1. Log out and SSH back in (docker group)"
echo "2. cd ~/StackPilot && cp .env.production.example .env && nano .env"
echo "3. Set PLATFORM_BASE_URL=http://$(curl -s http://checkip.amazonaws.com 2>/dev/null || echo YOUR_EC2_IP)"
echo "4. docker compose up -d --build"
echo ""
