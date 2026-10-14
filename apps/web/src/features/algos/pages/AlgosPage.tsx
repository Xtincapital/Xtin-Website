import React, { useState, useEffect, useRef } from 'react';
import AlgoDetailsModal from '../components/AlgoDetailsModal';
import { ALGO_DETAILS, ALGO_ORDER } from '../components/algoDetails';
import PublisherApplicationsModal from '../components/PublisherApplicationsModal';
import AlgoMarketListings from '../components/AlgoMarketListings';
import { publisherApi, type PublisherApplication } from '../lib/publisherApi';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import SEO from '../../../components/SEO';
import algorithmService from '../services/algorithmService';
import { showPurchaseReceipt } from '@/features/billing/lib/purchaseReceipt';
import CouponField from '@/features/coupons/components/CouponField';
import { isFreeOrder } from '@/features/coupons/lib/api';
import ApproxPrice from '@/components/ApproxPrice';
import AmountInput from '@/components/ui/amount-input';

// Price box for a listing: rupees (that is what subscribers are charged), grouped as typed.
// A hidden field carries the plain number, since the form is read with FormData.
const ExpectedPriceInput = ({ initial }: { initial?: number | string | null }) => {
  const [value, setValue] = useState(initial == null ? '' : String(initial));
  return (
    <>
      <AmountInput
        symbol="₹"
        indian
        decimals={0}
        min={100}
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <input type="hidden" name="expected_price" value={value} />
    </>
  );
};

const AlgosPage = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Xtin Capital Trading Algorithms',
    'description': 'AI-powered algorithmic trading strategies for equity, options, and commodity markets. Access professional-grade trading systems.',
    'url': 'https://www.xtincapital.com/algos',
    'applicationCategory': 'FinanceApplication',
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'AggregateOffer',
      'priceCurrency': 'INR',
      'availability': 'https://schema.org/InStock'
    },
    'provider': {
      '@type': 'Organization',
      'name': 'Xtin Capital'
    }
  };

  const [activeTab, setActiveTab] = useState('xtin-algos');
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedAlgoName, setSelectedAlgoName] = useState(''); // New state for selected algorithm name
  const [showPublisherModal, setShowPublisherModal] = useState(false);
  const [showGreenZonePaymentModal, setShowGreenZonePaymentModal] = useState(false);
  const [showGreenZoneCalendlyModal, setShowGreenZoneCalendlyModal] = useState(false);
  const [showBuildAlgoPaymentModal, setShowBuildAlgoPaymentModal] = useState(false);
  const [showBuildAlgoCalendlyModal, setShowBuildAlgoCalendlyModal] = useState(false);
  const [showAlgoSubscribeModal, setShowAlgoSubscribeModal] = useState(false);
  const [showAlgoSuccessModal, setShowAlgoSuccessModal] = useState(false);
  const [isBuildAlgoSubmitting, setIsBuildAlgoSubmitting] = useState(false);
  const [buildAlgoSubmitMessage, setBuildAlgoSubmitMessage] = useState('');
  const [tradingViewUsername, setTradingViewUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [algoCoupon, setAlgoCoupon] = useState(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const razorpayFormRef = useRef(null);
  const razorpayBuildAlgoFormRef = useRef(null);

  // Load Razorpay script when payment modal opens
  useEffect(() => {
    if (showGreenZonePaymentModal && razorpayFormRef.current) {
      razorpayFormRef.current.innerHTML = '';
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.setAttribute('data-payment_button_id', 'pl_S3N8YvacjISNg4');
      script.async = true;
      razorpayFormRef.current.appendChild(script);
    }
  }, [showGreenZonePaymentModal]);

  // Load Razorpay script for Build Algo payment modal
  useEffect(() => {
    if (showBuildAlgoPaymentModal && razorpayBuildAlgoFormRef.current) {
      razorpayBuildAlgoFormRef.current.innerHTML = '';
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.setAttribute('data-payment_button_id', 'pl_S3Nmp3mi1FlcHW');
      script.async = true;
      razorpayBuildAlgoFormRef.current.appendChild(script);
    }
  }, [showBuildAlgoPaymentModal]);

  // Listen for Razorpay payment success (for static buttons - GreenZone & Build Algo)
  useEffect(() => {
    const handlePaymentSuccess = (event) => {
      if (event.data && (event.data.razorpay_payment_id || event.data === 'success')) {
        if (showGreenZonePaymentModal) {
          setShowGreenZonePaymentModal(false);
          setShowGreenZoneCalendlyModal(true);
        }
        if (showBuildAlgoPaymentModal) {
          setShowBuildAlgoPaymentModal(false);
          setShowBuildAlgoCalendlyModal(true);
        }
      }
    };

    window.addEventListener('message', handlePaymentSuccess);
    return () => window.removeEventListener('message', handlePaymentSuccess);
  }, [showGreenZonePaymentModal, showBuildAlgoPaymentModal]);

  const [showBuildAlgoModal, setShowBuildAlgoModal] = useState(false);
  // Quick-actions panel: open by default only where there's room for it beside the content.
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [showMyApplications, setShowMyApplications] = useState(false);
  const [editingApplication, setEditingApplication] = useState<PublisherApplication | null>(null);
  const [applicationsRefresh, setApplicationsRefresh] = useState(0);
  const [publisherSubmitting, setPublisherSubmitting] = useState(false);
  const [publisherMessage, setPublisherMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [detailsAlgo, setDetailsAlgo] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1280);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const [sidebarWidth] = useState(320); // Default width in pixels
  const buildAlgoWebhookUrl = 'https://xtincapital.app.n8n.cloud/webhook-test/algo-form-submission';

  // Switching tabs also brings the chosen section into view (the hero fills the first screen).
  const switchTab = (tabName) => {
    setActiveTab(tabName);
    setTimeout(() => {
      document.getElementById('algos-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const subscribeToAlgo = async (algoName) => {
    setSelectedAlgoName(algoName);
    setPaymentError('');
    setTradingViewUsername('');
    setPhoneNumber('');
    setTermsAccepted(false);
    setShowAlgoSubscribeModal(true);
  };

  const handleAlgoPayment = async () => {
    if (!tradingViewUsername.trim()) {
      setPaymentError('Please enter your TradingView username');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 10) {
      setPaymentError('Please enter a valid phone number');
      return;
    }
    if (!termsAccepted) {
      setPaymentError('Please accept the Terms & Conditions');
      return;
    }

    setIsPaymentProcessing(true);
    setPaymentError('');

    try {
      // Load Razorpay script
      const loaded = await algorithmService.loadRazorpayScript();
      if (!loaded) {
        setPaymentError('Failed to load payment gateway. Please try again.');
        setIsPaymentProcessing(false);
        return;
      }

      // Create order on backend
      const orderData = await algorithmService.createOrder(
        selectedAlgoName,
        tradingViewUsername.trim(),
        phoneNumber.trim(),
        algoCoupon
      );

      if (isFreeOrder(orderData)) {
        // The coupon covered it all: already activated, no payment step.
        showPurchaseReceipt(orderData.order_id);
        setShowAlgoSubscribeModal(false);
        setShowAlgoSuccessModal(true);
        return;
      }

      // Open Razorpay checkout
      algorithmService.openRazorpayCheckout({
        keyId: orderData.keyId,
        orderId: orderData.order.id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        label: orderData.plan.label,
        prefill: {
          contact: phoneNumber.trim(),
        },
        handler: async (response) => {
          try {
            // Verify payment on backend
            await algorithmService.verifyPayment({
              algo_name: selectedAlgoName,
              plan_type: 'monthly',
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              tradingview_username: tradingViewUsername.trim(),
              phone_number: phoneNumber.trim(),
            });

            // Success
            showPurchaseReceipt(response.razorpay_order_id);
            setShowAlgoSubscribeModal(false);
            setShowAlgoSuccessModal(true);
          } catch (verifyErr) {
            setPaymentError(verifyErr.message || 'Payment verification failed. Please contact support.');
          }
        },
      });
    } catch (err) {
      setPaymentError(err.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const closeGreenZonePaymentModal = () => {
    setShowGreenZonePaymentModal(false);
  };

  const closeGreenZoneCalendlyModal = () => {
    setShowGreenZoneCalendlyModal(false);
  };

  const closeConsultationModal = () => {
    setShowConsultationModal(false);
  };

  const handlePublisherSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setPublisherSubmitting(true);
    setPublisherMessage(null);
    try {
      const payload = {
        applicant_name: String(fd.get('applicant_name') || ''),
        applicant_email: String(fd.get('applicant_email') || ''),
        algo_name: String(fd.get('algo_name') || ''),
        strategy_type: String(fd.get('strategy_type') || ''),
        asset_class: String(fd.get('asset_class') || ''),
        expected_price: Number(fd.get('expected_price')),
        backtest_summary: String(fd.get('backtest_summary') || ''),
        description: String(fd.get('description') || ''),
        experience: String(fd.get('experience') || ''),
      };
      if (editingApplication) await publisherApi.update(editingApplication.id, payload);
      else await publisherApi.submit(payload);
      form.reset();
      setEditingApplication(null);
      setShowPublisherModal(false);
      setApplicationsRefresh((n) => n + 1);
      setShowMyApplications(true);
    } catch (err) {
      setPublisherMessage({ ok: false, text: err?.message || 'Could not submit your application.' });
    } finally {
      setPublisherSubmitting(false);
    }
  };

  const openPublisherForm = () => {
    setPublisherMessage(null);
    setEditingApplication(null);
    setShowPublisherModal(true);
  };

  // Correct a still-pending application: reopen the form pre-filled with what was submitted.
  const editApplication = (application: PublisherApplication) => {
    setPublisherMessage(null);
    setEditingApplication(application);
    setShowMyApplications(false);
    setShowPublisherModal(true);
  };

  const closePublisherForm = () => {
    setShowPublisherModal(false);
    setEditingApplication(null);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleBuildAlgoSubmit = async (e) => {
    e.preventDefault();
    setBuildAlgoSubmitMessage('');
    setIsBuildAlgoSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const body = new URLSearchParams();
    formData.forEach((value, key) => body.append(key, String(value)));

    try {
      await fetch(buildAlgoWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: body.toString(),
        mode: 'no-cors'
      });

      setBuildAlgoSubmitMessage('Submitted successfully. Please continue and book your call below.');
      e.currentTarget.reset();
    } catch {
      setBuildAlgoSubmitMessage('Submission failed. Please try again.');
    } finally {
      setIsBuildAlgoSubmitting(false);
    }
  };

  return (
    <div className="bg-white text-gray-900">
      <SEO
        title="Trading Algorithms - AI-Powered Algorithmic Trading Systems"
        description="Access professional AI-powered trading algorithms for equity, options, and commodity markets. Explore Xtin Capital's algorithmic strategies with published backtest results."
        keywords="algorithmic trading, trading algorithms, AI trading systems, automated trading, quantitative trading, algo trading India, trading bots, systematic trading"
        canonicalUrl="/algos"
        structuredData={structuredData}
      />
      <Navbar />
      
      {/* Sidebar toggle — only shown while the panel is closed; when it's open the
          panel's own header has the close button, so nothing floats over it. */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-20 right-4 z-50 bg-white border border-gray-300 rounded-lg p-2 shadow-lg hover:bg-gray-50 transition-colors"
          aria-label="Open quick actions"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Fixed Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed right-0 top-16 bottom-0 w-[340px] max-w-full bg-white border-l border-gray-200 z-40 transition-all duration-300 shadow-xl overflow-hidden flex flex-col"
        >
        <div className="p-5 space-y-5 flex-1 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close Sidebar"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Publisher CTA Card - Premium Design */}
          <div className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-400 opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full mb-2">For Creators</span>
                  <h4 className="text-lg font-bold text-white">Publish Your Algorithm</h4>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                Share your strategies with thousands of traders and earn passive income from your trading expertise.
              </p>
              
              <div className="flex items-center gap-4 mb-5 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Revenue Share</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span>Full Support</span>
                </div>
              </div>
              
              <button
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25 flex items-center justify-center gap-2"
                onClick={openPublisherForm}
              >
                <span>Apply to Publish</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button
                type="button"
                className="w-full mt-3 text-sm font-medium text-green-300 hover:text-green-200 underline underline-offset-4"
                onClick={() => setShowMyApplications(true)}
              >
                Check my application status
              </button>
            </div>
          </div>

          {/* Make Your Own Algo Card: a custom-build service, shown as the three steps it really is */}
          <div className="relative rounded-2xl p-5 border-2 border-green-100 bg-gradient-to-br from-green-50 via-white to-emerald-50 hover:border-green-200 hover:shadow-xl transition-all duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/40 dark:border-emerald-900/40 dark:hover:border-emerald-700/60">
            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center border border-green-200 flex-shrink-0 dark:from-emerald-900/60 dark:to-emerald-800/60 dark:border-emerald-700/40">
                <svg className="w-6 h-6 text-green-600 dark:text-emerald-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M4 17l6-6-6-6M12 19h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full mb-1.5 dark:bg-emerald-900/40 dark:text-emerald-200">Custom build</span>
                <h4 className="text-lg font-bold text-gray-900 leading-tight dark:text-slate-100">Have a strategy idea? We'll build it.</h4>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 leading-relaxed dark:text-slate-300">
              Tell our algo team what you trade. We turn your rules into a tested, automated algorithm.
            </p>

            <ol className="space-y-3 mb-4">
              {[
                { title: 'Book a strategy call', body: 'Walk our team through your idea on a 1-on-1 call.' },
                { title: 'Get a feasibility check and quote', body: 'We tell you what is possible, and what building it costs.' },
                { title: 'We build, backtest and deploy', body: 'Your rules coded, tested on historical data and set up to run.' },
              ].map((step, i) => (
                <li key={step.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{step.title}</p>
                    <p className="text-xs text-gray-500 leading-snug dark:text-slate-400">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-green-100 bg-white px-3 py-2.5 mb-3 dark:border-slate-700 dark:bg-slate-900/70">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Strategy call booking fee</p>
                <p className="text-[11px] text-gray-400 dark:text-slate-500">Build cost is quoted on the call</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 leading-none dark:text-slate-100">₹49</p>
                <ApproxPrice inr={49} className="block text-[11px] text-gray-500" />
              </div>
            </div>

            <button
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
              onClick={() => setShowBuildAlgoPaymentModal(true)}
            >
              <span>Book a strategy call</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          {/* Help Section */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-gray-900">Need Help?</h5>
                <p className="text-xs text-gray-500">Our team is here to assist</p>
              </div>
            </div>
            <a href="/help" className="text-sm text-green-600 font-medium hover:text-green-700 flex items-center gap-1">
              Visit Help Center
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
        </div>
      )}

      {/* Make Your Own Algorithm Modal */}
      {showBuildAlgoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Make Your Own Algorithm</h2>
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                onClick={() => setShowBuildAlgoModal(false)}
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <form
                className="space-y-4"
                onSubmit={handleBuildAlgoSubmit}
              >
                <div>
                  <label htmlFor="algo-name" className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                  <input id="algo-name" name="name" type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label htmlFor="algo-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input id="algo-email" name="email" type="email" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label htmlFor="algo-strategy" className="block text-sm font-medium text-gray-700 mb-1">Describe Your Strategy Idea *</label>
                  <textarea id="algo-strategy" name="strategyIdea" rows={3} required placeholder="Briefly describe your trading idea or what you want to automate" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label htmlFor="algo-asset" className="block text-sm font-medium text-gray-700 mb-1">Asset Class *</label>
                  <select id="algo-asset" name="assetClass" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Select Asset Class</option>
                    <option value="stocks">Stocks</option>
                    <option value="forex">Forex</option>
                    <option value="crypto">Cryptocurrency</option>
                    <option value="commodities">Commodities</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="algo-experience" className="block text-sm font-medium text-gray-700 mb-1">Your Trading Experience *</label>
                  <select id="algo-experience" name="tradingExperience" required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Select Experience Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="pro">Professional</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="algo-goal" className="block text-sm font-medium text-gray-700 mb-1">What is your main goal? *</label>
                  <textarea id="algo-goal" name="mainGoal" rows={2} required placeholder="E.g. automate entries, risk management, backtesting, etc." className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label htmlFor="algo-tools" className="block text-sm font-medium text-gray-700 mb-1">Preferred Platform/Tools</label>
                  <input id="algo-tools" name="preferredTools" type="text" placeholder="(Optional) TradingView, MetaTrader, Python, etc." className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label htmlFor="algo-notes" className="block text-sm font-medium text-gray-700 mb-1">Anything else we should know?</label>
                  <textarea id="algo-notes" name="notes" rows={2} placeholder="(Optional)" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule a Meeting</h3>
                  <p className="text-gray-600 mb-4 text-sm">After submitting your details, book a free call with our team to discuss your custom algorithm project.</p>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <iframe 
                      src="https://calendly.com/xtinservice/make-your-own-algorithm" 
                      width="100%" 
                      height="500" 
                      frameBorder="0"
                      title="Schedule Meeting"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition"
                    onClick={() => setShowBuildAlgoModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isBuildAlgoSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                  >
                    {isBuildAlgoSubmitting ? 'Submitting...' : 'Submit & Book Call'}
                  </button>
                </div>
                {buildAlgoSubmitMessage && (
                  <p className="text-sm text-gray-700">{buildAlgoSubmitMessage}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-24 px-6 md:px-12 lg:px-24 mt-16 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-green-400"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          {/* Floating orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-500 rounded-full filter blur-[120px] opacity-20 animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-500 rounded-full filter blur-[150px] opacity-15"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500 rounded-full filter blur-[100px] opacity-10"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-green-500/30">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                </svg>
                AI-Powered Trading Systems
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-normal leading-tight mb-6 tracking-[-0.015em]">
                <span className="text-white">XTIN</span>{' '}
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Algos</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
                Professional trading algorithms and community marketplace for algorithmic trading strategies. Harness the power of quantitative analysis.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-8">
                <button 
                  className={`group px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === 'xtin-algos' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30' 
                      : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                  }`}
                  onClick={() => switchTab('xtin-algos')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  XTIN Algos
                </button>
                <button 
                  className={`group px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === 'algo-market' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30' 
                      : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                  }`}
                  onClick={() => switchTab('algo-market')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  AlgoMarket
                </button>
              </div>
              
              {/* Stats Row */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-8 border-t border-white/10">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-semibold tabular-nums tracking-[-0.02em] text-green-400">₹60Cr+</div>
                  <div className="text-sm text-gray-400">AUM Managed</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-semibold tabular-nums tracking-[-0.02em] text-green-400">5+</div>
                  <div className="text-sm text-gray-400">Exclusive Algos</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-semibold tabular-nums tracking-[-0.02em] text-green-400">99.9%</div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </div>
              </div>
            </div>

            {/* Right Side - Algorithm Visualization */}
            <div className="flex-1 hidden lg:flex justify-center">
              <div className="relative">
                {/* Main Trading Chart SVG */}
                <svg viewBox="0 0 400 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md">
                  {/* Background Card */}
                  <rect x="20" y="20" width="360" height="310" rx="20" fill="#232327" stroke="#404047" strokeWidth="2"/>
                  
                  {/* Chart Header */}
                  <rect x="40" y="40" width="320" height="40" rx="8" fill="#404047"/>
                  <circle cx="60" cy="60" r="8" fill="#1FA978"/>
                  <rect x="80" y="55" width="80" height="10" rx="5" fill="#75757D"/>
                  <rect x="280" y="50" width="60" height="20" rx="4" fill="#1FA978" fillOpacity="0.2"/>
                  <text x="295" y="64" fill="#1FA978" fontSize="12" fontWeight="bold">LIVE</text>
                  
                  {/* Candlestick Chart Area */}
                  <rect x="40" y="100" width="320" height="180" rx="8" fill="#151517"/>
                  
                  {/* Grid Lines */}
                  <line x1="40" y1="140" x2="360" y2="140" stroke="#404047" strokeWidth="1" strokeDasharray="4"/>
                  <line x1="40" y1="180" x2="360" y2="180" stroke="#404047" strokeWidth="1" strokeDasharray="4"/>
                  <line x1="40" y1="220" x2="360" y2="220" stroke="#404047" strokeWidth="1" strokeDasharray="4"/>
                  <line x1="40" y1="260" x2="360" y2="260" stroke="#404047" strokeWidth="1" strokeDasharray="4"/>
                  
                  {/* Candlesticks */}
                  {/* Green candles (bullish) */}
                  <rect x="60" y="200" width="8" height="40" fill="#1FA978"/>
                  <line x1="64" y1="190" x2="64" y2="250" stroke="#1FA978" strokeWidth="2"/>
                  
                  <rect x="90" y="180" width="8" height="50" fill="#1FA978"/>
                  <line x1="94" y1="170" x2="94" y2="240" stroke="#1FA978" strokeWidth="2"/>
                  
                  {/* Red candles (bearish) */}
                  <rect x="120" y="160" width="8" height="35" fill="#E04848"/>
                  <line x1="124" y1="150" x2="124" y2="205" stroke="#E04848" strokeWidth="2"/>
                  
                  <rect x="150" y="175" width="8" height="30" fill="#E04848"/>
                  <line x1="154" y1="165" x2="154" y2="215" stroke="#E04848" strokeWidth="2"/>
                  
                  {/* More green candles */}
                  <rect x="180" y="155" width="8" height="45" fill="#1FA978"/>
                  <line x1="184" y1="145" x2="184" y2="210" stroke="#1FA978" strokeWidth="2"/>
                  
                  <rect x="210" y="135" width="8" height="50" fill="#1FA978"/>
                  <line x1="214" y1="125" x2="214" y2="195" stroke="#1FA978" strokeWidth="2"/>
                  
                  <rect x="240" y="120" width="8" height="40" fill="#1FA978"/>
                  <line x1="244" y1="110" x2="244" y2="170" stroke="#1FA978" strokeWidth="2"/>
                  
                  {/* Red candle */}
                  <rect x="270" y="140" width="8" height="25" fill="#E04848"/>
                  <line x1="274" y1="130" x2="274" y2="175" stroke="#E04848" strokeWidth="2"/>
                  
                  {/* Final green candles */}
                  <rect x="300" y="125" width="8" height="35" fill="#1FA978"/>
                  <line x1="304" y1="115" x2="304" y2="170" stroke="#1FA978" strokeWidth="2"/>
                  
                  <rect x="330" y="115" width="8" height="40" fill="#1FA978"/>
                  <line x1="334" y1="105" x2="334" y2="165" stroke="#1FA978" strokeWidth="2"/>
                  
                  {/* Trend Line */}
                  <path d="M60 220 Q150 200 200 160 T340 115" stroke="#1FA978" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  
                  {/* Signal Arrows */}
                  <g transform="translate(90, 255)">
                    <polygon points="0,10 10,0 20,10" fill="#1FA978"/>
                    <text x="10" y="25" fill="#1FA978" fontSize="8" textAnchor="middle">BUY</text>
                  </g>
                  
                  <g transform="translate(150, 145)">
                    <polygon points="0,0 10,10 20,0" fill="#E04848"/>
                    <text x="10" y="25" fill="#E04848" fontSize="8" textAnchor="middle">SELL</text>
                  </g>
                  
                  <g transform="translate(210, 195)">
                    <polygon points="0,10 10,0 20,10" fill="#1FA978"/>
                    <text x="10" y="25" fill="#1FA978" fontSize="8" textAnchor="middle">BUY</text>
                  </g>
                  
                  {/* Bottom Stats Bar */}
                  <rect x="40" y="290" width="320" height="30" rx="8" fill="#404047"/>
                  <text x="60" y="310" fill="#A3A1A6" fontSize="10">Vol: 2.4M</text>
                  <text x="140" y="310" fill="#1FA978" fontSize="10">+12.5%</text>
                  <text x="220" y="310" fill="#A3A1A6" fontSize="10">RSI: 65</text>
                  <text x="300" y="310" fill="#A3A1A6" fontSize="10">MACD: ↑</text>
                </svg>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-bold text-sm">+24.5%</span>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Algorithm Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="algos-content" className="scroll-mt-16" />

      {/* XTIN Algos Section */}
      {activeTab === 'xtin-algos' && (
        <section 
          className="py-20 px-6 md:px-12 lg:px-24 transition-all duration-300 bg-gradient-to-b from-gray-50 to-white"
          style={{ marginRight: sidebarOpen && isDesktop ? `${sidebarWidth}px` : '0px' }}
        >
          <div className="max-w-7xl mx-auto">

            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                Premium Strategies
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-normal text-gray-900 mb-4 tracking-[-0.015em]">
                XTIN Exclusive <span className="text-green-600">Algorithms</span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Premium trading strategies developed by our expert quantitative team with published backtest results
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ALGO_ORDER.map((key) => {
                const algo = ALGO_DETAILS[key];
                const bt = algo.backtest;
                return (
                  <div key={algo.name} className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col">
                    {/* Card Header with Gradient */}
                    <div className="relative bg-gradient-to-br from-green-600 to-emerald-700 p-6 pb-16">
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full px-3 py-1">
                        XTIN Exclusive
                      </div>
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-semibold text-white">{algo.name}</h3>
                      <p className="text-green-100 text-sm mt-1">{algo.tagline}</p>
                      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 pt-8 -mt-8 bg-white rounded-t-3xl relative flex-grow flex flex-col">
                      <div className="flex flex-wrap gap-2 mb-5 pb-5 border-b border-gray-100">
                        {algo.tags.map((t) => (
                          <span key={t} className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">{t}</span>
                        ))}
                      </div>

                      {/* Headline backtest numbers */}
                      <div className="grid grid-cols-3 gap-2 mb-2 text-center">
                        {[
                          ['Return', bt.cumulativeReturn],
                          ['Max drawdown', bt.maxDrawdown],
                          ['Sharpe', bt.sharpe],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl border border-gray-200 py-2 px-1">
                            <div className="text-base font-bold text-gray-900">{value}</div>
                            <div className="text-[11px] text-gray-500">{label}</div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-500 mb-5">Backtest, {bt.period}. Not live results.</p>

                      <ul className="text-gray-600 space-y-3 text-sm mb-6 flex-grow">
                        {[
                          `${bt.winRate} win rate over ${bt.trades} trades`,
                          `Profit factor ${bt.profitFactor}`,
                          algo.timeframes,
                        ].map((line) => (
                          <li key={line} className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        className="w-full mb-3 border-2 border-green-600 text-green-700 hover:bg-green-50 font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                        onClick={() => setDetailsAlgo(algo.name)}
                      >
                        View details &amp; backtest
                      </button>
                      <button
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                        onClick={() => subscribeToAlgo(algo.name)}
                      >
                        <span>Subscribe Now</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Coming Soon Card */}
              <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">More Coming Soon</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Our team is developing additional premium strategies. Stay tuned!
                  </p>
                  <div className="inline-flex items-center gap-2 text-green-400 font-medium">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    In Development
                  </div>
                </div>
              </div>
            </div>

            {/* Sections moved to top of XTIN Algos tab */}
          </div>
        </section>
      )}

      {/* XTIN Algos Footer Section */}
      {activeTab === 'xtin-algos' && (
        <footer 
          className="bg-gray-900 text-white transition-all duration-300"
          style={{ marginRight: sidebarOpen && isDesktop ? `${sidebarWidth}px` : '0px' }}
        >
          <div className="px-6 md:px-12 lg:px-24 py-16">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Content */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="text-4xl mr-4">⚡</div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-2">More XTIN Exclusive Algorithms</h3>
                      <p className="text-green-400 font-medium">Coming Soon</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-lg mb-8">
                    Our team is developing additional premium strategies. Stay tuned for more advanced algorithms with published backtest results.
                  </p>
                </div>

                {/* Right Side - Newsletter Signup */}
                <div className="bg-gray-800 rounded-xl p-5 sm:p-8">
                  <h4 className="text-xl font-bold text-white mb-4">Stay Updated</h4>
                  <p className="text-gray-300 mb-6">
                    Be the first to know about new XTIN Exclusive Algorithms
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="email" 
                      placeholder="Enter your email address" 
                      className="flex-1 min-w-0 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition whitespace-nowrap">
                      Notify Me
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mt-4">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* AlgoMarket Section */}
      {activeTab === 'algo-market' && (
        <section 
          className="py-20 px-6 md:px-12 lg:px-24 transition-all duration-300"
          style={{ marginRight: sidebarOpen && isDesktop ? `${sidebarWidth}px` : '0px' }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-normal text-gray-900 mb-4 tracking-[-0.015em]">
                AlgoMarket
              </h2>
              <p className="text-gray-600 text-lg">
                Community-driven algorithm marketplace
              </p>
            </div>

            <AlgoMarketListings
              empty={
                <div className="flex justify-center">
                  {/* Community Algorithms Coming Soon */}
                  <div className="bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-xl p-8 border border-gray-200 text-center max-w-2xl w-full">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">Community Algorithms Coming Soon</h3>
                    <p className="text-gray-700 mb-6">
                      We're building our community marketplace where verified traders can publish their strategies. Be among the first to access community-driven algorithms.
                    </p>
                    <div className="text-left mb-6">
                      <p className="text-gray-700 mb-2"><strong>Expected Launch:</strong> Q3 2026</p>
                      <p className="text-gray-700"><strong>Features:</strong> Verified publishers, performance tracking, ratings & reviews</p>
                    </div>
                    <button 
                      className="bg-green-100 hover:bg-green-200 text-green-600 font-semibold px-6 py-3 rounded-lg transition"
                      onClick={openPublisherForm}
                    >
                      Join Publisher Waitlist
                    </button>
                    <button
                      type="button"
                      className="block mx-auto mt-3 text-sm font-medium text-green-600 hover:underline"
                      onClick={() => setShowMyApplications(true)}
                    >
                      Check my application status
                    </button>
                  </div>
                </div>
              }
              footer={
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
                  <span className="text-gray-700">Have a strategy of your own?</span>
                  <button
                    className="bg-green-100 hover:bg-green-200 text-green-700 font-semibold px-5 py-2.5 rounded-lg transition"
                    onClick={openPublisherForm}
                  >
                    Apply to publish your algorithm
                  </button>
                  <button
                    type="button"
                    className="text-sm font-medium text-green-600 hover:underline"
                    onClick={() => setShowMyApplications(true)}
                  >
                    Check my application status
                  </button>
                </div>
              }
            />
          </div>
        </section>
      )}

      {/* GreenZone Payment Modal */}
      {showGreenZonePaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-6 text-white relative">
              <button 
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                onClick={closeGreenZonePaymentModal}
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">XTIN GreenZone</h2>
                  <p className="text-green-100 text-sm">Premium Consultation</p>
                </div>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-1">₹1,000</div>
                <ApproxPrice inr={1000} className="block mb-1 text-gray-500" />
                <p className="text-gray-500 text-sm">One-time consultation fee</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  What's Included
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    30-min personalized consultation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Strategy deep-dive & performance review
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Portfolio allocation guidance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Q&A with our expert team
                  </li>
                </ul>
              </div>
              
              {/* Razorpay Payment Button */}
              <div className="flex justify-center">
                <form ref={razorpayFormRef}>
                  {/* Razorpay script will be injected here */}
                </form>
              </div>
              
              <p className="text-center text-xs text-gray-400 mt-4">
                Secure payment powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      )}

      {/* GreenZone Calendly Modal - Shows after successful payment */}
      {showGreenZoneCalendlyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            {/* Success Header */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-6 text-white relative">
              <button 
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                onClick={closeGreenZoneCalendlyModal}
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Payment Successful!</h2>
                  <p className="text-green-100 text-sm">Now schedule your consultation</p>
                </div>
              </div>
            </div>
            
            {/* Calendly Embed */}
            <div className="p-6">
              <div className="mb-4 text-center">
                <p className="text-gray-600">Choose a convenient time slot for your XTIN GreenZone consultation</p>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <iframe 
                  src="https://calendly.com/xtinservices/meeting" 
                  width="100%" 
                  height="500" 
                  frameBorder="0"
                  title="Schedule GreenZone Consultation"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Build Algo Payment Modal */}
      {showBuildAlgoPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-6 text-white relative">
              <button 
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                onClick={() => setShowBuildAlgoPaymentModal(false)}
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Build Your Own Algorithm</h2>
                  <p className="text-green-100 text-sm">Strategy Consultation Call</p>
                </div>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <div className="text-center mb-5">
                <div className="text-4xl font-bold text-gray-900 mb-1">₹49</div>
                <ApproxPrice inr={49} className="block mb-1 text-gray-500" />
                <p className="text-gray-500 text-sm">Consultation booking fee</p>
              </div>

              {/* Value Proposition */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-5 border border-green-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Got an idea? Let's bring it to life!</p>
                    <p className="text-xs text-gray-500 mt-1">This is a discovery call to understand your trading strategy and provide you with the best development quote.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  What You'll Get
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    1-on-1 call with our algo development team
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Discuss your strategy idea in detail
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Get expert feasibility assessment
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Receive custom quote for development & deployment
                  </li>
                </ul>
              </div>

              {/* Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
                <p className="text-xs text-amber-800 flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  <span><strong>Note:</strong> This ₹49 is only for booking the consultation call. Algorithm development pricing will be shared during the call based on your requirements.</span>
                </p>
              </div>
              
              {/* Razorpay Payment Button */}
              <div className="flex justify-center">
                <form ref={razorpayBuildAlgoFormRef}>
                  {/* Razorpay script will be injected here */}
                </form>
              </div>
              
              <p className="text-center text-xs text-gray-400 mt-4">
                Secure payment powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Build Algo Calendly Modal - Shows after successful payment */}
      {showBuildAlgoCalendlyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            {/* Success Header */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-6 text-white relative">
              <button 
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                onClick={() => setShowBuildAlgoCalendlyModal(false)}
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Payment Successful!</h2>
                  <p className="text-green-100 text-sm">Now schedule your strategy call</p>
                </div>
              </div>
            </div>
            
            {/* Calendly Embed */}
            <div className="p-6">
              <div className="mb-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Book Your Strategy Discussion</h3>
                <p className="text-gray-600 text-sm">Pick a time that works for you. Our team will call to understand your algo idea and provide a development quote.</p>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <iframe 
                  src="https://calendly.com/xtinservices/meeting" 
                  width="100%" 
                  height="500" 
                  frameBorder="0"
                  title="Schedule Algorithm Strategy Call"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Algo Subscription Modal */}
      <PublisherApplicationsModal
        open={showMyApplications}
        onClose={() => setShowMyApplications(false)}
        onEdit={editApplication}
        refreshKey={applicationsRefresh}
      />

      <AlgoDetailsModal
        algoName={detailsAlgo}
        onClose={() => setDetailsAlgo(null)}
        onSubscribe={(name) => {
          setDetailsAlgo(null);
          subscribeToAlgo(name);
        }}
      />

      {showAlgoSubscribeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-6 text-white">
              <div className="flex items-start justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedAlgoName}</h2>
                    <p className="text-green-100 text-sm">Monthly Subscription</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-semibold tabular-nums tracking-[-0.02em] text-white">₹4,999</p>
                    <ApproxPrice inr={4999} className="block text-green-100" />
                    <p className="text-green-200 text-xs">/month</p>
                  </div>
                  <button 
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    onClick={() => {
                      setShowAlgoSubscribeModal(false);
                      setTermsAccepted(false);
                    }}
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-6">
              {/* Premium Launch Offer Banner - Minimal & Elegant */}
              <div className="border border-green-200 bg-green-50/50 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Early Access Pricing</p>
                    <p className="text-xs text-gray-600">Special launch rate • Limited availability</p>
                  </div>
                </div>
              </div>

              {/* What You Get */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  What You Get
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Full algorithm access on TradingView
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Real-time buy/sell signals
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Works on multiple timeframes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Setup within 24 hours guaranteed
                  </li>
                </ul>
              </div>

              {/* User Details Form */}
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TradingView Username <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={tradingViewUsername}
                    onChange={(e) => setTradingViewUsername(e.target.value)}
                    placeholder="Enter your TradingView username"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">We'll add the indicator to this account</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="tel" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">For delivery confirmation & support</p>
                </div>
              </div>
              
              {/* Terms and Conditions Checkbox */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                  <div className="text-sm text-gray-700">
                    <p>
                      I have read and agree to the{' '}
                      <Link to="/algo-terms" target="_blank" className="text-green-600 hover:text-green-700 font-semibold underline">
                        Algorithm Trading Terms & Conditions
                      </Link>
                      {' '}including risk disclosures, refund policy, and service terms.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="text-red-500">*</span> Required to proceed with subscription
                    </p>
                  </div>
                </label>
              </div>
              
              <CouponField
                className="mb-4"
                product="xtin_algo_subscription"
                amount={499900}
                currency="INR"
                value={algoCoupon}
                onChange={setAlgoCoupon}
              />

              {/* Payment Error */}
              {paymentError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    {paymentError}
                  </p>
                </div>
              )}

              {/* Pay Now Button */}
              <button
                onClick={handleAlgoPayment}
                disabled={isPaymentProcessing || !termsAccepted}
                className={`w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 ${
                  (!termsAccepted || isPaymentProcessing) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isPaymentProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Pay ₹4,999 & Subscribe
                  </>
                )}
              </button>

              {!termsAccepted && (
                <p className="text-center text-xs text-red-500 mt-2">
                  Please accept the Terms & Conditions to proceed with payment
                </p>
              )}
              
              <p className="text-center text-xs text-gray-400 mt-3">
                Secure payment powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Algo Subscription Success Modal */}
      {showAlgoSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            {/* Success Header */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-8 text-white text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">🎉 Welcome Aboard!</h2>
              <p className="text-green-100">Your subscription is now active</p>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-5 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">What Happens Next?</p>
                    <p className="text-sm text-gray-600">Within 24 hours</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">1.</span>
                    Our team will add <strong>{selectedAlgoName}</strong> to your TradingView account
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">2.</span>
                    You'll receive a confirmation on your phone
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">3.</span>
                    The indicator will appear in your Pine Script library
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <p className="text-sm text-gray-700 mb-2"><strong>Your Details:</strong></p>
                <p className="text-sm text-gray-600">TradingView: <span className="font-medium text-gray-900">{tradingViewUsername || 'Not provided'}</span></p>
                <p className="text-sm text-gray-600">Phone: <span className="font-medium text-gray-900">{phoneNumber || 'Not provided'}</span></p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
                <p className="text-xs text-amber-800 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  Need help? Contact us at support@xtincapital.com
                </p>
              </div>
              
              <button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/20"
                onClick={() => {
                  setShowAlgoSuccessModal(false);
                  setTradingViewUsername('');
                  setPhoneNumber('');
                }}
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Modal */}
      {showConsultationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Schedule Algorithm Consultation</h2>
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                onClick={closeConsultationModal}
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What to Expect</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    30-minute personalized session with our algorithm expert
                  </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Detailed explanation of {selectedAlgoName} features and performance
              </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Implementation guidance for your trading setup
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Q&A session tailored to your requirements
                  </li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <iframe 
                  src="https://calendly.com/xtinservice/algorithm-consultation" 
                  width="100%" 
                  height="500" 
                  frameBorder="0"
                  title="Schedule Consultation"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publisher Modal */}
      {showPublisherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">{editingApplication ? 'Edit your application' : 'Apply to Publish Your Algorithm'}</h2>
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                onClick={closePublisherForm}
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <form key={editingApplication?.id ?? 'new'} className="space-y-4" onSubmit={handlePublisherSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                  <input name="applicant_name" defaultValue={editingApplication?.applicant_name ?? ""} 
                    type="text" 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input name="applicant_email" defaultValue={editingApplication?.applicant_email ?? ""} 
                    type="email" 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Algorithm Name *</label>
                  <input name="algo_name" defaultValue={editingApplication?.algo_name ?? ""} 
                    type="text" 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Strategy Type *</label>
                  <select name="strategy_type" defaultValue={editingApplication?.strategy_type ?? ""} 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Strategy Type</option>
                    <option value="trend">Trend Following</option>
                    <option value="mean-reversion">Mean Reversion</option>
                    <option value="breakout">Breakout</option>
                    <option value="scalping">Scalping</option>
                    <option value="momentum">Momentum</option>
                    <option value="options">Options Strategy</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Class *</label>
                  <select name="asset_class" defaultValue={editingApplication?.asset_class ?? ""} 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Asset Class</option>
                    <option value="stocks">Stocks</option>
                    <option value="forex">Forex</option>
                    <option value="crypto">Cryptocurrency</option>
                    <option value="commodities">Commodities</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Price (INR) *</label>
                  <ExpectedPriceInput initial={editingApplication?.expected_price} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Backtesting Results Summary *</label>
                  <textarea name="backtest_summary" defaultValue={editingApplication?.backtest_summary ?? ""} 
                    rows={4} 
                    required 
                    placeholder="Provide key metrics like returns, win rate, max drawdown, etc."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Algorithm Description *</label>
                  <textarea name="description" defaultValue={editingApplication?.description ?? ""} 
                    rows={5} 
                    required 
                    placeholder="Describe your algorithm, its logic, and unique features"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Trading Experience *</label>
                  <select name="experience" defaultValue={editingApplication?.experience ?? ""} 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Experience Level</option>
                    <option value="1-2">1-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
                <div className="flex items-start gap-2">
                  <input 
                    type="checkbox" 
                    required 
                    defaultChecked={!!editingApplication}
                    className="mt-1"
                  />
                  <label className="text-sm text-gray-700">
                    I agree to the{' '}
                    <Link to="/publisher-terms" target="_blank" className="text-green-600 hover:underline">Terms & Conditions</Link>
                    {' '}and{' '}
                    <Link to="/revenue-share" target="_blank" className="text-green-600 hover:underline">Revenue Share Agreement</Link>
                    {' '}*
                  </label>
                </div>
                {publisherMessage && (
                  <p role="alert" className="text-sm font-medium text-red-600">{publisherMessage.text}</p>
                )}
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition"
                    onClick={closePublisherForm}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={publisherSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-lg transition"
                  >
                    {publisherSubmitting ? (editingApplication ? 'Saving…' : 'Submitting…') : editingApplication ? 'Save changes' : 'Submit Application'}
                  </button>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm text-amber-900">
                    Your algorithm will be published after our team reviews your submission.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">✅ Thank You!</h2>
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                onClick={closeSuccessModal}
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700">
                Thanks for your enquiry! One of our algorithm experts will join your scheduled meeting to explain all features and guide implementation.
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AlgosPage;