import { Link } from 'react-router-dom';
import { ArrowUpRight, LifeBuoy, Mail, Receipt, UserRound } from 'lucide-react';

const SHORTCUTS = [
  { to: '/dashboard', label: 'Account & plans', hint: 'Profile, Pro and bundles', Icon: UserRound },
  { to: '/billing', label: 'Billing', hint: 'Payments and receipts', Icon: Receipt },
  { to: '/help', label: 'Help center', hint: 'Answers to common questions', Icon: LifeBuoy },
  { to: '/contact', label: 'Contact us', hint: 'Talk to a real person', Icon: Mail },
];

export default function CommunityBand() {
  return (
    <section aria-labelledby="xp-community-title" className="xp-band brand-on-dark relative overflow-hidden rounded-[2rem] border border-transparent px-6 py-12 dark:border-white/10 md:px-12 md:py-16">
      <div aria-hidden="true" className="xp-dots absolute inset-0" />
      <div aria-hidden="true" className="xp-blob -left-24 -top-24 h-80 w-80 opacity-70" />
      <div aria-hidden="true" className="xp-blob -bottom-32 right-10 h-96 w-96 opacity-50" />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-amber-300">Built in Surat, for every Indian</p>
          <h2 id="xp-community-title" className="mt-3 text-3xl font-bold leading-tight tracking-[-0.025em] text-white md:text-4xl">
            India won political freedom in 1947. <span className="text-white/50">The next one is</span> <span className="text-brand">financial freedom.</span>
          </h2>
          <p className="mt-4 max-w-lg text-base text-white/70">
            Ask questions, share what you are learning and hear about new features first in the Xtin community on Telegram.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="https://t.me/MarketXtin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-fill px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-hover"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              Join on Telegram
            </a>
            <Link to="/about" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white/90 transition hover:border-white/30 hover:bg-white/5">
              Our story
            </Link>
          </div>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {SHORTCUTS.map(({ to, label, hint, Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className="group flex h-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-brand/50 hover:bg-white/[0.07]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition-colors group-hover:bg-brand-fill">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-sm font-bold text-white">
                    {label}
                    <ArrowUpRight className="h-3.5 w-3.5 text-white/40 transition group-hover:text-brand" aria-hidden="true" />
                  </span>
                  <span className="mt-0.5 block text-xs text-white/60">{hint}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
