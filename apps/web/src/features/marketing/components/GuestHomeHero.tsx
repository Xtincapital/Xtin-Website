import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ─── 9 modules evenly spaced (40° apart) on a circle of radius 39 around center (50,50) ─── */
const modules: {
  id: string;
  label: string;
  tag: string;
  link: string;
  iconBg: string;
  icon: React.ReactNode;
  x: number;
  y: number;
  isExternal?: boolean;
}[] = [
  {
    id: 'algo',
    label: 'Algo Trading',
    tag: 'Trading',
    link: '/intro/algorithms',
    iconBg: 'from-emerald-400 to-green-500',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    x: 50, y: 11,
  },
  {
    id: 'gini',
    label: 'Gini AI',
    tag: 'AI Advisor',
    link: '/intro/gini',
    iconBg: 'from-violet-400 to-purple-500',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    x: 85, y: 25,
  },
  {
    id: 'fundakamental',
    label: 'Fundakamental',
    tag: 'Research',
    link: '/intro/fundakamental',
    iconBg: 'from-lime-400 to-emerald-500',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.52l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    x: 88, y: 55,
  },
  {
    id: 'tools',
    label: 'Tools',
    tag: 'Calculators',
    link: '/intro/tools',
    iconBg: 'from-amber-400 to-orange-500',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    x: 65, y: 85,
  },
  {
    id: 'learn',
    label: 'Learn',
    tag: 'Courses',
    link: '/intro/learn',
    iconBg: 'from-teal-400 to-emerald-500',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    x: 35, y: 85,
  },
  {
    id: 'journal',
    label: 'Journal',
    tag: 'Trade Log',
    link: '/intro/journal',
    iconBg: 'from-sky-400 to-indigo-500',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
    x: 12, y: 55,
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    tag: 'Insights',
    link: '/intro/newsletter',
    iconBg: 'from-fuchsia-400 to-pink-500',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" />
      </svg>
    ),
    x: 15, y: 25,
  },
];

const ORBIT_R = 39; // dashed orbit radius (cards are centered on this ring)

const EcosystemDiagram = ({ hoveredNode, setHoveredNode, mounted }) => (
  <motion.div
    className="relative w-[330px] h-[330px] min-[420px]:w-[390px] min-[420px]:h-[390px] sm:w-[560px] sm:h-[560px] md:w-[640px] md:h-[640px] xl:w-[700px] xl:h-[700px] max-w-[94vw] max-h-[94vw]"
    initial={{ opacity: 0, scale: 0.92 }}
    animate={mounted ? { opacity: 1, scale: 1 } : {}}
    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
  >
    {/* ── SVG layer: dashed orbit ring + straight spoke lines ── */}
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Single large dashed orbit boundary — shifted right */}
      <circle
        cx="60" cy="55" r={ORBIT_R}
        fill="none"
        stroke="#94a3b8"
        strokeOpacity="0.5"
        strokeWidth="0.5"
        strokeDasharray="3 2.5"
      />

      {/* Straight dashed spokes: center node edge → card edge */}
      {modules.map((mod, i) => {
        const dx = mod.x - 50;
        const dy = mod.y - 50;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const ux = dx / dist;
        const uy = dy / dist;
        const x1 = (60 + 12 * ux).toFixed(2);
        const y1 = (55 + 12 * uy).toFixed(2);
        const x2 = (mod.x - 9 * ux + 10).toFixed(2);
        const y2 = (mod.y - 9 * uy + 5).toFixed(2);
        return (
          <line
            key={mod.id}
            x1={x1} y1={y1}
            x2={x2} y2={y2}
            stroke={hoveredNode === mod.id ? '#10b981' : '#94a3b8'}
            strokeOpacity={hoveredNode === mod.id ? 0.85 : 0.4}
            strokeWidth={hoveredNode === mod.id ? '0.45' : '0.3'}
            strokeDasharray="2.5 2"
            style={{ transition: 'stroke 0.25s, stroke-opacity 0.25s, stroke-width 0.25s' }}
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0" to="-9"
              dur={`${3 + i * 0.25}s`}
              repeatCount="indefinite"
            />
          </line>
        );
      })}
    </svg>

    {/* ── Center node ── */}
    <div
      className="absolute z-30"
      style={{ left: '60%', top: '55%', transform: 'translate(-50%, -50%)' }}
    >
      <motion.div
        className="absolute inset-0 -m-5 rounded-full border border-emerald-200/60 dark:border-emerald-700/50"
        animate={{ scale: [1, 1.22, 1], opacity: [0.45, 0, 0.45] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="relative w-20 h-20 min-[420px]:w-24 min-[420px]:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-700"
        style={{ boxShadow: '0 0 0 6px rgba(16,185,129,0.06), 0 8px 32px rgba(16,185,129,0.14), 0 2px 8px rgba(0,0,0,0.06)' }}
        animate={{
          boxShadow: [
            '0 0 0 6px rgba(16,185,129,0.06), 0 8px 32px rgba(16,185,129,0.14), 0 2px 8px rgba(0,0,0,0.06)',
            '0 0 0 10px rgba(16,185,129,0.04), 0 12px 40px rgba(16,185,129,0.20), 0 4px 12px rgba(0,0,0,0.08)',
            '0 0 0 6px rgba(16,185,129,0.06), 0 8px 32px rgba(16,185,129,0.14), 0 2px 8px rgba(0,0,0,0.06)',
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="text-center select-none">
          <span className="block text-base min-[420px]:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100 leading-none">
            Xtin
          </span>
          <span className="block text-base min-[420px]:text-lg sm:text-xl md:text-2xl font-bold text-emerald-500 dark:text-emerald-400 leading-none mt-0.5">
            Capital
          </span>
        </div>
      </motion.div>
    </div>

    {/* ── Orbit cards ── */}
    {modules.map((mod, i) => (
      <motion.div
        key={mod.id}
        className="absolute z-20"
        style={{ left: `${mod.x}%`, top: `${mod.y}%`, transform: 'translate(-50%, -50%)' }}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={mounted ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.45, delay: 0.4 + i * 0.07, type: 'spring', stiffness: 240, damping: 19 }}
        onMouseEnter={() => setHoveredNode(mod.id)}
        onMouseLeave={() => setHoveredNode(null)}
      >
        {mod.isExternal ? (
          <a href={mod.link} target="_blank" rel="noopener noreferrer" className="block focus:outline-none">
            <motion.div
              className={`flex items-center bg-white dark:bg-slate-900 rounded-2xl border transition-colors duration-200 p-2 sm:p-2.5 ${
                hoveredNode === mod.id
                  ? 'border-emerald-300 dark:border-emerald-500 shadow-[0_6px_24px_rgba(16,185,129,0.18)]'
                  : 'border-slate-100 dark:border-slate-700 shadow-[0_4px_18px_rgba(15,23,42,0.10)]'
              }`}
              whileHover={{ scale: 1.06, y: -3 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            >
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${mod.iconBg} flex items-center justify-center text-white flex-shrink-0`}
              >
                {mod.icon}
              </div>
              <div className="hidden sm:flex flex-col justify-center ml-2.5 mr-1.5 min-w-0">
                <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 leading-none mb-[3px] whitespace-nowrap">
                  {mod.tag}
                </span>
                <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight whitespace-nowrap">
                  {mod.label}
                </span>
              </div>
            </motion.div>
          </a>
        ) : (
          <Link to={mod.link} className="block focus:outline-none">
            <motion.div
              className={`flex items-center bg-white dark:bg-slate-900 rounded-2xl border transition-colors duration-200 p-2 sm:p-2.5 ${
                hoveredNode === mod.id
                  ? 'border-emerald-300 dark:border-emerald-500 shadow-[0_6px_24px_rgba(16,185,129,0.18)]'
                  : 'border-slate-100 dark:border-slate-700 shadow-[0_4px_18px_rgba(15,23,42,0.10)]'
              }`}
              whileHover={{ scale: 1.06, y: -3 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            >
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${mod.iconBg} flex items-center justify-center text-white flex-shrink-0`}
              >
                {mod.icon}
              </div>
              <div className="hidden sm:flex flex-col justify-center ml-2.5 mr-1.5 min-w-0">
                <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 leading-none mb-[3px] whitespace-nowrap">
                  {mod.tag}
                </span>
                <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight whitespace-nowrap">
                  {mod.label}
                </span>
              </div>
            </motion.div>
          </Link>
        )}
      </motion.div>
    ))}
  </motion.div>
);

const GuestHomeHero = () => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative bg-white dark:bg-slate-950 py-10 sm:py-12 md:py-16 px-4 sm:px-6 md:px-12 lg:px-20 mt-16 overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-[0.78fr_1.22fr] gap-8 md:gap-10 xl:gap-12 items-center">

          {/* ── Left: text ── */}
          <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-900/25 px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-4 sm:mb-5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Built for modern Indian investors
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.85rem] font-bold leading-[1.08] text-gray-950 dark:text-slate-100 mb-3 sm:mb-4 max-w-xl">
              The Xtin Capital{' '}
              <span className="text-emerald-600 dark:text-emerald-400">Ecosystem</span>
            </h1>
            <p className="text-gray-600 dark:text-slate-300 text-sm sm:text-base md:text-lg leading-6 sm:leading-7 mb-5 sm:mb-6 max-w-xl">
              Invest, learn, and grow with algo trading, AI tools, and structured
              courses. One integrated platform for the modern Indian investor.
            </p>



            <div className="flex flex-col min-[420px]:flex-row gap-3 justify-center lg:justify-start mb-5">
              <a
                href="https://t.me/MarketXtin"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-emerald-600/15 transition"
              >
                Join Telegram Community
              </a>
              <Link
                to="/login"
                className="inline-flex items-center justify-center border border-gray-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold px-6 py-3 rounded-lg transition"
              >
                Get Started
              </Link>
            </div>

            {/* ── Mobile-only module grid (hidden on desktop) ── */}
            <div className="lg:hidden grid grid-cols-3 gap-2.5 mb-5">
              {modules.map((mod) => (
                <Link
                  key={mod.id}
                  to={mod.link}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-3 active:scale-95 transition-transform"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.iconBg} flex items-center justify-center text-white flex-shrink-0`}>
                    {mod.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 text-center leading-tight whitespace-nowrap">
                    {mod.label}
                  </span>
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start text-sm font-medium text-gray-500 dark:text-slate-400">
              {['SEBI Regulated', 'India Focused', 'Free Tools'].map((label) => (
                <span key={label} className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: ecosystem diagram (desktop only) ── */}
          <div className="hidden lg:flex justify-end items-center min-w-0 overflow-visible">
            <EcosystemDiagram
              hoveredNode={hoveredNode}
              setHoveredNode={setHoveredNode}
              mounted={mounted}
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default GuestHomeHero;
