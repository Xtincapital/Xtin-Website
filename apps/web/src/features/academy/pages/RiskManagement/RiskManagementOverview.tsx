import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaChartLine, FaLock } from 'react-icons/fa';
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import ModuleBadge from "../../components/ModuleBadge";

// SVG 1: Capital Protection Hero
const CapitalProtectionHeroSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Central shield */}
    <defs>
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#059669"/>
        <stop offset="100%" stopColor="#10b981"/>
      </linearGradient>
      <linearGradient id="capitalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24"/>
        <stop offset="100%" stopColor="#f59e0b"/>
      </linearGradient>
    </defs>
    
    {/* Shield shape */}
    <path d="M350 40 L420 70 L420 150 Q420 220 350 260 Q280 220 280 150 L280 70 Z" 
          fill="url(#shieldGrad)" stroke="#047857" strokeWidth="3"/>
    
    {/* Dollar symbol inside shield */}
    <text x="350" y="165" textAnchor="middle" fontSize="60" fontWeight="700" fill="white">$</text>
    
    {/* Left side - Threats */}
    <g transform="translate(50, 80)">
      <rect x="0" y="0" width="180" height="140" fill="#fef2f2" rx="10" stroke="#fca5a5" strokeWidth="2"/>
      <text x="90" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">Market Threats</text>
      
      {/* Threat arrows pointing to shield */}
      <line x1="180" y1="40" x2="230" y2="70" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowRed)"/>
      <line x1="180" y1="70" x2="230" y2="90" stroke="#ef4444" strokeWidth="2"/>
      <line x1="180" y1="100" x2="230" y2="110" stroke="#ef4444" strokeWidth="2"/>
      
      <text x="90" y="55" textAnchor="middle" fontSize="9" fill="#991b1b">Volatility</text>
      <text x="90" y="80" textAnchor="middle" fontSize="9" fill="#991b1b">Drawdowns</text>
      <text x="90" y="105" textAnchor="middle" fontSize="9" fill="#991b1b">Black Swans</text>
      <text x="90" y="130" textAnchor="middle" fontSize="9" fill="#991b1b">Emotional Decisions</text>
    </g>
    
    {/* Right side - Protected outcomes */}
    <g transform="translate(470, 80)">
      <rect x="0" y="0" width="180" height="140" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="2"/>
      <text x="90" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">Protected Outcomes</text>
      
      <text x="90" y="55" textAnchor="middle" fontSize="9" fill="#14532d">✓ Capital preserved</text>
      <text x="90" y="80" textAnchor="middle" fontSize="9" fill="#14532d">✓ Survival ensured</text>
      <text x="90" y="105" textAnchor="middle" fontSize="9" fill="#14532d">✓ Consistency maintained</text>
      <text x="90" y="130" textAnchor="middle" fontSize="9" fill="#14532d">✓ Compounding enabled</text>
    </g>
    
    {/* Bottom message */}
    <text x="350" y="290" textAnchor="middle" fontSize="12" fontWeight="600" fill="#374151">Risk Management: The Shield Between You and Ruin</text>
  </svg>
);

// SVG 2: Why Risk Management Matters
const WhyRiskMattersSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Why Risk Management Matters More Than Returns</text>
    
    {/* Left: Without risk management */}
    <g transform="translate(40, 55)">
      <rect x="0" y="0" width="280" height="200" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">❌ Without Risk Management</text>
      
      {/* Declining chart */}
      <polyline points="30,60 70,55 110,70 150,65 190,100 230,140 250,170" 
                fill="none" stroke="#ef4444" strokeWidth="3"/>
      <circle cx="250" cy="170" r="5" fill="#ef4444"/>
      
      <text x="140" y="130" textAnchor="middle" fontSize="9" fill="#991b1b">$100,000 → $40,000</text>
      <text x="140" y="150" textAnchor="middle" fontSize="9" fill="#991b1b">-60% drawdown</text>
      <text x="140" y="175" textAnchor="middle" fontSize="8" fill="#7f1d1d">Needs +150% just to recover</text>
      <text x="140" y="192" textAnchor="middle" fontSize="8" fontWeight="600" fill="#dc2626">Many never recover</text>
    </g>
    
    {/* Right: With risk management */}
    <g transform="translate(380, 55)">
      <rect x="0" y="0" width="280" height="200" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">✓ With Risk Management</text>
      
      {/* Stable growth chart */}
      <polyline points="30,130 70,125 110,115 150,120 190,105 230,95 250,80" 
                fill="none" stroke="#22c55e" strokeWidth="3"/>
      <circle cx="250" cy="80" r="5" fill="#22c55e"/>
      
      <text x="140" y="130" textAnchor="middle" fontSize="9" fill="#14532d">$100,000 → $115,000</text>
      <text x="140" y="150" textAnchor="middle" fontSize="9" fill="#14532d">-12% max drawdown</text>
      <text x="140" y="175" textAnchor="middle" fontSize="8" fill="#166534">Controlled, recoverable dips</text>
      <text x="140" y="192" textAnchor="middle" fontSize="8" fontWeight="600" fill="#166534">Compounding continues</text>
    </g>
  </svg>
);

// SVG 3: The Asymmetry of Losses
const LossAsymmetrySVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">The Asymmetry of Losses</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Losses hurt more than gains help — mathematically</text>
    
    {/* Loss/Recovery bars */}
    <g transform="translate(80, 75)">
      {/* Headers */}
      <text x="80" y="0" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">Loss</text>
      <text x="200" y="0" textAnchor="middle" fontSize="10" fontWeight="600" fill="#22c55e">Gain Needed to Recover</text>
      <text x="400" y="0" textAnchor="middle" fontSize="10" fontWeight="600" fill="#64748b">Difficulty</text>
      
      {/* Row 1: -10% */}
      <rect x="30" y="20" width="100" height="28" fill="#fee2e2" rx="4"/>
      <text x="80" y="39" textAnchor="middle" fontSize="9" fontWeight="600" fill="#dc2626">-10%</text>
      <rect x="150" y="20" width="100" height="28" fill="#dcfce7" rx="4"/>
      <text x="200" y="39" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">+11%</text>
      <rect x="320" y="20" width="160" height="28" fill="#f1f5f9" rx="4"/>
      <text x="400" y="39" textAnchor="middle" fontSize="8" fill="#64748b">Manageable</text>
      
      {/* Row 2: -25% */}
      <rect x="30" y="58" width="100" height="28" fill="#fecaca" rx="4"/>
      <text x="80" y="77" textAnchor="middle" fontSize="9" fontWeight="600" fill="#dc2626">-25%</text>
      <rect x="150" y="58" width="100" height="28" fill="#bbf7d0" rx="4"/>
      <text x="200" y="77" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">+33%</text>
      <rect x="320" y="58" width="160" height="28" fill="#fef9c3" rx="4"/>
      <text x="400" y="77" textAnchor="middle" fontSize="8" fill="#a16207">Challenging</text>
      
      {/* Row 3: -50% */}
      <rect x="30" y="96" width="100" height="28" fill="#fca5a5" rx="4"/>
      <text x="80" y="115" textAnchor="middle" fontSize="9" fontWeight="600" fill="#dc2626">-50%</text>
      <rect x="150" y="96" width="100" height="28" fill="#86efac" rx="4"/>
      <text x="200" y="115" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">+100%</text>
      <rect x="320" y="96" width="160" height="28" fill="#fed7aa" rx="4"/>
      <text x="400" y="115" textAnchor="middle" fontSize="8" fill="#c2410c">Difficult</text>
      
      {/* Row 4: -75% */}
      <rect x="30" y="134" width="100" height="28" fill="#f87171" rx="4"/>
      <text x="80" y="153" textAnchor="middle" fontSize="9" fontWeight="600" fill="white">-75%</text>
      <rect x="150" y="134" width="100" height="28" fill="#4ade80" rx="4"/>
      <text x="200" y="153" textAnchor="middle" fontSize="9" fontWeight="600" fill="#14532d">+300%</text>
      <rect x="320" y="134" width="160" height="28" fill="#fca5a5" rx="4"/>
      <text x="400" y="153" textAnchor="middle" fontSize="8" fill="#991b1b">Very Difficult</text>
      
      {/* Row 5: -90% */}
      <rect x="30" y="172" width="100" height="28" fill="#ef4444" rx="4"/>
      <text x="80" y="191" textAnchor="middle" fontSize="9" fontWeight="600" fill="white">-90%</text>
      <rect x="150" y="172" width="100" height="28" fill="#22c55e" rx="4"/>
      <text x="200" y="191" textAnchor="middle" fontSize="9" fontWeight="600" fill="white">+900%</text>
      <rect x="320" y="172" width="160" height="28" fill="#ef4444" rx="4"/>
      <text x="400" y="191" textAnchor="middle" fontSize="8" fill="white">Nearly Impossible</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="280" width="500" height="30" fill="#1e293b" rx="8"/>
    <text x="350" y="300" textAnchor="middle" fontSize="10" fill="white">💡 Avoiding large losses is mathematically more important than chasing large gains</text>
  </svg>
);

// SVG 4: Risk Avoidance vs Risk Management
const AvoidanceVsManagementSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Risk Avoidance vs Risk Management</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">They sound similar but lead to very different outcomes</text>
    
    {/* Left: Risk Avoidance */}
    <g transform="translate(40, 70)">
      <rect x="0" y="0" width="280" height="200" fill="#fef3c7" rx="12" stroke="#fcd34d" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="#92400e">🚫 Risk Avoidance</text>
      
      <text x="140" y="55" textAnchor="middle" fontSize="9" fill="#78350f">"I won't take any risks"</text>
      
      <line x1="40" y1="70" x2="240" y2="70" stroke="#d97706" strokeWidth="1" strokeDasharray="4"/>
      
      <text x="20" y="95" fontSize="8" fill="#92400e">• Never invest at all</text>
      <text x="20" y="115" fontSize="8" fill="#92400e">• Keep everything in cash</text>
      <text x="20" y="135" fontSize="8" fill="#92400e">• Avoid all market exposure</text>
      <text x="20" y="155" fontSize="8" fill="#92400e">• Miss compounding entirely</text>
      
      <rect x="20" y="170" width="240" height="22" fill="#fef08a" rx="4"/>
      <text x="140" y="185" textAnchor="middle" fontSize="8" fill="#713f12">Result: Inflation erodes purchasing power</text>
    </g>
    
    {/* Right: Risk Management */}
    <g transform="translate(380, 70)">
      <rect x="0" y="0" width="280" height="200" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="#166534">✓ Risk Management</text>
      
      <text x="140" y="55" textAnchor="middle" fontSize="9" fill="#14532d">"I'll take calculated, controlled risks"</text>
      
      <line x1="40" y1="70" x2="240" y2="70" stroke="#22c55e" strokeWidth="1" strokeDasharray="4"/>
      
      <text x="20" y="95" fontSize="8" fill="#166534">• Define acceptable loss levels</text>
      <text x="20" y="115" fontSize="8" fill="#166534">• Size positions appropriately</text>
      <text x="20" y="135" fontSize="8" fill="#166534">• Diversify thoughtfully</text>
      <text x="20" y="155" fontSize="8" fill="#166534">• Plan for adverse scenarios</text>
      
      <rect x="20" y="170" width="240" height="22" fill="#bbf7d0" rx="4"/>
      <text x="140" y="185" textAnchor="middle" fontSize="8" fill="#14532d">Result: Sustainable growth with protection</text>
    </g>
  </svg>
);

// SVG 5: The Capital Protection Pyramid
const CapitalPyramidSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">The Capital Protection Pyramid</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Build from the foundation up — never skip levels</text>
    
    {/* Pyramid layers */}
    <defs>
      <linearGradient id="layer1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#059669"/>
        <stop offset="100%" stopColor="#047857"/>
      </linearGradient>
      <linearGradient id="layer2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0ea5e9"/>
        <stop offset="100%" stopColor="#0284c7"/>
      </linearGradient>
      <linearGradient id="layer3" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6"/>
        <stop offset="100%" stopColor="#7c3aed"/>
      </linearGradient>
      <linearGradient id="layer4" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b"/>
        <stop offset="100%" stopColor="#d97706"/>
      </linearGradient>
    </defs>
    
    {/* Layer 4 (top) - Growth */}
    <path d="M350 70 L410 130 L290 130 Z" fill="url(#layer4)" stroke="#b45309" strokeWidth="2"/>
    <text x="350" y="115" textAnchor="middle" fontSize="8" fontWeight="600" fill="white">Growth</text>
    
    {/* Layer 3 - Optimization */}
    <path d="M290 135 L410 135 L450 195 L250 195 Z" fill="url(#layer3)" stroke="#6d28d9" strokeWidth="2"/>
    <text x="350" y="170" textAnchor="middle" fontSize="9" fontWeight="600" fill="white">Optimization</text>
    
    {/* Layer 2 - Position Sizing */}
    <path d="M250 200 L450 200 L500 260 L200 260 Z" fill="url(#layer2)" stroke="#0369a1" strokeWidth="2"/>
    <text x="350" y="235" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">Position Sizing</text>
    
    {/* Layer 1 (base) - Capital Preservation */}
    <path d="M200 265 L500 265 L560 325 L140 325 Z" fill="url(#layer1)" stroke="#047857" strokeWidth="2"/>
    <text x="350" y="300" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">Capital Preservation</text>
    
    {/* Right side labels */}
    <g transform="translate(570, 90)">
      <rect x="0" y="0" width="110" height="25" fill="#fef3c7" rx="4"/>
      <text x="55" y="17" textAnchor="middle" fontSize="7" fill="#92400e">Only after mastering below</text>
    </g>
    
    <g transform="translate(570, 155)">
      <rect x="0" y="0" width="110" height="25" fill="#f3e8ff" rx="4"/>
      <text x="55" y="17" textAnchor="middle" fontSize="7" fill="#6b21a8">Refine, but don't skip base</text>
    </g>
    
    <g transform="translate(570, 220)">
      <rect x="0" y="0" width="110" height="25" fill="#e0f2fe" rx="4"/>
      <text x="55" y="17" textAnchor="middle" fontSize="7" fill="#0369a1">How much per position?</text>
    </g>
    
    <g transform="translate(570, 285)">
      <rect x="0" y="0" width="110" height="25" fill="#dcfce7" rx="4"/>
      <text x="55" y="17" textAnchor="middle" fontSize="7" fill="#166534">THE FOUNDATION</text>
    </g>
  </svg>
);

// SVG 6: Who This Module Is For
const WhoIsThisForSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">Who This Module Is For</text>
    
    {/* Left: This is for you if... */}
    <g transform="translate(40, 55)">
      <rect x="0" y="0" width="295" height="220" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="147" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">✓ This Module IS For You If...</text>
      
      <text x="20" y="55" fontSize="8" fill="#14532d">• You want to protect capital before growing it</text>
      <text x="20" y="75" fontSize="8" fill="#14532d">• You've experienced painful losses and want to prevent repeats</text>
      <text x="20" y="95" fontSize="8" fill="#14532d">• You understand that survival enables compounding</text>
      <text x="20" y="115" fontSize="8" fill="#14532d">• You're willing to sacrifice some upside for stability</text>
      <text x="20" y="135" fontSize="8" fill="#14532d">• You want a framework, not tips or shortcuts</text>
      <text x="20" y="155" fontSize="8" fill="#14532d">• You value consistency over excitement</text>
      <text x="20" y="175" fontSize="8" fill="#14532d">• You're ready to think long-term</text>
      
      <rect x="20" y="190" width="255" height="22" fill="#bbf7d0" rx="4"/>
      <text x="147" y="205" textAnchor="middle" fontSize="8" fontWeight="600" fill="#166534">You're in the right place</text>
    </g>
    
    {/* Right: This is NOT for you if... */}
    <g transform="translate(365, 55)">
      <rect x="0" y="0" width="295" height="220" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="147" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">✗ This Module Is NOT For You If...</text>
      
      <text x="20" y="55" fontSize="8" fill="#991b1b">• You're looking for "hot tips" or quick wins</text>
      <text x="20" y="75" fontSize="8" fill="#991b1b">• You think risk management slows you down</text>
      <text x="20" y="95" fontSize="8" fill="#991b1b">• You want excitement over stability</text>
      <text x="20" y="115" fontSize="8" fill="#991b1b">• You believe losses "won't happen to me"</text>
      <text x="20" y="135" fontSize="8" fill="#991b1b">• You're unwilling to limit position sizes</text>
      <text x="20" y="155" fontSize="8" fill="#991b1b">• You want predictions, not principles</text>
      <text x="20" y="175" fontSize="8" fill="#991b1b">• You prioritize being right over being safe</text>
      
      <rect x="20" y="190" width="255" height="22" fill="#fee2e2" rx="4"/>
      <text x="147" y="205" textAnchor="middle" fontSize="8" fontWeight="600" fill="#991b1b">Consider if you're ready for this</text>
    </g>
  </svg>
);

// SVG 7: What You'll Understand
const WhatYoullLearnSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#334155">What You'll Understand After This Module</text>
    
    {/* Learning outcomes grid */}
    <g transform="translate(40, 55)">
      {/* Row 1 */}
      <rect x="0" y="0" width="200" height="75" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="2"/>
      <text x="100" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">🛡️ Capital Protection</text>
      <text x="100" y="45" textAnchor="middle" fontSize="7" fill="#14532d">Why protecting what you have</text>
      <text x="100" y="60" textAnchor="middle" fontSize="7" fill="#14532d">matters more than chasing more</text>
      
      <rect x="220" y="0" width="200" height="75" fill="#e0f2fe" rx="10" stroke="#7dd3fc" strokeWidth="2"/>
      <text x="320" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#0369a1">📊 Types of Risk</text>
      <text x="320" y="45" textAnchor="middle" fontSize="7" fill="#0c4a6e">Market, concentration, liquidity,</text>
      <text x="320" y="60" textAnchor="middle" fontSize="7" fill="#0c4a6e">behavioral, and systemic risks</text>
      
      <rect x="440" y="0" width="200" height="75" fill="#f3e8ff" rx="10" stroke="#d8b4fe" strokeWidth="2"/>
      <text x="540" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#7c3aed">📉 Loss Asymmetry</text>
      <text x="540" y="45" textAnchor="middle" fontSize="7" fill="#6b21a8">Why losses compound faster</text>
      <text x="540" y="60" textAnchor="middle" fontSize="7" fill="#6b21a8">than gains — the math of survival</text>
      
      {/* Row 2 */}
      <rect x="0" y="95" width="200" height="75" fill="#fefce8" rx="10" stroke="#fde047" strokeWidth="2"/>
      <text x="100" y="120" textAnchor="middle" fontSize="9" fontWeight="600" fill="#a16207">📐 Position Sizing</text>
      <text x="100" y="140" textAnchor="middle" fontSize="7" fill="#92400e">How much to allocate per</text>
      <text x="100" y="155" textAnchor="middle" fontSize="7" fill="#92400e">position and why it matters</text>
      
      <rect x="220" y="95" width="200" height="75" fill="#fee2e2" rx="10" stroke="#fca5a5" strokeWidth="2"/>
      <text x="320" y="120" textAnchor="middle" fontSize="9" fontWeight="600" fill="#dc2626">⚠️ Drawdown Management</text>
      <text x="320" y="140" textAnchor="middle" fontSize="7" fill="#991b1b">Understanding and limiting</text>
      <text x="320" y="155" textAnchor="middle" fontSize="7" fill="#991b1b">portfolio declines</text>
      
      <rect x="440" y="95" width="200" height="75" fill="#f1f5f9" rx="10" stroke="#cbd5e1" strokeWidth="2"/>
      <text x="540" y="120" textAnchor="middle" fontSize="9" fontWeight="600" fill="#475569">🧠 Risk Psychology</text>
      <text x="540" y="140" textAnchor="middle" fontSize="7" fill="#64748b">How emotions sabotage risk</text>
      <text x="540" y="155" textAnchor="middle" fontSize="7" fill="#64748b">decisions — and how to manage them</text>
      
      {/* Row 3 */}
      <rect x="110" y="190" width="200" height="75" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="2"/>
      <text x="210" y="215" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">🔄 Survival Mindset</text>
      <text x="210" y="235" textAnchor="middle" fontSize="7" fill="#14532d">Why staying in the game</text>
      <text x="210" y="250" textAnchor="middle" fontSize="7" fill="#14532d">is the ultimate edge</text>
      
      <rect x="330" y="190" width="200" height="75" fill="#e0f2fe" rx="10" stroke="#7dd3fc" strokeWidth="2"/>
      <text x="430" y="215" textAnchor="middle" fontSize="9" fontWeight="600" fill="#0369a1">⚖️ Risk vs Reward</text>
      <text x="430" y="235" textAnchor="middle" fontSize="7" fill="#0c4a6e">Thinking in probabilities</text>
      <text x="430" y="250" textAnchor="middle" fontSize="7" fill="#0c4a6e">and expected outcomes</text>
    </g>
    
    {/* Bottom message */}
    <rect x="100" y="285" width="500" height="25" fill="#059669" rx="6"/>
    <text x="350" y="302" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">A complete framework for thinking about risk — not tips, but principles</text>
  </svg>
);

const RiskManagementOverview = () => {
  const lessons = [
    { id: 1, title: 'What Is Risk in Financial Markets?', available: true, path: '/learn/risk-lesson-1' },
    { id: 2, title: 'Why Capital Protection Comes First', available: true, path: '/learn/risk-lesson-2' },
    { id: 3, title: 'Types of Risk – Market, System & Emotional', available: true, path: '/learn/risk-lesson-3' },
    { id: 4, title: 'Position Sizing – Conceptual Understanding', available: true, path: '/learn/risk-lesson-4' },
    { id: 5, title: 'Drawdowns & Recovery Reality', available: true, path: '/learn/risk-lesson-5' },
    { id: 6, title: 'Risk in Trading vs Investing', available: true, path: '/learn/risk-lesson-6' },
    { id: 7, title: 'Risk Discipline & Long-Term Survival', available: true, path: '/learn/risk-lesson-7' },
  ];

  const modulePhilosophy = [
    { icon: '🛡️', title: 'Survival First', description: 'Capital preserved today enables compounding tomorrow. Survival is the prerequisite for all growth.' },
    { icon: '📉', title: 'Losses Compound Faster', description: 'A 50% loss requires a 100% gain to recover. The math is unforgiving — protection is not optional.' },
    { icon: '⚖️', title: 'Risk vs Avoidance', description: 'Risk management isn\'t avoiding risk — it\'s taking calculated risks while limiting catastrophic outcomes.' },
    { icon: '🧠', title: 'Consistency Over Brilliance', description: 'Steady, disciplined risk control outperforms occasional brilliance followed by ruin.' },
  ];

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/learn" 
            className="inline-flex items-center text-emerald-600 hover:text-emerald-800 mb-4 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Learning Center
          </Link>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <FaShieldAlt className="text-emerald-600 text-2xl" />
              </div>
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                Capital Protection Module
              </span>
            </div>
            <div className="mb-3"><ModuleBadge moduleId="risk-management" /></div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Risk Management</h1>
            <p className="text-xl text-emerald-600 font-medium mb-4">Capital Protection Mastery</p>
            <p className="text-gray-600 text-lg">
              Learn to protect your capital before growing it. This module teaches the principles 
              of risk management that separate surviving investors from those who eventually fail.
            </p>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <CapitalProtectionHeroSVG />
        </div>

        {/* What Risk Management Really Means */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">What Risk Management Really Means</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Risk management is often misunderstood. It's not about avoiding risk entirely — that's 
              impossible in markets. It's not about predicting the future — that's also impossible. 
              And it's certainly not about being pessimistic or fearful.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              <strong>Risk management is about one thing: survival.</strong> It's the discipline of 
              ensuring that no single trade, no single day, no single market event can permanently 
              damage your ability to participate in markets. It's about staying in the game long 
              enough for compounding to work in your favor.
            </p>
            <p className="text-lg leading-relaxed">
              Think of capital as the raw material of investing. Without capital, there is no investing. 
              Every dollar lost is a dollar that can no longer compound. Risk management protects this 
              raw material while still allowing it to grow.
            </p>
          </div>

          <WhyRiskMattersSVG />
        </div>

        {/* Why Most People Fail */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Most People Fail Due to Poor Risk Control</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              The uncomfortable truth is this: most investors who fail don't fail because they picked 
              the wrong investments. They fail because they didn't manage the size of their failures. 
              They concentrated too heavily, held too long during drawdowns, or sized positions based 
              on hope rather than mathematics.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Markets are inherently unpredictable. Even the best analysis, the best research, and 
              the best strategies will experience periods of loss. The question isn't whether you'll 
              face losses — you will. The question is: <strong>will those losses be survivable?</strong>
            </p>
          </div>

          <LossAsymmetrySVG />
          
          <div className="mt-6 bg-red-50 rounded-xl p-5 border border-red-200">
            <p className="text-red-800">
              <strong>The Core Insight:</strong> Because losses compound asymmetrically, avoiding 
              large losses is mathematically more important than capturing large gains. A -50% loss 
              requires a +100% gain to recover. A -90% loss requires +900%. This isn't opinion — 
              it's arithmetic.
            </p>
          </div>
        </div>

        {/* Risk Avoidance vs Risk Management */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Risk Avoidance vs Risk Management</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              There's a crucial distinction that many miss: <strong>risk avoidance</strong> and 
              <strong> risk management</strong> are not the same thing.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Risk avoidance is the attempt to eliminate all risk — typically by not participating 
              at all, or by keeping all assets in "safe" instruments like cash. While this feels 
              safe, it carries its own risk: the certainty of losing purchasing power to inflation 
              over time, and the opportunity cost of missing market participation entirely.
            </p>
            <p className="text-lg leading-relaxed">
              Risk management, by contrast, is the thoughtful acceptance of calculated risks while 
              systematically limiting potential downsides. It's not about being safe — it's about 
              being <strong>intelligently unsafe</strong>. It acknowledges that growth requires 
              risk, but catastrophic loss should be avoided.
            </p>
          </div>

          <AvoidanceVsManagementSVG />
        </div>

        {/* Module Philosophy */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 shadow-lg mb-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Module Philosophy</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {modulePhilosophy.map((item, index) => (
              <div key={index} className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
                <p className="text-emerald-100 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The Capital Protection Pyramid */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">The Capital Protection Pyramid</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Risk management skills build on each other. You can't optimize what you haven't 
              protected, and you can't grow what you haven't preserved. This module follows a 
              natural progression from foundation to refinement.
            </p>
          </div>

          <CapitalPyramidSVG />
        </div>

        {/* Who This Is For */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Who This Module Is For (And Who It Isn't)</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              This module isn't for everyone, and that's by design. It's specifically for learners 
              who understand that protecting capital is the foundation of sustainable investing. If 
              you're looking for excitement or quick wins, this isn't the right place.
            </p>
          </div>

          <WhoIsThisForSVG />
        </div>

        {/* What You'll Understand */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">What You'll Understand After This Module</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              By the end of this module, you won't just know about risk — you'll understand it 
              deeply. You'll have a framework for thinking about exposure, position sizing, 
              drawdowns, and psychological discipline that will serve you regardless of what 
              you invest in.
            </p>
          </div>

          <WhatYoullLearnSVG />
        </div>

        {/* India Context */}
        <div className="bg-emerald-50 rounded-2xl p-6 shadow-lg mb-8 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-800 mb-3">🌍 Global Perspective with Local Relevance</h3>
          <p className="text-emerald-900">
            While this module uses global concepts and examples, the principles apply everywhere. 
            In rapidly growing markets like India, where retail participation has surged, risk 
            management becomes even more critical. New participants often enter during bull markets 
            and lack experience with significant drawdowns. The principles in this module — position 
            sizing, drawdown management, survival mindset — are universal, but particularly valuable 
            for those in high-growth, high-volatility environments.
          </p>
        </div>

        {/* Lesson List */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Module Lessons</h2>
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                  lesson.available
                    ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-400 cursor-pointer'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    lesson.available ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {lesson.id}
                  </div>
                  <span className={`font-medium ${lesson.available ? 'text-gray-800' : 'text-gray-500'}`}>
                    {lesson.title}
                  </span>
                </div>
                {lesson.available ? (
                  <Link
                    to={lesson.path}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    Start Lesson
                  </Link>
                ) : (
                  <span className="text-gray-400 text-sm flex items-center gap-2">
                    <FaLock />
                    Coming Soon
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final Message */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-8 shadow-lg text-white">
          <h3 className="text-xl font-bold mb-4">📝 A Final Note Before You Begin</h3>
          <p className="text-lg mb-4">
            This module will challenge some common assumptions. It might feel slower or more 
            cautious than what you're used to. That's intentional.
          </p>
          <p className="text-lg mb-4">
            The goal isn't to make you fearful — it's to make you durable. Markets reward those 
            who can stay in the game long enough for compounding to work. Risk management is 
            how you stay in the game.
          </p>
          <p className="text-lg font-medium text-emerald-300">
            Remember: Survival comes before profits. Capital preserved today enables growth tomorrow.
          </p>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default RiskManagementOverview;
