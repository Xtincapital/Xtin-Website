# Document 06 - Implementation Plan

## App Name

Xtin Journal

## Purpose

This implementation plan defines the build sequence for Xtin Journal. It is the step-by-step roadmap for turning the PRD, TRD, App Flow, UI/UX Brief, and Backend Schema into a stable product without skipping foundation layers.

## Build Principle

Build in dependency order:

1. Project setup and configuration.
2. Database and auth foundations.
3. Core journal data flows.
4. Analytics and AI features.
5. Payments and persistence hardening.
6. UI polish, testing, and deployment.

Do not add major UI surfaces before the data model, auth behavior, and environment configuration are clear.

## Source Documents

Implementation must stay aligned with:

- `docs/01-prd.md`: What the product must do.
- `docs/02-trd.md`: Technical stack and constraints.
- `docs/03-app-flow.md`: Navigation and journey behavior.
- `docs/04-ui-ux-design-brief.md`: Visual and interaction rules.
- `docs/05-backend-schema.md`: Data model, auth, and security rules.

When implementation changes one of these contracts, update the affected document in the same work cycle.

## MVP Scope Boundary

Build now:

- Local and Supabase-backed journal state.
- Trade logging, editing, deleting, importing, exporting, backup, and restore.
- Dashboard, analytics, calendar, heatmaps, psychology, hourly, monthly, and daily views.
- Supabase email/password auth.
- Claude AI coach, pre-trade check, and weekly review.
- Razorpay AI token recharge.
- Responsive UI and production deployment.

Defer unless explicitly requested:

- Broker API integrations.
- Live trade execution.
- Native mobile app.
- Normalized trade database migration.
- Persistent AI conversation history.
- Admin dashboard.
- Stored import files and screenshots.

## Phase 1: Setup

Goal: Make the repo predictable, runnable, and safe to configure.

Tasks:

- Confirm current stack: static HTML/CSS/JS frontend, FastAPI backend, Supabase, Claude, Razorpay, Vercel, Render.
- Keep docs in `docs/` with numbered filenames.
- Verify `requirements.txt` installs backend dependencies.
- Create or update `.env.example` with required backend variables.
- Confirm frontend runtime config path for backend URL and Supabase public keys.
- Confirm local backend command: `python main.py`.
- Confirm production backend command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
- Align `render.yaml` env placeholders with actual backend variables.

Done criteria:

- Repo can be cloned and understood from README plus docs.
- Backend dependencies install cleanly.
- Required environment variables are documented.
- No real secrets are committed.

Verification:

- Run dependency install.
- Run backend locally.
- Confirm `GET /health`.
- Confirm README and docs agree on env vars.

Risk gate:

- Do not continue to paid AI/payment work until env var names are correct and secret handling is clear.

## Phase 2: Database and Schema

Goal: Establish secure persistence before expanding features.

Tasks:

- Apply `supabase-schema.sql` in Supabase.
- Confirm `journal_user_state` exists.
- Confirm primary key `(user_id, state_key)`.
- Confirm FK to `auth.users(id)` with cascade delete.
- Enable RLS.
- Verify select/insert/update/delete policies restrict users to their own rows.
- Confirm indexes exist for `(user_id, updated_at desc)`.
- Decide whether v1 remains JSONB-state only or starts normalized tables.
- If normalizing, implement tables from `docs/05-backend-schema.md` in migration order.

Done criteria:

- Signed-in users can read/write only their own state.
- Guest users cannot access Supabase state.
- Backend service role is only used server-side.
- Schema matches `docs/05-backend-schema.md`.

Verification:

- Sign in as one Supabase user and save state.
- Sign in as another user and confirm rows are isolated.
- Confirm service role key is not present in browser code.

Risk gate:

- Do not build cloud-only features until RLS is verified.

## Phase 3: Authentication

Goal: Make local mode and cloud mode reliable.

Tasks:

- Initialize Supabase client from frontend config.
- Implement email/password signup.
- Implement email/password signin.
- Implement signout.
- Support profile metadata: full name and age.
- Keep Continue Local available.
- Reload journal state after successful signin.
- Show clear Local vs Cloud sync state.
- Handle Supabase-not-configured gracefully.

Done criteria:

- User can use the app without signing in.
- User can create account and sign in.
- User can sign out without losing local usability.
- Signed-in user sees cloud sync state.
- Auth errors stay understandable and non-destructive.

Verification:

- Test Supabase configured.
- Test Supabase not configured.
- Test wrong password.
- Test signout.
- Test local data still works after signout.

Risk gate:

- Do not remove local mode while improving auth.

## Phase 4: Core Journal Features

Goal: Make the main trading journal useful without AI.

Tasks:

- Implement/add trade modal flow.
- Implement edit trade flow.
- Implement delete trade flow with confirmation.
- Implement quick add flow.
- Persist trades locally.
- Sync trades to Supabase when signed in.
- Support currencies and timezone settings.
- Maintain custom strategies.
- Implement goals: add, render, refresh, remove.
- Implement backup JSON.
- Implement restore JSON with validation and confirmation.
- Implement export CSV.
- Implement clear all with confirmation.

Done criteria:

- User can create, edit, delete, and review trades.
- User can recover/export their data.
- Goals update from journal data.
- Local and signed-in modes both work.
- Destructive actions require confirmation.

Dependency:

- Requires Phase 1 setup.
- Requires Phase 3 for cloud sync behavior, but local journal work can proceed before full auth polish.

Verification:

- Add a winning trade.
- Add a losing trade.
- Edit both.
- Delete one.
- Confirm trade count and P&L update.
- Refresh browser and confirm persistence.

## Phase 5: Import Flow

Goal: Let users bring existing trade history into the journal safely.

Tasks:

- Implement import type modal.
- Support CSV, XLSX, XLS, and PDF file selection.
- Parse files through backend `/api/v2/import-trades`.
- Keep browser parser fallback.
- Normalize imported rows into frontend trade shape.
- Show import preview before committing.
- Confirm import before writing trades.
- Tag imported trades.
- Show helpful errors for unsupported or empty files.

Done criteria:

- User can import supported files.
- User sees parsed rows before saving.
- Canceling preview does not modify journal.
- Failed imports do not corrupt existing data.

Dependency:

- Requires stable trade shape from Phase 4.

Verification:

- Import CSV.
- Import XLSX.
- Import XLS if supported by environment.
- Import representative PDF.
- Import unsupported file and confirm error.
- Cancel preview and confirm no rows added.

## Phase 6: Analytics and Review

Goal: Turn journal data into useful performance feedback.

Tasks:

- Compute dashboard metrics.
- Render recent trades.
- Render summary metrics.
- Render monthly and daily views.
- Render strategy analytics.
- Render hourly analysis.
- Render psychology/emotion analysis.
- Render calendar and heatmaps.
- Ensure analytics update after trade add/edit/delete/import/restore.
- Handle no-trade empty states.

Done criteria:

- User can understand performance from real trade data.
- Analytics refresh consistently after data changes.
- Empty states guide users to add/import trades.
- Charts and tables remain readable.

Dependency:

- Requires trade create/edit/delete/import flows.

Verification:

- Compare dashboard total P&L to manual calculation.
- Compare win rate to trade table.
- Confirm strategy breakdown after changing a strategy.
- Confirm analytics after restore.

## Phase 7: AI Coach

Goal: Add AI guidance on top of real journal context.

Tasks:

- Implement wallet read endpoint and UI display.
- Implement AI coach chat endpoint and UI.
- Implement pre-trade check.
- Implement weekly review.
- Ensure prompts use compact journal context.
- Enforce no-financial-advice behavior.
- Deduct AI tokens after successful Claude response.
- Return token usage and remaining balance.
- Handle missing API key, insufficient tokens, and upstream failures.
- Keep AI coach widget and AI Coach tab consistent.

Done criteria:

- AI coach answers with journal-aware context.
- Pre-trade check works.
- Weekly review works.
- Token balance updates after use.
- Low-token state routes user to recharge.
- AI never presents guaranteed trade signals.

Dependency:

- Requires stable journal data and backend env vars.
- Requires wallet read path from Phase 8 if paid token enforcement is active.

Verification:

- Ask AI with no trades.
- Ask AI with sample trades.
- Generate weekly review with trades.
- Generate weekly review without trades.
- Run pre-trade check.
- Test missing `ANTHROPIC_API_KEY`.
- Test insufficient token response.

Risk gate:

- Do not launch AI without no-financial-advice guardrails and token failure handling.

## Phase 8: Payments and Wallet Hardening

Goal: Make paid AI credits safe and idempotent.

Tasks:

- Implement AI package list.
- Create Razorpay order from backend.
- Open Razorpay checkout from frontend.
- Verify payment signature on backend.
- Credit tokens only after verification.
- Prevent duplicate credits using payment IDs.
- Persist wallet to Supabase when configured.
- Show success/failure payment states clearly.
- Prepare future normalized wallet transaction table if needed.

Done criteria:

- Test payment credits wallet exactly once.
- Failed/cancelled payment credits nothing.
- Wallet survives refresh when Supabase is configured.
- Frontend cannot directly credit tokens.

Dependency:

- Requires Phase 2 schema and Phase 3 identity if wallet is user-bound.

Verification:

- Create Razorpay test order.
- Complete successful payment.
- Verify wallet token increase.
- Re-submit same payment verification and confirm no duplicate credit.
- Cancel checkout and confirm no credit.
- Try invalid signature and confirm no credit.

Risk gate:

- Do not use live Razorpay credentials until duplicate-credit prevention is verified.

## Phase 9: UI Polish and Responsive Design

Goal: Make the product feel coherent, usable, and trustworthy.

Tasks:

- Apply `docs/04-ui-ux-design-brief.md`.
- Keep main journal as first usable screen.
- Standardize buttons, cards, tables, forms, modals, toasts, and AI coach surfaces.
- Add loading states.
- Add empty states.
- Add error states.
- Verify mobile layouts.
- Verify table horizontal scrolling.
- Verify text does not overflow buttons/cards/tabs.
- Preserve accessible tab and modal behavior.

Done criteria:

- UI feels consistent across journal, dashboard, pricing, and AI coach.
- Mobile has no incoherent overlap.
- Primary actions are easy to find.
- Empty/error/loading states are present.
- Keyboard focus is visible.

Verification:

- Check desktop viewport.
- Check tablet viewport.
- Check mobile viewport below 480px.
- Check trade table scroll.
- Check AI coach panel on mobile.
- Check modal fit and scroll.
- Check color contrast for primary text and status badges.

## Phase 10: Testing and Edge Cases

Goal: Catch the failures users will actually hit.

Tasks:

- Test local mode without Supabase.
- Test signup, signin, signout.
- Test cloud state reload.
- Test add/edit/delete trades.
- Test import success and failure.
- Test backup/restore/export.
- Test analytics after data changes.
- Test AI with no trades.
- Test AI with insufficient tokens.
- Test missing backend env vars.
- Test Razorpay success/failure/cancel.
- Test mobile and desktop layouts.
- Test `/health`.
- Add automated tests for backend analytics, imports, wallet, and payment verification where possible.

Done criteria:

- All core flows work manually.
- Known edge cases have graceful messages.
- Backend health check passes.
- Payment and wallet logic has test coverage before production scaling.

Suggested automated backend tests:

- Trade analytics calculations.
- Import parser happy paths and invalid files.
- Wallet credit idempotency.
- Wallet debit insufficient balance.
- Razorpay signature verification.
- Health endpoint.

Suggested frontend smoke tests:

- App loads.
- User can add trade.
- User can switch tabs.
- Import preview opens.
- AI wallet label renders.
- Pricing page loads.

## Phase 11: Deployment

Goal: Ship safely with correct production configuration.

Tasks:

- Configure Supabase project and schema.
- Configure Render backend service.
- Set backend env vars:
  - `ANTHROPIC_API_KEY`
  - `ANTHROPIC_MODEL`
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ALLOWED_ORIGINS`
  - `PORT`
- Configure Vercel frontend.
- Set backend URL meta/runtime config.
- Set Supabase URL and anon key for frontend.
- Verify CORS.
- Run pre-deploy script.
- Run health check after deploy.
- Test production signup, journal sync, AI, and Razorpay test payment.

Done criteria:

- Frontend is live on Vercel.
- Backend is live on Render.
- `/health` returns healthy.
- Supabase sync works.
- AI endpoints work.
- Razorpay test payment credits tokens.
- No production secrets are exposed in browser code.

Deployment checklist:

- `ALLOWED_ORIGINS` includes production frontend URL.
- Frontend backend URL points to the deployed Render service.
- Supabase anon key is frontend-safe.
- Supabase service role key exists only in backend environment.
- Razorpay keys match test/live mode intentionally.
- Claude model name is configured.
- Render logs show backend started successfully.
- Browser console has no CORS errors.

Rollback checkpoint:

- Keep previous deployed frontend/backend available until production smoke test passes.
- Keep database schema migration scripts reversible where practical.
- Do not delete old JSON state during normalized migration.

## Phase 12: Launch Readiness

Goal: Confirm v1 is ready for real users.

Tasks:

- Review PRD success metrics.
- Verify legal/safety language around AI and trading advice.
- Confirm pricing/token copy.
- Confirm support/contact path.
- Confirm backup/export path.
- Confirm analytics empty states.
- Confirm mobile usability.
- Confirm monitoring and manual rollback plan.

Done criteria:

- A new user can land, log/import trades, review analytics, use AI, recharge tokens, and return later with data intact.
- A signed-in user can sync state.
- A local user can still use the journal.
- Payment and AI failures are recoverable.

Launch checklist:

- PRD success metrics are measurable.
- Pricing/token packs are final.
- Support path is visible.
- AI safety language is visible.
- README production checklist is current.
- Docs 01-06 reflect implemented behavior.
- Known limitations are documented.

## Build Order Checklist

1. Confirm docs and env vars.
2. Verify Supabase schema and RLS.
3. Verify auth and local mode.
4. Stabilize trade CRUD and persistence.
5. Stabilize import/export/backup/restore.
6. Stabilize analytics.
7. Add AI coach behavior.
8. Add payment and wallet hardening.
9. Polish UI and responsive states.
10. Test edge cases.
11. Deploy staging/production.
12. Complete launch readiness.

## Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| RLS misconfigured | Cross-user data exposure | Verify policies before launch |
| Service role exposed | Full database compromise | Keep service role backend-only |
| Duplicate payment credit | Revenue/token accounting issue | Enforce payment ID idempotency |
| AI costs exceed revenue | Margin loss | Token pricing and compact prompts |
| Import parser bad data | Wrong analytics | Preview before commit and allow edit |
| Local/cloud sync conflict | Data confusion | Keep clear Local vs Cloud state |
| Mobile table usability | Poor mobile UX | Horizontal scroll and compact controls |
| AI advice misunderstood | User trust/safety issue | Process-focused prompts and disclaimers |

## Documentation Maintenance

Update docs when:

- New route/page is added: update App Flow.
- New env var or service is added: update TRD.
- New table/column/RLS policy is added: update Backend Schema.
- New user-facing feature is added: update PRD and Implementation Plan.
- UI tokens or patterns change: update UI/UX Design Brief.
- Build order changes materially: update this document.

## Overall Done Criteria

Xtin Journal v1 is finished when:

- Core journal workflows work end-to-end.
- Supabase auth and cloud sync work.
- Trade import/export/backup/restore work.
- Analytics update from real trade data.
- AI coach, pre-trade check, and weekly review work with token enforcement.
- Razorpay recharge credits tokens only after backend verification.
- UI matches the design brief across desktop and mobile.
- RLS prevents cross-user data access.
- Production deployment is configured and health checks pass.
- Documentation remains aligned with the implemented product.
