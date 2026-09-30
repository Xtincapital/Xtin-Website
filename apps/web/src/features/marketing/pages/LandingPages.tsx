import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../../../components/Navbar';
import Hero from '../components/Hero';
import GuestHomeHero from '../components/GuestHomeHero';
import ToolsSection from '../components/ToolsSection';
import Footer from '../../../components/Footer';
import ChatWidget from '../../../components/ChatWidget';
import SEO, { generateBreadcrumbData } from '../../../components/SEO';
import SignInModal from '../../../components/SignInModal';
import { useAuth } from '../../../contexts/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (user) {
      return;
    }

    const SESSION_SEEN_KEY = 'home_login_prompt_seen_session';
    const DISMISSED_AT_KEY = 'home_login_prompt_dismissed_at';
    const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000;
    const ENGAGEMENT_DELAY_MS = 25000;
    const FORCE_DELAY_MS = 45000;
    const MIN_SCROLL_PERCENT = 20;

    if (sessionStorage.getItem(SESSION_SEEN_KEY) === 'true') {
      return;
    }

    const dismissedAt = Number(localStorage.getItem(DISMISSED_AT_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) {
      return;
    }

    let hasOpened = false;
    let hasEnoughScroll = false;
    let hasWaitedEnough = false;

    const openPrompt = () => {
      if (hasOpened) {
        return;
      }
      hasOpened = true;
      sessionStorage.setItem(SESSION_SEEN_KEY, 'true');
      setShowLoginPrompt(true);
    };

    const maybeOpenByEngagement = () => {
      if (hasEnoughScroll && hasWaitedEnough) {
        openPrompt();
      }
    };

    const onScroll = () => {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (documentHeight <= 0) {
        return;
      }

      const scrollPercent = (window.scrollY / documentHeight) * 100;
      if (scrollPercent >= MIN_SCROLL_PERCENT) {
        hasEnoughScroll = true;
        maybeOpenByEngagement();
      }
    };

    const engagementTimer = window.setTimeout(() => {
      hasWaitedEnough = true;
      maybeOpenByEngagement();
    }, ENGAGEMENT_DELAY_MS);

    const forceTimer = window.setTimeout(() => {
      openPrompt();
    }, FORCE_DELAY_MS);

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.clearTimeout(engagementTimer);
      window.clearTimeout(forceTimer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [user]);

  const handlePromptClose = () => {
    localStorage.setItem('home_login_prompt_dismissed_at', String(Date.now()));
    setShowLoginPrompt(false);
  };

  const handlePromptSuccess = () => {
    setShowLoginPrompt(false);
    navigate('/dashboard');
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': 'Xtin Capital - AI Trading Tools, Research & Financial Education',
    'description': 'AI-powered algo trading tools, market research, financial calculators & education for modern investors.',
    'url': 'https://www.xtincapital.com/',
    'mainEntity': {
      '@type': 'FinancialService',
      'name': 'Xtin Capital',
      'description': 'Algorithmic trading and financial education platform offering AI-powered tools, market research, and learning resources.',
      'serviceType': ['Algorithmic Trading Tools', 'Market Research', 'Financial Calculators', 'Trading Education'],
      'areaServed': {
        '@type': 'Country',
        'name': 'India'
      }
    }
  };

  return (
    <div className="bg-white text-gray-900">
      <SEO
        title="AI Trading Tools, Research & Financial Education"
        description="Xtin Capital: AI-powered algo trading tools, market research, financial calculators & courses. Smarter investing tools for modern Indian investors."
        keywords="algorithmic trading, trading platform, stock market, AI trading, financial calculators, trading journal, market newsletter, financial education, trading algorithms, quantitative research"
        canonicalUrl="/"
        structuredData={structuredData}
      />
      <Navbar />
      <main id="main-content">
        {user ? <Hero /> : <GuestHomeHero />}
        {user && <ToolsSection />}
      </main>
      <Footer />
      <ChatWidget />
      <SignInModal
        isOpen={showLoginPrompt}
        onClose={handlePromptClose}
        onSuccess={handlePromptSuccess}
        targetToolPath="/dashboard"
        headline="Welcome to Xtin Capital"
        description="You have explored enough to unlock your dashboard. Sign in now to save progress, access premium tools, and get personalized insights."
      />
    </div>
  );
};

export default LandingPage;
