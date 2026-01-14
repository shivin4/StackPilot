#!/usr/bin/env bash
# Deploy a single student app from a directory containing a Dockerfile
# Usage: bash scripts/deploy-app.sh <app-name> <path-to-source>

set -euo pipefail

APP_NAME="${1:?Usage: deploy-app.sh <app-name> <source-path>}"
SOURCE_PATH="${2:?Usage: deploy-app.sh <app-name> <source-path>}"
IMAGE_TAG="stackpilot-${APP_NAME}:latest"
HOST_PORT="${HOST_PORT:-$(shuf -i 10000-20000 -n 1)}"

if [[ ! -f "${SOURCE_PATH}/Dockerfile" ]]; then
  echo "ERROR: No Dockerfile in ${SOURCE_PATH}"
  exit 1
fi

echo "==> Building ${IMAGE_TAG}"
docker build -t "${IMAGE_TAG}" "${SOURCE_PATH}"

echo "==> Stopping old container (if any)"
docker rm -f "stackpilot-${APP_NAME}" 2>/dev/null || true

echo "==> Starting on port ${HOST_PORT}"
docker run -d \
  --name "stackpilot-${APP_NAME}" \
  --restart unless-stopped \
  -p "${HOST_PORT}:3000" \
  "${IMAGE_TAG}"

echo "==> Deployed at http://localhost:${HOST_PORT}"
echo "Deployed at $(date)"
