import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle, FaLightbulb, FaFileInvoiceDollar } from 'react-icons/fa';
import ModuleBadge from "../../components/ModuleBadge";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

// SVG 1: What Are Taxes - Simple Definition
const WhatAreTaxesSVG = () => (
  <svg viewBox="0 0 700 240" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="240" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">What Are Taxes? A Simple Definition</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Breaking it down to the basics</text>
    
    {/* Main definition box */}
    <g transform="translate(100, 70)">
      <rect x="0" y="0" width="500" height="80" fill="#dbeafe" rx="12" stroke="#3b82f6" strokeWidth="2"/>
      <text x="250" y="30" textAnchor="middle" fontSize="12" fontWeight="600" fill="#1e40af">💰 Taxes = A portion of your money paid to the government</text>
      <text x="250" y="55" textAnchor="middle" fontSize="10" fill="#1e3a8a">When you earn money, buy things, or own property,</text>
      <text x="250" y="72" textAnchor="middle" fontSize="10" fill="#1e3a8a">the government takes a percentage to fund public services.</text>
    </g>
    
    {/* Three key points */}
    <g transform="translate(50, 165)">
      <rect x="0" y="0" width="190" height="55" fill="#dcfce7" rx="8"/>
      <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">📋 Mandatory</text>
      <text x="95" y="40" textAnchor="middle" fontSize="8" fill="#374151">Everyone who earns must</text>
      <text x="95" y="52" textAnchor="middle" fontSize="8" fill="#374151">pay taxes — it's the law</text>
    </g>
    
    <g transform="translate(255, 165)">
      <rect x="0" y="0" width="190" height="55" fill="#fef3c7" rx="8"/>
      <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#92400e">📊 Percentage-Based</text>
      <text x="95" y="40" textAnchor="middle" fontSize="8" fill="#374151">Usually a % of what you</text>
      <text x="95" y="52" textAnchor="middle" fontSize="8" fill="#374151">earn, spend, or own</text>
    </g>
    
    <g transform="translate(460, 165)">
      <rect x="0" y="0" width="190" height="55" fill="#e0e7ff" rx="8"/>
      <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#4338ca">🏛️ For Public Good</text>
      <text x="95" y="40" textAnchor="middle" fontSize="8" fill="#374151">Funds services everyone</text>
      <text x="95" y="52" textAnchor="middle" fontSize="8" fill="#374151">uses and benefits from</text>
    </g>
  </svg>
);

// SVG 2: Why Taxes Exist
const WhyTaxesExistSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Why Do Governments Collect Taxes?</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Taxes fund the things we all use but can't pay for individually</text>
    
    {/* Central government icon */}
    <g transform="translate(300, 75)">
      <rect x="0" y="0" width="100" height="70" fill="#dbeafe" rx="10" stroke="#3b82f6" strokeWidth="2"/>
      <text x="50" y="30" textAnchor="middle" fontSize="24">🏛️</text>
      <text x="50" y="52" textAnchor="middle" fontSize="8" fontWeight="600" fill="#1e40af">Government</text>
      <text x="50" y="64" textAnchor="middle" fontSize="7" fill="#3b82f6">Collects Taxes</text>
    </g>
    
    {/* Arrow down */}
    <polygon points="350,155 340,145 345,145 345,150 355,150 355,145 360,145" fill="#3b82f6"/>
    
    {/* What taxes fund - 6 boxes */}
    <g transform="translate(50, 170)">
      {/* Row 1 */}
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="140" height="65" fill="#dcfce7" rx="8" stroke="#86efac" strokeWidth="1"/>
        <text x="70" y="22" textAnchor="middle" fontSize="16">🛣️</text>
        <text x="70" y="40" textAnchor="middle" fontSize="8" fontWeight="500" fill="#166534">Roads & Bridges</text>
        <text x="70" y="52" textAnchor="middle" fontSize="7" fill="#374151">Infrastructure we all use</text>
      </g>
      
      <g transform="translate(155, 0)">
        <rect x="0" y="0" width="140" height="65" fill="#dbeafe" rx="8" stroke="#93c5fd" strokeWidth="1"/>
        <text x="70" y="22" textAnchor="middle" fontSize="16">🏫</text>
        <text x="70" y="40" textAnchor="middle" fontSize="8" fontWeight="500" fill="#1e40af">Public Schools</text>
        <text x="70" y="52" textAnchor="middle" fontSize="7" fill="#374151">Education for everyone</text>
      </g>
      
      <g transform="translate(310, 0)">
        <rect x="0" y="0" width="140" height="65" fill="#fef3c7" rx="8" stroke="#fcd34d" strokeWidth="1"/>
        <text x="70" y="22" textAnchor="middle" fontSize="16">🏥</text>
        <text x="70" y="40" textAnchor="middle" fontSize="8" fontWeight="500" fill="#92400e">Healthcare</text>
        <text x="70" y="52" textAnchor="middle" fontSize="7" fill="#374151">Public health services</text>
      </g>
      
      <g transform="translate(465, 0)">
        <rect x="0" y="0" width="140" height="65" fill="#e0e7ff" rx="8" stroke="#a5b4fc" strokeWidth="1"/>
        <text x="70" y="22" textAnchor="middle" fontSize="16">🚔</text>
        <text x="70" y="40" textAnchor="middle" fontSize="8" fontWeight="500" fill="#4338ca">Police & Safety</text>
        <text x="70" y="52" textAnchor="middle" fontSize="7" fill="#374151">Keeping us secure</text>
      </g>
      
      {/* Row 2 */}
      <g transform="translate(77, 80)">
        <rect x="0" y="0" width="140" height="65" fill="#fce7f3" rx="8" stroke="#f9a8d4" strokeWidth="1"/>
        <text x="70" y="22" textAnchor="middle" fontSize="16">🎖️</text>
        <text x="70" y="40" textAnchor="middle" fontSize="8" fontWeight="500" fill="#be185d">Defense</text>
        <text x="70" y="52" textAnchor="middle" fontSize="7" fill="#374151">National security</text>
      </g>
      
      <g transform="translate(232, 80)">
        <rect x="0" y="0" width="140" height="65" fill="#d1fae5" rx="8" stroke="#6ee7b7" strokeWidth="1"/>
        <text x="70" y="22" textAnchor="middle" fontSize="16">👴</text>
        <text x="70" y="40" textAnchor="middle" fontSize="8" fontWeight="500" fill="#047857">Social Security</text>
        <text x="70" y="52" textAnchor="middle" fontSize="7" fill="#374151">Support for elderly</text>
      </g>
      
      <g transform="translate(387, 80)">
        <rect x="0" y="0" width="140" height="65" fill="#cffafe" rx="8" stroke="#67e8f9" strokeWidth="1"/>
        <text x="70" y="22" textAnchor="middle" fontSize="16">💡</text>
        <text x="70" y="40" textAnchor="middle" fontSize="8" fontWeight="500" fill="#0e7490">Public Utilities</text>
        <text x="70" y="52" textAnchor="middle" fontSize="7" fill="#374151">Water, electricity, etc.</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="315" width="500" height="18" fill="#1e40af" rx="4"/>
    <text x="350" y="327" textAnchor="middle" fontSize="8" fill="white">Without taxes, these services wouldn't exist or would have to be paid for individually — which most people couldn't afford.</text>
  </svg>
);

// SVG 3: Earning vs Keeping
const EarningVsKeepingSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Earning Money vs. Keeping Money</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">The difference between your salary and what you actually get</text>
    
    {/* Visual flow */}
    <g transform="translate(50, 80)">
      {/* You earn */}
      <rect x="0" y="0" width="160" height="100" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="80" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">💼 You Earn</text>
      <text x="80" y="50" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#166534">$5,000</text>
      <text x="80" y="70" textAnchor="middle" fontSize="9" fill="#374151">Your gross salary</text>
      <text x="80" y="85" textAnchor="middle" fontSize="8" fill="#64748b">(before anything is taken)</text>
    </g>
    
    {/* Arrow */}
    <g transform="translate(220, 115)">
      <polygon points="0,15 40,15 40,5 60,20 40,35 40,25 0,25" fill="#64748b"/>
    </g>
    
    {/* Taxes taken */}
    <g transform="translate(290, 80)">
      <rect x="0" y="0" width="160" height="100" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="80" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">🏛️ Taxes Taken</text>
      <text x="80" y="50" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#dc2626">-$1,000</text>
      <text x="80" y="70" textAnchor="middle" fontSize="9" fill="#374151">Government's share</text>
      <text x="80" y="85" textAnchor="middle" fontSize="8" fill="#64748b">(20% in this example)</text>
    </g>
    
    {/* Arrow */}
    <g transform="translate(460, 115)">
      <polygon points="0,15 40,15 40,5 60,20 40,35 40,25 0,25" fill="#64748b"/>
    </g>
    
    {/* You keep */}
    <g transform="translate(530, 80)">
      <rect x="0" y="0" width="160" height="100" fill="#dbeafe" rx="12" stroke="#3b82f6" strokeWidth="2"/>
      <text x="80" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e40af">💰 You Keep</text>
      <text x="80" y="50" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#1e40af">$4,000</text>
      <text x="80" y="70" textAnchor="middle" fontSize="9" fill="#374151">Your net income</text>
      <text x="80" y="85" textAnchor="middle" fontSize="8" fill="#64748b">(what actually reaches you)</text>
    </g>
    
    {/* Key insight box */}
    <g transform="translate(100, 200)">
      <rect x="0" y="0" width="500" height="60" fill="white" rx="10" stroke="#e5e7eb" strokeWidth="1"/>
      <text x="250" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#334155">🔑 Key Insight</text>
      <text x="250" y="40" textAnchor="middle" fontSize="9" fill="#374151">Your "salary" isn't what you actually receive. Taxes are usually deducted automatically,</text>
      <text x="250" y="54" textAnchor="middle" fontSize="9" fill="#374151">so you never even see that money — it goes directly to the government.</text>
    </g>
  </svg>
);

// SVG 4: Types of Things That Get Taxed
const WhatGetsTaxedSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">What Can Get Taxed?</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Taxes apply to many different aspects of your financial life</text>
    
    {/* Four main categories */}
    <g transform="translate(50, 75)">
      {/* Income */}
      <rect x="0" y="0" width="140" height="140" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="70" y="30" textAnchor="middle" fontSize="24">💵</text>
      <text x="70" y="55" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">Income</text>
      <text x="70" y="75" textAnchor="middle" fontSize="8" fill="#374151">Salary you earn</text>
      <text x="70" y="90" textAnchor="middle" fontSize="8" fill="#374151">Business profits</text>
      <text x="70" y="105" textAnchor="middle" fontSize="8" fill="#374151">Investment gains</text>
      <text x="70" y="120" textAnchor="middle" fontSize="8" fill="#374151">Interest earned</text>
      <text x="70" y="135" textAnchor="middle" fontSize="7" fill="#166534">Most common tax</text>
    </g>
    
    <g transform="translate(205, 75)">
      {/* Purchases */}
      <rect x="0" y="0" width="140" height="140" fill="#dbeafe" rx="12" stroke="#93c5fd" strokeWidth="2"/>
      <text x="70" y="30" textAnchor="middle" fontSize="24">🛒</text>
      <text x="70" y="55" textAnchor="middle" fontSize="10" fontWeight="600" fill="#1e40af">Purchases</text>
      <text x="70" y="75" textAnchor="middle" fontSize="8" fill="#374151">Sales tax on goods</text>
      <text x="70" y="90" textAnchor="middle" fontSize="8" fill="#374151">VAT/GST</text>
      <text x="70" y="105" textAnchor="middle" fontSize="8" fill="#374151">Restaurant bills</text>
      <text x="70" y="120" textAnchor="middle" fontSize="8" fill="#374151">Online shopping</text>
      <text x="70" y="135" textAnchor="middle" fontSize="7" fill="#1e40af">Added at checkout</text>
    </g>
    
    <g transform="translate(360, 75)">
      {/* Property */}
      <rect x="0" y="0" width="140" height="140" fill="#fef3c7" rx="12" stroke="#fcd34d" strokeWidth="2"/>
      <text x="70" y="30" textAnchor="middle" fontSize="24">🏠</text>
      <text x="70" y="55" textAnchor="middle" fontSize="10" fontWeight="600" fill="#92400e">Property</text>
      <text x="70" y="75" textAnchor="middle" fontSize="8" fill="#374151">Home ownership</text>
      <text x="70" y="90" textAnchor="middle" fontSize="8" fill="#374151">Land value</text>
      <text x="70" y="105" textAnchor="middle" fontSize="8" fill="#374151">Vehicle registration</text>
      <text x="70" y="120" textAnchor="middle" fontSize="8" fill="#374151">Rental income</text>
      <text x="70" y="135" textAnchor="middle" fontSize="7" fill="#92400e">Annual or one-time</text>
    </g>
    
    <g transform="translate(515, 75)">
      {/* Wealth Transfer */}
      <rect x="0" y="0" width="140" height="140" fill="#e0e7ff" rx="12" stroke="#a5b4fc" strokeWidth="2"/>
      <text x="70" y="30" textAnchor="middle" fontSize="24">🎁</text>
      <text x="70" y="55" textAnchor="middle" fontSize="10" fontWeight="600" fill="#4338ca">Transfers</text>
      <text x="70" y="75" textAnchor="middle" fontSize="8" fill="#374151">Inheritance</text>
      <text x="70" y="90" textAnchor="middle" fontSize="8" fill="#374151">Large gifts</text>
      <text x="70" y="105" textAnchor="middle" fontSize="8" fill="#374151">Estate value</text>
      <text x="70" y="120" textAnchor="middle" fontSize="8" fill="#374151">Asset transfers</text>
      <text x="70" y="135" textAnchor="middle" fontSize="7" fill="#4338ca">Varies by country</text>
    </g>
    
    {/* Bottom note */}
    <rect x="100" y="230" width="500" height="40" fill="#1e40af" rx="6"/>
    <text x="350" y="247" textAnchor="middle" fontSize="9" fill="white">Different countries tax these things differently, at different rates.</text>
    <text x="350" y="262" textAnchor="middle" fontSize="8" fill="#bfdbfe">What's important is knowing that taxes touch many parts of your financial life.</text>
  </svg>
);

// SVG 5: Global Example - Maria's Salary
const GlobalExampleSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Example: Maria's First Paycheck</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">A simple example of how taxes work in real life</text>
    
    {/* Story box */}
    <g transform="translate(50, 70)">
      <rect x="0" y="0" width="600" height="65" fill="#e0f2fe" rx="10" stroke="#7dd3fc" strokeWidth="1"/>
      <text x="300" y="20" textAnchor="middle" fontSize="9" fill="#0369a1" fontWeight="500">📖 The Situation</text>
      <text x="300" y="38" textAnchor="middle" fontSize="9" fill="#374151">Maria just got her first job with a salary of $60,000 per year.</text>
      <text x="300" y="52" textAnchor="middle" fontSize="9" fill="#374151">She's excited about earning $5,000 per month — but that's not what she'll actually receive.</text>
    </g>
    
    {/* Breakdown */}
    <g transform="translate(100, 150)">
      <text x="0" y="0" fontSize="10" fontWeight="600" fill="#334155">Maria's Monthly Paycheck Breakdown:</text>
      
      {/* Gross */}
      <g transform="translate(0, 20)">
        <rect x="0" y="0" width="500" height="30" fill="#dcfce7" rx="6"/>
        <text x="15" y="20" fontSize="9" fill="#166534" fontWeight="500">Gross Salary (what she earned):</text>
        <text x="450" y="20" fontSize="10" fill="#166534" fontWeight="600">$5,000</text>
      </g>
      
      {/* Deductions */}
      <g transform="translate(0, 60)">
        <rect x="0" y="0" width="500" height="70" fill="#fef2f2" rx="6"/>
        <text x="15" y="18" fontSize="9" fill="#dc2626" fontWeight="500">Taxes Deducted:</text>
        <text x="30" y="35" fontSize="8" fill="#374151">Federal Income Tax (12%):</text>
        <text x="450" y="35" fontSize="9" fill="#dc2626">-$600</text>
        <text x="30" y="50" fontSize="8" fill="#374151">State Tax (5%):</text>
        <text x="450" y="50" fontSize="9" fill="#dc2626">-$250</text>
        <text x="30" y="65" fontSize="8" fill="#374151">Social Security & Medicare:</text>
        <text x="450" y="65" fontSize="9" fill="#dc2626">-$383</text>
      </g>
      
      {/* Net */}
      <g transform="translate(0, 140)">
        <rect x="0" y="0" width="500" height="35" fill="#dbeafe" rx="6" stroke="#3b82f6" strokeWidth="2"/>
        <text x="15" y="22" fontSize="10" fill="#1e40af" fontWeight="600">Net Paycheck (what she receives):</text>
        <text x="450" y="22" fontSize="12" fill="#1e40af" fontWeight="bold">$3,767</text>
      </g>
    </g>
    
    {/* Key takeaway */}
    <g transform="translate(100, 305)">
      <rect x="0" y="0" width="500" height="25" fill="#1e40af" rx="6"/>
      <text x="250" y="17" textAnchor="middle" fontSize="9" fill="white">Maria "earns" $5,000 but only "keeps" $3,767 — that's about 75% of her gross pay.</text>
    </g>
  </svg>
);

// SVG 6: The Social Contract
const SocialContractSVG = () => (
  <svg viewBox="0 0 700 220" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="220" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Taxes: The Social Contract</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">A two-way exchange between citizens and government</text>
    
    {/* Two-way visualization */}
    <g transform="translate(50, 75)">
      {/* Citizens */}
      <rect x="0" y="0" width="200" height="100" fill="#dbeafe" rx="12" stroke="#3b82f6" strokeWidth="2"/>
      <text x="100" y="30" textAnchor="middle" fontSize="20">👨‍👩‍👧‍👦</text>
      <text x="100" y="55" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e40af">Citizens</text>
      <text x="100" y="75" textAnchor="middle" fontSize="8" fill="#374151">Pay taxes from</text>
      <text x="100" y="88" textAnchor="middle" fontSize="8" fill="#374151">income & purchases</text>
    </g>
    
    {/* Arrows */}
    <g transform="translate(260, 100)">
      <rect x="0" y="0" width="180" height="50" fill="#f1f5f9" rx="8"/>
      <text x="90" y="18" textAnchor="middle" fontSize="8" fill="#64748b">Taxes flow to government →</text>
      <text x="90" y="38" textAnchor="middle" fontSize="8" fill="#64748b">← Services flow to citizens</text>
      <polygon points="160,12 175,12 175,8 185,15 175,22 175,18 160,18" fill="#3b82f6"/>
      <polygon points="20,35 5,35 5,31 -5,38 5,45 5,41 20,41" fill="#22c55e"/>
    </g>
    
    {/* Government */}
    <g transform="translate(450, 75)">
      <rect x="0" y="0" width="200" height="100" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="100" y="30" textAnchor="middle" fontSize="20">🏛️</text>
      <text x="100" y="55" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">Government</text>
      <text x="100" y="75" textAnchor="middle" fontSize="8" fill="#374151">Provides public services,</text>
      <text x="100" y="88" textAnchor="middle" fontSize="8" fill="#374151">infrastructure, security</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="190" width="500" height="22" fill="#334155" rx="4"/>
    <text x="350" y="205" textAnchor="middle" fontSize="8" fill="white">This is the basic "deal" of taxation: we contribute, and in return, we receive shared services.</text>
  </svg>
);

// SVG 7: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 160" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="160" fill="url(#taxTakeawayGrad)" rx="16"/>
    
    <defs>
      <linearGradient id="taxTakeawayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e40af"/>
        <stop offset="100%" stopColor="#1e3a8a"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="35" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">🎯 Key Takeaway</text>
    <text x="350" y="60" textAnchor="middle" fontSize="11" fill="white">Taxes are mandatory payments to the government that fund public services.</text>
    <text x="350" y="85" textAnchor="middle" fontSize="10" fill="#bfdbfe">What you earn (gross income) is different from what you keep (net income).</text>
    <text x="350" y="108" textAnchor="middle" fontSize="10" fill="#bfdbfe">Understanding this difference is the first step to financial awareness.</text>
    <text x="350" y="140" textAnchor="middle" fontSize="9" fill="#93c5fd">Taxes aren't optional — but understanding them helps you plan better.</text>
  </svg>
);

// SVG 8: Disclaimer Banner
const DisclaimerBannerSVG = () => (
  <svg viewBox="0 0 700 80" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="80" fill="#fef3c7" rx="12" stroke="#fcd34d" strokeWidth="2"/>
    
    {/* Warning icon */}
    <g transform="translate(30, 25)">
      <circle cx="15" cy="15" r="15" fill="#f59e0b"/>
      <text x="15" y="21" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">!</text>
    </g>
    
    {/* Text */}
    <text x="80" y="35" fontSize="11" fontWeight="600" fill="#92400e">Remember: This Is Awareness Education</text>
    <text x="80" y="55" fontSize="9" fill="#78350f">This lesson explains what taxes are — not how to calculate them or minimize them.</text>
    <text x="80" y="72" fontSize="8" fill="#78350f">For specific tax advice, always consult a qualified tax professional in your country.</text>
  </svg>
);

const TaxLesson1 = () => {
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const quizQuestions = [
    {
      id: 1,
      question: "What is the main purpose of taxes?",
      options: [
        "To make the government rich",
        "To fund public services and infrastructure that benefit everyone",
        "To punish people who earn money",
        "To control how much money people can earn"
      ],
      correct: 1,
      explanation: "Taxes fund public services like roads, schools, healthcare, police, and national defense — things that benefit everyone but would be too expensive for individuals to pay for alone."
    },
    {
      id: 2,
      question: "If someone has a salary of $4,000 per month, what's the difference between their 'gross' and 'net' income?",
      options: [
        "There's no difference — they're the same thing",
        "Gross is after taxes, net is before taxes",
        "Gross is the full salary before taxes, net is what they actually receive after taxes",
        "Gross is for businesses, net is for individuals"
      ],
      correct: 2,
      explanation: "Gross income is your total earnings before any deductions. Net income is what you actually receive after taxes and other deductions are taken out. Your net income is always less than or equal to your gross income."
    }
  ];

  const handleAnswer = (questionId, answerIndex) => {
    setQuizAnswers({ ...quizAnswers, [questionId]: answerIndex });
    setShowResults({ ...showResults, [questionId]: true });
  };

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/learn/taxes" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Tax Basics Module
          </Link>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <FaFileInvoiceDollar className="text-blue-600 text-2xl" />
              </div>
              <ModuleBadge moduleId="taxes" />
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Lesson 1 of 6 – Awareness Only
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">What Are Taxes?</h1>
            <p className="text-gray-600 text-lg">
              Understanding the basics of how taxes work and why they exist.
            </p>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="mb-8">
          <DisclaimerBannerSVG />
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Let's Start at the Beginning</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Before we can understand how taxes affect investing, we need to 
              understand what taxes actually are. If this seems basic, that's 
              intentional — many financial mistakes come from not understanding 
              fundamentals.
            </p>
            <p className="text-lg leading-relaxed">
              Let's break down taxes in the simplest possible terms.
            </p>
          </div>
          
          <WhatAreTaxesSVG />
        </div>

        {/* Why Taxes Exist */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Do Governments Collect Taxes?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Imagine if there were no taxes. Who would build the roads? Who would 
              pay the police? Who would fund the schools? Each person would have to 
              pay for these things individually — which would be impossible for most.
            </p>
            <p className="text-lg leading-relaxed">
              Taxes are how we collectively pay for things we all need but can't 
              afford on our own.
            </p>
          </div>
          
          <WhyTaxesExistSVG />
        </div>

        {/* Earning vs Keeping */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Earning Money vs. Keeping Money</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              One of the most important things to understand about taxes is the 
              difference between what you <strong>earn</strong> and what you 
              <strong>keep</strong>.
            </p>
            <p className="text-lg leading-relaxed">
              When someone says they earn $60,000 a year, that's not what they 
              actually receive. A portion goes to taxes before they ever see it.
            </p>
          </div>
          
          <EarningVsKeepingSVG />
          
          <div className="mt-6 bg-blue-50 rounded-xl p-5 border border-blue-200">
            <p className="text-blue-800">
              <strong>Why this matters:</strong> When planning your budget or 
              investments, you need to think in terms of what you actually 
              receive (net income), not what your salary says (gross income).
            </p>
          </div>
        </div>

        {/* What Gets Taxed */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">What Can Get Taxed?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Taxes don't just apply to your salary. Many parts of your 
              financial life can be subject to taxes.
            </p>
          </div>
          
          <WhatGetsTaxedSVG />
        </div>

        {/* Global Example */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Real Example: Maria's First Paycheck</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Let's see how taxes work in a practical example.
            </p>
          </div>
          
          <GlobalExampleSVG />
          
          <div className="mt-6 bg-green-50 rounded-xl p-5 border border-green-200">
            <p className="text-green-800">
              <strong>Note:</strong> The exact percentages vary by country, income 
              level, and individual circumstances. This example uses simplified 
              U.S.-style rates for illustration purposes only.
            </p>
          </div>
        </div>

        {/* Social Contract */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">The Social Contract</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Taxes represent an agreement between citizens and their government. 
              You contribute a portion of your earnings, and in return, you receive 
              access to services and infrastructure.
            </p>
          </div>
          
          <SocialContractSVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
        </div>

        {/* India Context */}
        <div className="bg-blue-50 rounded-2xl p-6 shadow-lg mb-8 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">🇮🇳 India-Specific Note</h3>
          <p className="text-blue-900 mb-3">
            In India, income tax is managed by the Income Tax Department. If you 
            earn above a certain threshold (currently ₹3 lakhs under the new 
            regime), you're required to pay income tax. Tax is usually deducted 
            at source (TDS) from your salary, similar to the example above.
          </p>
          <p className="text-blue-800 text-sm">
            India also has GST (Goods and Services Tax) on purchases, which you 
            pay whenever you buy goods or services — look at any receipt and 
            you'll see the GST breakdown.
          </p>
        </div>

        {/* Knowledge Check */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Knowledge Check</h2>
          <p className="text-gray-600 mb-6">Test your understanding of the basics.</p>
          
          <div className="space-y-8">
            {quizQuestions.map((q) => (
              <div key={q.id} className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-800 mb-4">Question {q.id}: {q.question}</h4>
                <div className="space-y-2">
                  {q.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(q.id, index)}
                      disabled={showResults[q.id]}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        showResults[q.id]
                          ? index === q.correct
                            ? 'border-green-500 bg-green-50'
                            : quizAnswers[q.id] === index
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 bg-white'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={showResults[q.id] && index === q.correct ? 'text-green-700 font-medium' : ''}>
                          {option}
                        </span>
                        {showResults[q.id] && index === q.correct && (
                          <FaCheckCircle className="text-green-500" />
                        )}
                        {showResults[q.id] && quizAnswers[q.id] === index && index !== q.correct && (
                          <FaTimesCircle className="text-red-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {showResults[q.id] && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    quizAnswers[q.id] === q.correct ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    <p className={quizAnswers[q.id] === q.correct ? 'text-green-800' : 'text-amber-800'}>
                      {quizAnswers[q.id] === q.correct ? '✓ Correct! ' : '✗ Not quite. '}
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reflection */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-lg mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <FaLightbulb className="text-2xl text-blue-200" />
            <h3 className="text-xl font-bold">Reflection Question</h3>
          </div>
          <div className="bg-white/20 rounded-xl p-5">
            <p className="text-white font-medium mb-3">Think about this:</p>
            <p className="text-blue-100 text-lg mb-4">
              "Have you ever looked at your paycheck and noticed the difference 
              between your gross and net pay? Do you know roughly what percentage 
              of your earnings go to taxes?"
            </p>
            <p className="text-blue-200 text-sm">
              If you're employed, check your next pay stub. Understanding this 
              difference is the first step to financial awareness.
            </p>
          </div>
        </div>

        {/* Lesson Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Lesson Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">What You Learned</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>✓ Taxes are mandatory payments to the government</li>
                <li>✓ They fund public services we all use</li>
                <li>✓ Gross income ≠ Net income (what you keep)</li>
                <li>✓ Many things can be taxed (income, purchases, property)</li>
              </ul>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
              <h4 className="font-semibold text-indigo-800 mb-2">Coming Next</h4>
              <ul className="text-indigo-700 text-sm space-y-1">
                <li>→ Lesson 2: Types of Taxes That Affect You</li>
                <li>→ Income tax, sales tax, and more</li>
                <li>→ How different taxes apply to you</li>
                <li>→ Understanding tax rates</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            to="/learn/taxes"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Module Overview</span>
          </Link>
          <Link
            to="/learn/tax-lesson-2"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <span>Next: Taxes on Income vs Investments</span>
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default TaxLesson1;
