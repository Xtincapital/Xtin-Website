import { describe, expect, it } from 'vitest';
import { analyse, BENCHMARKS, infrastructureStatus, resolveAssumptions } from './realEstate';

const base = { price: 10_000_000, monthlyRent: 20_000, location: 'metro' as const, infrastructure: '' };

describe('analyse', () => {
  it('returns null without a positive price and rent', () => {
    expect(analyse({ ...base, price: 0 })).toBeNull();
    expect(analyse({ ...base, monthlyRent: 0 })).toBeNull();
  });

  it('computes gross yield, price-to-rent and a lower net yield', () => {
    const r = analyse(base)!;
    expect(r.grossYield).toBeCloseTo(2.4, 5);
    expect(r.priceToRent).toBeCloseTo(41.67, 1);
    expect(r.netYield).toBeLessThan(r.grossYield);
  });

  it('judges the same property differently by location', () => {
    // 2.4% gross yield: acceptable for a metro, weak for a tier-3 area.
    const metro = analyse({ ...base, location: 'metro' })!;
    const tier3 = analyse({ ...base, location: 'tier3' })!;
    expect(metro.filters.ratio.status).toBe('neutral');
    expect(tier3.filters.ratio.status).toBe('avoid');
  });

  it('uses the location default sale time when none is given', () => {
    const r = analyse(base)!;
    expect(r.daysAssumed).toBe(true);
    expect(r.days).toBe(BENCHMARKS.metro.daysDefault);
    expect(analyse({ ...base, saleDays: 30 })!.days).toBe(30);
  });

  it('adds infrastructure growth only when growth is not overridden', () => {
    const none = analyse(base)!;
    const metroLine = analyse({ ...base, infrastructure: 'metro' })!;
    expect(metroLine.growthBasePct).toBeCloseTo(none.growthBasePct + 2, 5);
    const overridden = analyse({ ...base, infrastructure: 'metro', assumptions: { growthOverride: 5 } })!;
    expect(overridden.growthBasePct).toBe(5);
    expect(overridden.infraAdjPct).toBe(0);
  });

  it('orders scenarios conservative < base < optimistic', () => {
    const [c, b, o] = analyse(base)!.scenarios;
    expect(c.finalWealth).toBeLessThan(b.finalWealth);
    expect(b.finalWealth).toBeLessThan(o.finalWealth);
  });

  it('with zero growth and costs, property loses to the FD', () => {
    const r = analyse({ ...base, assumptions: { growthOverride: 0 } })!;
    expect(r.betterInvestment).toBe('fd');
  });

  it('handles a short hold with slab-rate gains tax', () => {
    const r = analyse({ ...base, assumptions: { years: 1, growthOverride: 20 } })!;
    expect(r.capitalGainsTax).toBeGreaterThan(0);
    expect(r.projections).toHaveLength(1);
  });

  it('clamps out-of-range assumptions', () => {
    const a = resolveAssumptions({ years: 99, vacancyMonths: 40, taxSlabPct: 90 });
    expect(a.years).toBe(30);
    expect(a.vacancyMonths).toBe(12);
    expect(a.taxSlabPct).toBe(40);
  });

  it('grades infrastructure', () => {
    expect(infrastructureStatus('')).toBeNull();
    expect(infrastructureStatus('none')).toBe('avoid');
    expect(infrastructureStatus('road')).toBe('neutral');
    expect(infrastructureStatus('metro')).toBe('good');
  });
});
