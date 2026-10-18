// Keyword (BM25-style) retrieval for document chat. Chat used to embed the
// document and question with a local ONNX model; loading it OOM-killed the
// small production instance (silent restart → "Failed to fetch"). This needs
// no model: the document is chunked in memory (cached per document) and the
// chunks that best match the question's words are returned.
import { getSourceDocumentById, downloadDocumentFromStorage } from "./analysis.repository.js";
import { processFile } from "./fileProcessor.js";
import { chunkText } from "./chunking.js";

export interface RankedChunk {
    id: string;
    chunk_index: number;
    content: string;
    similarity: number;
}

const STOPWORDS = new Set(
    "a an and are as at be by for from has have how in is it its of on or that the this to was what when where which who why will with does did do about into than then there their they them these those you your can could would should".split(
        " ",
    ),
);
const CACHE_MAX = 5;
const cache = new Map<string, string[]>(); // documentId -> chunk texts (insertion-ordered LRU)

const tokenize = (text: string) => (text.toLowerCase().match(/[a-z0-9$%.]+/g) || []).map((t) => t.replace(/^\.+|\.+$/g, "")).filter((t) => t.length > 1 && !STOPWORDS.has(t));

async function loadChunks(documentId: string, userId: string): Promise<string[]> {
    const hit = cache.get(documentId);
    if (hit) {
        cache.delete(documentId);
        cache.set(documentId, hit);
        return hit;
    }
    const { data: doc } = await getSourceDocumentById(documentId, userId);
    if (!doc) return [];
    const { data: blob, error } = await downloadDocumentFromStorage(doc.storage_path);
    if (error || !blob) return [];
    const processed = await processFile(Buffer.from(await blob.arrayBuffer()), doc.file_name);
    if (!processed.success) return [];
    const chunks = chunkText(processed.extracted_text).map((c) => c.text);
    cache.set(documentId, chunks);
    if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value as string);
    return chunks;
}

/** Top-N chunks of a document for a question, best match first. */
export async function retrieveChunks(question: string, documentId: string, userId: string, n: number): Promise<RankedChunk[]> {
    const chunks = await loadChunks(documentId, userId);
    if (chunks.length === 0) return [];

    const terms = [...new Set(tokenize(question))];
    const docs = chunks.map((text) => {
        const tf = new Map<string, number>();
        for (const t of tokenize(text)) tf.set(t, (tf.get(t) || 0) + 1);
        return tf;
    });
    const idf = new Map<string, number>();
    for (const term of terms) {
        const df = docs.filter((tf) => tf.has(term)).length;
        idf.set(term, Math.log(1 + (chunks.length - df + 0.5) / (df + 0.5)));
    }

    const scored = chunks.map((content, i) => {
        let score = 0;
        for (const term of terms) {
            const f = docs[i].get(term);
            if (f) score += (idf.get(term) || 0) * (1 + Math.log(f));
        }
        return { id: `${documentId}:${i}`, chunk_index: i, content, score };
    });

    let top = scored.filter((c) => c.score > 0).sort((a, b) => b.score - a.score).slice(0, n);
    // No keyword overlap (e.g. "summarise this"): fall back to the document's opening.
    if (top.length === 0) top = scored.slice(0, n);
    const max = Math.max(...top.map((c) => c.score), 1e-9);
    return top.map((c) => ({ id: c.id, chunk_index: c.chunk_index, content: c.content, similarity: c.score > 0 ? c.score / max : 0 }));
}
