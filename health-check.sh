#!/bin/bash
# Xtin Journal AI Coach - Troubleshooting Script
# Run this to test your deployment

echo "🔍 Xtin Journal AI Coach - Health Check"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test local server
echo "1️⃣  Testing Local Backend (127.0.0.1:8001)..."
if curl -s http://127.0.0.1:8001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Local backend is running${NC}"
else
    echo -e "${YELLOW}✗ Local backend not found (this is OK for production)${NC}"
fi
echo ""

# Test Render backend vs local backend
echo "2️⃣  Testing Backend Endpoints..."
BACKEND_URL="http://127.0.0.1:8001"
if ! curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
    BACKEND_URL="https://xtin-backend.onrender.com"
fi

if curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is accessible at ($BACKEND_URL)${NC}"
    
    # Test profile endpoint
    echo "3️⃣  Testing API Endpoints..."
    PROFILE=$(curl -s "$BACKEND_URL/api/v2/profile?user_id=test_user")
    if echo "$PROFILE" | grep -q "user_id"; then
        echo -e "${GREEN}✓ Profile endpoint working${NC}"
    else
        echo -e "${RED}✗ Profile endpoint failed${NC}"
    fi
    
    # Test analyze endpoint
    ANALYZE=$(curl -s -X POST "$BACKEND_URL/api/v2/analyze" \
        -H "Content-Type: application/json" \
        -d '{"user_id":"test","trades":[{"id":"t1","pair":"BTC/USD","type":"BUY","pnl":100,"entryPrice":60000,"exitPrice":61000,"date":"2026-07-25"}]}' 2>/dev/null)
    if echo "$ANALYZE" | grep -q "analysis"; then
        echo -e "${GREEN}✓ Analyze endpoint working${NC}"
    else
        echo -e "${RED}✗ Analyze endpoint failed${NC}"
    fi
    
    # Test chat endpoint
    CHAT=$(curl -s -X POST "$BACKEND_URL/api/v2/chat" \
        -H "Content-Type: application/json" \
        -d '{"user_id":"test","message":"hello"}' 2>/dev/null)
    if echo "$CHAT" | grep -q "reply"; then
        echo -e "${GREEN}✓ Chat endpoint working${NC}"
    else
        echo -e "${RED}✗ Chat endpoint failed${NC}"
    fi
else
    echo -e "${RED}✗ Backend not accessible${NC}"
fi
echo ""

echo "4️⃣  Checking Frontend Configuration..."
if grep -q "backend-url" index.html; then
    echo -e "${GREEN}✓ index.html backend-url meta tag configured${NC}"
else
    echo -e "${RED}✗ index.html backend-url meta tag missing${NC}"
fi
echo ""

if [ -f "Procfile" ]; then
    echo -e "${GREEN}✓ Procfile exists${NC}"
else
    echo -e "${RED}✗ Procfile missing${NC}"
fi
echo ""

echo "================================"
echo "✅ Health check complete!"
echo ""
echo "💡 Tips:"
echo "  - For local testing: python main.py"
echo "  - Visit: https://dashboard.render.com/ to check backend status"
echo "  - Visit: https://vercel.com/ to check frontend status"
