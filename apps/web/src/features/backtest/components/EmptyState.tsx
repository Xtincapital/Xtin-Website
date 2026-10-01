import type { LucideIcon } from "lucide-react";
import { card } from "../lib/styles";

export default function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className={`${card} relative overflow-hidden px-6 py-16 text-center`}>
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
      <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 ring-1 ring-emerald-200 dark:from-emerald-500/20 dark:to-teal-500/10 dark:ring-emerald-400/20">
        <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
      </span>
      <h2 className="relative mt-4 text-lg font-semibold">{title}</h2>
      <p className="relative mx-auto mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">{text}</p>
      {action && <div className="relative mt-6 flex justify-center gap-2">{action}</div>}
    </div>
  );
}
