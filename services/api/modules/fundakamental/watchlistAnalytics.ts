// Watchlist Analytics — Node/TS port of `utils/watchlist_analytics.py`'s
// `WatchlistAnalytics` class. Pure computation, no DB/network calls — the
// Python class's `@staticmethod`s are ported as plain exported functions.
//
// `get_sector_allocation` is intentionally NOT ported: it's never called by
// `api/endpoints/watchlists.py` (which only calls calculate_summary,
// get_target_alerts, get_top_movers, get_performance_by_tag, and
// calculate_hypothetical_value from `get_watchlist_summary`, plus
// create_snapshot from the snapshot endpoint) — porting it would need a
// `stock_info` sector lookup that no watchlist endpoint ever assembles.

export interface WatchlistItemRow {
    id?: string;
    watchlist_id?: string;
    ticker: string;
    company_name?: string | null;
    added_price?: number | string | null;
    target_price?: number | string | null;
    target_price_type?: string | null;
    notes?: string | null;
    tags?: string[] | null;
    [key: string]: unknown;
}

// Internal price-map shape built by the controller from `getQuote()` calls —
// deliberately named like the Python source's `market_data.get_market_data`
// return shape (`price`, `change`, `change_pct`) even though the underlying
// Node `QuoteData` type spells the last field `change_percent`.
export interface WatchlistPriceInfo {
    price: number;
    change: number;
    change_pct: number;
}

export type WatchlistPriceMap = Record<string, WatchlistPriceInfo>;

interface Performer {
    ticker: string;
    change_pct: number;
    current_price: number;
}

export interface WatchlistSummary {
    total_items: number;
    tracked_value: number;
    avg_change_pct: number;
    best_performer: Performer | null;
    worst_performer: Performer | null;
    targets_hit: number;
    targets_near: number;
    avg_target_distance?: number;
    total_target_distance?: number;
}

export interface TargetAlert {
    ticker: string;
    company_name: string | null;
    current_price: number;
    target_price: number;
    target_type: string;
    distance: number;
    distance_pct: number;
    status: "hit" | "near" | "watching";
    notes: string | null;
}

export interface TagPerformance {
    count: number;
    avg_change_pct: number;
    best_change_pct: number;
    worst_change_pct: number;
}

export interface TopMover {
    ticker: string;
    company_name: string | null;
    added_price: number;
    current_price: number;
    change: number;
    change_pct: number;
}

export interface HypotheticalValue {
    total_invested: number;
    current_value: number;
    gain_loss: number;
    gain_loss_pct: number;
    stocks_analyzed: number;
    investment_per_stock: number;
}

export interface WatchlistSnapshotRecord {
    watchlist_id: string;
    snapshot_date: string;
    total_value: number;
    avg_change_pct: number;
    num_items: number;
    snapshot_data: Record<string, unknown>;
}

const round = (n: number, digits = 2): number => {
    const factor = 10 ** digits;
    return Math.round(n * factor) / factor;
};

function toNumber(value: unknown): number {
    if (value === null || value === undefined || value === "") return 0;
    const n = Number(value);
    return Number.isNaN(n) ? 0 : n;
}

/** Port of `WatchlistAnalytics.calculate_summary`. */
export function calculateSummary(items: WatchlistItemRow[], currentPrices: WatchlistPriceMap): WatchlistSummary {
    const totalItems = items.length;

    if (totalItems === 0) {
        return {
            total_items: 0,
            tracked_value: 0.0,
            avg_change_pct: 0.0,
            best_performer: null,
            worst_performer: null,
            targets_hit: 0,
            targets_near: 0,
            total_target_distance: 0.0,
        };
    }

    let totalChangePct = 0.0;
    let trackedValue = 0.0;
    const performers: Performer[] = [];
    let targetsHit = 0;
    let targetsNear = 0;
    let totalTargetDistance = 0.0;

    for (const item of items) {
        const ticker = item.ticker;
        const addedPrice = toNumber(item.added_price);
        const targetPrice = item.target_price ? toNumber(item.target_price) : null;

        const priceInfo = currentPrices[ticker];
        if (priceInfo && addedPrice > 0) {
            const currentPrice = priceInfo.price ?? 0;

            if (currentPrice > 0) {
                const changePct = ((currentPrice - addedPrice) / addedPrice) * 100;
                totalChangePct += changePct;
                trackedValue += currentPrice;

                performers.push({ ticker, change_pct: changePct, current_price: currentPrice });

                if (targetPrice) {
                    const targetType = item.target_price_type || "ALERT";
                    const distancePct = Math.abs((targetPrice - currentPrice) / currentPrice) * 100;
                    totalTargetDistance += distancePct;

                    if (targetType === "BUY") {
                        if (currentPrice <= targetPrice) targetsHit += 1;
                        else if (distancePct <= 5) targetsNear += 1;
                    } else if (targetType === "SELL") {
                        if (currentPrice >= targetPrice) targetsHit += 1;
                        else if (distancePct <= 5) targetsNear += 1;
                    } else {
                        // ALERT
                        if (distancePct <= 1) targetsHit += 1;
                        else if (distancePct <= 5) targetsNear += 1;
                    }
                }
            }
        }
    }

    const avgChangePct = totalItems > 0 ? totalChangePct / totalItems : 0.0;
    const avgTargetDistance = totalItems > 0 ? totalTargetDistance / totalItems : 0.0;

    const performersSorted = [...performers].sort((a, b) => b.change_pct - a.change_pct);
    const bestPerformer = performersSorted[0] ?? null;
    const worstPerformer = performersSorted[performersSorted.length - 1] ?? null;

    return {
        total_items: totalItems,
        tracked_value: round(trackedValue),
        avg_change_pct: round(avgChangePct),
        best_performer: bestPerformer,
        worst_performer: worstPerformer,
        targets_hit: targetsHit,
        targets_near: targetsNear,
        avg_target_distance: round(avgTargetDistance),
    };
}

/** Port of `WatchlistAnalytics.get_target_alerts`. */
export function getTargetAlerts(items: WatchlistItemRow[], currentPrices: WatchlistPriceMap): TargetAlert[] {
    const alerts: TargetAlert[] = [];

    for (const item of items) {
        const ticker = item.ticker;
        const targetPrice = item.target_price ? toNumber(item.target_price) : null;

        const priceInfo = currentPrices[ticker];
        if (!targetPrice || !priceInfo) continue;

        const currentPrice = priceInfo.price ?? 0;
        if (currentPrice <= 0) continue;

        const targetType = item.target_price_type || "ALERT";
        const distance = targetPrice - currentPrice;
        const distancePct = (distance / currentPrice) * 100;

        let status: "hit" | "near" | "watching" = "watching";

        if (targetType === "BUY") {
            if (currentPrice <= targetPrice) status = "hit";
            else if (Math.abs(distancePct) <= 5) status = "near";
        } else if (targetType === "SELL") {
            if (currentPrice >= targetPrice) status = "hit";
            else if (Math.abs(distancePct) <= 5) status = "near";
        } else {
            if (Math.abs(distancePct) <= 1) status = "hit";
            else if (Math.abs(distancePct) <= 5) status = "near";
        }

        if (status === "hit" || status === "near") {
            alerts.push({
                ticker,
                company_name: item.company_name ?? null,
                current_price: currentPrice,
                target_price: targetPrice,
                target_type: targetType,
                distance: round(distance),
                distance_pct: round(distancePct),
                status,
                notes: item.notes ?? null,
            });
        }
    }

    alerts.sort((a, b) => Math.abs(a.distance_pct) - Math.abs(b.distance_pct));

    return alerts;
}

/** Port of `WatchlistAnalytics.get_performance_by_tag`. */
export function getPerformanceByTag(items: WatchlistItemRow[], currentPrices: WatchlistPriceMap): Record<string, TagPerformance> {
    const tagMetrics: Record<string, number[]> = {};

    for (const item of items) {
        const ticker = item.ticker;
        const addedPrice = toNumber(item.added_price);
        const tags = item.tags || [];

        const priceInfo = currentPrices[ticker];
        if (priceInfo && addedPrice > 0) {
            const currentPrice = priceInfo.price ?? 0;
            if (currentPrice > 0) {
                const changePct = ((currentPrice - addedPrice) / addedPrice) * 100;
                for (const tag of tags) {
                    if (!tagMetrics[tag]) tagMetrics[tag] = [];
                    tagMetrics[tag].push(changePct);
                }
            }
        }
    }

    const result: Record<string, TagPerformance> = {};
    for (const [tag, changes] of Object.entries(tagMetrics)) {
        result[tag] = {
            count: changes.length,
            avg_change_pct: round(changes.reduce((a, b) => a + b, 0) / changes.length),
            best_change_pct: round(Math.max(...changes)),
            worst_change_pct: round(Math.min(...changes)),
        };
    }

    return result;
}

/** Port of `WatchlistAnalytics.get_top_movers`. */
export function getTopMovers(
    items: WatchlistItemRow[],
    currentPrices: WatchlistPriceMap,
    limit = 5,
): { gainers: TopMover[]; losers: TopMover[] } {
    const movers: TopMover[] = [];

    for (const item of items) {
        const ticker = item.ticker;
        const addedPrice = toNumber(item.added_price);

        const priceInfo = currentPrices[ticker];
        if (priceInfo && addedPrice > 0) {
            const currentPrice = priceInfo.price ?? 0;
            if (currentPrice > 0) {
                const change = currentPrice - addedPrice;
                const changePct = (change / addedPrice) * 100;

                movers.push({
                    ticker,
                    company_name: item.company_name ?? null,
                    added_price: addedPrice,
                    current_price: currentPrice,
                    change: round(change),
                    change_pct: round(changePct),
                });
            }
        }
    }

    const moversSorted = [...movers].sort((a, b) => b.change_pct - a.change_pct);

    return {
        gainers: moversSorted.slice(0, limit),
        losers: moversSorted.slice(Math.max(moversSorted.length - limit, 0)).reverse(),
    };
}

/** Port of `WatchlistAnalytics.calculate_hypothetical_value`. */
export function calculateHypotheticalValue(
    items: WatchlistItemRow[],
    currentPrices: WatchlistPriceMap,
    investmentPerStock = 1000.0,
): HypotheticalValue {
    let totalInvested = 0.0;
    let totalCurrentValue = 0.0;
    let stocksAnalyzed = 0;

    for (const item of items) {
        const ticker = item.ticker;
        const addedPrice = toNumber(item.added_price);

        const priceInfo = currentPrices[ticker];
        if (priceInfo && addedPrice > 0) {
            const currentPrice = priceInfo.price ?? 0;
            if (currentPrice > 0) {
                const shares = investmentPerStock / addedPrice;
                const currentValue = shares * currentPrice;
                totalInvested += investmentPerStock;
                totalCurrentValue += currentValue;
                stocksAnalyzed += 1;
            }
        }
    }

    const gainLoss = totalCurrentValue - totalInvested;
    const gainLossPct = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0.0;

    return {
        total_invested: round(totalInvested),
        current_value: round(totalCurrentValue),
        gain_loss: round(gainLoss),
        gain_loss_pct: round(gainLossPct),
        stocks_analyzed: stocksAnalyzed,
        investment_per_stock: investmentPerStock,
    };
}

/** Port of `WatchlistAnalytics.create_snapshot`. */
export function createSnapshot(watchlistId: string, items: WatchlistItemRow[], currentPrices: WatchlistPriceMap): WatchlistSnapshotRecord {
    const summary = calculateSummary(items, currentPrices);

    const snapshotData: Record<string, unknown> = {};
    for (const item of items) {
        const ticker = item.ticker;
        const addedPrice = toNumber(item.added_price);

        const priceInfo = currentPrices[ticker];
        if (priceInfo && addedPrice > 0) {
            const currentPrice = priceInfo.price ?? 0;
            if (currentPrice > 0) {
                const change = currentPrice - addedPrice;
                const changePct = (change / addedPrice) * 100;

                snapshotData[ticker] = {
                    added_price: addedPrice,
                    current_price: currentPrice,
                    change: round(change),
                    change_pct: round(changePct),
                    target_price: item.target_price ? toNumber(item.target_price) : null,
                    target_type: item.target_price_type ?? null,
                };
            }
        }
    }

    return {
        watchlist_id: watchlistId,
        snapshot_date: new Date().toISOString().slice(0, 10),
        total_value: summary.tracked_value,
        avg_change_pct: summary.avg_change_pct,
        num_items: summary.total_items,
        snapshot_data: snapshotData,
    };
}
