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
  Target: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  AlertTriangle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Lightbulb: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18h6M10 22h4M12 2v1M4.22 4.22l.71.71M1 12h1M4.22 19.78l.71-.71M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
    </svg>
  ),
  Calculator: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="8" y1="18" x2="8" y2="18.01"/><line x1="12" y1="18" x2="12" y2="18.01"/><line x1="16" y1="18" x2="16" y2="18.01"/>
    </svg>
  ),
  TrendingUp: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  TrendingDown: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
    </svg>
  ),
  Activity: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  DollarSign: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )
};

// SVG: Cost of Carry Formula
const CostOfCarrySVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <defs>
      <linearGradient id="formulaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a"/>
        <stop offset="100%" stopColor="#1e3a5f"/>
      </linearGradient>
    </defs>
    
    <rect x="0" y="0" width="700" height="380" fill="url(#formulaGrad)" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">The Cost of Carry Model</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">Theoretical framework for futures pricing</text>
    
    {/* Main Formula */}
    <g transform="translate(50, 80)">
      <rect x="0" y="0" width="600" height="100" fill="#1e293b" rx="12"/>
      
      <g transform="translate(300, 50)">
        <text textAnchor="middle" y="0" fontSize="24" fontWeight="700" fill="white">F = S × e</text>
        <text textAnchor="start" x="70" y="-12" fontSize="14" fontWeight="700" fill="#f97316">(r - d) × t</text>
      </g>
      
      <g transform="translate(20, 85)">
        <text fontSize="9" fill="#94a3b8">Where: F = Futures Price | S = Spot Price | r = Risk-Free Rate | d = Dividend Yield | t = Time to Expiry</text>
      </g>
    </g>
    
    {/* Components Breakdown */}
    <g transform="translate(30, 200)">
      {/* Spot Price */}
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="150" height="100" fill="#22c55e" fillOpacity="0.15" rx="10" stroke="#22c55e" strokeWidth="1"/>
        <text x="75" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#22c55e">Spot Price (S)</text>
        <text x="75" y="50" textAnchor="middle" fontSize="10" fill="#94a3b8">Current market</text>
        <text x="75" y="65" textAnchor="middle" fontSize="10" fill="#94a3b8">price of asset</text>
        <text x="75" y="85" textAnchor="middle" fontSize="9" fill="#64748b">Foundation of futures</text>
      </g>
      
      {/* Plus sign */}
      <text x="165" y="55" fontSize="24" fontWeight="700" fill="#64748b">+</text>
      
      {/* Interest Cost */}
      <g transform="translate(190, 0)">
        <rect x="0" y="0" width="150" height="100" fill="#f97316" fillOpacity="0.15" rx="10" stroke="#f97316" strokeWidth="1"/>
        <text x="75" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#f97316">Interest (r × t)</text>
        <text x="75" y="50" textAnchor="middle" fontSize="10" fill="#94a3b8">Financing cost to</text>
        <text x="75" y="65" textAnchor="middle" fontSize="10" fill="#94a3b8">hold position</text>
        <text x="75" y="85" textAnchor="middle" fontSize="9" fill="#64748b">Adds to futures price</text>
      </g>
      
      {/* Minus sign */}
      <text x="355" y="55" fontSize="24" fontWeight="700" fill="#64748b">−</text>
      
      {/* Dividend/Convenience */}
      <g transform="translate(380, 0)">
        <rect x="0" y="0" width="150" height="100" fill="#3b82f6" fillOpacity="0.15" rx="10" stroke="#3b82f6" strokeWidth="1"/>
        <text x="75" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#3b82f6">Benefits (d × t)</text>
        <text x="75" y="50" textAnchor="middle" fontSize="10" fill="#94a3b8">Dividends, coupons</text>
        <text x="75" y="65" textAnchor="middle" fontSize="10" fill="#94a3b8">missed by futures</text>
        <text x="75" y="85" textAnchor="middle" fontSize="9" fill="#64748b">Reduces futures price</text>
      </g>
      
      {/* Equals */}
      <text x="545" y="55" fontSize="24" fontWeight="700" fill="#64748b">=</text>
      
      {/* Futures Price */}
      <g transform="translate(570, 0)">
        <rect x="0" y="0" width="90" height="100" fill="#a855f7" fillOpacity="0.15" rx="10" stroke="#a855f7" strokeWidth="1"/>
        <text x="45" y="35" textAnchor="middle" fontSize="12" fontWeight="600" fill="#a855f7">Futures</text>
        <text x="45" y="55" textAnchor="middle" fontSize="12" fontWeight="600" fill="#a855f7">Price (F)</text>
        <text x="45" y="85" textAnchor="middle" fontSize="9" fill="#64748b">Fair value</text>
      </g>
    </g>
    
    {/* Example */}
    <g transform="translate(50, 315)">
      <rect x="0" y="0" width="600" height="55" fill="#1e293b" rx="8"/>
      <text x="20" y="22" fontSize="10" fontWeight="600" fill="white">Example:</text>
      <text x="90" y="22" fontSize="10" fill="#94a3b8">Spot = $100 | r = 5% | d = 2% | t = 0.25 years (3 months)</text>
      <text x="20" y="42" fontSize="10" fontWeight="600" fill="#f97316">Fair Value:</text>
      <text x="100" y="42" fontSize="10" fill="white">F = 100 × e^(0.05-0.02)×0.25 = 100 × 1.0075 = $100.75</text>
    </g>
  </svg>
);

// SVG: Contango vs Backwardation
const ContangoBackwardationSVG = () => (
  <svg viewBox="0 0 700 400" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="400" fill="#0f172a" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Market Structure: Contango vs Backwardation</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">Understanding the relationship between spot and futures prices</text>
    
    {/* Contango Chart */}
    <g transform="translate(40, 80)">
      <rect x="0" y="0" width="300" height="230" fill="#1e293b" rx="12"/>
      <text x="150" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#f97316">CONTANGO</text>
      <text x="150" y="50" textAnchor="middle" fontSize="10" fill="#94a3b8">Futures &gt; Spot (Normal Market)</text>
      
      {/* Chart area */}
      <g transform="translate(40, 70)">
        {/* Axes */}
        <line x1="0" y1="120" x2="220" y2="120" stroke="#475569" strokeWidth="1"/>
        <line x1="0" y1="0" x2="0" y2="120" stroke="#475569" strokeWidth="1"/>
        <text x="-15" y="60" fontSize="9" fill="#94a3b8" transform="rotate(-90, -15, 60)">Price</text>
        
        {/* Spot line */}
        <line x1="0" y1="90" x2="200" y2="90" stroke="#22c55e" strokeWidth="2" strokeDasharray="5,5"/>
        <text x="210" y="93" fontSize="8" fill="#22c55e">Spot</text>
        
        {/* Futures curve - upward sloping */}
        <path d="M 0 70 Q 100 75 200 90" stroke="#f97316" strokeWidth="3" fill="none"/>
        <text x="15" y="65" fontSize="8" fill="#f97316">Far Futures</text>
        <text x="175" y="85" fontSize="8" fill="#f97316">Near</text>
        
        {/* Premium bracket */}
        <line x1="30" y1="72" x2="30" y2="90" stroke="#f97316" strokeWidth="1"/>
        <text x="45" y="82" fontSize="8" fill="#f97316">Premium</text>
      </g>
      
      {/* Description */}
      <text x="150" y="210" textAnchor="middle" fontSize="9" fill="#94a3b8">Cost of carry exceeds convenience yield</text>
      <text x="150" y="225" textAnchor="middle" fontSize="8" fill="#64748b">Common in: Interest rate futures, most equity indices</text>
    </g>
    
    {/* Backwardation Chart */}
    <g transform="translate(360, 80)">
      <rect x="0" y="0" width="300" height="230" fill="#1e293b" rx="12"/>
      <text x="150" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#dc2626">BACKWARDATION</text>
      <text x="150" y="50" textAnchor="middle" fontSize="10" fill="#94a3b8">Futures &lt; Spot (Inverted Market)</text>
      
      {/* Chart area */}
      <g transform="translate(40, 70)">
        {/* Axes */}
        <line x1="0" y1="120" x2="220" y2="120" stroke="#475569" strokeWidth="1"/>
        <line x1="0" y1="0" x2="0" y2="120" stroke="#475569" strokeWidth="1"/>
        <text x="-15" y="60" fontSize="9" fill="#94a3b8" transform="rotate(-90, -15, 60)">Price</text>
        
        {/* Spot line */}
        <line x1="0" y1="50" x2="200" y2="50" stroke="#22c55e" strokeWidth="2" strokeDasharray="5,5"/>
        <text x="210" y="53" fontSize="8" fill="#22c55e">Spot</text>
        
        {/* Futures curve - downward sloping */}
        <path d="M 0 80 Q 100 70 200 50" stroke="#dc2626" strokeWidth="3" fill="none"/>
        <text x="15" y="90" fontSize="8" fill="#dc2626">Far Futures</text>
        <text x="175" y="45" fontSize="8" fill="#dc2626">Near</text>
        
        {/* Discount bracket */}
        <line x1="30" y1="50" x2="30" y2="78" stroke="#dc2626" strokeWidth="1"/>
        <text x="45" y="68" fontSize="8" fill="#dc2626">Discount</text>
      </g>
      
      {/* Description */}
      <text x="150" y="210" textAnchor="middle" fontSize="9" fill="#94a3b8">Convenience yield exceeds cost of carry</text>
      <text x="150" y="225" textAnchor="middle" fontSize="8" fill="#64748b">Common in: Commodities during shortages</text>
    </g>
    
    {/* Key Insight */}
    <g transform="translate(50, 325)">
      <rect x="0" y="0" width="600" height="65" fill="#1e293b" rx="10"/>
      <text x="300" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">Trading Implications</text>
      <text x="300" y="40" textAnchor="middle" fontSize="9" fill="#94a3b8">Contango: Roll costs hurt long positions (futures converge down to spot)</text>
      <text x="300" y="55" textAnchor="middle" fontSize="9" fill="#94a3b8">Backwardation: Roll costs benefit long positions (futures converge up to spot)</text>
    </g>
  </svg>
);

// SVG: Basis and Convergence
const BasisConvergenceSVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="380" fill="#0f172a" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Basis and Convergence</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">The gap between spot and futures prices</text>
    
    {/* Chart Area */}
    <g transform="translate(70, 80)">
      {/* Axes */}
      <line x1="0" y1="150" x2="560" y2="150" stroke="#475569" strokeWidth="2"/>
      <line x1="0" y1="0" x2="0" y2="150" stroke="#475569" strokeWidth="2"/>
      
      {/* Labels */}
      <text x="280" y="175" textAnchor="middle" fontSize="11" fill="#94a3b8">Time</text>
      <text x="-40" y="75" fontSize="11" fill="#94a3b8" transform="rotate(-90, -40, 75)">Price</text>
      
      {/* Time markers */}
      <text x="50" y="168" fontSize="9" fill="#64748b">Today</text>
      <text x="280" y="168" fontSize="9" fill="#64748b">Mid-Contract</text>
      <text x="500" y="168" fontSize="9" fill="#64748b">Expiry</text>
      
      {/* Spot price line (relatively flat) */}
      <path d="M 50 90 Q 200 85 350 95 Q 450 90 530 90" stroke="#22c55e" strokeWidth="3" fill="none"/>
      <circle cx="50" cy="90" r="5" fill="#22c55e"/>
      <circle cx="530" cy="90" r="5" fill="#22c55e"/>
      <text x="545" y="95" fontSize="10" fontWeight="500" fill="#22c55e">Spot</text>
      
      {/* Futures price line (converging to spot) */}
      <path d="M 50 40 Q 200 50 350 70 Q 450 85 530 90" stroke="#f97316" strokeWidth="3" fill="none"/>
      <circle cx="50" cy="40" r="5" fill="#f97316"/>
      <circle cx="530" cy="90" r="5" fill="#f97316"/>
      <text x="545" y="45" fontSize="10" fontWeight="500" fill="#f97316">Futures</text>
      
      {/* Basis arrow */}
      <line x1="50" y1="45" x2="50" y2="85" stroke="#a855f7" strokeWidth="2" strokeDasharray="4,4"/>
      <text x="70" y="65" fontSize="10" fontWeight="600" fill="#a855f7">BASIS</text>
      
      {/* Convergence arrow */}
      <path d="M 400 55 Q 450 70 500 90" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,4" fill="none" markerEnd="url(#arrowhead)"/>
      <text x="420" y="45" fontSize="10" fontWeight="600" fill="#3b82f6">Convergence</text>
    </g>
    
    {/* Formula Box */}
    <g transform="translate(50, 305)">
      <rect x="0" y="0" width="280" height="55" fill="#a855f7" fillOpacity="0.15" rx="10" stroke="#a855f7" strokeWidth="1"/>
      <text x="140" y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill="#a855f7">Basis Formula</text>
      <text x="140" y="42" textAnchor="middle" fontSize="12" fontWeight="700" fill="white">Basis = Futures - Spot</text>
    </g>
    
    {/* Key Point */}
    <g transform="translate(350, 305)">
      <rect x="0" y="0" width="300" height="55" fill="#3b82f6" fillOpacity="0.15" rx="10" stroke="#3b82f6" strokeWidth="1"/>
      <text x="150" y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill="#3b82f6">At Expiry</text>
      <text x="150" y="42" textAnchor="middle" fontSize="12" fontWeight="700" fill="white">Basis → 0 (Convergence)</text>
    </g>
  </svg>
);

// SVG: Arbitrage Mechanism
const ArbitrageSVG = () => (
  <svg viewBox="0 0 700 420" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="420" fill="#0f172a" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">How Arbitrage Keeps Futures Fairly Priced</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">If futures deviate from fair value, arbitrageurs profit and restore equilibrium</text>
    
    {/* Overpriced Futures */}
    <g transform="translate(30, 80)">
      <rect x="0" y="0" width="310" height="240" fill="#dc2626" fillOpacity="0.1" rx="12" stroke="#dc2626" strokeWidth="2"/>
      <text x="155" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#dc2626">FUTURES OVERPRICED</text>
      <text x="155" y="50" textAnchor="middle" fontSize="10" fill="#94a3b8">F &gt; S × e^(r-d)t (too expensive)</text>
      
      <g transform="translate(20, 70)">
        <text x="135" y="0" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">Arbitrage Steps:</text>
        
        {[
          { step: "1", action: "SELL futures (short)", color: "#dc2626" },
          { step: "2", action: "BUY spot asset", color: "#22c55e" },
          { step: "3", action: "BORROW money to buy", color: "#3b82f6" },
          { step: "4", action: "At expiry: deliver asset", color: "#f97316" }
        ].map((item, i) => (
          <g key={i} transform={`translate(0, ${20 + i * 38})`}>
            <circle cx="15" cy="12" r="12" fill={item.color} fillOpacity="0.3"/>
            <text x="15" y="17" textAnchor="middle" fontSize="10" fontWeight="700" fill={item.color}>{item.step}</text>
            <text x="40" y="17" fontSize="10" fill="#e2e8f0">{item.action}</text>
          </g>
        ))}
        
        <g transform="translate(0, 175)">
          <rect x="0" y="0" width="270" height="35" fill="#22c55e" fillOpacity="0.2" rx="6"/>
          <text x="135" y="15" textAnchor="middle" fontSize="10" fontWeight="600" fill="#22c55e">RESULT: Lock in risk-free profit</text>
          <text x="135" y="28" textAnchor="middle" fontSize="8" fill="#94a3b8">Selling pressure pushes futures down</text>
        </g>
      </g>
    </g>
    
    {/* Underpriced Futures */}
    <g transform="translate(360, 80)">
      <rect x="0" y="0" width="310" height="240" fill="#22c55e" fillOpacity="0.1" rx="12" stroke="#22c55e" strokeWidth="2"/>
      <text x="155" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#22c55e">FUTURES UNDERPRICED</text>
      <text x="155" y="50" textAnchor="middle" fontSize="10" fill="#94a3b8">F &lt; S × e^(r-d)t (too cheap)</text>
      
      <g transform="translate(20, 70)">
        <text x="135" y="0" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">Arbitrage Steps:</text>
        
        {[
          { step: "1", action: "BUY futures (long)", color: "#22c55e" },
          { step: "2", action: "SELL/short spot asset", color: "#dc2626" },
          { step: "3", action: "INVEST proceeds at r", color: "#3b82f6" },
          { step: "4", action: "At expiry: take delivery", color: "#f97316" }
        ].map((item, i) => (
          <g key={i} transform={`translate(0, ${20 + i * 38})`}>
            <circle cx="15" cy="12" r="12" fill={item.color} fillOpacity="0.3"/>
            <text x="15" y="17" textAnchor="middle" fontSize="10" fontWeight="700" fill={item.color}>{item.step}</text>
            <text x="40" y="17" fontSize="10" fill="#e2e8f0">{item.action}</text>
          </g>
        ))}
        
        <g transform="translate(0, 175)">
          <rect x="0" y="0" width="270" height="35" fill="#22c55e" fillOpacity="0.2" rx="6"/>
          <text x="135" y="15" textAnchor="middle" fontSize="10" fontWeight="600" fill="#22c55e">RESULT: Lock in risk-free profit</text>
          <text x="135" y="28" textAnchor="middle" fontSize="8" fill="#94a3b8">Buying pressure pushes futures up</text>
        </g>
      </g>
    </g>
    
    {/* Key Insight */}
    <g transform="translate(50, 370)">
      <rect x="0" y="0" width="600" height="40" fill="#1e293b" rx="8"/>
      <text x="300" y="16" textAnchor="middle" fontSize="10" fontWeight="600" fill="#f97316">KEY INSIGHT</text>
      <text x="300" y="32" textAnchor="middle" fontSize="9" fill="#94a3b8">Arbitrage keeps futures close to fair value. Large deviations are quickly corrected by professional traders.</text>
    </g>
  </svg>
);

// SVG: Premium vs Discount
const PremiumDiscountSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="280" fill="#0f172a" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Futures Premium vs Discount</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">Understanding market sentiment from futures pricing</text>
    
    {/* Premium */}
    <g transform="translate(50, 80)">
      <rect x="0" y="0" width="280" height="150" fill="#22c55e" fillOpacity="0.1" rx="12" stroke="#22c55e" strokeWidth="2"/>
      <text x="140" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#22c55e">PREMIUM</text>
      <text x="140" y="50" textAnchor="middle" fontSize="10" fill="#94a3b8">Futures &gt; Spot</text>
      
      <g transform="translate(20, 65)">
        <text x="120" y="15" textAnchor="middle" fontSize="24" fontWeight="700" fill="#22c55e">F &gt; S</text>
        <text x="120" y="45" textAnchor="middle" fontSize="9" fill="#e2e8f0">Normal in most markets</text>
        <text x="120" y="65" textAnchor="middle" fontSize="9" fill="#94a3b8">Reflects cost of carry</text>
        <text x="120" y="80" textAnchor="middle" fontSize="9" fill="#94a3b8">(financing, storage)</text>
      </g>
    </g>
    
    {/* Discount */}
    <g transform="translate(370, 80)">
      <rect x="0" y="0" width="280" height="150" fill="#dc2626" fillOpacity="0.1" rx="12" stroke="#dc2626" strokeWidth="2"/>
      <text x="140" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#dc2626">DISCOUNT</text>
      <text x="140" y="50" textAnchor="middle" fontSize="10" fill="#94a3b8">Futures &lt; Spot</text>
      
      <g transform="translate(20, 65)">
        <text x="120" y="15" textAnchor="middle" fontSize="24" fontWeight="700" fill="#dc2626">F &lt; S</text>
        <text x="120" y="45" textAnchor="middle" fontSize="9" fill="#e2e8f0">Often signals:</text>
        <text x="120" y="65" textAnchor="middle" fontSize="9" fill="#94a3b8">- Bearish sentiment</text>
        <text x="120" y="80" textAnchor="middle" fontSize="9" fill="#94a3b8">- High dividend yield</text>
      </g>
    </g>
    
    {/* Practical Note */}
    <g transform="translate(50, 245)">
      <rect x="0" y="0" width="600" height="25" fill="#1e293b" rx="6"/>
      <text x="300" y="17" textAnchor="middle" fontSize="9" fill="#94a3b8">Monitor premium/discount changes for sentiment shifts. Sudden changes can signal institutional activity.</text>
    </g>
  </svg>
);

// Quiz Questions
const quizQuestions = [
  {
    id: 1,
    question: "According to the cost of carry model, which factors ADD to the futures price relative to spot?",
    options: [
      "Dividends and interest rates",
      "Only interest rates (financing costs)",
      "Only dividends",
      "Neither - futures always equal spot"
    ],
    correct: 1,
    explanation: "Interest rates (financing costs) add to the futures price because holding a long futures position is equivalent to borrowing money to buy the asset. Dividends SUBTRACT from futures price because futures holders miss out on them."
  },
  {
    id: 2,
    question: "What is the market structure called when futures prices are HIGHER than spot prices?",
    options: [
      "Backwardation",
      "Contango",
      "Convergence",
      "Basis risk"
    ],
    correct: 1,
    explanation: "Contango is when futures trade at a premium to spot (F > S). This is the normal market structure where cost of carry exceeds convenience yield. Backwardation is the opposite - futures below spot."
  },
  {
    id: 3,
    question: "What happens to the basis as a futures contract approaches expiry?",
    options: [
      "Basis increases indefinitely",
      "Basis stays constant",
      "Basis converges toward zero",
      "Basis becomes negative"
    ],
    correct: 2,
    explanation: "Basis (Futures - Spot) converges to zero at expiry. This is because at expiry, the futures contract settles at the spot price. This convergence is a fundamental property of futures contracts."
  },
  {
    id: 4,
    question: "If futures are trading significantly ABOVE their fair value, what will arbitrageurs do?",
    options: [
      "Buy futures and sell spot",
      "Sell futures and buy spot",
      "Buy both futures and spot",
      "Do nothing and wait"
    ],
    correct: 1,
    explanation: "If futures are overpriced (above fair value), arbitrageurs will sell (short) the expensive futures and buy the cheaper spot asset. This selling pressure on futures brings the price back toward fair value."
  }
];

const FOLesson3 = () => {
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
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              Lesson 3 of 12
            </span>
            <span className="flex items-center gap-1 text-gray-500  text-sm">
              <Icons.Clock className="w-4 h-4" />
              25 min read
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900  mb-4">
            Futures Pricing & Basis
          </h1>
          <p className="text-lg text-gray-600 ">
            Understanding cost of carry, contango, backwardation, and price convergence.
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
              "Master the cost of carry model for calculating theoretical futures prices",
              "Understand contango vs backwardation and their trading implications",
              "Learn how basis works and why convergence occurs at expiry",
              "Comprehend how arbitrage keeps futures prices aligned with fair value"
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
          
          {/* Section 1: Cost of Carry */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                  <Icons.Calculator className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">The Cost of Carry Model</h2>
                  <p className="text-sm text-gray-500 ">Theoretical foundation of futures pricing</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                The cost of carry model explains why futures prices differ from spot prices. It accounts for 
                the costs and benefits of holding the underlying asset versus holding a futures position.
              </p>

              <CostOfCarrySVG />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-50  rounded-xl p-5 border border-orange-200 ">
                  <h4 className="font-bold text-orange-800  mb-2">Costs of Carry</h4>
                  <ul className="text-gray-700  text-sm space-y-1">
                    <li>• Interest cost (financing)</li>
                    <li>• Storage costs (commodities)</li>
                    <li>• Insurance costs</li>
                  </ul>
                </div>
                <div className="bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                  <h4 className="font-bold text-blue-800  mb-2">Benefits of Carry</h4>
                  <ul className="text-gray-700  text-sm space-y-1">
                    <li>• Dividends (equity futures)</li>
                    <li>• Convenience yield (commodities)</li>
                    <li>• Interest income (bond futures)</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Contango vs Backwardation */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                  <Icons.Activity className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Contango vs Backwardation</h2>
                  <p className="text-sm text-gray-500 ">Market structure shapes trading strategies</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                The term structure of futures prices — whether markets are in contango or backwardation — 
                has significant implications for trading strategies and roll costs.
              </p>

              <ContangoBackwardationSVG />

              <div className="mt-6 bg-purple-50  rounded-xl p-5 border border-purple-200 ">
                <div className="flex items-start gap-3">
                  <Icons.Lightbulb className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-purple-800  mb-1">Roll Yield Impact</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      In <strong>contango</strong>, rolling long positions involves selling the expiring contract low 
                      and buying the next contract high — a negative roll yield. In <strong>backwardation</strong>, 
                      rolling generates a positive roll yield. This is why commodity ETFs often underperform 
                      in persistent contango markets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Basis and Convergence */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
                  <Icons.TrendingUp className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Basis and Convergence</h2>
                  <p className="text-sm text-gray-500 ">The gap that must close at expiry</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Basis is the difference between futures and spot prices. Understanding basis behavior 
                is crucial for hedgers and for timing entry and exit in futures positions.
              </p>

              <BasisConvergenceSVG />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50  rounded-xl p-5">
                  <h4 className="font-bold text-gray-900  mb-2">Basis Risk for Hedgers</h4>
                  <p className="text-gray-600  text-sm">
                    Hedgers face basis risk because the futures and spot prices may not move in perfect 
                    lockstep. If you close a hedge before expiry, basis changes can affect your hedge effectiveness.
                  </p>
                </div>
                <div className="bg-gray-50  rounded-xl p-5">
                  <h4 className="font-bold text-gray-900  mb-2">Convergence Guarantee</h4>
                  <p className="text-gray-600  text-sm">
                    At expiry, futures MUST equal spot (for cash-settled contracts) or physical delivery 
                    occurs. This guaranteed convergence is what makes hedging possible.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Arbitrage */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                  <Icons.DollarSign className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Arbitrage Mechanism</h2>
                  <p className="text-sm text-gray-500 ">How fair pricing is maintained</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Arbitrage keeps futures prices close to their theoretical fair value. When prices deviate, 
                arbitrageurs step in to profit from the mispricing, restoring equilibrium.
              </p>

              <ArbitrageSVG />

              <div className="mt-6 bg-red-50  rounded-xl p-5 border border-red-200 ">
                <div className="flex items-start gap-3">
                  <Icons.AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-800  mb-1">For Retail Traders</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      True arbitrage opportunities are almost impossible for retail traders to capture. 
                      They require significant capital, low transaction costs, and fast execution. 
                      By the time you see a mispricing, professional arbitrageurs have likely already corrected it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Premium vs Discount */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                  <Icons.TrendingDown className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Premium vs Discount</h2>
                  <p className="text-sm text-gray-500 ">Reading market sentiment from futures pricing</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Whether futures trade at a premium or discount to spot can signal market sentiment 
                and institutional positioning. Traders monitor these changes for insights.
              </p>

              <PremiumDiscountSVG />

              <div className="mt-6 bg-amber-50  rounded-xl p-5 border border-amber-200 ">
                <h4 className="font-bold text-amber-800  mb-2">Practical Application</h4>
                <p className="text-gray-700  text-sm leading-relaxed">
                  Monitor the premium/discount relative to the theoretical fair value. A sudden shift 
                  from premium to discount (or vice versa) can indicate changing institutional sentiment 
                  before it shows up in price action.
                </p>
              </div>
            </div>
          </section>

          {/* Key Takeaways */}
          <section>
            <div className="bg-gradient-to-br from-slate-900 to-orange-950 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">Key Takeaways</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Futures fair value = Spot × e^(r-d)t where r = interest rate, d = dividend yield",
                  "Contango (F > S) is normal; reflects financing costs",
                  "Backwardation (F < S) signals supply shortages or high convenience yield",
                  "Basis = Futures - Spot; converges to zero at expiry",
                  "Arbitrage keeps prices near fair value; retail rarely can capture these opportunities",
                  "Monitor premium/discount changes for sentiment shifts"
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
                      ? "Excellent! You understand futures pricing well." 
                      : "Review the explanations to strengthen your understanding."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200 ">
            <button
              onClick={() => navigate('/learn/derivatives/lesson-2')}
              className="flex items-center gap-2 text-gray-600  hover:text-orange-600 transition-colors"
            >
              <Icons.ArrowLeft className="w-5 h-5" />
              <span>Previous: Futures Fundamentals</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/derivatives/lesson-4')}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all"
            >
              <span>Next: Options Mechanics</span>
              <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FOLesson3;
