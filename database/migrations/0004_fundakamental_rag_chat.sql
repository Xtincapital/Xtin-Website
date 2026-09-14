-- ═══════════════════════════════════════════════════════════════════════
-- FundaKaMental document chat (Phase 8c) — real pgvector-backed RAG.
-- ═══════════════════════════════════════════════════════════════════════
--
-- The original Python service's RAG chat was never actually functional in
-- production: its vector store (ChromaDB + sentence-transformers) was
-- commented out of requirements.txt ("chroma-hnswlib needs a C++ compiler
-- ... sentence-transformers pulls a ~2GB torch download"), so every call to
-- POST /message would have hit an ImportError. This migration builds a real
-- replacement on top of the same Supabase project instead of standing up a
-- separate vector DB service: pgvector for storage + similarity search,
-- embeddings generated in the Node backend via a local ONNX model
-- (@huggingface/transformers running the same all-MiniLM-L6-v2 model the
-- Python service specified — 384 dimensions, no external API cost).
--
-- Run AFTER 0000-0003.

create extension if not exists vector;

create table if not exists public.funda_document_chunks (
  id uuid primary key default uuid_generate_v4(),
  source_document_id uuid not null references public.funda_source_documents(id) on delete cascade,
  user_id uuid not null references public.funda_users(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding vector(384),
  created_at timestamptz not null default now(),
  unique (source_document_id, chunk_index)
);

-- HNSW index for fast approximate cosine-similarity search. Chunk volume per
-- document is small (a handful to a few hundred), so this is headroom for
-- scale rather than a day-one necessity, but costs nothing to have.
create index if not exists funda_document_chunks_embedding_idx
  on public.funda_document_chunks
  using hnsw (embedding vector_cosine_ops);

create index if not exists funda_document_chunks_source_document_idx
  on public.funda_document_chunks (source_document_id);

alter table public.funda_document_chunks enable row level security;

-- Read-only for the owning user (matches every other funda_* table's
-- pattern); all writes happen server-side via the service-role client during
-- document upload/processing, so no insert/update/delete policy is needed —
-- RLS with zero write policies denies those to every non-service-role caller.
drop policy if exists "Users can view own document chunks" on public.funda_document_chunks;
create policy "Users can view own document chunks" on public.funda_document_chunks
  for select using (auth.uid() = user_id);

-- Cosine-similarity search RPC — the standard Supabase pattern for pgvector,
-- since supabase-js has no fluent query builder for the `<=>` operator.
-- Called only from the backend's service-role client (not exposed to the
-- anon/authenticated client directly), so no security definer / grants
-- beyond the default are needed.
create or replace function public.funda_match_document_chunks(
  p_source_document_id uuid,
  p_query_embedding vector(384),
  p_match_count integer default 5
)
returns table (
  id uuid,
  chunk_index integer,
  content text,
  similarity float
)
language sql stable
as $$
  select
    funda_document_chunks.id,
    funda_document_chunks.chunk_index,
    funda_document_chunks.content,
    1 - (funda_document_chunks.embedding <=> p_query_embedding) as similarity
  from public.funda_document_chunks
  where funda_document_chunks.source_document_id = p_source_document_id
  order by funda_document_chunks.embedding <=> p_query_embedding
  limit p_match_count;
$$;
