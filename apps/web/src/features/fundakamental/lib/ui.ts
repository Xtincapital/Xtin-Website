// FundaKaMental "new style" building blocks (approved artifact, 2026-10-15).
// Every value is a site token class — brand green roles, GfG neutrals, the
// shared fonts — so pages pick up the finish without a palette of their own.

/** Card surface: hairline border, no shadow. Add padding with CARD_P. */
export const CARD = "rounded-2xl bg-card border border-border";
export const CARD_P = `${CARD} p-5 md:p-6`;

/** Card section heading; pair with a 16px `text-brand` lucide icon. */
export const H2 = "text-base font-bold text-foreground mb-4 flex items-center gap-2";
export const H2_ICON = "w-4 h-4 text-brand";

/** Data tables. */
export const TH = "pb-2 px-3 text-xs font-bold uppercase tracking-wide text-muted-foreground";
export const TR = "border-t border-border transition-colors hover:bg-secondary/60";
export const TD = "py-3 px-3";

/** Pill toggles / filter chips. */
export const CHIP =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:border-brand-line hover:bg-brand-soft";
export const CHIP_ON = "!border-brand !bg-brand-soft !text-brand";

/** Text inputs. */
export const INPUT =
  "h-11 rounded-xl bg-secondary/50 border-border focus-visible:ring-brand/20 focus-visible:border-brand";

/** Solid green call to action. */
export const BTN = "bg-brand-fill text-white hover:bg-brand-hover";

/** Gold PRO tag — the same one the sidebar uses. */
export const PRO_TAG = "pro-gold-bg text-xs font-bold tracking-wide px-1.5 py-0.5 rounded";

/** Soft tinted icon tile (stat cards, empty states). */
export const ICON_TILE = "grid h-10 w-10 flex-none place-items-center rounded-xl bg-brand-soft text-brand";

/** Put on a shadcn <Table>: small bold uppercase headers, tabular numbers, row hover. */
export const TABLE_FX =
  "[&_th]:h-10 [&_th]:text-xs [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground [&_td]:tabular-nums [&_td]:py-3 [&_tbody_tr]:border-border [&_tbody_tr:hover]:bg-secondary/60";
