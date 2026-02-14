#!/usr/bin/env bash
# Run ON THE SERVER to update StackPilot from git (used by GitHub Actions CD)
set -euo pipefail

REPO_DIR="${REPO_DIR:-$HOME/StackPilot}"
cd "$REPO_DIR"

git pull origin main
docker compose pull || true
docker compose up -d --build
docker image prune -f

echo "StackPilot updated at $(date)"
