// Shared state helpers for the tools calculators.
//
//  • usePersistedState  — a useState that survives leaving the page (kept in
//    sessionStorage, so it lasts for the tab and is gone when it closes). SIP and
//    Lumpsum share keys for rate/years, so switching between them keeps what the
//    user typed.
//  • useMoneyState      — the same, for an amount of money. It remembers the
//    currency the amount was typed in and shows it converted into whichever
//    currency is active, so switching INR/USD changes the value, not just the
//    symbol. The original entry is kept, so switching back restores it exactly.
//  • useCalcSession     — re-runs the calculation when the calculator is reopened
//    with a previous result, and when the currency changes (so results never show
//    one currency's numbers under another's symbol).
import { useCallback, useEffect, useRef, useState } from 'react';
import useRegion from '../../../hooks/useRegion';
import { convert } from '../../../lib/region';

const PREFIX = 'xtin.calc.';

function read<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    return raw == null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage blocked — state just won't persist */
  }
}

export function usePersistedState(key: string, initial: string) {
  const [value, setValue] = useState<string>(() => read<string>(key) ?? initial);
  const set = useCallback(
    (next: string) => {
      setValue(next);
      write(key, next);
    },
    [key]
  );
  return [value, set] as const;
}

interface StoredMoney {
  value: string;
  currency: string;
  isDefault: boolean;
}

const parseAmount = (s: string) => parseFloat(String(s).replace(/,/g, ''));

/** Round to `digits` significant figures so converted amounts read cleanly ($60, not $60.2409). */
export function roundSignificant(n: number, digits: number) {
  if (!Number.isFinite(n) || n === 0) return n;
  const step = Math.pow(10, Math.floor(Math.log10(Math.abs(n))) - (digits - 1));
  return Math.round(n / step) * step;
}

/** Comma-grouped input text. Lakh grouping for India, thousands elsewhere; both parse back with `replace(/,/g, '')`. */
export const inputLocale = (currency: string) => (currency === 'INR' ? 'en-IN' : 'en-US');

export function useMoneyState(key: string, defaultInr: string) {
  const { config } = useRegion();
  const currency: string = config.currency;
  const [stored, setStored] = useState<StoredMoney>(
    () => read<StoredMoney>(key) ?? { value: defaultInr, currency: 'INR', isDefault: true }
  );

  let display = stored.value;
  if (stored.currency !== currency && stored.value !== '') {
    const n = parseAmount(stored.value);
    if (Number.isFinite(n)) {
      const converted = roundSignificant(convert(n, stored.currency, currency), stored.isDefault ? 2 : 3);
      display = converted.toLocaleString(inputLocale(currency), { maximumFractionDigits: 2 });
    }
  }

  const set = useCallback(
    (next: string) => {
      const record = { value: next, currency, isDefault: false };
      setStored(record);
      write(key, record);
    },
    [key, currency]
  );
  return [display, set] as const;
}

/**
 * Call after the calculator's `calculate` function is defined.
 * `hasResult` — whether a result is currently showing.
 */
export function useCalcSession(name: string, calculate: () => void, hasResult: boolean) {
  const { config } = useRegion();
  const currency: string = config.currency;
  const key = `${name}.ran`;

  // Reopened with a previous result: show it again.
  useEffect(() => {
    if (read<boolean>(key)) calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    write(key, hasResult);
  }, [key, hasResult]);

  // Currency switched while a result is showing: recompute in the new currency
  // (inputs are already converted by useMoneyState on this render).
  const previous = useRef(currency);
  useEffect(() => {
    if (previous.current === currency) return;
    previous.current = currency;
    if (hasResult) calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);
}
