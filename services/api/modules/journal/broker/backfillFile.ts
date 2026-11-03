// Reads a broker tradebook or back-office report as history for one linked
// customer. The file is the admin's to supply, so it is checked before anything
// is used: it must be a tradebook, it must be this customer's (back-office
// reports often list many clients), and it must not overlap days the live sync
// already holds.
import { csvRows, excelRows, importHeaderAliases, normalizeImportHeader, parseImportDate, parseImportNumber } from "../importParsers.js";
import { readTradebookFills } from "../fillsImport.js";
import type { BrokerLink, BrokerStore } from "./store.js";
import { istParts } from "./tradeMapper.js";
import type { BrokerFill } from "./types.js";

/** A problem with the file itself, in words fit to show the person who uploaded it. */
export class BackfillFileError extends Error {}

export interface BackfillFile {
    /** The customer's executions in the file that are new to us. */
    fills: BrokerFill[];
    /** Executions in the file for this customer, before anything is left out. */
    executions: number;
    /** Rows that couldn't be read. */
    skippedRows: number;
    /** Rows for other clients in a file that covers several. */
    otherClientRows: number;
    /** Days (YYYY-MM-DD) in the file that the live sync already holds executions for, and so were left alone. */
    leftOutDays: string[];
    from: string | null;
    to: string | null;
}

/** This customer's executions from a tradebook file, with nothing yet left out. */
export interface CustomerFile {
    fills: BrokerFill[];
    /** Rows that couldn't be read. */
    skippedRows: number;
    /** Rows for other clients in a file that covers several. */
    otherClientRows: number;
}

/**
 * Reads a file as one customer's tradebook. Throws BackfillFileError, in words fit to show, if it
 * isn't a tradebook, isn't this customer's, or has nothing readable in it.
 */
export function readCustomerFile(link: BrokerLink, content: Buffer, fileType: "csv" | "excel"): CustomerFile {
    let rows: unknown[][];
    try {
        rows = fileType === "csv" ? csvRows(content) : excelRows(content);
    } catch {
        throw new BackfillFileError("Couldn't read that file. Upload a CSV or Excel file.");
    }

    const read = readTradebookFills(rows, { normalizeImportHeader, importHeaderAliases, parseImportNumber, parseImportDate }, { clientCode: link.client_code, ids: "content" });
    if (!read) {
        throw new BackfillFileError("This doesn't look like a tradebook. It needs columns for the symbol, buy/sell, quantity, price and date, and no exit price or P&L column.");
    }

    // A file that names its clients must include this one; only this client's rows are used.
    const mine = link.client_code.toUpperCase();
    let fills = read.fills;
    let otherClientRows = 0;
    if (read.clientCodes.length) {
        if (!read.clientCodes.includes(mine)) {
            const shown = read.clientCodes.slice(0, 3).join(", ");
            throw new BackfillFileError(`This file has no trades for client ${link.client_code}. It covers ${shown}${read.clientCodes.length > 3 ? " and others" : ""}. Check it is the right customer's file.`);
        }
        fills = read.fills.filter((_, i) => read.clientByFill[i] === mine);
        otherClientRows = read.fills.length - fills.length;
    }
    if (!fills.length) throw new BackfillFileError("No executions could be read from this file.");
    return { fills, skippedRows: read.skipped, otherClientRows };
}

export async function readBackfillFile(store: BrokerStore, link: BrokerLink, content: Buffer, fileType: "csv" | "excel"): Promise<BackfillFile> {
    const { fills, skippedRows, otherClientRows } = readCustomerFile(link, content, fileType);

    // Days the live sync already has are left alone: the file would double-count them if its
    // prices or times were written slightly differently.
    const covered = new Set((await store.loadFills(link)).map((f) => istParts(f.tradedAt).date));
    const dayOf = (f: BrokerFill) => istParts(f.tradedAt).date;
    const leftOutDays = [...new Set(fills.map(dayOf).filter((d) => covered.has(d)))].sort();
    const kept = fills.filter((f) => !covered.has(dayOf(f)));
    const days = kept.map(dayOf).sort();

    return { fills: kept, executions: fills.length, skippedRows, otherClientRows, leftOutDays, from: days[0] ?? null, to: days[days.length - 1] ?? null };
}
