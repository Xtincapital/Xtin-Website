#!/bin/bash
# Start Xtin Journal AI Coach API Server

cd "$(dirname "$0")"

# Activate virtual environment
source .venv/bin/activate

# Start the server
echo "Starting Xtin Journal AI Coach API Server on port 8001..."
echo "API Docs available at: http://127.0.0.1:8001/docs"
echo ""

python main.py
