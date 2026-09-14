import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import newsletterService from '../../../services/newsletterService';
import newsletterPlanService from '../services/newsletterPlanService';
import SEO from '../../../components/SEO';
import { useAuth } from '../../../contexts/AuthContext';
import useRegion from '../../../hooks/useRegion';
import {
  isNewsletterPro,
  subscribeNewsletterPlan,
  newsletterPricing,
  formatNewsletterPrice,
  MARKETS,
  EDITIONS,
  FREE_ARCHIVE_LIMIT,
  getMarketPref,
  saveMarketPref,
  visibleArchiveCount,
} from '../lib/newsletterPlan';
import NewsletterTour from '../components/NewsletterTour';
import NewsletterUpgradeModal from '../components/NewsletterUpgradeModal';
import NewsletterProCelebration from '../components/NewsletterProCelebration';
import { FaCrown, FaSun, FaMoon, FaLock, FaCheck } from 'react-icons/fa';

// Premium Phone Mockup with Newsletter Preview - Finshots-style
const PhoneMockup = () => (
  <div className="relative">
    {/* Decorative background circle */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-[420px] h-[420px] rounded-full bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-slate-900"></div>
    </div>

    {/* Decorative dots pattern */}
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute right-0 top-1/4 w-32 h-32 text-green-200/40" viewBox="0 0 100 100">
        {[...Array(5)].map((_, row) =>
          [...Array(5)].map((_, col) => (
            <circle key={`${row}-${col}`} cx={10 + col * 20} cy={10 + row * 20} r="2" fill="currentColor" />
          ))
        )}
      </svg>
    </div>

    {/* Phone SVG */}
    <svg viewBox="0 0 280 560" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative w-64 h-auto drop-shadow-2xl mx-auto">
      {/* Phone outer frame */}
      <defs>
        <linearGradient id="phoneFrame" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1f2937" />
          <stop offset="50%" stopColor="#111827" />
          <stop offset="100%" stopColor="#1f2937" />
        </linearGradient>
        <linearGradient id="screenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f9fafb" />
        </linearGradient>
        <clipPath id="screenClip">
          <rect x="16" y="16" width="248" height="528" rx="28" />
        </clipPath>
        <filter id="phoneShadow" x="-20%" y="-10%" width="140%" height="120%">
          <feDropShadow dx="0" dy="20" stdDeviation="30" floodColor="#000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Phone body */}
      <rect x="0" y="0" width="280" height="560" rx="40" fill="url(#phoneFrame)" filter="url(#phoneShadow)" />

      {/* Screen bezel */}
      <rect x="8" y="8" width="264" height="544" rx="36" fill="#000" />

      {/* Screen */}
      <g clipPath="url(#screenClip)">
        <rect x="16" y="16" width="248" height="528" fill="url(#screenGradient)" />

        {/* Status bar */}
        <rect x="16" y="16" width="248" height="32" fill="#ffffff" />
        <text x="32" y="36" fill="#1f2937" fontSize="11" fontWeight="500">9:41</text>
        <g transform="translate(210, 26)">
          {/* Signal */}
          <rect x="0" y="4" width="3" height="6" rx="1" fill="#1f2937" />
          <rect x="5" y="2" width="3" height="8" rx="1" fill="#1f2937" />
          <rect x="10" y="0" width="3" height="10" rx="1" fill="#1f2937" />
          {/* Battery */}
          <rect x="18" y="1" width="16" height="8" rx="2" stroke="#1f2937" strokeWidth="1" fill="none" />
          <rect x="34" y="3" width="2" height="4" rx="1" fill="#1f2937" />
          <rect x="20" y="3" width="10" height="4" rx="1" fill="#10b981" />
        </g>

        {/* Dynamic Island / Notch */}
        <rect x="100" y="22" width="80" height="24" rx="12" fill="#000" />

        {/* Newsletter Header */}
        <rect x="16" y="56" width="248" height="60" fill="#059669" />

        {/* Xtin Logo in header */}
        <g transform="translate(90, 70)">
          <rect x="0" y="0" width="100" height="32" rx="4" fill="transparent" />
          <text x="50" y="14" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="600" letterSpacing="2">XTIN CAPITAL</text>
          <text x="50" y="26" textAnchor="middle" fill="#ffffff" fillOpacity="0.8" fontSize="7" letterSpacing="1">MARKET BRIEF</text>
        </g>

        {/* Newsletter Title Card */}
        <rect x="28" y="128" width="224" height="110" rx="12" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />

        {/* Chart illustration in card */}
        <rect x="40" y="140" width="200" height="60" rx="8" fill="#f0fdf4" />
        <path d="M55 185 L80 170 L105 175 L130 155 L155 165 L180 145 L205 150 L225 135" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="225" cy="135" r="4" fill="#10b981" />
        {/* Trend arrow */}
        <g transform="translate(190, 145)">
          <rect x="0" y="0" width="40" height="16" rx="8" fill="#dcfce7" />
          <path d="M8 10L12 6L16 8" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <text x="22" y="11" fill="#059669" fontSize="7" fontWeight="600">+2.4%</text>
        </g>

        {/* Card title */}
        <text x="40" y="218" fill="#111827" fontSize="10" fontWeight="700">Markets Today: What Moved &amp; Why</text>
        <text x="40" y="230" fill="#6b7280" fontSize="7">Morning Brief • 3 min read</text>

        {/* Content preview cards */}
        <rect x="28" y="250" width="224" height="70" rx="10" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
        <circle cx="58" cy="285" r="18" fill="#fef3c7" />
        <text x="58" y="289" textAnchor="middle" fill="#d97706" fontSize="16">₹</text>
        <text x="88" y="275" fill="#111827" fontSize="9" fontWeight="600">RBI's Big Move</text>
        <text x="88" y="287" fill="#6b7280" fontSize="7">What it means for your</text>
        <text x="88" y="297" fill="#6b7280" fontSize="7">money, explained simply...</text>
        <rect x="200" y="270" width="40" height="24" rx="12" fill="#ecfdf5" />
        <text x="220" y="286" textAnchor="middle" fill="#059669" fontSize="8" fontWeight="600">Read</text>

        <rect x="28" y="330" width="224" height="70" rx="10" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
        <circle cx="58" cy="365" r="18" fill="#dbeafe" />
        <text x="58" y="370" textAnchor="middle" fill="#2563eb" fontSize="14">📊</text>
        <text x="88" y="355" fill="#111827" fontSize="9" fontWeight="600">Sensex at 85K</text>
        <text x="88" y="367" fill="#6b7280" fontSize="7">The story behind today's</text>
        <text x="88" y="377" fill="#6b7280" fontSize="7">market rally...</text>
        <rect x="200" y="350" width="40" height="24" rx="12" fill="#ecfdf5" />
        <text x="220" y="366" textAnchor="middle" fill="#059669" fontSize="8" fontWeight="600">Read</text>

        <rect x="28" y="410" width="224" height="70" rx="10" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
        <circle cx="58" cy="445" r="18" fill="#fce7f3" />
        <text x="58" y="450" textAnchor="middle" fill="#db2777" fontSize="14">💡</text>
        <text x="88" y="435" fill="#111827" fontSize="9" fontWeight="600">One Smart Idea</text>
        <text x="88" y="447" fill="#6b7280" fontSize="7">A simple tip to grow</text>
        <text x="88" y="457" fill="#6b7280" fontSize="7">your wealth...</text>
        <rect x="200" y="430" width="40" height="24" rx="12" fill="#ecfdf5" />
        <text x="220" y="446" textAnchor="middle" fill="#059669" fontSize="8" fontWeight="600">Read</text>

        {/* Bottom nav hint */}
        <rect x="90" y="510" width="100" height="4" rx="2" fill="#e5e7eb" />
      </g>

      {/* Side buttons */}
      <rect x="-2" y="120" width="2" height="30" rx="1" fill="#374151" />
      <rect x="-2" y="170" width="2" height="50" rx="1" fill="#374151" />
      <rect x="-2" y="230" width="2" height="50" rx="1" fill="#374151" />
      <rect x="280" y="180" width="2" height="60" rx="1" fill="#374151" />
    </svg>

    {/* Floating badge */}
    <div className="absolute -top-2 -right-2 bg-green-500 dark:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
      NEW
    </div>
  </div>
);

const Newsletter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  useRegion(); // re-render when region resolves so pricing stays correct
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newsletters, setNewsletters] = useState([]);
  const [newslettersLoading, setNewslettersLoading] = useState(true);
  const [newslettersError, setNewslettersError] = useState(null);
  const [showAllNewsletters, setShowAllNewsletters] = useState(false);
  const [activeTab, setActiveTab] = useState('newsletters'); // 'newsletters' | 'substack'
  const [substackArticles, setSubstackArticles] = useState([]);
  const [substackLoading, setSubstackLoading] = useState(true);
  const [substackError, setSubstackError] = useState(null);
  const [showAllSubstack, setShowAllSubstack] = useState(false);

  // Free/Pro + market selection
  const pricing = newsletterPricing();
  const pro = isNewsletterPro();
  const [selectedMarkets, setSelectedMarkets] = useState(() => getMarketPref());
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const [, setPlanTick] = useState(0);

  useEffect(() => {
    const unsub = subscribeNewsletterPlan(() => {
      setPlanTick((t) => t + 1);
      setSelectedMarkets(getMarketPref());
    });
    return () => { unsub(); };
  }, []);

  // Authoritative plan sync once signed in.
  useEffect(() => {
    if (user) newsletterPlanService.syncPlan();
  }, [user]);

  const openUpgrade = (reason = null) => {
    setUpgradeReason(reason);
    setShowUpgrade(true);
  };

  const handleProActivated = () => {
    setShowUpgrade(false);
    setCelebrating(true);
  };

  const toggleMarket = (id) => {
    setSelectedMarkets((prev) => {
      const next = prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id];
      const final = next.length ? next : ['IN'];
      saveMarketPref(final);
      // Non-India markets are a Pro entitlement — nudge, but keep the choice.
      if (!pro && final.some((m) => m !== 'IN')) {
        openUpgrade('US and Global editions are part of Pro — pick them here and unlock them in one step.');
      }
      // Persist server-side for signed-in users (best-effort).
      if (user) newsletterPlanService.updateMarkets(final).catch(() => { });
      return final;
    });
  };

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        setNewslettersLoading(true);
        const data = await newsletterService.getAllIndianFinanceNewsletters();
        setNewsletters(data || []);
      } catch (err) {
        setNewslettersError('Failed to fetch newsletters: ' + err.message);
      } finally {
        setNewslettersLoading(false);
      }
    };

    const fetchSubstackArticles = async () => {
      try {
        setSubstackLoading(true);
        const data = await newsletterService.getSubstackArticles();
        setSubstackArticles(data || []);
      } catch (err) {
        setSubstackError('Failed to fetch Substack articles: ' + err.message);
      } finally {
        setSubstackLoading(false);
      }
    };

    fetchNewsletters();
    fetchSubstackArticles();
  }, []);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': 'Xtin Newsletter - Financial News Made Simple',
    'description': 'Subscribe to Xtin Newsletter for daily financial news, market insights, and investment updates delivered in plain English.',
    'url': 'https://www.xtincapital.com/newsletter',
    'mainEntity': {
      '@type': 'Product',
      'name': 'Xtin Newsletter',
      'description': 'Daily financial news and market insights delivered to your inbox',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'INR',
        'availability': 'https://schema.org/InStock'
      }
    }
  };

  const handleSubscribe = async () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email || !emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      setIsError(true);
      return;
    }
    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      await newsletterService.subscribeToNewsletter(email, selectedMarkets);
      setEmail('');
      setMessage("You're in! Tonight's India wrap is on its way — check your inbox at 5 PM.");
      setIsError(false);
    } catch (err) {
      console.error('Subscription error:', err);
      const errorText = (err?.message || '').toLowerCase();
      const isAlreadyMember =
        errorText.includes('already subscribed') ||
        errorText.includes('already a member') ||
        errorText.includes('duplicate');

      if (isAlreadyMember) {
        setMessage('You are already a member of our newsletter.');
        setIsError(false);
      } else {
        setMessage('Error: Could not subscribe. Please try again.');
        setIsError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 text-gray-800 dark:text-slate-100 min-h-screen">
      <SEO
        title="Newsletter - Daily Financial News & Market Insights"
        description="Subscribe to Xtin Newsletter for daily financial news, market analysis, and investment insights delivered in plain English. Join 10,000+ subscribers."
        keywords="financial newsletter, market news, investment newsletter, stock market updates, daily finance news, trading insights India"
        canonicalUrl="/newsletter"
        structuredData={structuredData}
      />
      <Navbar />

      {/* Hero Section - Premium Editorial Style */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20" />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="max-w-xl">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100/80 dark:bg-emerald-900/30 border border-green-200/50 dark:border-emerald-700/40 mb-6">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-green-700 dark:text-emerald-300">
                  Loved by 10,000+ readers
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                Financial News{' '}
                <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  Made Simple.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-gray-600 dark:text-slate-300 leading-relaxed mb-8">
                Get the day's most important market news  before the bell at <span className="font-semibold text-gray-900 dark:text-slate-100">8 AM</span> and after close at <span className="font-semibold text-gray-900 dark:text-slate-100">5 PM</span>. In plain English. In under 3 minutes.
              </p>

              {/* Premium Subscription Box */}
              <div data-nl-tour="subscribe" className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/40 border border-gray-100 dark:border-slate-700 p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label htmlFor="newsletter-email-hero" className="sr-only">Email address</label>
                    <input
                      id="newsletter-email-hero"
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-base"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
                    />
                  </div>
                  <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className={`px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-green-600/25 hover:shadow-green-600/40 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
                      }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <>
                        <span>Subscribe Free</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>

                <p className="mt-4 text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Free forever. No spam. Unsubscribe anytime.
                </p>

                {message && (
                  <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${isError
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-green-50 text-green-600 border border-green-200'
                    }`}>
                    {isError ? message : '🎉 ' + message}
                  </div>
                )}

                {/* Pro nudge — the free box gives, then quietly points up */}
                {!pro && (
                  <button
                    onClick={() => openUpgrade(null)}
                    className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-300 hover:text-amber-700 transition-colors"
                  >
                    <FaCrown className="text-amber-500" />
                    Want the 8 AM brief + US &amp; Global? Go Pro  {formatNewsletterPrice(pricing.yearly, pricing)}/yr
                  </button>
                )}
              </div>
            </div>

            {/* Right - Phone Mockup */}
            <div className="hidden lg:flex justify-center items-center">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-y border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {['bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500'].map((bg, i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-bold text-white ${bg}`}>
                    {['A', 'R', 'S', 'K'][i]}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="font-semibold text-gray-900 dark:text-slate-100">10,000+</span>
                <span className="text-gray-600 dark:text-slate-300"> readers</span>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 hidden md:block" />

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>8 AM & 5 PM daily</span>
            </div>
          </div>
        </div>
      </section>

      {/* Editions + Markets — what you get, and how you shape it */}
      <section className="py-20 lg:py-24 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-3">
              Two briefs a day. Your markets.
            </h2>
            <p className="text-gray-600 dark:text-slate-300 max-w-xl mx-auto">
              Free readers get the evening India wrap. Pro readers get both editions, in every market they choose.
            </p>
          </div>

          {/* Editions */}
          <div data-nl-tour="editions" className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="relative rounded-2xl border border-gray-100 dark:border-slate-700 bg-gradient-to-br from-amber-50/60 to-white dark:from-amber-900/10 dark:to-slate-900 p-6">
              {!pro && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                  <FaCrown className="text-[9px]" /> PRO
                </span>
              )}
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                <FaSun className="text-amber-500 text-xl" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Pre-Market Brief</h3>
                <span className="text-xs font-semibold text-amber-600">8:00 AM</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Overnight moves, today's events and earnings, stocks in focus, and the key levels to watch  so you walk in ready.
              </p>
            </div>

            <div className="relative rounded-2xl border border-green-200 dark:border-emerald-700/50 bg-gradient-to-br from-green-50/60 to-white dark:from-emerald-900/10 dark:to-slate-900 p-6">
              <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-emerald-900/40 text-green-700 dark:text-emerald-300 text-[10px] font-bold">
                <FaCheck className="text-[9px]" /> FREE
              </span>
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                <FaMoon className="text-indigo-500 text-xl" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Post-Market Wrap</h3>
                <span className="text-xs font-semibold text-green-600">5:00 PM</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                What actually moved and why with numbers. Winners, losers, the day's big story, and tomorrow's watchlist.
              </p>
            </div>
          </div>

          {/* Market picker */}
          <div data-nl-tour="markets" className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Choose your markets</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  India stays free. US &amp; Global are part of Pro.
                </p>
              </div>
              {!pro && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold">
                  <FaCrown /> Pro unlocks all three
                </span>
              )}
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {MARKETS.map((m) => {
                const active = selectedMarkets.includes(m.id);
                const locked = !pro && m.id !== 'IN';
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleMarket(m.id)}
                    className={`relative p-4 rounded-xl border text-left transition-all ${active
                      ? 'border-green-500 bg-green-50 dark:bg-emerald-900/30 ring-1 ring-green-500'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-green-300'
                      }`}
                  >
                    {locked && (
                      <FaLock className="absolute top-3 right-3 text-gray-300 dark:text-slate-600 text-xs" />
                    )}
                    {active && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <FaCheck className="text-white text-[9px]" />
                      </span>
                    )}
                    <div className="text-2xl mb-1">{m.flag}</div>
                    <div className="font-bold text-gray-900 dark:text-slate-100">{m.label}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{m.blurb}</div>
                  </button>
                );
              })}
            </div>
            {pro ? (
              <p className="mt-4 text-sm text-green-600 font-medium flex items-center gap-1.5">
                <FaCrown /> You're Pro — your selections are saved and sent automatically.
              </p>
            ) : (
              <button
                onClick={() => openUpgrade('Unlock US and Global editions and get both the morning brief and evening wrap.')}
                className="mt-5 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/25 hover:shadow-xl transition-all inline-flex items-center justify-center gap-2"
              >
                <FaCrown />
                Unlock all markets  {formatNewsletterPrice(pricing.yearly, pricing)}/yr
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Archive Section - Newsletters / Substack toggle */}
      <section data-nl-tour="archive" className="py-20 lg:py-28 bg-gray-50/40 dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Switcher */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1.5 rounded-2xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('substack')}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === 'substack'
                  ? 'bg-white dark:bg-slate-950 text-green-600 dark:text-emerald-300 shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                  }`}
              >
                Substack Articles
              </button>
              <button
                onClick={() => setActiveTab('newsletters')}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'newsletters'
                  ? 'bg-white dark:bg-slate-950 text-green-600 dark:text-emerald-300 shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                  }`}
              >
                Newsletters
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-2">
                {activeTab === 'newsletters' ? 'Xtin Daily' : 'Substack Articles'}
              </h2>
              <p className="text-gray-600 dark:text-slate-300">
                {activeTab === 'newsletters'
                  ? 'Browse our latest editions'
                  : 'Long-form deep dives from our Substack'}
              </p>
            </div>
            {activeTab === 'newsletters' ? (
              pro ? (
                newsletters.length > FREE_ARCHIVE_LIMIT && (
                  <button
                    onClick={() => setShowAllNewsletters(!showAllNewsletters)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-green-600 dark:text-emerald-300 font-medium hover:bg-green-50 dark:hover:bg-emerald-900/20 transition-all"
                  >
                    {showAllNewsletters ? (
                      <>
                        <span>Show Latest</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>View Full Archive</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                )
              ) : (
                newsletters.length > FREE_ARCHIVE_LIMIT && (
                  <button
                    onClick={() => openUpgrade(`${newsletters.length - FREE_ARCHIVE_LIMIT}+ more past editions are in the Pro archive.`)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-semibold hover:bg-amber-100 transition-all"
                  >
                    <FaCrown className="text-xs" />
                    <span>Unlock full archive</span>
                  </button>
                )
              )
            ) : (
              substackArticles.length > 6 && (
                <button
                  onClick={() => setShowAllSubstack(!showAllSubstack)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-green-600 dark:text-emerald-300 font-medium hover:bg-green-50 dark:hover:bg-emerald-900/20 transition-all"
                >
                  {showAllSubstack ? (
                    <>
                      <span>Show Less</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>View All</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              )
            )}
          </div>

          {activeTab === 'newsletters' ? (
            newslettersLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
                  <p className="text-gray-500 dark:text-slate-400">Loading newsletters...</p>
                </div>
              </div>
            ) : newslettersError ? (
              <div className="text-center py-20">
                <p className="text-red-500">{newslettersError}</p>
              </div>
            ) : newsletters.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 mb-4">
                  <svg className="w-8 h-8 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-slate-300">No newsletters available yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(pro && showAllNewsletters ? newsletters : newsletters.slice(0, visibleArchiveCount(newsletters.length))).map((newsletter) => (
                  <article key={newsletter.id} className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 hover:border-green-200 dark:hover:border-emerald-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    {/* Card Header */}
                    <div className="relative h-44 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-6 flex flex-col justify-between overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />

                      <span className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium w-fit">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {new Date(newsletter.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>

                      <div className="relative flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <span className="text-white/90 text-sm font-medium">
                          {newsletter.news_items?.length || 0} stories • 3 min read
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-emerald-300 transition-colors">
                        {newsletter.title}
                      </h3>
                      <p className="text-gray-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
                        {newsletter.market_outlook?.current_state || 'Market analysis and insights for today.'}
                      </p>
                      <button
                        onClick={() => navigate(`/newsletter/${newsletter.id}`, { state: { newsletter } })}
                        className="inline-flex items-center gap-2 text-green-600 font-semibold text-sm group-hover:gap-3 transition-all"
                      >
                        <span>Read Newsletter</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    </div>
                  </article>
                ))}

                {/* Locked archive teaser — the Zeigarnik nudge */}
                {!pro && newsletters.length > FREE_ARCHIVE_LIMIT && (
                  <button
                    onClick={() => openUpgrade(`${newsletters.length - FREE_ARCHIVE_LIMIT}+ past editions are waiting in the Pro archive.`)}
                    className="group relative bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900 rounded-2xl overflow-hidden border-2 border-dashed border-amber-200 dark:border-amber-700/40 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center p-8 text-center min-h-[300px]"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4 group-hover:scale-110 transition-transform">
                      <FaLock className="text-white text-xl" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">
                      {newsletters.length - FREE_ARCHIVE_LIMIT}+ more editions
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                      The full searchable archive — every morning brief and evening wrap — is part of Pro.
                    </p>
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/25">
                      <FaCrown className="text-xs" />
                      Unlock the archive
                    </span>
                  </button>
                )}
              </div>
            )
          ) : (
            substackLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
                  <p className="text-gray-500 dark:text-slate-400">Loading articles...</p>
                </div>
              </div>
            ) : substackError ? (
              <div className="text-center py-20">
                <p className="text-red-500">{substackError}</p>
              </div>
            ) : substackArticles.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 mb-4">
                  <svg className="w-8 h-8 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m-4 6h2m-2 4h2m-6-8h6m-6 4h6m-6 4h2" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-slate-300">No articles available yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(showAllSubstack ? substackArticles : substackArticles.slice(0, 6)).map((article) => (
                  <article
                    key={article.id}
                    onClick={() => navigate(`/newsletter/article/${article.slug}`, { state: { article } })}
                    className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 hover:border-green-200 dark:hover:border-emerald-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                  >
                    {/* Cover Image */}
                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600">
                      {article.coverImage ? (
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
                      )}
                      {article.isPaid && (
                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold shadow">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Paid
                        </span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-slate-400 mb-3">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {article.postDate
                          ? new Date(article.postDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                          : ''}
                        {article.wordcount ? ` • ${Math.max(1, Math.round(article.wordcount / 200))} min read` : ''}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-emerald-300 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 dark:text-slate-300 text-sm mb-4 line-clamp-3 flex-1">
                        {article.subtitle}
                      </p>
                      <span className="inline-flex items-center gap-2 text-green-600 font-semibold text-sm group-hover:gap-3 transition-all">
                        <span>Read Article</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )
          )}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 via-green-50/30 to-gray-50 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100/80 dark:bg-emerald-900/30 border border-green-200/50 dark:border-emerald-700/40 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-green-700 dark:text-emerald-300">Free forever</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-slate-100 mb-6">
              Stay informed.{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">Stay ahead.</span>
            </h2>

            <p className="text-lg text-gray-600 dark:text-slate-300 mb-10 max-w-xl mx-auto">
              10,000+ readers start their day with us. Join them.
            </p>

            <div className="max-w-lg mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700">
                <div className="flex-1">
                  <label htmlFor="newsletter-email-cta" className="sr-only">Email address</label>
                  <input
                    id="newsletter-email-cta"
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-slate-800 border-0 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
                  />
                </div>
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className={`px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-green-600/25 transition-all duration-300 whitespace-nowrap ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-green-600/40'
                    }`}
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>

              {message && (
                <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${isError ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300' : 'bg-green-50 dark:bg-emerald-900/20 text-green-600 dark:text-emerald-300'
                  }`}>
                  {isError ? message : '🎉 ' + message}
                </div>
              )}

              <p className="mt-6 text-sm text-gray-500 dark:text-slate-400 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                We'll never spam you. Pinky promise 🤞
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Be a part of our ever growing community.{' '}
                <a href="https://twitter.com/XtinCapital" target="_blank" rel="noopener noreferrer" className="text-green-600 font-medium hover:underline">
                  Follow us on X →
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guided tour — auto-starts once, relaunchable via "?" */}
      <NewsletterTour />

      {/* Market Brief Pro upgrade + activation celebration */}
      <NewsletterUpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onActivated={handleProActivated}
        reason={upgradeReason}
      />
      <NewsletterProCelebration open={celebrating} onDone={() => setCelebrating(false)} />

      <Footer />
    </div>
  );
};

export default Newsletter;