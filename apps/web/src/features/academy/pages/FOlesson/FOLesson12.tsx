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
  Scale: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 16l-4-8-4 8"/><path d="M3 22h18"/><path d="M12 2v4"/><path d="M8 16h8"/>
      <circle cx="4" cy="16" r="2"/><circle cx="20" cy="16" r="2"/>
    </svg>
  ),
  BarChart: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
  AlertTriangle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Sliders: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
      <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
      <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
    </svg>
  ),
  Award: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  ),
  Lightbulb: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18h6M10 22h4M12 2v1M4.22 4.22l.71.71M1 12h1M4.22 19.78l.71-.71M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
    </svg>
  )
};

// SVG: Position Sizing
const PositionSizingSVG = () => (
  <svg viewBox="0 0 700 420" className="w-full h-auto">
    <defs>
      <linearGradient id="psGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1F1F1F"/>
        <stop offset="100%" stopColor="#2A2A2C"/>
      </linearGradient>
    </defs>
    
    <rect x="0" y="0" width="700" height="420" fill="url(#psGrad)" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Position Sizing Methods</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A0A3AA">How much capital to allocate per trade</text>
    
    {/* Method 1: Fixed Percentage */}
    <g transform="translate(50, 80)">
      <rect x="0" y="0" width="190" height="150" fill="#2A2A2C" rx="10"/>
      
      <text x="95" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">FIXED PERCENTAGE</text>
      
      <g transform="translate(15, 45)">
        <text x="0" y="0" fontSize="9" fill="white">Risk 1-2% of account per trade</text>
        
        <text x="0" y="25" fontSize="9" fill="#D2754C">Formula:</text>
        <text x="0" y="42" fontSize="8" fill="#A0A3AA">Position Size = Account × Risk %</text>
        <text x="0" y="56" fontSize="8" fill="#A0A3AA">÷ Trade Risk (per share)</text>
        
        <text x="0" y="82" fontSize="8" fill="white">Example: $100K account, 1% risk</text>
        <text x="0" y="96" fontSize="8" fill="#A0A3AA">$1,000 max risk per trade</text>
      </g>
    </g>
    
    {/* Method 2: Kelly Criterion */}
    <g transform="translate(255, 80)">
      <rect x="0" y="0" width="190" height="150" fill="#2A2A2C" rx="10"/>
      
      <text x="95" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#5A77AA">KELLY CRITERION</text>
      
      <g transform="translate(15, 45)">
        <text x="0" y="0" fontSize="9" fill="white">Mathematically optimal sizing</text>
        
        <text x="0" y="25" fontSize="9" fill="#D2754C">Formula:</text>
        <text x="0" y="42" fontSize="8" fill="#A0A3AA">f* = (p × b - q) / b</text>
        <text x="0" y="56" fontSize="8" fill="#A0A3AA">p=win rate, q=1-p, b=win/loss</text>
        
        <text x="0" y="82" fontSize="8" fill="white">60% wins, 2:1 R/R:</text>
        <text x="0" y="96" fontSize="8" fill="#A0A3AA">(0.6×2 - 0.4) / 2 = 40%</text>
        <text x="0" y="110" fontSize="8" fill="#C7363B">Use ½ or ¼ Kelly in practice</text>
      </g>
    </g>
    
    {/* Method 3: Volatility-Based */}
    <g transform="translate(460, 80)">
      <rect x="0" y="0" width="190" height="150" fill="#2A2A2C" rx="10"/>
      
      <text x="95" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#8F6FC4">VOLATILITY-BASED</text>
      
      <g transform="translate(15, 45)">
        <text x="0" y="0" fontSize="9" fill="white">Adjust size by asset volatility</text>
        
        <text x="0" y="25" fontSize="9" fill="#D2754C">Formula:</text>
        <text x="0" y="42" fontSize="8" fill="#A0A3AA">Position = Account × Risk %</text>
        <text x="0" y="56" fontSize="8" fill="#A0A3AA">÷ (N × ATR)</text>
        
        <text x="0" y="82" fontSize="8" fill="white">N = ATR multiplier for stop</text>
        <text x="0" y="96" fontSize="8" fill="#A0A3AA">Higher volatility = smaller size</text>
      </g>
    </g>
    
    {/* Example Calculation */}
    <g transform="translate(50, 250)">
      <rect x="0" y="0" width="600" height="150" fill="#D2754C" fillOpacity="0.1" rx="10" stroke="#D2754C" strokeWidth="1"/>
      <text x="300" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#D2754C">PRACTICAL EXAMPLE: FIXED PERCENTAGE</text>
      
      <g transform="translate(30, 50)">
        <text x="0" y="0" fontSize="10" fill="white">Account: $50,000 | Max Risk Per Trade: 2% = $1,000</text>
        
        <text x="0" y="30" fontSize="10" fill="white">Trade Setup: Buy XYZ at $50, stop loss at $48</text>
        <text x="0" y="48" fontSize="10" fill="#A0A3AA">Risk per share: $50 - $48 = $2</text>
        
        <text x="0" y="75" fontSize="10" fill="#16A34A">Position Size: $1,000 ÷ $2 = 500 shares</text>
        <text x="0" y="93" fontSize="10" fill="#A0A3AA">Capital Required: 500 × $50 = $25,000 (50% of account)</text>
      </g>
    </g>
  </svg>
);

// SVG: Greeks Portfolio Management
const GreeksPortfolioSVG = () => (
  <svg viewBox="0 0 700 400" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="400" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Portfolio Greeks Management</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A0A3AA">Managing aggregate risk across all positions</text>
    
    {/* Portfolio Greeks Dashboard */}
    <g transform="translate(50, 80)">
      <rect x="0" y="0" width="300" height="200" fill="#2A2A2C" rx="10"/>
      
      <text x="150" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="white">PORTFOLIO GREEKS DASHBOARD</text>
      
      <g transform="translate(20, 50)">
        {/* Delta */}
        <text x="0" y="0" fontSize="10" fill="#A0A3AA">Net Delta:</text>
        <text x="120" y="0" fontSize="10" fontWeight="600" fill="#16A34A">+2,500</text>
        <rect x="180" y="-10" width="80" height="16" fill="#16A34A" fillOpacity="0.2" rx="4"/>
        <text x="220" y="2" textAnchor="middle" fontSize="8" fill="#16A34A">BULLISH</text>
        
        {/* Gamma */}
        <text x="0" y="30" fontSize="10" fill="#A0A3AA">Net Gamma:</text>
        <text x="120" y="30" fontSize="10" fontWeight="600" fill="#D2754C">+150</text>
        <rect x="180" y="20" width="80" height="16" fill="#D2754C" fillOpacity="0.2" rx="4"/>
        <text x="220" y="32" textAnchor="middle" fontSize="8" fill="#D2754C">LONG</text>
        
        {/* Theta */}
        <text x="0" y="60" fontSize="10" fill="#A0A3AA">Net Theta:</text>
        <text x="120" y="60" fontSize="10" fontWeight="600" fill="#C7363B">-$320/day</text>
        <rect x="180" y="50" width="80" height="16" fill="#C7363B" fillOpacity="0.2" rx="4"/>
        <text x="220" y="62" textAnchor="middle" fontSize="8" fill="#C7363B">PAYING</text>
        
        {/* Vega */}
        <text x="0" y="90" fontSize="10" fill="#A0A3AA">Net Vega:</text>
        <text x="120" y="90" fontSize="10" fontWeight="600" fill="#5A77AA">+$800</text>
        <rect x="180" y="80" width="80" height="16" fill="#5A77AA" fillOpacity="0.2" rx="4"/>
        <text x="220" y="92" textAnchor="middle" fontSize="8" fill="#5A77AA">LONG VOL</text>
        
        {/* Interpretation */}
        <text x="0" y="130" fontSize="9" fill="white">Interpretation:</text>
        <text x="0" y="147" fontSize="8" fill="#A0A3AA">• Moderately bullish bias</text>
        <text x="0" y="161" fontSize="8" fill="#A0A3AA">• Profits from volatility increase</text>
        <text x="0" y="175" fontSize="8" fill="#A0A3AA">• Losing $320/day to time decay</text>
      </g>
    </g>
    
    {/* Balancing Actions */}
    <g transform="translate(380, 80)">
      <rect x="0" y="0" width="270" height="200" fill="#2A2A2C" rx="10"/>
      
      <text x="135" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#D2754C">BALANCING ACTIONS</text>
      
      <g transform="translate(20, 45)">
        <text x="0" y="0" fontSize="9" fontWeight="500" fill="#16A34A">To Reduce Delta:</text>
        <text x="0" y="15" fontSize="8" fill="#A0A3AA">• Sell calls or buy puts</text>
        <text x="0" y="28" fontSize="8" fill="#A0A3AA">• Sell stock/futures</text>
        
        <text x="0" y="50" fontSize="9" fontWeight="500" fill="#D2754C">To Reduce Gamma:</text>
        <text x="0" y="65" fontSize="8" fill="#A0A3AA">• Sell ATM options</text>
        <text x="0" y="78" fontSize="8" fill="#A0A3AA">• Add spreads instead of naked</text>
        
        <text x="0" y="100" fontSize="9" fontWeight="500" fill="#C7363B">To Reduce Theta Bleed:</text>
        <text x="0" y="115" fontSize="8" fill="#A0A3AA">• Close long options</text>
        <text x="0" y="128" fontSize="8" fill="#A0A3AA">• Sell options against longs</text>
        
        <text x="0" y="150" fontSize="9" fontWeight="500" fill="#5A77AA">To Reduce Vega:</text>
        <text x="0" y="165" fontSize="8" fill="#A0A3AA">• Sell options</text>
        <text x="0" y="178" fontSize="8" fill="#A0A3AA">• Use spreads to cap vega</text>
      </g>
    </g>
    
    {/* Target Ranges */}
    <g transform="translate(50, 300)">
      <rect x="0" y="0" width="600" height="85" fill="#16A34A" fillOpacity="0.1" rx="10" stroke="#16A34A" strokeWidth="1"/>
      <text x="300" y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">PROFESSIONAL TARGET RANGES</text>
      
      <g transform="translate(20, 40)">
        <text x="0" y="10" fontSize="9" fill="white">Delta: ±5-10% of portfolio value | Gamma: Manageable daily swings (±1-2% P/L)</text>
        <text x="0" y="28" fontSize="9" fill="white">Theta: Should be positive or minimal negative | Vega: Match your volatility outlook</text>
        <text x="0" y="46" fontSize="9" fill="#A0A3AA">Review and rebalance weekly or when Greeks drift significantly from targets</text>
      </g>
    </g>
  </svg>
);

// SVG: Risk Metrics
const RiskMetricsSVG = () => (
  <svg viewBox="0 0 700 380" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="380" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Key Risk Metrics</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A0A3AA">Quantifying and monitoring portfolio risk</text>
    
    {/* VaR */}
    <g transform="translate(50, 80)">
      <rect x="0" y="0" width="190" height="140" fill="#2A2A2C" rx="10"/>
      
      <text x="95" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">VALUE AT RISK (VaR)</text>
      
      <g transform="translate(15, 45)">
        <text x="0" y="0" fontSize="9" fill="white">Maximum expected loss</text>
        <text x="0" y="16" fontSize="9" fill="#A0A3AA">at a confidence level</text>
        
        <text x="0" y="40" fontSize="9" fill="#D2754C">Example:</text>
        <text x="0" y="56" fontSize="8" fill="#A0A3AA">95% VaR = $10,000</text>
        <text x="0" y="70" fontSize="8" fill="#A0A3AA">means 95% of days</text>
        <text x="0" y="84" fontSize="8" fill="#A0A3AA">loss won&apos;t exceed $10K</text>
      </g>
    </g>
    
    {/* Max Drawdown */}
    <g transform="translate(255, 80)">
      <rect x="0" y="0" width="190" height="140" fill="#2A2A2C" rx="10"/>
      
      <text x="95" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#D2754C">MAX DRAWDOWN</text>
      
      <g transform="translate(15, 45)">
        <text x="0" y="0" fontSize="9" fill="white">Peak-to-trough decline</text>
        <text x="0" y="16" fontSize="9" fill="#A0A3AA">before new high</text>
        
        <text x="0" y="40" fontSize="9" fill="#D2754C">Example:</text>
        <text x="0" y="56" fontSize="8" fill="#A0A3AA">Account peak: $100K</text>
        <text x="0" y="70" fontSize="8" fill="#A0A3AA">Account low: $75K</text>
        <text x="0" y="84" fontSize="8" fill="#A0A3AA">Max DD: 25%</text>
      </g>
    </g>
    
    {/* Sharpe Ratio */}
    <g transform="translate(460, 80)">
      <rect x="0" y="0" width="190" height="140" fill="#2A2A2C" rx="10"/>
      
      <text x="95" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">SHARPE RATIO</text>
      
      <g transform="translate(15, 45)">
        <text x="0" y="0" fontSize="9" fill="white">Risk-adjusted return</text>
        <text x="0" y="16" fontSize="9" fill="#A0A3AA">(Return - Risk Free) / Volatility</text>
        
        <text x="0" y="40" fontSize="9" fill="#D2754C">Interpretation:</text>
        <text x="0" y="56" fontSize="8" fill="#A0A3AA">&lt;1 = Poor risk-adjusted</text>
        <text x="0" y="70" fontSize="8" fill="#A0A3AA">1-2 = Good</text>
        <text x="0" y="84" fontSize="8" fill="#A0A3AA">&gt;2 = Excellent</text>
      </g>
    </g>
    
    {/* Risk Limits Table */}
    <g transform="translate(50, 240)">
      <rect x="0" y="0" width="600" height="120" fill="#5A77AA" fillOpacity="0.1" rx="10" stroke="#5A77AA" strokeWidth="1"/>
      <text x="300" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#5A77AA">RECOMMENDED RISK LIMITS</text>
      
      <g transform="translate(30, 45)">
        <text x="0" y="0" fontSize="9" fontWeight="500" fill="white">Per Trade:</text>
        <text x="100" y="0" fontSize="9" fill="#A0A3AA">1-2% account risk</text>
        
        <text x="0" y="20" fontSize="9" fontWeight="500" fill="white">Per Sector:</text>
        <text x="100" y="20" fontSize="9" fill="#A0A3AA">20-30% max allocation</text>
        
        <text x="0" y="40" fontSize="9" fontWeight="500" fill="white">Correlated Positions:</text>
        <text x="100" y="40" fontSize="9" fill="#A0A3AA">5-10% combined risk</text>
        
        <text x="280" y="0" fontSize="9" fontWeight="500" fill="white">Daily VaR:</text>
        <text x="380" y="0" fontSize="9" fill="#A0A3AA">2-3% of account</text>
        
        <text x="280" y="20" fontSize="9" fontWeight="500" fill="white">Max Drawdown Target:</text>
        <text x="380" y="20" fontSize="9" fill="#A0A3AA">10-20% max acceptable</text>
        
        <text x="280" y="40" fontSize="9" fontWeight="500" fill="white">Margin Usage:</text>
        <text x="380" y="40" fontSize="9" fill="#A0A3AA">50% of available max</text>
      </g>
      
      <text x="300" y="105" textAnchor="middle" fontSize="8" fill="#A0A3AA">Adjust limits based on your risk tolerance and account size</text>
    </g>
  </svg>
);

// SVG: Trade Journal
const TradeJournalSVG = () => (
  <svg viewBox="0 0 700 360" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="360" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="35" textAnchor="middle" fontSize="18" fontWeight="700" fill="white">Trade Journal Best Practices</text>
    <text x="350" y="55" textAnchor="middle" fontSize="11" fill="#A0A3AA">Document every trade for continuous improvement</text>
    
    {/* Journal Entry Template */}
    <g transform="translate(50, 80)">
      <rect x="0" y="0" width="300" height="260" fill="#2A2A2C" rx="10"/>
      
      <text x="150" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#D2754C">JOURNAL ENTRY TEMPLATE</text>
      
      <g transform="translate(15, 50)">
        <text x="0" y="0" fontSize="9" fontWeight="500" fill="white">Pre-Trade:</text>
        <text x="0" y="15" fontSize="8" fill="#A0A3AA">• Date, time, symbol</text>
        <text x="0" y="28" fontSize="8" fill="#A0A3AA">• Strategy and setup reason</text>
        <text x="0" y="41" fontSize="8" fill="#A0A3AA">• Entry, stop loss, target prices</text>
        <text x="0" y="54" fontSize="8" fill="#A0A3AA">• Position size and risk amount</text>
        
        <text x="0" y="78" fontSize="9" fontWeight="500" fill="white">During Trade:</text>
        <text x="0" y="93" fontSize="8" fill="#A0A3AA">• Adjustments made</text>
        <text x="0" y="106" fontSize="8" fill="#A0A3AA">• Emotional state notes</text>
        <text x="0" y="119" fontSize="8" fill="#A0A3AA">• Market conditions</text>
        
        <text x="0" y="143" fontSize="9" fontWeight="500" fill="white">Post-Trade:</text>
        <text x="0" y="158" fontSize="8" fill="#A0A3AA">• Exit reason and price</text>
        <text x="0" y="171" fontSize="8" fill="#A0A3AA">• P/L ($ and %)</text>
        <text x="0" y="184" fontSize="8" fill="#A0A3AA">• What went well/wrong</text>
        <text x="0" y="197" fontSize="8" fill="#A0A3AA">• Lessons learned</text>
      </g>
    </g>
    
    {/* Key Metrics to Track */}
    <g transform="translate(370, 80)">
      <rect x="0" y="0" width="280" height="260" fill="#2A2A2C" rx="10"/>
      
      <text x="140" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A">METRICS TO TRACK</text>
      
      <g transform="translate(15, 50)">
        <text x="0" y="0" fontSize="9" fontWeight="500" fill="white">Performance:</text>
        <text x="0" y="15" fontSize="8" fill="#A0A3AA">• Win rate (% of profitable trades)</text>
        <text x="0" y="28" fontSize="8" fill="#A0A3AA">• Average win vs average loss</text>
        <text x="0" y="41" fontSize="8" fill="#A0A3AA">• Profit factor (gross wins / losses)</text>
        <text x="0" y="54" fontSize="8" fill="#A0A3AA">• Expectancy per trade</text>
        
        <text x="0" y="78" fontSize="9" fontWeight="500" fill="white">By Strategy:</text>
        <text x="0" y="93" fontSize="8" fill="#A0A3AA">• P/L by strategy type</text>
        <text x="0" y="106" fontSize="8" fill="#A0A3AA">• Best/worst performing setups</text>
        
        <text x="0" y="130" fontSize="9" fontWeight="500" fill="white">By Condition:</text>
        <text x="0" y="145" fontSize="8" fill="#A0A3AA">• P/L by market condition</text>
        <text x="0" y="158" fontSize="8" fill="#A0A3AA">• P/L by day of week</text>
        <text x="0" y="171" fontSize="8" fill="#A0A3AA">• P/L by time of day</text>
        
        <text x="0" y="195" fontSize="9" fontWeight="500" fill="white">Review Frequency:</text>
        <text x="0" y="210" fontSize="8" fill="#A0A3AA">Daily: Quick notes | Weekly: Analysis</text>
        <text x="0" y="223" fontSize="8" fill="#A0A3AA">Monthly: Deep dive & adjustments</text>
      </g>
    </g>
  </svg>
);

// SVG: Final Checklist
const FinalChecklistSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full h-auto">
    <rect x="0" y="0" width="700" height="340" fill="#1F1F1F" rx="16"/>
    
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">Pre-Trade Risk Checklist</text>
    
    {/* Checklist Items */}
    <g transform="translate(50, 60)">
      {[
        { text: "Position size calculated using fixed % risk rule?", color: "#16A34A" },
        { text: "Stop loss defined before entry?", color: "#16A34A" },
        { text: "Risk/reward ratio acceptable (≥1:2)?", color: "#16A34A" },
        { text: "Portfolio Greeks within target ranges?", color: "#5A77AA" },
        { text: "No excessive correlation with existing positions?", color: "#5A77AA" },
        { text: "Total account risk under daily/weekly limits?", color: "#D2754C" },
        { text: "Trade thesis documented in journal?", color: "#D2754C" },
        { text: "Exit plan for both profit and loss scenarios?", color: "#8F6FC4" },
        { text: "Margin requirements understood and met?", color: "#8F6FC4" },
        { text: "Not trading based on emotion (FOMO, revenge)?", color: "#C7363B" }
      ].map((item, i) => (
        <g key={i} transform={`translate(${i < 5 ? 0 : 310}, ${(i % 5) * 52})`}>
          <rect x="0" y="0" width="290" height="44" fill="#2A2A2C" rx="8"/>
          <rect x="12" y="12" width="20" height="20" fill={item.color} fillOpacity="0.2" rx="4" stroke={item.color} strokeWidth="1"/>
          <path d="M 17 22 L 21 26 L 27 18" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <text x="42" y="28" fontSize="9" fill="white">{item.text}</text>
        </g>
      ))}
    </g>
    
    {/* Bottom Message */}
    <g transform="translate(50, 315)">
      <text x="300" y="0" textAnchor="middle" fontSize="10" fill="#A0A3AA">Complete this checklist before EVERY trade. No exceptions. Discipline creates profits.</text>
    </g>
  </svg>
);

// Quiz Questions
const quizQuestions = [
  {
    id: 1,
    question: "Using 2% fixed risk with a $50,000 account and a $5 per share stop loss, position size is:",
    options: [
      "100 shares",
      "200 shares",
      "500 shares",
      "1,000 shares"
    ],
    correct: 1,
    explanation: "2% of $50,000 = $1,000 max risk. With a $5 stop loss: $1,000 ÷ $5 = 200 shares. This position can lose $1,000 max if stopped out, which is exactly 2% of the account."
  },
  {
    id: 2,
    question: "A portfolio with positive Vega will profit when:",
    options: [
      "The underlying moves up",
      "The underlying moves down",
      "Implied volatility increases",
      "Time passes"
    ],
    correct: 2,
    explanation: "Positive Vega means the portfolio benefits from increases in implied volatility. For each 1% increase in IV, the portfolio gains approximately the Vega amount. This is typical of long option positions."
  },
  {
    id: 3,
    question: "95% Value at Risk (VaR) of $5,000 means:",
    options: [
      "You will definitely lose $5,000",
      "Maximum possible loss is $5,000",
      "95% of the time, daily losses won't exceed $5,000",
      "You should risk $5,000 per trade"
    ],
    correct: 2,
    explanation: "95% VaR = $5,000 means there's a 95% probability that daily losses won't exceed $5,000. There's still a 5% chance of losses being larger. It's a statistical measure, not a guarantee."
  },
  {
    id: 4,
    question: "The most important element of trade journaling is:",
    options: [
      "Recording profit/loss amounts only",
      "Writing lengthy market analysis",
      "Documenting the reasoning and lessons from each trade",
      "Tracking only winning trades"
    ],
    correct: 2,
    explanation: "The value of a trade journal is learning from experience. Documenting WHY you took a trade, what happened, and what you learned enables pattern recognition and continuous improvement. P/L alone doesn't teach you much."
  }
];

const FOLesson12 = () => {
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
    <StudyShell module="FOlesson" lessonNumber={12}>
      
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
              Lesson 12 of 12
            </span>
            <span className="flex items-center gap-1 text-gray-500  text-sm">
              <Icons.Clock className="w-4 h-4" />
              30 min read
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 tracking-[-0.025em]">
            Risk Management & Position Sizing
          </h1>
          <p className="text-lg text-gray-600 ">
            The foundation of long-term trading success.
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
              "Master position sizing using multiple methods",
              "Learn to manage portfolio Greeks holistically",
              "Understand key risk metrics (VaR, Sharpe, Drawdown)",
              "Build a professional trade journaling practice"
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
          
          {/* Section 1: Position Sizing */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand/20 bg-brand-fill">
                  <Icons.Scale className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">Position Sizing</h2>
                  <p className="text-sm text-gray-500 ">The most important trading skill you&apos;ll learn</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Position sizing determines how much capital you allocate to each trade. It&apos;s the difference 
                between a winning strategy that builds wealth and one that blows up your account. 
                Most professional traders consider it more important than entry signals.
              </p>

              <PositionSizingSVG />

              <div className="mt-6 bg-red-50  rounded-xl p-5 border border-red-200 ">
                <div className="flex items-start gap-3">
                  <Icons.AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-800  mb-1">The Cardinal Rule</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      Never risk more than 2% of your account on a single trade. Even a string of 10 
                      consecutive losses would only draw down your account by about 18%. You can recover 
                      from 18% - you cannot recover from a blown account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Portfolio Greeks */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 bg-brand-fill">
                  <Icons.Sliders className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">Portfolio Greeks Management</h2>
                  <p className="text-sm text-gray-500 ">Managing aggregate risk across all positions</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                When you have multiple options positions, individual Greeks combine to create portfolio-level 
                exposures. Understanding and managing these aggregate Greeks is how professionals control risk.
              </p>

              <GreeksPortfolioSVG />

              <div className="mt-6 bg-blue-50  rounded-xl p-5 border border-blue-200 ">
                <div className="flex items-start gap-3">
                  <Icons.Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-blue-800  mb-1">Greeks Don&apos;t Cancel Perfectly</h4>
                    <p className="text-gray-700  text-sm leading-relaxed">
                      A position in AAPL and one in MSFT may both have delta exposure, but they won&apos;t 
                      perfectly offset. Consider correlation between underlyings when aggregating Greeks. 
                      Use index options or futures for portfolio-level hedging.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Risk Metrics */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20 bg-brand-fill">
                  <Icons.BarChart className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">Risk Metrics</h2>
                  <p className="text-sm text-gray-500 ">Quantifying portfolio risk like a professional</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Risk metrics help you understand your portfolio&apos;s risk profile objectively. They answer 
                questions like &quot;How much could I lose?&quot; and &quot;Am I being compensated for the risk I&apos;m taking?&quot;
              </p>

              <RiskMetricsSVG />
            </div>
          </section>

          {/* Section 4: Trade Journal */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20 bg-brand-fill">
                  <Icons.Award className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">Trade Journaling</h2>
                  <p className="text-sm text-gray-500 ">The secret weapon of successful traders</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Every professional trader keeps a detailed journal. It&apos;s how you learn from experience, 
                identify patterns in your behavior, and continuously improve. Without a journal, you&apos;re 
                destined to repeat the same mistakes.
              </p>

              <TradeJournalSVG />
            </div>
          </section>

          {/* Section 5: Pre-Trade Checklist */}
          <section>
            <div className="bg-white  rounded-2xl p-8 shadow-sm border border-gray-100 ">
              <div className="flex items-start gap-4 mb-6">
                <span className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                  <Icons.Shield className="w-6 h-6 text-white"/>
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900  mb-1 tracking-[-0.025em]">Pre-Trade Checklist</h2>
                  <p className="text-sm text-gray-500 ">Run through before every single trade</p>
                </div>
              </div>

              <p className="text-gray-700  leading-relaxed mb-6">
                Pilots use checklists before every flight, even after thousands of hours. Traders should 
                do the same. This checklist will save you from costly mistakes driven by emotion or haste.
              </p>

              <FinalChecklistSVG />
            </div>
          </section>

          {/* Key Takeaways */}
          <section>
            <div className="rounded-2xl p-8 text-white bg-brand-fill">
              <h2 className="text-2xl font-bold mb-6 tracking-[-0.025em]">Key Takeaways</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Position sizing is THE most important trading skill",
                  "Never risk more than 2% of account per trade",
                  "Monitor portfolio Greeks weekly and rebalance as needed",
                  "Track VaR, drawdown, and Sharpe ratio for risk assessment",
                  "Keep a detailed trade journal and review it regularly",
                  "Use a pre-trade checklist for every single trade"
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
                      ? "Excellent! You've completed the entire module." 
                      : "Review the explanations to strengthen your understanding."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Module Completion */}
          <section>
            <div className="rounded-2xl p-8 text-white text-center bg-brand-fill">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Award className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2 tracking-[-0.015em]">Module Complete!</h2>
              <p className="text-white/85 mb-6 max-w-2xl mx-auto">
                Congratulations on completing the Futures & Options module. You now have a comprehensive 
                understanding of derivatives, from basic concepts to advanced strategies and risk management. 
                Apply these skills carefully, start small, and never stop learning.
              </p>
              <button
                onClick={() => navigate('/learn/derivatives')}
                className="px-8 py-3 bg-white text-brand font-semibold rounded-xl hover:bg-brand-soft transition-colors"
              >
                Return to Module Overview
              </button>
            </div>
          </section>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200 ">
            <button
              onClick={() => navigate('/learn/derivatives/lesson-11')}
              className="flex items-center gap-2 text-gray-600  hover:text-orange-600 transition-colors"
            >
              <Icons.ArrowLeft className="w-5 h-5" />
              <span>Previous: Hedging Techniques</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/derivatives')}
              className="flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all bg-brand-fill hover:bg-brand-hover"
            >
              <span>Back to Module</span>
              <Icons.ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </StudyShell>
  );
};

export default FOLesson12;
