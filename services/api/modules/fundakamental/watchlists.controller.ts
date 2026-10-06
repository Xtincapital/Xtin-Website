// Watchlist Manager API — Node/TS port of `api/endpoints/watchlists.py`.
//
// Auth: `req.user.authId` (populated by `authenticate`) is the FundaKaMental
// user id for every query here — it equals `auth.users.id`, which is what
// `funda_watchlists.user_id` / `funda_watchlist_items` (via watchlist_id)
// reference. Table names use the `funda_` prefix (see watchlists.repository.ts
// header comment for the exact v2-vs-legacy mapping).
//
// Live prices: the Python source's `market_data.get_market_data`/
// `get_stock_price` wrappers around `yfinance` are replaced with `getQuote`
// from `./stockDataService.js` (already ported, backed by `yahoo-finance2`).
import { HTTP_STATUS } from "../../constants/constants.js";
import { getQuote } from "./stockDataService.js";
import { findDirectoryEntry } from "./companyDirectory.js";
import {
    validateWatchlistCreate,
    validateWatchlistUpdate,
    validateWatchlistItemCreate,
    validateWatchlistItemUpdate,
    validateBulkTickers,
} from "./watchlists.validator.js";
import {
    getMaxSortOrder,
    insertWatchlist,
    getWatchlistSummaries,
    getWatchlistSummaryById,
    getWatchlistOwnership,
    getWatchlistById,
    getWatchlistDefaultFlag,
    updateWatchlist as updateWatchlistRepo,
    deleteWatchlist as deleteWatchlistRepo,
    getWatchlistItemCount,
    insertWatchlistItem,
    getWatchlistItems as getWatchlistItemsRepo,
    getWatchlistItemById,
    updateWatchlistItem as updateWatchlistItemRepo,
    getWatchlistItemForDelete,
    deleteWatchlistItem,
    bulkInsertWatchlistItems,
    bulkDeleteWatchlistItems,
    upsertWatchlistSnapshot,
    getWatchlistSnapshots as getWatchlistSnapshotsRepo,
    findExactPriceAlert,
    insertPriceAlert,
    deleteExactPriceAlert,
} from "./watchlists.repository.js";
import {
    calculateSummary,
    getTargetAlerts,
    getPerformanceByTag,
    getTopMovers,
    calculateHypotheticalValue,
    createSnapshot,
    type WatchlistPriceMap,
    type WatchlistItemRow,
} from "./watchlistAnalytics.js";

/** Fetch live quotes for a set of tickers and shape them like the Python source's `get_market_data` map. */
async function buildPriceMap(tickers: string[]): Promise<WatchlistPriceMap> {
    const unique = Array.from(new Set(tickers.map((t) => t.toUpperCase())));
    const map: WatchlistPriceMap = {};
    await Promise.all(
        unique.map(async (ticker) => {
            try {
                const quote = await getQuote(ticker);
                if (quote) {
                    map[ticker] = {
                        price: quote.price ?? 0,
                        change: quote.change ?? 0,
                        change_pct: quote.change_percent ?? 0,
                    };
                }
            } catch (err) {
                console.error(`[Fundakamental] quote lookup failed for ${ticker}:`, err);
            }
        }),
    );
    return map;
}

function alertConditionForTargetType(targetType: string, targetPrice?: number, currentPrice?: number | null): "above" | "below" {
    // BUY: alert when price goes BELOW target (buying opportunity).
    // SELL: alert when price goes ABOVE target (selling opportunity).
    // ALERT: when the price reaches the target from wherever it is now
    // (a fixed "below" fired at once for any target above today's price).
    if (targetType === "SELL") return "above";
    if (targetType === "ALERT" && currentPrice && targetPrice && targetPrice > currentPrice) return "above";
    return "below";
}

/** Port of `_create_alert_for_target`. Never throws — mirrors the Python source's swallow-and-log behavior. */
async function createAlertForTarget(userId: string, ticker: string, targetPrice: number, targetType: string, currentPrice?: number | null): Promise<void> {
    try {
        const condition = alertConditionForTargetType(targetType, targetPrice, currentPrice ?? (await getQuote(ticker).catch(() => null))?.price);
        const { data: existing } = await findExactPriceAlert(userId, ticker, targetPrice, condition);
        if (!existing || existing.length === 0) {
            await insertPriceAlert({ user_id: userId, ticker, condition, target_price: targetPrice, is_active: true });
        }
    } catch (err) {
        console.warn(`[Fundakamental] Failed to create alert for ${ticker}:`, err);
    }
}

/** Port of `_remove_alert_for_ticker`. */
async function removeAlertForTicker(userId: string, ticker: string, targetPrice: number, targetType: string): Promise<void> {
    try {
        // An ALERT target can point either way, so clear both directions.
        const conditions = targetType === "ALERT" ? (["above", "below"] as const) : [alertConditionForTargetType(targetType)];
        for (const condition of conditions) await deleteExactPriceAlert(userId, ticker, targetPrice, condition);
    } catch (err) {
        console.warn(`[Fundakamental] Failed to remove alert for ${ticker}:`, err);
    }
}

/* ========================================================================
 * WATCHLIST CRUD
 * ==================================================================== */

/* POST /api/fundakamental/watchlists */
export const createWatchlist = async (req, res) => {
    const validation = validateWatchlistCreate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { name, description, color, is_default } = validation.data;
    const userId = req.user.authId;

    try {
        const { data: maxSortRows } = await getMaxSortOrder(userId);
        const maxSort = maxSortRows && maxSortRows.length > 0 ? maxSortRows[0].sort_order : 0;

        const { data, error } = await insertWatchlist({
            user_id: userId,
            name,
            description: description ?? null,
            color: color || "#3b82f6",
            is_default: is_default ?? false,
            sort_order: maxSort + 1,
        });

        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Failed to create watchlist" });
        }

        return res.status(HTTP_STATUS.CREATED).json({ ...data[0], item_count: 0 });
    } catch (err) {
        const message = (err as Error)?.message || String(err);
        if (message.includes("unique_funda_watchlist_name_per_user")) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Watchlist with this name already exists" });
        }
        console.error("[Fundakamental] create watchlist failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error creating watchlist: ${message}` });
    }
};

/* GET /api/fundakamental/watchlists */
export const getWatchlists = async (req, res) => {
    try {
        const { data, error } = await getWatchlistSummaries(req.user.authId);
        if (error) throw error;
        return res.status(HTTP_STATUS.OK).json(data || []);
    } catch (err) {
        console.error("[Fundakamental] fetch watchlists failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching watchlists: ${(err as Error)?.message || err}` });
    }
};

/* GET /api/fundakamental/watchlists/:watchlistId */
export const getWatchlist = async (req, res) => {
    const { watchlistId } = req.params;
    try {
        const { data, error } = await getWatchlistSummaryById(watchlistId, req.user.authId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Watchlist not found" });
        }
        return res.status(HTTP_STATUS.OK).json(data[0]);
    } catch (err) {
        console.error("[Fundakamental] fetch watchlist failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching watchlist: ${(err as Error)?.message || err}` });
    }
};

/* PATCH /api/fundakamental/watchlists/:watchlistId */
export const updateWatchlist = async (req, res) => {
    const { watchlistId } = req.params;
    const validation = validateWatchlistUpdate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { name, description, color, is_default, sort_order } = validation.data;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (is_default !== undefined) updateData.is_default = is_default;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    if (Object.keys(updateData).length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "No fields to update" });
    }

    try {
        const { data, error } = await updateWatchlistRepo(watchlistId, req.user.authId, updateData);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Watchlist not found" });
        }

        const { count } = await getWatchlistItemCount(watchlistId);
        return res.status(HTTP_STATUS.OK).json({ ...data[0], item_count: count || 0 });
    } catch (err) {
        console.error("[Fundakamental] update watchlist failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error updating watchlist: ${(err as Error)?.message || err}` });
    }
};

/* DELETE /api/fundakamental/watchlists/:watchlistId */
export const deleteWatchlist = async (req, res) => {
    const { watchlistId } = req.params;
    const userId = req.user.authId;
    try {
        const { data: flagRows, error: flagError } = await getWatchlistDefaultFlag(watchlistId, userId);
        if (flagError) throw flagError;
        if (!flagRows || flagRows.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Watchlist not found" });
        }
        if (flagRows[0].is_default) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Cannot delete default watchlist" });
        }

        // Items cascade with the watchlist; their price-target alerts don't.
        const { data: itemRows } = await getWatchlistItemsRepo(watchlistId);

        const { data, error } = await deleteWatchlistRepo(watchlistId, userId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Watchlist not found" });
        }

        for (const item of itemRows || []) {
            if (item.target_price) {
                await removeAlertForTicker(userId, item.ticker, Number(item.target_price), item.target_price_type || "ALERT");
            }
        }

        return res.status(HTTP_STATUS.OK).json({ success: true, message: "Watchlist deleted successfully" });
    } catch (err) {
        console.error("[Fundakamental] delete watchlist failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error deleting watchlist: ${(err as Error)?.message || err}` });
    }
};

/* ========================================================================
 * WATCHLIST ITEMS
 * ==================================================================== */

/* POST /api/fundakamental/watchlists/:watchlistId/items */
export const addItemToWatchlist = async (req, res) => {
    const { watchlistId } = req.params;
    const userId = req.user.authId;

    const validation = validateWatchlistItemCreate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { ticker, company_name, target_price, target_price_type, notes, tags } = validation.data;

    try {
        const { data: ownership, error: ownershipError } = await getWatchlistOwnership(watchlistId, userId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Watchlist not found" });
        }

        const tickerUpper = ticker.toUpperCase();
        const quote = await getQuote(tickerUpper).catch(() => null);
        const addedPrice = quote?.price ?? null;
        const listed = findDirectoryEntry(tickerUpper);
        // No live price and not a known NSE/US listing: almost always a typo
        // (e.g. "RELIANCE" without ".NS"), which would sit there with no price.
        if (!quote && !listed) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                error: `We couldn't find "${tickerUpper}". Use the exchange ticker — Indian stocks end in .NS (e.g. RELIANCE.NS), US stocks as-is (e.g. AAPL).`,
            });
        }

        const { data, error } = await insertWatchlistItem({
            watchlist_id: watchlistId,
            ticker: tickerUpper,
            company_name: company_name ?? listed?.name ?? null,
            added_price: addedPrice,
            target_price: target_price ?? null,
            target_price_type: target_price_type ?? null,
            notes: notes ?? null,
            tags: tags || [],
        });

        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Failed to add item" });
        }

        if (target_price && target_price_type) {
            await createAlertForTarget(userId, tickerUpper, target_price, target_price_type, addedPrice);
        }

        return res.status(HTTP_STATUS.CREATED).json(data[0]);
    } catch (err) {
        const message = (err as Error)?.message || String(err);
        if (message.includes("unique_funda_item_per_watchlist")) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Stock already in watchlist" });
        }
        console.error("[Fundakamental] add watchlist item failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error adding item: ${message}` });
    }
};

/* GET /api/fundakamental/watchlists/:watchlistId/items?include_prices= */
export const getWatchlistItems = async (req, res) => {
    const { watchlistId } = req.params;
    const includePrices = req.query.include_prices !== "false";

    try {
        const { data: ownership, error: ownershipError } = await getWatchlistOwnership(watchlistId, req.user.authId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Watchlist not found" });
        }

        const { data, error } = await getWatchlistItemsRepo(watchlistId);
        if (error) throw error;
        const items: WatchlistItemRow[] = data || [];

        if (includePrices && items.length > 0) {
            const prices = await buildPriceMap(items.map((i) => i.ticker));
            for (const item of items) {
                // Always send these fields (null when there's no quote) so
                // clients can tell "no price" apart from a missing field.
                item.current_price = null;
                item.change = null;
                item.change_pct = null;
                item.target_distance = null;
                item.target_distance_pct = null;

                const priceInfo = prices[item.ticker];
                if (priceInfo) {
                    const currentPrice = priceInfo.price || 0;
                    item.current_price = currentPrice;
                    item.change = priceInfo.change || 0;
                    item.change_pct = priceInfo.change_pct || 0;

                    if (item.target_price && currentPrice > 0) {
                        const target = Number(item.target_price);
                        item.target_distance = target - currentPrice;
                        item.target_distance_pct = ((target - currentPrice) / currentPrice) * 100;
                    }
                }
            }
        }

        return res.status(HTTP_STATUS.OK).json(items);
    } catch (err) {
        console.error("[Fundakamental] fetch watchlist items failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching items: ${(err as Error)?.message || err}` });
    }
};

/* GET /api/fundakamental/watchlists/:watchlistId/items/:itemId */
export const getWatchlistItem = async (req, res) => {
    const { watchlistId, itemId } = req.params;

    try {
        const { data: ownership, error: ownershipError } = await getWatchlistOwnership(watchlistId, req.user.authId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Watchlist not found" });
        }

        const { data, error } = await getWatchlistItemById(watchlistId, itemId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Item not found" });
        }

        const item: WatchlistItemRow = data[0];
        const quote = await getQuote(item.ticker).catch(() => null);
        if (quote) {
            const currentPrice = quote.price || 0;
            item.current_price = currentPrice;
            item.change = quote.change || 0;
            item.change_pct = quote.change_percent || 0;

            if (item.target_price && currentPrice > 0) {
                const target = Number(item.target_price);
                item.target_distance = target - currentPrice;
                item.target_distance_pct = ((target - currentPrice) / currentPrice) * 100;
            }
        }

        return res.status(HTTP_STATUS.OK).json(item);
    } catch (err) {
        console.error("[Fundakamental] fetch watchlist item failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching item: ${(err as Error)?.message || err}` });
    }
};

/* PATCH /api/fundakamental/watchlists/:watchlistId/items/:itemId */
export const updateWatchlistItem = async (req, res) => {
    const { watchlistId, itemId } = req.params;
    const userId = req.user.authId;

    const validation = validateWatchlistItemUpdate(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { target_price, target_price_type, notes, tags } = validation.data;

    try {
        const { data: ownership, error: ownershipError } = await getWatchlistOwnership(watchlistId, userId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Watchlist not found" });
        }

        const { data: before } = await getWatchlistItemById(watchlistId, itemId);
        const previous = before && before.length > 0 ? before[0] : null;

        const updateData: Record<string, unknown> = {};
        if (target_price !== undefined) updateData.target_price = target_price;
        if (target_price_type !== undefined) updateData.target_price_type = target_price_type;
        if (notes !== undefined) updateData.notes = notes;
        if (tags !== undefined) updateData.tags = tags;

        if (Object.keys(updateData).length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "No fields to update" });
        }

        const { data, error } = await updateWatchlistItemRepo(watchlistId, itemId, updateData);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Item not found" });
        }

        const itemData = data[0];
        // Replace the old target's alert (also when the target was cleared).
        const targetChanged =
            previous?.target_price &&
            target_price !== undefined &&
            (Number(previous.target_price) !== Number(target_price) || (target_price_type !== undefined && previous.target_price_type !== target_price_type));
        if (targetChanged) {
            await removeAlertForTicker(userId, itemData.ticker, Number(previous.target_price), previous.target_price_type || "ALERT");
        }
        if (target_price !== undefined && target_price !== null && target_price_type !== undefined && target_price_type !== null) {
            if (targetChanged || !previous?.target_price) await createAlertForTarget(userId, itemData.ticker, target_price, target_price_type);
        }

        return res.status(HTTP_STATUS.OK).json(itemData);
    } catch (err) {
        console.error("[Fundakamental] update watchlist item failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error updating item: ${(err as Error)?.message || err}` });
    }
};

/* DELETE /api/fundakamental/watchlists/:watchlistId/items/:itemId?remove_alert= */
export const removeItemFromWatchlist = async (req, res) => {
    const { watchlistId, itemId } = req.params;
    const userId = req.user.authId;
    const removeAlert = req.query.remove_alert !== "false";

    try {
        const { data: ownership, error: ownershipError } = await getWatchlistOwnership(watchlistId, userId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Watchlist not found" });
        }

        const { data: itemRows, error: itemError } = await getWatchlistItemForDelete(watchlistId, itemId);
        if (itemError) throw itemError;
        if (!itemRows || itemRows.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Item not found" });
        }
        const itemData = itemRows[0];

        const { data, error } = await deleteWatchlistItem(watchlistId, itemId);
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Item not found" });
        }

        if (removeAlert && itemData.target_price) {
            await removeAlertForTicker(userId, itemData.ticker, Number(itemData.target_price), itemData.target_price_type || "ALERT");
        }

        return res.status(HTTP_STATUS.OK).json({ success: true, message: "Item removed successfully" });
    } catch (err) {
        console.error("[Fundakamental] remove watchlist item failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error removing item: ${(err as Error)?.message || err}` });
    }
};

/* ========================================================================
 * BULK OPERATIONS
 * ==================================================================== */

/* POST /api/fundakamental/watchlists/:watchlistId/items/bulk  body: { tickers: string[] } */
export const addItemsBulk = async (req, res) => {
    const { watchlistId } = req.params;
    const validation = validateBulkTickers(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { tickers } = validation.data;

    try {
        const { data: ownership, error: ownershipError } = await getWatchlistOwnership(watchlistId, req.user.authId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Watchlist not found" });
        }

        // Note: unlike the Python source's `get_market_data`, `getQuote` has
        // no company-name field, so bulk-added items get `company_name: null`
        // here (a fuller lookup would need `getCompanyOverview` per ticker).
        const prices = await buildPriceMap(tickers);

        const itemsToInsert = tickers.map((ticker) => {
            const tickerUpper = ticker.toUpperCase();
            const priceInfo = prices[tickerUpper];
            return {
                watchlist_id: watchlistId,
                ticker: tickerUpper,
                company_name: null,
                added_price: priceInfo ? priceInfo.price : null,
                tags: [],
            };
        });

        if (itemsToInsert.length === 0) {
            return res.status(HTTP_STATUS.OK).json({ success: true, added: 0, total: 0 });
        }

        const { data, error } = await bulkInsertWatchlistItems(itemsToInsert);
        if (error) throw error;

        return res.status(HTTP_STATUS.OK).json({ success: true, added: data ? data.length : 0, total: tickers.length });
    } catch (err) {
        console.error("[Fundakamental] bulk add watchlist items failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error adding items: ${(err as Error)?.message || err}` });
    }
};

/* DELETE /api/fundakamental/watchlists/:watchlistId/items  body: { tickers: string[] } */
export const removeItemsBulk = async (req, res) => {
    const { watchlistId } = req.params;
    const validation = validateBulkTickers(req.body);
    if (validation.errors) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: validation.message, details: validation.errors });
    }
    const { tickers } = validation.data;

    try {
        const { data: ownership, error: ownershipError } = await getWatchlistOwnership(watchlistId, req.user.authId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Watchlist not found" });
        }

        const tickersUpper = tickers.map((t) => t.toUpperCase());
        const { data, error } = await bulkDeleteWatchlistItems(watchlistId, tickersUpper);
        if (error) throw error;

        return res.status(HTTP_STATUS.OK).json({ success: true, removed: data ? data.length : 0 });
    } catch (err) {
        console.error("[Fundakamental] bulk remove watchlist items failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error removing items: ${(err as Error)?.message || err}` });
    }
};

/* ========================================================================
 * ANALYTICS
 * ==================================================================== */

/* GET /api/fundakamental/watchlists/:watchlistId/summary */
export const getWatchlistSummary = async (req, res) => {
    const { watchlistId } = req.params;

    try {
        const { data: watchlistRows, error: watchlistError } = await getWatchlistById(watchlistId, req.user.authId);
        if (watchlistError) throw watchlistError;
        if (!watchlistRows || watchlistRows.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Watchlist not found" });
        }
        const watchlist = watchlistRows[0];

        const { data: itemsData, error: itemsError } = await getWatchlistItemsRepo(watchlistId);
        if (itemsError) throw itemsError;
        const items: WatchlistItemRow[] = itemsData || [];

        if (items.length === 0) {
            return res.status(HTTP_STATUS.OK).json({
                watchlist,
                summary: { total_items: 0, tracked_value: 0.0, avg_change_pct: 0.0 },
                target_alerts: [],
                top_movers: { gainers: [], losers: [] },
            });
        }

        const prices = await buildPriceMap(items.map((i) => i.ticker));

        const summary = calculateSummary(items, prices);
        const targetAlerts = getTargetAlerts(items, prices);
        const topMovers = getTopMovers(items, prices, 5);
        const tagPerformance = getPerformanceByTag(items, prices);
        const hypothetical = calculateHypotheticalValue(items, prices);

        return res.status(HTTP_STATUS.OK).json({
            watchlist,
            summary,
            target_alerts: targetAlerts,
            top_movers: topMovers,
            tag_performance: tagPerformance,
            hypothetical_investment: hypothetical,
        });
    } catch (err) {
        console.error("[Fundakamental] watchlist summary failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching summary: ${(err as Error)?.message || err}` });
    }
};

/* POST /api/fundakamental/watchlists/:watchlistId/snapshot */
export const createWatchlistSnapshot = async (req, res) => {
    const { watchlistId } = req.params;

    try {
        const { data: ownership, error: ownershipError } = await getWatchlistOwnership(watchlistId, req.user.authId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Watchlist not found" });
        }

        const { data: itemsData, error: itemsError } = await getWatchlistItemsRepo(watchlistId);
        if (itemsError) throw itemsError;
        const items: WatchlistItemRow[] = itemsData || [];

        if (items.length === 0) {
            return res.status(HTTP_STATUS.OK).json({ success: false, message: "No items to snapshot" });
        }

        const prices = await buildPriceMap(items.map((i) => i.ticker));
        const snapshot = createSnapshot(watchlistId, items, prices);

        const { data, error } = await upsertWatchlistSnapshot({ ...snapshot });
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "Failed to create snapshot" });
        }

        return res.status(HTTP_STATUS.OK).json({ success: true, snapshot: data[0] });
    } catch (err) {
        console.error("[Fundakamental] create watchlist snapshot failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error creating snapshot: ${(err as Error)?.message || err}` });
    }
};

/* GET /api/fundakamental/watchlists/:watchlistId/snapshots?days= */
export const getWatchlistSnapshots = async (req, res) => {
    const { watchlistId } = req.params;
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);

    try {
        const { data: ownership, error: ownershipError } = await getWatchlistOwnership(watchlistId, req.user.authId);
        if (ownershipError) throw ownershipError;
        if (!ownership || ownership.length === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ error: "Watchlist not found" });
        }

        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const { data, error } = await getWatchlistSnapshotsRepo(watchlistId, cutoff);
        if (error) throw error;

        return res.status(HTTP_STATUS.OK).json(data || []);
    } catch (err) {
        console.error("[Fundakamental] fetch watchlist snapshots failed:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: `Error fetching snapshots: ${(err as Error)?.message || err}` });
    }
};
