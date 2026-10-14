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
  Shield: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Umbrella: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/>
    </svg>
  ),
  Lock: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  RefreshCw: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
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
  Briefcase: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  )
};

// SVG: Delta Hedging
const DeltaHedgingSVG = () => (
  <svg viewBox="0 0 700 400" className="w-full h-auto">
    <defs>
      <linearGradient id="dhGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1F1F1F"/>
        <stop offset="100%" stopColor="#2A2A2C"/>
      </linearGradient>
    </defs>
    
    <rect x="0" y="0" width="700" height="400" fill="url(#dhGrad)" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Delta Hedging Explained</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A0A3AA">Maintain a delta-neutral position to eliminate directional risk</text>
    
    {/* Example Setup */}
    <g transform="translate(50, 80)">
      <rect x="0" y="0" width="280" height="150" fill="#2A2A2C" rx="10"/>
      
      <text x="140" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#12805A">INITIAL POSITION</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="10" fill="white">Short 10 Call Options (Delta 0.50 each)</text>
        <text x="0" y="20" fontSize="10" fill="#A0A3AA">Position Delta: -500 (10 × 100 × -0.50)</text>
        
        <text x="0" y="50" fontSize="10" fill="white">To Hedge:</text>
        <text x="0" y="70" fontSize="10" fill="#12805A">Buy 500 shares of stock</text>
        <text x="0" y="90" fontSize="10" fill="#A0A3AA">(Stock delta = +1 per share)</text>
        
        <text x="0" y="115" fontSize="10" fill="white">Net Delta: -500 + 500 = 0</text>
      </g>
    </g>
    
    {/* Dynamic Rebalancing */}
    <g transform="translate(370, 80)">
      <rect x="0" y="0" width="280" height="150" fill="#2A2A2C" rx="10"/>
      
      <text x="140" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#D2754C">DYNAMIC REBALANCING</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="10" fill="white">Stock rises → Call delta increases to 0.60</text>
        <text x="0" y="18" fontSize="9" fill="#A0A3AA">New position delta: -600</text>
        <text x="0" y="36" fontSize="9" fill="#12805A">Action: Buy 100 more shares</text>
        
        <text x="0" y="60" fontSize="10" fill="white">Stock falls → Call delta decreases to 0.40</text>
        <text x="0" y="78" fontSize="9" fill="#A0A3AA">Position delta: -400, stock +500 = +100</text>
        <text x="0" y="96" fontSize="9" fill="#C7363B">Action: Sell 100 shares</text>
      </g>
    </g>
    
    {/* Process Flow */}
    <g transform="translate(80, 260)">
      <text x="260" y="0" textAnchor="middle" fontSize="11" fontWeight="600" fill="white">THE DELTA HEDGING CYCLE</text>
      
      {/* Flow boxes */}
      <g transform="translate(0, 20)">
        <rect x="0" y="0" width="100" height="50" fill="#5A77AA" fillOpacity="0.2" rx="6" stroke="#5A77AA" strokeWidth="1"/>
        <text x="50" y="22" textAnchor="middle" fontSize="9" fill="#5A77AA">Calculate</text>
        <text x="50" y="36" textAnchor="middle" fontSize="9" fill="#5A77AA">Position Delta</text>
        
        <path d="M 105 25 L 135 25" stroke="#555A63" strokeWidth="2" markerEnd="url(#arrowhead)"/>
        
        <rect x="140" y="0" width="100" height="50" fill="#D2754C" fillOpacity="0.2" rx="6" stroke="#D2754C" strokeWidth="1"/>
        <text x="190" y="22" textAnchor="middle" fontSize="9" fill="#D2754C">Stock Moves</text>
        <text x="190" y="36" textAnchor="middle" fontSize="9" fill="#D2754C">Delta Changes</text>
        
        <path d="M 245 25 L 275 25" stroke="#555A63" strokeWidth="2"/>
        
        <rect x="280" y="0" width="100" height="50" fill="#8F6FC4" fillOpacity="0.2" rx="6" stroke="#8F6FC4" strokeWidth="1"/>
        <text x="330" y="22" textAnchor="middle" fontSize="9" fill="#8F6FC4">Recalculate</text>
        <text x="330" y="36" textAnchor="middle" fontSize="9" fill="#8F6FC4">New Delta</text>
        
        <path d="M 385 25 L 415 25" stroke="#555A63" strokeWidth="2"/>
        
        <rect x="420" y="0" width="100" height="50" fill="#12805A" fillOpacity="0.2" rx="6" stroke="#12805A" strokeWidth="1"/>
        <text x="470" y="22" textAnchor="middle" fontSize="9" fill="#12805A">Adjust Stock</text>
        <text x="470" y="36" textAnchor="middle" fontSize="9" fill="#12805A">Position</text>
      </g>
      
      {/* Loop arrow */}
      <path d="M 470 80 Q 470 110 260 110 Q 50 110 50 80" fill="none" stroke="#555A63" strokeWidth="1" strokeDasharray="4"/>
      <text x="260" y="125" textAnchor="middle" fontSize="8" fill="#A0A3AA">Repeat as needed</text>
    </g>
  </svg>
);

// SVG: Collar Strategy
const CollarStrategySVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="380" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Collar Strategy</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A0A3AA">Protective put + Covered call = Zero or low cost downside protection</text>
    
    {/* Payoff Diagram */}
    <g transform="translate(60, 80)">
      {/* Axes */}
      <line x1="0" y1="120" x2="290" y2="120" stroke="#555A63" strokeWidth="1"/>
      <line x1="145" y1="20" x2="145" y2="200" stroke="#555A63" strokeWidth="1"/>
      
      <text x="240" y="145" fontSize="9" fill="#A0A3AA">Stock Price</text>
      <text x="150" y="15" fontSize="9" fill="#A0A3AA">P/L</text>
      
      {/* Stock only (dotted) */}
      <path d="M 0 200 L 290 40" fill="none" stroke="#555A63" strokeWidth="1.5" strokeDasharray="4"/>
      
      {/* Collar payoff - flat bottom and top */}
      <path d="M 0 150 L 85 150 L 85 150 L 205 70 L 205 70 L 290 70" fill="none" stroke="#5A77AA" strokeWidth="3"/>
      
      {/* Strike markers */}
      <circle cx="85" cy="150" r="5" fill="#C7363B"/>
      <circle cx="205" cy="70" r="5" fill="#12805A"/>
      
      <text x="85" y="172" textAnchor="middle" fontSize="8" fill="#C7363B">Put Strike</text>
      <text x="205" y="60" textAnchor="middle" fontSize="8" fill="#12805A">Call Strike</text>
      
      {/* Labels */}
      <text x="40" y="145" fontSize="7" fill="#C7363B">Max Loss</text>
      <text x="250" y="65" fontSize="7" fill="#12805A">Max Gain</text>
    </g>
    
    {/* Strategy Components */}
    <g transform="translate(380, 80)">
      <rect x="0" y="0" width="280" height="180" fill="#2A2A2C" rx="10"/>
      
      <text x="140" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#5A77AA">COLLAR COMPONENTS</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="10" fill="white">You have:</text>
        <text x="0" y="18" fontSize="9" fill="#A0A3AA">• Long 100 shares of stock</text>
        
        <text x="0" y="45" fontSize="10" fill="white">You add:</text>
        <text x="0" y="63" fontSize="9" fill="#C7363B">• Buy 1 OTM put (protection)</text>
        <text x="0" y="79" fontSize="9" fill="#12805A">• Sell 1 OTM call (finances the put)</text>
        
        <text x="0" y="105" fontSize="10" fill="white">Result:</text>
        <text x="0" y="123" fontSize="9" fill="#A0A3AA">Floor on losses at put strike</text>
        <text x="0" y="139" fontSize="9" fill="#A0A3AA">Ceiling on gains at call strike</text>
      </g>
    </g>
    
    {/* Zero Cost Collar */}
    <g transform="translate(50, 285)">
      <rect x="0" y="0" width="600" height="80" fill="#5A77AA" fillOpacity="0.1" rx="10" stroke="#5A77AA" strokeWidth="1"/>
      <text x="300" y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill="#5A77AA">ZERO-COST COLLAR</text>
      <text x="20" y="45" fontSize="9" fill="white">When the put premium equals the call premium, the collar costs nothing to establish</text>
      <text x="20" y="62" fontSize="9" fill="#A0A3AA">Example: Stock at $100, buy $95 put @ $2, sell $108 call @ $2 → Net cost: $0</text>
      <text x="385" y="62" fontSize="9" fill="#A0A3AA">Trade-off: Give up upside above $108 for free downside protection below $95</text>
    </g>
  </svg>
);

// SVG: Portfolio Insurance
const PortfolioInsuranceSVG = () => (
  <svg viewBox="0 0 700 400" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="400" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Portfolio Insurance Methods</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A0A3AA">Protecting diversified portfolios against market crashes</text>
    
    {/* Method 1: Index Puts */}
    <g transform="translate(50, 80)">
      <rect x="0" y="0" width="190" height="150" fill="#2A2A2C" rx="10"/>
      
      <text x="95" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">INDEX PUTS</text>
      
      <g transform="translate(15, 45)">
        <text x="0" y="0" fontSize="9" fill="white">Buy puts on broad index</text>
        <text x="0" y="16" fontSize="9" fill="#A0A3AA">(SPY, QQQ, etc.)</text>
        
        <text x="0" y="40" fontSize="8" fill="#12805A">Pros:</text>
        <text x="0" y="54" fontSize="8" fill="#A0A3AA">• Simple, liquid</text>
        <text x="0" y="68" fontSize="8" fill="#A0A3AA">• Broad protection</text>
        
        <text x="0" y="88" fontSize="8" fill="#C7363B">Cons:</text>
        <text x="0" y="102" fontSize="8" fill="#A0A3AA">• Basis risk if portfolio differs</text>
      </g>
    </g>
    
    {/* Method 2: VIX Calls */}
    <g transform="translate(255, 80)">
      <rect x="0" y="0" width="190" height="150" fill="#2A2A2C" rx="10"/>
      
      <text x="95" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#D2754C">VIX CALLS</text>
      
      <g transform="translate(15, 45)">
        <text x="0" y="0" fontSize="9" fill="white">Buy VIX call options</text>
        <text x="0" y="16" fontSize="9" fill="#A0A3AA">(VIX spikes during crashes)</text>
        
        <text x="0" y="40" fontSize="8" fill="#12805A">Pros:</text>
        <text x="0" y="54" fontSize="8" fill="#A0A3AA">• Convex payoff</text>
        <text x="0" y="68" fontSize="8" fill="#A0A3AA">• Big gains in crashes</text>
        
        <text x="0" y="88" fontSize="8" fill="#C7363B">Cons:</text>
        <text x="0" y="102" fontSize="8" fill="#A0A3AA">• Contango decay</text>
      </g>
    </g>
    
    {/* Method 3: Put Spreads */}
    <g transform="translate(460, 80)">
      <rect x="0" y="0" width="190" height="150" fill="#2A2A2C" rx="10"/>
      
      <text x="95" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">PUT SPREADS</text>
      
      <g transform="translate(15, 45)">
        <text x="0" y="0" fontSize="9" fill="white">Bear put spread on index</text>
        <text x="0" y="16" fontSize="9" fill="#A0A3AA">(Buy put, sell lower put)</text>
        
        <text x="0" y="40" fontSize="8" fill="#12805A">Pros:</text>
        <text x="0" y="54" fontSize="8" fill="#A0A3AA">• Lower cost than puts</text>
        <text x="0" y="68" fontSize="8" fill="#A0A3AA">• Defined cost</text>
        
        <text x="0" y="88" fontSize="8" fill="#C7363B">Cons:</text>
        <text x="0" y="102" fontSize="8" fill="#A0A3AA">• Capped protection</text>
      </g>
    </g>
    
    {/* Portfolio Beta Adjustment */}
    <g transform="translate(50, 250)">
      <rect x="0" y="0" width="600" height="130" fill="#8F6FC4" fillOpacity="0.1" rx="10" stroke="#8F6FC4" strokeWidth="1"/>
      <text x="300" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#8F6FC4">CALCULATING HEDGE SIZE</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="10" fill="white">Formula for Index Put Hedging:</text>
        <text x="0" y="20" fontSize="10" fill="#D2754C">Contracts = (Portfolio Value × Beta) ÷ (Index Price × 100)</text>
        
        <text x="0" y="50" fontSize="9" fill="white">Example:</text>
        <text x="0" y="68" fontSize="9" fill="#A0A3AA">$500,000 portfolio, Beta = 1.2, SPY at $450</text>
        <text x="0" y="84" fontSize="9" fill="#A0A3AA">Contracts = ($500,000 × 1.2) ÷ ($450 × 100) = 13.3 → Buy 13 SPY puts</text>
      </g>
    </g>
  </svg>
);

// SVG: Hedging with Futures
const FuturesHedgingSVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="380" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Hedging with Futures</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A0A3AA">Using futures contracts to offset portfolio risk</text>
    
    {/* Long Hedge */}
    <g transform="translate(50, 80)">
      <rect x="0" y="0" width="285" height="140" fill="#2A2A2C" rx="10"/>
      
      <text x="142" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#12805A">LONG HEDGE</text>
      <text x="142" y="42" textAnchor="middle" fontSize="9" fill="#A0A3AA">(Protecting against price increase)</text>
      
      <g transform="translate(20, 60)">
        <text x="0" y="0" fontSize="9" fill="white">Scenario: Need to buy asset in future</text>
        <text x="0" y="18" fontSize="9" fill="#A0A3AA">Risk: Price rises before purchase</text>
        <text x="0" y="40" fontSize="9" fill="#12805A">Action: Buy futures contracts now</text>
        <text x="0" y="58" fontSize="9" fill="#A0A3AA">If price rises, futures profit offsets higher cost</text>
      </g>
    </g>
    
    {/* Short Hedge */}
    <g transform="translate(365, 80)">
      <rect x="0" y="0" width="285" height="140" fill="#2A2A2C" rx="10"/>
      
      <text x="142" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">SHORT HEDGE</text>
      <text x="142" y="42" textAnchor="middle" fontSize="9" fill="#A0A3AA">(Protecting against price decrease)</text>
      
      <g transform="translate(20, 60)">
        <text x="0" y="0" fontSize="9" fill="white">Scenario: Own asset, selling later</text>
        <text x="0" y="18" fontSize="9" fill="#A0A3AA">Risk: Price falls before sale</text>
        <text x="0" y="40" fontSize="9" fill="#C7363B">Action: Sell futures contracts now</text>
        <text x="0" y="58" fontSize="9" fill="#A0A3AA">If price falls, futures profit offsets loss</text>
      </g>
    </g>
    
    {/* Hedge Ratio */}
    <g transform="translate(50, 240)">
      <rect x="0" y="0" width="600" height="120" fill="#D2754C" fillOpacity="0.1" rx="10" stroke="#D2754C" strokeWidth="1"/>
      <text x="300" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#D2754C">CALCULATING HEDGE RATIO</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="10" fill="white">Optimal Hedge Ratio = Correlation × (σ Spot / σ Futures)</text>
        
        <text x="0" y="30" fontSize="9" fill="#A0A3AA">Where:</text>
        <text x="60" y="30" fontSize="9" fill="#A0A3AA">Correlation = historical correlation between spot and futures</text>
        <text x="60" y="46" fontSize="9" fill="#A0A3AA">σ Spot = standard deviation of spot price changes</text>
        <text x="60" y="62" fontSize="9" fill="#A0A3AA">σ Futures = standard deviation of futures price changes</text>
      </g>
    </g>
  </svg>
);

// SVG: Hedge Effectiveness
const HedgeEffectivenessSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="340" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">Measuring Hedge Effectiveness</text>
    
    {/* Hedge Ratio Chart */}
    <g transform="translate(50, 60)">
      <rect x="0" y="0" width="280" height="180" fill="#2A2A2C" rx="10"/>
      
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#5A77AA">HEDGE EFFECTIVENESS RATIO</text>
      
      {/* Formula */}
      <g transform="translate(20, 50)">
        <text x="0" y="0" fontSize="10" fill="white">Effectiveness = Variance Reduction %</text>
        <text x="0" y="25" fontSize="9" fill="#A0A3AA">= 1 - (Hedged Portfolio Variance</text>
        <text x="30" y="40" fontSize="9" fill="#A0A3AA">/ Unhedged Portfolio Variance)</text>
        
        <text x="0" y="75" fontSize="10" fill="white">Interpretation:</text>
        <text x="0" y="93" fontSize="9" fill="#12805A">90%+ = Highly effective hedge</text>
        <text x="0" y="109" fontSize="9" fill="#D2754C">70-90% = Moderately effective</text>
        <text x="0" y="125" fontSize="9" fill="#C7363B">&lt;70% = Consider alternatives</text>
      </g>
    </g>
    
    {/* Common Issues */}
    <g transform="translate(370, 60)">
      <rect x="0" y="0" width="280" height="180" fill="#2A2A2C" rx="10"/>
      
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">HEDGING PITFALLS</text>
      
      <g transform="translate(20, 50)">
        <text x="0" y="0" fontSize="9" fontWeight="500" fill="#C7363B">Basis Risk</text>
        <text x="0" y="15" fontSize="8" fill="#A0A3AA">Hedge asset doesn&apos;t perfectly track exposure</text>
        
        <text x="0" y="38" fontSize="9" fontWeight="500" fill="#C7363B">Over-hedging</text>
        <text x="0" y="53" fontSize="8" fill="#A0A3AA">Hedge creates new directional exposure</text>
        
        <text x="0" y="76" fontSize="9" fontWeight="500" fill="#C7363B">Rolling Costs</text>
        <text x="0" y="91" fontSize="8" fill="#A0A3AA">Contango/backwardation when rolling futures</text>
        
        <text x="0" y="114" fontSize="9" fontWeight="500" fill="#C7363B">Opportunity Cost</text>
        <text x="0" y="129" fontSize="8" fill="#A0A3AA">Hedges limit upside as well as downside</text>
      </g>
    </g>
    
    {/* Best Practices */}
    <g transform="translate(50, 260)">
      <rect x="0" y="0" width="600" height="65" fill="#12805A" fillOpacity="0.1" rx="8" stroke="#12805A" strokeWidth="1"/>
      <text x="300" y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">HEDGING BEST PRACTICES</text>
      <text x="20" y="45" fontSize="9" fill="white">• Define hedge objective (tail risk vs full protection) • Choose liquid instruments • Monitor basis risk</text>
      <text x="20" y="60" fontSize="9" fill="white">• Rebalance as portfolio changes • Calculate cost vs benefit • Document hedge rationale</text>
    </g>
  </svg>
);

// Quiz Questions
const quizQuestions = [
  {
    id: 1,
    question: "Delta hedging requires you to:",
    options: [
      "Buy puts equal to your stock position",
      "Adjust your stock position as delta changes",
      "Sell all your options at expiration",
      "Only hedge once at trade initiation"
    ],
    correct: 1,
    explanation: "Delta hedging is a dynamic process. As the underlying moves, option deltas change. To maintain a delta-neutral position, you must continuously adjust your stock holdings to offset the changing option deltas."
  },
  {
    id: 2,
    question: "A collar strategy combines:",
    options: [
      "Two call options at different strikes",
      "A protective put and a covered call",
      "A straddle and a stock position",
      "Two put options at different strikes"
    ],
    correct: 1,
    explanation: "A collar consists of owning stock, buying a protective put (downside protection), and selling a covered call (finances the put). The call premium offsets the put cost, potentially creating a zero-cost collar."
  },
  {
    id: 3,
    question: "To hedge a $500,000 portfolio with Beta 1.0 using SPY puts at $500:",
    options: [
      "Buy 5 SPY puts",
      "Buy 10 SPY puts",
      "Buy 50 SPY puts",
      "Buy 100 SPY puts"
    ],
    correct: 1,
    explanation: "Contracts = (Portfolio Value × Beta) ÷ (Index Price × 100) = ($500,000 × 1.0) ÷ ($500 × 100) = 500,000 ÷ 50,000 = 10 contracts. Each SPY put covers $50,000 notional value."
  },
  {
    id: 4,
    question: "Basis risk in hedging refers to:",
    options: [
      "The cost of the hedge instrument",
      "The risk that the hedge doesn't perfectly track the exposure",
      "The margin required for futures hedging",
      "The time decay of option hedges"
    ],
    correct: 1,
    explanation: "Basis risk is the risk that the hedging instrument doesn't move perfectly in line with the asset being hedged. For example, using S&P 500 futures to hedge a tech-heavy portfolio may leave basis risk because the portfolio may not move exactly with the index."
  }
];

const FOLesson11 = () => {
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
              Lesson 11 of 12
            </span>
            <span className="flex items-center gap-1 text-gray-500  text-sm">
              <Icons.Clock className="w-4 h-4" />
              28 min read
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4 tracking-[-0.025em]">
            Hedging Techniques
          </h1>
          <p className="text-lg text-gray-600 ">
            Delta hedging, collars, portfolio insurance, and hedging with futures.
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
              "Master delta hedging for option positions",
              "Learn the collar strategy for zero-cost protection",
              "Understand portfolio insurance methods",
              "Apply futures hedging for market exposure"
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
          
          {/* Section 1: Delta Hedging */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 bg-brand-fill">
                  <Icons.RefreshCw className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">Delta Hedging</h2>
                  <p className="text-sm text-gray-500 ">Dynamic hedging to maintain delta neutrality</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Delta hedging involves continuously adjusting a hedge position to maintain delta neutrality. 
                Market makers use this technique to eliminate directional risk while profiting from other 
                factors like theta or volatility.
              </p>

              <DeltaHedgingSVG />

              <div className="mt-6 bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                <div className="flex items-start gap-3">
                  <Icons.Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-blue-800  mb-1">Gamma and Hedging Frequency</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      High gamma positions require more frequent rebalancing because delta changes rapidly 
                      with stock movement. ATM options near expiration have the highest gamma and need 
                      constant hedge adjustments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Collar Strategy */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20 bg-brand-fill">
                  <Icons.Lock className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">Collar Strategy</h2>
                  <p className="text-sm text-gray-500 ">Zero or low-cost downside protection</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                A collar combines a protective put with a covered call. The call premium finances 
                the put, creating cheap or free downside protection at the cost of capping upside.
              </p>

              <CollarStrategySVG />

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-brand-soft  rounded-xl p-5 border border-brand-line ">
                  <h4 className="font-bold text-brand  mb-2">When to Use a Collar</h4>
                  <ul className="text-gray-700  text-sm space-y-1">
                    <li>• Large concentrated stock position</li>
                    <li>• Tax reasons prevent selling</li>
                    <li>• Lock-in gains before known events</li>
                    <li>• Executive stock compensation</li>
                  </ul>
                </div>
                <div className="bg-orange-50  rounded-xl p-5 border border-orange-200 ">
                  <h4 className="font-bold text-orange-800  mb-2">Strike Selection Tips</h4>
                  <ul className="text-gray-700  text-sm space-y-1">
                    <li>• Put: Below support or max acceptable loss</li>
                    <li>• Call: Above resistance or target exit</li>
                    <li>• Wider collar = more upside potential</li>
                    <li>• Tighter collar = better protection</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Portfolio Insurance */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand/20 bg-brand-fill">
                  <Icons.Umbrella className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">Portfolio Insurance</h2>
                  <p className="text-sm text-gray-500 ">Protecting diversified portfolios from market crashes</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Portfolio insurance uses derivatives to protect a portfolio against significant losses. 
                Different methods offer trade-offs between cost, effectiveness, and complexity.
              </p>

              <PortfolioInsuranceSVG />

              <div className="mt-6 bg-red-50  rounded-xl p-5 border border-red-200 ">
                <div className="flex items-start gap-3">
                  <Icons.AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-800  mb-1">The Cost of Protection</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      Like car insurance, portfolio insurance has an ongoing cost. Put premiums, VIX decay, 
                      and opportunity cost of capped upside all eat into returns. Budget 1-3% annually 
                      for tail risk protection, and only use when the cost is justified by your risk profile.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Futures Hedging */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20 bg-brand-fill">
                  <Icons.Briefcase className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">Hedging with Futures</h2>
                  <p className="text-sm text-gray-500 ">Using futures contracts to offset portfolio risk</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Futures provide a direct, cost-effective way to hedge market exposure. Unlike options, 
                futures don&apos;t require paying a premium, but they also don&apos;t provide asymmetric protection.
              </p>

              <FuturesHedgingSVG />
            </div>
          </section>

          {/* Section 5: Hedge Effectiveness */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20 bg-brand-fill">
                  <Icons.Target className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900  mb-1 tracking-[-0.025em]">Measuring Effectiveness</h2>
                  <p className="text-sm text-gray-500 ">Evaluating and improving your hedges</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                A hedge is only as good as its effectiveness in reducing risk. Understanding how to 
                measure and optimize hedge performance is crucial for risk management.
              </p>

              <HedgeEffectivenessSVG />
            </div>
          </section>

          {/* Key Takeaways */}
          <section>
            <div className="rounded-2xl p-8 text-white bg-brand-fill">
              <h2 className="text-2xl font-semibold mb-6 tracking-[-0.025em]">Key Takeaways</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Delta hedging requires continuous rebalancing as deltas change",
                  "Collars provide cheap protection by sacrificing upside",
                  "Portfolio insurance methods: index puts, VIX calls, put spreads",
                  "Futures hedge symmetrically - lock in price, lose upside",
                  "Basis risk: hedge may not perfectly track your exposure",
                  "Always calculate cost vs benefit before implementing hedges"
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
                      ? "Excellent! You understand hedging techniques." 
                      : "Review the explanations to strengthen your understanding."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200 ">
            <button
              onClick={() => navigate('/learn/derivatives/lesson-10')}
              className="flex items-center gap-2 text-gray-600  hover:text-orange-600 transition-colors"
            >
              <Icons.ArrowLeft className="w-5 h-5" />
              <span>Previous: Advanced Spreads</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/derivatives/lesson-12')}
              className="flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all bg-brand-fill hover:bg-brand-hover"
            >
              <span>Next: Risk Management</span>
              <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FOLesson11;
