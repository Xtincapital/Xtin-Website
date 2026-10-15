import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { CalendarDays, Building2 } from 'lucide-react';

/* Shared visual pieces for the public (logged-out) pages. Brand-token based, so they follow light/dark. */

const DotGrid = () => (
  <span
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 text-brand opacity-[0.18] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000,transparent_70%)]"
  />
);

/** Soft glow + dotted grid, for the top of a page section. Parent must be `relative overflow-hidden`. */
export const PageBackdrop = () => (
  <>
    <DotGrid />
    <span aria-hidden="true" className="pointer-events-none absolute left-1/2 -top-24 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-brand-soft blur-3xl opacity-80" />
  </>
);

/** Rounded icon tile with ring + glow. */
export const IconBadge = ({ Icon, className = '' }: { Icon: LucideIcon; className?: string }) => (
  <span className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-soft to-transparent ring-1 ring-brand-line text-brand shadow-sm ${className}`}>
    <span aria-hidden="true" className="absolute -right-3 -top-3 h-10 w-10 rounded-full bg-brand-fill/25 blur-xl" />
    <Icon className="relative h-7 w-7" strokeWidth={1.8} />
  </span>
);

/** Header for policy / legal pages. */
export const LegalHeader = ({
  Icon, title, entity, updated,
}: { Icon: LucideIcon; title: string; entity?: string; updated: string }) => (
  <header className="relative mb-10">
    <span aria-hidden="true" className="pointer-events-none absolute -left-16 -top-12 h-48 w-80 rounded-full bg-brand-soft blur-3xl opacity-80" />
    <div className="relative flex items-start gap-5">
      <IconBadge Icon={Icon} className="shrink-0 mt-1" />
      <div>
        <h1 className="xt-title mb-3">{title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          {entity && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/60 px-3 py-1 text-gray-600">
              <Building2 className="h-3.5 w-3.5 text-brand" /> {entity}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-line bg-brand-soft px-3 py-1 text-brand">
            <CalendarDays className="h-3.5 w-3.5" /> Last updated on {updated}
          </span>
        </div>
      </div>
    </div>
  </header>
);

/** 404 artwork: a chart line that runs off the edge, with a compass. */
export const NotFoundArt = () => (
  <svg viewBox="0 0 320 160" fill="none" className="mx-auto mb-6 h-40 w-auto text-brand" role="img" aria-label="Lost chart illustration">
    <style>{`
      @keyframes nf-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      @keyframes nf-spin { 0%,100% { transform: rotate(-18deg); } 50% { transform: rotate(24deg); } }
      @keyframes nf-dash { to { stroke-dashoffset: -24; } }
      .nf-float { animation: nf-float 5s ease-in-out infinite; }
      .nf-needle { animation: nf-spin 4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
      .nf-dash { animation: nf-dash 2s linear infinite; }
      @media (prefers-reduced-motion: reduce) { .nf-float,.nf-needle,.nf-dash { animation: none; } }
    `}</style>
    <ellipse cx="160" cy="148" rx="110" ry="7" fill="currentColor" opacity=".12"/>
    {/* grid */}
    <g stroke="currentColor" strokeOpacity=".14" strokeWidth="1">{[40,70,100,130].map(y => <path key={y} d={`M24 ${y}H296`}/>)}{[60,110,160,210,260].map(x => <path key={x} d={`M${x} 24V136`}/>)}</g>
    {/* axis */}
    <path d="M24 24V136H296" stroke="currentColor" strokeOpacity=".4" strokeWidth="2.5" strokeLinecap="round"/>
    {/* line that wanders then drops off */}
    <path d="M30 112 L78 92 L116 104 L158 68 L196 80 L226 46" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M226 46 L262 36 L296 22" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="2 10" className="nf-dash"/>
    {[[78,92],[116,104],[158,68],[196,80]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="4.5" fill="var(--card, #fff)" stroke="currentColor" strokeWidth="2.5"/>)}
    {/* compass */}
    <g className="nf-float">
      <circle cx="250" cy="96" r="30" fill="var(--card, #fff)" stroke="currentColor" strokeWidth="3.5"/>
      <circle cx="250" cy="96" r="23" stroke="currentColor" strokeOpacity=".3" strokeWidth="1.5"/>
      <path d="M250 70v5M250 117v5M224 96h5M271 96h5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <g className="nf-needle"><path d="M250 80l7 16h-14z" fill="currentColor"/><path d="M250 112l-7-16h14z" fill="currentColor" fillOpacity=".3"/></g>
      <circle cx="250" cy="96" r="3" fill="currentColor"/>
    </g>
    <path d="M60 30l1.800 4.600 4.600 1.800-4.600 1.800L60 43l-1.800-4.800-4.600-1.800 4.600-1.800z" fill="currentColor" opacity=".7"/>
  </svg>
);

/* ─── Auth hero artwork (login / signup / forgot / reset) ─── */
const C = 'currentColor';
const AuthScene = ({ variant }: { variant: 'login' | 'signup' | 'forgot' | 'reset' }) => {
  const p = { viewBox: '0 0 120 120', fill: 'none', className: 'h-full w-full', 'aria-hidden': true } as const;
  if (variant === 'login') {
    return (
      <svg {...p}>
        {/* shield */}
        <path d="M60 10 L96 24 V58 C96 82 80 100 60 110 C40 100 24 82 24 58 V24Z" fill={C} fillOpacity=".12" stroke={C} strokeWidth="3.5" strokeLinejoin="round"/>
        <path d="M60 20 L88 31 V58 C88 77 75 92 60 100 C45 92 32 77 32 58 V31Z" stroke={C} strokeOpacity=".3" strokeWidth="1.5"/>
        {/* keyhole */}
        <circle cx="60" cy="52" r="10" fill={C}/><path d="M55 58 L52 78 H68 L65 58Z" fill={C}/>
        <circle cx="60" cy="52" r="4" fill="var(--card, #fff)"/>
        {/* rising chart inside */}
        <path d="M38 86 L48 80 L55 84 L66 72 L80 66" stroke={C} strokeOpacity=".55" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M100 18l2 5 5 2-5 2-2 5-2-5-5-2 5-2z M18 92l1.600 4 4 1.600-4 1.600-1.600 4-1.600-4-4-1.600 4-1.600z" fill={C}/>
      </svg>
    );
  }
  if (variant === 'signup') {
    return (
      <svg {...p}>
        {/* ID card */}
        <rect x="14" y="26" width="76" height="54" rx="9" fill="var(--card, #fff)" stroke={C} strokeWidth="3.5"/>
        <rect x="14" y="26" width="76" height="14" rx="9" fill={C} fillOpacity=".2"/>
        <circle cx="38" cy="58" r="9" fill={C}/><path d="M22 78 q16 -20 32 0Z" fill={C} fillOpacity=".7"/>
        <path d="M62 54h20M62 63h14M62 72h18" stroke={C} strokeOpacity=".55" strokeWidth="3" strokeLinecap="round"/>
        {/* rocket */}
        <g transform="translate(78 8) rotate(24 20 30)">
          <path d="M20 4 C30 14 30 32 26 44 H14 C10 32 10 14 20 4Z" fill="var(--card, #fff)" stroke={C} strokeWidth="3" strokeLinejoin="round"/>
          <circle cx="20" cy="22" r="5" fill={C}/>
          <path d="M14 36 L6 46 L14 44Z M26 36 L34 46 L26 44Z" fill={C}/>
          <path d="M16 48 q4 12 8 0" fill={C} fillOpacity=".5"/>
        </g>
        <path d="M22 100 L38 92 L50 96 L66 84 L90 76" stroke={C} strokeOpacity=".5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 7"/>
        <circle cx="90" cy="76" r="4" fill={C}/>
      </svg>
    );
  }
  if (variant === 'forgot') {
    return (
      <svg {...p}>
        <circle cx="42" cy="56" r="22" fill={C} fillOpacity=".12" stroke={C} strokeWidth="3.5"/>
        <circle cx="42" cy="56" r="8" fill="var(--card, #fff)" stroke={C} strokeWidth="3"/>
        <path d="M60 64 L104 92 M88 82 l-6 8 M98 88 l-6 8" stroke={C} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M30 22 q12 -14 28 -6" stroke={C} strokeOpacity=".5" strokeWidth="3" strokeLinecap="round"/><path d="M58 12 l2 8 -8 -1z" fill={C} fillOpacity=".7"/>
        <path d="M92 20l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill={C}/>
        <rect x="16" y="88" width="42" height="22" rx="5" fill="var(--card, #fff)" stroke={C} strokeWidth="2.5"/><path d="M18 92l19 11 19-11" stroke={C} strokeWidth="2.5" strokeLinejoin="round"/>
      </svg>
    );
  }
  return (
    <svg {...p}>
      <path d="M36 54 V40 a24 24 0 0 1 48 0 V54" stroke={C} strokeWidth="5" strokeLinecap="round"/>
      <rect x="22" y="52" width="76" height="54" rx="12" fill={C} fillOpacity=".14" stroke={C} strokeWidth="3.5"/>
      <circle cx="60" cy="76" r="7" fill={C}/><path d="M57 80 h6 l2 14 h-10z" fill={C}/>
      <path d="M96 22 a16 16 0 0 1 8 14 M104 36 l-1 -9 -8 4" stroke={C} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 30l1.600 4 4 1.600-4 1.600-1.600 4-1.600-4-4-1.600 4-1.600z" fill={C}/>
    </svg>
  );
};

/** Large illustrated tile shown above the title on auth pages (same treatment as the product tiles). */
export const AuthHero = ({ variant }: { variant: 'login' | 'signup' | 'forgot' | 'reset' }) => (
  <div className="relative mx-auto mb-6 h-32 w-32">
    <style>{`
      @keyframes ah-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      .ah-float { animation: ah-float 5s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) { .ah-float { animation: none; } }
    `}</style>
    <span className="absolute inset-0 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-soft via-brand-soft/60 to-transparent ring-1 ring-brand-line/70">
      <span aria-hidden="true" className="absolute inset-0 text-brand opacity-50 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:12px_12px] [mask-image:radial-gradient(circle_at_70%_15%,#000,transparent_65%)]" />
      <span aria-hidden="true" className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-fill/25 blur-2xl" />
    </span>
    <span className="ah-float absolute inset-3 text-brand drop-shadow-sm">
      <AuthScene variant={variant} />
    </span>
  </div>
);
