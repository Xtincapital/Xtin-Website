import React, { useState, useEffect, useMemo } from "react";
import DeleteAccountDialog from "@/components/DeleteAccountDialog";
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
import { showPurchaseReceipt } from "@/features/billing/lib/purchaseReceipt";
import { isAdminEmail } from "@/config/admin";
import CouponField from "@/features/coupons/components/CouponField";
import { isFreeOrder } from "@/features/coupons/lib/api";

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
  
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

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
  const [checkoutCoupon, setCheckoutCoupon] = useState(null);
  const [checkoutCouponPrice, setCheckoutCouponPrice] = useState(null);
  useEffect(() => {
    setCheckoutCoupon(null);
    setCheckoutCouponPrice(null);
  }, [checkoutItem]);
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

    const expDate = verifiedData?.valid_until ? new Date(verifiedData.valid_until).toISOString().split('T')[0] : new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0];
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
        couponCode: checkoutCoupon,
      });

      if (isFreeOrder(orderData)) {
        // The coupon covered it all: already activated, no payment step.
        showPurchaseReceipt(orderData.order_id);
        applySubscriptionSuccess(orderData.record);
        return;
      }

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

            showPurchaseReceipt(response.razorpay_order_id);
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

        // Build the plan list from real server records only (real expiry
        // dates, real included products) — nothing is invented client-side.
        const plans = [];
        const toDate = (d) => new Date(d).toISOString().split('T')[0];
        const covered = new Set<string>();
        (dbActivePlans?.activeBundles || []).forEach((b, i) => {
          const products = Array.isArray(b.products) ? b.products : [];
          products.forEach((p) => covered.add(String(p).toLowerCase()));
          plans.push({
            id: `db-bundle-${b.id || i}`,
            planName: b.plan_name || "Xtin Subscription",
            products,
            isBundle: products.length > 1,
            status: "Active",
            expiryDate: toDate(b.valid_until),
          });
        });
        const single = [
          ['algo', 'Algo Trading Pro', dbActivePlans?.activeAlgos],
          ['learn', 'Learn Hub All-Access', dbActivePlans?.activeLearn],
          ['news', 'Market Newsletter Pro', dbActivePlans?.activeNews],
        ];
        single.forEach(([needle, name, rows]) => {
          const list = (rows as any[]) || [];
          if (!list.length || [...covered].some((c) => c.includes(needle as string))) return;
          const latest = list.reduce((a, b) => (new Date(b.valid_until) > new Date(a.valid_until) ? b : a));
          plans.push({ id: `db-${needle}`, planName: name, products: [], isBundle: false, status: "Active", expiryDate: toDate(latest.valid_until) });
        });

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
    const diffTime = Math.max(0, expiry.getTime() - today.getTime());
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

  const displayName = `${user?.first_name || user?.user_metadata?.first_name || ""} ${user?.last_name || user?.user_metadata?.last_name || ""}`.trim() || user?.email || "Investor";

  // Only what the user has actually bought is shown as "theirs".
  const ownedServices = subscriptionServices.filter((s) => userSubscriptions[s.key]);
  const missingServices = subscriptionServices.filter((s) => !userSubscriptions[s.key]);
  const hasAnything = ownedServices.length > 0;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-grow px-4 md:px-8 py-10 mt-20">
        <div className="max-w-5xl mx-auto space-y-10">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-base font-bold shrink-0">
                {getInitials()}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight truncate">Welcome back, {displayName}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleOpenNameModal} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium hover:border-emerald-500 transition">
                <Edit2 size={14} /> Edit profile
              </button>
              <Link to="/billing" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium hover:border-emerald-500 transition">
                <FileText size={14} /> Billing
              </Link>
              {isAdminEmail(user?.email) && (
                <Link to="/admin" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium hover:border-emerald-500 transition">
                  <Shield size={14} /> Admin
                </Link>
              )}
              <button onClick={handleLogout} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:border-rose-300 transition">
                <LogOut size={14} /> Log out
              </button>
            </div>
          </div>

          {/* Your products — only what you own */}
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-lg font-semibold">Your products</h2>
              {hasAnything && (
                <span className="text-xs text-slate-500 dark:text-slate-400">{ownedServices.length} active</span>
              )}
            </div>

            {hasAnything ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ownedServices.map((srv) => (
                  <Link
                    key={srv.key}
                    to={srv.activeLink}
                    className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-emerald-500 hover:shadow-sm transition"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
                        {srv.icon}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                      </span>
                    </div>
                    <h3 className="font-semibold">{srv.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">{srv.desc}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 group-hover:gap-2 transition-all">
                      {srv.activeActionText} <ArrowRight size={14} />
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 text-center">
                <p className="font-semibold">No Pro plans yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">Pick a single tool or save with a bundle. Only what you buy shows up here.</p>
                <div className="flex justify-center gap-2">
                  <button onClick={() => handleOpenBundleModal('single')} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition">Browse plans</button>
                  <button onClick={() => handleOpenBundleModal('combos')} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:border-emerald-500 transition">View bundles</button>
                </div>
              </div>
            )}
          </section>

          {/* Subscriptions & bundles */}
          {activePlans.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4">Subscriptions &amp; bundles</h2>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                {activePlans.map((sub) => {
                  const daysLeft = calculateDaysRemaining(sub.expiryDate);
                  const expiringSoon = daysLeft <= 14;
                  return (
                    <div key={sub.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{sub.planName}</h3>
                          {sub.isBundle && (
                            <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">Bundle</span>
                          )}
                        </div>
                        {sub.isBundle && sub.products?.length > 0 && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sub.products.join(' · ')}</p>
                        )}
                      </div>
                      <div className="text-sm sm:text-right shrink-0">
                        <div className={expiringSoon ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-slate-700 dark:text-slate-300'}>
                          {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Ends {new Date(sub.expiryDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Add more — only products not yet owned, kept quiet */}
          {hasAnything && missingServices.length > 0 && (
            <section>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-lg font-semibold">Add more</h2>
                <div className="flex items-center gap-4 text-sm">
                  <button onClick={() => handleOpenBundleModal('combos')} className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">Bundles</button>
                  <button onClick={() => handleOpenBundleModal('custom')} className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">Build your own</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingServices.map((srv) => (
                  <button
                    key={srv.key}
                    onClick={() => handleOpenBundleModal('single', srv.key)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm hover:border-emerald-500 transition"
                  >
                    <Plus size={14} className="text-slate-400" /> {srv.title}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Account */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Account</h2>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <InfoRow label="Name" value={displayName} />
              <InfoRow label="Email" value={user?.email || "—"} />
              <InfoRow label="Phone" value={user?.phone_number || user?.user_metadata?.phone_number || "—"} />
            </div>
          </section>
        </div>
      </main>

      {/* ═══ Plans modal ═══ */}
      {showBundleModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowBundleModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">Plans</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Buy a single tool, or bundle and save up to 30%.</p>
              </div>
              <button onClick={() => setShowBundleModal(false)} aria-label="Close" className="p-2 -m-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition">
                <X size={20} />
              </button>
            </div>

            {/* Tabs + billing */}
            <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex gap-1 text-sm">
                {[['single', 'Single tools'], ['combos', 'Bundles'], ['custom', 'Build your own']].map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setModalTab(id)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${modalTab === id ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                <button onClick={() => setBillingCycle('monthly')} className={`px-3 py-1.5 rounded-md transition ${billingCycle === 'monthly' ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-500'}`}>Monthly</button>
                <button onClick={() => setBillingCycle('annual')} className={`px-3 py-1.5 rounded-md transition ${billingCycle === 'annual' ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-500'}`}>
                  Annual <span className="text-emerald-600 dark:text-emerald-400 font-semibold">−20%</span>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-grow">

              {/* Single tools */}
              {modalTab === 'single' && (() => {
                const activeProd = BUNDLE_PRODUCTS.find(p => p.id === selectedSingleProduct) || BUNDLE_PRODUCTS[0];
                const activeDetails = PRODUCT_PLAN_DETAILS[activeProd.id] || PRODUCT_PLAN_DETAILS['algos'];
                const price = billingCycle === 'monthly' ? activeProd.monthly : activeProd.annual;
                const cycle = billingCycle === 'monthly' ? '/mo' : '/yr';
                const owned = userSubscriptions[activeProd.id];
                return (
                  <div className="grid grid-cols-1 md:grid-cols-[13rem_1fr] gap-6">
                    <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
                      {BUNDLE_PRODUCTS.map((prod) => {
                        const PIcon = prod.icon;
                        const sel = selectedSingleProduct === prod.id;
                        return (
                          <button
                            key={prod.id}
                            onClick={() => setSelectedSingleProduct(prod.id)}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left whitespace-nowrap transition ${sel ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                          >
                            <PIcon size={16} /> <span className="flex-1">{prod.name}</span>
                            {userSubscriptions[prod.id] && <Check size={14} className="text-emerald-500" />}
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{activeDetails.badge}</span>
                          <h4 className="text-2xl font-semibold tracking-tight mt-1">{activeProd.name}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{activeProd.desc}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-3xl font-semibold tracking-tight">₹{price.toLocaleString()}<span className="text-sm font-normal text-slate-400">{cycle}</span></div>
                        </div>
                      </div>

                      <ul className="mt-6 space-y-2.5">
                        {activeDetails.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> {feat}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
                        {owned ? (
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400"><CheckCircle2 size={16} /> You already have this plan</span>
                        ) : (
                          <button
                            onClick={() => handleInitiatePurchase(activeProd)}
                            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition"
                          >
                            Subscribe · ₹{price.toLocaleString()}{cycle}
                          </button>
                        )}
                        <button onClick={() => setModalTab('combos')} className="text-sm text-slate-500 hover:text-emerald-600 transition">Compare bundles →</button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Bundles */}
              {modalTab === 'combos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[ULTIMATE_BUNDLE, ...COMPACT_BUNDLES].map((bundle, i) => {
                    const price = billingCycle === 'monthly' ? bundle.monthlyPrice : bundle.annualPrice;
                    const featured = i === 0;
                    return (
                      <div
                        key={bundle.id}
                        className={`rounded-xl border p-5 flex flex-col ${featured ? 'md:col-span-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-800'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-semibold">{bundle.name}</h5>
                              <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">Save {bundle.savePercent}</span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{bundle.desc}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-2xl font-semibold tracking-tight">₹{price.toLocaleString()}<span className="text-xs font-normal text-slate-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span></div>
                            {billingCycle === 'monthly' && <div className="text-xs text-slate-400 line-through">₹{bundle.regularMonthly.toLocaleString()}</div>}
                          </div>
                        </div>
                        <ul className={`mt-4 gap-x-6 gap-y-1.5 text-sm text-slate-700 dark:text-slate-300 ${featured ? 'grid grid-cols-1 sm:grid-cols-2' : 'space-y-1.5'}`}>
                          {bundle.products.map((p) => (
                            <li key={p} className="flex items-center gap-2"><Check size={14} className="text-emerald-500 shrink-0" /> {p}</li>
                          ))}
                        </ul>
                        <button
                          onClick={() => handleInitiatePurchase(bundle)}
                          className={`mt-5 self-start px-4 py-2 rounded-lg text-sm font-medium transition ${featured ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600'}`}
                        >
                          Get {featured ? 'all-access' : 'bundle'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Custom */}
              {modalTab === 'custom' && (
                <div className="space-y-5">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Pick 2 or more tools. Discount grows with each one (10% → 30%).</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BUNDLE_PRODUCTS.map((prod) => {
                      const on = selectedCustomProducts.includes(prod.id);
                      const PIcon = prod.icon;
                      return (
                        <button
                          key={prod.id}
                          onClick={() => toggleCustomProduct(prod.id)}
                          aria-pressed={on}
                          className={`text-left rounded-lg border p-4 flex items-start gap-3 transition ${on ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                        >
                          <span className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${on ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                            {on && <Check size={12} />}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="flex items-center gap-1.5 text-sm font-medium"><PIcon size={15} className="text-slate-400" /> {prod.name}</span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{prod.desc}</span>
                          </span>
                          <span className="text-sm text-slate-600 dark:text-slate-300 shrink-0">₹{(billingCycle === 'monthly' ? prod.monthly : prod.annual).toLocaleString()}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm">
                      <div className="font-medium">{customBundleCalculations.count} selected{customBundleCalculations.discountPercent > 0 && <span className="text-emerald-600 dark:text-emerald-400"> · {customBundleCalculations.discountPercent}% off</span>}</div>
                      {customBundleCalculations.count < 2 && <div className="text-xs text-slate-500 mt-0.5">Select at least 2 to build a bundle.</div>}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xl font-semibold tracking-tight">₹{(billingCycle === 'monthly' ? customBundleCalculations.finalMonthly : customBundleCalculations.finalAnnual).toLocaleString()}<span className="text-xs font-normal text-slate-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span></div>
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
                        className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition disabled:opacity-40 disabled:pointer-events-none"
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Checkout modal ═══ */}
      {showCheckoutModal && checkoutItem && (() => {
        const total = billingCycle === 'monthly' ? (checkoutItem.monthlyPrice || checkoutItem.monthly) : (checkoutItem.annualPrice || checkoutItem.annual);
        return (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold">Checkout</h3>
                <button onClick={() => setShowCheckoutModal(false)} aria-label="Close" className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"><X size={18} /></button>
              </div>
              <div className="p-6">
                {checkoutSuccess ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-3"><Check size={24} /></div>
                    <h4 className="text-lg font-semibold">Subscription active</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pro access is now enabled for the included tools.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Order</div>
                        <div className="font-medium">{checkoutItem.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 capitalize">{billingCycle} billing</div>
                      </div>
                      <div className="text-2xl font-semibold tracking-tight">₹{total.toLocaleString()}</div>
                    </div>
                    <CouponField
                      className="mt-5"
                      product="xtin_bundle"
                      amount={total * 100}
                      currency="INR"
                      value={checkoutCoupon}
                      onChange={setCheckoutCoupon}
                      onPriceChange={setCheckoutCouponPrice}
                      onRedeemed={() => setShowCheckoutModal(false)}
                    />
                    <div className="mt-5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Lock size={13} /> Secure payment via Razorpay · UPI, cards, netbanking
                    </div>
                    <div className="mt-6 flex gap-3">
                      <button onClick={() => setShowCheckoutModal(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition">Cancel</button>
                      <button onClick={handleConfirmPayment} disabled={processingPayment} className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition disabled:opacity-50">
                        {processingPayment ? 'Processing…' : `Pay ₹${(checkoutCouponPrice !== null ? checkoutCouponPrice / 100 : total).toLocaleString('en-IN')}`}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ Profile modal ═══ */}
      {showNameModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold">Edit profile</h3>
              <button onClick={() => setShowNameModal(false)} aria-label="Close" className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                ['First name', 'text', firstName, setFirstName],
                ['Last name', 'text', lastName, setLastName],
                ['Phone number', 'tel', phoneNumber, setPhoneNumber],
              ].map(([label, type, value, setter]: any) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    disabled={updating}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white dark:bg-slate-800 text-sm transition"
                  />
                </div>
              ))}
              {updateError && <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium">{updateError}</div>}
              {updateMessage && <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-medium">{updateMessage}</div>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowNameModal(false)} disabled={updating} className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50">Cancel</button>
                <button onClick={handleUpdateName} disabled={updating} className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition disabled:opacity-50">{updating ? 'Saving…' : 'Save changes'}</button>
              </div>
              <div className="mt-2 pt-5 border-t border-rose-200 dark:border-rose-900/60 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Delete account</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Permanently remove your account and all of its data.</p>
                </div>
                <button
                  onClick={() => { setShowNameModal(false); setShowDeleteAccount(true); }}
                  disabled={updating}
                  className="px-3.5 py-2 rounded-lg border border-rose-300 dark:border-rose-800 text-sm font-medium text-rose-600 hover:bg-rose-600 hover:text-white transition disabled:opacity-50"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteAccountDialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount} />

      <Footer />
    </div>
  );
};

/* ===== Helper Component ===== */
const InfoRow = ({ label, value }) => (
  <div className="flex flex-col min-w-0">
    <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</span>
    <span className="text-sm font-medium truncate">{value}</span>
  </div>
);

export default Dashboard;