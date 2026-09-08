#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IMAGE="daily-compass"
CONTAINER="daily-compass"
PORT=8080

if [[ -f "$ROOT/../.env" ]]; then
  ENV_FILE="$ROOT/../.env"
elif [[ -f "$ROOT/.env" ]]; then
  ENV_FILE="$ROOT/.env"
else
  ENV_FILE=""
fi

docker build -t "$IMAGE" "$ROOT"
docker rm -f "$CONTAINER" >/dev/null 2>&1 || true

if [[ -n "$ENV_FILE" ]]; then
  docker run -d --name "$CONTAINER" -p "${PORT}:8000" --env-file "$ENV_FILE" "$IMAGE" >/dev/null
else
  docker run -d --name "$CONTAINER" -p "${PORT}:8000" "$IMAGE" >/dev/null
fi

i=0
while [[ $i -lt 30 ]]; do
  if curl -sf "http://127.0.0.1:${PORT}/api/hello" >/dev/null; then
    echo "Daily Compass is running at http://127.0.0.1:${PORT}"
    exit 0
  fi
  i=$((i + 1))
  sleep 1
done

echo "Container did not become ready."
docker logs "$CONTAINER"
exit 1
