# Architecture Decision Records

Written in Phase 13, after the fact, covering the five foundational
decisions that shaped this migration from the start. Each one traces the
actual consequences observed across the phases that followed, not just the
decision as it looked at the time — see each ADR's "Consequences" section
for the real bugs, tradeoffs, and follow-on work each decision produced.

| ADR | Decision |
|---|---|
| [0001](0001-single-supabase-project.md) | One Supabase project for all four products |
| [0002](0002-supabase-only-auth.md) | Supabase-only auth; retire the backend-minted JWT |
| [0003](0003-workspace-layout.md) | npm workspaces, `apps/web` + `services/api` |
| [0004](0004-features-pattern.md) | One `features/<product>/` folder per product, on both sides |
| [0005](0005-python-to-node-ai.md) | Fold the Python AI service into Express; every product's AI runs in Node |

For the full phase-by-phase history these are distilled from, see
`documents/migration/PLAN.md`'s progress log. For the current database
schema these decisions produced, see `database/SCHEMA.md`.
