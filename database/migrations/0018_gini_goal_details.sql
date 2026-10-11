-- ═══════════════════════════════════════════════════════════════════════
-- GINI_GOALS.DETAILS — answers to the category-specific goal questions
-- (Education: course, age, yearly fees; Home: price, down payment; ...).
--
-- current_cost / target_year are still the numbers every goal is planned
-- with; `details` keeps the answers they were worked out from so the form
-- can be reopened with them. Shape: { "mode": "guided" | "manual",
-- "answers": { "<question id>": "<value>" } }. Null for goals saved before
-- this column existed. Safe to run more than once.
-- ═══════════════════════════════════════════════════════════════════════

alter table public.gini_goals add column if not exists details jsonb;
