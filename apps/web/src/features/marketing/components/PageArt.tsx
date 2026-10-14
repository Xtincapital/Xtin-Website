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
