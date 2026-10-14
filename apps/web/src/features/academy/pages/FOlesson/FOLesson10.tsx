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
  Layers: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  Minimize: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 14h6m0 0v6m0-6L3 21M20 10h-6m0 0V4m0 6l7-7"/>
    </svg>
  ),
  Box: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  Calendar: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
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
  )
};

// SVG: Vertical Spreads
const VerticalSpreadsSVG = () => (
  <svg viewBox="0 0 700 480" className="w-full h-auto">
    <defs>
      <linearGradient id="vsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#151517"/>
        <stop offset="100%" stopColor="#232327"/>
      </linearGradient>
    </defs>
    
    <rect x="0" y="0" width="700" height="480" fill="url(#vsGrad)" rx="16"/>
    
    <text x="350" y="30" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Vertical Spreads</text>
    <text x="350" y="50" textAnchor="middle" fontSize="11" fill="#A3A1A6">Same expiration, different strikes</text>
    
    {/* Bull Call Spread */}
    <g transform="translate(50, 70)">
      <text x="135" y="0" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1FA978">Bull Call Spread (Debit)</text>
      
      {/* Payoff Diagram */}
      <g transform="translate(0, 20)">
        <line x1="0" y1="80" x2="270" y2="80" stroke="#5A5A62" strokeWidth="1"/>
        <line x1="135" y1="10" x2="135" y2="140" stroke="#5A5A62" strokeWidth="1"/>
        
        {/* Payoff line */}
        <path d="M 0 100 L 90 100 L 90 60 L 180 60 L 180 60 L 270 60" fill="none" stroke="#1FA978" strokeWidth="3"/>
        
        {/* Strike markers */}
        <circle cx="90" cy="100" r="4" fill="#1FA978"/>
        <circle cx="180" cy="60" r="4" fill="#C7363B"/>
        <text x="90" y="120" textAnchor="middle" fontSize="8" fill="#1FA978">Buy Call</text>
        <text x="180" y="50" textAnchor="middle" fontSize="8" fill="#C7363B">Sell Call</text>
        
        <text x="40" y="98" fontSize="7" fill="#C7363B">Max Loss</text>
        <text x="230" y="58" fontSize="7" fill="#1FA978">Max Profit</text>
      </g>
      
      {/* Details */}
      <g transform="translate(10, 150)">
        <text x="0" y="0" fontSize="9" fill="white">Buy lower strike call</text>
        <text x="0" y="14" fontSize="9" fill="white">Sell higher strike call</text>
        <text x="0" y="35" fontSize="9" fill="#A3A1A6">Max Profit: Width - Premium</text>
        <text x="0" y="49" fontSize="9" fill="#A3A1A6">Max Loss: Premium paid</text>
        <text x="0" y="63" fontSize="9" fill="#A3A1A6">Outlook: Moderately bullish</text>
      </g>
    </g>
    
    {/* Bear Put Spread */}
    <g transform="translate(380, 70)">
      <text x="135" y="0" textAnchor="middle" fontSize="14" fontWeight="600" fill="#C7363B">Bear Put Spread (Debit)</text>
      
      {/* Payoff Diagram */}
      <g transform="translate(0, 20)">
        <line x1="0" y1="80" x2="270" y2="80" stroke="#5A5A62" strokeWidth="1"/>
        <line x1="135" y1="10" x2="135" y2="140" stroke="#5A5A62" strokeWidth="1"/>
        
        {/* Payoff line */}
        <path d="M 0 60 L 90 60 L 90 60 L 180 100 L 270 100" fill="none" stroke="#C7363B" strokeWidth="3"/>
        
        {/* Strike markers */}
        <circle cx="90" cy="60" r="4" fill="#1FA978"/>
        <circle cx="180" cy="100" r="4" fill="#C7363B"/>
        <text x="90" y="50" textAnchor="middle" fontSize="8" fill="#1FA978">Buy Put</text>
        <text x="180" y="120" textAnchor="middle" fontSize="8" fill="#C7363B">Sell Put</text>
        
        <text x="40" y="58" fontSize="7" fill="#1FA978">Max Profit</text>
        <text x="230" y="98" fontSize="7" fill="#C7363B">Max Loss</text>
      </g>
      
      {/* Details */}
      <g transform="translate(10, 150)">
        <text x="0" y="0" fontSize="9" fill="white">Buy higher strike put</text>
        <text x="0" y="14" fontSize="9" fill="white">Sell lower strike put</text>
        <text x="0" y="35" fontSize="9" fill="#A3A1A6">Max Profit: Width - Premium</text>
        <text x="0" y="49" fontSize="9" fill="#A3A1A6">Max Loss: Premium paid</text>
        <text x="0" y="63" fontSize="9" fill="#A3A1A6">Outlook: Moderately bearish</text>
      </g>
    </g>
    
    {/* Credit Spreads Row */}
    <g transform="translate(50, 310)">
      <text x="135" y="0" textAnchor="middle" fontSize="14" fontWeight="600" fill="#5A77AA">Bull Put Spread (Credit)</text>
      
      <g transform="translate(10, 20)">
        <text x="0" y="0" fontSize="9" fill="white">Sell higher strike put</text>
        <text x="0" y="14" fontSize="9" fill="white">Buy lower strike put</text>
        <text x="0" y="35" fontSize="9" fill="#A3A1A6">Max Profit: Premium received</text>
        <text x="0" y="49" fontSize="9" fill="#A3A1A6">Max Loss: Width - Premium</text>
        <text x="0" y="63" fontSize="9" fill="#A3A1A6">Profits if stock stays above short strike</text>
      </g>
    </g>
    
    <g transform="translate(380, 310)">
      <text x="135" y="0" textAnchor="middle" fontSize="14" fontWeight="600" fill="#D2754C">Bear Call Spread (Credit)</text>
      
      <g transform="translate(10, 20)">
        <text x="0" y="0" fontSize="9" fill="white">Sell lower strike call</text>
        <text x="0" y="14" fontSize="9" fill="white">Buy higher strike call</text>
        <text x="0" y="35" fontSize="9" fill="#A3A1A6">Max Profit: Premium received</text>
        <text x="0" y="49" fontSize="9" fill="#A3A1A6">Max Loss: Width - Premium</text>
        <text x="0" y="63" fontSize="9" fill="#A3A1A6">Profits if stock stays below short strike</text>
      </g>
    </g>
    
    {/* Key insight */}
    <g transform="translate(50, 440)">
      <rect x="0" y="0" width="600" height="30" fill="#A3A1A6" fillOpacity="0.1" rx="4"/>
      <text x="300" y="18" textAnchor="middle" fontSize="9" fill="#A3A1A6">
        Debit spreads pay premium for directional bet | Credit spreads collect premium betting stock stays away from short strike
      </text>
    </g>
  </svg>
);

// SVG: Butterfly Spread
const ButterflySVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="380" fill="#151517" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Butterfly Spread</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A3A1A6">Profit from pinning to a specific price with limited risk</text>
    
    {/* Payoff Diagram */}
    <g transform="translate(80, 80)">
      {/* Axes */}
      <line x1="0" y1="120" x2="280" y2="120" stroke="#5A5A62" strokeWidth="1"/>
      <line x1="140" y1="20" x2="140" y2="180" stroke="#5A5A62" strokeWidth="1"/>
      
      <text x="280" y="140" fontSize="9" fill="#A3A1A6">Stock Price</text>
      <text x="145" y="15" fontSize="9" fill="#A3A1A6">P/L</text>
      
      {/* Butterfly payoff - tent shape */}
      <path d="M 0 160 L 70 160 L 140 40 L 210 160 L 280 160" fill="none" stroke="#8F6FC4" strokeWidth="3"/>
      
      {/* Strike markers */}
      <circle cx="70" cy="160" r="5" fill="#1FA978"/>
      <circle cx="140" cy="40" r="5" fill="#D2754C"/>
      <circle cx="210" cy="160" r="5" fill="#1FA978"/>
      
      <text x="70" y="180" textAnchor="middle" fontSize="8" fill="#1FA978">Lower</text>
      <text x="140" y="30" textAnchor="middle" fontSize="8" fill="#D2754C">Middle (ATM)</text>
      <text x="210" y="180" textAnchor="middle" fontSize="8" fill="#1FA978">Upper</text>
      
      {/* Max profit/loss labels */}
      <line x1="140" y1="40" x2="160" y2="40" stroke="#1FA978" strokeWidth="1" strokeDasharray="3"/>
      <text x="180" y="43" fontSize="7" fill="#1FA978">Max Profit</text>
      
      <line x1="0" y1="160" x2="20" y2="160" stroke="#C7363B" strokeWidth="1" strokeDasharray="3"/>
      <text x="25" y="163" fontSize="7" fill="#C7363B">Max Loss</text>
    </g>
    
    {/* Strategy Details */}
    <g transform="translate(380, 80)">
      <rect x="0" y="0" width="280" height="180" fill="#232327" rx="10"/>
      
      <text x="140" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#8F6FC4">LONG CALL BUTTERFLY</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="10" fill="white">Construction:</text>
        <text x="0" y="18" fontSize="9" fill="#A3A1A6">• Buy 1 lower strike call</text>
        <text x="0" y="34" fontSize="9" fill="#A3A1A6">• Sell 2 middle strike calls</text>
        <text x="0" y="50" fontSize="9" fill="#A3A1A6">• Buy 1 upper strike call</text>
        
        <text x="0" y="75" fontSize="10" fill="white">P/L Profile:</text>
        <text x="0" y="93" fontSize="9" fill="#A3A1A6">Max Profit: Middle - Lower - Net Debit</text>
        <text x="0" y="109" fontSize="9" fill="#A3A1A6">Max Loss: Net debit paid</text>
        <text x="0" y="125" fontSize="9" fill="#A3A1A6">Breakevens: Lower + Debit / Upper - Debit</text>
      </g>
    </g>
    
    {/* When to Use */}
    <g transform="translate(50, 285)">
      <rect x="0" y="0" width="600" height="80" fill="#8F6FC4" fillOpacity="0.1" rx="10" stroke="#8F6FC4" strokeWidth="1"/>
      <text x="300" y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill="#8F6FC4">IDEAL SCENARIOS</text>
      <text x="20" y="45" fontSize="9" fill="white">• Expect stock to PIN at middle strike (neutral outlook)</text>
      <text x="20" y="62" fontSize="9" fill="white">• Low IV environment (wings are expensive when IV high)</text>
      <text x="320" y="45" fontSize="9" fill="white">• Expiration play - highest profit at expiry if at middle</text>
      <text x="320" y="62" fontSize="9" fill="white">• Risk/reward: Risk small amount, profit if correct</text>
    </g>
  </svg>
);

// SVG: Iron Condor
const IronCondorSVG = () => (
  <svg viewBox="0 0 700 400" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="400" fill="#151517" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Iron Condor</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A3A1A6">Profit from range-bound markets by collecting premium</text>
    
    {/* Payoff Diagram */}
    <g transform="translate(60, 80)">
      {/* Axes */}
      <line x1="0" y1="120" x2="330" y2="120" stroke="#5A5A62" strokeWidth="1"/>
      <line x1="165" y1="20" x2="165" y2="180" stroke="#5A5A62" strokeWidth="1"/>
      
      <text x="280" y="145" fontSize="9" fill="#A3A1A6">Stock Price</text>
      <text x="170" y="15" fontSize="9" fill="#A3A1A6">P/L</text>
      
      {/* Iron Condor payoff - flat top with wings down */}
      <path d="M 0 160 L 65 160 L 105 90 L 225 90 L 265 160 L 330 160" fill="none" stroke="#D2754C" strokeWidth="3"/>
      
      {/* Strike markers */}
      <circle cx="65" cy="160" r="4" fill="#1FA978"/>
      <circle cx="105" cy="90" r="4" fill="#C7363B"/>
      <circle cx="225" cy="90" r="4" fill="#C7363B"/>
      <circle cx="265" cy="160" r="4" fill="#1FA978"/>
      
      <text x="65" y="180" textAnchor="middle" fontSize="7" fill="#1FA978">Buy Put</text>
      <text x="105" y="105" textAnchor="middle" fontSize="7" fill="#C7363B">Sell Put</text>
      <text x="225" y="105" textAnchor="middle" fontSize="7" fill="#C7363B">Sell Call</text>
      <text x="265" y="180" textAnchor="middle" fontSize="7" fill="#1FA978">Buy Call</text>
      
      {/* Profit zone */}
      <rect x="105" y="85" width="120" height="10" fill="#1FA978" fillOpacity="0.3" rx="2"/>
      <text x="165" y="78" textAnchor="middle" fontSize="8" fill="#1FA978">MAX PROFIT ZONE</text>
    </g>
    
    {/* Strategy Details */}
    <g transform="translate(430, 80)">
      <rect x="0" y="0" width="230" height="180" fill="#232327" rx="10"/>
      
      <text x="115" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#D2754C">CONSTRUCTION</text>
      
      <g transform="translate(15, 45)">
        <text x="0" y="0" fontSize="9" fill="#C7363B">Short Strangle (inside):</text>
        <text x="0" y="16" fontSize="8" fill="#A3A1A6">• Sell OTM put</text>
        <text x="0" y="30" fontSize="8" fill="#A3A1A6">• Sell OTM call</text>
        
        <text x="0" y="55" fontSize="9" fill="#1FA978">Long Strangle (outside):</text>
        <text x="0" y="71" fontSize="8" fill="#A3A1A6">• Buy further OTM put</text>
        <text x="0" y="85" fontSize="8" fill="#A3A1A6">• Buy further OTM call</text>
        
        <text x="0" y="110" fontSize="9" fill="white">Result: Credit received</text>
        <text x="0" y="126" fontSize="8" fill="#A3A1A6">Keep credit if stock stays</text>
        <text x="0" y="140" fontSize="8" fill="#A3A1A6">between short strikes</text>
      </g>
    </g>
    
    {/* Example */}
    <g transform="translate(50, 290)">
      <rect x="0" y="0" width="600" height="95" fill="#D2754C" fillOpacity="0.1" rx="10" stroke="#D2754C" strokeWidth="1"/>
      <text x="300" y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill="#D2754C">EXAMPLE: Stock at $100</text>
      
      <g transform="translate(20, 35)">
        <text x="0" y="10" fontSize="9" fill="white">Buy $90 put @ $0.50 | Sell $95 put @ $1.50 | Sell $105 call @ $1.50 | Buy $110 call @ $0.50</text>
        <text x="0" y="30" fontSize="9" fill="#A3A1A6">Net Credit: $1.50 + $1.50 - $0.50 - $0.50 = $2.00 per share ($200 per contract)</text>
        <text x="0" y="50" fontSize="9" fill="#A3A1A6">Max Profit: $200 (keep full credit) if stock between $95-$105 at expiry</text>
        <text x="0" y="70" fontSize="9" fill="#A3A1A6">Max Loss: $300 (width $5 - credit $2 = $3 × 100) if stock below $90 or above $110</text>
      </g>
    </g>
  </svg>
);

// SVG: Calendar Spread
const CalendarSpreadSVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="380" fill="#151517" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Calendar Spread (Time Spread)</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A3A1A6">Same strike, different expirations - profit from time decay differential</text>
    
    {/* Visual Representation */}
    <g transform="translate(80, 90)">
      <rect x="0" y="0" width="260" height="160" fill="#232327" rx="10"/>
      
      {/* Timeline */}
      <line x1="30" y1="80" x2="230" y2="80" stroke="#5A5A62" strokeWidth="2"/>
      
      {/* Short term option */}
      <g transform="translate(80, 35)">
        <rect x="-50" y="0" width="100" height="35" fill="#C7363B" fillOpacity="0.2" rx="6" stroke="#C7363B" strokeWidth="1"/>
        <text x="0" y="15" textAnchor="middle" fontSize="9" fontWeight="500" fill="#C7363B">SELL</text>
        <text x="0" y="28" textAnchor="middle" fontSize="8" fill="#A3A1A6">Near-term</text>
      </g>
      
      {/* Long term option */}
      <g transform="translate(180, 35)">
        <rect x="-50" y="0" width="100" height="35" fill="#1FA978" fillOpacity="0.2" rx="6" stroke="#1FA978" strokeWidth="1"/>
        <text x="0" y="15" textAnchor="middle" fontSize="9" fontWeight="500" fill="#1FA978">BUY</text>
        <text x="0" y="28" textAnchor="middle" fontSize="8" fill="#A3A1A6">Far-term</text>
      </g>
      
      {/* Strike line */}
      <line x1="130" y1="20" x2="130" y2="140" stroke="#D2754C" strokeWidth="2" strokeDasharray="5"/>
      <text x="130" y="155" textAnchor="middle" fontSize="8" fill="#D2754C">Same Strike</text>
      
      {/* Time markers */}
      <circle cx="80" cy="80" r="6" fill="#C7363B"/>
      <circle cx="180" cy="80" r="6" fill="#1FA978"/>
      <text x="80" y="100" textAnchor="middle" fontSize="7" fill="#C7363B">30 DTE</text>
      <text x="180" y="100" textAnchor="middle" fontSize="7" fill="#1FA978">60 DTE</text>
      <text x="30" y="115" fontSize="7" fill="#A3A1A6">Today</text>
      <text x="200" y="115" fontSize="7" fill="#A3A1A6">Future</text>
    </g>
    
    {/* Strategy Details */}
    <g transform="translate(380, 90)">
      <rect x="0" y="0" width="270" height="160" fill="#232327" rx="10"/>
      
      <text x="135" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#5A77AA">HOW IT WORKS</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="9" fill="white">Key Insight:</text>
        <text x="0" y="16" fontSize="8" fill="#A3A1A6">Near-term options decay FASTER than</text>
        <text x="0" y="30" fontSize="8" fill="#A3A1A6">far-term options (theta acceleration)</text>
        
        <text x="0" y="55" fontSize="9" fill="white">Profit Mechanism:</text>
        <text x="0" y="71" fontSize="8" fill="#A3A1A6">Short option loses value faster</text>
        <text x="0" y="85" fontSize="8" fill="#A3A1A6">Long option retains value longer</text>
        <text x="0" y="99" fontSize="8" fill="#A3A1A6">Spread value increases if stock stays near strike</text>
      </g>
    </g>
    
    {/* Profit Zone and Risks */}
    <g transform="translate(50, 270)">
      <rect x="0" y="0" width="290" height="95" fill="#1FA978" fillOpacity="0.1" rx="10" stroke="#1FA978" strokeWidth="1"/>
      <text x="145" y="20" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1FA978">PROFIT DRIVERS</text>
      <text x="15" y="42" fontSize="9" fill="white">• Stock stays near strike price</text>
      <text x="15" y="58" fontSize="9" fill="white">• Time passes (theta works for you)</text>
      <text x="15" y="74" fontSize="9" fill="white">• IV increases (vega positive)</text>
    </g>
    
    <g transform="translate(360, 270)">
      <rect x="0" y="0" width="290" height="95" fill="#C7363B" fillOpacity="0.1" rx="10" stroke="#C7363B" strokeWidth="1"/>
      <text x="145" y="20" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">RISK FACTORS</text>
      <text x="15" y="42" fontSize="9" fill="white">• Stock moves far from strike</text>
      <text x="15" y="58" fontSize="9" fill="white">• IV decreases (hurts long option)</text>
      <text x="15" y="74" fontSize="9" fill="white">• Early assignment risk on short leg</text>
    </g>
  </svg>
);

// SVG: Spread Comparison
const SpreadComparisonSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="340" fill="#151517" rx="16"/>
    
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">Spread Strategy Comparison</text>
    
    {/* Table Header */}
    <g transform="translate(50, 55)">
      <rect x="0" y="0" width="600" height="30" fill="#232327" rx="6"/>
      <text x="75" y="20" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">Strategy</text>
      <text x="190" y="20" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">Outlook</text>
      <text x="310" y="20" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">Max Profit</text>
      <text x="430" y="20" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">Max Loss</text>
      <text x="545" y="20" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">IV Impact</text>
    </g>
    
    {/* Table Rows */}
    <g transform="translate(50, 95)">
      {[
        { name: "Bull Call Spread", outlook: "Moderate Bull", maxProfit: "Width - Debit", maxLoss: "Debit Paid", iv: "Long Vega", color: "#1FA978" },
        { name: "Bear Put Spread", outlook: "Moderate Bear", maxProfit: "Width - Debit", maxLoss: "Debit Paid", iv: "Long Vega", color: "#C7363B" },
        { name: "Bull Put Spread", outlook: "Neutral-Bull", maxProfit: "Credit Received", maxLoss: "Width - Credit", iv: "Short Vega", color: "#5A77AA" },
        { name: "Bear Call Spread", outlook: "Neutral-Bear", maxProfit: "Credit Received", maxLoss: "Width - Credit", iv: "Short Vega", color: "#D2754C" },
        { name: "Iron Condor", outlook: "Neutral/Range", maxProfit: "Credit Received", maxLoss: "Width - Credit", iv: "Short Vega", color: "#8F6FC4" },
        { name: "Butterfly", outlook: "Pin to Strike", maxProfit: "Width - Debit", maxLoss: "Debit Paid", iv: "Neutral", color: "#8F6FC4" },
        { name: "Calendar", outlook: "Neutral/Near Strike", maxProfit: "Varies", maxLoss: "Debit Paid", iv: "Long Vega", color: "#33A0AE" }
      ].map((row, i) => (
        <g key={i} transform={`translate(0, ${i * 32})`}>
          <rect x="0" y="0" width="600" height="28" fill={i % 2 === 0 ? "#232327" : "#151517"} rx="4"/>
          <circle cx="15" cy="14" r="6" fill={row.color}/>
          <text x="75" y="18" textAnchor="middle" fontSize="9" fill="white">{row.name}</text>
          <text x="190" y="18" textAnchor="middle" fontSize="9" fill="#A3A1A6">{row.outlook}</text>
          <text x="310" y="18" textAnchor="middle" fontSize="9" fill="#1FA978">{row.maxProfit}</text>
          <text x="430" y="18" textAnchor="middle" fontSize="9" fill="#C7363B">{row.maxLoss}</text>
          <text x="545" y="18" textAnchor="middle" fontSize="9" fill="#A3A1A6">{row.iv}</text>
        </g>
      ))}
    </g>
    
    {/* Key Notes */}
    <g transform="translate(50, 325)">
      <text x="0" y="0" fontSize="8" fill="#A3A1A6">Width = Difference between strikes | Debit = Premium paid to enter | Credit = Premium received to enter</text>
    </g>
  </svg>
);

// Quiz Questions
const quizQuestions = [
  {
    id: 1,
    question: "A bull call spread involves:",
    options: [
      "Buying and selling calls at different expirations",
      "Buying a lower strike call and selling a higher strike call",
      "Selling a lower strike call and buying a higher strike call",
      "Buying two calls at the same strike"
    ],
    correct: 1,
    explanation: "A bull call spread buys a lower strike call (more expensive) and sells a higher strike call (cheaper) at the same expiration. You pay a net debit and profit if the stock rises to or above the short strike."
  },
  {
    id: 2,
    question: "The maximum profit on an iron condor is:",
    options: [
      "Unlimited",
      "The width of the spreads",
      "The net credit received",
      "Width minus credit received"
    ],
    correct: 2,
    explanation: "The maximum profit on an iron condor is the net credit received when opening the position. You keep the full credit if the stock price stays between the two short strikes at expiration."
  },
  {
    id: 3,
    question: "A calendar spread profits most when:",
    options: [
      "The stock makes a large move in either direction",
      "The stock stays near the strike price",
      "Implied volatility decreases significantly",
      "The stock drops sharply below the strike"
    ],
    correct: 1,
    explanation: "A calendar spread profits when the stock stays near the strike price. The near-term short option decays faster than the far-term long option, increasing the spread value. Large moves in either direction hurt the position."
  },
  {
    id: 4,
    question: "A butterfly spread reaches maximum profit when:",
    options: [
      "The stock moves significantly in either direction",
      "The stock price equals the middle strike at expiration",
      "Implied volatility increases",
      "The stock stays below the lowest strike"
    ],
    correct: 1,
    explanation: "A butterfly spread reaches maximum profit when the stock price equals the middle strike at expiration. This is where the long options at the wings are worthless and the two short middle strike options are also at-the-money (maximum extrinsic value captured)."
  }
];

const FOLesson10 = () => {
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
              Lesson 10 of 12
            </span>
            <span className="flex items-center gap-1 text-gray-500  text-sm">
              <Icons.Clock className="w-4 h-4" />
              30 min read
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-normal text-gray-900  mb-4 tracking-[-0.015em]">
            Advanced Spreads
          </h1>
          <p className="text-lg text-gray-600 ">
            Vertical spreads, butterflies, iron condors, and calendar spreads.
          </p>
        </div>

        {/* Learning Objectives */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 mb-10 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Icons.Target className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Learning Objectives</h2>
          </div>
          <ul className="space-y-2">
            {[
              "Master vertical spreads for directional trades with defined risk",
              "Learn butterfly spreads for pinning strategies",
              "Understand iron condors for range-bound income",
              "Explore calendar spreads for time decay plays"
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
          
          {/* Section 1: Vertical Spreads */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20">
                  <Icons.Layers className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Vertical Spreads</h2>
                  <p className="text-sm text-gray-500 ">The foundation of spread trading</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Vertical spreads combine buying and selling options at different strikes but the same expiration. 
                They offer defined risk and defined reward, making them popular for directional trading 
                with controlled capital.
              </p>

              <VerticalSpreadsSVG />

              <div className="mt-6 bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                <div className="flex items-start gap-3">
                  <Icons.Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-blue-800  mb-1">Debit vs Credit Spreads</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      Debit spreads pay to enter and need the stock to move to profit. Credit spreads collect 
                      premium and profit if the stock stays away from the short strike. Choose based on your 
                      conviction level and preferred risk/reward profile.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Butterfly Spread */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                  <Icons.Minimize className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Butterfly Spread</h2>
                  <p className="text-sm text-gray-500 ">Profit from pinning to a specific price</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                A butterfly spread is a neutral strategy that profits when the underlying stays near a 
                specific price (the middle strike). It combines two vertical spreads sharing a middle strike.
              </p>

              <ButterflySVG />

              <div className="mt-6 bg-purple-50  rounded-xl p-5 border border-purple-200 ">
                <h4 className="font-bold text-purple-800  mb-2">Butterfly Variations</h4>
                <ul className="text-gray-700  text-sm space-y-1">
                  <li>• Long Call Butterfly: Buy 1 low, sell 2 middle, buy 1 high (calls)</li>
                  <li>• Long Put Butterfly: Same structure with puts</li>
                  <li>• Iron Butterfly: Sell ATM straddle, buy OTM strangle (credit entry)</li>
                  <li>• Broken Wing Butterfly: Unequal wing widths for skewed risk/reward</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Iron Condor */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                  <Icons.Box className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Iron Condor</h2>
                  <p className="text-sm text-gray-500 ">The premium income strategy for neutral markets</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                The iron condor is a credit spread strategy that profits when the underlying stays within 
                a range. It combines a bull put spread below the current price with a bear call spread above it.
              </p>

              <IronCondorSVG />

              <div className="mt-6 bg-red-50  rounded-xl p-5 border border-red-200 ">
                <div className="flex items-start gap-3">
                  <Icons.AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-800  mb-1">Iron Condor Risk Management</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      Iron condors have limited profit but the loss can be multiple times the credit received. 
                      Many traders close at 50% of max profit or manage when one side is tested. Never let 
                      a winning iron condor turn into a max loss position.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Calendar Spread */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                  <Icons.Calendar className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Calendar Spread</h2>
                  <p className="text-sm text-gray-500 ">Exploiting time decay differentials</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                A calendar spread (also called a time spread or horizontal spread) involves options at 
                the same strike but different expirations. It profits from the faster decay of near-term 
                options compared to far-term options.
              </p>

              <CalendarSpreadSVG />

              <div className="mt-6 bg-cyan-50  rounded-xl p-5 border border-cyan-200 ">
                <h4 className="font-bold text-cyan-800  mb-2">Calendar Spread Tips</h4>
                <ul className="text-gray-700  text-sm space-y-1">
                  <li>• Best entered when IV is low (IV increase helps the long leg)</li>
                  <li>• Choose strike at expected stock price at near-term expiration</li>
                  <li>• Close before near-term expiration to avoid assignment risk</li>
                  <li>• Can roll the short leg to next month after it expires</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5: Strategy Comparison */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/20">
                  <Icons.Target className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.015em]">Strategy Comparison</h2>
                  <p className="text-sm text-gray-500 ">Side-by-side analysis of spread strategies</p>
                </div>
              </div>

              <SpreadComparisonSVG />
            </div>
          </section>

          {/* Key Takeaways */}
          <section>
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-semibold mb-6 tracking-[-0.015em]">Key Takeaways</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Vertical spreads: Defined risk directional trades with same expiration",
                  "Debit spreads pay to enter; credit spreads collect premium upfront",
                  "Butterfly: Maximum profit when stock pins to middle strike at expiry",
                  "Iron condor: Profit from range-bound markets by selling premium",
                  "Calendar spreads exploit faster decay of near-term vs far-term options",
                  "Always know max profit, max loss, and breakevens before entering"
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
              <h2 className="text-2xl font-semibold text-gray-900  mb-6 tracking-[-0.015em]">Knowledge Check</h2>
              
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
                  className="mt-6 w-full py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-red-700 transition-all"
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
                      ? "Excellent! You understand advanced spread strategies." 
                      : "Review the explanations to strengthen your understanding."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200 ">
            <button
              onClick={() => navigate('/learn/derivatives/lesson-9')}
              className="flex items-center gap-2 text-gray-600  hover:text-orange-600 transition-colors"
            >
              <Icons.ArrowLeft className="w-5 h-5" />
              <span>Previous: Basic Option Strategies</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/derivatives/lesson-11')}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all"
            >
              <span>Next: Hedging Techniques</span>
              <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FOLesson10;
