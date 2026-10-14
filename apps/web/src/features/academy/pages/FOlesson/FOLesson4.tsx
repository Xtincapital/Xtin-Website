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
  Phone: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  ArrowUp: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
    </svg>
  ),
  ArrowDown: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
    </svg>
  ),
  DollarSign: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  Layers: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  )
};

// SVG: Call vs Put Options
const CallVsPutSVG = () => (
  <svg viewBox="0 0 700 420" className="w-full h-auto">
    <defs>
      <linearGradient id="optGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1F1F1F"/>
        <stop offset="100%" stopColor="#2A2A2C"/>
      </linearGradient>
    </defs>
    
    <rect x="0" y="0" width="700" height="420" fill="url(#optGrad)" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Call Options vs Put Options</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A0A3AA">The two fundamental types of options</text>
    
    {/* Call Option */}
    <g transform="translate(30, 80)">
      <rect x="0" y="0" width="310" height="300" fill="#12805A" fillOpacity="0.1" rx="12" stroke="#12805A" strokeWidth="2"/>
      
      <g transform="translate(155, 30)">
        <circle r="22" fill="#12805A" fillOpacity="0.3"/>
        <path d="M0,-10 L0,10 M-7,3 L0,-4 L7,3" stroke="#12805A" strokeWidth="3" fill="none"/>
      </g>
      
      <text x="155" y="70" textAnchor="middle" fontSize="18" fontWeight="700" fill="#12805A">CALL OPTION</text>
      <text x="155" y="90" textAnchor="middle" fontSize="10" fill="#A0A3AA">Right to BUY at strike price</text>
      
      <g transform="translate(20, 110)">
        <rect x="0" y="0" width="270" height="170" fill="#1F1F1F" rx="10"/>
        
        <text x="135" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">Call Buyer (Long Call)</text>
        <text x="135" y="45" textAnchor="middle" fontSize="9" fill="#12805A">Pays premium upfront</text>
        <text x="135" y="62" textAnchor="middle" fontSize="9" fill="#A0A3AA">Profits when price rises above strike</text>
        <text x="135" y="79" textAnchor="middle" fontSize="9" fill="#A0A3AA">Max loss = Premium paid</text>
        <text x="135" y="96" textAnchor="middle" fontSize="9" fill="#12805A">Max profit = Unlimited</text>
        
        <line x1="20" y1="108" x2="250" y2="108" stroke="#373A41" strokeWidth="1"/>
        
        <text x="135" y="125" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">Call Seller (Short Call)</text>
        <text x="135" y="145" textAnchor="middle" fontSize="9" fill="#D2754C">Receives premium upfront</text>
        <text x="135" y="162" textAnchor="middle" fontSize="9" fill="#A0A3AA">Obligated to sell if exercised</text>
      </g>
    </g>
    
    {/* Put Option */}
    <g transform="translate(360, 80)">
      <rect x="0" y="0" width="310" height="300" fill="#C7363B" fillOpacity="0.1" rx="12" stroke="#C7363B" strokeWidth="2"/>
      
      <g transform="translate(155, 30)">
        <circle r="22" fill="#C7363B" fillOpacity="0.3"/>
        <path d="M0,-10 L0,10 M-7,-3 L0,4 L7,-3" stroke="#C7363B" strokeWidth="3" fill="none"/>
      </g>
      
      <text x="155" y="70" textAnchor="middle" fontSize="18" fontWeight="700" fill="#C7363B">PUT OPTION</text>
      <text x="155" y="90" textAnchor="middle" fontSize="10" fill="#A0A3AA">Right to SELL at strike price</text>
      
      <g transform="translate(20, 110)">
        <rect x="0" y="0" width="270" height="170" fill="#1F1F1F" rx="10"/>
        
        <text x="135" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">Put Buyer (Long Put)</text>
        <text x="135" y="45" textAnchor="middle" fontSize="9" fill="#C7363B">Pays premium upfront</text>
        <text x="135" y="62" textAnchor="middle" fontSize="9" fill="#A0A3AA">Profits when price falls below strike</text>
        <text x="135" y="79" textAnchor="middle" fontSize="9" fill="#A0A3AA">Max loss = Premium paid</text>
        <text x="135" y="96" textAnchor="middle" fontSize="9" fill="#C7363B">Max profit = Strike - Premium</text>
        
        <line x1="20" y1="108" x2="250" y2="108" stroke="#373A41" strokeWidth="1"/>
        
        <text x="135" y="125" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">Put Seller (Short Put)</text>
        <text x="135" y="145" textAnchor="middle" fontSize="9" fill="#D2754C">Receives premium upfront</text>
        <text x="135" y="162" textAnchor="middle" fontSize="9" fill="#A0A3AA">Obligated to buy if exercised</text>
      </g>
    </g>
    
    {/* Key Insight */}
    <g transform="translate(50, 390)">
      <rect x="0" y="0" width="600" height="25" fill="#2A2A2C" rx="6"/>
      <text x="300" y="17" textAnchor="middle" fontSize="9" fill="#D2754C">Options give buyers flexibility (right, not obligation) in exchange for premium. Sellers take on obligation for premium income.</text>
    </g>
  </svg>
);

// SVG: Option Payoff Diagrams
const PayoffDiagramsSVG = () => (
  <svg viewBox="0 0 700 430" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="430" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="30" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Option Payoff Profiles</text>
    
    {/* Long Call Payoff */}
    <g transform="translate(40, 80)">
      <rect x="0" y="0" width="300" height="160" fill="#2A2A2C" rx="10"/>
      <text x="150" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#12805A">Long Call Option</text>
      
      <g transform="translate(30, 45)">
        {/* Axes */}
        <line x1="0" y1="50" x2="220" y2="50" stroke="#555A63" strokeWidth="1"/>
        <line x1="110" y1="0" x2="110" y2="100" stroke="#555A63" strokeWidth="1"/>
        <text x="180" y="100" fontSize="8" fill="#A0A3AA">Stock Price</text>
        <text x="115" y="10" fontSize="8" fill="#A0A3AA">P/L</text>
        
        {/* Strike marker */}
        <line x1="110" y1="45" x2="110" y2="55" stroke="#D2754C" strokeWidth="2"/>
        <text x="110" y="115" textAnchor="middle" fontSize="8" fill="#D2754C">Strike</text>
        
        {/* Payoff line */}
        <path d="M 15 65 L 110 65 L 180 15" stroke="#12805A" strokeWidth="3" fill="none"/>
        
        {/* Premium line (horizontal dashed) */}
        <line x1="15" y1="65" x2="220" y2="65" stroke="#A0A3AA" strokeWidth="1" strokeDasharray="3,3"/>
        <text x="5" y="75" fontSize="7" fill="#C7363B">Max Loss: Premium</text>
        
        {/* Unlimited profit label */}
        <text x="175" y="20" fontSize="7" fill="#12805A">Unlimited Profit</text>
      </g>
    </g>
    
    {/* Long Put Payoff */}
    <g transform="translate(360, 80)">
      <rect x="0" y="0" width="300" height="160" fill="#2A2A2C" rx="10"/>
      <text x="150" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">Long Put Option</text>
      
      <g transform="translate(30, 45)">
        {/* Axes */}
        <line x1="0" y1="50" x2="220" y2="50" stroke="#555A63" strokeWidth="1"/>
        <line x1="110" y1="0" x2="110" y2="100" stroke="#555A63" strokeWidth="1"/>
        <text x="180" y="100" fontSize="8" fill="#A0A3AA">Stock Price</text>
        <text x="115" y="10" fontSize="8" fill="#A0A3AA">P/L</text>
        
        {/* Strike marker */}
        <line x1="110" y1="45" x2="110" y2="55" stroke="#D2754C" strokeWidth="2"/>
        <text x="110" y="115" textAnchor="middle" fontSize="8" fill="#D2754C">Strike</text>
        
        {/* Payoff line */}
        <path d="M 40 15 L 110 65 L 200 65" stroke="#C7363B" strokeWidth="3" fill="none"/>
        
        {/* Premium line */}
        <line x1="0" y1="65" x2="220" y2="65" stroke="#A0A3AA" strokeWidth="1" strokeDasharray="3,3"/>
        <text x="160" y="75" fontSize="7" fill="#C7363B">Max Loss: Premium</text>
        
        {/* Profit when falls label - positioned inside chart area */}
        <text x="65" y="25" fontSize="7" fill="#C7363B">Profit when</text>
        <text x="65" y="35" fontSize="7" fill="#C7363B">price falls</text>
      </g>
    </g>
    
    {/* Short Call Payoff */}
    <g transform="translate(40, 250)">
      <rect x="0" y="0" width="300" height="130" fill="#2A2A2C" rx="10"/>
      <text x="150" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#D2754C">Short Call Payoff</text>
      
      <g transform="translate(30, 40)">
        <line x1="0" y1="50" x2="220" y2="50" stroke="#555A63" strokeWidth="1"/>
        <line x1="110" y1="0" x2="110" y2="80" stroke="#555A63" strokeWidth="1"/>
        
        {/* Payoff line - mirror of long call */}
        <path d="M 15 35 L 110 35 L 180 75" stroke="#D2754C" strokeWidth="3" fill="none"/>
        <text x="5" y="38" fontSize="7" fill="#12805A">+Premium</text>
        <text x="175" y="85" fontSize="7" fill="#C7363B">Unlimited loss</text>
      </g>
    </g>
    
    {/* Short Put Payoff */}
    <g transform="translate(360, 250)">
      <rect x="0" y="0" width="300" height="130" fill="#2A2A2C" rx="10"/>
      <text x="150" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#8F6FC4">Short Put Payoff</text>
      
      <g transform="translate(30, 40)">
        <line x1="0" y1="50" x2="220" y2="50" stroke="#555A63" strokeWidth="1"/>
        <line x1="110" y1="0" x2="110" y2="80" stroke="#555A63" strokeWidth="1"/>
        
        {/* Payoff line - mirror of long put */}
        <path d="M 30 75 L 110 35 L 200 35" stroke="#8F6FC4" strokeWidth="3" fill="none"/>
        <text x="205" y="38" fontSize="7" fill="#12805A">+Premium</text>
        <text x="20" y="85" fontSize="7" fill="#C7363B">Large loss</text>
      </g>
    </g>
    
    {/* Legend */}
    <g transform="translate(150, 390)">
      <rect x="0" y="-5" width="400" height="30" fill="#2A2A2C" rx="8"/>
      <circle cx="40" cy="10" r="6" fill="#12805A"/>
      <text x="55" y="14" fontSize="9" fill="#A0A3AA">Calls profit when price rises</text>
      <circle cx="240" cy="10" r="6" fill="#C7363B"/>
      <text x="255" y="14" fontSize="9" fill="#A0A3AA">Puts profit when price falls</text>
    </g>
  </svg>
);

// SVG: Moneyness
const MoneynessSVG = () => (
  <svg viewBox="0 0 700 350" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="350" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Option Moneyness</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A0A3AA">Relationship between strike price and current market price</text>
    
    {/* Price Scale */}
    <g transform="translate(50, 90)">
      <rect x="0" y="0" width="600" height="60" fill="#2A2A2C" rx="10"/>
      
      {/* Scale line */}
      <line x1="50" y1="30" x2="550" y2="30" stroke="#555A63" strokeWidth="3"/>
      
      {/* Current Price marker */}
      <g transform="translate(300, 0)">
        <polygon points="0,15 -8,0 8,0" fill="#D2754C"/>
        <text x="0" y="-5" textAnchor="middle" fontSize="10" fontWeight="600" fill="#D2754C">Current Price</text>
        <text x="0" y="55" textAnchor="middle" fontSize="9" fill="white">$100</text>
      </g>
      
      {/* Lower prices */}
      <text x="100" y="55" textAnchor="middle" fontSize="9" fill="#A0A3AA">$80</text>
      <text x="200" y="55" textAnchor="middle" fontSize="9" fill="#A0A3AA">$90</text>
      
      {/* Higher prices */}
      <text x="400" y="55" textAnchor="middle" fontSize="9" fill="#A0A3AA">$110</text>
      <text x="500" y="55" textAnchor="middle" fontSize="9" fill="#A0A3AA">$120</text>
    </g>
    
    {/* Call Options Moneyness */}
    <g transform="translate(50, 170)">
      <rect x="0" y="0" width="290" height="160" fill="#12805A" fillOpacity="0.1" rx="10" stroke="#12805A" strokeWidth="1"/>
      <text x="145" y="25" textAnchor="middle" fontSize="13" fontWeight="600" fill="#12805A">CALL OPTIONS</text>
      
      <g transform="translate(20, 45)">
        {[
          { name: "In-The-Money (ITM)", desc: "Strike < Current", example: "$90 Call", color: "#12805A", gain: "Has intrinsic value" },
          { name: "At-The-Money (ATM)", desc: "Strike = Current", example: "$100 Call", color: "#D2754C", gain: "No intrinsic value" },
          { name: "Out-of-Money (OTM)", desc: "Strike > Current", example: "$110 Call", color: "#C7363B", gain: "No intrinsic value" }
        ].map((item, i) => (
          <g key={i} transform={`translate(0, ${i * 35})`}>
            <circle cx="8" cy="8" r="6" fill={item.color} fillOpacity="0.3"/>
            <text x="22" y="6" fontSize="9" fontWeight="600" fill={item.color}>{item.name}</text>
            <text x="22" y="18" fontSize="8" fill="#A0A3AA">{item.desc} | {item.example}</text>
          </g>
        ))}
      </g>
    </g>
    
    {/* Put Options Moneyness */}
    <g transform="translate(360, 170)">
      <rect x="0" y="0" width="290" height="160" fill="#C7363B" fillOpacity="0.1" rx="10" stroke="#C7363B" strokeWidth="1"/>
      <text x="145" y="25" textAnchor="middle" fontSize="13" fontWeight="600" fill="#C7363B">PUT OPTIONS</text>
      
      <g transform="translate(20, 45)">
        {[
          { name: "In-The-Money (ITM)", desc: "Strike > Current", example: "$110 Put", color: "#12805A", gain: "Has intrinsic value" },
          { name: "At-The-Money (ATM)", desc: "Strike = Current", example: "$100 Put", color: "#D2754C", gain: "No intrinsic value" },
          { name: "Out-of-Money (OTM)", desc: "Strike < Current", example: "$90 Put", color: "#C7363B", gain: "No intrinsic value" }
        ].map((item, i) => (
          <g key={i} transform={`translate(0, ${i * 35})`}>
            <circle cx="8" cy="8" r="6" fill={item.color} fillOpacity="0.3"/>
            <text x="22" y="6" fontSize="9" fontWeight="600" fill={item.color}>{item.name}</text>
            <text x="22" y="18" fontSize="8" fill="#A0A3AA">{item.desc} | {item.example}</text>
          </g>
        ))}
      </g>
    </g>
  </svg>
);

// SVG: Intrinsic vs Time Value
const IntrinsicTimeValueSVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="380" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Option Premium Components</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A0A3AA">Breaking down what you pay for an option</text>
    
    {/* Formula */}
    <g transform="translate(100, 80)">
      <rect x="0" y="0" width="500" height="60" fill="#2A2A2C" rx="10"/>
      <text x="250" y="38" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">
        Option Premium = Intrinsic Value + Time Value
      </text>
    </g>
    
    {/* Intrinsic Value */}
    <g transform="translate(50, 160)">
      <rect x="0" y="0" width="290" height="180" fill="#12805A" fillOpacity="0.1" rx="12" stroke="#12805A" strokeWidth="2"/>
      <text x="145" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#12805A">INTRINSIC VALUE</text>
      <text x="145" y="50" textAnchor="middle" fontSize="10" fill="#A0A3AA">Real, tangible value</text>
      
      <g transform="translate(20, 70)">
        <rect x="0" y="0" width="250" height="90" fill="#1F1F1F" rx="8"/>
        <text x="125" y="20" textAnchor="middle" fontSize="10" fill="white">What the option is worth if exercised NOW</text>
        
        <text x="125" y="45" textAnchor="middle" fontSize="9" fill="#12805A">Call: Max(0, Stock Price - Strike)</text>
        <text x="125" y="62" textAnchor="middle" fontSize="9" fill="#C7363B">Put: Max(0, Strike - Stock Price)</text>
        
        <text x="125" y="82" textAnchor="middle" fontSize="8" fill="#A0A3AA">Only ITM options have intrinsic value</text>
      </g>
    </g>
    
    {/* Time Value */}
    <g transform="translate(360, 160)">
      <rect x="0" y="0" width="290" height="180" fill="#D2754C" fillOpacity="0.1" rx="12" stroke="#D2754C" strokeWidth="2"/>
      <text x="145" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#D2754C">TIME VALUE</text>
      <text x="145" y="50" textAnchor="middle" fontSize="10" fill="#A0A3AA">Speculative value (Extrinsic)</text>
      
      <g transform="translate(20, 70)">
        <rect x="0" y="0" width="250" height="90" fill="#1F1F1F" rx="8"/>
        <text x="125" y="20" textAnchor="middle" fontSize="10" fill="white">Premium for time remaining + volatility</text>
        
        <text x="125" y="45" textAnchor="middle" fontSize="9" fill="#D2754C">Time Value = Premium - Intrinsic Value</text>
        
        <text x="125" y="68" textAnchor="middle" fontSize="8" fill="#A0A3AA">Decays as expiration approaches</text>
        <text x="125" y="82" textAnchor="middle" fontSize="8" fill="#A0A3AA">Higher volatility = More time value</text>
      </g>
    </g>
    
    {/* Example */}
    <g transform="translate(50, 350)">
      <rect x="0" y="0" width="600" height="25" fill="#2A2A2C" rx="6"/>
      <text x="300" y="17" textAnchor="middle" fontSize="9" fill="#A0A3AA">Example: Stock at $105, $100 Call trading at $8. Intrinsic = $5, Time Value = $3</text>
    </g>
  </svg>
);

// SVG: American vs European Options
const AmericanEuropeanSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="280" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">American vs European Style Options</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A0A3AA">When can you exercise your option?</text>
    
    {/* American */}
    <g transform="translate(50, 80)">
      <rect x="0" y="0" width="280" height="160" fill="#5A77AA" fillOpacity="0.1" rx="12" stroke="#5A77AA" strokeWidth="2"/>
      <text x="140" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#5A77AA">AMERICAN STYLE</text>
      
      <g transform="translate(20, 50)">
        <text x="120" y="15" textAnchor="middle" fontSize="10" fill="white">Exercise ANY TIME before expiry</text>
        
        {/* Timeline */}
        <line x1="20" y1="45" x2="220" y2="45" stroke="#5A77AA" strokeWidth="3"/>
        <circle cx="20" cy="45" r="5" fill="#5A77AA"/>
        <circle cx="220" cy="45" r="5" fill="#5A77AA"/>
        <text x="20" y="65" textAnchor="middle" fontSize="8" fill="#A0A3AA">Today</text>
        <text x="220" y="65" textAnchor="middle" fontSize="8" fill="#A0A3AA">Expiry</text>
        <text x="120" y="38" textAnchor="middle" fontSize="8" fill="#5A77AA">Can exercise anytime</text>
        
        <text x="120" y="95" textAnchor="middle" fontSize="9" fill="#A0A3AA">Most stock options</text>
        <text x="120" y="108" textAnchor="middle" fontSize="9" fill="#A0A3AA">More flexibility, higher premium</text>
      </g>
    </g>
    
    {/* European */}
    <g transform="translate(370, 80)">
      <rect x="0" y="0" width="280" height="160" fill="#8F6FC4" fillOpacity="0.1" rx="12" stroke="#8F6FC4" strokeWidth="2"/>
      <text x="140" y="30" textAnchor="middle" fontSize="14" fontWeight="600" fill="#8F6FC4">EUROPEAN STYLE</text>
      
      <g transform="translate(20, 50)">
        <text x="120" y="15" textAnchor="middle" fontSize="10" fill="white">Exercise ONLY at expiry</text>
        
        {/* Timeline */}
        <line x1="20" y1="45" x2="220" y2="45" stroke="#717680" strokeWidth="3"/>
        <circle cx="20" cy="45" r="5" fill="#717680"/>
        <circle cx="220" cy="45" r="5" fill="#8F6FC4"/>
        <text x="20" y="65" textAnchor="middle" fontSize="8" fill="#A0A3AA">Today</text>
        <text x="220" y="65" textAnchor="middle" fontSize="8" fill="#A0A3AA">Expiry</text>
        <text x="220" y="38" textAnchor="middle" fontSize="8" fill="#8F6FC4">Exercise here only</text>
        
        <text x="120" y="95" textAnchor="middle" fontSize="9" fill="#A0A3AA">Most index options (NIFTY)</text>
        <text x="120" y="108" textAnchor="middle" fontSize="9" fill="#A0A3AA">Less flexibility, lower premium</text>
      </g>
    </g>
    
    {/* Note */}
    <g transform="translate(50, 250)">
      <rect x="0" y="0" width="600" height="25" fill="#2A2A2C" rx="6"/>
      <text x="300" y="17" textAnchor="middle" fontSize="9" fill="#A0A3AA">Note: Names refer to exercise style, not geography. Both types trade worldwide.</text>
    </g>
  </svg>
);

// Quiz Questions
const quizQuestions = [
  {
    id: 1,
    question: "A CALL option gives the buyer the right to:",
    options: [
      "Sell the underlying at the strike price",
      "Buy the underlying at the strike price",
      "Both buy and sell at the strike price",
      "Trade the underlying at any price"
    ],
    correct: 1,
    explanation: "A call option gives the buyer the RIGHT (not obligation) to BUY the underlying asset at the strike price. Put options give the right to sell."
  },
  {
    id: 2,
    question: "If a stock trades at $100 and you hold a $95 call option, the option is:",
    options: [
      "Out-of-the-money (OTM)",
      "At-the-money (ATM)",
      "In-the-money (ITM)",
      "Cannot be determined"
    ],
    correct: 2,
    explanation: "A call option is In-the-Money (ITM) when the current stock price ($100) is ABOVE the strike price ($95). The option has $5 of intrinsic value."
  },
  {
    id: 3,
    question: "If a $100 call option trades at $8 when the stock is at $105, what is the time value?",
    options: [
      "$8",
      "$5",
      "$3",
      "$0"
    ],
    correct: 2,
    explanation: "Intrinsic Value = Stock Price - Strike = $105 - $100 = $5. Time Value = Premium - Intrinsic = $8 - $5 = $3."
  },
  {
    id: 4,
    question: "What is the maximum loss for a buyer of a call option?",
    options: [
      "Unlimited",
      "Strike price",
      "Premium paid",
      "Stock price at expiry"
    ],
    correct: 2,
    explanation: "Option buyers have LIMITED risk - the maximum they can lose is the premium paid upfront. If the option expires worthless, they lose only the premium. Option SELLERS face potentially unlimited loss on calls."
  }
];

const FOLesson4 = () => {
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
              Lesson 4 of 12
            </span>
            <span className="flex items-center gap-1 text-gray-500  text-sm">
              <Icons.Clock className="w-4 h-4" />
              25 min read
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4 tracking-[-0.025em]">
            Options Mechanics
          </h1>
          <p className="text-lg text-gray-600 ">
            Understanding calls, puts, moneyness, intrinsic value, and time value.
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
              "Understand the fundamental difference between call and put options",
              "Master option moneyness concepts: ITM, ATM, and OTM",
              "Break down option premium into intrinsic value and time value components",
              "Differentiate between American and European style options"
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
          
          {/* Section 1: Call vs Put */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand/20 bg-brand-fill">
                  <Icons.Phone className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">Call vs Put Options</h2>
                  <p className="text-sm text-gray-500 ">The two fundamental building blocks</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                All options strategies are built from two basic types: calls and puts. Understanding their 
                mechanics is essential before moving to more complex strategies.
              </p>

              <CallVsPutSVG />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                  <h4 className="font-bold text-brand  mb-2">When to Buy Calls</h4>
                  <ul className="text-gray-700  text-sm space-y-1">
                    <li>• Bullish on the underlying</li>
                    <li>• Want leveraged upside exposure</li>
                    <li>• Limited capital, want large exposure</li>
                  </ul>
                </div>
                <div className="bg-red-50  rounded-xl p-5 border border-red-200 ">
                  <h4 className="font-bold text-red-800  mb-2">When to Buy Puts</h4>
                  <ul className="text-gray-700  text-sm space-y-1">
                    <li>• Bearish on the underlying</li>
                    <li>• Want to hedge existing long positions</li>
                    <li>• Profit from downside without shorting</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Payoff Diagrams */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 bg-brand-fill">
                  <Icons.Layers className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">Option Payoff Diagrams</h2>
                  <p className="text-sm text-gray-500 ">Visualizing profit and loss at expiry</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Payoff diagrams show how your profit or loss changes based on where the underlying price 
                ends up at expiration. They are essential for understanding option positions.
              </p>

              <PayoffDiagramsSVG />

              <div className="mt-6 bg-amber-50  rounded-xl p-5 border border-amber-200 ">
                <div className="flex items-start gap-3">
                  <Icons.Lightbulb className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-800  mb-1">Key Insight: Asymmetric Risk</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      Notice how option <strong>buyers</strong> have limited loss (premium) but large profit potential. 
                      Option <strong>sellers</strong> have limited profit (premium) but potentially large losses. 
                      This asymmetry is fundamental to options trading.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Moneyness */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20 bg-brand-fill">
                  <Icons.Target className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">Option Moneyness</h2>
                  <p className="text-sm text-gray-500 ">ITM, ATM, and OTM explained</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Moneyness describes the relationship between the strike price and the current market price. 
                It determines whether an option has intrinsic value.
              </p>

              <MoneynessSVG />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-brand-soft  rounded-xl p-4 border border-brand-line  text-center">
                  <h4 className="font-bold text-brand  mb-1">ITM</h4>
                  <p className="text-gray-600  text-xs">Has intrinsic value. Higher premium, higher delta.</p>
                </div>
                <div className="bg-orange-50  rounded-xl p-4 border border-orange-200  text-center">
                  <h4 className="font-bold text-orange-800  mb-1">ATM</h4>
                  <p className="text-gray-600  text-xs">Highest time value. ~50 delta. Most sensitive to volatility.</p>
                </div>
                <div className="bg-red-50  rounded-xl p-4 border border-red-200  text-center">
                  <h4 className="font-bold text-red-800  mb-1">OTM</h4>
                  <p className="text-gray-600  text-xs">No intrinsic value. Lower premium, lower probability of profit.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Intrinsic vs Time Value */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20 bg-brand-fill">
                  <Icons.DollarSign className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">Option Premium Breakdown</h2>
                  <p className="text-sm text-gray-500 ">Understanding what you pay for</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Every option premium consists of two components: intrinsic value (real value) and time 
                value (speculative value). Understanding this decomposition is crucial for option trading.
              </p>

              <IntrinsicTimeValueSVG />

              <div className="mt-6 bg-red-50  rounded-xl p-5 border border-red-200 ">
                <div className="flex items-start gap-3">
                  <Icons.AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-800  mb-1">Time Decay Warning</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      Time value decays every day, accelerating as expiration approaches. This is called 
                      <strong> theta decay</strong>. Option buyers fight time; option sellers benefit from it. 
                      OTM options are 100% time value and will expire worthless if the price doesn&apos;t move enough.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: American vs European */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20 bg-brand-fill">
                  <Icons.ArrowRight className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">Exercise Styles</h2>
                  <p className="text-sm text-gray-500 ">American vs European options</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Options come in two exercise styles that determine when you can exercise your right. 
                This affects pricing and trading strategies.
              </p>

              <AmericanEuropeanSVG />

              <div className="mt-6 bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                <h4 className="font-bold text-blue-800  mb-2">Practical Consideration</h4>
                <p className="text-gray-700  text-sm leading-relaxed">
                  Most traders rarely exercise options early. It&apos;s usually better to sell the option 
                  to capture remaining time value. Early exercise typically only makes sense for 
                  deep ITM American options near ex-dividend dates.
                </p>
              </div>
            </div>
          </section>

          {/* Key Takeaways */}
          <section>
            <div className="rounded-2xl p-8 text-white bg-brand-fill">
              <h2 className="text-2xl font-semibold mb-6 tracking-[-0.025em]">Key Takeaways</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Call = Right to BUY; Put = Right to SELL at strike price",
                  "Option buyers have limited risk (premium); sellers have potentially unlimited risk",
                  "ITM = Has intrinsic value; ATM = Strike equals price; OTM = No intrinsic value",
                  "Premium = Intrinsic Value + Time Value",
                  "Time value decays daily, accelerating near expiry (theta decay)",
                  "American options can exercise anytime; European only at expiry"
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
              <h2 className="text-2xl font-semibold text-gray-900  mb-6 tracking-[-0.025em]">Knowledge Check</h2>
              
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
                      ? "Excellent! You understand options mechanics well." 
                      : "Review the explanations to strengthen your understanding."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200 ">
            <button
              onClick={() => navigate('/learn/derivatives/lesson-3')}
              className="flex items-center gap-2 text-gray-600  hover:text-orange-600 transition-colors"
            >
              <Icons.ArrowLeft className="w-5 h-5" />
              <span>Previous: Futures Pricing</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/derivatives/lesson-5')}
              className="flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all bg-brand-fill hover:bg-brand-hover"
            >
              <span>Next: Options Pricing Models</span>
              <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FOLesson4;
