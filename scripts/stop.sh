#!/usr/bin/env bash
set -euo pipefail

CONTAINER="daily-compass"

if docker rm -f "$CONTAINER" >/dev/null 2>&1; then
  echo "Stopped Daily Compass."
else
  echo "Daily Compass is not running."
fi
