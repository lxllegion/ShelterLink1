#!/usr/bin/env bash
set -e

echo "======================================"
echo " 🚀 FastAPI + React (CRA) Setup Script"
echo "======================================"

# --- Check dependencies ---
for cmd in python3 pip npm; do
  if ! command -v $cmd &>/dev/null; then
    echo "❌ Missing dependency: $cmd"
    echo "Please install $cmd first."
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
  py -m venv venv
fi
# Activate virtual environment based on OS
if [ -f "venv/Scripts/activate" ]; then
  source venv/Scripts/activate
elif [ -f "venv/bin/activate" ]; then
  source venv/bin/activate
else
  echo "Error: Could not find virtual environment activation script."
  exit 1
fi

# Install backend dependencies
if [ ! -f "requirements.txt" ]; then
  echo "fastapi" > requirements.txt
  echo "uvicorn" >> requirements.txt
fi

pip install -r requirements.txt

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

# --- Install React Router DOM ---
if ! grep -q "\"react-router-dom\"" package.json; then
  echo ""
  echo "🛣️  Installing React Router DOM..."
  npm install react-router-dom
  npm install --save-dev @types/react-router-dom
else
  echo "✅ React Router DOM already listed in package.json"
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
echo "      source venv/bin/activate"
echo "      uvicorn main:app --reload"
echo ""
echo "  2️⃣  Start frontend:"
echo "      cd frontend"
echo "      npm start"
echo ""
echo "Then open http://localhost:3000 to view your app."
echo "======================================"
