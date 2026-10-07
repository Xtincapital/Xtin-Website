-- ═══════════════════════════════════════════════════════════════════════
-- AI CHAT HISTORY — saved conversations for Gini and the Journal AI coach.
--
-- A Pro perk: services/api/modules/ai/chatHistory.ts saves each exchange
-- (question + reply) only while the user has a valid Gini / Journal Pro plan,
-- and lists them only to Pro users. Conversations are kept when Pro lapses
-- and come back on renewal. Deleting a conversation deletes its messages.
--
-- user_id is the Supabase auth id (req.user.authId), like every other
-- gini_* / journal_* table.
-- Written and read only by the backend (service role); RLS has no client policies.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  app text not null check (app in ('gini', 'journal')),
  title text not null,                     -- the first question, trimmed
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_conversations_user_idx on public.ai_conversations (user_id, app, updated_at desc);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_messages_conversation_idx on public.ai_messages (conversation_id, created_at);

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
