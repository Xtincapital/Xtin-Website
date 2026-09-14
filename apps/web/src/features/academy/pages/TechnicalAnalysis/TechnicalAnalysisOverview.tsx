import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaLock, FaCheckCircle, FaTimesCircle, FaChartLine } from 'react-icons/fa';

// SVG 1: What is Technical Analysis - Visual Definition
const WhatIsTechnicalAnalysisSVG = () => (
  <svg viewBox="0 0 560 280" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="560" height="280" fill="#f8fafc" rx="12"/>
    
    {/* Title */}
    <text x="280" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Technical Analysis: Reading Price History</text>
    
    {/* Price Chart Area */}
    <rect x="30" y="50" width="320" height="200" fill="#ffffff" rx="8" stroke="#e2e8f0" strokeWidth="2"/>
    
    {/* Y-axis labels */}
    <text x="20" y="75" textAnchor="end" fontSize="9" fill="#94a3b8">$150</text>
    <text x="20" y="125" textAnchor="end" fontSize="9" fill="#94a3b8">$120</text>
    <text x="20" y="175" textAnchor="end" fontSize="9" fill="#94a3b8">$90</text>
    <text x="20" y="225" textAnchor="end" fontSize="9" fill="#94a3b8">$60</text>
    
    {/* Grid lines */}
    <line x1="35" y1="75" x2="345" y2="75" stroke="#f1f5f9" strokeWidth="1"/>
    <line x1="35" y1="125" x2="345" y2="125" stroke="#f1f5f9" strokeWidth="1"/>
    <line x1="35" y1="175" x2="345" y2="175" stroke="#f1f5f9" strokeWidth="1"/>
    <line x1="35" y1="225" x2="345" y2="225" stroke="#f1f5f9" strokeWidth="1"/>
    
    {/* Price line - realistic chart pattern */}
    <path 
      d="M45 180 L70 170 L95 185 L120 160 L145 145 L170 155 L195 130 L220 120 L245 135 L270 110 L295 100 L320 115 L340 95" 
      fill="none" 
      stroke="#3b82f6" 
      strokeWidth="3" 
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Data points */}
    <circle cx="145" cy="145" r="5" fill="#3b82f6"/>
    <circle cx="220" cy="120" r="5" fill="#3b82f6"/>
    <circle cx="295" cy="100" r="5" fill="#3b82f6"/>
    
    {/* Annotation arrows */}
    <path d="M145 130 L145 110" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead)"/>
    <text x="145" y="105" textAnchor="middle" fontSize="8" fill="#64748b">Higher Low</text>
    
    <path d="M295 85 L295 65" stroke="#64748b" strokeWidth="1.5"/>
    <text x="295" y="60" textAnchor="middle" fontSize="8" fill="#64748b">Higher High</text>
    
    {/* X-axis time labels */}
    <text x="70" y="245" textAnchor="middle" fontSize="8" fill="#94a3b8">Jan</text>
    <text x="145" y="245" textAnchor="middle" fontSize="8" fill="#94a3b8">Mar</text>
    <text x="220" y="245" textAnchor="middle" fontSize="8" fill="#94a3b8">May</text>
    <text x="295" y="245" textAnchor="middle" fontSize="8" fill="#94a3b8">Jul</text>
    
    {/* Right side explanation */}
    <rect x="370" y="55" width="175" height="190" fill="#f0f9ff" rx="8" stroke="#bae6fd" strokeWidth="1"/>
    <text x="457" y="80" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0369a1">TA Studies</text>
    
    <circle cx="390" cy="105" r="4" fill="#3b82f6"/>
    <text x="400" y="108" fontSize="9" fill="#334155">Past price movements</text>
    
    <circle cx="390" cy="130" r="4" fill="#10b981"/>
    <text x="400" y="133" fontSize="9" fill="#334155">Volume patterns</text>
    
    <circle cx="390" cy="155" r="4" fill="#8b5cf6"/>
    <text x="400" y="158" fontSize="9" fill="#334155">Chart formations</text>
    
    <circle cx="390" cy="180" r="4" fill="#f59e0b"/>
    <text x="400" y="183" fontSize="9" fill="#334155">Support & resistance</text>
    
    <line x1="385" y1="200" x2="530" y2="200" stroke="#cbd5e1" strokeWidth="1"/>
    
    <text x="457" y="220" textAnchor="middle" fontSize="9" fill="#64748b" fontStyle="italic">To understand structure,</text>
    <text x="457" y="232" textAnchor="middle" fontSize="9" fill="#64748b" fontStyle="italic">not to predict the future</text>
    
    {/* Arrow marker definition */}
    <defs>
      <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <polygon points="0 0, 6 3, 0 6" fill="#64748b"/>
      </marker>
    </defs>
  </svg>
);

// SVG 2: What TA Can and Cannot Do
const TACapabilitiesSVG = () => (
  <svg viewBox="0 0 560 300" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="560" height="300" fill="#f8fafc" rx="12"/>
    
    {/* Title */}
    <text x="280" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">What Technical Analysis Can & Cannot Do</text>
    
    {/* Left Panel - What TA Helps With */}
    <rect x="20" y="50" width="250" height="235" fill="#ecfdf5" rx="10" stroke="#86efac" strokeWidth="2"/>
    <text x="145" y="78" textAnchor="middle" fontSize="12" fontWeight="600" fill="#166534">✓ TA Helps With</text>
    
    <rect x="35" y="95" width="220" height="40" fill="#ffffff" rx="6" stroke="#d1fae5" strokeWidth="1"/>
    <text x="145" y="112" textAnchor="middle" fontSize="10" fontWeight="500" fill="#047857">Understanding Market Structure</text>
    <text x="145" y="126" textAnchor="middle" fontSize="8" fill="#059669">Is the market trending or ranging?</text>
    
    <rect x="35" y="145" width="220" height="40" fill="#ffffff" rx="6" stroke="#d1fae5" strokeWidth="1"/>
    <text x="145" y="162" textAnchor="middle" fontSize="10" fontWeight="500" fill="#047857">Identifying Key Price Levels</text>
    <text x="145" y="176" textAnchor="middle" fontSize="8" fill="#059669">Where has price reacted before?</text>
    
    <rect x="35" y="195" width="220" height="40" fill="#ffffff" rx="6" stroke="#d1fae5" strokeWidth="1"/>
    <text x="145" y="212" textAnchor="middle" fontSize="10" fontWeight="500" fill="#047857">Providing Context for Decisions</text>
    <text x="145" y="226" textAnchor="middle" fontSize="8" fill="#059669">What's the current market environment?</text>
    
    <rect x="35" y="245" width="220" height="32" fill="#ffffff" rx="6" stroke="#d1fae5" strokeWidth="1"/>
    <text x="145" y="265" textAnchor="middle" fontSize="10" fontWeight="500" fill="#047857">Timing Entry & Exit Points</text>
    
    {/* Right Panel - What TA Cannot Do */}
    <rect x="290" y="50" width="250" height="235" fill="#fef2f2" rx="10" stroke="#fca5a5" strokeWidth="2"/>
    <text x="415" y="78" textAnchor="middle" fontSize="12" fontWeight="600" fill="#dc2626">✗ TA Cannot Guarantee</text>
    
    <rect x="305" y="95" width="220" height="40" fill="#ffffff" rx="6" stroke="#fecaca" strokeWidth="1"/>
    <text x="415" y="112" textAnchor="middle" fontSize="10" fontWeight="500" fill="#b91c1c">Future Price Movements</text>
    <text x="415" y="126" textAnchor="middle" fontSize="8" fill="#dc2626">No one can predict the market</text>
    
    <rect x="305" y="145" width="220" height="40" fill="#ffffff" rx="6" stroke="#fecaca" strokeWidth="1"/>
    <text x="415" y="162" textAnchor="middle" fontSize="10" fontWeight="500" fill="#b91c1c">Profitable Trades</text>
    <text x="415" y="176" textAnchor="middle" fontSize="8" fill="#dc2626">Even good setups fail regularly</text>
    
    <rect x="305" y="195" width="220" height="40" fill="#ffffff" rx="6" stroke="#fecaca" strokeWidth="1"/>
    <text x="415" y="212" textAnchor="middle" fontSize="10" fontWeight="500" fill="#b91c1c">When News Will Move Markets</text>
    <text x="415" y="226" textAnchor="middle" fontSize="8" fill="#dc2626">Unexpected events break patterns</text>
    
    <rect x="305" y="245" width="220" height="32" fill="#ffffff" rx="6" stroke="#fecaca" strokeWidth="1"/>
    <text x="415" y="265" textAnchor="middle" fontSize="10" fontWeight="500" fill="#b91c1c">That Patterns Will Repeat</text>
  </svg>
);

// SVG 3: Charts as Tools Visual
const ChartsAsToolsSVG = () => (
  <svg viewBox="0 0 560 220" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="560" height="220" fill="#f8fafc" rx="12"/>
    
    {/* Title */}
    <text x="280" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Charts Are Tools, Not Crystal Balls</text>
    
    {/* Left - Wrong Mindset */}
    <rect x="25" y="50" width="240" height="155" fill="#fef2f2" rx="10" stroke="#fca5a5" strokeWidth="2"/>
    <text x="145" y="75" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">❌ Wrong Mindset</text>
    
    {/* Crystal ball icon */}
    <circle cx="145" cy="120" r="30" fill="#fecaca" stroke="#f87171" strokeWidth="2"/>
    <text x="145" y="125" textAnchor="middle" fontSize="20">🔮</text>
    
    <text x="145" y="165" textAnchor="middle" fontSize="10" fill="#991b1b">"This pattern means price</text>
    <text x="145" y="180" textAnchor="middle" fontSize="10" fill="#991b1b">will definitely go up!"</text>
    <text x="145" y="198" textAnchor="middle" fontSize="9" fill="#b91c1c" fontStyle="italic">Treating charts as prediction machines</text>
    
    {/* Center - VS */}
    <circle cx="280" cy="127" r="20" fill="#e2e8f0"/>
    <text x="280" y="133" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#64748b">VS</text>
    
    {/* Right - Right Mindset */}
    <rect x="295" y="50" width="240" height="155" fill="#ecfdf5" rx="10" stroke="#86efac" strokeWidth="2"/>
    <text x="415" y="75" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16a34a">✓ Right Mindset</text>
    
    {/* Tool icon */}
    <circle cx="415" cy="120" r="30" fill="#d1fae5" stroke="#4ade80" strokeWidth="2"/>
    <text x="415" y="125" textAnchor="middle" fontSize="20">🧰</text>
    
    <text x="415" y="165" textAnchor="middle" fontSize="10" fill="#166534">"This pattern shows buyers</text>
    <text x="415" y="180" textAnchor="middle" fontSize="10" fill="#166534">have been active at this level."</text>
    <text x="415" y="198" textAnchor="middle" fontSize="9" fill="#15803d" fontStyle="italic">Using charts for context and structure</text>
  </svg>
);

// SVG 4: Who This Module Is For
const AudienceSVG = () => (
  <svg viewBox="0 0 560 280" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="560" height="280" fill="#f8fafc" rx="12"/>
    
    {/* Title */}
    <text x="280" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Is This Module Right for You?</text>
    
    {/* Left Panel - Good Fit */}
    <rect x="20" y="50" width="250" height="215" fill="#f0fdf4" rx="10" stroke="#86efac" strokeWidth="2"/>
    <text x="145" y="78" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16a34a">✓ This Module Is For You If...</text>
    
    <g transform="translate(35, 95)">
      <circle cx="8" cy="8" r="5" fill="#22c55e"/>
      <text x="20" y="12" fontSize="10" fill="#166534">You've completed Trading Basics</text>
    </g>
    
    <g transform="translate(35, 120)">
      <circle cx="8" cy="8" r="5" fill="#22c55e"/>
      <text x="20" y="12" fontSize="10" fill="#166534">You learn better with visuals</text>
    </g>
    
    <g transform="translate(35, 145)">
      <circle cx="8" cy="8" r="5" fill="#22c55e"/>
      <text x="20" y="12" fontSize="10" fill="#166534">You want to understand charts</text>
    </g>
    
    <g transform="translate(35, 170)">
      <circle cx="8" cy="8" r="5" fill="#22c55e"/>
      <text x="20" y="12" fontSize="10" fill="#166534">You're curious but cautious</text>
    </g>
    
    <g transform="translate(35, 195)">
      <circle cx="8" cy="8" r="5" fill="#22c55e"/>
      <text x="20" y="12" fontSize="10" fill="#166534">You prefer logic over hype</text>
    </g>
    
    <g transform="translate(35, 220)">
      <circle cx="8" cy="8" r="5" fill="#22c55e"/>
      <text x="20" y="12" fontSize="10" fill="#166534">You value understanding over shortcuts</text>
    </g>
    
    {/* Right Panel - Not a Good Fit */}
    <rect x="290" y="50" width="250" height="215" fill="#fef2f2" rx="10" stroke="#fca5a5" strokeWidth="2"/>
    <text x="415" y="78" textAnchor="middle" fontSize="12" fontWeight="600" fill="#dc2626">✗ This Module Is NOT For You If...</text>
    
    <g transform="translate(305, 95)">
      <circle cx="8" cy="8" r="5" fill="#ef4444"/>
      <text x="20" y="12" fontSize="10" fill="#991b1b">You haven't learned trading basics</text>
    </g>
    
    <g transform="translate(305, 120)">
      <circle cx="8" cy="8" r="5" fill="#ef4444"/>
      <text x="20" y="12" fontSize="10" fill="#991b1b">You want "secret" trading signals</text>
    </g>
    
    <g transform="translate(305, 145)">
      <circle cx="8" cy="8" r="5" fill="#ef4444"/>
      <text x="20" y="12" fontSize="10" fill="#991b1b">You expect guaranteed strategies</text>
    </g>
    
    <g transform="translate(305, 170)">
      <circle cx="8" cy="8" r="5" fill="#ef4444"/>
      <text x="20" y="12" fontSize="10" fill="#991b1b">You're looking for quick profits</text>
    </g>
    
    <g transform="translate(305, 195)">
      <circle cx="8" cy="8" r="5" fill="#ef4444"/>
      <text x="20" y="12" fontSize="10" fill="#991b1b">You think TA = easy money</text>
    </g>
    
    <g transform="translate(305, 220)">
      <circle cx="8" cy="8" r="5" fill="#ef4444"/>
      <text x="20" y="12" fontSize="10" fill="#991b1b">You want to skip fundamentals</text>
    </g>
  </svg>
);

// SVG 5: Learning Outcomes Visual
const LearningOutcomesSVG = () => (
  <svg viewBox="0 0 560 240" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="560" height="240" fill="#f8fafc" rx="12"/>
    
    {/* Title */}
    <text x="280" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">After Completing This Module</text>
    
    {/* Path from confused to confident */}
    <defs>
      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fbbf24"/>
        <stop offset="100%" stopColor="#22c55e"/>
      </linearGradient>
    </defs>
    
    {/* Progress arrow */}
    <rect x="40" y="55" width="480" height="8" fill="url(#progressGradient)" rx="4"/>
    <polygon points="520,59 535,59 527,50 520,59" fill="#22c55e"/>
    <polygon points="520,59 535,59 527,68 520,59" fill="#22c55e"/>
    
    {/* Before state */}
    <rect x="30" y="80" width="160" height="145" fill="#fef3c7" rx="8" stroke="#fbbf24" strokeWidth="2"/>
    <text x="110" y="105" textAnchor="middle" fontSize="11" fontWeight="600" fill="#b45309">Before</text>
    <text x="110" y="125" textAnchor="middle" fontSize="24">😕</text>
    <text x="110" y="150" textAnchor="middle" fontSize="9" fill="#92400e">"What do these lines mean?"</text>
    <text x="110" y="165" textAnchor="middle" fontSize="9" fill="#92400e">"Is this a good time to buy?"</text>
    <text x="110" y="180" textAnchor="middle" fontSize="9" fill="#92400e">"Why do people use charts?"</text>
    <text x="110" y="195" textAnchor="middle" fontSize="9" fill="#92400e">"Are indicators magic?"</text>
    
    {/* After state */}
    <rect x="370" y="80" width="160" height="145" fill="#dcfce7" rx="8" stroke="#22c55e" strokeWidth="2"/>
    <text x="450" y="105" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">After</text>
    <text x="450" y="125" textAnchor="middle" fontSize="24">😌</text>
    <text x="450" y="150" textAnchor="middle" fontSize="9" fill="#15803d">"I can read basic price action"</text>
    <text x="450" y="165" textAnchor="middle" fontSize="9" fill="#15803d">"I understand market structure"</text>
    <text x="450" y="180" textAnchor="middle" fontSize="9" fill="#15803d">"I know what indicators can't do"</text>
    <text x="450" y="195" textAnchor="middle" fontSize="9" fill="#15803d">"Charts give context, not signals"</text>
    
    {/* Center milestone icons */}
    <circle cx="200" cy="130" r="15" fill="#fef3c7" stroke="#fbbf24" strokeWidth="2"/>
    <text x="200" y="135" textAnchor="middle" fontSize="12">📖</text>
    
    <circle cx="280" cy="130" r="15" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2"/>
    <text x="280" y="135" textAnchor="middle" fontSize="12">📊</text>
    
    <circle cx="360" cy="130" r="15" fill="#dcfce7" stroke="#22c55e" strokeWidth="2"/>
    <text x="360" y="135" textAnchor="middle" fontSize="12">🎯</text>
    
    {/* Labels below icons */}
    <text x="200" y="160" textAnchor="middle" fontSize="8" fill="#64748b">Learn</text>
    <text x="280" y="160" textAnchor="middle" fontSize="8" fill="#64748b">Practice</text>
    <text x="360" y="160" textAnchor="middle" fontSize="8" fill="#64748b">Understand</text>
  </svg>
);

const TechnicalAnalysisOverview = () => {
  const lessons = [
    { id: 1, title: 'Introduction to Price Charts', available: false, path: '/learn/technical-analysis' },
    { id: 2, title: 'Candlesticks – Reading Price Behavior', available: true, path: '/learn/technical-analysis-lesson-2' },
    { id: 3, title: 'Trends & Market Direction', available: true, path: '/learn/technical-analysis-lesson-3' },
    { id: 4, title: 'Support & Resistance (Core Concept)', available: true, path: '/learn/technical-analysis-lesson-4' },
    { id: 5, title: 'Moving Averages – Context, Not Signals', available: true, path: '/learn/technical-analysis-lesson-5' },
    { id: 6, title: 'Indicators – Purpose & Limitations', available: true, path: '/learn/technical-analysis-lesson-6' },
    { id: 7, title: 'Common Charting Mistakes Beginners Make', available: true, path: '/learn/technical-analysis-lesson-7' },
  ];

  const whatYoullUnderstand = [
    "How to read and interpret price charts with confidence",
    "What trends, support, and resistance actually mean",
    "The role of volume in confirming price movements",
    "What indicators are (and what they are NOT)",
    "Why charts provide context, not certainty",
    "How to approach charts without emotional bias"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/learn" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Learn
          </Link>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                Module 5
              </span>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <FaChartLine className="text-xs" />
                Visual Foundations
              </span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mt-2">
              Technical Analysis
            </h1>
            <p className="text-xl text-gray-600 mt-2">Visual Foundations for Beginners</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <span>📚 7 Lessons</span>
              <span>⏱️ ~45 mins</span>
              <span>🎯 Beginner</span>
            </div>
          </div>
        </div>

        {/* Core Philosophy Note */}
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-6 shadow-md mb-8 border border-blue-300">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500 rounded-full p-3 flex-shrink-0">
              <FaChartLine className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-800 mb-2">Our Philosophy</h3>
              <p className="text-blue-900">
                <strong>Charts are tools, not crystal balls.</strong> This module focuses on helping you 
                understand what you're looking at—not on making predictions. We prioritize clarity over 
                complexity, and understanding over memorization.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: What is Technical Analysis */}
        <section className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">What is Technical Analysis?</h2>
          <div className="prose max-w-none text-gray-700">
            <p className="text-lg leading-relaxed mb-4">
              <strong>Technical Analysis (TA)</strong> is the study of past price movements and trading 
              volume to understand market behavior. It uses charts and visual patterns to identify 
              trends, price levels, and market structure.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Unlike fundamental analysis (which examines a company's financial health), technical 
              analysis focuses entirely on <em>what the price has done</em>—not why. It assumes that 
              price movements reflect all available information and that patterns in price behavior 
              tend to provide useful context.
            </p>
            <p className="text-lg leading-relaxed">
              Think of it as learning to read a language. Charts tell a story about where buyers and 
              sellers have been active, where price has struggled, and what the overall market 
              environment looks like. Your job is to understand that story—not to guess the ending.
            </p>
          </div>
          
          <div className="mt-6">
            <WhatIsTechnicalAnalysisSVG />
          </div>
        </section>

        {/* Section 2: What TA Helps With */}
        <section className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">What Technical Analysis Helps With</h2>
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              When used correctly, technical analysis provides <strong>structure and context</strong> 
              for making decisions. It doesn't tell you what will happen—it helps you understand 
              what has happened and where significant price activity has occurred.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">📊 Market Structure</h3>
              <p className="text-blue-700 text-sm">
                Is the market trending up, down, or moving sideways? Understanding structure helps 
                you see the bigger picture before making any decisions.
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">🎯 Key Price Levels</h3>
              <p className="text-blue-700 text-sm">
                Where has price bounced before? Where has it struggled? Identifying these levels 
                gives you reference points for understanding market behavior.
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">⏱️ Timing Context</h3>
              <p className="text-blue-700 text-sm">
                If you're planning to enter or exit a position, charts can help you understand 
                whether the current moment has favorable or unfavorable characteristics.
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">🧠 Emotional Anchor</h3>
              <p className="text-blue-700 text-sm">
                Having a visual framework can help you stay grounded and avoid emotional decisions 
                based on fear or excitement alone.
              </p>
            </div>
          </div>

          <TACapabilitiesSVG />
        </section>

        {/* Section 3: What TA Cannot Guarantee */}
        <section className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">What Technical Analysis Cannot Guarantee</h2>
          
          <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 mb-6">
            <p className="text-amber-800 font-medium text-lg">
              ⚠️ Critical Understanding: No form of analysis—technical, fundamental, or otherwise—can 
              predict the future with certainty. Markets are influenced by countless unpredictable factors.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <FaTimesCircle className="text-red-500 text-xl flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-red-800">Future Price Movements</h4>
                <p className="text-red-700 text-sm mt-1">
                  Charts show history, not the future. A pattern that "worked" 100 times before 
                  can fail the next time due to unexpected news, sentiment shifts, or other factors.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <FaTimesCircle className="text-red-500 text-xl flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-red-800">Profitable Trades</h4>
                <p className="text-red-700 text-sm mt-1">
                  Even the most "perfect" chart setup can result in a loss. Professional traders 
                  lose regularly—they succeed by managing losses, not by avoiding them entirely.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <FaTimesCircle className="text-red-500 text-xl flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-red-800">Protection from News Events</h4>
                <p className="text-red-700 text-sm mt-1">
                  Earnings reports, economic data, geopolitical events—these can invalidate any 
                  chart pattern instantly. TA cannot account for information that doesn't exist yet.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <FaTimesCircle className="text-red-500 text-xl flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-red-800">That History Will Repeat</h4>
                <p className="text-red-700 text-sm mt-1">
                  While patterns can provide context, markets evolve. What worked in one market 
                  condition may not work in another. Context matters more than patterns.
                </p>
              </div>
            </div>
          </div>

          <ChartsAsToolsSVG />
        </section>

        {/* Section 4: Who This Module Is For */}
        <section className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Who This Module Is For (And Who It's Not For)</h2>
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              This module is designed for learners who have completed the Trading Basics module and 
              want to understand how to read charts. It's built for visual learners who appreciate 
              clear explanations over jargon.
            </p>
          </div>
          
          <AudienceSVG />
          
          <div className="mt-6 bg-slate-100 rounded-xl p-5 border border-slate-300">
            <p className="text-slate-700">
              <strong>💡 Note:</strong> If you're looking for advanced trading strategies or 
              indicator-based systems, this module isn't the right fit. We focus on building 
              a strong foundation of understanding—not on providing trading signals or shortcuts.
            </p>
          </div>
        </section>

        {/* Section 5: What You'll Understand */}
        <section className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">What You'll Understand After This Module</h2>
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              By the end of this module, you won't be a trading expert—but you'll have a solid 
              foundation for understanding what you see on a price chart.
            </p>
          </div>

          <LearningOutcomesSVG />

          <div className="mt-6 grid md:grid-cols-2 gap-3">
            {whatYoullUnderstand.map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-green-50 rounded-lg p-3 border border-green-200">
                <FaCheckCircle className="text-green-600 flex-shrink-0" />
                <span className="text-green-800 text-sm">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-blue-50 rounded-xl p-5 border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">The Goal</h4>
            <p className="text-blue-700">
              Our goal isn't to make you a trader—it's to make you <strong>chart-literate</strong>. 
              When you see a price chart after completing this module, you'll understand what 
              you're looking at, what it means, and—just as importantly—what it doesn't mean.
            </p>
          </div>
        </section>

        {/* Prerequisites */}
        <section className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-md mb-8 border border-indigo-200">
          <h2 className="text-xl font-bold text-indigo-800 mb-4">📋 Prerequisites</h2>
          <p className="text-indigo-700 mb-4">Before starting this module, you should have completed:</p>
          <div className="space-y-2">
            <Link to="/learn/personal-finance-basics" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800">
              <FaCheckCircle className="text-green-500" />
              <span>Module 1: Personal Finance Fundamentals</span>
            </Link>
            <Link to="/learn/stock-market" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800">
              <FaCheckCircle className="text-green-500" />
              <span>Module 3: Stock Market Basics</span>
            </Link>
            <Link to="/learn/trading-basics" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800">
              <FaCheckCircle className="text-green-500" />
              <span>Module 4: Trading Basics (Required)</span>
            </Link>
          </div>
        </section>

        {/* Lessons List */}
        <section className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Lessons</h2>
          <div className="space-y-3">
            {lessons.map((lesson) => (
              lesson.available ? (
                <Link
                  key={lesson.id}
                  to={lesson.path}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:border-blue-400 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                      {lesson.id}
                    </span>
                    <span className="text-gray-800 font-medium">{lesson.title}</span>
                  </div>
                  <span className="text-blue-600">Start →</span>
                </Link>
              ) : (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 bg-gray-50 cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center font-semibold">
                      {lesson.id}
                    </span>
                    <span className="text-gray-500 font-medium">{lesson.title}</span>
                  </div>
                  <FaLock className="text-gray-400" />
                </div>
              )
            ))}
          </div>
          
          <div className="mt-6 bg-slate-100 rounded-xl p-4 text-center">
            <p className="text-slate-600 text-sm">
              🚧 Lessons coming soon. Check back for updates!
            </p>
          </div>
        </section>

        {/* Final Note */}
        <div className="mt-8 bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-8 shadow-lg text-white">
          <h3 className="text-xl font-bold mb-3">A Note on Our Approach</h3>
          <p className="text-slate-200 leading-relaxed mb-4">
            We believe in honest, no-hype education. You won't find promises of "secret patterns" 
            or guaranteed profits here. Technical analysis is a skill that takes time to develop, 
            and even then, it provides context—not certainty.
          </p>
          <p className="text-slate-200 leading-relaxed">
            If you finish this module and decide that chart analysis isn't for you, that's a 
            perfectly valid outcome. Understanding what something is—and isn't—is valuable 
            knowledge in itself.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TechnicalAnalysisOverview;
