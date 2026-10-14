// The floating "ask the AI" launcher used by Journal (AI Coach) and Gini.
//
// A dark glass pill with a thin emerald-to-gold gradient edge, a chat-bubble
// mark with a spark inside, and a two-line label ("AI Coach / Ask anything").
// On phones it collapses to just the round mark.
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/** Chat bubble with a four-point spark inside. */
export function AiMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M5 4.5h14a2.5 2.5 0 0 1 2.5 2.5v8a2.5 2.5 0 0 1-2.5 2.5h-6.2l-4 3.2c-.5.4-1.3 0-1.3-.7v-2.5H5A2.5 2.5 0 0 1 2.5 15V7A2.5 2.5 0 0 1 5 4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 7.6c.35 2.3 1.1 3.05 3.4 3.4-2.3.35-3.05 1.1-3.4 3.4-.35-2.3-1.1-3.05-3.4-3.4 2.3-.35 3.05-1.1 3.4-3.4Z" fill="currentColor" />
    </svg>
  );
}

export const AI_LAUNCHER_CLASS =
  "group fixed bottom-6 right-5 z-50 inline-flex items-center rounded-full bg-gradient-to-br from-emerald-400 via-teal-300 to-amber-300 p-[1.5px] no-underline shadow-[0_10px_30px_-6px_rgba(10, 10, 11,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_-6px_rgba(31, 169, 120,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2";

export const AiLauncherInner = ({ label, sub = "Ask anything" }: { label: string; sub?: string }) => (
  <span className="flex items-center gap-3 rounded-full bg-[#0A0A0B]/95 py-1.5 pl-1.5 pr-1.5 text-white backdrop-blur sm:pr-5">
    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/25 to-teal-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-300/30">
      <AiMark className="h-6 w-6" />
      <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0A0A0B] bg-emerald-400" />
    </span>
    <span className="hidden text-left leading-tight sm:block">
      <span className="block text-sm font-semibold tracking-tight">{label}</span>
      <span className="block text-[11px] font-normal text-slate-400">{sub}</span>
    </span>
  </span>
);

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  sub?: string;
}

const AiLauncher = forwardRef<HTMLButtonElement, Props>(function AiLauncher({ label, sub, className, ...rest }, ref) {
  return (
    <button ref={ref} type="button" aria-label={label} title={label} className={cn(AI_LAUNCHER_CLASS, className)} {...rest}>
      <AiLauncherInner label={label} sub={sub} />
    </button>
  );
});

export default AiLauncher;
