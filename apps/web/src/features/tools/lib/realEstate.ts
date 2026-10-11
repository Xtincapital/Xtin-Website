// Real-estate investment maths for the tools calculator.
//
// Everything here is an ESTIMATE built on stated assumptions — the benchmark
// numbers below are rough Indian-market ballparks, not live data, and the UI
// labels them that way. Keeping the maths in one pure module makes the
// assumptions visible and testable.
//
// What the calculator does:
//  • Judges the four filters against the benchmark for the chosen LOCATION type
//    (a 2.5% yield is normal in a metro and weak in a small town).
//  • Uses NET yield (after vacancy, upkeep and buying costs) for Filter 1.
//  • Compares property to a fixed deposit on equal terms: same cash invested
//    (price + buying costs), rent after tax reinvested at the FD rate, selling
//    costs and capital-gains tax deducted, FD interest taxed at the user's slab.
//  • Shows conservative / base / optimistic price-growth scenarios.
//
// Simplifications (also shown to the user): no home loan, no GST, no cess,
// LTCG at 12.5% without indexation for holdings of 2+ years, rent taxed at slab
// on 70% of net rent (30% standard deduction), flat growth/rent assumptions.

export type LocationType = 'metro' | 'tier2' | 'tier3';
export type Status = 'good' | 'neutral' | 'avoid' | null;

export interface Benchmark {
  label: string;
  /** Gross rental yield (% of price): at/above `yieldGood` = good, below `yieldAvoid` = avoid. */
  yieldGood: number;
  yieldAvoid: number;
  /** Price ÷ annual rent: at/below `ptrGood` = good, above `ptrAvoid` = avoid. */
  ptrGood: number;
  ptrAvoid: number;
  /** Typical long-run nominal price growth, % a year (before infrastructure). */
  growth: number;
  /** Days to sell: below `daysGood` = good, above `daysAvoid` = avoid. */
  daysGood: number;
  daysAvoid: number;
  /** Used when the user leaves "days to sell" blank. */
  daysDefault: number;
}

// Approximate ballparks for Indian residential property.
export const BENCHMARKS: Record<LocationType, Benchmark> = {
  metro: { label: 'Metro city', yieldGood: 3.0, yieldAvoid: 2.0, ptrGood: 33, ptrAvoid: 50, growth: 7, daysGood: 60, daysAvoid: 120, daysDefault: 75 },
  tier2: { label: 'Tier 2 city', yieldGood: 3.5, yieldAvoid: 2.5, ptrGood: 28, ptrAvoid: 40, growth: 6.5, daysGood: 75, daysAvoid: 150, daysDefault: 90 },
  tier3: { label: 'Tier 3 / suburban', yieldGood: 4.0, yieldAvoid: 3.0, ptrGood: 25, ptrAvoid: 33, growth: 5.5, daysGood: 90, daysAvoid: 180, daysDefault: 120 },
};

/** Rough share of gross rent lost to vacancy/upkeep/buying costs; turns the gross yield bar into a net one. */
export const NET_YIELD_FACTOR = 0.75;

/** Extra price growth (percentage points a year) an upcoming project may add. A guess, shown as one. */
export const INFRA_GROWTH_ADJ: Record<string, number> = {
  metro: 2,
  airport: 2,
  'it-park': 1.5,
  hospital: 1.5,
  road: 0.5,
  none: 0,
  '': 0,
};

export const SCENARIO_SPREAD = 2; // conservative = base − 2 pts, optimistic = base + 2 pts

export interface Assumptions {
  years: number;
  /** null = use the location benchmark + infrastructure adjustment. */
  growthOverride: number | null;
  rentIncreasePct: number;
  vacancyMonths: number;
  /** Maintenance + property tax, % of property value per year. */
  holdingCostPct: number;
  /** Stamp duty + registration + brokerage on purchase, % of price. */
  buyCostPct: number;
  /** Brokerage etc. on sale, % of sale value. */
  sellCostPct: number;
  fdRatePct: number;
  /** Income-tax slab used for rent, FD interest and (short holds) gains, %. */
  taxSlabPct: number;
}

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  years: 10,
  growthOverride: null,
  rentIncreasePct: 5,
  vacancyMonths: 1,
  holdingCostPct: 0.5,
  buyCostPct: 6,
  sellCostPct: 1,
  fdRatePct: 7,
  taxSlabPct: 30,
};

export const LTCG_RATE_PCT = 12.5;
const LTCG_MIN_YEARS = 2;
const RENT_STANDARD_DEDUCTION = 0.3;

export interface Inputs {
  price: number;
  monthlyRent: number;
  location: LocationType;
  infrastructure: string;
  /** Days to sell; 0/undefined = location default. */
  saleDays?: number;
  assumptions?: Partial<Assumptions>;
}

export interface YearRow {
  year: string;
  propertyValue: number;
  /** Cumulative rent received after costs and tax. */
  totalRentalIncome: number;
  totalReturns: number;
}

export interface ScenarioResult {
  key: 'conservative' | 'base' | 'optimistic';
  label: string;
  growthPct: number;
  finalWealth: number;
  profit: number;
  cagrPct: number;
  beatsFd: boolean;
}

export interface FilterOutcome {
  status: Status;
  value: number;
}

export interface Analysis {
  benchmark: Benchmark;
  assumptions: Assumptions;
  grossAnnualRent: number;
  grossYield: number;
  netYield: number;
  priceToRent: number;
  outlay: number;
  growthBasePct: number;
  infraAdjPct: number;
  days: number;
  daysAssumed: boolean;
  filters: { yield: FilterOutcome; ratio: FilterOutcome; infra: FilterOutcome & { text: string }; liquidity: FilterOutcome };
  passedFilters: number;
  analyzedFilters: number;
  recommendation: string;
  recommendationClass: '' | 'good' | 'neutral' | 'avoid';
  projections: YearRow[];
  scenarios: ScenarioResult[];
  base: ScenarioResult;
  fdFinal: number;
  fdProfit: number;
  fdCagrPct: number;
  betterInvestment: 'property' | 'fd';
  /** Property's after-cost, after-tax profit (base case), and the sale-side breakdown. */
  saleProceeds: number;
  capitalGainsTax: number;
  reinvestedRent: number;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function resolveAssumptions(partial?: Partial<Assumptions>): Assumptions {
  const a = { ...DEFAULT_ASSUMPTIONS, ...partial };
  return {
    ...a,
    years: clamp(Math.round(a.years) || DEFAULT_ASSUMPTIONS.years, 1, 30),
    vacancyMonths: clamp(a.vacancyMonths, 0, 12),
    holdingCostPct: clamp(a.holdingCostPct, 0, 10),
    buyCostPct: clamp(a.buyCostPct, 0, 20),
    sellCostPct: clamp(a.sellCostPct, 0, 20),
    rentIncreasePct: clamp(a.rentIncreasePct, 0, 20),
    fdRatePct: clamp(a.fdRatePct, 0, 20),
    taxSlabPct: clamp(a.taxSlabPct, 0, 40),
  };
}

export function infrastructureStatus(infra: string): Status {
  if (!infra) return null;
  if (infra === 'none') return 'avoid';
  if (infra === 'road') return 'neutral';
  return 'good';
}

function higherIsBetter(value: number, good: number, avoid: number): Status {
  return value >= good ? 'good' : value >= avoid ? 'neutral' : 'avoid';
}

function lowerIsBetter(value: number, good: number, avoid: number): Status {
  return value <= good ? 'good' : value <= avoid ? 'neutral' : 'avoid';
}

function simulate(price: number, monthlyRent: number, growthPct: number, a: Assumptions) {
  const outlay = price * (1 + a.buyCostPct / 100);
  const fdAfterTax = (a.fdRatePct * (1 - a.taxSlabPct / 100)) / 100;
  const slab = a.taxSlabPct / 100;

  let value = price;
  let reinvested = 0; // rent pot, compounding at the after-tax FD rate (same rate the FD side earns)
  let cumulativeRent = 0;
  const rows: YearRow[] = [];

  for (let y = 1; y <= a.years; y++) {
    const holdingCost = value * (a.holdingCostPct / 100);
    value *= 1 + growthPct / 100;
    const rent = monthlyRent * (12 - a.vacancyMonths) * Math.pow(1 + a.rentIncreasePct / 100, y - 1);
    const netRent = rent - holdingCost;
    const rentTax = netRent > 0 ? netRent * (1 - RENT_STANDARD_DEDUCTION) * slab : 0;
    const afterTax = netRent - rentTax;
    reinvested = reinvested * (1 + fdAfterTax) + afterTax;
    cumulativeRent += afterTax;
    rows.push({
      year: `Year ${y}`,
      propertyValue: Math.round(value),
      totalRentalIncome: Math.round(cumulativeRent),
      totalReturns: Math.round(value - price + cumulativeRent),
    });
  }

  const saleValue = value * (1 - a.sellCostPct / 100);
  const gain = saleValue - outlay;
  const capitalGainsTax = gain > 0 ? gain * ((a.years >= LTCG_MIN_YEARS ? LTCG_RATE_PCT : a.taxSlabPct) / 100) : 0;
  const saleProceeds = saleValue - capitalGainsTax;
  const finalWealth = saleProceeds + reinvested;

  return { outlay, rows, finalWealth, saleProceeds, capitalGainsTax, reinvested, fdAfterTax };
}

const cagrPct = (final: number, start: number, years: number) =>
  final > 0 && start > 0 ? (Math.pow(final / start, 1 / years) - 1) * 100 : -100;

export function analyse(input: Inputs): Analysis | null {
  const { price, monthlyRent } = input;
  if (!(price > 0) || !(monthlyRent > 0)) return null;

  const a = resolveAssumptions(input.assumptions);
  const bm = BENCHMARKS[input.location] ?? BENCHMARKS.metro;
  const infraAdj = INFRA_GROWTH_ADJ[input.infrastructure] ?? 0;
  const growthBase = a.growthOverride ?? bm.growth + infraAdj;

  const grossAnnualRent = monthlyRent * 12;
  const grossYield = (grossAnnualRent / price) * 100;
  const outlay = price * (1 + a.buyCostPct / 100);
  const netAnnualRent = monthlyRent * (12 - a.vacancyMonths) - price * (a.holdingCostPct / 100);
  const netYield = (netAnnualRent / outlay) * 100;
  const priceToRent = price / grossAnnualRent;

  const daysAssumed = !(input.saleDays && input.saleDays > 0);
  const days = daysAssumed ? bm.daysDefault : (input.saleDays as number);

  const infraStatus = infrastructureStatus(input.infrastructure);
  const filters = {
    yield: {
      value: netYield,
      status: higherIsBetter(netYield, bm.yieldGood * NET_YIELD_FACTOR, bm.yieldAvoid * NET_YIELD_FACTOR),
    },
    ratio: { value: priceToRent, status: lowerIsBetter(priceToRent, bm.ptrGood, bm.ptrAvoid) },
    infra: { value: 0, status: infraStatus, text: input.infrastructure },
    liquidity: { value: days, status: lowerIsBetter(days, bm.daysGood, bm.daysAvoid) },
  };

  const statuses = [filters.yield.status, filters.ratio.status, filters.infra.status, filters.liquidity.status];
  const passedFilters = statuses.filter((s) => s === 'good').length;
  const analyzedFilters = statuses.filter((s) => s !== null).length;

  let recommendation = 'Complete all filters for assessment';
  let recommendationClass: Analysis['recommendationClass'] = '';
  if (analyzedFilters >= 3) {
    if (passedFilters >= 3) {
      recommendation = 'Strong Candidate — Passes Most Filters';
      recommendationClass = 'good';
    } else if (passedFilters === 2) {
      recommendation = 'Moderate — Requires Further Analysis';
      recommendationClass = 'neutral';
    } else {
      recommendation = 'Weak on Fundamentals — Consider Alternatives';
      recommendationClass = 'avoid';
    }
  }

  const growths: { key: ScenarioResult['key']; label: string; g: number }[] = [
    { key: 'conservative', label: 'Conservative', g: Math.max(0, growthBase - SCENARIO_SPREAD) },
    { key: 'base', label: 'Base case', g: growthBase },
    { key: 'optimistic', label: 'Optimistic', g: growthBase + SCENARIO_SPREAD },
  ];

  const fdAfterTax = (a.fdRatePct * (1 - a.taxSlabPct / 100)) / 100;
  const fdFinal = outlay * Math.pow(1 + fdAfterTax, a.years);

  let projections: YearRow[] = [];
  let baseSim: ReturnType<typeof simulate> | null = null;
  const scenarios: ScenarioResult[] = growths.map(({ key, label, g }) => {
    const sim = simulate(price, monthlyRent, g, a);
    if (key === 'base') {
      projections = sim.rows;
      baseSim = sim;
    }
    return {
      key,
      label,
      growthPct: g,
      finalWealth: sim.finalWealth,
      profit: sim.finalWealth - sim.outlay,
      cagrPct: cagrPct(sim.finalWealth, sim.outlay, a.years),
      beatsFd: sim.finalWealth > fdFinal,
    };
  });
  const base = scenarios.find((s) => s.key === 'base') as ScenarioResult;
  const bs = baseSim as unknown as ReturnType<typeof simulate>;

  return {
    benchmark: bm,
    assumptions: a,
    grossAnnualRent,
    grossYield,
    netYield,
    priceToRent,
    outlay,
    growthBasePct: growthBase,
    infraAdjPct: a.growthOverride != null ? 0 : infraAdj,
    days,
    daysAssumed,
    filters,
    passedFilters,
    analyzedFilters,
    recommendation,
    recommendationClass,
    projections,
    scenarios,
    base,
    fdFinal,
    fdProfit: fdFinal - outlay,
    fdCagrPct: fdAfterTax * 100,
    betterInvestment: base.beatsFd ? 'property' : 'fd',
    saleProceeds: bs.saleProceeds,
    capitalGainsTax: bs.capitalGainsTax,
    reinvestedRent: bs.reinvested,
  };
}
