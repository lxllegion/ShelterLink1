#!/usr/bin/env bash
set -e

echo "======================================"
echo " 🚀 FastAPI + React (CRA) Setup Script"
echo "======================================"

# --- Detect OS and set Python + venv activation paths ---
OS="$(uname -s 2>/dev/null || echo Windows)"

case "$OS" in
    Linux*)     PLATFORM="linux";   PY_CMD="python3"; ACTIVATE_PATH="venv/bin/activate";;
    Darwin*)    PLATFORM="mac";     PY_CMD="python3"; ACTIVATE_PATH="venv/bin/activate";;
    CYGWIN*|MINGW*|MSYS*|Windows*)
                PLATFORM="windows"; PY_CMD="py";       ACTIVATE_PATH="venv/Scripts/activate";;
    *)          PLATFORM="unknown"; PY_CMD="python3";  ACTIVATE_PATH="venv/bin/activate";;
esac

echo "Detected OS: $PLATFORM"
echo "Using Python command: $PY_CMD"

# --- Check dependencies (only python + npm) ---
for cmd in $PY_CMD npm; do
  if ! command -v $cmd &>/dev/null; then
    echo "❌ Missing dependency: $cmd"
    exit 1
  fi
done

# --- Backend Setup ---
echo ""
echo "--------------------------------------"
echo " ⚙️  Setting up FastAPI backend..."
echo "--------------------------------------"

cd backend

# Create a Python virtual environment
if [ ! -d "venv" ]; then
  echo "📦 Creating virtual environment..."
  $PY_CMD -m venv venv
fi

# Activate virtual environment
if [ -f "$ACTIVATE_PATH" ]; then
  source "$ACTIVATE_PATH"
else
  echo "Error: Could not find virtual environment activation script."
  exit 1
fi

# Create requirements.txt if missing
if [ ! -f "requirements.txt" ]; then
  echo "fastapi" > requirements.txt
  echo "uvicorn" >> requirements.txt
fi

# Install backend dependencies (safe cross-platform pip call)
$PY_CMD -m pip install -r requirements.txt

deactivate
cd ..

# --- Frontend Setup ---
echo ""
echo "--------------------------------------"
echo " ⚛️  Setting up React frontend..."
echo "--------------------------------------"

cd frontend

if [ ! -f "package.json" ]; then
  echo "❌ No package.json found."
  echo "Run this script from the project root after creating your frontend folder."
  exit 1
fi

echo "📥 Installing npm dependencies..."
npm install

# --- Install Firebase client SDK ---
if ! grep -q "\"firebase\"" package.json; then
  echo ""
  echo "🔥 Installing Firebase SDK for frontend..."
  npm install firebase
else
  echo "✅ Firebase already listed in package.json"
fi

cd ..

echo ""
echo "======================================"
echo " ✅ Setup Complete!"
echo "--------------------------------------"
echo "To start the development servers:"
echo ""
echo "  1️⃣  Start backend:"
echo "      cd backend"
if [ "$PLATFORM" = "windows" ]; then
echo "      venv\\Scripts\\activate"
else
echo "      source venv/bin/activate"
fi
echo "      uvicorn main:app --reload"
echo ""
echo "  2️⃣  Start frontend:"
echo "      cd frontend"
echo "      npm start"
echo ""
echo "Then open http://localhost:3000 to view your app."
echo "======================================"
