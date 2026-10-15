import React, { useState } from "react";
import StudyShell from "../../components/StudyShell";
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
  Shield: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  TrendingUp: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Maximize: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
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
  Activity: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  )
};

// SVG: Covered Call
const CoveredCallSVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <defs>
      <linearGradient id="ccGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1F1F1F"/>
        <stop offset="100%" stopColor="#2A2A2C"/>
      </linearGradient>
    </defs>
    
    <rect x="0" y="0" width="700" height="380" fill="url(#ccGrad)" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Covered Call Strategy</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A0A3AA">Own stock + Sell call = Generate income with capped upside</text>
    
    {/* Payoff Diagram */}
    <g transform="translate(80, 80)">
      {/* Axes */}
      <line x1="0" y1="120" x2="280" y2="120" stroke="#555A63" strokeWidth="1"/>
      <line x1="140" y1="20" x2="140" y2="200" stroke="#555A63" strokeWidth="1"/>
      
      <text x="280" y="140" fontSize="9" fill="#A0A3AA">Stock Price</text>
      <text x="145" y="15" fontSize="9" fill="#A0A3AA">P/L</text>
      
      {/* Stock only (dotted) */}
      <path d="M 0 200 L 280 40" fill="none" stroke="#555A63" strokeWidth="1.5" strokeDasharray="4"/>
      
      {/* Covered call payoff */}
      <path d="M 0 180 L 140 100 L 280 100" fill="none" stroke="#16A34A" strokeWidth="3"/>
      
      {/* Strike marker */}
      <line x1="140" y1="100" x2="140" y2="125" stroke="#D2754C" strokeWidth="2" strokeDasharray="3"/>
      <text x="140" y="140" textAnchor="middle" fontSize="8" fill="#D2754C">Strike</text>
      
      {/* Max profit line */}
      <line x1="140" y1="100" x2="280" y2="100" stroke="#16A34A" strokeWidth="2" strokeDasharray="4"/>
      
      <text x="220" y="90" fontSize="8" fill="#16A34A">Max Profit (capped)</text>
    </g>
    
    {/* Strategy Details */}
    <g transform="translate(380, 80)">
      <rect x="0" y="0" width="280" height="180" fill="#2A2A2C" rx="10"/>
      
      <text x="140" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A">STRATEGY COMPONENTS</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="10" fill="white">Position:</text>
        <text x="0" y="18" fontSize="9" fill="#A0A3AA">• Long 100 shares of stock</text>
        <text x="0" y="34" fontSize="9" fill="#A0A3AA">• Short 1 OTM call option</text>
        
        <text x="0" y="60" fontSize="10" fill="white">Max Profit:</text>
        <text x="0" y="78" fontSize="9" fill="#A0A3AA">(Strike - Stock Price) + Premium</text>
        
        <text x="0" y="100" fontSize="10" fill="white">Max Loss:</text>
        <text x="0" y="118" fontSize="9" fill="#A0A3AA">Stock can go to $0 (minus premium)</text>
        
        <text x="0" y="140" fontSize="10" fill="white">Breakeven:</text>
        <text x="0" y="158" fontSize="9" fill="#A0A3AA">Stock Price - Premium Received</text>
      </g>
    </g>
    
    {/* When to Use */}
    <g transform="translate(50, 285)">
      <rect x="0" y="0" width="600" height="80" fill="#16A34A" fillOpacity="0.1" rx="10" stroke="#16A34A" strokeWidth="1"/>
      <text x="300" y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">IDEAL MARKET OUTLOOK</text>
      <text x="20" y="45" fontSize="9" fill="white">• Neutral to slightly bullish on the underlying stock</text>
      <text x="20" y="62" fontSize="9" fill="white">• Willing to sell shares at the strike price (willing to cap gains)</text>
      <text x="320" y="45" fontSize="9" fill="white">• Want to generate income from existing holdings</text>
      <text x="320" y="62" fontSize="9" fill="white">• Expecting low volatility / range-bound market</text>
    </g>
  </svg>
);

// SVG: Protective Put
const ProtectivePutSVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="380" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Protective Put (Married Put)</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A0A3AA">Own stock + Buy put = Insurance against downside</text>
    
    {/* Payoff Diagram */}
    <g transform="translate(80, 80)">
      {/* Axes */}
      <line x1="0" y1="120" x2="280" y2="120" stroke="#555A63" strokeWidth="1"/>
      <line x1="140" y1="20" x2="140" y2="200" stroke="#555A63" strokeWidth="1"/>
      
      <text x="280" y="140" fontSize="9" fill="#A0A3AA">Stock Price</text>
      <text x="145" y="15" fontSize="9" fill="#A0A3AA">P/L</text>
      
      {/* Stock only (dotted) */}
      <path d="M 0 200 L 280 40" fill="none" stroke="#555A63" strokeWidth="1.5" strokeDasharray="4"/>
      
      {/* Protective put payoff */}
      <path d="M 0 150 L 140 150 L 280 30" fill="none" stroke="#5A77AA" strokeWidth="3"/>
      
      {/* Strike marker */}
      <line x1="140" y1="150" x2="140" y2="125" stroke="#D2754C" strokeWidth="2" strokeDasharray="3"/>
      <text x="140" y="172" textAnchor="middle" fontSize="8" fill="#D2754C">Strike</text>
      
      {/* Max loss line */}
      <line x1="0" y1="150" x2="140" y2="150" stroke="#C7363B" strokeWidth="2" strokeDasharray="4"/>
      
      <text x="50" y="142" fontSize="8" fill="#C7363B">Max Loss (limited)</text>
    </g>
    
    {/* Strategy Details */}
    <g transform="translate(380, 80)">
      <rect x="0" y="0" width="280" height="180" fill="#2A2A2C" rx="10"/>
      
      <text x="140" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#5A77AA">STRATEGY COMPONENTS</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="10" fill="white">Position:</text>
        <text x="0" y="18" fontSize="9" fill="#A0A3AA">• Long 100 shares of stock</text>
        <text x="0" y="34" fontSize="9" fill="#A0A3AA">• Long 1 put option (any strike)</text>
        
        <text x="0" y="60" fontSize="10" fill="white">Max Profit:</text>
        <text x="0" y="78" fontSize="9" fill="#A0A3AA">Unlimited (stock can rise indefinitely)</text>
        
        <text x="0" y="100" fontSize="10" fill="white">Max Loss:</text>
        <text x="0" y="118" fontSize="9" fill="#A0A3AA">(Stock Price - Strike) + Premium Paid</text>
        
        <text x="0" y="140" fontSize="10" fill="white">Breakeven:</text>
        <text x="0" y="158" fontSize="9" fill="#A0A3AA">Stock Price + Premium Paid</text>
      </g>
    </g>
    
    {/* When to Use */}
    <g transform="translate(50, 285)">
      <rect x="0" y="0" width="600" height="80" fill="#5A77AA" fillOpacity="0.1" rx="10" stroke="#5A77AA" strokeWidth="1"/>
      <text x="300" y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill="#5A77AA">IDEAL MARKET OUTLOOK</text>
      <text x="20" y="45" fontSize="9" fill="white">• Long-term bullish but concerned about short-term risk</text>
      <text x="20" y="62" fontSize="9" fill="white">• Large unrealized gains you want to protect</text>
      <text x="320" y="45" fontSize="9" fill="white">• Ahead of earnings or uncertain events</text>
      <text x="320" y="62" fontSize="9" fill="white">• Like insurance - hope you don&apos;t need it</text>
    </g>
  </svg>
);

// SVG: Long Straddle
const LongStraddleSVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="380" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Long Straddle</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A0A3AA">Buy call + Buy put (same strike) = Profit from big moves either direction</text>
    
    {/* Payoff Diagram */}
    <g transform="translate(80, 80)">
      {/* Axes */}
      <line x1="0" y1="120" x2="280" y2="120" stroke="#555A63" strokeWidth="1"/>
      <line x1="140" y1="20" x2="140" y2="200" stroke="#555A63" strokeWidth="1"/>
      
      <text x="280" y="140" fontSize="9" fill="#A0A3AA">Stock Price</text>
      <text x="145" y="15" fontSize="9" fill="#A0A3AA">P/L</text>
      
      {/* Straddle V-shape */}
      <path d="M 0 40 L 140 170 L 280 40" fill="none" stroke="#8F6FC4" strokeWidth="3"/>
      
      {/* Strike marker */}
      <circle cx="140" cy="170" r="5" fill="#D2754C"/>
      <text x="140" y="190" textAnchor="middle" fontSize="8" fill="#D2754C">ATM Strike</text>
      
      {/* Max loss line */}
      <line x1="100" y1="170" x2="180" y2="170" stroke="#C7363B" strokeWidth="2" strokeDasharray="4"/>
      <text x="180" y="168" fontSize="8" fill="#C7363B">Max Loss</text>
      
      {/* Breakeven points */}
      <circle cx="70" cy="120" r="4" fill="#16A34A"/>
      <circle cx="210" cy="120" r="4" fill="#16A34A"/>
      <text x="70" y="110" textAnchor="middle" fontSize="7" fill="#16A34A">BE Low</text>
      <text x="210" y="110" textAnchor="middle" fontSize="7" fill="#16A34A">BE High</text>
    </g>
    
    {/* Strategy Details */}
    <g transform="translate(380, 80)">
      <rect x="0" y="0" width="280" height="180" fill="#2A2A2C" rx="10"/>
      
      <text x="140" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#8F6FC4">STRATEGY COMPONENTS</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="10" fill="white">Position:</text>
        <text x="0" y="18" fontSize="9" fill="#A0A3AA">• Long 1 ATM call</text>
        <text x="0" y="34" fontSize="9" fill="#A0A3AA">• Long 1 ATM put (same strike, same expiry)</text>
        
        <text x="0" y="60" fontSize="10" fill="white">Max Profit:</text>
        <text x="0" y="78" fontSize="9" fill="#A0A3AA">Unlimited in either direction</text>
        
        <text x="0" y="100" fontSize="10" fill="white">Max Loss:</text>
        <text x="0" y="118" fontSize="9" fill="#A0A3AA">Total premium paid (both options)</text>
        
        <text x="0" y="140" fontSize="10" fill="white">Breakevens:</text>
        <text x="0" y="158" fontSize="9" fill="#A0A3AA">Strike ± Total Premium Paid</text>
      </g>
    </g>
    
    {/* When to Use */}
    <g transform="translate(50, 285)">
      <rect x="0" y="0" width="600" height="80" fill="#8F6FC4" fillOpacity="0.1" rx="10" stroke="#8F6FC4" strokeWidth="1"/>
      <text x="300" y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill="#8F6FC4">IDEAL MARKET OUTLOOK</text>
      <text x="20" y="45" fontSize="9" fill="white">• Expect BIG move but unsure of direction</text>
      <text x="20" y="62" fontSize="9" fill="white">• Before earnings, FDA decisions, major events</text>
      <text x="320" y="45" fontSize="9" fill="white">• IV is LOW (options are cheap)</text>
      <text x="320" y="62" fontSize="9" fill="white">• AVOID if IV is already elevated (expensive)</text>
    </g>
  </svg>
);

// SVG: Long Strangle
const LongStrangleSVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="380" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Long Strangle</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A0A3AA">Buy OTM call + Buy OTM put = Cheaper directional-agnostic bet</text>
    
    {/* Payoff Diagram */}
    <g transform="translate(80, 80)">
      {/* Axes */}
      <line x1="0" y1="120" x2="280" y2="120" stroke="#555A63" strokeWidth="1"/>
      <line x1="140" y1="20" x2="140" y2="200" stroke="#555A63" strokeWidth="1"/>
      
      <text x="280" y="140" fontSize="9" fill="#A0A3AA">Stock Price</text>
      <text x="145" y="15" fontSize="9" fill="#A0A3AA">P/L</text>
      
      {/* Strangle shape - flatter bottom */}
      <path d="M 0 40 L 90 160 L 190 160 L 280 40" fill="none" stroke="#D2754C" strokeWidth="3"/>
      
      {/* Strike markers */}
      <circle cx="90" cy="160" r="4" fill="#C7363B"/>
      <circle cx="190" cy="160" r="4" fill="#16A34A"/>
      <text x="90" y="180" textAnchor="middle" fontSize="7" fill="#C7363B">Put Strike</text>
      <text x="190" y="180" textAnchor="middle" fontSize="7" fill="#16A34A">Call Strike</text>
      
      {/* Max loss zone */}
      <rect x="90" y="155" width="100" height="10" fill="#C7363B" fillOpacity="0.2"/>
      <text x="140" y="145" textAnchor="middle" fontSize="8" fill="#C7363B">Max Loss Zone</text>
    </g>
    
    {/* Strategy Details */}
    <g transform="translate(380, 80)">
      <rect x="0" y="0" width="280" height="180" fill="#2A2A2C" rx="10"/>
      
      <text x="140" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#D2754C">STRATEGY COMPONENTS</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="10" fill="white">Position:</text>
        <text x="0" y="18" fontSize="9" fill="#A0A3AA">• Long 1 OTM call (above stock price)</text>
        <text x="0" y="34" fontSize="9" fill="#A0A3AA">• Long 1 OTM put (below stock price)</text>
        
        <text x="0" y="60" fontSize="10" fill="white">Max Profit:</text>
        <text x="0" y="78" fontSize="9" fill="#A0A3AA">Unlimited in either direction</text>
        
        <text x="0" y="100" fontSize="10" fill="white">Max Loss:</text>
        <text x="0" y="118" fontSize="9" fill="#A0A3AA">Total premium paid (less than straddle)</text>
        
        <text x="0" y="140" fontSize="10" fill="white">Breakevens:</text>
        <text x="0" y="158" fontSize="9" fill="#A0A3AA">Call Strike + Premium / Put Strike - Premium</text>
      </g>
    </g>
    
    {/* Straddle vs Strangle */}
    <g transform="translate(50, 285)">
      <rect x="0" y="0" width="600" height="80" fill="#D2754C" fillOpacity="0.1" rx="10" stroke="#D2754C" strokeWidth="1"/>
      <text x="300" y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill="#D2754C">STRADDLE vs STRANGLE</text>
      <text x="20" y="45" fontSize="9" fill="white">Strangle is CHEAPER but requires a BIGGER move to profit</text>
      <text x="20" y="62" fontSize="9" fill="white">Straddle starts profiting sooner but costs more upfront</text>
      <text x="320" y="45" fontSize="9" fill="white">Strangle: Wider strikes = lower cost, higher breakevens</text>
      <text x="320" y="62" fontSize="9" fill="white">Both lose MAX if stock stays between strikes at expiry</text>
    </g>
  </svg>
);

// SVG: Strategy Selection
const StrategySelectionSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="320" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">Strategy Selection Matrix</text>
    
    {/* Matrix Grid */}
    <g transform="translate(80, 60)">
      {/* Headers */}
      <text x="135" y="0" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16A34A">BULLISH</text>
      <text x="270" y="0" textAnchor="middle" fontSize="10" fontWeight="600" fill="#A0A3AA">NEUTRAL</text>
      <text x="405" y="0" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">BEARISH</text>
      <text x="540" y="0" textAnchor="middle" fontSize="10" fontWeight="600" fill="#8F6FC4">BIG MOVE</text>
      
      {/* Row Labels */}
      <text x="-5" y="55" textAnchor="end" fontSize="9" fill="#A0A3AA">OWN</text>
      <text x="-5" y="70" textAnchor="end" fontSize="9" fill="#A0A3AA">STOCK</text>
      
      <text x="-5" y="130" textAnchor="end" fontSize="9" fill="#A0A3AA">NO</text>
      <text x="-5" y="145" textAnchor="end" fontSize="9" fill="#A0A3AA">STOCK</text>
      
      <text x="-5" y="205" textAnchor="end" fontSize="9" fill="#A0A3AA">INCOME</text>
      <text x="-5" y="220" textAnchor="end" fontSize="9" fill="#A0A3AA">FOCUS</text>
      
      {/* Grid Lines */}
      <line x1="60" y1="15" x2="540" y2="15" stroke="#373A41" strokeWidth="1"/>
      <line x1="60" y1="90" x2="540" y2="90" stroke="#373A41" strokeWidth="1"/>
      <line x1="60" y1="165" x2="540" y2="165" stroke="#373A41" strokeWidth="1"/>
      
      {/* Row 1: Own Stock */}
      <rect x="70" y="25" width="120" height="55" fill="#16A34A" fillOpacity="0.15" rx="6"/>
      <text x="130" y="50" textAnchor="middle" fontSize="9" fontWeight="500" fill="#16A34A">Hold Stock</text>
      <text x="130" y="65" textAnchor="middle" fontSize="8" fill="#A0A3AA">or Covered Call</text>
      
      <rect x="205" y="25" width="120" height="55" fill="#D2754C" fillOpacity="0.15" rx="6"/>
      <text x="265" y="50" textAnchor="middle" fontSize="9" fontWeight="500" fill="#D2754C">Covered Call</text>
      <text x="265" y="65" textAnchor="middle" fontSize="8" fill="#A0A3AA">Generate income</text>
      
      <rect x="340" y="25" width="120" height="55" fill="#5A77AA" fillOpacity="0.15" rx="6"/>
      <text x="400" y="50" textAnchor="middle" fontSize="9" fontWeight="500" fill="#5A77AA">Protective Put</text>
      <text x="400" y="65" textAnchor="middle" fontSize="8" fill="#A0A3AA">Hedge downside</text>
      
      <rect x="475" y="25" width="120" height="55" fill="#8F6FC4" fillOpacity="0.15" rx="6"/>
      <text x="535" y="50" textAnchor="middle" fontSize="9" fontWeight="500" fill="#8F6FC4">Collar</text>
      <text x="535" y="65" textAnchor="middle" fontSize="8" fill="#A0A3AA">CC + Prot Put</text>
      
      {/* Row 2: No Stock */}
      <rect x="70" y="100" width="120" height="55" fill="#16A34A" fillOpacity="0.15" rx="6"/>
      <text x="130" y="125" textAnchor="middle" fontSize="9" fontWeight="500" fill="#16A34A">Long Call</text>
      <text x="130" y="140" textAnchor="middle" fontSize="8" fill="#A0A3AA">Leveraged upside</text>
      
      <rect x="205" y="100" width="120" height="55" fill="#A0A3AA" fillOpacity="0.15" rx="6"/>
      <text x="265" y="125" textAnchor="middle" fontSize="9" fontWeight="500" fill="#A0A3AA">Calendar Spread</text>
      <text x="265" y="140" textAnchor="middle" fontSize="8" fill="#A0A3AA">Time decay play</text>
      
      <rect x="340" y="100" width="120" height="55" fill="#C7363B" fillOpacity="0.15" rx="6"/>
      <text x="400" y="125" textAnchor="middle" fontSize="9" fontWeight="500" fill="#C7363B">Long Put</text>
      <text x="400" y="140" textAnchor="middle" fontSize="8" fill="#A0A3AA">Leveraged down</text>
      
      <rect x="475" y="100" width="120" height="55" fill="#8F6FC4" fillOpacity="0.15" rx="6"/>
      <text x="535" y="125" textAnchor="middle" fontSize="9" fontWeight="500" fill="#8F6FC4">Straddle/Strangle</text>
      <text x="535" y="140" textAnchor="middle" fontSize="8" fill="#A0A3AA">Volatility play</text>
      
      {/* Row 3: Income */}
      <rect x="70" y="175" width="120" height="55" fill="#16A34A" fillOpacity="0.15" rx="6"/>
      <text x="130" y="200" textAnchor="middle" fontSize="9" fontWeight="500" fill="#16A34A">Bull Put Spread</text>
      <text x="130" y="215" textAnchor="middle" fontSize="8" fill="#A0A3AA">Credit spread</text>
      
      <rect x="205" y="175" width="120" height="55" fill="#D2754C" fillOpacity="0.15" rx="6"/>
      <text x="265" y="200" textAnchor="middle" fontSize="9" fontWeight="500" fill="#D2754C">Iron Condor</text>
      <text x="265" y="215" textAnchor="middle" fontSize="8" fill="#A0A3AA">Range-bound</text>
      
      <rect x="340" y="175" width="120" height="55" fill="#C7363B" fillOpacity="0.15" rx="6"/>
      <text x="400" y="200" textAnchor="middle" fontSize="9" fontWeight="500" fill="#C7363B">Bear Call Spread</text>
      <text x="400" y="215" textAnchor="middle" fontSize="8" fill="#A0A3AA">Credit spread</text>
      
      <rect x="475" y="175" width="120" height="55" fill="#8F6FC4" fillOpacity="0.15" rx="6"/>
      <text x="535" y="200" textAnchor="middle" fontSize="9" fontWeight="500" fill="#8F6FC4">Short Straddle</text>
      <text x="535" y="215" textAnchor="middle" fontSize="8" fill="#A0A3AA">(High risk!)</text>
    </g>
    
    {/* Legend */}
    <g transform="translate(80, 290)">
      <text x="0" y="0" fontSize="9" fill="#A0A3AA">Next Lesson: We&apos;ll cover spreads in detail - verticals, butterflies, iron condors, and more.</text>
    </g>
  </svg>
);

// Quiz Questions
const quizQuestions = [
  {
    id: 1,
    question: "A covered call strategy involves:",
    options: [
      "Buying a call option only",
      "Owning stock and selling a call option",
      "Selling a put option only",
      "Buying both a call and put"
    ],
    correct: 1,
    explanation: "A covered call combines owning 100 shares of stock with selling 1 call option. The stock 'covers' the obligation if the call is exercised. It generates income but caps upside potential."
  },
  {
    id: 2,
    question: "The maximum loss on a protective put is:",
    options: [
      "Unlimited",
      "The premium paid for the put",
      "(Stock price - Strike price) + Premium paid",
      "Zero"
    ],
    correct: 2,
    explanation: "With a protective put, the maximum loss is the difference between where you bought the stock and the put strike, plus the premium paid. The put limits downside below the strike price."
  },
  {
    id: 3,
    question: "A long straddle profits when:",
    options: [
      "The stock stays flat",
      "The stock moves significantly in either direction",
      "Only when the stock rises",
      "Only when the stock falls"
    ],
    correct: 1,
    explanation: "A long straddle profits from large moves in either direction. You buy both an ATM call and put, so you win whether the stock goes up or down significantly - as long as it moves more than the total premium paid."
  },
  {
    id: 4,
    question: "Compared to a straddle, a strangle:",
    options: [
      "Costs more but profits faster",
      "Costs less but requires a bigger move to profit",
      "Has unlimited risk",
      "Only profits if stock rises"
    ],
    correct: 1,
    explanation: "A strangle uses OTM options instead of ATM, making it cheaper than a straddle. However, because the strikes are further from the current price, the stock needs to move more before the position becomes profitable."
  }
];

const FOLesson9 = () => {
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
    <StudyShell module="FOlesson" lessonNumber={9}>
      
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
              Lesson 9 of 12
            </span>
            <span className="flex items-center gap-1 text-gray-500  text-sm">
              <Icons.Clock className="w-4 h-4" />
              28 min read
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 tracking-[-0.025em]">
            Basic Option Strategies
          </h1>
          <p className="text-lg text-gray-600 ">
            Covered calls, protective puts, straddles, and strangles.
          </p>
        </div>

        {/* Learning Objectives */}
        <div className="rounded-2xl p-6 mb-10 text-white bg-brand-fill">
          <div className="flex items-center gap-3 mb-4">
            <Icons.Target className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Learning Objectives</h2>
          </div>
          <ul className="space-y-2">
            {[
              "Master the covered call for income generation",
              "Learn protective puts for portfolio insurance",
              "Understand straddles and strangles for volatility plays",
              "Build a framework for strategy selection"
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
          
          {/* Section 1: Covered Call */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand/20 bg-brand-fill">
                  <Icons.TrendingUp className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">Covered Call</h2>
                  <p className="text-sm text-gray-500 ">The most popular option strategy</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                The covered call is often the first strategy investors learn. You own stock and sell call 
                options against it to generate income. It&apos;s considered conservative because the stock 
                &quot;covers&quot; your obligation if assigned.
              </p>

              <CoveredCallSVG />

              <div className="mt-6 bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                <div className="flex items-start gap-3">
                  <Icons.Lightbulb className="w-6 h-6 text-brand flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-brand  mb-1">Pro Tip: Strike Selection</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      Sell calls at a strike where you&apos;d be happy selling the stock. If assigned, you keep 
                      the premium AND get the strike price for your shares. Many investors sell 30-45 DTE, 
                      one strike OTM to balance premium collected vs probability of assignment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Protective Put */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 bg-brand-fill">
                  <Icons.Shield className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">Protective Put</h2>
                  <p className="text-sm text-gray-500 ">Portfolio insurance for stock holders</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Think of a protective put as insurance for your stock position. You pay a premium (the put cost) 
                to guarantee you can sell at the strike price no matter how far the stock falls.
              </p>

              <ProtectivePutSVG />

              <div className="mt-6 bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                <h4 className="font-bold text-blue-800  mb-2">When Insurance Makes Sense</h4>
                <ul className="text-gray-700  text-sm space-y-1">
                  <li>• Large unrealized gains you want to protect for tax reasons</li>
                  <li>• Ahead of known risk events (earnings, regulatory decisions)</li>
                  <li>• Concentrated stock positions you can&apos;t or won&apos;t sell</li>
                  <li>• When IV is relatively low (cheaper insurance)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Long Straddle */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20 bg-brand-fill">
                  <Icons.Maximize className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">Long Straddle</h2>
                  <p className="text-sm text-gray-500 ">Profit from big moves, either direction</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                The straddle is a volatility strategy. You buy both an ATM call and ATM put, betting 
                that the stock will make a big move. Direction doesn&apos;t matter - you profit from movement.
              </p>

              <LongStraddleSVG />

              <div className="mt-6 bg-red-50  rounded-xl p-5 border border-red-200 ">
                <div className="flex items-start gap-3">
                  <Icons.AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-800  mb-1">The Straddle Trap</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      Before earnings, IV is elevated, making straddles expensive. Even if the stock moves 
                      big, IV crush can wipe out your gains. Calculate the &quot;expected move&quot; priced into 
                      options and ensure you&apos;re getting a good deal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Long Strangle */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20 bg-brand-fill">
                  <Icons.Activity className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">Long Strangle</h2>
                  <p className="text-sm text-gray-500 ">Cheaper alternative to the straddle</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                The strangle is similar to the straddle but uses OTM options instead of ATM. This makes 
                it cheaper but requires a bigger move to profit.
              </p>

              <LongStrangleSVG />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50  rounded-xl p-5 border border-purple-200 ">
                  <h4 className="font-bold text-purple-800  mb-2">Choose Straddle When:</h4>
                  <ul className="text-gray-700  text-sm space-y-1">
                    <li>• You expect a moderate-to-big move</li>
                    <li>• IV is relatively low</li>
                    <li>• You want lower breakevens</li>
                  </ul>
                </div>
                <div className="bg-orange-50  rounded-xl p-5 border border-orange-200 ">
                  <h4 className="font-bold text-orange-800  mb-2">Choose Strangle When:</h4>
                  <ul className="text-gray-700  text-sm space-y-1">
                    <li>• You expect a very big move</li>
                    <li>• You want lower capital at risk</li>
                    <li>• IV is elevated (reduce vega)</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Strategy Selection */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20 bg-brand-fill">
                  <Icons.Target className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">Strategy Selection Framework</h2>
                  <p className="text-sm text-gray-500 ">Match your strategy to your outlook</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Choosing the right strategy depends on your market outlook (direction), volatility expectation, 
                whether you own stock, and whether you want income or growth.
              </p>

              <StrategySelectionSVG />
            </div>
          </section>

          {/* Key Takeaways */}
          <section>
            <div className="rounded-2xl p-8 text-white bg-brand-fill">
              <h2 className="text-2xl font-bold mb-6 tracking-[-0.025em]">Key Takeaways</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Covered call: Own stock + sell call = income with capped upside",
                  "Protective put: Own stock + buy put = insurance with unlimited upside",
                  "Long straddle: Buy ATM call + put = profit from big moves either way",
                  "Long strangle: Buy OTM call + put = cheaper but needs bigger move",
                  "Match strategy to your outlook: direction + volatility expectation",
                  "Always consider IV levels before buying options (avoid IV crush)"
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
              <h2 className="text-2xl font-bold text-gray-900  mb-6 tracking-[-0.025em]">Knowledge Check</h2>
              
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
                                  ? 'border-brand bg-brand-soft '
                                  : 'border-red-500 bg-red-50 '
                                : 'border-orange-500 bg-orange-50 '
                              : showResults && idx === q.correct
                                ? 'border-brand bg-brand-soft '
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
                          ? 'bg-brand-soft  text-brand '
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
                  className="mt-6 w-full py-3 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-brand-fill hover:bg-brand-hover"
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
                      ? "Excellent! You understand basic option strategies." 
                      : "Review the explanations to strengthen your understanding."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200 ">
            <button
              onClick={() => navigate('/learn/derivatives/lesson-8')}
              className="flex items-center gap-2 text-gray-600  hover:text-orange-600 transition-colors"
            >
              <Icons.ArrowLeft className="w-5 h-5" />
              <span>Previous: Volatility Analysis</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/derivatives/lesson-10')}
              className="flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all bg-brand-fill hover:bg-brand-hover"
            >
              <span>Next: Advanced Spreads</span>
              <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </StudyShell>
  );
};

export default FOLesson9;
