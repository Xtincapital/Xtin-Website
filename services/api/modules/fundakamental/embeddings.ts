// Local embedding generation — Node/TS equivalent of the Python source's
// `sentence-transformers` `all-MiniLM-L6-v2` model use in
// `utils/vector_store.py` (`VectorStoreService.embed_text`, backed by
// `SentenceTransformer(...).encode(...)`).
//
// The Python source's vector store (ChromaDB + sentence-transformers) was
// never actually wired up in production — sentence-transformers pulls a
// ~2GB torch download and chromadb needs a C++ compiler that wasn't
// available even in the original dev environment (see the migration file's
// header comment for the full story). This uses `@huggingface/transformers`
// instead, running the same `all-MiniLM-L6-v2` model locally via ONNX — no
// external API cost, no native build step — and it produces the same
// 384-dimensional vectors the `funda_document_chunks.embedding vector(384)`
// column expects.
//
// The pipeline is loaded once (module-level lazy singleton) since
// instantiating it is slow (seconds, to initialize the ONNX session) but the
// loaded pipeline itself is cheap and safe to reuse across requests.
import { pipeline } from "@huggingface/transformers";

const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";
export const EMBEDDING_DIMENSIONS = 384;

async function loadExtractor() {
    return pipeline("feature-extraction", MODEL_NAME);
}

let extractorPromise: ReturnType<typeof loadExtractor> | null = null;

function getExtractor() {
    if (!extractorPromise) {
        extractorPromise = loadExtractor();
    }
    return extractorPromise;
}

/** Embeds many texts in a single batched forward pass — meaningfully faster than
 * calling `embedText` once per chunk when embedding a whole document's worth of
 * chunks. Returns one 384-length vector per input text, in the same order. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    const extractor = await getExtractor();
    const output = await extractor(texts, { pooling: "mean", normalize: true });
    return output.tolist() as number[][];
}

/** Embeds a single text (e.g. a chat question at query time). */
export async function embedText(text: string): Promise<number[]> {
    const [vector] = await embedTexts([text]);
    return vector;
}

/** Formats an embedding vector as the bracketed string pgvector/PostgREST expects —
 * supabase-js has no native vector type, so this is the wire format for both
 * inserting into `funda_document_chunks.embedding` and the
 * `funda_match_document_chunks` RPC's `p_query_embedding` parameter. */
export function toPgVector(embedding: number[]): string {
    return `[${embedding.join(",")}]`;
}
