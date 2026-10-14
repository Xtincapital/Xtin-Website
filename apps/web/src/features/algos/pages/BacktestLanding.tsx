import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../contexts/AuthContext';
import SignInModal from '../../../components/SignInModal';
import useRegion from '../../../hooks/useRegion';

// Region-natural showcase figures (not FX-converted — each region gets clean,
// believable demo numbers in its own currency).
const BACKTEST_SHOWCASE = {
  IN:     { capital: '₹1,00,000', ret: '+18.4%', symbol: 'NIFTY' },
  US:     { capital: '$10,000',   ret: '+18.4%', symbol: 'SPY' },
  GB:     { capital: '£10,000',   ret: '+18.4%', symbol: 'FTSE' },
  EU:     { capital: '€10,000',   ret: '+18.4%', symbol: 'DAX' },
  AE:     { capital: '$10,000',   ret: '+18.4%', symbol: 'SPY' },
  SG:     { capital: 'S$10,000',  ret: '+18.4%', symbol: 'STI' },
  GLOBAL: { capital: '$10,000',   ret: '+18.4%', symbol: 'SPY' },
};

const FEATURES = [
  {
    title: 'Backtest by chatting',
    desc: 'Describe a strategy in plain English — "buy when RSI drops below 30, 2% stop" — and get a full quant report in seconds. No code.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l.8-4A7.94 7.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    ),
  },
  {
    title: 'Real market data',
    desc: 'Test on years of historical candles across equities, indices and options structures — straddles, strangles, iron condors.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M9 17V9m4 8V5m4 12v-6" />
    ),
  },
  {
    title: 'AI that remembers',
    desc: 'Iterate on any idea — "tighten the stop to 1%", "make it a short" — and it keeps the rest of your strategy intact.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
  },
  {
    title: 'Personalised to you',
    desc: 'Set your risk profile and capital — the engine sizes stops and targets to how you actually trade.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
];

const BacktestLanding = () => {
  const { user } = useAuth();
  const { region } = useRegion();
  const show = BACKTEST_SHOWCASE[region] || BACKTEST_SHOWCASE.GLOBAL;
  const [isVisible, setIsVisible] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { value: '10+', label: 'Indicators' },
    { value: '<1s', label: 'Per Backtest' },
    { value: '100%', label: 'No-Code' },
    { value: 'Free', label: 'To Start' },
  ];

  // Gate the external launch behind sign-in, matching the other sub-apps.
  const handleLaunch = (e) => {
    if (!user) {
      e.preventDefault();
      setShowSignInModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 transition-colors duration-300">
      <Navbar />

      {/* Subtle Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(31, 169, 120, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(31, 169, 120, 0.4) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-teal-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-emerald-400/5 rounded-full blur-[80px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left Content */}
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-emerald-700">AI-Powered Backtesting</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-display font-normal mb-6 leading-tight tracking-[-0.015em]">
                <span className="text-gray-900">Backtest any trade</span>
                <br />
                <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  by chatting with AI
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-xl">
                Describe a strategy in plain English and get a full quant report on years of
                real market data — <span className="text-emerald-600 font-medium">no code, in seconds</span>.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  to="/backtest/app"
                  onClick={handleLaunch}
                  className="group relative inline-flex items-center justify-center px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center">
                    {user ? 'Launch Backtest' : 'Sign in to launch'}
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl md:text-3xl font-semibold tabular-nums tracking-[-0.02em] text-gray-900">{s.value}</div>
                    <div className="text-xs md:text-sm text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: chat-to-report mock */}
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-emerald-500/10 overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-sm font-medium text-gray-500">Xtin Backtest</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-emerald-600 px-4 py-2.5 text-sm text-white">
                      Buy {show.symbol} when RSI drops below 30, 2% stop, {show.capital}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 text-sm text-gray-700">
                      Done — over the last year this was profitable ✅
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="rounded-lg bg-white border border-gray-200 px-2 py-1.5 text-center">
                          <div className="text-emerald-600 font-bold">{show.ret}</div>
                          <div className="text-[10px] text-gray-400">Return</div>
                        </div>
                        <div className="rounded-lg bg-white border border-gray-200 px-2 py-1.5 text-center">
                          <div className="text-gray-900 font-bold">1.62</div>
                          <div className="text-[10px] text-gray-400">Sharpe</div>
                        </div>
                        <div className="rounded-lg bg-white border border-gray-200 px-2 py-1.5 text-center">
                          <div className="text-gray-900 font-bold">61%</div>
                          <div className="text-[10px] text-gray-400">Win rate</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Tighten the stop to 1%', 'Try it on 15m', 'Make it a short'].map((s) => (
                      <span key={s} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-normal text-gray-900 tracking-[-0.015em]">Everything you need to test an idea</h2>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
              A research desk in a chat box — from first hypothesis to a report you can trust.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{f.icon}</svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 px-8 py-14 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-display font-normal tracking-[-0.015em]">Know before you trade.</h2>
          <p className="mx-auto mt-3 max-w-xl text-emerald-50">
            Sign in with your free Xtin account and backtest your first idea in under a minute — no code.
          </p>
          <Link
            to="/backtest/app"
            onClick={handleLaunch}
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 font-semibold text-emerald-700 hover:bg-emerald-50 transition"
          >
            {user ? 'Open the playground' : 'Sign in to start backtesting'}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />

      {showSignInModal && (
        <SignInModal
          isOpen={showSignInModal}
          onClose={() => setShowSignInModal(false)}
          onSuccess={() => setShowSignInModal(false)}
          headline="Sign in to launch Backtest"
          description="Sign in (or create a free account) to start backtesting strategies with AI."
        />
      )}
    </div>
  );
};

export default BacktestLanding;
