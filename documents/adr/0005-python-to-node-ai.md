# ADR 0005 — fold the Python AI service into Express; every product's AI
runs in Node

**Status:** Accepted (Phase 7, 2026-09-14; the resulting pattern was then
reused for every AI feature added in Phases 8-10)

## Context

The core platform's AI chat/compliance system lived in a separate Python
service (`services/ai-legacy/`), talked to over HTTP from the Express
backend, and had its own deploy target. It handled prompt building, a
query-intent classifier, and a compliance engine (SEBI-style disclaimer
injection, prohibited-phrase redaction on the model's actual output —
not just prompt-time instruction). Meanwhile FundaKaMental, Journal, and
Gini each arrived with their *own* separate AI implementations: Journal's
had genuine real-token-usage metering; Gini's `gini-ai-engine.js` was a
sophisticated client-side profile/insight engine calling an
unauthenticated, ungated Vercel proxy function; FundaKaMental's RAG
document-chat depended on ChromaDB + sentence-transformers, which were
never actually installed in its own `requirements.txt` (commented out —
"pulls a ~2GB torch download") and had never worked in production even
before the migration.

Running a second language runtime (Python) purely for one product's chat
feature, while three other products each reinvented AI-calling from
scratch, was the state before this decision.

## Decision

All AI logic runs in Node, inside `services/api/modules/ai/` (shared
provider/prompt-building code) plus each product's own
`modules/<product>/chat.controller.ts` (or equivalent) where a product's
prompt/context logic is genuinely product-specific. `services/ai-legacy/`
was deleted outright, not kept as a fallback. The Python compliance
engine's two distinct halves were both ported, not merged into "instruct
the model and hope": `promptBuilder.ts` (steering generation) and, found
to be missing on first pass and then ported specifically,
`compliance.ts` (scanning the model's *actual reply* for prohibited
phrases and force-injecting disclaimers regardless of what the model
wrote — the real enforcement layer, not just a prompt-time suggestion).

Every AI feature added afterward followed the same rule — build a real,
working Node implementation rather than faithfully port a broken one:

- FundaKaMental's RAG chat: the original's ChromaDB path had never
  actually run. Replaced with pgvector in the same Supabase project (see
  ADR 0001) plus `@huggingface/transformers` running
  `Xenova/all-MiniLM-L6-v2` locally via ONNX — the JS-runnable equivalent
  of the same embedding model the Python source intended to use, smoke-
  tested working before the port was considered done.
- Gini's chat: the original's `api/chat.js` was a stateless, completely
  unauthenticated Claude proxy — no auth check, no user id, no
  server-side token accounting at all, `maxOutputTokens` clamped
  client-side only. Rebuilt as a real, `authenticate`-gated endpoint that
  checks a real wallet balance before calling Claude and deducts real
  Anthropic-reported usage after, rather than reproducing the original's
  complete lack of gating.
- Journal's real-token-usage metering (`generateAIWithUsage`, returning
  Claude's actual `usage.inputTokens`/`outputTokens` from its own API
  response) was built once in Phase 9b and then reused as-is by Gini's
  chat in Phase 10b, rather than each product writing its own Claude
  client.

## Consequences

- **One Anthropic integration point** (`modules/ai/providers.ts`), reused
  by every product's chat/report/coach feature — `generateAIText` (the
  original FundaKaMental-era helper, Claude primary with an OpenAI
  fallback) and `generateAIWithUsage` (added in Phase 9b specifically for
  wallet-metered products, real usage numbers, no fallback provider) cover
  every AI call site in the app. No product wrote its own `fetch(
  ANTHROPIC_API_URL, ...)` from scratch — the one exception,
  `services/api/utils/newsletterGeneratorSimple.ts`, does its own raw
  fetch for historical reasons predating this consolidation and was
  flagged, not silently normalized, during Phase 13's test-writing pass.
- **A real, live security gap was closed, not carried forward**, by
  refusing to treat "the original implementation" as the spec when the
  original was actually broken (Gini's ungated proxy, FundaKaMental's
  non-functional RAG). This is the same judgment principle later applied
  in Phase 13 itself when auditing Razorpay signature verification — port
  behavior faithfully when it's correct, replace it when tracing the
  actual code shows it never worked or was never safe.
- **No second runtime to deploy, patch, or keep dependency-compatible.**
  `services/api`'s own `render.yaml` is the only backend deploy target
  concerned with AI code — there's no separate Python service's
  `requirements.txt`, no separate cold-start, no separate set of secrets
  to rotate for a service that used to exist alongside the Node one.
- **The tradeoff:** any future AI feature that genuinely needs a
  Python-only library (a specific ML framework with no JS equivalent)
  has no existing Python runtime to slot into anymore — it would need its
  own new service, deliberately reintroducing the cross-runtime
  complexity this decision removed. Accepted as the right tradeoff given
  every AI feature actually built across Phases 7-10 turned out to have a
  workable, often better, pure-Node path once traced through properly.
