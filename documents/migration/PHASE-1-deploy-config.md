# Phase 1 — Deploy Dashboard Changes (owner action)

Phase 1 moved `Client/` → `apps/web/` and `backend/` → `services/api/`. The repo
files are updated (`render.yaml` now has `rootDir: services/api`; both
`vercel.json`s are unchanged since they're already root-relative to whichever
directory Vercel treats as the project root). The **hosting dashboards** still
point at the old paths and need a manual update before you deploy this branch's
merge to `main`.

## Vercel (frontend)

1. Project → Settings → General → **Root Directory** → change `Client` → `apps/web`.
2. Build/Output/Install commands are already `npm run build` / `dist` / `npm install` — no change needed, they're resolved relative to the new root directory.
3. Redeploy once merged; verify the deployed site loads and `/api/*` still rewrites to the Render backend (`apps/web/vercel.json` rewrite rule is unchanged — it targets the hosted backend URL, not a local path).

## Render (backend web service)

1. Service → Settings → **Root Directory** → change `backend` → `services/api`.
2. Build Command stays `npm install`. **Start Command changed in Phase 5**
   (TypeScript conversion): it's now `npx tsx index.ts`, not `node index.mjs`
   — update this in the dashboard's Start Command field, since a dashboard-set
   value overrides whatever `render.yaml` says.
3. Redeploy; verify `GET /` and `GET /health`.
4. If this service was launched from `render.yaml` as a Blueprint, the new `rootDir: services/api` key (and the updated `startCommand: npx tsx index.ts`) in `services/api/render.yaml` covers it automatically on next sync — otherwise use the dashboard fields in steps 1 and 2.

## Render (new worker service for cron — introduced by the plan, not required to complete Phase 1)

Not created yet. `services/newsletter/scheduler.ts` still runs inside the web
service for now (a later phase moves it to a dedicated worker). No action
needed here today.

## Sanity checklist after both dashboard changes

- [ ] Vercel Root Directory = `apps/web`
- [ ] Render Root Directory = `services/api`
- [ ] Frontend loads, login works, `/dashboard` loads
- [ ] `POST /api/help/contact` (the bug fixed in Phase 0) succeeds against the redeployed backend
- [ ] Newsletter cron trigger endpoint still responds (`/api/trigger-newsletter?token=...`)
