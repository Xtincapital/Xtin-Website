// Life goals for the hero: what the coins turn into, and the monthly SIP it
// takes to get there. Amounts are typical round targets, not advice; the UI
// says the return is an assumption.
import type { LucideIcon } from 'lucide-react';
import { Car, Gem, GraduationCap, House, Plane, TreePalm } from 'lucide-react';

export type GoalId = 'home' | 'education' | 'car' | 'travel' | 'wedding' | 'retire';

export interface Goal {
  id: GoalId;
  label: string; // pill
  title: string; // plan card
  what: string; // what the amount pays for
  Icon: LucideIcon;
  inr: { amount: number; years: number };
  other: { amount: number; years: number };
}

export const GOALS: Goal[] = [
  { id: 'home', label: 'Home', title: 'A home of your own', what: 'down payment', Icon: House, inr: { amount: 2_500_000, years: 7 }, other: { amount: 60_000, years: 7 } },
  { id: 'education', label: 'Education', title: 'Your child’s education', what: 'college fund', Icon: GraduationCap, inr: { amount: 3_000_000, years: 15 }, other: { amount: 90_000, years: 15 } },
  { id: 'car', label: 'Car', title: 'A new car', what: 'paid in full', Icon: Car, inr: { amount: 1_000_000, years: 4 }, other: { amount: 30_000, years: 4 } },
  { id: 'travel', label: 'Travel', title: 'The trip you keep postponing', what: 'travel fund', Icon: Plane, inr: { amount: 400_000, years: 2 }, other: { amount: 8_000, years: 2 } },
  { id: 'wedding', label: 'Wedding', title: 'A wedding to remember', what: 'wedding fund', Icon: Gem, inr: { amount: 2_000_000, years: 6 }, other: { amount: 35_000, years: 6 } },
  { id: 'retire', label: 'Retire', title: 'Retire on your terms', what: 'retirement corpus', Icon: TreePalm, inr: { amount: 30_000_000, years: 25 }, other: { amount: 1_500_000, years: 25 } },
];

export const ASSUMED_RETURN = 12; // % a year, same default as the SIP calculator

// Monthly SIP needed to reach `target` in `years` (inverse of the SIP
// calculator's FV = P × ((1 + r)^n − 1) / r × (1 + r)).
export function monthlyFor(target: number, years: number, annualPct = ASSUMED_RETURN) {
  const r = annualPct / 12 / 100;
  const n = years * 12;
  if (r === 0) return target / n;
  return target / (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
}

// "₹25 lakh", "₹3 crore", "$60K"
export function shortMoney(v: number, symbol: string) {
  if (symbol === '₹') {
    if (v >= 1e7) return `₹${+(v / 1e7).toFixed(2)} crore`;
    if (v >= 1e5) return `₹${+(v / 1e5).toFixed(1)} lakh`;
    return `₹${Math.round(v).toLocaleString('en-IN')}`;
  }
  return `${symbol}${new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v)}`;
}
