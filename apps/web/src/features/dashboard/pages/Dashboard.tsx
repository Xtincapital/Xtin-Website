import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { 
  BookOpen, Cpu, Wrench, Mail, LogOut, ChevronRight, 
  Edit2, X, Activity, TrendingUp, Star, Sparkles, CheckCircle2,
  Lock, ArrowUpRight, BarChart2, PlayCircle, ShieldCheck, Zap,
  FileText, CreditCard, Clock, AlertCircle, ShoppingCart, Globe,
  Shield, Check, User, ArrowRight, Tag, Gift, Layers, Sliders,
  Plus, Sparkle, Sun, Moon, CheckCircle
} from "lucide-react";
import authService from "../../../services/authService";
import { BACKEND_URL } from "../../../config/env";
import bundleSubscriptionService from "../services/bundleSubscriptionService";
import learnPlanService from "../../academy/services/learnPlanService";
import newsletterPlanService from "../../newsletter/services/newsletterPlanService";

/* ═══════════════════════════════════════════════════════════
   1. Preset Combination Bundles
   ═══════════════════════════════════════════════════════════ */
const ULTIMATE_BUNDLE = {
  id: 'ultimate-pass',
  name: 'Xtin Ultimate All-Access Pass',
  badge: 'Ultimate Collection',
  icon: Sparkles,
  desc: 'Full institutional access to ALL 6 Xtin Capital products (Save 30%).',
  products: ['Algo Trading Pro', 'Gini AI Advisor Pro', 'Fundakamental Pro', 'Trade Journal Pro', 'Learn Hub All-Access', 'Market Newsletter Pro'],
  monthlyPrice: 4580,
  annualPrice: 41925,
  regularMonthly: 6544,
  savePercent: '30%',
  color: 'amber',
};

const COMPACT_BUNDLES = [
  {
    id: 'quant-pack',
    name: 'Quant Trader Pack',
    badge: 'Popular Combo',
    icon: Zap,
    desc: 'Algo Execution + Trade Journal.',
    products: ['Algo Trading Pro', 'Trade Journal Pro'],
    monthlyPrice: 4238,
    annualPrice: 40318,
    regularMonthly: 5298,
    savePercent: '20%',
    color: 'emerald',
  },
  {
    id: 'ai-investor',
    name: 'AI Investor Suite',
    badge: 'Best for Investors',
    icon: Cpu,
    desc: 'Stock research + 24/7 AI advisor.',
    products: ['Gini AI Advisor', 'Fundakamental Research'],
    monthlyPrice: 748,
    annualPrice: 5998,
    regularMonthly: 998,
    savePercent: '25%',
    color: 'indigo',
  },
  {
    id: 'alpha-learn',
    name: 'Alpha Learning Bundle',
    badge: 'Academy & News',
    icon: BookOpen,
    desc: '12+ Courses + Newsletter + Journal.',
    products: ['Learn Hub', 'Market Newsletter', 'Trade Journal'],
    monthlyPrice: 437,
    annualPrice: 3117,
    regularMonthly: 547,
    savePercent: '20%',
    color: 'cyan',
  },
];

/* ═══════════════════════════════════════════════════════════
   2. Products List & Details for Single Plans & Custom Builder
   ═══════════════════════════════════════════════════════════ */
const BUNDLE_PRODUCTS = [
  { id: 'algos', name: 'Algo Trading Pro', monthly: 4999, annual: 47999, icon: Zap, desc: 'Automated NSE/BSE Algo Strategy Engine' },
  { id: 'gini', name: 'Gini AI Advisor Pro', monthly: 499, annual: 3999, icon: Cpu, desc: '24/7 AI Portfolio & Market Assistant' },
  { id: 'fundakamental', name: 'Fundakamental Pro', monthly: 499, annual: 3999, icon: TrendingUp, desc: 'Deep Fundamental Stock Research' },
  { id: 'journal', name: 'Trade Journal Pro', monthly: 299, annual: 2399, icon: FileText, desc: 'Trading Psychology & Analytics' },
  { id: 'learn', name: 'Learn Hub All-Access', monthly: 99, annual: 499, icon: BookOpen, desc: '12+ Stock & Algo Courses' },
  { id: 'newsletter', name: 'Market Newsletter Pro', monthly: 149, annual: 999, icon: Mail, desc: 'Daily Morning & Closing Briefs' },
];

const PRODUCT_PLAN_DETAILS = {
  algos: {
    badge: 'Quant Engine',
    features: [
      'Automated strategy execution on NSE & BSE stock & option markets',
      'Access to 10+ pre-built institutional strategies (Momentum, Mean Reversion, Options Selling)',
      'Direct API connection with major brokers (Zerodha, Angel One, Dhan, Upstox)',
      'Built-in Risk Controls: Daily Stop Loss, Trailing SL, Position Sizing & Max Drawdown Limits',
      'Real-time webhook triggers & instant WhatsApp/Telegram trade alerts',
    ],
  },
  gini: {
    badge: 'AI Market Assistant',
    features: [
      '24/7 AI-powered portfolio, stock & technical analysis advisor',
      'Instant breakdown of quarterly financial results & balance sheets',
      'Real-time market sentiment & technical indicator summaries',
      'Custom strategy recommendations & portfolio rebalancing advice',
      'Unlimited conversation history & context memory',
    ],
  },
  fundakamental: {
    badge: 'Equity Workspace',
    features: [
      'Deep fundamental equity research for Indian & global equities',
      '10-year consolidated financial statements, financial ratios & peer comparisons',
      'AI-powered Annual Report & Earnings Call Transcript summarizer',
      'Institutional Valuation Models (DCF, DDM, Relative Valuation)',
      'Custom stock screeners, watchlists & exportable research PDFs',
    ],
  },
  journal: {
    badge: 'Psychology Tracker',
    features: [
      'Automated CSV/Broker trade log importer & analytics dashboard',
      'Win-rate, Profit Factor, Risk-Reward ratio & Expectancy metrics',
      'Psychology & Emotion tracking (Identify FOMO & Revenge Trading patterns)',
      'Equity curve visualization, drawdown analysis & daily PnL calendar',
      'Exportable tax-ready trading journals & performance reports',
    ],
  },
  learn: {
    badge: 'Financial Academy',
    features: [
      'Full access to 12+ structured courses on Stock Markets, Technicals & Algo Trading',
      'Shareable & QR-verifiable Course Completion Certificates',
      'Interactive strategy backtesting & code sandboxes',
      'Beginner to institutional-level structured learning paths',
      'Continuous access to all future course releases & live webinars',
    ],
  },
  newsletter: {
    badge: 'Daily Market Briefs',
    features: [
      'Daily Pre-Market Morning Briefs (Key global cues, Nifty/BankNifty key levels)',
      'Daily Post-Market Closing Summaries & FII/DII institutional flow tracking',
      'Macro-economic insights, sector rotation analysis & IPO breakdowns',
      'Multi-market selection (India NSE/BSE, US Equities, Crypto, Commodities)',
      'Delivered straight to your inbox & accessible on the web portal',
    ],
  },
};

/* ═══════════════════════════════════════════════════════════
   Main Dashboard Component
   ═══════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Profile Update State
  const [showNameModal, setShowNameModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateError, setUpdateError] = useState('');

  // Bundle / Plans Modal State
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [modalTab, setModalTab] = useState('single'); // 'single' | 'combos' | 'custom'
  const [selectedSingleProduct, setSelectedSingleProduct] = useState('algos');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

  // Checkout Modal State (FIX 404 ON PURCHASE CLICK)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Custom Bundle Builder Selection
  const [selectedCustomProducts, setSelectedCustomProducts] = useState(['algos', 'gini']);

  // Real-Time Product Subscription Statuses
  // Bumped after a purchase to re-read access from the server.
  const [accessRefreshKey, setAccessRefreshKey] = useState(0);
  const [userSubscriptions, setUserSubscriptions] = useState({
    algos: false,
    gini: false,
    fundakamental: false,
    journal: false,
    newsletter: false,
    learn: false,
    bundle: false,
  });

  // Active Plans List
  const [activePlans, setActivePlans] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleOpenNameModal = () => {
    setFirstName(user?.first_name || user?.user_metadata?.first_name || '');
    setLastName(user?.last_name || user?.user_metadata?.last_name || '');
    setPhoneNumber(user?.phone_number || user?.user_metadata?.phone_number || '');
    setUpdateMessage('');
    setUpdateError('');
    setShowNameModal(true);
  };

  const handleOpenBundleModal = (tab = 'single', productKey = 'algos') => {
    setModalTab(tab);
    if (productKey) {
      setSelectedSingleProduct(productKey);
    }
    setShowBundleModal(true);
  };

  // Open Checkout Modal for any plan/bundle (Fixes 404 page)
  const handleInitiatePurchase = (item) => {
    setCheckoutItem(item);
    setCheckoutSuccess(false);
    setShowCheckoutModal(true);
  };

  const applySubscriptionSuccess = (verifiedData) => {
    // The backend has recorded the purchase (including each bundled
    // product's own plan) — re-read access from the server rather than
    // granting it locally.
    setAccessRefreshKey((k) => k + 1);
    window.dispatchEvent(new Event('xtin_subscription_updated'));

    const expDate = verifiedData?.valid_until ? new Date(verifiedData.valid_until).toISOString().split('T')[0] : "2026-12-31";
    setActivePlans((prev) => [
      { id: `sub-${Date.now()}`, planName: checkoutItem?.name || "Pro Subscription", status: "Active", expiryDate: expDate },
      ...prev
    ]);

    setCheckoutSuccess(true);
    setProcessingPayment(false);
    setTimeout(() => {
      setShowCheckoutModal(false);
      setShowBundleModal(false);
    }, 1800);
  };

  const handleConfirmPayment = async () => {
    if (!checkoutItem) return;
    setProcessingPayment(true);
    try {
      // 1. Create Razorpay order on backend
      const orderData = await bundleSubscriptionService.createOrder({
        item: checkoutItem,
        billingCycle,
        customProducts: selectedCustomProducts,
      });

      // 2. Load Razorpay JS SDK
      const scriptLoaded = await bundleSubscriptionService.loadRazorpayScript();

      // If Razorpay keys are not set in dev environment, use dev fallback endpoint
      if (orderData.devMode) {
        const verifiedData = await bundleSubscriptionService.devActivate({
          razorpay_order_id: orderData.order.id,
          razorpay_payment_id: `pay_dev_${Date.now()}`,
          razorpay_signature: 'dev_sig',
          plan_id: orderData.planId,
          plan_name: orderData.planName,
          products: orderData.products,
          billing_cycle: billingCycle,
          amount: orderData.amount,
          phone_number: user?.phone_number || '',
        });
        applySubscriptionSuccess(verifiedData);
        return;
      }

      if (!scriptLoaded) {
        alert("Razorpay checkout script failed to load. Please check your network connection.");
        setProcessingPayment(false);
        return;
      }

      // 3. Open official Razorpay modal popup
      bundleSubscriptionService.openRazorpayCheckout({
        keyId: orderData.keyId,
        orderId: orderData.order.id,
        amount: orderData.amount,
        currency: orderData.order.currency || 'INR',
        label: orderData.planName,
        prefill: {
          name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
          email: user?.email || '',
          contact: user?.phone_number || '',
        },
        handler: async (response) => {
          try {
            // 4. Verify Razorpay HMAC signature & store in PostgreSQL database
            const verifiedData = await bundleSubscriptionService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: orderData.planId,
              plan_name: orderData.planName,
              products: orderData.products,
              billing_cycle: billingCycle,
              amount: orderData.amount,
              phone_number: user?.phone_number || '',
            });

            applySubscriptionSuccess(verifiedData);
          } catch (verErr) {
            console.error("Verification error:", verErr);
            alert(`Payment verification failed: ${verErr.message || 'Signature invalid'}`);
            setProcessingPayment(false);
          }
        },
      });
    } catch (e) {
      console.error("Payment initiation error:", e);
      alert(`Payment error: ${e.message || 'Failed to connect to backend'}`);
      setProcessingPayment(false);
    }
  };


  const toggleCustomProduct = (productId) => {
    setSelectedCustomProducts((prev) => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Custom Bundle Calculations
  const customBundleCalculations = useMemo(() => {
    const count = selectedCustomProducts.length;
    let discountPercent = 0;
    if (count === 2) discountPercent = 0.10;
    else if (count === 3) discountPercent = 0.15;
    else if (count === 4) discountPercent = 0.20;
    else if (count >= 5) discountPercent = 0.30;

    let baseMonthly = 0;
    let baseAnnual = 0;

    BUNDLE_PRODUCTS.forEach((p) => {
      if (selectedCustomProducts.includes(p.id)) {
        baseMonthly += p.monthly;
        baseAnnual += p.annual;
      }
    });

    const finalMonthly = Math.round(baseMonthly * (1 - discountPercent));
    const finalAnnual = Math.round(baseAnnual * (1 - discountPercent));

    return {
      count,
      discountPercent: Math.round(discountPercent * 100),
      baseMonthly,
      baseAnnual,
      finalMonthly,
      finalAnnual,
    };
  }, [selectedCustomProducts]);

  const handleUpdateName = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setUpdateError('First name and last name are required');
      return;
    }
    setUpdating(true);
    setUpdateError('');
    setUpdateMessage('');

    try {
      const response = await authService.makeAuthenticatedRequest(
        `${BACKEND_URL}/api/auth/profile`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            ...(phoneNumber.trim() && { phone_number: phoneNumber.trim() }),
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setUpdateMessage('Profile updated successfully!');
        if (user) {
          user.first_name = firstName.trim();
          user.last_name = lastName.trim();
          if (phoneNumber.trim()) user.phone_number = phoneNumber.trim();
        }
        setTimeout(() => setShowNameModal(false), 1500);
      } else {
        setUpdateError(result.error || result.message || 'Failed to update profile');
      }
    } catch (error) {
      setUpdateError(error.message || 'Error updating profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Fetch real-time user profile and subscriptions
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const backendUrl = BACKEND_URL;

        if (!token) return;

        // Active plans and algo subscriptions are independent — fetch them
        // together rather than one after another (each is a round trip to
        // the backend, which is slow when it's waking up). The profile shown
        // here comes from AuthContext, which already fetched it.
        const authed = (path) => authService.makeAuthenticatedRequest(`${backendUrl}${path}`);
        const [dbActivePlans, algoRes] = await Promise.all([
          bundleSubscriptionService.getUserActivePlans(),
          authed('/api/algorithm/subscriptions').catch((e) => {
            console.warn("Could not fetch algo subscriptions:", e);
            return null;
          }),
        ]);

        const dbSubs = dbActivePlans?.userSubscriptions || {};

        let hasAlgoSub = Boolean(dbSubs.algos);
        if (!hasAlgoSub && algoRes?.ok) {
          const algoData = await algoRes.json().catch(() => ({}));
          if (algoData.data && algoData.data.length > 0) {
            hasAlgoSub = true;
          }
        }

        // Pro access comes only from the server (bundles write each product's
        // own plan record server-side). Browser-stored flags are not trusted:
        // anyone could set them by hand.
        const isBundleActive = Boolean(dbSubs.bundle);
        const realtimeSubs = {
          algos: hasAlgoSub || isBundleActive,
          gini: Boolean(dbSubs.gini) || isBundleActive,
          fundakamental: Boolean(dbSubs.fundakamental) || isBundleActive,
          journal: Boolean(dbSubs.journal) || isBundleActive,
          newsletter: Boolean(dbSubs.newsletter) || isBundleActive,
          learn: Boolean(dbSubs.learn) || isBundleActive,
          bundle: isBundleActive,
        };

        setUserSubscriptions(realtimeSubs);

        // Refresh the Learn / Newsletter plan caches their pages gate on.
        learnPlanService.syncPlan();
        newsletterPlanService.syncPlan();

        // Build Active Plans List
        const plans = [];
        if (dbActivePlans?.activeBundles && dbActivePlans.activeBundles.length > 0) {
          dbActivePlans.activeBundles.forEach((b, i) => {
            const expStr = b.valid_until ? new Date(b.valid_until).toISOString().split('T')[0] : "2026-12-31";
            plans.push({ id: `db-bundle-${i}`, planName: b.plan_name || "Xtin Subscription Pass", status: "Active", expiryDate: expStr });
          });
        } else if (realtimeSubs.bundle) {
          plans.push({ id: 'bundle-1', planName: "Xtin Ultimate All-In-One Bundle (All Products)", status: "Active", expiryDate: "2026-12-31" });
        }

        if (!realtimeSubs.bundle) {
          if (realtimeSubs.algos && !plans.some(p => p.planName.includes('Algo'))) plans.push({ id: 'algo-1', planName: "Algo Trading Strategy Plan", status: "Active", expiryDate: "2026-12-31" });
          if (realtimeSubs.gini && !plans.some(p => p.planName.includes('Gini'))) plans.push({ id: 'gini-1', planName: "Gini AI Advisor Pro", status: "Active", expiryDate: "2026-06-30" });
          if (realtimeSubs.fundakamental && !plans.some(p => p.planName.includes('Funda'))) plans.push({ id: 'funda-1', planName: "Fundakamental Research Pro", status: "Active", expiryDate: "2026-09-15" });
          if (realtimeSubs.journal && !plans.some(p => p.planName.includes('Journal'))) plans.push({ id: 'journal-1', planName: "Trade Journal Pro Pass", status: "Active", expiryDate: "2026-11-01" });
          if (realtimeSubs.learn && !plans.some(p => p.planName.includes('Learn'))) plans.push({ id: 'learn-1', planName: "Learning Hub All-Access", status: "Active", expiryDate: "2026-12-31" });
          if (realtimeSubs.newsletter && !plans.some(p => p.planName.includes('Market'))) plans.push({ id: 'news-1', planName: "Market Insights Daily Pass", status: "Active", expiryDate: "2026-12-31" });
        }


        setActivePlans(plans);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [accessRefreshKey]);

  const getInitials = () => {
    const first = user?.first_name?.[0] || 'U';
    const last = user?.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  const calculateDaysRemaining = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = Math.abs(expiry.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 6 Real-Time Services Specification
  const subscriptionServices = [
    {
      key: 'algos',
      title: 'Algo Trading',
      desc: 'Automated strategy execution on NSE/BSE',
      icon: <Zap size={22} className="text-emerald-500" />,
      activeText: 'Purchased · Active',
      inactiveText: 'Not Purchased',
      activeActionText: 'Open Algos',
      inactiveActionText: 'View Algo Plans',
      activeLink: '/algos',
    },
    {
      key: 'gini',
      title: 'Gini AI Advisor',
      desc: '24/7 AI-powered market & stock assistant',
      icon: <Cpu size={22} className="text-indigo-500" />,
      activeText: 'Purchased · Pro',
      inactiveText: 'Not Purchased',
      activeActionText: 'Chat with Gini',
      inactiveActionText: 'View Gini Plans',
      activeLink: '/gini',
    },
    {
      key: 'newsletter',
      title: 'Market Newsletter',
      desc: 'Daily morning pre-market & closing briefs',
      icon: <Mail size={22} className="text-blue-500" />,
      activeText: 'Subscribed · Active',
      inactiveText: 'Not Subscribed',
      activeActionText: 'Read Newsletter',
      inactiveActionText: 'View Newsletter Plans',
      activeLink: '/newsletter',
    },
    {
      key: 'fundakamental',
      title: 'Fundakamental',
      desc: 'Deep fundamental equity research workspace',
      icon: <TrendingUp size={22} className="text-purple-500" />,
      activeText: 'Purchased · Pro',
      inactiveText: 'Not Purchased',
      activeActionText: 'Open Research',
      inactiveActionText: 'View Research Plans',
      activeLink: '/fundakamental',
    },
    {
      key: 'journal',
      title: 'Trade Journal',
      desc: 'Trading psychology & performance tracker',
      icon: <FileText size={22} className="text-teal-500" />,
      activeText: 'Purchased · Pro',
      inactiveText: 'Not Purchased',
      activeActionText: 'Open Journal',
      inactiveActionText: 'View Journal Plans',
      activeLink: '/journal',
    },
    {
      key: 'learn',
      title: 'Learn Hub',
      desc: '12+ structured financial & algo courses',
      icon: <BookOpen size={22} className="text-cyan-500" />,
      activeText: 'Purchased · Pro Access',
      inactiveText: 'Not Purchased',
      activeActionText: 'Go to Courses',
      inactiveActionText: 'View Learn Plans',
      activeLink: '/learn',
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-grow px-4 md:px-8 lg:px-12 py-10 mt-20">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* ═══════════════════════════════════════════════════════════
             1. INSTITUTIONAL HERO BANNER (LIGHT & DARK ACCESSIBLE)
             ═══════════════════════════════════════════════════════════ */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-950 border border-slate-800 p-6 md:p-8 text-white shadow-2xl">
            {/* Background Ambient Glow */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Profile & Info */}
              <div className="flex items-center gap-4 md:gap-5 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 flex items-center justify-center text-white text-xl md:text-2xl font-extrabold shadow-lg shadow-emerald-900/40 ring-2 ring-white/10">
                    {getInitials()}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-slate-900 flex items-center justify-center">
                    <Check size={10} className="text-slate-900 font-bold" />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 backdrop-blur-md">
                      <ShieldCheck size={13} className="text-emerald-400" /> Verified Account
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">ID: {user?.id?.slice(0, 8) || "XTIN-USER"}</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight truncate">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{`${user?.first_name || user?.user_metadata?.first_name || ""} ${user?.last_name || user?.user_metadata?.last_name || ""}`.trim() || user?.email || "Investor"}</span>
                  </h1>
                  <p className="text-slate-300 text-xs mt-0.5 truncate font-medium">
                    Your institutional finance terminal &amp; AI trading control center.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                <button onClick={() => handleOpenBundleModal('combos')} className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-[11px] shadow-md shadow-emerald-600/25 transition shrink-0">
                  <Gift size={14} /> Explore Bundles
                </button>
                <button onClick={() => handleOpenBundleModal('custom')} className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white backdrop-blur-md transition font-semibold text-[11px] shadow-sm shrink-0">
                  <Sliders size={14} /> Build Custom Bundle
                </button>
                <button onClick={handleOpenNameModal} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-semibold text-[11px] shadow-sm shrink-0">
                  <Edit2 size={14} /> Edit Profile
                </button>
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 transition font-semibold text-[11px] shadow-sm shrink-0">
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
             2. PRODUCT ACCESS DIRECTORY (LIGHT & DARK ACCESSIBLE GRID)
             ═══════════════════════════════════════════════════════════ */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                  <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={24} /> Product Access Directory (All 6 Services)
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Real-time Pro access status for every Xtin Capital tool. Unlocked tools grant instant full Pro features.</p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => handleOpenBundleModal('custom')} className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                  <Sliders size={14} /> Build Custom Bundle
                </button>
                <button onClick={() => handleOpenBundleModal('combos')} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                  View Preset Bundles <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {subscriptionServices.map((srv) => {
                const isPurchased = userSubscriptions[srv.key];

                return (
                  <div 
                    key={srv.key} 
                    className={`group rounded-2xl border p-6 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5 ${
                      isPurchased 
                        ? 'bg-white dark:bg-slate-900 border-emerald-500/50 dark:border-emerald-700/60 shadow-lg shadow-emerald-950/5' 
                        : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Top Row: Icon + Title */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${isPurchased ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40' : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}>
                            {srv.icon}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{srv.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{srv.desc}</p>
                          </div>
                        </div>
                      </div>

                      {/* Real-time Status Badge */}
                      <div className="mb-6">
                        {isPurchased ? (
                          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 shadow-sm">
                            <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                            {srv.activeText}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                            <AlertCircle size={15} className="text-amber-500" />
                            {srv.inactiveText}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    {isPurchased ? (
                      <Link
                        to={srv.activeLink}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                      >
                        {srv.activeActionText} <ChevronRight size={15} />
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleOpenBundleModal('single', srv.key)}
                        className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={15} /> {srv.inactiveActionText}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
             3. TWO-COLUMN MAIN CONTENT (ACCOUNT & ACTIVE PLANS)
             ═══════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Account & Learning */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Account Info */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-5 flex items-center gap-2">
                  <Activity size={20} className="text-emerald-500" /> Account Overview
                </h2>
                <div className="space-y-4">
                  <InfoRow label="Full Name" value={`${user?.first_name || user?.user_metadata?.first_name || "—"} ${user?.last_name || user?.user_metadata?.last_name || ""}`.trim() || "—"} />
                  <InfoRow label="Email Address" value={user?.email || "—"} />
                  <InfoRow label="Phone Number" value={user?.phone_number || user?.user_metadata?.phone_number || "—"} />
                  <InfoRow label="Account Security" value="Verified Investor (2FA)" />
                </div>
              </div>

              {/* Learning Progress Widget */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <BookOpen size={20} className="text-cyan-500" /> Learning Journey
                  </h2>
                  <Link to="/learn" className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline">Explore All</Link>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 font-medium">Master trading fundamentals and algorithmic strategies step-by-step.</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-800 dark:text-slate-300">Stock Market Basics</span>
                      <span className="text-emerald-600 dark:text-emerald-400">75% Complete</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-800 dark:text-slate-300">Algo Trading 101</span>
                      <span className="text-indigo-600 dark:text-indigo-400">40% Complete</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>
                <Link to="/learn" className="mt-5 w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2">
                  <PlayCircle size={16} /> Resume Next Lesson
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: Active Plans & Intelligence */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Premium Subscriptions Manager Panel */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 dark:from-slate-900 dark:to-slate-950 border border-slate-800 rounded-3xl p-1 shadow-2xl text-white">
                <div className="bg-slate-900/80 rounded-2xl p-6 md:p-8 h-full backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Star size={20} className="text-amber-400 fill-amber-400" /> My Active Subscriptions &amp; Expiry Manager
                    </h2>
                    <button onClick={() => handleOpenBundleModal('combos')} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition">
                      View Bundles &amp; Combinations
                    </button>
                  </div>

                  {activePlans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activePlans.map(sub => {
                        const daysLeft = calculateDaysRemaining(sub.expiryDate);
                        const isExpiringSoon = daysLeft < 30;
                        
                        return (
                          <div key={sub.id} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-white text-sm">{sub.planName}</h3>
                              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md ${isExpiringSoon ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                                {sub.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3 font-mono">
                              <Clock size={13} /> Valid until: {new Date(sub.expiryDate).toLocaleDateString()}
                            </div>
                            
                            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-2">
                              <div 
                                className={`h-full rounded-full ${isExpiringSoon ? 'bg-gradient-to-r from-rose-500 to-orange-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`} 
                                style={{ width: `${Math.max(10, Math.min(100, (daysLeft / 365) * 100))}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-slate-400 text-right font-medium">{daysLeft} days remaining</p>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <CreditCard size={40} className="mx-auto text-slate-600 mb-3" />
                      <p className="text-base text-slate-300 font-bold">No active paid plan subscriptions detected.</p>
                      <p className="text-xs text-slate-400 mt-1 mb-5 max-w-md mx-auto">Explore product bundles or build your custom package for maximum savings.</p>
                      <div className="flex justify-center gap-3">
                        <button onClick={() => handleOpenBundleModal('combos')} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-md">
                          Explore Preset Bundles
                        </button>
                        <button onClick={() => handleOpenBundleModal('custom')} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition">
                          Build Custom Bundle
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Callout Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Newsletter Card */}
                <div className="relative overflow-hidden rounded-3xl border border-indigo-200 dark:border-indigo-950/60 bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-indigo-100/30 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 p-7 shadow-sm">
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                          <Mail size={24} className="text-white" />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 text-xs font-extrabold tracking-wide uppercase">Daily Brief</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Market Insights</h3>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-6 font-medium">
                        Get morning pre-market levels &amp; evening closing summaries delivered daily in under 3 minutes.
                      </p>
                    </div>
                    <Link to="/newsletter" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm w-fit">
                      Read Latest Issue <ChevronRight size={16} />
                    </Link>
                  </div>
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full blur-3xl pointer-events-none"></div>
                </div>

                {/* AI Gini Advisor Quick Card */}
                <div className="relative overflow-hidden rounded-3xl border border-emerald-200 dark:border-emerald-950/60 bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-emerald-100/30 dark:from-slate-900 dark:via-emerald-950/30 dark:to-slate-900 p-7 shadow-sm">
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
                          <Sparkles size={24} className="text-white" />
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold tracking-wide uppercase">AI Assistant</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Xtin Gini AI</h3>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-6 font-medium">
                        Ask any market question, analyze stock balance sheets, or plan SIP goals with your personalized AI financial advisor.
                      </p>
                    </div>
                    <Link to="/gini" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-sm w-fit">
                      Chat with Gini AI <ChevronRight size={16} />
                    </Link>
                  </div>
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-200/40 dark:bg-emerald-900/20 rounded-full blur-3xl pointer-events-none"></div>
                </div>
              </div>

            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
             4. BOTTOM ULTIMATE ALL-IN-ONE COLLECTION BUNDLE BANNER
             ═══════════════════════════════════════════════════════════ */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 border-2 border-amber-400/80 p-8 md:p-10 text-white shadow-2xl">
            {/* Glow Accents */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md">
                  <Sparkles size={14} /> Ultimate All-In-One Collection Pass
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  Unlock All 6 Products in 1 Unified Pass
                </h2>

                <p className="text-slate-300 text-sm leading-relaxed font-medium">
                  Get full institutional access to <strong className="text-white">Algo Trading Pro</strong>, <strong className="text-white">Gini AI Advisor</strong>, <strong className="text-white">Fundakamental Research</strong>, <strong className="text-white">Trade Journal</strong>, <strong className="text-white">Learn Hub</strong>, and <strong className="text-white">Market Newsletter</strong> with a <strong className="text-amber-400 font-extrabold">30% Bundle Discount</strong> (Max Discount).
                </p>

                {/* Included Product Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {BUNDLE_PRODUCTS.map((prod) => (
                    <span key={prod.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-white/10 border border-white/15 text-slate-200 backdrop-blur-md">
                      <CheckCircle2 size={13} className="text-emerald-400" /> {prod.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price Callout & CTA */}
              <div className="bg-slate-900/90 border border-slate-700 p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center shrink-0 w-full lg:w-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">Xtin Ultimate Pass</span>
                <div className="text-4xl font-black text-white">₹{ULTIMATE_BUNDLE.monthlyPrice.toLocaleString()}<span className="text-xs text-slate-400 font-medium">/mo</span></div>
                <div className="text-xs text-slate-400 line-through mt-0.5 mb-5">Individual Total: ₹{ULTIMATE_BUNDLE.regularMonthly.toLocaleString()}/mo</div>

                <button
                  onClick={() => handleInitiatePurchase(ULTIMATE_BUNDLE)}
                  className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 hover:from-amber-500 hover:to-teal-500 text-slate-950 text-xs font-black transition-all shadow-xl shadow-amber-400/25 flex items-center justify-center gap-2"
                >
                  <Gift size={18} /> Unlock Ultimate Bundle Pass
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════
         INTERACTIVE BUNDLE EXPLORER & CUSTOM BUILDER MODAL
         ═══════════════════════════════════════════════════════════ */}
      {showBundleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full my-8 overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold mb-2 border border-emerald-500/30">
                  <Tag size={14} /> Xtin Capital Product &amp; Subscription Plans
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Choose Your Access Plan</h3>
                <p className="text-slate-300 text-xs mt-1">Select individual tool plans or save up to 30% with bundled access packs.</p>
              </div>
              <button onClick={() => setShowBundleModal(false)} className="text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition">
                <X size={22} />
              </button>
            </div>

            {/* Modal Sub-Header Tabs & Billing Cycle */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Tab Switcher */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setModalTab('single')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                    modalTab === 'single'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                  }`}
                >
                  <Tag size={15} /> Individual Tool Plans
                </button>
                <button
                  onClick={() => setModalTab('combos')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                    modalTab === 'combos'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                  }`}
                >
                  <Gift size={15} /> Preset Bundles (Save 20-30%)
                </button>
                <button
                  onClick={() => setModalTab('custom')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                    modalTab === 'custom'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                  }`}
                >
                  <Sliders size={15} /> Build Your Custom Bundle
                </button>
              </div>

              {/* Monthly vs Annual Toggle */}
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3.5 py-1.5 rounded-lg transition ${billingCycle === 'monthly' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1 ${billingCycle === 'annual' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'}`}
                >
                  Annual <span className="text-[10px] bg-amber-400 text-slate-950 font-extrabold px-1 rounded">20% OFF</span>
                </button>
              </div>

            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto flex-grow space-y-6">
              
              {/* TAB 0: INDIVIDUAL TOOL PLANS */}
              {modalTab === 'single' && (
                <div className="space-y-6">
                  {/* Product Sub-Pills Selector */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Select Product Plan:</span>
                    <div className="flex flex-wrap gap-2">
                      {BUNDLE_PRODUCTS.map((prod) => {
                        const PIcon = prod.icon;
                        const isSelected = selectedSingleProduct === prod.id;

                        return (
                          <button
                            key={prod.id}
                            onClick={() => setSelectedSingleProduct(prod.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 border ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                            }`}
                          >
                            <PIcon size={15} className={isSelected ? 'text-white' : 'text-emerald-500'} />
                            <span>{prod.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Selected Single Product Plan Card */}
                  {(() => {
                    const activeProd = BUNDLE_PRODUCTS.find(p => p.id === selectedSingleProduct) || BUNDLE_PRODUCTS[0];
                    const activeDetails = PRODUCT_PLAN_DETAILS[activeProd.id] || PRODUCT_PLAN_DETAILS['algos'];
                    const AIcon = activeProd.icon;
                    const displayPrice = billingCycle === 'monthly' ? activeProd.monthly : activeProd.annual;
                    const cycleLabel = billingCycle === 'monthly' ? '/mo' : '/yr';

                    return (
                      <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-white via-slate-50 to-emerald-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30 p-6 md:p-8 shadow-xl space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
                              <AIcon size={28} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
                                  {activeDetails.badge}
                                </span>
                                {userSubscriptions[activeProd.id] && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Active Plan
                                  </span>
                                )}
                              </div>
                              <h4 className="text-2xl font-black text-slate-900 dark:text-white">{activeProd.name}</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{activeProd.desc}</p>
                            </div>
                          </div>

                          <div className="text-left md:text-right shrink-0 bg-white dark:bg-slate-800/90 p-4 md:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Plan Pricing</div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white">
                              ₹{displayPrice.toLocaleString()}
                              <span className="text-xs font-semibold text-slate-400">{cycleLabel}</span>
                            </div>
                            {billingCycle === 'annual' && (
                              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold mt-0.5">
                                Includes 20% Annual Discount
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Feature Bullets */}
                        <div>
                          <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Key Plan Features Included:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {activeDetails.features.map((feat, idx) => (
                              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80">
                                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold leading-relaxed">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Subscribe Button & Bundle Upsell CTA */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Need multiple tools? <button onClick={() => setModalTab('combos')} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Explore Preset Bundles</button> or <button onClick={() => setModalTab('custom')} className="text-amber-600 dark:text-amber-400 font-bold hover:underline">Build Custom Bundle</button> for up to 30% OFF.
                          </div>

                          <button
                            onClick={() => handleInitiatePurchase(activeProd)}
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 shrink-0"
                          >
                            <ShoppingCart size={16} /> Subscribe {activeProd.name} (₹{displayPrice.toLocaleString()}{cycleLabel})
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 1: PRESET COMBINATION BUNDLES */}
              {modalTab === 'combos' && (
                <div className="space-y-6">
                  
                  {/* 1. ULTIMATE BUNDLE FEATURED BANNER CARD AT THE VERY TOP */}
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 border-2 border-amber-400 p-6 md:p-7 text-white shadow-2xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 text-[10px] font-black uppercase">
                            ⭐ Top Recommended Collection
                          </span>
                          <span className="text-xs font-bold text-amber-400">Save 30% (Max Discount)</span>
                        </div>
                        <h4 className="text-2xl font-black text-white">{ULTIMATE_BUNDLE.name}</h4>
                        <p className="text-xs text-slate-300 font-medium">{ULTIMATE_BUNDLE.desc}</p>
                        
                        {/* Included Products pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {ULTIMATE_BUNDLE.products.map((p) => (
                            <span key={p} className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/15 text-slate-200">
                              ✓ {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="text-center md:text-right shrink-0 bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
                        <div className="text-2xl font-black text-white">
                          ₹{(billingCycle === 'monthly' ? ULTIMATE_BUNDLE.monthlyPrice : ULTIMATE_BUNDLE.annualPrice).toLocaleString()}
                          <span className="text-xs font-medium text-slate-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 line-through mb-3">Regular Total: ₹{ULTIMATE_BUNDLE.regularMonthly.toLocaleString()}/mo</div>
                        <button
                          onClick={() => handleInitiatePurchase(ULTIMATE_BUNDLE)}
                          className="w-full px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-500 hover:to-emerald-500 text-slate-950 text-xs font-black transition shadow-lg shadow-amber-400/20 flex items-center justify-center gap-1.5"
                        >
                          <Gift size={15} /> Unlock Ultimate Pass
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. COMPACT 3-COLUMN GRID FOR OTHER PRESET BUNDLES */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Other Curated Preset Bundles:</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {COMPACT_BUNDLES.map((bundle) => {
                        const BIcon = bundle.icon;
                        const price = billingCycle === 'monthly' ? `₹${bundle.monthlyPrice.toLocaleString()}` : `₹${bundle.annualPrice.toLocaleString()}`;
                        const cycleText = billingCycle === 'monthly' ? '/mo' : '/yr';

                        return (
                          <div
                            key={bundle.id}
                            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-sm"
                          >
                            <div>
                              {/* Header */}
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                  Save {bundle.savePercent}
                                </span>
                                <BIcon size={18} className="text-emerald-500" />
                              </div>

                              <h5 className="font-extrabold text-slate-900 dark:text-white text-sm mb-1">{bundle.name}</h5>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-tight">{bundle.desc}</p>

                              {/* Price */}
                              <div className="mb-3 flex items-baseline gap-1.5">
                                <span className="text-xl font-black text-slate-900 dark:text-white">{price}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{cycleText}</span>
                              </div>

                              {/* Products List */}
                              <div className="space-y-1 mb-4">
                                {bundle.products.map(prod => (
                                  <div key={prod} className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                    <span className="truncate">{prod}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Purchase Action Button */}
                            <button
                              onClick={() => handleInitiatePurchase(bundle)}
                              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <span>Get {bundle.name}</span>
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: BUILD YOUR OWN CUSTOM BUNDLE */}
              {modalTab === 'custom' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-emerald-900/10 via-teal-900/5 to-slate-900/10 dark:from-emerald-950/40 dark:to-slate-900 p-5 rounded-2xl border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sliders size={18} className="text-emerald-500" /> Custom Bundle Calculator
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Select any 2 or more products below to automatically unlock dynamic tiered discounts (Capped at 30% Max)!</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          {customBundleCalculations.count} Products Selected ({customBundleCalculations.discountPercent}% OFF)
                        </div>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                          ₹{(billingCycle === 'monthly' ? customBundleCalculations.finalMonthly : customBundleCalculations.finalAnnual).toLocaleString()}
                          <span className="text-xs text-slate-400 font-medium">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checkbox Grid */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Select Products to Include in Your Custom Bundle:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {BUNDLE_PRODUCTS.map((prod) => {
                        const isChecked = selectedCustomProducts.includes(prod.id);
                        const PIcon = prod.icon;

                        return (
                          <div
                            key={prod.id}
                            onClick={() => toggleCustomProduct(prod.id)}
                            className={`cursor-pointer rounded-xl border p-4 transition-all flex items-start gap-3 select-none ${
                              isChecked
                                ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <PIcon size={16} className={isChecked ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"} />
                                <h5 className="font-bold text-slate-900 dark:text-white text-xs">{prod.name}</h5>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{prod.desc}</p>
                              <div className="mt-2 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                                ₹{(billingCycle === 'monthly' ? prod.monthly : prod.annual).toLocaleString()}{billingCycle === 'monthly' ? '/mo' : '/yr'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary & Checkout CTA */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-wide">Custom Bundle Summary</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {customBundleCalculations.count < 2 ? (
                          <span className="text-amber-400">Select at least 2 products to unlock 10%+ discount</span>
                        ) : (
                          <span>Discount Applied: <span className="text-emerald-400">{customBundleCalculations.discountPercent}% OFF (Max 30%)</span></span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleInitiatePurchase({
                        id: 'custom-bundle',
                        name: `Custom Bundle (${customBundleCalculations.count} Products)`,
                        isCustom: true,
                        selectedIds: selectedCustomProducts,
                        monthlyPrice: customBundleCalculations.finalMonthly,
                        annualPrice: customBundleCalculations.finalAnnual,
                      })}
                      disabled={customBundleCalculations.count < 2}
                      className={`px-6 py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg ${
                        customBundleCalculations.count >= 2
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25'
                          : 'bg-slate-800 text-slate-400 pointer-events-none'
                      }`}
                    >
                      <span>Checkout Custom Bundle (₹{(billingCycle === 'monthly' ? customBundleCalculations.finalMonthly : customBundleCalculations.finalAnnual).toLocaleString()})</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <button
                onClick={() => setShowBundleModal(false)}
                className="px-6 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold rounded-xl transition"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
         CHECKOUT & CONFIRMATION MODAL (PREVENTS 404 PAGE)
         ═══════════════════════════════════════════════════════════ */}
      {showCheckoutModal && checkoutItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-900 to-emerald-950 text-white">
              <h3 className="text-xl font-extrabold flex items-center gap-2">
                <CreditCard size={20} className="text-emerald-400" /> Complete Subscription Checkout
              </h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {checkoutSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle size={36} />
                  </div>
                  <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white">Subscription Active!</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Your Pro access has been activated across all included Xtin Capital tools.</p>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Order Summary</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                        <Lock size={11} /> Razorpay Gateway
                      </span>
                    </div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">{checkoutItem.name}</div>
                    <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Amount Due:</span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        ₹{(billingCycle === 'monthly' ? (checkoutItem.monthlyPrice || checkoutItem.monthly) : (checkoutItem.annualPrice || checkoutItem.annual)).toLocaleString()}
                        <span className="text-xs text-slate-400 font-normal">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Payment Method:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      <div className="p-3 rounded-xl border border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <Zap size={16} className="text-emerald-500" /> Razorpay UPI / QR
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <CreditCard size={16} className="text-indigo-500" /> Debit / Credit Card
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                      <span>Instant site-wide Pro access activated upon payment completion.</span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={() => setShowCheckoutModal(false)}
                      className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmPayment}
                      disabled={processingPayment}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CreditCard size={15} />
                      {processingPayment ? "Processing Payment..." : `Pay ₹${(billingCycle === 'monthly' ? (checkoutItem.monthlyPrice || checkoutItem.monthly) : (checkoutItem.annualPrice || checkoutItem.annual)).toLocaleString()} via Razorpay`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Update Modal */}
      {showNameModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Edit Profile Details</h3>
              <button onClick={() => setShowNameModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium"
                  disabled={updating}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium"
                  disabled={updating}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm font-medium"
                  disabled={updating}
                />
              </div>

              {updateError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                  <X size={16} /> {updateError}
                </div>
              )}

              {updateMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <Activity size={16} /> {updateMessage}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowNameModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateName}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

/* ===== Helper Component ===== */
const InfoRow = ({ label, value }) => (
  <div className="flex flex-col border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
    <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{label}</span>
    <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm">{value}</span>
  </div>
);

export default Dashboard;