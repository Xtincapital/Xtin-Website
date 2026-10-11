// Journal bulk trade-import parser — Node/TS port of
// features-incoming/journal/main.py's `POST /api/v2/import-trades` route
// (main.py lines ~831-865). All the actual parsing logic lives in
// importParsers.ts; this file is just HTTP glue (receive upload, dispatch by
// file_type, return the result), matching this codebase's controller/parser
// separation elsewhere (e.g. fundakamental/analysis.controller.ts +
// fileProcessor.ts).
//
// Stateless "parse for preview" design, exactly like the original: this
// endpoint never writes to `journal_trades` — the frontend previews the
// parsed rows and the user decides which to save via POST /journal/trades
// (Phase 9a), so the shape returned here already matches that endpoint's
// expected body 1:1 (see importParsers.ts's header comment).
import { HTTP_STATUS } from "../../constants/constants.js";
import { parseCsvImport, parseExcelImport, parsePdfImport } from "./importParsers.js";
import { existingTradeKeys, markDuplicates } from "./tradeDuplicates.js";

/* POST /journal/import-trades (multipart/form-data, field "file", field "file_type") */
export const importTrades = async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "No file provided" });
    }
    if (!file.buffer || file.buffer.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Uploaded file is empty" });
    }

    const rawType = String(req.body?.file_type || "").trim().toLowerCase();
    let normalizedType = rawType;

    try {
        let trades;
        const stats = { skipped: 0 };
        if (rawType === "csv") {
            trades = parseCsvImport(file.buffer, stats);
        } else if (rawType === "excel" || rawType === "xls" || rawType === "xlsx") {
            trades = parseExcelImport(file.buffer, stats);
            normalizedType = "excel";
        } else if (rawType === "pdf") {
            trades = await parsePdfImport(file.buffer, stats);
        } else {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Unsupported import type" });
        }

        // Flag rows already in the journal or repeated in the file, so the
        // preview can skip them instead of saving the same trade twice.
        const marked = markDuplicates(trades, await existingTradeKeys(req.user.authId, trades));
        const duplicates = {
            journal: marked.filter((t) => t.duplicate === "journal").length,
            file: marked.filter((t) => t.duplicate === "file").length,
        };

        return res.status(HTTP_STATUS.OK).json({ trades: marked, count: marked.length, skipped: stats.skipped, duplicates, file_type: normalizedType });
    } catch (err) {
        console.error("[Journal] import trades failed:", err);
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: `Could not parse file: ${(err as Error)?.message || err}` });
    }
};
