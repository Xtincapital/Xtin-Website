import React from 'react';
import ProductArt from './ProductArt';

/* Shared visual kit for the public /intro/* pages (brand-token based, light + dark). */

/** Soft glow + brand-tinted dotted grid. Parent must be `relative overflow-hidden`. */
export const IntroBackdrop = ({ dots = true }: { dots?: boolean }) => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0">
    <div className="absolute left-1/2 -top-24 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-brand-soft opacity-80 blur-[110px]" />
    {dots && (
      <div className="absolute inset-0 text-brand opacity-[0.14] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000,transparent_70%)]" />
    )}
  </div>
);

/** Dotted texture + glow for solid-green CTA panels (parent: `relative overflow-hidden`). */
export const CtaTexture = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0">
    <div className="absolute inset-0 text-white opacity-[0.16] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000,transparent_72%)]" />
    <div className="absolute left-1/2 -top-1/2 h-72 w-[34rem] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
  </div>
);

/** Large illustrated tile shown above a hero title (same treatment as the product tiles). */
export const IntroHeroArt = ({ id }: { id: string }) => (
  <div className="relative mx-auto mb-7 h-28 w-28">
    <style>{`
      @keyframes ih-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      .ih-float { animation: ih-float 5s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) { .ih-float { animation: none; } }
    `}</style>
    <span className="absolute inset-0 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-soft via-brand-soft/60 to-transparent ring-1 ring-brand-line/70">
      <span aria-hidden="true" className="absolute inset-0 text-brand opacity-50 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:12px_12px] [mask-image:radial-gradient(circle_at_70%_15%,#000,transparent_65%)]" />
      <span aria-hidden="true" className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-fill/25 blur-2xl" />
    </span>
    <span className="ih-float absolute inset-3 text-brand drop-shadow-sm"><ProductArt id={id} /></span>
  </div>
);

/** Tailwind classes for a feature icon tile. */
export const ICON_TILE = 'bg-gradient-to-br from-brand-soft to-transparent ring-1 ring-brand-line/70 text-brand shadow-sm';
