#!/usr/bin/env bash
# MotorLens UK — one-command startup for demo day.
# Starts backend + frontend. Ctrl+C stops both.

set -e
cd "$(dirname "$0")"

echo "🔎 Freeing ports 8000 and 3000…"
lsof -ti :8000 | xargs kill -9 2>/dev/null || true
lsof -ti :3000 | xargs kill -9 2>/dev/null || true

echo "🚗 Starting backend (FastAPI on :8000)…"
cd backend
if [ ! -d .venv ]; then
  python3 -m venv .venv
  ./.venv/bin/pip install -q -r requirements.txt
  ./.venv/bin/pip install -q python-dotenv
fi
source .venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 > /tmp/motorlens-backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "🎨 Starting frontend (Next.js on :3000)…"
cd frontend
if [ ! -d node_modules ]; then
  npm install
fi
if [ ! -f .env.local ]; then
  cp .env.local.example .env.local
fi
npm run dev > /tmp/motorlens-frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

trap "echo ''; echo '🛑 Shutting down…'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

sleep 5
echo ""
echo "✅ MotorLens UK is running:"
echo "   Dashboard:  http://localhost:3000"
echo "   Backend:    http://localhost:8000/health"
echo ""
echo "📊 Logs: /tmp/motorlens-backend.log · /tmp/motorlens-frontend.log"
echo "⏹  Press Ctrl+C to stop both servers."

wait
