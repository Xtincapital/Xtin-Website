// Title row used by every Backtest page below the tab strip.
export default function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <div className="xt-eyebrow">{eyebrow}</div>}
        <h1 className="text-3xl md:text-4xl mt-1 font-display font-semibold tracking-[-0.025em]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
