import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../contexts/AuthContext';
import SignInModal from '../../../components/SignInModal';
import { JOURNAL_URL } from '../../../constants/externalApps';
import useRegion from '../../../hooks/useRegion';

// Region-natural showcase P&L figures (not FX-converted).
const JOURNAL_SHOWCASE = {
  IN:     { pnl: '+₹2.4L',   trade: '+₹12,450 profit' },
  US:     { pnl: '+$29K',    trade: '+$1,450 profit' },
  GB:     { pnl: '+£23K',    trade: '+£1,150 profit' },
  EU:     { pnl: '+€26K',    trade: '+€1,300 profit' },
  AE:     { pnl: '+$29K',    trade: '+$1,450 profit' },
  SG:     { pnl: '+S$39K',   trade: '+S$1,950 profit' },
  GLOBAL: { pnl: '+$29K',    trade: '+$1,450 profit' },
};

const JournalLanding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { region } = useRegion();
  const show = JOURNAL_SHOWCASE[region] || JOURNAL_SHOWCASE.GLOBAL;
  const [isVisible, setIsVisible] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { value: '50K+', label: 'Active Traders' },
    { value: '2M+', label: 'Trades Logged' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9★', label: 'User Rating' },
  ];

  // Handle Launch Journal button click
  const handleLaunchJournal = (e) => {
    if (!user) {
      e.preventDefault();
      setShowSignInModal(true);
    }
    // If user exists, let Link navigate normally
  };

  // Handle successful sign-in from modal
  const handleSignInSuccess = () => {
    setShowSignInModal(false);
    // User is now signed in, they can navigate to journal
  };

  return (
    <div className="min-h-screen bg-white  text-gray-900  transition-colors duration-300">
      <Navbar />

      {/* Subtle Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] " style={{
          backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.4) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/10  rounded-full blur-[120px]" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-cyan-500/5  rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-emerald-400/5  rounded-full blur-[80px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50  border border-emerald-200  rounded-full mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-emerald-700 ">Professional Trading Journal</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="text-gray-900 ">
                  Master Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  Trading Journey
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600  mb-10 leading-relaxed max-w-xl">
                The ultimate trading journal built for serious traders. Track every trade, 
                analyze patterns with <span className="text-emerald-600  font-medium">AI-powered insights</span>, 
                and transform your trading performance.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  to={JOURNAL_URL}
                  onClick={handleLaunchJournal}
                  className="group relative inline-flex items-center justify-center px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center">
                    Launch Journal
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gray-100  text-gray-700  font-semibold rounded-xl border border-gray-200  hover:bg-gray-200  transition-all duration-300"
                >
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Home
                </Link>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-emerald-600 ">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-gray-500  mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - 3D Illustration */}
            <div className={`relative transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              {/* Main Dashboard Illustration */}
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-3xl scale-90" />
                
                {/* Main Card */}
                <div className="relative bg-white  rounded-3xl border border-gray-200  p-6 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-gray-900  font-semibold">Trading Dashboard</div>
                        <div className="text-gray-500  text-sm">Real-time Analytics</div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                  </div>

                  {/* Chart Visualization */}
                  <div className="bg-gray-50  rounded-2xl p-5 mb-4">
                    <div className="flex items-end justify-between h-40 gap-2">
                      {[65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 92].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-lg transition-all duration-500"
                          style={{
                            height: `${height}%`,
                            background: height > 70 
                              ? 'linear-gradient(to top, #10b981, #34d399)' 
                              : 'linear-gradient(to top, #94a3b8, #cbd5e1)',
                            opacity: 0.9
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-3 text-xs text-gray-400">
                      <span>Jan</span>
                      <span>Mar</span>
                      <span>Jun</span>
                      <span>Sep</span>
                      <span>Dec</span>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-50  rounded-xl p-4 border border-emerald-100 ">
                      <div className="text-emerald-600  text-xs mb-1">Win Rate</div>
                      <div className="text-2xl font-bold text-gray-900 ">68.5%</div>
                      <div className="flex items-center text-emerald-600  text-xs mt-1">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        +5.2%
                      </div>
                    </div>
                    <div className="bg-cyan-50  rounded-xl p-4 border border-cyan-100 ">
                      <div className="text-cyan-600  text-xs mb-1">Profit Factor</div>
                      <div className="text-2xl font-bold text-gray-900 ">2.4x</div>
                      <div className="flex items-center text-cyan-600  text-xs mt-1">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        +0.3
                      </div>
                    </div>
                    <div className="bg-purple-50  rounded-xl p-4 border border-purple-100 ">
                      <div className="text-purple-600  text-xs mb-1">Total P&L</div>
                      <div className="text-2xl font-bold text-gray-900 ">{show.pnl}</div>
                      <div className="flex items-center text-purple-600  text-xs mt-1">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        +18%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-white  rounded-2xl border border-gray-200  p-4 shadow-xl animate-bounce-slow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100  flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-gray-900  text-sm font-medium">Trade Executed</div>
                      <div className="text-emerald-600  text-xs">{show.trade}</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white  rounded-2xl border border-gray-200  p-4 shadow-xl animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-100  flex items-center justify-center">
                      <svg className="w-5 h-5 text-cyan-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-gray-900  text-sm font-medium">AI Insight</div>
                      <div className="text-cyan-600  text-xs">Pattern detected</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-gray-300  flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-gray-400  rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* What is a Trading Journal Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 ">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Illustration */}
            <div className="relative order-2 lg:order-1">
              <div className="relative bg-white  rounded-3xl border border-gray-200  p-8 shadow-xl">
                {/* Journal Book Illustration */}
                <svg className="w-full h-auto" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Book Base */}
                  <rect x="50" y="40" width="300" height="220" rx="8" className="fill-gray-100  stroke-emerald-500/30" strokeWidth="2"/>
                  
                  {/* Book Spine */}
                  <rect x="50" y="40" width="30" height="220" rx="4" className="fill-emerald-500"/>
                  
                  {/* Pages Effect */}
                  <rect x="85" y="50" width="255" height="200" rx="4" className="fill-gray-50 "/>
                  <rect x="90" y="55" width="245" height="190" rx="4" className="fill-white "/>
                  
                  {/* Header Line */}
                  <rect x="105" y="70" width="120" height="6" rx="3" className="fill-emerald-500"/>
                  
                  {/* Trade Entry Lines */}
                  <g className="opacity-60">
                    <rect x="105" y="95" width="200" height="4" rx="2" className="fill-gray-300 "/>
                    <rect x="105" y="110" width="180" height="4" rx="2" className="fill-gray-300 "/>
                    <rect x="105" y="125" width="160" height="4" rx="2" className="fill-gray-300 "/>
                  </g>
                  
                  {/* Mini Chart */}
                  <rect x="105" y="150" width="210" height="80" rx="8" className="fill-gray-100  stroke-gray-200 " strokeWidth="1"/>
                  <path d="M120 200 L145 185 L170 195 L195 170 L220 180 L245 160 L270 165 L295 150" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none"/>
                  <circle cx="295" cy="150" r="4" fill="#10b981"/>
                  
                  {/* Floating Pen */}
                  <g transform="translate(320, 80) rotate(45)">
                    <rect x="0" y="0" width="8" height="60" rx="2" className="fill-emerald-500"/>
                    <polygon points="4,60 0,75 8,75" className="fill-gray-400 "/>
                  </g>
                  
                  {/* Decorative Elements */}
                  <circle cx="330" cy="200" r="25" className="fill-emerald-500/20"/>
                  <circle cx="340" cy="210" r="15" className="fill-cyan-500/20"/>
                </svg>
              </div>
            </div>

            {/* Right - Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50  border border-emerald-200  rounded-full mb-6">
                <svg className="w-4 h-4 text-emerald-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-emerald-700 ">Understanding the Basics</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-gray-900 ">What is a </span>
                <span className="text-emerald-600 ">Trading Journal?</span>
              </h2>

              <div className="space-y-6 text-gray-600  text-lg leading-relaxed">
                <p>
                  A trading journal is your <span className="text-gray-900  font-medium">personal record</span> of every trade you make. 
                  It's more than just logging entries and exits—it's a powerful tool that captures your 
                  <span className="text-emerald-600 "> decision-making process</span>, emotions, and market conditions.
                </p>
                <p>
                  Professional traders know that the <span className="text-gray-900  font-medium">difference between success and failure</span> often 
                  lies in the ability to learn from past trades. A journal helps you identify patterns in your behavior, 
                  understand what strategies work, and eliminate costly mistakes.
                </p>
              </div>

              {/* Key Points */}
              <div className="mt-10 space-y-4">
                {[
                  { 
                    icon: (
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="7" height="13" rx="1" className="fill-emerald-500"/>
                        <rect x="12" y="7" width="7" height="9" rx="1" className="fill-cyan-500"/>
                        <rect x="3" y="18" width="16" height="3" rx="1" className="fill-gray-300 "/>
                      </svg>
                    ), 
                    text: 'Track every entry, exit, and position size' 
                  },
                  { 
                    icon: (
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" className="fill-pink-100 "/>
                        <circle cx="12" cy="12" r="6" className="fill-pink-300 "/>
                        <circle cx="12" cy="12" r="3" className="fill-pink-500"/>
                      </svg>
                    ), 
                    text: 'Document your reasoning and emotions' 
                  },
                  { 
                    icon: (
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 20L8 15L12 18L21 9" className="stroke-emerald-500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 9H21V13" className="stroke-emerald-500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="2" y="19" width="20" height="2" rx="1" className="fill-gray-200 "/>
                      </svg>
                    ), 
                    text: 'Identify winning patterns and strategies' 
                  },
                  { 
                    icon: (
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" className="stroke-red-400" strokeWidth="2" fill="none"/>
                        <circle cx="12" cy="12" r="6" className="stroke-red-400" strokeWidth="2" fill="none"/>
                        <circle cx="12" cy="12" r="2" className="fill-red-500"/>
                        <path d="M12 2V6M12 18V22M2 12H6M18 12H22" className="stroke-red-300" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    ), 
                    text: 'Learn from losses and improve continuously' 
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-white  rounded-xl border border-gray-200  hover:border-emerald-300  transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gray-50  flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-gray-700 ">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50  border border-emerald-200  rounded-full mb-6">
              <svg className="w-4 h-4 text-emerald-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-medium text-emerald-700 ">Premium Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gray-900 ">Everything You Need to</span>
              <br />
              <span className="text-emerald-600 ">
                Trade Like a Pro
              </span>
            </h2>
            <p className="text-xl text-gray-600  max-w-3xl mx-auto">
              Powerful features designed by traders, for traders. Every tool you need to analyze, 
              improve, and master your trading strategy.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: 'Smart Trade Logging',
                description: 'Log trades with intelligent auto-fill, screenshot attachments, and detailed notes for every position.',
                color: 'emerald'
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Advanced Analytics',
                description: 'Deep dive into your performance with win rates, profit factors, drawdowns, and 20+ key metrics.',
                color: 'cyan'
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: 'AI-Powered Insights',
                description: 'Get intelligent pattern recognition and personalized recommendations to optimize your strategy.',
                color: 'purple'
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                title: 'Risk Management',
                description: 'Built-in position sizing calculator, risk-reward ratios, and portfolio exposure tracking.',
                color: 'orange'
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Trading Calendar',
                description: 'Visual calendar view of all your trades with daily, weekly, and monthly P&L summaries.',
                color: 'pink'
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: 'Secure & Private',
                description: 'Your trading data is encrypted and completely private. We never share or sell your information.',
                color: 'blue'
              },
            ].map((feature, index) => {
              const colorClasses = {
                emerald: 'bg-emerald-500 text-white',
                cyan: 'bg-cyan-500 text-white',
                purple: 'bg-purple-500 text-white',
                orange: 'bg-orange-500 text-white',
                pink: 'bg-pink-500 text-white',
                blue: 'bg-blue-500 text-white',
              };
              return (
                <div
                  key={index}
                  className="group relative bg-white  rounded-2xl p-8 border border-gray-200  hover:border-emerald-300  transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl ${colorClasses[feature.color]} flex items-center justify-center mb-6 shadow-lg`}>
                      {feature.icon}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900  mb-3">{feature.title}</h3>
                    <p className="text-gray-600  leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-50  overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50  border border-cyan-200  rounded-full mb-6">
              <svg className="w-4 h-4 text-cyan-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-cyan-700 ">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gray-900 ">Start in </span>
              <span className="text-emerald-600 ">3 Simple Steps</span>
            </h2>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-300   " />
            
            {[
              {
                step: '01',
                title: 'Create Account',
                description: 'Sign up for free in seconds. No credit card required, no hidden fees.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'Log Your Trades',
                description: 'Add your trades with all the details. Entry, exit, size, notes—everything in one place.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Analyze & Improve',
                description: 'Review your analytics, spot patterns, and continuously improve your trading performance.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                {/* Step Number Circle */}
                <div className="relative w-40 h-40 mx-auto mb-8">
                  <div className="absolute inset-0 bg-emerald-100  rounded-full blur-2xl" />
                  <div className="relative w-full h-full bg-white  rounded-full border border-gray-200  flex flex-col items-center justify-center shadow-lg">
                    <span className="text-5xl font-bold text-emerald-600 ">
                      {item.step}
                    </span>
                    <div className="text-emerald-600  mt-2">
                      {item.icon}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900  mb-3">{item.title}</h3>
                <p className="text-gray-600  max-w-xs mx-auto">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-emerald-600 rounded-3xl p-12 md:p-16 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '32px 32px'
              }} />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />

            <div className="relative text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Ready to Transform
                <br />
                Your Trading?
              </h2>
              <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
                Join thousands of successful traders who have elevated their game with Xtin Trading Journal. 
                Start for free today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to={JOURNAL_URL}
                  onClick={handleLaunchJournal}
                  className="group inline-flex items-center justify-center px-10 py-5 bg-white text-emerald-600 font-bold text-lg rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  Start Free Journal
                  <svg className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 flex flex-wrap justify-center items-center gap-6 text-emerald-200 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>100% Free Forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No Credit Card</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Bank-Level Security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Custom Styles */}
      {/* Sign In Modal */}
      {showSignInModal && (
        <SignInModal
          isOpen={showSignInModal}
          onClose={() => setShowSignInModal(false)}
          onSuccess={handleSignInSuccess}
        />
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes scroll {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(6px); opacity: 0.5; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default JournalLanding;