// Lazy chunk + embed for document chat. Embedding loads a local ONNX model and
// pushes the whole document through it — too heavy for the small production
// instance to do during upload/report (it was OOM-killed mid-analysis), so it
// now happens the first time someone chats with a document.
import supabase from "../../supabase/index.js";
import { getSourceDocumentById, downloadDocumentFromStorage } from "./analysis.repository.js";
import { processFile } from "./fileProcessor.js";
import { chunkText } from "./chunking.js";
import { embedTexts, toPgVector } from "./embeddings.js";
import { insertDocumentChunks } from "./chat.repository.js";

const EMBED_BATCH_SIZE = 16;
const inFlight = new Map<string, Promise<void>>();

async function build(documentId: string, userId: string): Promise<void> {
    const { count, error } = await supabase
        .from("funda_document_chunks")
        .select("id", { count: "exact", head: true })
        .eq("source_document_id", documentId);
    if (error || (count ?? 0) > 0) return;

    const { data: doc } = await getSourceDocumentById(documentId, userId);
    if (!doc) return;
    const { data: blob, error: downloadError } = await downloadDocumentFromStorage(doc.storage_path);
    if (downloadError || !blob) return;
    const processed = await processFile(Buffer.from(await blob.arrayBuffer()), doc.file_name);
    if (!processed.success) return;

    const chunks = chunkText(processed.extracted_text);
    for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
        const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
        const embeddings = await embedTexts(batch.map((chunk) => chunk.text));
        const { error: insertError } = await insertDocumentChunks(
            batch.map((chunk, j) => ({
                source_document_id: documentId,
                user_id: userId,
                chunk_index: chunk.chunk_id,
                content: chunk.text,
                embedding: toPgVector(embeddings[j]),
            })),
        );
        if (insertError) throw insertError;
    }
}

/** Makes sure a document has chunks for chat; best-effort, never throws. */
export function ensureDocumentChunks(documentId: string, userId: string): Promise<void> {
    let p = inFlight.get(documentId);
    if (!p) {
        p = build(documentId, userId)
            .catch((err) => console.error("[Fundakamental] lazy chunk/embed failed:", err))
            .finally(() => inFlight.delete(documentId));
        inFlight.set(documentId, p);
    }
    return p;
}
