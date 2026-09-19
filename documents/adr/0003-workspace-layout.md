# ADR 0003 — npm workspaces, `apps/web` + `services/api`

**Status:** Accepted (Phase 1, 2026-09-13)

## Context

The pre-migration repo had four independently-cloned product codebases
plus a legacy core platform split across `Client/` (React frontend),
`backend/` (Express API, files with `.mjs` extensions), and
`services/ai-legacy/` (a separate Python service handling AI chat,
compliance rules, and prompt building). Each of the three incoming
products (`features-incoming/fundakamental`, `journal`, `gini`) arrived via
`git subtree add` with its own `package.json`, its own dependency
versions, and — in FundaKaMental's case — its own separate backend
service.

Before any of the four products' actual code could be merged, the repo
needed one answer to: how many `package.json` files does this project
have, how are they related, and where does new shared code (a shadcn/ui
component library, a region/currency helper, an auth context) live so
every product can use it without four copies drifting apart.

## Decision

npm workspaces, two workspace packages: `apps/web` (the single React
frontend, renamed from `Client/`) and `services/api` (the single Express
backend, renamed from `backend/`, with every `.mjs` file converted to
`.ts` in Phase 5). One root `package.json` declaring both workspaces, one
root lockfile, root-level `dev:web`/`dev:api`/`lint`/`typecheck`/`test`/
`format` scripts that delegate into the two workspaces via `--workspace`.
`services/ai-legacy` (the Python AI service) was deleted outright once its
logic was ported natively into `services/api/modules/ai/` (Phase 7), not
kept as a third workspace.

## Consequences

- **One dependency tree, one place duplicate/conflicting versions surface.**
  Merging FundaKaMental's frontend code into `apps/web` in Phase 8
  surfaced three real version mismatches this structure caught early
  (`apps/web` already had newer majors of `react-day-picker`,
  `react-resizable-panels`, and `recharts` than FundaKaMental's own source
  targeted) — fixed by adapting the ported component code to the already-
  installed APIs rather than downgrading the whole workspace, which a
  four-separate-`package.json` layout would have let slide past
  unnoticed until runtime.
- **Every later "add a product" phase (8, 9, 10) followed the exact same
  shape**, because the workspace boundary was already fixed: pull the
  product's source via `git subtree add` into `features-incoming/<name>`
  (kept, read-only, as a citable reference — never deleted, never treated
  as live code), port its backend into a new `services/api/modules/<name>/`
  directory, port its frontend into a new `apps/web/src/features/<name>/`
  directory reusing the one shared `components/ui/` library and the one
  shared `AuthContext`/`authService`. No product ever needed its own
  `package.json`, its own lockfile, or its own build config.
- **CI has exactly two build/lint/typecheck jobs to reason about** (`web`,
  `api`), each running once against the whole workspace rather than once
  per product — a regression in a shared file (the auth middleware, the
  shadcn design tokens, `lib/region.ts`) is caught by one job run touching
  every consumer, not by hoping four separate per-product CI configs all
  happened to test the shared surface.
- **The tradeoff:** every product's frontend/backend now ships together —
  there's no way to deploy a FundaKaMental-only frontend change without
  rebuilding all of `apps/web`, or scale `services/api` per-product. This
  was accepted as the right tradeoff for a project of this size (four
  products, one team, one deploy target — see the deploy configs in
  `services/api/render.yaml` / `apps/web/vercel.json`) rather than
  over-engineering for an independent-scaling need that doesn't exist yet.
