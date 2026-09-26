import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";

// SVG Icons
const Icons = {
  ArrowLeft: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  ),
  ArrowRight: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  Clock: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  ),
  BookOpen: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  Lightbulb: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18h6M10 22h4M12 2v1M4.22 4.22l.71.71M1 12h1M4.22 19.78l.71-.71M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
    </svg>
  ),
  AlertTriangle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  XCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
    </svg>
  ),
  Target: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  TrendingUp: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Users: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Building: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>
    </svg>
  ),
  Globe: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Scale: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v18M3 9l3 6h6l3-6M15 9l3 6h6l3-6"/>
    </svg>
  )
};

// SVG: What is a Derivative
const WhatIsDerivativeSVG = () => (
  <svg viewBox="0 0 700 350" className="w-full h-auto">
    <defs>
      <linearGradient id="derivGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a"/>
        <stop offset="100%" stopColor="#1e3a5f"/>
      </linearGradient>
      <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f97316"/>
        <stop offset="100%" stopColor="#dc2626"/>
      </linearGradient>
    </defs>
    
    <rect x="0" y="0" width="700" height="350" fill="url(#derivGrad)" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">What is a Derivative?</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">A financial contract whose value is DERIVED from an underlying asset</text>
    
    {/* Underlying Asset */}
    <g transform="translate(50, 90)">
      <rect x="0" y="0" width="180" height="200" fill="#22c55e" fillOpacity="0.15" rx="12" stroke="#22c55e" strokeWidth="2"/>
      <text x="90" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#22c55e">UNDERLYING ASSET</text>
      <text x="90" y="50" textAnchor="middle" fontSize="10" fill="#94a3b8">The real thing</text>
      
      <g transform="translate(15, 70)">
        <rect x="0" y="0" width="150" height="110" fill="#0f172a" rx="8"/>
        <text x="75" y="25" textAnchor="middle" fontSize="11" fill="white">Examples:</text>
        <text x="75" y="45" textAnchor="middle" fontSize="10" fill="#22c55e">Stock (AAPL, MSFT)</text>
        <text x="75" y="62" textAnchor="middle" fontSize="10" fill="#22c55e">Index (S&P 500, NIFTY)</text>
        <text x="75" y="79" textAnchor="middle" fontSize="10" fill="#22c55e">Commodity (Gold, Oil)</text>
        <text x="75" y="96" textAnchor="middle" fontSize="10" fill="#22c55e">Currency (USD/EUR)</text>
      </g>
    </g>
    
    {/* Arrow */}
    <g transform="translate(245, 170)">
      <line x1="0" y1="20" x2="80" y2="20" stroke="url(#arrowGrad)" strokeWidth="4"/>
      <polygon points="80,12 100,20 80,28" fill="#f97316"/>
      <text x="50" y="8" textAnchor="middle" fontSize="10" fontWeight="500" fill="#f97316">value flows</text>
      <text x="50" y="48" textAnchor="middle" fontSize="9" fill="#94a3b8">Contract derives</text>
      <text x="50" y="60" textAnchor="middle" fontSize="9" fill="#94a3b8">value from asset</text>
    </g>
    
    {/* Derivative Contract */}
    <g transform="translate(360, 90)">
      <rect x="0" y="0" width="280" height="200" fill="#f97316" fillOpacity="0.15" rx="12" stroke="#f97316" strokeWidth="2"/>
      <text x="140" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#f97316">DERIVATIVE CONTRACT</text>
      <text x="140" y="50" textAnchor="middle" fontSize="10" fill="#94a3b8">Agreement based on asset</text>
      
      <g transform="translate(15, 70)">
        <rect x="0" y="0" width="120" height="110" fill="#0f172a" rx="8"/>
        <text x="60" y="20" textAnchor="middle" fontSize="11" fontWeight="500" fill="#f97316">Futures</text>
        <text x="60" y="40" textAnchor="middle" fontSize="9" fill="#94a3b8">Obligation to</text>
        <text x="60" y="52" textAnchor="middle" fontSize="9" fill="#94a3b8">buy/sell at</text>
        <text x="60" y="64" textAnchor="middle" fontSize="9" fill="#94a3b8">fixed price</text>
        <rect x="10" y="75" width="100" height="25" fill="#f97316" fillOpacity="0.2" rx="4"/>
        <text x="60" y="92" textAnchor="middle" fontSize="9" fill="#f97316">Both sides bound</text>
      </g>
      
      <g transform="translate(145, 70)">
        <rect x="0" y="0" width="120" height="110" fill="#0f172a" rx="8"/>
        <text x="60" y="20" textAnchor="middle" fontSize="11" fontWeight="500" fill="#dc2626">Options</text>
        <text x="60" y="40" textAnchor="middle" fontSize="9" fill="#94a3b8">Right but not</text>
        <text x="60" y="52" textAnchor="middle" fontSize="9" fill="#94a3b8">obligation to</text>
        <text x="60" y="64" textAnchor="middle" fontSize="9" fill="#94a3b8">buy/sell</text>
        <rect x="10" y="75" width="100" height="25" fill="#dc2626" fillOpacity="0.2" rx="4"/>
        <text x="60" y="92" textAnchor="middle" fontSize="9" fill="#dc2626">Buyer has choice</text>
      </g>
    </g>
    
    {/* Key Point */}
    <g transform="translate(50, 305)">
      <rect x="0" y="0" width="600" height="35" fill="#1e293b" rx="8"/>
      <text x="300" y="15" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">KEY INSIGHT</text>
      <text x="300" y="28" textAnchor="middle" fontSize="9" fill="#94a3b8">You do not own the asset. You own a CONTRACT about the asset&apos;s price movement.</text>
    </g>
  </svg>
);

// SVG: Market Participants
const MarketParticipantsSVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="380" fill="#0f172a" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Who Trades Derivatives?</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">Three main categories with different motivations</text>
    
    {/* Hedgers */}
    <g transform="translate(30, 80)">
      <rect x="0" y="0" width="200" height="240" fill="#22c55e" fillOpacity="0.1" rx="12" stroke="#22c55e" strokeWidth="2"/>
      <circle cx="100" cy="35" r="25" fill="#22c55e" fillOpacity="0.3"/>
      <text x="100" y="42" textAnchor="middle" fontSize="20" fill="#22c55e">H</text>
      <text x="100" y="80" textAnchor="middle" fontSize="14" fontWeight="600" fill="#22c55e">HEDGERS</text>
      <text x="100" y="100" textAnchor="middle" fontSize="10" fill="#94a3b8">Risk Reducers</text>
      
      <g transform="translate(15, 115)">
        <rect x="0" y="0" width="170" height="110" fill="#0f172a" rx="8"/>
        <text x="85" y="20" textAnchor="middle" fontSize="9" fill="white">Examples:</text>
        <text x="85" y="38" textAnchor="middle" fontSize="8" fill="#22c55e">• Farmer locking crop price</text>
        <text x="85" y="52" textAnchor="middle" fontSize="8" fill="#22c55e">• Airline hedging fuel costs</text>
        <text x="85" y="66" textAnchor="middle" fontSize="8" fill="#22c55e">• Fund manager protecting</text>
        <text x="85" y="78" textAnchor="middle" fontSize="8" fill="#22c55e">  portfolio from decline</text>
        <text x="85" y="98" textAnchor="middle" fontSize="8" fill="#94a3b8">Goal: Reduce uncertainty</text>
      </g>
    </g>
    
    {/* Speculators */}
    <g transform="translate(250, 80)">
      <rect x="0" y="0" width="200" height="240" fill="#dc2626" fillOpacity="0.1" rx="12" stroke="#dc2626" strokeWidth="2"/>
      <circle cx="100" cy="35" r="25" fill="#dc2626" fillOpacity="0.3"/>
      <text x="100" y="42" textAnchor="middle" fontSize="20" fill="#dc2626">S</text>
      <text x="100" y="80" textAnchor="middle" fontSize="14" fontWeight="600" fill="#dc2626">SPECULATORS</text>
      <text x="100" y="100" textAnchor="middle" fontSize="10" fill="#94a3b8">Risk Takers</text>
      
      <g transform="translate(15, 115)">
        <rect x="0" y="0" width="170" height="110" fill="#0f172a" rx="8"/>
        <text x="85" y="20" textAnchor="middle" fontSize="9" fill="white">Examples:</text>
        <text x="85" y="38" textAnchor="middle" fontSize="8" fill="#dc2626">• Day traders betting on</text>
        <text x="85" y="52" textAnchor="middle" fontSize="8" fill="#dc2626">  price direction</text>
        <text x="85" y="66" textAnchor="middle" fontSize="8" fill="#dc2626">• Hedge funds taking</text>
        <text x="85" y="78" textAnchor="middle" fontSize="8" fill="#dc2626">  leveraged positions</text>
        <text x="85" y="98" textAnchor="middle" fontSize="8" fill="#94a3b8">Goal: Profit from price moves</text>
      </g>
    </g>
    
    {/* Arbitrageurs */}
    <g transform="translate(470, 80)">
      <rect x="0" y="0" width="200" height="240" fill="#3b82f6" fillOpacity="0.1" rx="12" stroke="#3b82f6" strokeWidth="2"/>
      <circle cx="100" cy="35" r="25" fill="#3b82f6" fillOpacity="0.3"/>
      <text x="100" y="42" textAnchor="middle" fontSize="20" fill="#3b82f6">A</text>
      <text x="100" y="80" textAnchor="middle" fontSize="14" fontWeight="600" fill="#3b82f6">ARBITRAGEURS</text>
      <text x="100" y="100" textAnchor="middle" fontSize="10" fill="#94a3b8">Risk-Free Profit Seekers</text>
      
      <g transform="translate(15, 115)">
        <rect x="0" y="0" width="170" height="110" fill="#0f172a" rx="8"/>
        <text x="85" y="20" textAnchor="middle" fontSize="9" fill="white">Examples:</text>
        <text x="85" y="38" textAnchor="middle" fontSize="8" fill="#3b82f6">• Exploiting price gaps</text>
        <text x="85" y="52" textAnchor="middle" fontSize="8" fill="#3b82f6">  between markets</text>
        <text x="85" y="66" textAnchor="middle" fontSize="8" fill="#3b82f6">• High-frequency traders</text>
        <text x="85" y="78" textAnchor="middle" fontSize="8" fill="#3b82f6">• Statistical arbitrage</text>
        <text x="85" y="98" textAnchor="middle" fontSize="8" fill="#94a3b8">Goal: Lock in riskless profit</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <g transform="translate(50, 335)">
      <rect x="0" y="0" width="600" height="35" fill="#1e293b" rx="8"/>
      <text x="300" y="15" textAnchor="middle" fontSize="10" fontWeight="600" fill="#f97316">MARKET REALITY</text>
      <text x="300" y="28" textAnchor="middle" fontSize="9" fill="#94a3b8">Most retail traders are speculators. 89%+ lose money. Hedgers have an actual business need.</text>
    </g>
  </svg>
);

// SVG: Exchange vs OTC
const ExchangeVsOTCSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="320" fill="#0f172a" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Exchange-Traded vs OTC Derivatives</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">Two very different market structures</text>
    
    {/* Exchange Traded */}
    <g transform="translate(30, 80)">
      <rect x="0" y="0" width="300" height="200" fill="#22c55e" fillOpacity="0.1" rx="12" stroke="#22c55e" strokeWidth="2"/>
      <text x="150" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#22c55e">EXCHANGE-TRADED</text>
      <text x="150" y="48" textAnchor="middle" fontSize="10" fill="#94a3b8">CME, NSE, ICE</text>
      
      <g transform="translate(20, 65)">
        {[
          { icon: "✓", text: "Standardized contracts", color: "#22c55e" },
          { icon: "✓", text: "Central clearing (counterparty guarantee)", color: "#22c55e" },
          { icon: "✓", text: "Transparent pricing", color: "#22c55e" },
          { icon: "✓", text: "High liquidity", color: "#22c55e" },
          { icon: "✓", text: "Regulated environment", color: "#22c55e" }
        ].map((item, i) => (
          <g key={i} transform={`translate(0, ${i * 25})`}>
            <text x="0" y="15" fontSize="12" fill={item.color}>{item.icon}</text>
            <text x="20" y="14" fontSize="10" fill="#e2e8f0">{item.text}</text>
          </g>
        ))}
      </g>
    </g>
    
    {/* OTC */}
    <g transform="translate(370, 80)">
      <rect x="0" y="0" width="300" height="200" fill="#f97316" fillOpacity="0.1" rx="12" stroke="#f97316" strokeWidth="2"/>
      <text x="150" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#f97316">OVER-THE-COUNTER (OTC)</text>
      <text x="150" y="48" textAnchor="middle" fontSize="10" fill="#94a3b8">Bank-to-bank, Private deals</text>
      
      <g transform="translate(20, 65)">
        {[
          { icon: "◆", text: "Custom/tailored contracts", color: "#f97316" },
          { icon: "◆", text: "Bilateral credit risk", color: "#f97316" },
          { icon: "◆", text: "Less transparent pricing", color: "#f97316" },
          { icon: "◆", text: "Lower liquidity", color: "#f97316" },
          { icon: "◆", text: "Less regulated (more risk)", color: "#f97316" }
        ].map((item, i) => (
          <g key={i} transform={`translate(0, ${i * 25})`}>
            <text x="0" y="15" fontSize="10" fill={item.color}>{item.icon}</text>
            <text x="20" y="14" fontSize="10" fill="#e2e8f0">{item.text}</text>
          </g>
        ))}
      </g>
    </g>
    
    {/* Bottom insight */}
    <g transform="translate(50, 290)">
      <rect x="0" y="0" width="600" height="25" fill="#1e293b" rx="6"/>
      <text x="300" y="17" textAnchor="middle" fontSize="9" fill="#94a3b8">Most retail traders use exchange-traded derivatives. OTC is primarily for institutions with specific needs.</text>
    </g>
  </svg>
);

// SVG: Leverage Illustration
const LeverageIllustrationSVG = () => (
  <svg viewBox="0 0 700 350" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="350" fill="#0f172a" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">The Double-Edged Sword: Leverage</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">Leverage magnifies both gains AND losses equally</text>
    
    {/* Without Leverage */}
    <g transform="translate(50, 80)">
      <rect x="0" y="0" width="280" height="200" fill="#22c55e" fillOpacity="0.1" rx="12" stroke="#22c55e" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="#22c55e">WITHOUT LEVERAGE</text>
      <text x="140" y="48" textAnchor="middle" fontSize="10" fill="#94a3b8">Direct stock purchase</text>
      
      <g transform="translate(20, 65)">
        <rect x="0" y="0" width="240" height="40" fill="#1e293b" rx="6"/>
        <text x="120" y="17" textAnchor="middle" fontSize="10" fill="white">Investment: $10,000</text>
        <text x="120" y="32" textAnchor="middle" fontSize="9" fill="#94a3b8">Buy 100 shares at $100 each</text>
      </g>
      
      <g transform="translate(20, 115)">
        <rect x="0" y="0" width="115" height="65" fill="#22c55e" fillOpacity="0.2" rx="6"/>
        <text x="57" y="18" textAnchor="middle" fontSize="9" fontWeight="500" fill="#22c55e">Stock rises 10%</text>
        <text x="57" y="38" textAnchor="middle" fontSize="12" fontWeight="700" fill="#22c55e">+$1,000</text>
        <text x="57" y="55" textAnchor="middle" fontSize="9" fill="#94a3b8">+10% return</text>
      </g>
      
      <g transform="translate(145, 115)">
        <rect x="0" y="0" width="115" height="65" fill="#dc2626" fillOpacity="0.2" rx="6"/>
        <text x="57" y="18" textAnchor="middle" fontSize="9" fontWeight="500" fill="#dc2626">Stock falls 10%</text>
        <text x="57" y="38" textAnchor="middle" fontSize="12" fontWeight="700" fill="#dc2626">-$1,000</text>
        <text x="57" y="55" textAnchor="middle" fontSize="9" fill="#94a3b8">-10% return</text>
      </g>
    </g>
    
    {/* With Leverage */}
    <g transform="translate(370, 80)">
      <rect x="0" y="0" width="280" height="200" fill="#dc2626" fillOpacity="0.1" rx="12" stroke="#dc2626" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="#dc2626">WITH 10x LEVERAGE</text>
      <text x="140" y="48" textAnchor="middle" fontSize="10" fill="#94a3b8">Futures/Options position</text>
      
      <g transform="translate(20, 65)">
        <rect x="0" y="0" width="240" height="40" fill="#1e293b" rx="6"/>
        <text x="120" y="17" textAnchor="middle" fontSize="10" fill="white">Margin: $10,000 controls $100,000</text>
        <text x="120" y="32" textAnchor="middle" fontSize="9" fill="#94a3b8">Same 100 shares exposure, 10% capital</text>
      </g>
      
      <g transform="translate(20, 115)">
        <rect x="0" y="0" width="115" height="65" fill="#22c55e" fillOpacity="0.2" rx="6"/>
        <text x="57" y="18" textAnchor="middle" fontSize="9" fontWeight="500" fill="#22c55e">Stock rises 10%</text>
        <text x="57" y="38" textAnchor="middle" fontSize="12" fontWeight="700" fill="#22c55e">+$10,000</text>
        <text x="57" y="55" textAnchor="middle" fontSize="9" fill="#22c55e">+100% return!</text>
      </g>
      
      <g transform="translate(145, 115)">
        <rect x="0" y="0" width="115" height="65" fill="#dc2626" fillOpacity="0.2" rx="6"/>
        <text x="57" y="18" textAnchor="middle" fontSize="9" fontWeight="500" fill="#dc2626">Stock falls 10%</text>
        <text x="57" y="38" textAnchor="middle" fontSize="12" fontWeight="700" fill="#dc2626">-$10,000</text>
        <text x="57" y="55" textAnchor="middle" fontSize="9" fill="#dc2626">-100% WIPED OUT!</text>
      </g>
    </g>
    
    {/* Warning */}
    <g transform="translate(50, 295)">
      <rect x="0" y="0" width="600" height="45" fill="#7f1d1d" rx="8"/>
      <text x="300" y="17" textAnchor="middle" fontSize="11" fontWeight="600" fill="#fca5a5">CRITICAL WARNING</text>
      <text x="300" y="35" textAnchor="middle" fontSize="9" fill="#fecaca">With leverage, a 10% adverse move can destroy your entire position. Larger moves can result in losses EXCEEDING your initial capital.</text>
    </g>
  </svg>
);

// SVG: Zero Sum Game
const ZeroSumGameSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="280" fill="#0f172a" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Derivatives: A Zero-Sum Game</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">For every winner, there is an equal loser (minus transaction costs)</text>
    
    {/* Balance Scale Visual */}
    <g transform="translate(150, 80)">
      {/* Left side - Winner */}
      <g transform="translate(0, 50)">
        <rect x="0" y="0" width="150" height="100" fill="#22c55e" fillOpacity="0.2" rx="10"/>
        <text x="75" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#22c55e">WINNER</text>
        <text x="75" y="55" textAnchor="middle" fontSize="20" fontWeight="700" fill="#22c55e">+$5,000</text>
        <text x="75" y="80" textAnchor="middle" fontSize="10" fill="#94a3b8">Bet was correct</text>
      </g>
      
      {/* Balance beam */}
      <g transform="translate(160, 30)">
        <rect x="0" y="45" width="80" height="8" fill="#64748b" rx="2"/>
        <rect x="35" y="0" width="10" height="100" fill="#64748b" rx="2"/>
        <polygon points="40,0 30,20 50,20" fill="#64748b"/>
        <text x="40" y="120" textAnchor="middle" fontSize="10" fill="#f97316">=</text>
      </g>
      
      {/* Right side - Loser */}
      <g transform="translate(250, 50)">
        <rect x="0" y="0" width="150" height="100" fill="#dc2626" fillOpacity="0.2" rx="10"/>
        <text x="75" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#dc2626">LOSER</text>
        <text x="75" y="55" textAnchor="middle" fontSize="20" fontWeight="700" fill="#dc2626">-$5,000</text>
        <text x="75" y="80" textAnchor="middle" fontSize="10" fill="#94a3b8">Bet was wrong</text>
      </g>
    </g>
    
    {/* Key Point */}
    <g transform="translate(50, 195)">
      <rect x="0" y="0" width="600" height="75" fill="#1e293b" rx="10"/>
      <text x="300" y="20" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">What This Means For You</text>
      <text x="300" y="40" textAnchor="middle" fontSize="9" fill="#94a3b8">Unlike stocks (where all holders can profit if company grows), derivatives are adversarial.</text>
      <text x="300" y="55" textAnchor="middle" fontSize="9" fill="#94a3b8">Your counterparty is often a sophisticated institution with better information and technology.</text>
      <text x="300" y="70" textAnchor="middle" fontSize="9" fill="#f97316">This is why 89%+ of retail derivative traders lose money.</text>
    </g>
  </svg>
);

// Quiz Questions
const quizQuestions = [
  {
    id: 1,
    question: "What is the fundamental difference between a stock and a derivative?",
    options: [
      "Derivatives are always more profitable than stocks",
      "A stock represents ownership; a derivative is a contract about price movement",
      "Derivatives can only be traded on weekends",
      "Stocks have more leverage than derivatives"
    ],
    correct: 1,
    explanation: "A stock represents actual ownership in a company. A derivative is a contract whose value is derived from an underlying asset - you don't own the asset, just a contract about its price."
  },
  {
    id: 2,
    question: "Why is derivatives trading considered a zero-sum game?",
    options: [
      "Because no one ever makes money",
      "Because the exchange takes all profits",
      "For every winner there must be an equal loser",
      "Because prices never change"
    ],
    correct: 2,
    explanation: "In derivatives, one party's gain exactly equals another party's loss (minus transaction costs). Unlike stocks where all holders can profit, derivatives are fundamentally adversarial."
  },
  {
    id: 3,
    question: "Which market participant uses derivatives to REDUCE risk?",
    options: [
      "Speculators",
      "Day traders",
      "Hedgers",
      "Momentum traders"
    ],
    correct: 2,
    explanation: "Hedgers use derivatives to reduce business risk - like a farmer locking in crop prices or an airline hedging fuel costs. Speculators and traders are taking on risk for potential profit."
  },
  {
    id: 4,
    question: "With 10x leverage, if the underlying asset falls 10%, what happens to your position?",
    options: [
      "You lose 10% of your capital",
      "You lose 1% of your capital",
      "You lose 100% of your capital",
      "Nothing happens due to hedging"
    ],
    correct: 2,
    explanation: "Leverage multiplies both gains AND losses. With 10x leverage, a 10% adverse move means 10 x 10% = 100% loss of your invested capital. This is why leverage is extremely dangerous."
  }
];

const FOLesson1 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (questionId, answerIndex) => {
    if (showResults) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correct) correct++;
    });
    return correct;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-orange-50  ">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/learn/derivatives')}
            className="flex items-center gap-2 text-gray-600  hover:text-orange-600  transition-colors mb-4"
          >
            <Icons.ArrowLeft className="w-4 h-4" />
            <span>Back to Module</span>
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-orange-100  text-orange-700  text-sm font-medium rounded-full">
              Lesson 1 of 12
            </span>
            <span className="flex items-center gap-1 text-gray-500  text-sm">
              <Icons.Clock className="w-4 h-4" />
              20 min read
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900  mb-4">
            Introduction to Derivatives
          </h1>
          <p className="text-lg text-gray-600 ">
            Understanding what derivatives are, who trades them, and why they exist.
          </p>
        </div>

        {/* Learning Objectives */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 mb-10 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Icons.Target className="w-6 h-6" />
            <h2 className="text-xl font-bold">Learning Objectives</h2>
          </div>
          <ul className="space-y-2">
            {[
              "Understand what derivative contracts are and how they differ from direct investments",
              "Identify the three main types of market participants and their motivations",
              "Recognize the role of leverage and its amplification of both gains and losses",
              "Appreciate why derivatives are a zero-sum game with significant retail trader losses"
            ].map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <Icons.CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          
          {/* Section 1: What is a Derivative */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                  <Icons.BookOpen className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">What is a Derivative?</h2>
                  <p className="text-sm text-gray-500 ">The foundational concept</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                A <strong>derivative</strong> is a financial contract whose value is <em>derived</em> from an underlying asset. 
                The underlying can be a stock, index, commodity, currency, interest rate, or even another derivative.
              </p>

              <WhatIsDerivativeSVG />

              <div className="mt-6 space-y-4">
                <div className="bg-orange-50  rounded-xl p-5 border border-orange-200 ">
                  <h4 className="font-bold text-orange-800  mb-2">The Critical Distinction</h4>
                  <p className="text-gray-700  text-sm leading-relaxed">
                    When you buy a stock, you own a piece of the company. When you buy a derivative, you own a 
                    <strong> contract</strong> - an agreement about future price movement. This is fundamentally different 
                    and carries unique risks.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50  rounded-xl p-5">
                    <h4 className="font-bold text-gray-900  mb-2">Futures Contracts</h4>
                    <p className="text-gray-600  text-sm">
                      An <strong>obligation</strong> to buy or sell an asset at a predetermined price on a specific future date. 
                      Both parties must fulfill the contract.
                    </p>
                  </div>
                  <div className="bg-gray-50  rounded-xl p-5">
                    <h4 className="font-bold text-gray-900  mb-2">Options Contracts</h4>
                    <p className="text-gray-600  text-sm">
                      The <strong>right</strong> (but not obligation) to buy or sell an asset at a strike price before expiration. 
                      Buyer pays a premium for this flexibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Market Participants */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                  <Icons.Users className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Who Trades Derivatives?</h2>
                  <p className="text-sm text-gray-500 ">Understanding market participants</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Derivative markets consist of three main categories of participants, each with fundamentally different 
                motivations and risk profiles.
              </p>

              <MarketParticipantsSVG />

              <div className="mt-6 bg-red-50  rounded-xl p-5 border border-red-200 ">
                <div className="flex items-start gap-3">
                  <Icons.AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-800  mb-1">Reality Check for Retail Traders</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      Most retail traders enter derivatives as speculators, but without the sophisticated tools, 
                      data, and speed of institutional players. Studies consistently show that 89% or more of 
                      retail derivative traders lose money over time. You are competing against professionals 
                      who do this for a living.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Exchange vs OTC */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                  <Icons.Building className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Market Structure</h2>
                  <p className="text-sm text-gray-500 ">Exchange-traded vs Over-the-Counter</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Derivatives trade in two distinct market structures, each with different characteristics for 
                transparency, liquidity, and counterparty risk.
              </p>

              <ExchangeVsOTCSVG />

              <div className="mt-6 bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                <h4 className="font-bold text-blue-800  mb-2">For Retail Traders</h4>
                <p className="text-gray-700  text-sm leading-relaxed">
                  As a retail trader, you will almost exclusively trade exchange-traded derivatives. These offer 
                  the protections of central clearing, transparent pricing, and regulatory oversight. OTC markets 
                  are primarily for large institutions with specific hedging needs.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Leverage */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                  <Icons.TrendingUp className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">The Leverage Effect</h2>
                  <p className="text-sm text-gray-500 ">Understanding amplification of returns</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Leverage is the defining characteristic of derivatives. It allows you to control a large position 
                with a small amount of capital - but it cuts both ways.
              </p>

              <LeverageIllustrationSVG />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50  rounded-xl p-5 border border-green-200 ">
                  <h4 className="font-bold text-green-800  mb-2">The Upside</h4>
                  <p className="text-gray-700  text-sm">
                    Leverage can magnify returns significantly. A 10% move with 10x leverage becomes 100% return 
                    on your capital.
                  </p>
                </div>
                <div className="bg-red-50  rounded-xl p-5 border border-red-200 ">
                  <h4 className="font-bold text-red-800  mb-2">The Downside</h4>
                  <p className="text-gray-700  text-sm">
                    The same leverage magnifies losses equally. A 10% adverse move with 10x leverage wipes out 
                    100% of your capital.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Zero Sum Game */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                  <Icons.Scale className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Zero-Sum Game</h2>
                  <p className="text-sm text-gray-500 ">Understanding the adversarial nature</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Unlike investing in stocks where all shareholders can benefit from company growth, derivatives 
                are fundamentally adversarial. Every contract has a buyer and a seller with opposite interests.
              </p>

              <ZeroSumGameSVG />

              <div className="mt-6 bg-amber-50  rounded-xl p-5 border border-amber-200 ">
                <div className="flex items-start gap-3">
                  <Icons.Lightbulb className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-800  mb-1">The Wealth Transfer</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      Derivatives primarily transfer wealth between participants rather than creating it. 
                      When combined with transaction costs, it becomes a negative-sum game overall. 
                      The consistent winners tend to be market makers and sophisticated institutional traders 
                      with informational and technological advantages.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Key Takeaways */}
          <section>
            <div className="bg-gradient-to-br from-slate-900 to-orange-950 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">Key Takeaways</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Derivatives are contracts whose value is derived from underlying assets",
                  "Three main participants: hedgers (reduce risk), speculators (take risk), arbitrageurs (exploit inefficiencies)",
                  "Leverage magnifies both gains and losses - a double-edged sword",
                  "Derivatives are zero-sum: your gain is someone else's loss",
                  "89%+ of retail derivative traders lose money",
                  "Exchange-traded derivatives offer better protection than OTC"
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/10 rounded-lg p-4">
                    <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Quiz Section */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <h2 className="text-2xl font-bold text-gray-900  mb-6">Knowledge Check</h2>
              
              <div className="space-y-8">
                {quizQuestions.map((q) => (
                  <div key={q.id} className="bg-gray-50  rounded-xl p-6">
                    <p className="font-semibold text-gray-900  mb-4">{q.id}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswerSelect(q.id, idx)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            quizAnswers[q.id] === idx
                              ? showResults
                                ? idx === q.correct
                                  ? 'border-green-500 bg-green-50 '
                                  : 'border-red-500 bg-red-50 '
                                : 'border-orange-500 bg-orange-50 '
                              : showResults && idx === q.correct
                                ? 'border-green-500 bg-green-50 '
                                : 'border-gray-200  hover:border-gray-300 '
                          }`}
                        >
                          <span className="text-gray-700 ">{option}</span>
                        </button>
                      ))}
                    </div>
                    {showResults && (
                      <div className={`mt-4 p-4 rounded-lg ${
                        quizAnswers[q.id] === q.correct
                          ? 'bg-green-100  text-green-800 '
                          : 'bg-red-100  text-red-800 '
                      }`}>
                        <p className="text-sm">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!showResults ? (
                <button
                  onClick={() => setShowResults(true)}
                  disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-red-700 transition-all"
                >
                  Check Answers
                </button>
              ) : (
                <div className="mt-6 p-4 bg-gray-100  rounded-xl text-center">
                  <p className="text-lg font-semibold text-gray-900 ">
                    Score: {calculateScore()} / {quizQuestions.length}
                  </p>
                  <p className="text-gray-600  text-sm mt-1">
                    {calculateScore() === quizQuestions.length 
                      ? "Excellent! You've mastered the fundamentals." 
                      : "Review the explanations above for any questions you missed."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200 ">
            <button
              onClick={() => navigate('/learn/derivatives')}
              className="flex items-center gap-2 text-gray-600  hover:text-orange-600 transition-colors"
            >
              <Icons.ArrowLeft className="w-5 h-5" />
              <span>Back to Overview</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/derivatives/lesson-2')}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all"
            >
              <span>Next: Futures Fundamentals</span>
              <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FOLesson1;
