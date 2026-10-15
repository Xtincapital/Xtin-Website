// Gini "new style" building blocks (approved concept artifact, 2026-10-15).
// Every value is a site token class — brand green roles, GfG neutrals, gold
// for Pro, the shared fonts — so pages pick up the finish without a palette
// of their own.

/** Card surface: hairline border, no shadow. */
export const CARD = "rounded-[18px] bg-card border border-border shadow-none";

/** Card that lifts on hover (KPI tiles). */
export const CARD_LIFT = `${CARD} transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-brand-line hover:shadow-[0_12px_28px_-14px_rgb(0_0_0/0.25)]`;

/** Small uppercase label above a figure. */
export const LABEL = "text-xs font-semibold text-muted-foreground";

/** Rounded status chips. */
const CHIP_BASE = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums";
export const CHIP_UP = `${CHIP_BASE} bg-brand-soft text-brand`;
export const CHIP_DOWN = `${CHIP_BASE} bg-destructive/10 text-destructive`;
export const CHIP_GOLD = `${CHIP_BASE} bg-[color-mix(in_srgb,var(--pro-gold)_16%,transparent)] text-[var(--pro-gold-deep)] dark:text-[var(--pro-gold)]`;
export const CHIP_MUTED = `${CHIP_BASE} bg-secondary text-muted-foreground`;

/** Data tables. */
export const TH = "py-2.5 px-3 text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground text-left";
export const TR = "border-t border-border transition-colors hover:bg-secondary/60";
export const TD = "py-3 px-3";

/** Gold PRO tag — the same one the sidebar uses. */
export const PRO_TAG = "pro-gold-bg text-[10px] font-bold tracking-[0.06em] px-1.5 py-0.5 rounded-full leading-none";

/** Soft tinted icon tile (stat cards, empty states). */
export const ICON_TILE = "grid h-10 w-10 flex-none place-items-center rounded-xl bg-brand-soft text-brand";
