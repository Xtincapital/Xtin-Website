// Portfolio Analytics — Node/TS port of `utils/portfolio_analytics.py`'s
// `PortfolioAnalytics` class plus its three module-level helper functions.
// Pure computation, no DB/network calls.
//
// `calculate_holding_performance` is intentionally NOT ported: it's a
// per-holding helper never called by `api/endpoints/portfolios.py` (which
// only calls `calculate_portfolio_metrics` — i.e. `calculate_all_metrics` —
// from `get_portfolio_analytics`, plus the two standalone functions
// `calculate_performance_over_time` and `calculate_realized_gains`).

export interface PortfolioHoldingRow {
    id?: string;
    portfolio_id?: string;
    ticker: string;
    company_name?: string | null;
    quantity: number | string;
    avg_cost_basis: number | string;
    total_cost: number | string;
    asset_type?: string | null;
    sector?: string | null;
    [key: string]: unknown;
}

export interface PortfolioPriceInfo {
    price: number;
    [key: string]: unknown;
}

export type PortfolioPriceMap = Record<string, PortfolioPriceInfo>;

export interface GainsLosses {
    total_value: number;
    total_cost: number;
    gain_loss: number;
    gain_loss_pct: number;
}

export interface SectorAllocationEntry {
    sector: string;
    value: number;
    percentage: number;
}

export interface PositionSizeEntry {
    ticker: string;
    value: number;
    percentage: number;
}

export interface PerformerEntry {
    ticker: string;
    gain_loss_pct: number;
    gain_loss: number;
    value: number;
}

export interface DiversificationScore {
    score: number;
    num_holdings: number;
    concentration_risk: "High" | "Medium" | "Low";
    largest_position_pct: number;
}

export interface PortfolioMetrics {
    summary: GainsLosses;
    sector_allocation: SectorAllocationEntry[];
    position_sizes: PositionSizeEntry[];
    best_performer: PerformerEntry | null;
    worst_performer: PerformerEntry | null;
    diversification: DiversificationScore;
    num_holdings: number;
}

export interface PerformanceOverTime {
    period: string;
    total_return: number;
    total_return_pct: number;
    annualized_return_pct?: number;
    start_value: number;
    end_value: number;
    days?: number;
}

export interface RealizedGains {
    realized_gains: number;
    sell_transactions: number;
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

/** Port of the `PortfolioAnalytics` class — takes holdings + a price map, computes everything. */
export class PortfolioAnalytics {
    private holdings: PortfolioHoldingRow[];
    private prices: PortfolioPriceMap;

    constructor(holdings: PortfolioHoldingRow[], prices: PortfolioPriceMap) {
        this.holdings = holdings;
        this.prices = prices;
    }

    calculateTotalValue(): number {
        let total = 0;
        for (const holding of this.holdings) {
            const quantity = toNumber(holding.quantity);
            const price = this.prices[holding.ticker]?.price ?? 0;
            total += quantity * price;
        }
        return total;
    }

    calculateTotalCost(): number {
        return this.holdings.reduce((sum, h) => sum + toNumber(h.total_cost), 0);
    }

    calculateGainsLosses(): GainsLosses {
        const totalValue = this.calculateTotalValue();
        const totalCost = this.calculateTotalCost();
        const gainLoss = totalValue - totalCost;
        const gainLossPct = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

        return {
            total_value: round(totalValue),
            total_cost: round(totalCost),
            gain_loss: round(gainLoss),
            gain_loss_pct: round(gainLossPct),
        };
    }

    calculateSectorAllocation(): SectorAllocationEntry[] {
        const totalValue = this.calculateTotalValue();
        if (totalValue === 0) return [];

        const sectors: Record<string, number> = {};

        for (const holding of this.holdings) {
            const sector = holding.sector || "Unknown";
            const quantity = toNumber(holding.quantity);
            const price = this.prices[holding.ticker]?.price ?? 0;
            const value = quantity * price;
            sectors[sector] = (sectors[sector] || 0) + value;
        }

        const sectorList: SectorAllocationEntry[] = Object.entries(sectors).map(([sector, value]) => ({
            sector,
            value: round(value),
            percentage: round(totalValue > 0 ? (value / totalValue) * 100 : 0),
        }));

        sectorList.sort((a, b) => b.value - a.value);
        return sectorList;
    }

    calculatePositionSizes(): PositionSizeEntry[] {
        const totalValue = this.calculateTotalValue();
        if (totalValue === 0) return [];

        const positions: PositionSizeEntry[] = this.holdings.map((holding) => {
            const quantity = toNumber(holding.quantity);
            const price = this.prices[holding.ticker]?.price ?? 0;
            const value = quantity * price;
            const pct = totalValue > 0 ? (value / totalValue) * 100 : 0;
            return { ticker: holding.ticker, value: round(value), percentage: round(pct) };
        });

        positions.sort((a, b) => b.value - a.value);
        return positions;
    }

    findBestPerformer(): PerformerEntry | null {
        let best: PerformerEntry | null = null;
        let bestPct = -Infinity;

        for (const holding of this.holdings) {
            const quantity = toNumber(holding.quantity);
            const cost = toNumber(holding.total_cost);
            const price = this.prices[holding.ticker]?.price ?? 0;
            const value = quantity * price;

            if (cost > 0) {
                const gainLossPct = ((value - cost) / cost) * 100;
                if (gainLossPct > bestPct) {
                    bestPct = gainLossPct;
                    best = {
                        ticker: holding.ticker,
                        gain_loss_pct: round(gainLossPct),
                        gain_loss: round(value - cost),
                        value: round(value),
                    };
                }
            }
        }

        return best;
    }

    findWorstPerformer(): PerformerEntry | null {
        let worst: PerformerEntry | null = null;
        let worstPct = Infinity;

        for (const holding of this.holdings) {
            const quantity = toNumber(holding.quantity);
            const cost = toNumber(holding.total_cost);
            const price = this.prices[holding.ticker]?.price ?? 0;
            const value = quantity * price;

            if (cost > 0) {
                const gainLossPct = ((value - cost) / cost) * 100;
                if (gainLossPct < worstPct) {
                    worstPct = gainLossPct;
                    worst = {
                        ticker: holding.ticker,
                        gain_loss_pct: round(gainLossPct),
                        gain_loss: round(value - cost),
                        value: round(value),
                    };
                }
            }
        }

        return worst;
    }

    calculateDiversificationScore(): DiversificationScore {
        if (this.holdings.length === 0) {
            return { score: 0, num_holdings: 0, concentration_risk: "High", largest_position_pct: 0 };
        }

        const positions = this.calculatePositionSizes();
        const numHoldings = positions.length;
        const largestPct = positions[0]?.percentage ?? 0;

        let score: number;
        if (numHoldings === 1) score = 20;
        else if (numHoldings <= 3) score = 40;
        else if (numHoldings <= 5) score = 60;
        else if (numHoldings <= 10) score = 75;
        else score = 85;

        if (largestPct > 50) score -= 20;
        else if (largestPct > 30) score -= 10;
        else if (largestPct > 20) score -= 5;

        score = Math.max(0, Math.min(100, score));

        let risk: "High" | "Medium" | "Low";
        if (largestPct > 40) risk = "High";
        else if (largestPct > 25) risk = "Medium";
        else risk = "Low";

        return {
            score: round(score, 0),
            num_holdings: numHoldings,
            concentration_risk: risk,
            largest_position_pct: round(largestPct),
        };
    }

    calculateAllMetrics(): PortfolioMetrics {
        return {
            summary: this.calculateGainsLosses(),
            sector_allocation: this.calculateSectorAllocation(),
            position_sizes: this.calculatePositionSizes(),
            best_performer: this.findBestPerformer(),
            worst_performer: this.findWorstPerformer(),
            diversification: this.calculateDiversificationScore(),
            num_holdings: this.holdings.length,
        };
    }
}

/** Port of the module-level `calculate_portfolio_metrics` helper. */
export async function calculatePortfolioMetrics(holdings: PortfolioHoldingRow[], prices: PortfolioPriceMap): Promise<PortfolioMetrics> {
    const analytics = new PortfolioAnalytics(holdings, prices);
    return analytics.calculateAllMetrics();
}

/** Port of `calculate_performance_over_time`. */
export function calculatePerformanceOverTime(snapshots: Array<Record<string, unknown>>): PerformanceOverTime {
    if (!snapshots || snapshots.length === 0) {
        return {
            period: "all_time",
            total_return: 0,
            total_return_pct: 0,
            start_value: 0,
            end_value: 0,
        };
    }

    const sorted = [...snapshots].sort((a, b) => String(a.snapshot_date).localeCompare(String(b.snapshot_date)));

    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const startValue = toNumber(first.total_value);
    const endValue = toNumber(last.total_value);
    const startCost = toNumber(first.total_cost);

    const totalReturn = endValue - startCost;
    const totalReturnPct = startCost > 0 ? (totalReturn / startCost) * 100 : 0;

    const startDate = new Date(String(first.snapshot_date));
    const endDate = new Date(String(last.snapshot_date));
    const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const years = days / 365.25;

    let annualizedReturn: number;
    if (years > 0 && startCost > 0) {
        annualizedReturn = (Math.pow(endValue / startCost, 1 / years) - 1) * 100;
    } else {
        annualizedReturn = totalReturnPct;
    }

    return {
        period: "all_time",
        total_return: round(totalReturn),
        total_return_pct: round(totalReturnPct),
        annualized_return_pct: round(annualizedReturn),
        start_value: round(startValue),
        end_value: round(endValue),
        days,
    };
}

/** Port of `calculate_realized_gains` (FIFO cost-basis matching). */
export function calculateRealizedGains(transactions: Array<Record<string, unknown>>): RealizedGains {
    let realizedGains = 0;
    let sellCount = 0;

    const tickerTransactions: Record<string, Array<Record<string, unknown>>> = {};
    for (const txn of transactions) {
        const ticker = String(txn.ticker);
        if (!tickerTransactions[ticker]) tickerTransactions[ticker] = [];
        tickerTransactions[ticker].push(txn);
    }

    for (const txns of Object.values(tickerTransactions)) {
        const sorted = [...txns].sort((a, b) => String(a.transaction_date).localeCompare(String(b.transaction_date)));

        const buys: Array<{ quantity: number; price: number }> = [];
        for (const txn of sorted) {
            if (txn.transaction_type === "BUY") {
                buys.push({ quantity: toNumber(txn.quantity), price: toNumber(txn.price_per_share) });
            } else if (txn.transaction_type === "SELL") {
                const sellPrice = toNumber(txn.price_per_share);
                let remaining = toNumber(txn.quantity);
                sellCount += 1;

                while (remaining > 0 && buys.length > 0) {
                    const buy = buys[0];
                    if (buy.quantity <= remaining) {
                        realizedGains += (sellPrice - buy.price) * buy.quantity;
                        remaining -= buy.quantity;
                        buys.shift();
                    } else {
                        realizedGains += (sellPrice - buy.price) * remaining;
                        buy.quantity -= remaining;
                        remaining = 0;
                    }
                }
            }
        }
    }

    return {
        realized_gains: round(realizedGains),
        sell_transactions: sellCount,
    };
}
