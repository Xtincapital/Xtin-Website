# ADR 0004 — one `features/<product>/` folder per product, on both sides

**Status:** Accepted (Phase 2b for the pre-existing core platform,
extended to every integrated product in Phases 8-10)

## Context

Before Phase 2b, `apps/web/src/pages/` held every page for every part of
the core platform flat, with no grouping by product domain — academy,
tools, certificates, newsletter, algos, auth, and marketing pages all
lived side by side. Adding three more full products (FundaKaMental,
Journal, Gini) — each with 10+ pages, its own API client, its own state
store, its own design tokens — into that flat structure would have made
`src/pages/` unnavigable and made it unclear which files belonged to which
product's release surface.

Separately, `services/api` needed the same question answered on the
backend: where does a new product's routes/controllers/repositories live
relative to the existing `modules/` directory that already held
`auth`, `academy`, `billing`, `algos`, `newsletter`.

## Decision

One `features/<product>/` folder per product on the frontend
(`apps/web/src/features/{academy,tools,certificates,newsletter,algos,
fundakamental,journal,gini,dashboard,...}/`), each internally structured
the same way: `pages/`, `components/`, `lib/api.ts` (the product's
authenticated-request client, always built on the one shared
`authService.makeAuthenticatedRequest` — see ADR 0002), and, where a
product needs richer state, `store/use<Product>PlanStore.ts` (Zustand,
following the same shape across FundaKaMental/Journal/Gini's Pro-plan +
AI-wallet stores) or a scoped `<product>.css` (Tailwind design tokens
wrapped in a `.{product}-scope` class so one product's theme can never
leak into another's page — see FundaKaMental's `fundakamental.css` header
comment, which documents the exact global-leak this scoping avoids).
Product-specific shadcn/ui primitives were never duplicated — all three
integrated products' UIs are built from the one `apps/web/src/components/
ui/` library, ported once in Phase 8e and reused as-is by Journal and
Gini's frontends in Phases 9 and 10.

The backend mirrors this exactly: `services/api/modules/<product>/`, one
`.routes.ts`/`.controller.ts`/`.repository.ts`/`.validator.ts` set per
domain within a product (e.g. `modules/gini/{assets,liabilities,goals,
familyMembers,elderCare,educationPlans,taxOptimization,chat,aiWallet,
proPlan}.*`), every table prefixed to match (`gini_*`), every route
mounted under the product's own path prefix (`/api/gini/...`).

## Consequences

- **Adding a fourth, fifth, sixth product is now a known, repeatable
  shape**, not a fresh design question each time. Phases 9 and 10 (Journal,
  Gini) each started by reading FundaKaMental's `features/fundakamental/`
  and `modules/fundakamental/` as the literal template for file naming,
  API client shape, and directory layout — confirmed explicitly in each
  phase's own planning ("Modeled on
  `apps/web/src/features/journal/store/useJournalPlanStore.ts`...").
- **Large, mechanically-similar-but-content-distinct ports parallelize
  cleanly.** Because each product's pages are self-contained within its
  own `features/<product>/` folder with no cross-product file overlap,
  building e.g. Gini's 13 frontend tabs across three sub-phases (10d/e/f)
  could genuinely run as multiple simultaneous background tasks with zero
  file-collision risk — a structural property of the pattern, not
  something each phase had to re-verify by hand.
- **A real regression class this pattern is specifically designed to
  prevent — and did**: FundaKaMental's original `index.css` had
  unscoped, global base-layer rules (`* { border-border }`, `body {
  bg-background }`, heading font rules) that, ported as-is, would have
  silently restyled every *other* page on the site the moment that file
  was imported. Caught during Phase 8e specifically because the
  `<product>-scope` wrapper convention was already the established rule
  by then, not discovered by accident.
- **The cost:** four products now each carry their own near-duplicate
  `lib/api.ts` authenticated-request boilerplate and near-duplicate
  Pro-plan/AI-wallet Zustand store shape, rather than one shared
  generic client library. This was a deliberate, explicit tradeoff (see
  Phase 2a's own note on why a single shared `lib/api-client.ts` was
  *not* built: "the ~40 call sites have subtly different auth/retry
  conventions per file; forcing them onto one wrapper now risked silently
  changing auth behavior") — some duplication accepted in exchange for
  never risking a shared abstraction silently changing behavior for a
  product its author wasn't looking at.
