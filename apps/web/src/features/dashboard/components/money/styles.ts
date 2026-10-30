// Shared classes for the dashboard's money sections: card and chip styles and
// the four tones (green = good, gold = needs a little, red = needs work,
// grey = not set up). Components that use them live in ./ui.tsx.

import type { Tone } from "../../lib/money";

export const CARD = "rounded-[22px] border border-border bg-card p-5 shadow-[var(--shadow-md)] sm:p-6";
export const SECTION_TITLE = "text-lg font-bold tracking-[-0.015em]";
export const CHIP = "inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 text-xs font-bold";

export const TONE: Record<Tone, { text: string; soft: string; border: string; fill: string; stroke: string; chip: string }> = {
  good: {
    text: "text-brand",
    soft: "bg-brand-soft",
    border: "border-brand-line",
    fill: "bg-brand-fill",
    stroke: "rgb(var(--brand))",
    chip: "border-brand-line bg-brand-soft text-brand",
  },
  ok: {
    text: "text-[var(--pro-gold-deep)] dark:text-[var(--pro-gold)]",
    soft: "bg-[color-mix(in_srgb,var(--pro-gold)_14%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--pro-gold)_45%,transparent)]",
    fill: "bg-[var(--pro-gold)]",
    stroke: "var(--pro-gold)",
    chip: "border-[color-mix(in_srgb,var(--pro-gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--pro-gold)_14%,transparent)] text-[var(--pro-gold-deep)] dark:text-[var(--pro-gold)]",
  },
  bad: {
    text: "text-destructive",
    soft: "bg-destructive/10",
    border: "border-destructive/30",
    fill: "bg-destructive",
    stroke: "hsl(var(--destructive))",
    chip: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  none: {
    text: "text-muted-foreground",
    soft: "bg-secondary",
    border: "border-border",
    fill: "bg-muted-foreground/30",
    stroke: "hsl(var(--border))",
    chip: "border-border bg-secondary text-muted-foreground",
  },
};

export const TONE_WORD: Record<Tone, string> = { good: "Strong", ok: "Okay", bad: "Needs work", none: "Not set" };
