import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';

// SVG 1: What Is a Derivative - Core Concept
const WhatIsDerivativeSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">A Derivative Gets Its Value From Something Else</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">The word "derivative" means "derived from" — the value comes from another asset</text>
    
    {/* The Underlying Asset */}
    <g transform="translate(100, 80)">
      <rect x="0" y="0" width="180" height="140" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="90" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">The Underlying Asset</text>
      <text x="90" y="45" textAnchor="middle" fontSize="9" fill="#64748b">(The real thing)</text>
      
      {/* Asset icon */}
      <g transform="translate(55, 60)">
        <rect x="0" y="0" width="70" height="55" fill="white" rx="8" stroke="#86efac" strokeWidth="1"/>
        <text x="35" y="25" textAnchor="middle" fontSize="20">🏢</text>
        <text x="35" y="45" textAnchor="middle" fontSize="8" fill="#166534">Stock, Oil, Gold</text>
      </g>
      
      <text x="90" y="130" textAnchor="middle" fontSize="8" fill="#14532d">Has value on its own</text>
    </g>
    
    {/* Arrow showing derivation */}
    <g transform="translate(290, 130)">
      <line x1="0" y1="20" x2="100" y2="20" stroke="#f59e0b" strokeWidth="3"/>
      <polygon points="100,20 90,14 90,26" fill="#f59e0b"/>
      <text x="50" y="8" textAnchor="middle" fontSize="8" fill="#92400e">derives</text>
      <text x="50" y="45" textAnchor="middle" fontSize="8" fill="#92400e">value from</text>
    </g>
    
    {/* The Derivative */}
    <g transform="translate(420, 80)">
      <rect x="0" y="0" width="180" height="140" fill="#fef3c7" rx="12" stroke="#fcd34d" strokeWidth="2"/>
      <text x="90" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#92400e">The Derivative</text>
      <text x="90" y="45" textAnchor="middle" fontSize="9" fill="#64748b">(A contract about it)</text>
      
      {/* Contract icon */}
      <g transform="translate(55, 60)">
        <rect x="0" y="0" width="70" height="55" fill="white" rx="8" stroke="#fcd34d" strokeWidth="1"/>
        <text x="35" y="25" textAnchor="middle" fontSize="20">📄</text>
        <text x="35" y="45" textAnchor="middle" fontSize="8" fill="#92400e">Future, Option</text>
      </g>
      
      <text x="90" y="130" textAnchor="middle" fontSize="8" fill="#78350f">Value depends on asset</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="235" width="500" height="35" fill="#1e293b" rx="8"/>
    <text x="350" y="250" textAnchor="middle" fontSize="9" fill="white">A derivative doesn't have value by itself — it's a contract tied to something else.</text>
    <text x="350" y="263" textAnchor="middle" fontSize="8" fill="#94a3b8">If the underlying asset moves, the derivative's value changes too.</text>
  </svg>
);

// SVG 2: Owning vs Contract
const OwningVsContractSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Owning an Asset vs Owning a Derivative</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">They might sound similar, but they're completely different</text>
    
    {/* Owning the Asset */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="280" height="200" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">Owning the Asset</text>
      <text x="140" y="45" textAnchor="middle" fontSize="9" fill="#64748b">(Like buying stock in a company)</text>
      
      <g transform="translate(20, 60)">
        <rect x="0" y="0" width="240" height="120" fill="white" rx="8"/>
        
        <g transform="translate(15, 15)">
          <circle cx="6" cy="6" r="4" fill="#22c55e"/>
          <text x="18" y="10" fontSize="8" fill="#374151">You actually OWN a piece</text>
        </g>
        
        <g transform="translate(15, 38)">
          <circle cx="6" cy="6" r="4" fill="#22c55e"/>
          <text x="18" y="10" fontSize="8" fill="#374151">No expiration date</text>
        </g>
        
        <g transform="translate(15, 61)">
          <circle cx="6" cy="6" r="4" fill="#22c55e"/>
          <text x="18" y="10" fontSize="8" fill="#374151">Can hold forever</text>
        </g>
        
        <g transform="translate(15, 84)">
          <circle cx="6" cy="6" r="4" fill="#22c55e"/>
          <text x="18" y="10" fontSize="8" fill="#374151">May receive dividends</text>
        </g>
        
        <g transform="translate(15, 107)">
          <circle cx="6" cy="6" r="4" fill="#22c55e"/>
          <text x="18" y="10" fontSize="8" fill="#166534" fontWeight="500">You have something real</text>
        </g>
      </g>
    </g>
    
    {/* VS divider */}
    <g transform="translate(340, 160)">
      <circle cx="10" cy="10" r="18" fill="#e2e8f0"/>
      <text x="10" y="15" textAnchor="middle" fontSize="10" fontWeight="600" fill="#64748b">VS</text>
    </g>
    
    {/* Owning a Derivative */}
    <g transform="translate(370, 75)">
      <rect x="0" y="0" width="280" height="200" fill="#fef3c7" rx="12" stroke="#fcd34d" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#92400e">Owning a Derivative</text>
      <text x="140" y="45" textAnchor="middle" fontSize="9" fill="#64748b">(Like buying a contract about that stock)</text>
      
      <g transform="translate(20, 60)">
        <rect x="0" y="0" width="240" height="120" fill="white" rx="8"/>
        
        <g transform="translate(15, 15)">
          <circle cx="6" cy="6" r="4" fill="#f59e0b"/>
          <text x="18" y="10" fontSize="8" fill="#374151">You own a CONTRACT</text>
        </g>
        
        <g transform="translate(15, 38)">
          <circle cx="6" cy="6" r="4" fill="#f59e0b"/>
          <text x="18" y="10" fontSize="8" fill="#374151">Has an expiration date</text>
        </g>
        
        <g transform="translate(15, 61)">
          <circle cx="6" cy="6" r="4" fill="#f59e0b"/>
          <text x="18" y="10" fontSize="8" fill="#374151">Becomes worthless if you wait too long</text>
        </g>
        
        <g transform="translate(15, 84)">
          <circle cx="6" cy="6" r="4" fill="#f59e0b"/>
          <text x="18" y="10" fontSize="8" fill="#374151">No dividends</text>
        </g>
        
        <g transform="translate(15, 107)">
          <circle cx="6" cy="6" r="4" fill="#f59e0b"/>
          <text x="18" y="10" fontSize="8" fill="#92400e" fontWeight="500">You have a temporary agreement</text>
        </g>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="285" width="500" height="25" fill="#1e293b" rx="6"/>
    <text x="350" y="302" textAnchor="middle" fontSize="9" fill="white">When you buy a derivative, you don't own the asset — you own a contract about it.</text>
  </svg>
);

// SVG 3: Simple Analogy - House vs Rental Agreement
const HouseAnalogySVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">A Simple Way to Think About It</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">The difference between owning and having a contract</text>
    
    {/* Owning a House */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="280" height="180" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">Owning a House</text>
      
      {/* House icon */}
      <g transform="translate(95, 45)">
        <path d="M45 30 L45 80 L135 80 L135 30 L90 0 Z" fill="#86efac" stroke="#166534" strokeWidth="2"/>
        <rect x="60" y="50" width="25" height="30" fill="#166534"/>
        <rect x="100" y="40" width="20" height="20" fill="#dcfce7" stroke="#166534" strokeWidth="1"/>
      </g>
      
      <text x="140" y="140" textAnchor="middle" fontSize="9" fill="#14532d">It's YOURS</text>
      <text x="140" y="155" textAnchor="middle" fontSize="8" fill="#64748b">You can live there, sell it, rent it out</text>
      <text x="140" y="170" textAnchor="middle" fontSize="8" fill="#64748b">It doesn't expire</text>
    </g>
    
    {/* Having a Rental Agreement */}
    <g transform="translate(370, 75)">
      <rect x="0" y="0" width="280" height="180" fill="#fef3c7" rx="12" stroke="#fcd34d" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#92400e">Having a Rental Agreement</text>
      
      {/* Contract icon */}
      <g transform="translate(95, 45)">
        <rect x="45" y="0" width="90" height="75" fill="white" stroke="#f59e0b" strokeWidth="2" rx="4"/>
        <line x1="60" y1="20" x2="120" y2="20" stroke="#fcd34d" strokeWidth="2"/>
        <line x1="60" y1="35" x2="110" y2="35" stroke="#fcd34d" strokeWidth="2"/>
        <line x1="60" y1="50" x2="100" y2="50" stroke="#fcd34d" strokeWidth="2"/>
        <text x="90" y="68" textAnchor="middle" fontSize="8" fill="#92400e">12 months</text>
      </g>
      
      <text x="140" y="140" textAnchor="middle" fontSize="9" fill="#78350f">It's a CONTRACT</text>
      <text x="140" y="155" textAnchor="middle" fontSize="8" fill="#64748b">You have rights, but don't own the house</text>
      <text x="140" y="170" textAnchor="middle" fontSize="8" fill="#64748b">It expires after the agreement ends</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="265" width="500" height="25" fill="#92400e" rx="6"/>
    <text x="350" y="282" textAnchor="middle" fontSize="9" fill="white">A derivative is like the rental agreement — you have rights, but you don't own the underlying thing.</text>
  </svg>
);

// SVG 4: Why Derivatives Exist
const WhyDerivativesExistSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Why Were Derivatives Invented?</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">They weren't created for speculation — they solve real business problems</text>
    
    {/* The Problem */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="280" height="200" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">The Problem: Uncertainty</text>
      
      <g transform="translate(20, 50)">
        <rect x="0" y="0" width="240" height="130" fill="white" rx="8"/>
        
        <text x="120" y="25" textAnchor="middle" fontSize="24">🌾</text>
        <text x="120" y="50" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="500">A wheat farmer in March:</text>
        
        <text x="120" y="70" textAnchor="middle" fontSize="8" fill="#dc2626">"I'll harvest in September..."</text>
        <text x="120" y="85" textAnchor="middle" fontSize="8" fill="#dc2626">"But what if wheat prices crash by then?"</text>
        <text x="120" y="100" textAnchor="middle" fontSize="8" fill="#dc2626">"I could lose everything!"</text>
        
        <text x="120" y="120" textAnchor="middle" fontSize="8" fill="#64748b">Uncertainty makes planning impossible</text>
      </g>
    </g>
    
    {/* The Solution */}
    <g transform="translate(370, 75)">
      <rect x="0" y="0" width="280" height="200" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">The Solution: Lock in a Price</text>
      
      <g transform="translate(20, 50)">
        <rect x="0" y="0" width="240" height="130" fill="white" rx="8"/>
        
        <text x="120" y="25" textAnchor="middle" fontSize="24">📋</text>
        <text x="120" y="50" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="500">A futures contract:</text>
        
        <text x="120" y="70" textAnchor="middle" fontSize="8" fill="#166534">"I'll agree TODAY to sell my wheat"</text>
        <text x="120" y="85" textAnchor="middle" fontSize="8" fill="#166534">"at $5 per bushel in September"</text>
        <text x="120" y="100" textAnchor="middle" fontSize="8" fill="#166534">"Now I know exactly what I'll earn!"</text>
        
        <text x="120" y="120" textAnchor="middle" fontSize="8" fill="#64748b">Certainty allows planning</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="285" width="500" height="25" fill="#1e293b" rx="6"/>
    <text x="350" y="302" textAnchor="middle" fontSize="9" fill="white">Derivatives were invented to help businesses manage uncertainty — this is called "hedging."</text>
  </svg>
);

// SVG 5: Global Example - Coffee Shop Owner
const GlobalExampleSVG = () => (
  <svg viewBox="0 0 700 380" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="380" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Real-World Example: Maria's Coffee Shop</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">How a derivative can protect a business (or expose it to risk)</text>
    
    {/* Setup */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="600" height="70" fill="#e0f2fe" rx="10" stroke="#7dd3fc" strokeWidth="1"/>
      <text x="300" y="25" textAnchor="middle" fontSize="10" fontWeight="500" fill="#0369a1">The Situation</text>
      <text x="300" y="45" textAnchor="middle" fontSize="9" fill="#374151">Maria owns a coffee shop in Seattle. She buys coffee beans regularly.</text>
      <text x="300" y="60" textAnchor="middle" fontSize="9" fill="#374151">Today, coffee costs $2.00 per pound. She needs 1,000 lbs per month.</text>
    </g>
    
    {/* Without derivative */}
    <g transform="translate(50, 160)">
      <rect x="0" y="0" width="290" height="170" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="145" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">Without a Derivative</text>
      <text x="145" y="42" textAnchor="middle" fontSize="8" fill="#64748b">(Just buying coffee as she needs it)</text>
      
      <g transform="translate(15, 55)">
        <rect x="0" y="0" width="260" height="100" fill="white" rx="6"/>
        
        <text x="130" y="20" textAnchor="middle" fontSize="8" fill="#374151">If coffee prices rise to $3.00/lb:</text>
        <text x="130" y="35" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="500">Her costs jump from $2,000 to $3,000/month</text>
        <text x="130" y="50" textAnchor="middle" fontSize="8" fill="#dc2626">She either raises prices or loses profit</text>
        
        <line x1="20" y1="60" x2="240" y2="60" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="130" y="75" textAnchor="middle" fontSize="8" fill="#374151">If coffee prices drop to $1.50/lb:</text>
        <text x="130" y="90" textAnchor="middle" fontSize="9" fill="#166534" fontWeight="500">She saves money! Costs drop to $1,500/month</text>
      </g>
    </g>
    
    {/* With derivative */}
    <g transform="translate(360, 160)">
      <rect x="0" y="0" width="290" height="170" fill="#fef3c7" rx="12" stroke="#fcd34d" strokeWidth="2"/>
      <text x="145" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#92400e">With a Futures Contract</text>
      <text x="145" y="42" textAnchor="middle" fontSize="8" fill="#64748b">(Locked in $2.00/lb for 6 months)</text>
      
      <g transform="translate(15, 55)">
        <rect x="0" y="0" width="260" height="100" fill="white" rx="6"/>
        
        <text x="130" y="20" textAnchor="middle" fontSize="8" fill="#374151">If coffee prices rise to $3.00/lb:</text>
        <text x="130" y="35" textAnchor="middle" fontSize="9" fill="#166534" fontWeight="500">She still pays $2.00/lb — protected!</text>
        <text x="130" y="50" textAnchor="middle" fontSize="8" fill="#166534">Saved $1,000/month</text>
        
        <line x1="20" y1="60" x2="240" y2="60" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="130" y="75" textAnchor="middle" fontSize="8" fill="#374151">If coffee prices drop to $1.50/lb:</text>
        <text x="130" y="90" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="500">She still pays $2.00/lb — locked in!</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="50" y="340" width="600" height="30" fill="#1e293b" rx="6"/>
    <text x="350" y="352" textAnchor="middle" fontSize="9" fill="white">Derivatives can reduce uncertainty — but they also mean giving up potential gains.</text>
    <text x="350" y="365" textAnchor="middle" fontSize="8" fill="#94a3b8">This is a real trade-off that businesses make every day.</text>
  </svg>
);

// SVG 6: Two Types Overview
const TwoTypesSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">The Two Main Types of Derivatives</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">You'll learn more about each in the next lessons</text>
    
    {/* Futures */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="280" height="160" fill="#e0f2fe" rx="12" stroke="#7dd3fc" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0369a1">Futures</text>
      
      <g transform="translate(20, 45)">
        <rect x="0" y="0" width="240" height="95" fill="white" rx="8"/>
        <text x="120" y="22" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="500">An agreement to buy or sell</text>
        <text x="120" y="38" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="500">at a set price on a future date</text>
        
        <line x1="20" y1="50" x2="220" y2="50" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="120" y="68" textAnchor="middle" fontSize="8" fill="#64748b">Both parties MUST complete the deal</text>
        <text x="120" y="83" textAnchor="middle" fontSize="8" fill="#0369a1">Obligation on both sides</text>
      </g>
    </g>
    
    {/* Options */}
    <g transform="translate(370, 75)">
      <rect x="0" y="0" width="280" height="160" fill="#fef3c7" rx="12" stroke="#fcd34d" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="#92400e">Options</text>
      
      <g transform="translate(20, 45)">
        <rect x="0" y="0" width="240" height="95" fill="white" rx="8"/>
        <text x="120" y="22" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="500">The RIGHT (not obligation) to buy or sell</text>
        <text x="120" y="38" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="500">at a set price before a certain date</text>
        
        <line x1="20" y1="50" x2="220" y2="50" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="120" y="68" textAnchor="middle" fontSize="8" fill="#64748b">You can choose to walk away</text>
        <text x="120" y="83" textAnchor="middle" fontSize="8" fill="#92400e">You pay for this flexibility (premium)</text>
      </g>
    </g>
    
    {/* Bottom note */}
    <rect x="100" y="245" width="500" height="25" fill="#64748b" rx="6"/>
    <text x="350" y="262" textAnchor="middle" fontSize="9" fill="white">We'll explore both in detail — for now, just know they're contracts tied to other assets.</text>
  </svg>
);

// SVG 7: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 150" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="150" fill="url(#takeawayGradDeriv1)" rx="16"/>
    
    <defs>
      <linearGradient id="takeawayGradDeriv1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b"/>
        <stop offset="100%" stopColor="#ea580c"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="35" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">🎯 Key Takeaway</text>
    <text x="350" y="65" textAnchor="middle" fontSize="12" fill="white">A derivative is a contract whose value comes from something else.</text>
    <text x="350" y="90" textAnchor="middle" fontSize="11" fill="#fef3c7">You don't own the underlying asset — you own an agreement about it.</text>
    <text x="350" y="115" textAnchor="middle" fontSize="10" fill="#fed7aa">Derivatives were invented to manage business risk, not for speculation.</text>
    <text x="350" y="135" textAnchor="middle" fontSize="9" fill="#fcd34d">Understanding this foundation is essential before going further.</text>
  </svg>
);

// SVG 8: Warning Banner
const WarningBannerSVG = () => (
  <svg viewBox="0 0 700 80" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="80" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
    
    {/* Warning icon */}
    <g transform="translate(30, 25)">
      <polygon points="15,0 30,26 0,26" fill="#dc2626"/>
      <text x="15" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">!</text>
    </g>
    
    {/* Text */}
    <text x="80" y="35" fontSize="11" fontWeight="600" fill="#dc2626">Remember: This is Awareness Education</text>
    <text x="80" y="55" fontSize="9" fill="#991b1b">Understanding what derivatives are doesn't mean you should trade them.</text>
    <text x="80" y="70" fontSize="8" fill="#b91c1c">Most individual traders lose money. This module is about understanding, not action.</text>
  </svg>
);

const DerivLesson1 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const quizQuestions = [
    {
      id: 1,
      question: "What does 'derivative' mean in finance?",
      options: [
        "A type of savings account",
        "Something that gets its value from another asset",
        "A government bond",
        "A company's annual report"
      ],
      correct: 1,
      explanation: "A derivative 'derives' its value from something else — like a stock, commodity, or index. It's a contract tied to another asset, not the asset itself."
    },
    {
      id: 2,
      question: "What's the key difference between owning a stock and owning a derivative on that stock?",
      options: [
        "Derivatives are always more profitable",
        "With stock you own part of the company; with a derivative you own a contract",
        "Stocks expire but derivatives don't",
        "There is no difference"
      ],
      correct: 1,
      explanation: "When you buy stock, you own a piece of the company — it's yours forever (unless you sell). A derivative is just a contract about that stock, with an expiration date and no actual ownership."
    }
  ];

  const handleAnswer = (questionId, answerIndex) => {
    setQuizAnswers({ ...quizAnswers, [questionId]: answerIndex });
    setShowResults({ ...showResults, [questionId]: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/learn/derivatives" 
            className="inline-flex items-center text-amber-600 hover:text-amber-800 mb-4 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Derivatives Module
          </Link>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-3 rounded-xl">
                <FaExclamationTriangle className="text-amber-600 text-2xl" />
              </div>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                Lesson 1 of 7 – Awareness Only
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">What Are Derivatives?</h1>
            <p className="text-gray-600 text-lg">
              Understanding the basic concept before anything else.
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mb-8">
          <WarningBannerSVG />
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">What Is a Derivative?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              The word <strong>"derivative"</strong> comes from "derived" — meaning it gets 
              its value from something else.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              A derivative is a <strong>financial contract</strong> whose value depends on 
              the price of another asset. This "other asset" is called the 
              <strong> underlying asset</strong>.
            </p>
            <p className="text-lg leading-relaxed">
              The underlying asset could be a stock, a commodity (like oil or wheat), 
              a currency, or even an index like the S&P 500.
            </p>
          </div>
          
          <WhatIsDerivativeSVG />
        </div>

        {/* Owning vs Contract */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Owning an Asset vs. Owning a Derivative</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              This is the most important distinction to understand. When you buy a stock, 
              you <strong>actually own a piece of that company</strong>. It's yours.
            </p>
            <p className="text-lg leading-relaxed">
              When you buy a derivative, you <strong>don't own the asset</strong> — you own 
              a contract that's linked to that asset's price. It's an agreement, not ownership.
            </p>
          </div>
          
          <OwningVsContractSVG />
          
          <div className="mt-6 bg-amber-50 rounded-xl p-5 border border-amber-200">
            <p className="text-amber-800">
              <strong>Think of it this way:</strong> Owning stock is like owning a house. 
              Owning a derivative is like having a contract about that house — perhaps an 
              agreement to buy it at a certain price, or the right to rent it.
            </p>
          </div>
        </div>

        {/* Simple Analogy */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">A Simple Analogy</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              The house analogy helps make this concrete. Let's compare owning a house 
              versus having a rental agreement.
            </p>
          </div>
          
          <HouseAnalogySVG />
        </div>

        {/* Why Derivatives Exist */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Do Derivatives Exist?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Derivatives weren't invented for people to speculate or gamble on prices. 
              They were created to help <strong>businesses manage uncertainty</strong>.
            </p>
            <p className="text-lg leading-relaxed">
              Imagine you're a farmer. You plant wheat in spring, but won't harvest until fall. 
              What if wheat prices crash before you can sell? This uncertainty can be devastating 
              for a business.
            </p>
          </div>
          
          <WhyDerivativesExistSVG />
          
          <div className="mt-6 bg-blue-50 rounded-xl p-5 border border-blue-200">
            <p className="text-blue-800">
              <strong>Key insight:</strong> The original purpose of derivatives was 
              <strong> risk management</strong> (called "hedging") — helping businesses 
              protect themselves from price swings. Speculation came later.
            </p>
          </div>
        </div>

        {/* Global Example */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Real-World Example</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Let's see how this works with a practical example that shows both 
              the benefits and trade-offs of using derivatives.
            </p>
          </div>
          
          <GlobalExampleSVG />
          
          <div className="mt-6 bg-green-50 rounded-xl p-5 border border-green-200">
            <p className="text-green-800">
              <strong>Notice:</strong> Maria's futures contract protected her from price increases, 
              but it also meant she couldn't benefit if prices dropped. This is the fundamental 
              trade-off of hedging — you exchange uncertainty for certainty, giving up potential 
              gains to avoid potential losses.
            </p>
          </div>
        </div>

        {/* Two Types Preview */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">The Two Main Types</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              There are two main types of derivatives you'll encounter: <strong>futures</strong> and 
              <strong> options</strong>. We'll cover each in detail in upcoming lessons, but here's 
              a quick preview.
            </p>
          </div>
          
          <TwoTypesSVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
        </div>

        {/* India Context */}
        <div className="bg-amber-50 rounded-2xl p-6 shadow-lg mb-8 border border-amber-200">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">🇮🇳 India-Specific Note</h3>
          <p className="text-amber-900 mb-3">
            In India, derivatives trading happens primarily on the NSE and BSE through what's 
            called the "F&O segment" (Futures & Options). India has one of the world's most 
            active derivatives markets.
          </p>
          <p className="text-amber-800 text-sm">
            However, studies consistently show that the vast majority of individual F&O 
            traders in India lose money. This is why we focus on awareness and understanding, 
            not on teaching trading.
          </p>
        </div>

        {/* Knowledge Check */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Knowledge Check</h2>
          <p className="text-gray-600 mb-6">Test your understanding of derivatives basics.</p>
          
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
                          : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50'
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
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 shadow-lg mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <FaLightbulb className="text-2xl text-amber-200" />
            <h3 className="text-xl font-bold">Reflection Question</h3>
          </div>
          <div className="bg-white/20 rounded-xl p-5">
            <p className="text-white font-medium mb-3">Think about this:</p>
            <p className="text-amber-100 text-lg mb-4">
              "If derivatives were invented to help businesses manage risk, why do you think 
              most individual traders end up losing money with them?"
            </p>
            <p className="text-amber-200 text-sm">
              Consider: What's the difference between a farmer protecting their harvest price 
              and someone betting on stock price movements?
            </p>
          </div>
        </div>

        {/* Lesson Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Lesson Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">What You Learned</h4>
              <ul className="text-amber-700 text-sm space-y-1">
                <li>✓ A derivative gets its value from another asset</li>
                <li>✓ You own a contract, not the underlying asset</li>
                <li>✓ Derivatives were created to manage business risk</li>
                <li>✓ There are two main types: futures and options</li>
              </ul>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Coming Next</h4>
              <ul className="text-orange-700 text-sm space-y-1">
                <li>→ Lesson 2: Understanding Futures</li>
                <li>→ What futures contracts are</li>
                <li>→ How they create obligations</li>
                <li>→ Why they can be risky</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            to="/learn/derivatives"
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Module Overview</span>
          </Link>
          <button
            disabled
            className="flex items-center gap-2 bg-gray-300 text-gray-500 px-6 py-3 rounded-xl font-semibold cursor-not-allowed"
          >
            <span>Next: Understanding Futures</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DerivLesson1;
