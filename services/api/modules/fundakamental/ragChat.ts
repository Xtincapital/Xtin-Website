// RAG chat orchestration — Node/TS port of `utils/rag_chat.py`'s
// `RAGChatService`. The prompt-building logic (system prompt, user prompt,
// conversation-history windowing) is ported faithfully — it's well-designed
// in the source. What's NOT a 1:1 port is retrieval and answer generation:
//
//   - Retrieval: the Python source's `self.vector_store.search(...)` call
//     hit ChromaDB (`utils/vector_store.py`), which was never actually wired
//     up in production (see the migration file's header comment). This
//     embeds the query text locally via embeddings.ts (the same
//     all-MiniLM-L6-v2 model the Python source specified for its embedder)
//     and calls the `funda_match_document_chunks` pgvector RPC instead —
//     same "query text -> top-N chunks scoped to a document" call shape as
//     `VectorStoreService.search`.
//   - Generation: the Python source held separate OpenAI/Anthropic client
//     branches (`_generate_answer_openai` / `_generate_answer_anthropic`,
//     picked by a `use_openai` flag). This repo's `generateAIText`
//     (modules/ai/providers.ts) already implements that same
//     Claude-primary/fallback provider selection internally, so both
//     branches collapse into one call — the same pattern aiAnalyzer.ts
//     already uses for report generation.
//
// `RAGChatService.generate_summary` (an optional helper never called from
// `chat.py`) is intentionally NOT ported — out of scope for this slice.
import { generateAIText } from "../ai/providers.js";
import { embedText, toPgVector } from "./embeddings.js";
import supabase from "../../supabase/index.js";

export interface RetrievedChunk {
    id: string;
    chunk_index: number;
    content: string;
    similarity: number;
}

export interface ChatSource {
    document: string;
    page: number;
    excerpt: string;
    similarity_score: number;
}

export interface ConversationTurn {
    role: "user" | "assistant";
    content: string;
}

export interface RagChatResult {
    answer: string;
    sources: ChatSource[];
    confidence: "low" | "medium" | "high";
    chunks_used: number;
}

/** Port of `VectorStoreService.search`'s call shape (query text -> top-N chunks
 * for a given document), retargeted at the `funda_match_document_chunks`
 * pgvector RPC instead of ChromaDB. Returns [] (rather than throwing) on an RPC
 * error, matching the Python source's `search()` swallowing search errors and
 * returning an empty list. */
async function retrieveRelevantChunks(question: string, sourceDocumentId: string, nContextChunks: number): Promise<RetrievedChunk[]> {
    const queryEmbedding = await embedText(question);

    const { data, error } = await supabase.rpc("funda_match_document_chunks", {
        p_source_document_id: sourceDocumentId,
        p_query_embedding: toPgVector(queryEmbedding),
        p_match_count: nContextChunks,
    });

    if (error) {
        console.error("[Fundakamental] chunk retrieval RPC failed:", error.message);
        return [];
    }

    return (data || []) as RetrievedChunk[];
}

/** Port of `_build_context`. */
function buildContext(chunks: RetrievedChunk[]): string {
    return chunks.map((chunk, i) => `[Context ${i + 1}]\n${chunk.content}`).join("\n\n");
}

/** Port of `_create_system_prompt`, verbatim. */
function createSystemPrompt(): string {
    return `You are a financial analysis assistant helping users understand their financial documents.

Your role:
- Answer questions based ONLY on the provided context from the documents
- Be precise and cite specific numbers, metrics, or facts from the context
- If the context doesn't contain enough information, clearly state that
- Explain complex financial concepts in simple terms
- Highlight important insights, trends, or red flags

Guidelines:
- Use a professional but friendly tone
- Structure answers clearly with bullet points when appropriate
- When discussing numbers, always include currency and units
- If comparing values, explain the significance of the comparison
- Never make up information not present in the context`;
}

/** Port of `_create_user_prompt`, verbatim. */
function createUserPrompt(question: string, context: string): string {
    return `Based on the following context from financial documents, please answer the question.

CONTEXT:
${context}

QUESTION:
${question}

Please provide a clear, accurate answer based on the context above. If the context doesn't contain relevant information, say so.`;
}

/** Port of `_format_sources`. Deviation: the Python source hardcoded `excerpt` to
 * the literal string "Relevant excerpt from financial document" — `_format_sources`
 * never actually filled it from the chunk (and its `distance`/`document_id` metadata
 * came from a ChromaDB result shape that was never reachable in production anyway).
 * Since this port has real, working retrieval with real chunk content, `excerpt` is
 * populated with a truncated snippet of the actual retrieved chunk instead — the
 * response shape (document/page/excerpt/similarity_score) is unchanged. */
function formatSources(chunks: RetrievedChunk[]): ChatSource[] {
    return chunks.map((chunk) => ({
        document: "Document",
        page: chunk.chunk_index + 1,
        excerpt: chunk.content.length > 200 ? `${chunk.content.slice(0, 200)}…` : chunk.content,
        similarity_score: chunk.similarity,
    }));
}

/** Port of `RAGChatService.chat`. */
export async function ragChat(
    question: string,
    sourceDocumentId: string,
    conversationHistory: ConversationTurn[],
    nContextChunks = 5,
): Promise<RagChatResult> {
    const relevantChunks = await retrieveRelevantChunks(question, sourceDocumentId, nContextChunks);

    if (relevantChunks.length === 0) {
        return {
            answer: "I don't have enough information to answer this question. Please make sure a document has been uploaded and processed.",
            sources: [],
            confidence: "low",
            chunks_used: 0,
        };
    }

    const contextText = buildContext(relevantChunks);
    const systemPrompt = createSystemPrompt();
    const userPrompt = createUserPrompt(question, contextText);

    // Last 3 exchanges (6 messages) of conversation history for continuity,
    // matching the Python source's `conversation_history[-6:]` (used
    // identically in both its OpenAI and Anthropic branches).
    const historyMessages = conversationHistory.slice(-6);

    let answer: string;
    try {
        answer = await generateAIText({
            messages: [{ role: "system", content: systemPrompt }, ...historyMessages, { role: "user", content: userPrompt }],
            maxTokens: 1000,
            temperature: 0.3,
        });
    } catch (err) {
        // Matches the Python source's per-provider try/except returning an
        // inline error string as the "answer" rather than throwing.
        answer = `Error generating response: ${(err as Error)?.message || err}`;
    }

    return {
        answer,
        sources: formatSources(relevantChunks),
        confidence: relevantChunks.length >= 3 ? "high" : "medium",
        chunks_used: relevantChunks.length,
    };
}
