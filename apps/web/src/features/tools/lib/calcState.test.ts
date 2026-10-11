import { describe, expect, it } from 'vitest';
import { inputLocale, roundSignificant } from './calcState';

describe('roundSignificant', () => {
  it('keeps the requested significant figures', () => {
    expect(roundSignificant(60.2409, 2)).toBe(60);
    expect(roundSignificant(60.2409, 3)).toBeCloseTo(60.2, 5);
    expect(roundSignificant(1204819.28, 3)).toBe(1200000);
  });

  it('leaves zero and non-finite values alone', () => {
    expect(roundSignificant(0, 3)).toBe(0);
    expect(roundSignificant(NaN, 3)).toBeNaN();
  });
});

describe('inputLocale', () => {
  it('uses lakh grouping only for INR', () => {
    expect(inputLocale('INR')).toBe('en-IN');
    expect(inputLocale('USD')).toBe('en-US');
  });
});
