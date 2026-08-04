#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "FFmpeg n'est pas installé."
  echo "Installe-le avec : sudo apt install ffmpeg"
  exit 1
fi

cd "$ROOT_DIR/backend"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

source .venv/bin/activate

python -m pip install --upgrade pip
python -m pip install -r requirements.txt

uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000 &

BACKEND_PID=$!

cleanup() {
  kill "$BACKEND_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

cd "$ROOT_DIR/frontend"

npm install
npm run dev -- --host 0.0.0.0
