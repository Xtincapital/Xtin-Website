#!/bin/bash
set -eu

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

pass() {
  echo -e "${GREEN}PASS${NC}  $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

warn() {
  echo -e "${YELLOW}WARN${NC}  $1"
  WARN_COUNT=$((WARN_COUNT + 1))
}

fail() {
  echo -e "${RED}FAIL${NC}  $1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

echo "Xtin pre-deploy checks (Vercel frontend + Render backend)"
echo ""

# 1) Required files
REQUIRED_FILES=(
  "index.html"
  "main.py"
  "vercel.json"
  "render.yaml"
  "requirements.txt"
  ".env.example"
  "health-check.sh"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [[ -f "$file" ]]; then
    pass "Required file exists: $file"
  else
    fail "Missing required file: $file"
  fi
done

# 2) Backend URL in index.html
if grep -q 'meta name="backend-url"' index.html; then
  BACKEND_URL=$(sed -n 's/.*meta name="backend-url" content="\([^"]*\)".*/\1/p' index.html | head -n 1)
  if [[ -z "${BACKEND_URL:-}" ]]; then
    fail "backend-url meta tag exists but content is empty"
  else
    pass "backend-url meta tag found: $BACKEND_URL"

    if [[ "$BACKEND_URL" =~ ^https:// ]]; then
      pass "backend-url uses HTTPS"
    else
      fail "backend-url should use HTTPS in production"
    fi

    if [[ "$BACKEND_URL" == *"your-render-service"* ]]; then
      fail "backend-url still contains placeholder value"
    fi

    if [[ "$BACKEND_URL" != *".onrender.com"* ]]; then
      warn "backend-url is not an onrender.com domain (this is okay if using custom domain)"
    fi
  fi
else
  fail "Missing backend-url meta tag in index.html"
fi

# 3) Core env keys in .env.example
if grep -q '^OPENAI_API_KEY=' .env.example; then
  pass ".env.example includes OPENAI_API_KEY"
else
  fail ".env.example missing OPENAI_API_KEY"
fi

if grep -q '^ALLOWED_ORIGINS=' .env.example; then
  pass ".env.example includes ALLOWED_ORIGINS"
else
  fail ".env.example missing ALLOWED_ORIGINS"
fi

# 4) Render blueprint sanity
if grep -q 'startCommand: uvicorn main:app --host 0.0.0.0 --port \$PORT' render.yaml; then
  pass "render.yaml start command looks correct"
else
  fail "render.yaml start command mismatch"
fi

if grep -q 'OPENAI_API_KEY' render.yaml && grep -q 'ALLOWED_ORIGINS' render.yaml; then
  pass "render.yaml declares required env vars"
else
  fail "render.yaml missing required env vars"
fi

# 5) Vercel config sanity
if grep -q '"destination": "/index.html"' vercel.json; then
  pass "vercel.json SPA rewrite present"
else
  fail "vercel.json missing SPA rewrite to /index.html"
fi

# 6) Optional local .env checks
if [[ -f ".env" ]]; then
  if grep -q '^OPENAI_API_KEY=' .env; then
    VALUE=$(grep '^OPENAI_API_KEY=' .env | head -n 1 | cut -d '=' -f2-)
    if [[ -z "$VALUE" || "$VALUE" == "your_openai_api_key_here" ]]; then
      warn ".env OPENAI_API_KEY looks unset/placeholder"
    else
      pass ".env OPENAI_API_KEY appears configured"
    fi
  else
    warn ".env exists but OPENAI_API_KEY is missing"
  fi
else
  warn "No local .env found (fine for CI/deploy, but local API tests may fail)"
fi

# 7) Optional backend health check
if [[ -n "${BACKEND_URL:-}" ]]; then
  HEALTH_URL="${BACKEND_URL%/}/health"
  if curl -fsS --max-time 8 "$HEALTH_URL" > /dev/null; then
    pass "Backend health endpoint reachable: $HEALTH_URL"
  else
    warn "Backend health endpoint not reachable right now: $HEALTH_URL"
  fi
fi

echo ""
echo "Summary: ${PASS_COUNT} pass, ${WARN_COUNT} warn, ${FAIL_COUNT} fail"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  echo -e "${RED}Pre-deploy check failed. Fix failures before pushing.${NC}"
  exit 1
fi

echo -e "${GREEN}Pre-deploy check passed. Safe to push/deploy.${NC}"
exit 0
