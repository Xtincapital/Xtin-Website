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
  DollarSign: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  FileText: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Calendar: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Layers: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  RefreshCw: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  )
};

// SVG: Futures Contract Structure
const FuturesContractSVG = () => (
  <svg viewBox="0 0 700 400" className="w-full h-auto">
    <defs>
      <linearGradient id="futuresGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a"/>
        <stop offset="100%" stopColor="#1e3a5f"/>
      </linearGradient>
    </defs>
    
    <rect x="0" y="0" width="700" height="400" fill="url(#futuresGrad)" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Anatomy of a Futures Contract</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">Standardized agreement to buy/sell at predetermined price on future date</text>
    
    {/* Contract Document Visual */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="600" height="280" fill="#1e293b" rx="12" stroke="#475569" strokeWidth="2"/>
      
      {/* Header */}
      <rect x="0" y="0" width="600" height="50" fill="#334155" rx="12 12 0 0"/>
      <text x="300" y="32" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">FUTURES CONTRACT SPECIFICATION</text>
      
      {/* Contract Elements */}
      <g transform="translate(20, 70)">
        {/* Underlying Asset */}
        <g>
          <rect x="0" y="0" width="270" height="90" fill="#22c55e" fillOpacity="0.15" rx="8" stroke="#22c55e" strokeWidth="1"/>
          <text x="135" y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill="#22c55e">UNDERLYING ASSET</text>
          <text x="135" y="45" textAnchor="middle" fontSize="20" fontWeight="700" fill="white">NIFTY 50 Index</text>
          <text x="135" y="65" textAnchor="middle" fontSize="9" fill="#94a3b8">What you&apos;re trading</text>
          <text x="135" y="80" textAnchor="middle" fontSize="8" fill="#94a3b8">(Stock, Index, Commodity, Currency)</text>
        </g>
        
        {/* Contract Size */}
        <g transform="translate(290, 0)">
          <rect x="0" y="0" width="270" height="90" fill="#3b82f6" fillOpacity="0.15" rx="8" stroke="#3b82f6" strokeWidth="1"/>
          <text x="135" y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill="#3b82f6">LOT SIZE (Contract Multiplier)</text>
          <text x="135" y="45" textAnchor="middle" fontSize="20" fontWeight="700" fill="white">50 Units</text>
          <text x="135" y="65" textAnchor="middle" fontSize="9" fill="#94a3b8">Value = Index Level x 50</text>
          <text x="135" y="80" textAnchor="middle" fontSize="8" fill="#94a3b8">If NIFTY = 22,000 → Contract = ₹11 Lakh</text>
        </g>
      </g>
      
      <g transform="translate(20, 175)">
        {/* Expiry Date */}
        <g>
          <rect x="0" y="0" width="175" height="85" fill="#f97316" fillOpacity="0.15" rx="8" stroke="#f97316" strokeWidth="1"/>
          <text x="87" y="20" textAnchor="middle" fontSize="10" fontWeight="600" fill="#f97316">EXPIRY DATE</text>
          <text x="87" y="42" textAnchor="middle" fontSize="14" fontWeight="700" fill="white">Last Thursday</text>
          <text x="87" y="58" textAnchor="middle" fontSize="9" fill="#94a3b8">of contract month</text>
          <text x="87" y="75" textAnchor="middle" fontSize="8" fill="#94a3b8">Monthly/Weekly cycles</text>
        </g>
        
        {/* Tick Size */}
        <g transform="translate(190, 0)">
          <rect x="0" y="0" width="175" height="85" fill="#a855f7" fillOpacity="0.15" rx="8" stroke="#a855f7" strokeWidth="1"/>
          <text x="87" y="20" textAnchor="middle" fontSize="10" fontWeight="600" fill="#a855f7">TICK SIZE</text>
          <text x="87" y="42" textAnchor="middle" fontSize="14" fontWeight="700" fill="white">0.05 Points</text>
          <text x="87" y="58" textAnchor="middle" fontSize="9" fill="#94a3b8">Minimum price move</text>
          <text x="87" y="75" textAnchor="middle" fontSize="8" fill="#94a3b8">Tick Value = ₹2.50</text>
        </g>
        
        {/* Settlement */}
        <g transform="translate(380, 0)">
          <rect x="0" y="0" width="175" height="85" fill="#ec4899" fillOpacity="0.15" rx="8" stroke="#ec4899" strokeWidth="1"/>
          <text x="87" y="20" textAnchor="middle" fontSize="10" fontWeight="600" fill="#ec4899">SETTLEMENT</text>
          <text x="87" y="42" textAnchor="middle" fontSize="14" fontWeight="700" fill="white">Cash Settled</text>
          <text x="87" y="58" textAnchor="middle" fontSize="9" fill="#94a3b8">No physical delivery</text>
          <text x="87" y="75" textAnchor="middle" fontSize="8" fill="#94a3b8">P&L settled in cash</text>
        </g>
      </g>
    </g>
    
    {/* Key Point */}
    <g transform="translate(50, 365)">
      <rect x="0" y="0" width="600" height="25" fill="#1e293b" rx="6"/>
      <text x="300" y="17" textAnchor="middle" fontSize="9" fill="#f97316">Standardization enables liquidity — same contracts traded by thousands of participants</text>
    </g>
  </svg>
);

// SVG: Margin System
const MarginSystemSVG = () => (
  <svg viewBox="0 0 700 420" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="420" fill="#0f172a" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">The Margin System</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">How futures enable leveraged trading through collateral requirements</text>
    
    {/* Margin Types */}
    <g transform="translate(30, 80)">
      {/* Initial Margin */}
      <g>
        <rect x="0" y="0" width="200" height="180" fill="#22c55e" fillOpacity="0.1" rx="12" stroke="#22c55e" strokeWidth="2"/>
        <text x="100" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fill="#22c55e">INITIAL MARGIN</text>
        <text x="100" y="55" textAnchor="middle" fontSize="9" fill="#94a3b8">Upfront deposit required</text>
        
        <g transform="translate(15, 70)">
          <rect x="0" y="0" width="170" height="95" fill="#0f172a" rx="8"/>
          <text x="85" y="25" textAnchor="middle" fontSize="24" fontWeight="700" fill="#22c55e">~10-15%</text>
          <text x="85" y="45" textAnchor="middle" fontSize="9" fill="#94a3b8">of contract value</text>
          <text x="85" y="65" textAnchor="middle" fontSize="8" fill="white">Example: ₹11L contract</text>
          <text x="85" y="80" textAnchor="middle" fontSize="8" fill="white">requires ~₹1.5L margin</text>
        </g>
      </g>
      
      {/* Maintenance Margin */}
      <g transform="translate(220, 0)">
        <rect x="0" y="0" width="200" height="180" fill="#f97316" fillOpacity="0.1" rx="12" stroke="#f97316" strokeWidth="2"/>
        <text x="100" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fill="#f97316">MAINTENANCE</text>
        <text x="100" y="55" textAnchor="middle" fontSize="9" fill="#94a3b8">Minimum balance required</text>
        
        <g transform="translate(15, 70)">
          <rect x="0" y="0" width="170" height="95" fill="#0f172a" rx="8"/>
          <text x="85" y="25" textAnchor="middle" fontSize="24" fontWeight="700" fill="#f97316">~7-10%</text>
          <text x="85" y="45" textAnchor="middle" fontSize="9" fill="#94a3b8">of contract value</text>
          <text x="85" y="65" textAnchor="middle" fontSize="8" fill="white">If balance falls below,</text>
          <text x="85" y="80" textAnchor="middle" fontSize="8" fill="white">margin call triggered</text>
        </g>
      </g>
      
      {/* Mark to Market */}
      <g transform="translate(440, 0)">
        <rect x="0" y="0" width="220" height="180" fill="#dc2626" fillOpacity="0.1" rx="12" stroke="#dc2626" strokeWidth="2"/>
        <text x="110" y="30" textAnchor="middle" fontSize="13" fontWeight="600" fill="#dc2626">MARK-TO-MARKET</text>
        <text x="110" y="55" textAnchor="middle" fontSize="9" fill="#94a3b8">Daily settlement of P&L</text>
        
        <g transform="translate(15, 70)">
          <rect x="0" y="0" width="190" height="95" fill="#0f172a" rx="8"/>
          <text x="95" y="25" textAnchor="middle" fontSize="12" fontWeight="700" fill="#dc2626">DAILY</text>
          <text x="95" y="45" textAnchor="middle" fontSize="9" fill="#94a3b8">profits/losses settled</text>
          <text x="95" y="65" textAnchor="middle" fontSize="8" fill="white">Gains credited to account</text>
          <text x="95" y="80" textAnchor="middle" fontSize="8" fill="white">Losses debited immediately</text>
        </g>
      </g>
    </g>
    
    {/* Flow Diagram */}
    <g transform="translate(50, 275)">
      <rect x="0" y="0" width="600" height="100" fill="#1e293b" rx="10"/>
      <text x="300" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">Margin Call Flow</text>
      
      <g transform="translate(30, 45)">
        {/* Step 1 */}
        <rect x="0" y="0" width="100" height="40" fill="#22c55e" fillOpacity="0.3" rx="6"/>
        <text x="50" y="25" textAnchor="middle" fontSize="8" fill="white">Position Opens</text>
        
        <polygon points="110,20 125,12 125,28" fill="#64748b"/>
        
        {/* Step 2 */}
        <rect x="135" y="0" width="100" height="40" fill="#f97316" fillOpacity="0.3" rx="6"/>
        <text x="185" y="18" textAnchor="middle" fontSize="8" fill="white">Price Moves</text>
        <text x="185" y="30" textAnchor="middle" fontSize="8" fill="white">Against You</text>
        
        <polygon points="245,20 260,12 260,28" fill="#64748b"/>
        
        {/* Step 3 */}
        <rect x="270" y="0" width="120" height="40" fill="#dc2626" fillOpacity="0.3" rx="6"/>
        <text x="330" y="18" textAnchor="middle" fontSize="8" fill="white">Below Maintenance</text>
        <text x="330" y="30" textAnchor="middle" fontSize="8" fill="#dc2626">MARGIN CALL!</text>
        
        <polygon points="400,20 415,12 415,28" fill="#64748b"/>
        
        {/* Step 4 */}
        <rect x="425" y="0" width="110" height="40" fill="#7f1d1d" fillOpacity="0.5" rx="6"/>
        <text x="480" y="18" textAnchor="middle" fontSize="8" fill="white">Add funds or</text>
        <text x="480" y="30" textAnchor="middle" fontSize="8" fill="#fca5a5">Position CLOSED</text>
      </g>
    </g>
    
    {/* Warning */}
    <g transform="translate(50, 385)">
      <rect x="0" y="0" width="600" height="25" fill="#7f1d1d" rx="6"/>
      <text x="300" y="17" textAnchor="middle" fontSize="9" fill="#fca5a5">If margin call not met, broker will forcibly close position — often at worst possible prices</text>
    </g>
  </svg>
);

// SVG: Daily Settlement
const DailySettlementSVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="380" fill="#0f172a" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Daily Mark-to-Market Settlement</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">How profits and losses are settled every single trading day</text>
    
    {/* Timeline */}
    <g transform="translate(100, 85)">
      <text x="0" y="0" fontSize="11" fontWeight="600" fill="white">Example: Long 1 NIFTY Future at 22,000</text>
      
      {/* Day headers */}
      <g transform="translate(0, 25)">
        {["Day 0", "Day 1", "Day 2", "Day 3", "Day 4"].map((day, i) => (
          <g key={i} transform={`translate(${i * 115}, 0)`}>
            <rect x="0" y="0" width="105" height="30" fill="#334155" rx="6"/>
            <text x="52" y="20" textAnchor="middle" fontSize="10" fontWeight="500" fill="white">{day}</text>
          </g>
        ))}
      </g>
      
      {/* Price row */}
      <g transform="translate(0, 65)">
        <text x="-10" y="18" textAnchor="end" fontSize="9" fill="#94a3b8">Settle Price</text>
        {[22000, 22200, 21800, 22100, 22400].map((price, i) => (
          <g key={i} transform={`translate(${i * 115}, 0)`}>
            <rect x="0" y="0" width="105" height="35" fill="#1e293b" rx="6"/>
            <text x="52" y="22" textAnchor="middle" fontSize="12" fontWeight="600" fill="white">{price.toLocaleString()}</text>
          </g>
        ))}
      </g>
      
      {/* Daily P&L row */}
      <g transform="translate(0, 110)">
        <text x="-10" y="18" textAnchor="end" fontSize="9" fill="#94a3b8">Daily P&L</text>
        {["Entry", "+200 pts", "-400 pts", "+300 pts", "+300 pts"].map((pnl, i) => {
          const isProfit = pnl.includes("+");
          const isLoss = pnl.includes("-");
          return (
            <g key={i} transform={`translate(${i * 115}, 0)`}>
              <rect x="0" y="0" width="105" height="35" 
                fill={isProfit ? "#22c55e" : isLoss ? "#dc2626" : "#64748b"} 
                fillOpacity={i === 0 ? 0.2 : 0.25} rx="6"/>
              <text x="52" y="22" textAnchor="middle" fontSize="11" fontWeight="600" 
                fill={isProfit ? "#22c55e" : isLoss ? "#dc2626" : "#94a3b8"}>{pnl}</text>
            </g>
          );
        })}
      </g>
      
      {/* Cash Flow row */}
      <g transform="translate(0, 155)">
        <text x="-10" y="18" textAnchor="end" fontSize="9" fill="#94a3b8">Cash Flow</text>
        <text x="-10" y="32" textAnchor="end" fontSize="8" fill="#64748b">(Lot = 50)</text>
        {["—", "+₹10,000", "-₹20,000", "+₹15,000", "+₹15,000"].map((cash, i) => {
          const isProfit = cash.includes("+");
          const isLoss = cash.includes("-");
          return (
            <g key={i} transform={`translate(${i * 115}, 0)`}>
              <rect x="0" y="0" width="105" height="35" fill="#0f172a" rx="6" stroke={isProfit ? "#22c55e" : isLoss ? "#dc2626" : "#475569"} strokeWidth="1"/>
              <text x="52" y="22" textAnchor="middle" fontSize="10" fontWeight="600" 
                fill={isProfit ? "#22c55e" : isLoss ? "#fca5a5" : "#94a3b8"}>{cash}</text>
            </g>
          );
        })}
      </g>
      
      {/* Running Total */}
      <g transform="translate(0, 205)">
        <text x="-10" y="18" textAnchor="end" fontSize="9" fill="#94a3b8">Running Total</text>
        {["₹0", "+₹10,000", "-₹10,000", "+₹5,000", "+₹20,000"].map((total, i) => {
          const val = parseInt(total.replace(/[₹,+]/g, '')) || 0;
          return (
            <g key={i} transform={`translate(${i * 115}, 0)`}>
              <rect x="0" y="0" width="105" height="35" fill="#1e293b" rx="6"/>
              <text x="52" y="22" textAnchor="middle" fontSize="10" fontWeight="700" 
                fill={val > 0 ? "#22c55e" : val < 0 ? "#dc2626" : "white"}>{total}</text>
            </g>
          );
        })}
      </g>
    </g>
    
    {/* Key insight */}
    <g transform="translate(50, 340)">
      <rect x="0" y="0" width="600" height="30" fill="#1e293b" rx="6"/>
      <text x="300" y="19" textAnchor="middle" fontSize="9" fill="#94a3b8">Net P&L = (Exit Price - Entry Price) × Lot Size = (22,400 - 22,000) × 50 = ₹20,000 profit</text>
    </g>
  </svg>
);

// SVG: Long vs Short
const LongShortSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="320" fill="#0f172a" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Long vs Short Positions</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">Two sides of every futures trade</text>
    
    {/* Long Position */}
    <g transform="translate(40, 80)">
      <rect x="0" y="0" width="290" height="200" fill="#22c55e" fillOpacity="0.1" rx="12" stroke="#22c55e" strokeWidth="2"/>
      
      <g transform="translate(145, 25)">
        <circle r="20" fill="#22c55e" fillOpacity="0.3"/>
        <path d="M0,-12 L0,12 M-8,4 L0,-4 L8,4" stroke="#22c55e" strokeWidth="3" fill="none"/>
      </g>
      
      <text x="145" y="65" textAnchor="middle" fontSize="16" fontWeight="700" fill="#22c55e">LONG (BUY)</text>
      <text x="145" y="85" textAnchor="middle" fontSize="10" fill="#94a3b8">Obligation to BUY at expiry</text>
      
      <g transform="translate(20, 100)">
        <rect x="0" y="0" width="250" height="85" fill="#0f172a" rx="8"/>
        <text x="125" y="25" textAnchor="middle" fontSize="10" fill="white">Profit when price RISES</text>
        <text x="125" y="45" textAnchor="middle" fontSize="9" fill="#22c55e">P&L = (Exit - Entry) × Lots</text>
        <text x="125" y="65" textAnchor="middle" fontSize="9" fill="#94a3b8">Bullish view on underlying</text>
        <text x="125" y="80" textAnchor="middle" fontSize="8" fill="#64748b">Unlimited profit, unlimited loss</text>
      </g>
    </g>
    
    {/* Short Position */}
    <g transform="translate(370, 80)">
      <rect x="0" y="0" width="290" height="200" fill="#dc2626" fillOpacity="0.1" rx="12" stroke="#dc2626" strokeWidth="2"/>
      
      <g transform="translate(145, 25)">
        <circle r="20" fill="#dc2626" fillOpacity="0.3"/>
        <path d="M0,-12 L0,12 M-8,-4 L0,4 L8,-4" stroke="#dc2626" strokeWidth="3" fill="none"/>
      </g>
      
      <text x="145" y="65" textAnchor="middle" fontSize="16" fontWeight="700" fill="#dc2626">SHORT (SELL)</text>
      <text x="145" y="85" textAnchor="middle" fontSize="10" fill="#94a3b8">Obligation to SELL at expiry</text>
      
      <g transform="translate(20, 100)">
        <rect x="0" y="0" width="250" height="85" fill="#0f172a" rx="8"/>
        <text x="125" y="25" textAnchor="middle" fontSize="10" fill="white">Profit when price FALLS</text>
        <text x="125" y="45" textAnchor="middle" fontSize="9" fill="#dc2626">P&L = (Entry - Exit) × Lots</text>
        <text x="125" y="65" textAnchor="middle" fontSize="9" fill="#94a3b8">Bearish view on underlying</text>
        <text x="125" y="80" textAnchor="middle" fontSize="8" fill="#64748b">Unlimited profit, unlimited loss</text>
      </g>
    </g>
    
    {/* Key point */}
    <g transform="translate(50, 290)">
      <rect x="0" y="0" width="600" height="25" fill="#1e293b" rx="6"/>
      <text x="300" y="17" textAnchor="middle" fontSize="9" fill="#94a3b8">Unlike stocks, you can short futures just as easily as going long — no borrowing required</text>
    </g>
  </svg>
);

// SVG: Contract Expiry
const ContractExpirySVG = () => (
  <svg viewBox="0 0 700 280" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="280" fill="#0f172a" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Contract Expiry Cycles</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#94a3b8">Understanding when futures contracts expire</text>
    
    {/* Monthly Contracts */}
    <g transform="translate(50, 80)">
      <rect x="0" y="0" width="600" height="70" fill="#1e293b" rx="10"/>
      <text x="20" y="25" fontSize="12" fontWeight="600" fill="#f97316">MONTHLY CONTRACTS</text>
      <text x="20" y="45" fontSize="9" fill="#94a3b8">Expire on last Thursday of each month</text>
      
      <g transform="translate(260, 12)">
        {["Current", "Near", "Far"].map((label, i) => (
          <g key={i} transform={`translate(${i * 115}, 0)`}>
            <rect x="0" y="0" width="105" height="48" fill={i === 0 ? "#f97316" : "#475569"} fillOpacity={i === 0 ? 0.3 : 0.3} rx="6"/>
            <text x="52" y="18" textAnchor="middle" fontSize="9" fontWeight="500" fill={i === 0 ? "#f97316" : "#94a3b8"}>{label} Month</text>
            <text x="52" y="36" textAnchor="middle" fontSize="10" fill="white">
              {i === 0 ? "Jan 25" : i === 1 ? "Feb 25" : "Mar 25"}
            </text>
          </g>
        ))}
      </g>
    </g>
    
    {/* Weekly Contracts */}
    <g transform="translate(50, 165)">
      <rect x="0" y="0" width="600" height="70" fill="#1e293b" rx="10"/>
      <text x="20" y="25" fontSize="12" fontWeight="600" fill="#3b82f6">WEEKLY CONTRACTS</text>
      <text x="20" y="45" fontSize="9" fill="#94a3b8">Expire every Thursday</text>
      
      <g transform="translate(260, 12)">
        {["This Week", "Next Week", "Week 3", "Week 4"].map((label, i) => (
          <g key={i} transform={`translate(${i * 87}, 0)`}>
            <rect x="0" y="0" width="80" height="48" fill={i === 0 ? "#3b82f6" : "#475569"} fillOpacity={i === 0 ? 0.3 : 0.3} rx="6"/>
            <text x="40" y="18" textAnchor="middle" fontSize="8" fontWeight="500" fill={i === 0 ? "#3b82f6" : "#94a3b8"}>{label}</text>
            <text x="40" y="36" textAnchor="middle" fontSize="9" fill="white">{`Jan ${9 + i * 7}`}</text>
          </g>
        ))}
      </g>
    </g>
    
    {/* Key point */}
    <g transform="translate(50, 250)">
      <text x="300" y="12" textAnchor="middle" fontSize="9" fill="#94a3b8">Liquidity is highest in current month/week contracts. Far-dated contracts have lower volume and wider spreads.</text>
    </g>
  </svg>
);

// Quiz Questions
const quizQuestions = [
  {
    id: 1,
    question: "What is the primary purpose of the initial margin in futures trading?",
    options: [
      "To pay the broker's commission",
      "To serve as collateral ensuring contract performance",
      "To buy the underlying asset",
      "To pay for market data"
    ],
    correct: 1,
    explanation: "Initial margin is a good-faith deposit that acts as collateral. It ensures both parties can fulfill their obligations and covers potential losses from daily price movements."
  },
  {
    id: 2,
    question: "In mark-to-market settlement, when are profits and losses settled?",
    options: [
      "Only when the contract expires",
      "Weekly on Fridays",
      "Daily at market close",
      "Monthly on the last trading day"
    ],
    correct: 2,
    explanation: "Mark-to-market means daily settlement of profits and losses. Each day, gains are credited and losses are debited from your margin account based on the settlement price."
  },
  {
    id: 3,
    question: "What happens if your account falls below the maintenance margin?",
    options: [
      "Your position automatically profits",
      "You receive a margin call to add funds or position is closed",
      "Nothing happens until expiry",
      "The exchange refunds your money"
    ],
    correct: 1,
    explanation: "When your account balance falls below maintenance margin, you receive a margin call. You must deposit additional funds to restore the initial margin level, or the broker will close your position."
  },
  {
    id: 4,
    question: "A trader who expects prices to FALL should take which position?",
    options: [
      "Long position",
      "Neutral position",
      "Short position",
      "Both long and short equally"
    ],
    correct: 2,
    explanation: "A short (sell) position profits when prices fall. The trader's P&L = (Entry Price - Exit Price) × Lots. Falling prices mean higher entry than exit, resulting in profit."
  }
];

const FOLesson2 = () => {
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
              Lesson 2 of 12
            </span>
            <span className="flex items-center gap-1 text-gray-500  text-sm">
              <Icons.Clock className="w-4 h-4" />
              25 min read
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900  mb-4">
            Futures Fundamentals
          </h1>
          <p className="text-lg text-gray-600 ">
            Understanding contract specifications, margin systems, and daily settlement mechanics.
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
              "Understand futures contract specifications and their standardized components",
              "Master the margin system: initial margin, maintenance margin, and margin calls",
              "Comprehend daily mark-to-market settlement and its implications",
              "Differentiate between long and short positions and when to use each"
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
          
          {/* Section 1: Contract Specifications */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                  <Icons.FileText className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Contract Specifications</h2>
                  <p className="text-sm text-gray-500 ">The building blocks of a futures contract</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Every futures contract has standardized specifications that make trading possible. These specifications 
                are set by the exchange and cannot be changed by individual traders.
              </p>

              <FuturesContractSVG />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50  rounded-xl p-5">
                  <h4 className="font-bold text-gray-900  mb-2">Lot Size Matters</h4>
                  <p className="text-gray-600  text-sm">
                    The lot size determines your minimum exposure. For NIFTY with a lot size of 50, every 1-point 
                    move in the index = ₹50 change in your P&L.
                  </p>
                </div>
                <div className="bg-gray-50  rounded-xl p-5">
                  <h4 className="font-bold text-gray-900  mb-2">Tick Size Economics</h4>
                  <p className="text-gray-600  text-sm">
                    Tick size is the minimum price movement. For NIFTY (0.05 points × 50 lot = ₹2.50 per tick), 
                    understanding this helps calculate exact profits and losses.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Margin System */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
                  <Icons.DollarSign className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">The Margin System</h2>
                  <p className="text-sm text-gray-500 ">How leverage is enabled through collateral</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                The margin system is what enables leverage in futures trading. Instead of paying the full contract 
                value, you deposit a percentage as collateral. This is both powerful and dangerous.
              </p>

              <MarginSystemSVG />

              <div className="mt-6 bg-red-50  rounded-xl p-5 border border-red-200 ">
                <div className="flex items-start gap-3">
                  <Icons.AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-800  mb-1">The Margin Call Trap</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      Margin calls often come at the worst time — when you&apos;re already losing. If you cannot 
                      meet a margin call, your position will be forcibly liquidated, often at unfavorable prices. 
                      This can turn a temporary loss into a permanent one.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Daily Settlement */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                  <Icons.RefreshCw className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Daily Mark-to-Market</h2>
                  <p className="text-sm text-gray-500 ">Understanding daily profit and loss settlement</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Unlike stocks where you only realize gains/losses when you sell, futures settle profits and 
                losses daily. This has significant implications for cash flow management.
              </p>

              <DailySettlementSVG />

              <div className="mt-6 bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                <div className="flex items-start gap-3">
                  <Icons.Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-blue-800  mb-1">Cash Flow Implications</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      Daily settlement means you need adequate cash reserves. Even if your position eventually 
                      becomes profitable, you must survive the losing days in between. Many traders are forced 
                      out of ultimately profitable positions due to insufficient cash for daily settlements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Long vs Short */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                  <Icons.Layers className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Long vs Short Positions</h2>
                  <p className="text-sm text-gray-500 ">Profiting from both rising and falling markets</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                One of the key advantages of futures is the ability to profit from falling prices just as 
                easily as rising prices. Understanding when to go long vs short is fundamental.
              </p>

              <LongShortSVG />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50  rounded-xl p-5 border border-green-200 ">
                  <h4 className="font-bold text-green-800  mb-2">When to Go Long</h4>
                  <ul className="text-gray-700  text-sm space-y-1">
                    <li>• Bullish outlook on underlying</li>
                    <li>• Expecting prices to rise</li>
                    <li>• Want exposure to upside</li>
                  </ul>
                </div>
                <div className="bg-red-50  rounded-xl p-5 border border-red-200 ">
                  <h4 className="font-bold text-red-800  mb-2">When to Go Short</h4>
                  <ul className="text-gray-700  text-sm space-y-1">
                    <li>• Bearish outlook on underlying</li>
                    <li>• Expecting prices to fall</li>
                    <li>• Hedging existing long positions</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Contract Expiry */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                  <Icons.Calendar className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1">Contract Expiry Cycles</h2>
                  <p className="text-sm text-gray-500 ">Understanding when contracts expire</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Futures contracts have fixed expiry dates. Understanding the expiry cycle is crucial for 
                position management and avoiding unintended deliveries or settlements.
              </p>

              <ContractExpirySVG />

              <div className="mt-6 bg-amber-50  rounded-xl p-5 border border-amber-200 ">
                <h4 className="font-bold text-amber-800  mb-2">Expiry Week Dynamics</h4>
                <p className="text-gray-700  text-sm leading-relaxed">
                  The days leading up to expiry often see increased volatility as traders roll over positions 
                  to the next contract. Liquidity shifts from the expiring contract to the next month. Be 
                  aware of these dynamics to avoid getting caught in illiquid positions.
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
                  "Futures contracts have standardized specifications: underlying, lot size, tick size, expiry",
                  "Initial margin is 10-15% of contract value, enabling significant leverage",
                  "Maintenance margin triggers margin calls when breached",
                  "Mark-to-market means daily settlement of profits and losses",
                  "Long positions profit from rising prices; short positions profit from falling prices",
                  "Current month contracts have highest liquidity; plan rollovers before expiry"
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
                      ? "Excellent! You understand futures mechanics well." 
                      : "Review the explanations above to reinforce your understanding."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200 ">
            <button
              onClick={() => navigate('/learn/derivatives/lesson-1')}
              className="flex items-center gap-2 text-gray-600  hover:text-orange-600 transition-colors"
            >
              <Icons.ArrowLeft className="w-5 h-5" />
              <span>Previous: Introduction</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/derivatives/lesson-3')}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all"
            >
              <span>Next: Futures Pricing</span>
              <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FOLesson2;
