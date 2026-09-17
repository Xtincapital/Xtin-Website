# Document 02 - Technical Requirements Document

## App Name

Xtin Journal

## Purpose

This TRD defines the technical choices for Xtin Journal so future implementation work stays consistent across frontend, backend, database, AI, payments, deployment, and configuration.

## Frontend

- Framework: No frontend framework for v1.
- Runtime: Static HTML, CSS, and vanilla JavaScript.
- Primary pages:
  - `index.html`: Marketing/home and main route fallback.
  - `dashboard.html`: Journal, analytics, goals, auth, and AI coach workspace.
  - `pricing.html`: AI token pricing and payment explanation.
- Primary scripts:
  - `app.js`: Journal state, trade workflows, charts, dashboard UI, imports, and analytics rendering.
  - `ai-coach.js`: AI coach UI, wallet display, token recharge, pre-trade checks, and weekly review calls.
  - `supabase-journal.js`: Supabase auth and cloud state sync.
  - `config-injection.js`: Runtime frontend configuration.
- Styling:
  - Keep using existing CSS in HTML files and `ai-coach.css`.
  - Do not introduce Tailwind, React, Next.js, Vue, or a bundler unless a future architecture document explicitly changes the stack.
- Charts:
  - Use Chart.js for dashboard and analytics visualizations.

## Backend

- Language: Python 3.11.
- Framework: FastAPI.
- ASGI server: Uvicorn.
- Main backend entry point: `main.py`.
- Backend responsibilities:
  - Trade analysis and metric calculation.
  - Behavioral pattern detection.
  - Claude-powered AI coach responses.
  - Pre-trade checks.
  - Weekly reviews.
  - AI wallet reads/writes.
  - Razorpay order creation and payment signature verification.
  - Health and metadata endpoints.

## Database

- Provider: Supabase.
- Database: PostgreSQL.
- Auth provider: Supabase Auth.
- Current persistence model:
  - Journal state is stored in `public.journal_user_state`.
  - Each user/state pair stores a JSON payload by `state_key`.
  - Row-level security restricts users to their own state.
- Schema source: `supabase-schema.sql`.
- Required table:
  - `journal_user_state`
- Required state keys:
  - `trades`
  - `goals`
  - `custom_strategies`
  - `settings`
  - `subscription`
  - `invoices`
  - `ai_usage`
  - `drafts`
  - `ai_wallet`

## Auth

- Provider: Supabase Auth.
- Methods for v1:
  - Email and password sign up.
  - Email and password sign in.
  - Sign out.
  - Profile metadata update for display name and age.
- Local mode:
  - The app may continue to support browser-local journal data when Supabase is not configured or the user is not signed in.
- Cloud mode:
  - When a user signs in, real journal state syncs to Supabase under that user's ID.

## Hosting

- Frontend hosting: Vercel.
- Backend hosting: Render.
- Database and auth hosting: Supabase.
- Frontend deployment config: `vercel.json`.
- Backend deployment config: `render.yaml`.
- Backend start command:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

- Local backend command:

```bash
python main.py
```

## API Surface

### System

- `GET /`: Service metadata and route map.
- `GET /health`: Health check for deployment monitoring.

### Journal and Analytics

- `POST /api/v2/import-trades`: Parse uploaded CSV, XLSX, XLS, or PDF trade files.
- `GET /api/v2/profile?user_id=...`: Profile scaffold and metadata.
- `POST /api/v2/analyze`: Trade analytics, strategy analysis, issues, and improvement plan.
- `GET /api/v2/behavioral-alerts?user_id=...`: Behavioral alerts.

### AI

- `POST /api/v2/chat`: AI coach chat with trade context.
- `POST /api/v2/pre-trade-check`: Claude-powered pre-trade assessment.
- `POST /api/v2/weekly-review`: Claude-powered weekly trading review.

### AI Wallet and Payments

- `GET /api/v2/ai/plans`: Available AI token packs.
- `GET /api/v2/ai/wallet?user_id=...`: User AI wallet and plan list.
- `POST /api/v2/ai/razorpay/order`: Create Razorpay order.
- `POST /api/v2/ai/razorpay/verify`: Verify Razorpay payment signature and credit tokens.

### Subscription and Billing Records

- `GET /api/v2/subscription?user_id=...`: Current subscription status.
- `POST /api/v2/subscription`: Create a subscription record and invoice.
- `PATCH /api/v2/subscription/cancel`: Cancel an existing subscription record.
- `GET /api/v2/invoices?user_id=...`: Invoice list for a user.

## Data Contracts

### Backend TradeData Model

The FastAPI analysis endpoints expect normalized trade objects with these fields:

- `id`: Integer trade identifier.
- `symbol`: Instrument symbol or display name.
- `entry_price`: Numeric entry price.
- `exit_price`: Numeric exit price.
- `quantity`: Integer quantity.
- `profit_loss`: Numeric realized P&L.
- `trading_type`: Trade type such as intraday, swing, or positional.
- `market`: Market or segment.
- `strategy`: Strategy/setup name.
- `date`: Trade date string.
- `time_in_trade`: Optional duration string.
- `win_loss`: Outcome label.

### Frontend Trade Shape

The dashboard may store richer client-side trade objects. When sending data to backend analytics, the frontend must normalize those objects into the backend `TradeData` model.

Expected client-side trade fields include:

- `date`
- `entryTime`
- `exitTime`
- `type`
- `market`
- `asset`
- `currency`
- `quantity`
- `entryPrice`
- `targetPrice`
- `stopLoss`
- `exitPrice`
- `brokerage`
- `strategy`
- `margin`
- `buySell`
- `pnl`
- `emotion`
- `notes`
- `tags`
- `strikePrice`
- `optionType`
- `underlyingPrice`
- `impliedVolatility`
- `daysToExpiry`

### AI Wallet Shape

- `user_id`
- `token_balance`
- `tokens_purchased`
- `tokens_used`
- `last_recharge`
- `credited_payments`
- `updated_at`

### Razorpay Verification Payload

- `user_id`
- `package_id`
- `razorpay_order_id`
- `razorpay_payment_id`
- `razorpay_signature`

The backend must validate that the stored order matches the user and package before verifying the signature and crediting tokens.

## Import Requirements

- Supported import formats: CSV, XLSX, XLS, and PDF.
- Backend import parser endpoint: `POST /api/v2/import-trades`.
- Browser fallback parsing may remain available when the backend parser is unavailable.
- Import flow must show a preview before committing trades into the journal.
- Imported trades should include the `imported` tag by default.
- Import parsing should tolerate common broker column names such as symbol, ticker, instrument, quantity, buy/sell, entry price, exit price, brokerage, P&L, strategy, and notes.
- Failed imports should explain whether the issue is unsupported file type, missing required columns, or unreadable file content.

## Third-Party APIs and Services

- Anthropic Claude API:
  - Purpose: AI coach chat, pre-trade checks, and weekly reviews.
  - Tier: Paid usage.
- Razorpay:
  - Purpose: AI token pack checkout, order creation, payment verification.
  - Tier: Paid/payment processor.
- Supabase:
  - Purpose: PostgreSQL database, user auth, journal state sync, AI wallet persistence.
  - Tier: Free tier acceptable for early v1 usage, paid tier may be needed as usage grows.
- Vercel:
  - Purpose: Static frontend hosting.
  - Tier: Free tier acceptable for v1.
- Render:
  - Purpose: FastAPI backend hosting.
  - Tier: Free tier acceptable for early testing, paid tier recommended for production reliability.
- Chart.js:
  - Purpose: Frontend analytics charts.
  - Tier: Open-source library.

## Key Libraries

### Python

- `fastapi`: API framework.
- `uvicorn`: ASGI server.
- `python-dotenv`: Local environment variable loading.
- `httpx`: HTTP client for Anthropic, Razorpay, and Supabase REST calls.
- `python-multipart`: File/form handling support.
- `openpyxl`: Excel import support.
- `xlrd`: Legacy Excel import support.
- `pypdf`: PDF import support.

### Frontend

- Chart.js: Chart rendering.
- Supabase JS client: Auth and journal state sync.
- Razorpay Checkout script: Payment checkout.
- Font Awesome: Existing icon usage where present in the UI.

## Environment Variables

### Backend

- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGINS`
- `PORT`
- `RENDER_EXTERNAL_URL`
- `RENDER`

### Frontend Runtime Configuration

- `XTIN_JOURNAL_SUPABASE_URL`
- `XTIN_JOURNAL_SUPABASE_ANON_KEY`
- `BACKEND_URL`
- `meta[name="backend-url"]`
- `meta[name="supabase-url"]`
- `meta[name="supabase-anon-key"]`

Frontend values may be provided through runtime globals, meta tags, or deployment-time injection. Secret values must never be exposed to frontend code.

## Folder Structure and Naming Conventions

```text
.
|- index.html
|- dashboard.html
|- pricing.html
|- app.js
|- ai-coach.js
|- ai-coach.css
|- supabase-journal.js
|- config-injection.js
|- main.py
|- requirements.txt
|- supabase-schema.sql
|- vercel.json
|- render.yaml
|- docs/
|  |- 01-prd.md
|  `- 02-trd.md
`- assets/
```

- Documentation files use two-digit numeric prefixes, lowercase slugs, and `.md`.
- Frontend scripts use kebab-case filenames when they are standalone feature files.
- Python backend code remains in `main.py` for v1 unless the backend becomes large enough to justify splitting into modules.
- API paths use `/api/v2/...` for current production-facing endpoints.
- JavaScript functions and variables use camelCase.
- Python functions and variables use snake_case.

## Technical Constraints

- Keep v1 framework-light: no React, Next.js, build pipeline, or TypeScript migration unless explicitly approved.
- Frontend must run as static files on Vercel.
- Backend must run as FastAPI on Render with Uvicorn.
- Supabase service role key must only be used server-side.
- Razorpay payment signatures must be verified by the backend before tokens are credited.
- AI API keys must only be used server-side.
- CORS must be restricted by `ALLOWED_ORIGINS` in production.
- The dashboard must remain usable in local/browser mode when Supabase is unavailable.
- The UI must work on desktop and common mobile viewport sizes.
- AI features must degrade gracefully when tokens, API keys, or upstream services are unavailable.
- Avoid adding new third-party services unless they directly support PRD requirements.
- Avoid schema churn: update `supabase-schema.sql` whenever database requirements change.

## AI Technical Requirements

- Claude calls must be made only from the backend.
- AI prompts should include compact trade summaries rather than entire unbounded journal history.
- AI responses should return token usage and remaining wallet balance when applicable.
- Token deduction should happen after a successful Claude response.
- If `ANTHROPIC_API_KEY` is missing, AI endpoints must return an explicit server configuration error.
- If a user has insufficient AI tokens, AI endpoints must return a clear payment/top-up error.
- Prompt rules should reinforce that the AI gives coaching and analysis, not financial advice or guaranteed trade signals.

## Error Handling Requirements

- Client-facing errors should be understandable without exposing secrets or stack traces.
- Payment errors should distinguish order creation failure, invalid signature, mismatched order, and duplicate credit protection.
- AI errors should distinguish missing configuration, insufficient tokens, and upstream API failure.
- Import errors should distinguish unsupported file type from parse failure.
- Empty journal states should return useful empty responses rather than crashing.
- `/health` should not depend on Anthropic, Razorpay, or Supabase availability.

## Security Requirements

- Never commit real API keys or payment credentials.
- Store backend secrets in Render environment variables.
- Store Supabase anon key only as a frontend-safe public key.
- Use Supabase RLS policies for user-owned state.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Do not credit AI tokens until Razorpay signature verification succeeds.
- Prevent duplicate payment credits by tracking credited payment IDs.
- Treat trade data as sensitive financial behavior data.

## Performance Requirements

- Initial frontend pages should load without a build step.
- Chart rendering should avoid unnecessary re-render loops.
- AI prompts should be compact enough to control latency and token cost.
- Empty states should render quickly without waiting for AI services.
- `/health` should respond without calling external services.

## Observability and Operations

- Keep `/health` available for Render uptime checks.
- Backend errors for missing env vars should be explicit.
- Log payment, wallet, and AI upstream failures enough to debug production issues without logging secrets.
- Use `pre-deploy-check.sh` before production deployment.
- Use `health-check.sh` after backend deployment.

## Testing Requirements

### Backend Tests

- Analytics calculations for total P&L, win rate, profit factor, expectancy, and strategy breakdown.
- Behavioral alert detection for overtrading, repeated losses, poor risk/reward, and revenge-trading-like patterns.
- Import parsing for CSV, XLSX, XLS, and representative PDF text.
- AI wallet token credit and deduction behavior.
- Razorpay signature verification and duplicate payment prevention.
- AI endpoint failures for missing API key and insufficient token balance.
- `/health` response.

### Frontend Tests

- Dashboard loads without Supabase configured.
- Supabase sign-in state changes update UI labels and cloud sync behavior.
- User can add a trade and see analytics update.
- Import preview appears before imported trades are committed.
- AI wallet balance renders correctly.
- Razorpay checkout failure and success states are visible to the user.
- Mobile viewport does not overlap key dashboard, pricing, or AI coach controls.

### Manual QA Checklist

- Open `index.html`, `/dashboard`, and `/pricing` locally or on Vercel.
- Start backend with `python main.py` and confirm `GET /health`.
- Run `bash pre-deploy-check.sh`.
- Run `bash health-check.sh` after deployment.
- Create a Supabase user and confirm journal state syncs.
- Add sample trades and confirm analytics charts render.
- Run AI coach chat, pre-trade check, and weekly review with a test wallet.
- Complete a Razorpay test checkout and verify token credit.

## Deployment Notes

- `render.yaml` should define Python 3.11 and the Uvicorn start command.
- Render environment variables should use the backend variable list in this TRD.
- Any older `OPENAI_API_KEY` placeholder should be replaced by `ANTHROPIC_API_KEY` unless the backend is intentionally migrated to OpenAI later.
- Vercel should serve the repo root as a static output directory.
- Vercel rewrites should preserve clean routes for `/dashboard` and `/pricing`.

## Implementation Boundaries for AI Agents

- Do not replace the current frontend stack with a framework unless explicitly requested.
- Do not move secrets into browser-readable files.
- Do not remove local/browser mode while adding Supabase features.
- Do not change payment crediting behavior without preserving server-side signature verification.
- Do not add trading signal generation, broker execution, or direct buy/sell recommendation logic.
- Do not normalize the database prematurely unless a future document changes the persistence strategy.
- When adding features, update PRD/TRD docs if the product or technical contract changes.

## Recommended Near-Term Technical Fixes

- Update `render.yaml` environment placeholders to match the actual backend variables, especially `ANTHROPIC_API_KEY`.
- Add a minimal `.env.example` if it is missing from the repo.
- Add automated tests for payment verification and wallet idempotency before expanding paid AI usage.
- Consider extracting backend models into a separate module once the API grows beyond the current single-file shape.
- Add a production CORS checklist to prevent accidental wildcard origins.

## Future Technical Considerations

- Split `main.py` into routers/services if backend complexity grows.
- Move trade records from JSON state payloads into normalized database tables if analytics, imports, or reporting need stronger querying.
- Add automated backend tests for analytics, wallet credits, Razorpay verification, and AI error handling.
- Add frontend smoke tests for dashboard loading, trade creation, analytics rendering, and AI wallet display.
- Consider Supabase Edge Functions only if backend responsibilities move away from Render.
