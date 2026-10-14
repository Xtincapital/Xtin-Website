// The floating "ask the AI" launcher (Journal's AI Coach).
//
// An expanding launcher, as in the Journal concept: a solid brand-green round
// button with the AI mark and a soft breathing ring. On hover or keyboard
// focus it slides open into a pill with a two-line label ("AI Coach /
// Review your trades"). Pressing it squeezes slightly. On touch screens it
// stays a round button. Motion is switched off for reduced-motion users.
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
  "ai-launcher group fixed bottom-6 right-5 z-50 inline-flex h-14 items-center rounded-full bg-brand-fill text-white no-underline shadow-[0_12px_30px_-8px_rgb(var(--brand)/0.6)] transition-[transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-[0_18px_40px_-10px_rgb(var(--brand)/0.7)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const AiLauncherInner = ({ label, sub = "Ask anything" }: { label: string; sub?: string }) => (
  <span className="flex h-full items-center">
    <span className="relative grid h-14 w-14 shrink-0 place-items-center">
      {/* Breathing ring: a gentle hint that the coach is there, not a notification. */}
      <span className="ai-launcher-ring pointer-events-none absolute inset-0 rounded-full" aria-hidden="true" />
      <AiMark className="relative h-6 w-6 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[-8deg] group-hover:scale-110" />
    </span>
    {/* The label slides out on hover / focus (pointer devices only). */}
    <span className="grid max-w-0 overflow-hidden whitespace-nowrap text-left leading-tight opacity-0 transition-[max-width,opacity,padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)]:group-hover:max-w-[12rem] [@media(hover:hover)]:group-hover:pr-5 [@media(hover:hover)]:group-hover:opacity-100 group-focus-visible:max-w-[12rem] group-focus-visible:pr-5 group-focus-visible:opacity-100">
      <span className="text-sm font-bold tracking-tight">{label}</span>
      <span className="text-xs font-normal text-white/80">{sub}</span>
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
