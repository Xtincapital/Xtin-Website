// POST /gini/import-holdings (multipart: "file", "file_type", "kind") —
// stateless parse-for-preview, same design as journal/import.controller.ts:
// nothing is persisted here; the frontend saves the rows it keeps through the
// normal asset/liability create endpoints.
import { HTTP_STATUS } from "../../constants/constants.js";
import { parseGiniImport, type ImportKind } from "./importParsers.js";

export const importHoldings = async (req, res) => {
    const file = req.file;
    if (!file || !file.buffer || file.buffer.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "No file provided" });
    }
    const kind = String(req.body?.kind || "").toLowerCase();
    if (kind !== "assets" && kind !== "liabilities") {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'kind must be "assets" or "liabilities"' });
    }
    const rawType = String(req.body?.file_type || "").trim().toLowerCase();
    const fileType = rawType === "csv" ? "csv" : ["excel", "xls", "xlsx"].includes(rawType) ? "excel" : null;
    if (!fileType) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Unsupported file type — upload a CSV or Excel file" });
    }
    try {
        const rows = parseGiniImport(file.buffer, fileType, kind as ImportKind);
        return res.status(HTTP_STATUS.OK).json({ rows, count: rows.length, kind });
    } catch (err) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: `Could not parse file: ${(err as Error)?.message || err}` });
    }
};
