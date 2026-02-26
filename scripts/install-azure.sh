#!/usr/bin/env bash
# One-time setup for Ubuntu 22.04 on Azure VM — Docker + git + firewall
set -euo pipefail

echo "==> StackPilot Azure VM install"

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

# Firewall (Azure also uses NSG in portal — this is extra safety on the VM)
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable || true

PUBLIC_IP=$(curl -s -H Metadata:true "http://169.254.169.254/metadata/instance/network/interface/0/ipv4/ipAddress/0/publicIpAddress?api-version=2021-02-01&format=text" 2>/dev/null || curl -s ifconfig.me 2>/dev/null || echo "YOUR_AZURE_PUBLIC_IP")

echo ""
echo "==> Done. IMPORTANT:"
echo "1. Log out and SSH back in:  ssh -i YOUR_KEY.pem azureuser@$PUBLIC_IP"
echo "2. cd ~/StackPilot && cp .env.production.example .env && nano .env"
echo "3. Set PLATFORM_BASE_URL=http://$PUBLIC_IP"
echo "4. docker compose up -d --build"
echo ""
