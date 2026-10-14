import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

// SVG 1: What Is a Futures Contract
const WhatIsFuturesSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">A Futures Contract: An Agreement About the Future</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Two parties agree TODAY on a price for a transaction that happens LATER</text>
    
    {/* Today side */}
    <g transform="translate(80, 80)">
      <rect x="0" y="0" width="200" height="150" fill="#E0E7F1" rx="12" stroke="#9FB3D3" strokeWidth="2"/>
      <text x="100" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#344C72">TODAY</text>
      <text x="100" y="45" textAnchor="middle" fontSize="9" fill="#717680">When the contract is made</text>
      
      <g transform="translate(25, 60)">
        <rect x="0" y="0" width="150" height="70" fill="white" rx="8"/>
        <text x="75" y="20" textAnchor="middle" fontSize="8" fill="#373A41">Both parties agree:</text>
        <text x="75" y="38" textAnchor="middle" fontSize="9" fill="#344C72" fontWeight="500">• What to buy/sell</text>
        <text x="75" y="53" textAnchor="middle" fontSize="9" fill="#344C72" fontWeight="500">• The price</text>
        <text x="75" y="68" textAnchor="middle" fontSize="9" fill="#344C72" fontWeight="500">• The future date</text>
      </g>
    </g>
    
    {/* Arrow */}
    <g transform="translate(290, 140)">
      <line x1="0" y1="15" x2="100" y2="15" stroke="#717680" strokeWidth="2" strokeDasharray="8,4"/>
      <polygon points="100,15 90,10 90,20" fill="#717680"/>
      <text x="50" y="5" textAnchor="middle" fontSize="8" fill="#717680">Time passes...</text>
      <text x="50" y="40" textAnchor="middle" fontSize="7" fill="#A0A3AA">weeks or months</text>
    </g>
    
    {/* Future side */}
    <g transform="translate(420, 80)">
      <rect x="0" y="0" width="200" height="150" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
      <text x="100" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#654B26">EXPIRATION DATE</text>
      <text x="100" y="45" textAnchor="middle" fontSize="9" fill="#717680">When the deal happens</text>
      
      <g transform="translate(25, 60)">
        <rect x="0" y="0" width="150" height="70" fill="white" rx="8"/>
        <text x="75" y="20" textAnchor="middle" fontSize="8" fill="#373A41">The transaction occurs:</text>
        <text x="75" y="38" textAnchor="middle" fontSize="9" fill="#654B26" fontWeight="500">• Asset is delivered</text>
        <text x="75" y="53" textAnchor="middle" fontSize="9" fill="#654B26" fontWeight="500">• Agreed price is paid</text>
        <text x="75" y="68" textAnchor="middle" fontSize="9" fill="#654B26" fontWeight="500">• Contract fulfilled</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="240" width="500" height="30" fill="#2A2A2C" rx="6"/>
    <text x="350" y="253" textAnchor="middle" fontSize="9" fill="white">A futures contract locks in a price today for a transaction that will happen later.</text>
    <text x="350" y="266" textAnchor="middle" fontSize="8" fill="#A0A3AA">Both parties are OBLIGATED to complete the deal — it's not optional.</text>
  </svg>
);

// SVG 2: The Obligation
const ObligationSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Futures = Obligation (Not a Choice)</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Once you enter a futures contract, you MUST complete the deal</text>
    
    {/* Buyer side */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="280" height="170" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">The Buyer</text>
      <text x="140" y="45" textAnchor="middle" fontSize="9" fill="#717680">(Agrees to BUY at the set price)</text>
      
      <g transform="translate(20, 60)">
        <rect x="0" y="0" width="240" height="90" fill="white" rx="8"/>
        <text x="120" y="25" textAnchor="middle" fontSize="24">🛒</text>
        <text x="120" y="50" textAnchor="middle" fontSize="9" fill="#12805A" fontWeight="500">MUST buy at agreed price</text>
        <text x="120" y="68" textAnchor="middle" fontSize="8" fill="#717680">Even if market price is lower</text>
        <text x="120" y="82" textAnchor="middle" fontSize="8" fill="#717680">No backing out</text>
      </g>
    </g>
    
    {/* Contract in middle */}
    <g transform="translate(310, 130)">
      <rect x="0" y="0" width="80" height="60" fill="#E0E7F1" rx="8" stroke="#9FB3D3" strokeWidth="2"/>
      <text x="40" y="25" textAnchor="middle" fontSize="16">📋</text>
      <text x="40" y="45" textAnchor="middle" fontSize="8" fill="#344C72" fontWeight="500">Contract</text>
      <text x="40" y="55" textAnchor="middle" fontSize="7" fill="#717680">Binds both</text>
    </g>
    
    {/* Seller side */}
    <g transform="translate(370, 75)">
      <rect x="0" y="0" width="280" height="170" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#654B26">The Seller</text>
      <text x="140" y="45" textAnchor="middle" fontSize="9" fill="#717680">(Agrees to SELL at the set price)</text>
      
      <g transform="translate(20, 60)">
        <rect x="0" y="0" width="240" height="90" fill="white" rx="8"/>
        <text x="120" y="25" textAnchor="middle" fontSize="24">🏷️</text>
        <text x="120" y="50" textAnchor="middle" fontSize="9" fill="#654B26" fontWeight="500">MUST sell at agreed price</text>
        <text x="120" y="68" textAnchor="middle" fontSize="8" fill="#717680">Even if market price is higher</text>
        <text x="120" y="82" textAnchor="middle" fontSize="8" fill="#717680">No backing out</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="260" width="500" height="30" fill="#C7363B" rx="6"/>
    <text x="350" y="273" textAnchor="middle" fontSize="9" fill="white">⚠️ This obligation is what makes futures risky — you can't walk away if the price moves against you.</text>
    <text x="350" y="286" textAnchor="middle" fontSize="8" fill="#F6C3C3">This is different from options, which give you a choice (covered in the next lesson).</text>
  </svg>
);

// SVG 3: Why Futures Exist - The Problem
const WhyFuturesExistSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Why Were Futures Invented?</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">They solve a real problem for businesses: price uncertainty</text>
    
    {/* Problem scenario */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="280" height="200" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">The Problem: Uncertainty</text>
      
      <g transform="translate(20, 50)">
        <rect x="0" y="0" width="240" height="130" fill="white" rx="8"/>
        
        {/* Airline example */}
        <text x="120" y="22" textAnchor="middle" fontSize="20">✈️</text>
        <text x="120" y="42" textAnchor="middle" fontSize="9" fill="#373A41" fontWeight="500">An airline in January:</text>
        
        <text x="120" y="62" textAnchor="middle" fontSize="8" fill="#373A41">"We need jet fuel all year..."</text>
        <text x="120" y="77" textAnchor="middle" fontSize="8" fill="#C7363B">"But what if oil prices double by summer?"</text>
        <text x="120" y="92" textAnchor="middle" fontSize="8" fill="#C7363B">"We can't plan ticket prices!"</text>
        <text x="120" y="107" textAnchor="middle" fontSize="8" fill="#C7363B">"Our costs are unpredictable!"</text>
        
        <text x="120" y="125" textAnchor="middle" fontSize="7" fill="#717680">Price swings make business planning impossible</text>
      </g>
    </g>
    
    {/* Solution */}
    <g transform="translate(370, 75)">
      <rect x="0" y="0" width="280" height="200" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">The Solution: Futures</text>
      
      <g transform="translate(20, 50)">
        <rect x="0" y="0" width="240" height="130" fill="white" rx="8"/>
        
        <text x="120" y="22" textAnchor="middle" fontSize="20">📋</text>
        <text x="120" y="42" textAnchor="middle" fontSize="9" fill="#373A41" fontWeight="500">The airline buys oil futures:</text>
        
        <text x="120" y="62" textAnchor="middle" fontSize="8" fill="#12805A">"We'll lock in $80/barrel for delivery"</text>
        <text x="120" y="77" textAnchor="middle" fontSize="8" fill="#12805A">"throughout the year."</text>
        <text x="120" y="92" textAnchor="middle" fontSize="8" fill="#12805A">"Now we KNOW our fuel costs!"</text>
        <text x="120" y="107" textAnchor="middle" fontSize="8" fill="#12805A">"We can set ticket prices confidently."</text>
        
        <text x="120" y="125" textAnchor="middle" fontSize="7" fill="#717680">Price certainty enables business planning</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="285" width="500" height="25" fill="#2A2A2C" rx="6"/>
    <text x="350" y="302" textAnchor="middle" fontSize="9" fill="white">Futures were invented to help businesses manage price risk — this is called "hedging."</text>
  </svg>
);

// SVG 4: Two Sides of a Futures Trade
const TwoSidesSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Every Futures Contract Has Two Sides</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">One person's protection is another's opportunity — or risk</text>
    
    {/* Hedger side */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="280" height="180" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">The Hedger</text>
      <text x="140" y="45" textAnchor="middle" fontSize="9" fill="#717680">(Wants price certainty)</text>
      
      <g transform="translate(20, 60)">
        <rect x="0" y="0" width="240" height="100" fill="white" rx="8"/>
        
        <text x="120" y="22" textAnchor="middle" fontSize="18">🌾 ✈️ 🏭</text>
        <text x="120" y="42" textAnchor="middle" fontSize="8" fill="#373A41">Farmers, airlines, manufacturers...</text>
        
        <text x="120" y="62" textAnchor="middle" fontSize="8" fill="#12805A" fontWeight="500">Goal: Remove uncertainty</text>
        <text x="120" y="78" textAnchor="middle" fontSize="8" fill="#717680">Willing to give up potential gains</text>
        <text x="120" y="92" textAnchor="middle" fontSize="8" fill="#717680">to avoid potential losses</text>
      </g>
    </g>
    
    {/* Speculator side */}
    <g transform="translate(370, 75)">
      <rect x="0" y="0" width="280" height="180" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#654B26">The Speculator</text>
      <text x="140" y="45" textAnchor="middle" fontSize="9" fill="#717680">(Bets on price direction)</text>
      
      <g transform="translate(20, 60)">
        <rect x="0" y="0" width="240" height="100" fill="white" rx="8"/>
        
        <text x="120" y="22" textAnchor="middle" fontSize="18">📈 📉 🎲</text>
        <text x="120" y="42" textAnchor="middle" fontSize="8" fill="#373A41">Traders betting on price moves...</text>
        
        <text x="120" y="62" textAnchor="middle" fontSize="8" fill="#654B26" fontWeight="500">Goal: Profit from price changes</text>
        <text x="120" y="78" textAnchor="middle" fontSize="8" fill="#717680">Takes on the risk that hedgers</text>
        <text x="120" y="92" textAnchor="middle" fontSize="8" fill="#717680">want to get rid of</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="265" width="500" height="25" fill="#654B26" rx="6"/>
    <text x="350" y="282" textAnchor="middle" fontSize="9" fill="white">Hedgers created the market. Speculators provide the liquidity. Most beginners are speculators.</text>
  </svg>
);

// SVG 5: Global Example - Cocoa Farmer
const GlobalExampleSVG = () => (
  <svg viewBox="0 0 700 400" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="400" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Real-World Example: Carlos the Cocoa Farmer</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">How a futures contract can protect — or limit — a business</text>
    
    {/* Setup */}
    <g transform="translate(50, 70)">
      <rect x="0" y="0" width="600" height="65" fill="#E0E7F1" rx="10" stroke="#9FB3D3" strokeWidth="1"/>
      <text x="300" y="20" textAnchor="middle" fontSize="10" fontWeight="500" fill="#344C72">The Situation (March)</text>
      <text x="300" y="38" textAnchor="middle" fontSize="9" fill="#373A41">Carlos grows cocoa in Ghana. His harvest will be ready in September.</text>
      <text x="300" y="53" textAnchor="middle" fontSize="9" fill="#373A41">Today, cocoa is $3,000 per ton. He expects to harvest 100 tons.</text>
    </g>
    
    {/* Carlos's decision */}
    <g transform="translate(50, 145)">
      <rect x="0" y="0" width="600" height="45" fill="#F6ECCE" rx="8" stroke="#E2C273" strokeWidth="1"/>
      <text x="300" y="18" textAnchor="middle" fontSize="9" fontWeight="500" fill="#654B26">Carlos's Decision: Sell Cocoa Futures</text>
      <text x="300" y="35" textAnchor="middle" fontSize="8" fill="#373A41">He agrees TODAY to sell 100 tons at $3,000/ton in September = $300,000 guaranteed</text>
    </g>
    
    {/* Scenario 1: Price drops */}
    <g transform="translate(50, 205)">
      <rect x="0" y="0" width="290" height="145" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="2"/>
      <text x="145" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#12805A">Scenario A: Price Drops</text>
      <text x="145" y="38" textAnchor="middle" fontSize="8" fill="#717680">Cocoa falls to $2,200/ton by September</text>
      
      <g transform="translate(15, 50)">
        <rect x="0" y="0" width="260" height="80" fill="white" rx="6"/>
        
        <text x="130" y="18" textAnchor="middle" fontSize="8" fill="#373A41">Without futures:</text>
        <text x="130" y="32" textAnchor="middle" fontSize="9" fill="#C7363B">$2,200 × 100 = $220,000 😟</text>
        
        <line x1="20" y1="42" x2="240" y2="42" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="130" y="56" textAnchor="middle" fontSize="8" fill="#373A41">With futures contract:</text>
        <text x="130" y="70" textAnchor="middle" fontSize="9" fill="#12805A" fontWeight="500">Still gets $300,000! 🎉</text>
      </g>
      
      <text x="145" y="140" textAnchor="middle" fontSize="8" fill="#12805A" fontWeight="500">Protected from the drop</text>
    </g>
    
    {/* Scenario 2: Price rises */}
    <g transform="translate(360, 205)">
      <rect x="0" y="0" width="290" height="145" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="145" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">Scenario B: Price Rises</text>
      <text x="145" y="38" textAnchor="middle" fontSize="8" fill="#717680">Cocoa rises to $4,000/ton by September</text>
      
      <g transform="translate(15, 50)">
        <rect x="0" y="0" width="260" height="80" fill="white" rx="6"/>
        
        <text x="130" y="18" textAnchor="middle" fontSize="8" fill="#373A41">Without futures:</text>
        <text x="130" y="32" textAnchor="middle" fontSize="9" fill="#12805A">$4,000 × 100 = $400,000 🎉</text>
        
        <line x1="20" y1="42" x2="240" y2="42" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="130" y="56" textAnchor="middle" fontSize="8" fill="#373A41">With futures contract:</text>
        <text x="130" y="70" textAnchor="middle" fontSize="9" fill="#C7363B" fontWeight="500">Still gets only $300,000 😐</text>
      </g>
      
      <text x="145" y="140" textAnchor="middle" fontSize="8" fill="#C7363B" fontWeight="500">Missed $100,000 in gains</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="50" y="360" width="600" height="30" fill="#2A2A2C" rx="6"/>
    <text x="350" y="373" textAnchor="middle" fontSize="9" fill="white">This is the trade-off: Futures give you certainty, but you give up potential gains.</text>
    <text x="350" y="386" textAnchor="middle" fontSize="8" fill="#A0A3AA">For Carlos, knowing his income was worth more than the possibility of extra profit.</text>
  </svg>
);

// SVG 6: Common Futures Markets
const CommonFuturesSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">What Can You Trade Futures On?</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Futures exist for many different types of assets</text>
    
    {/* Categories */}
    <g transform="translate(50, 75)">
      {/* Commodities */}
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="140" height="160" fill="#EEF9F4" rx="10" stroke="#3CCB97" strokeWidth="1"/>
        <text x="70" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#12805A">Commodities</text>
        <text x="70" y="50" textAnchor="middle" fontSize="20">🛢️ 🌾 ☕</text>
        <text x="70" y="75" textAnchor="middle" fontSize="8" fill="#717680">Oil, Natural Gas</text>
        <text x="70" y="90" textAnchor="middle" fontSize="8" fill="#717680">Wheat, Corn, Soybeans</text>
        <text x="70" y="105" textAnchor="middle" fontSize="8" fill="#717680">Coffee, Cocoa, Sugar</text>
        <text x="70" y="120" textAnchor="middle" fontSize="8" fill="#717680">Gold, Silver, Copper</text>
        <text x="70" y="145" textAnchor="middle" fontSize="7" fill="#12805A">Physical goods</text>
      </g>
      
      {/* Indices */}
      <g transform="translate(155, 0)">
        <rect x="0" y="0" width="140" height="160" fill="#E0E7F1" rx="10" stroke="#9FB3D3" strokeWidth="1"/>
        <text x="70" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#344C72">Stock Indices</text>
        <text x="70" y="50" textAnchor="middle" fontSize="20">📊 📈 📉</text>
        <text x="70" y="75" textAnchor="middle" fontSize="8" fill="#717680">S&P 500</text>
        <text x="70" y="90" textAnchor="middle" fontSize="8" fill="#717680">Dow Jones</text>
        <text x="70" y="105" textAnchor="middle" fontSize="8" fill="#717680">Nasdaq</text>
        <text x="70" y="120" textAnchor="middle" fontSize="8" fill="#717680">Nifty 50, Bank Nifty</text>
        <text x="70" y="145" textAnchor="middle" fontSize="7" fill="#344C72">Market benchmarks</text>
      </g>
      
      {/* Currencies */}
      <g transform="translate(310, 0)">
        <rect x="0" y="0" width="140" height="160" fill="#F6ECCE" rx="10" stroke="#E2C273" strokeWidth="1"/>
        <text x="70" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B26">Currencies</text>
        <text x="70" y="50" textAnchor="middle" fontSize="20">💵 💶 💷</text>
        <text x="70" y="75" textAnchor="middle" fontSize="8" fill="#717680">Euro/USD</text>
        <text x="70" y="90" textAnchor="middle" fontSize="8" fill="#717680">GBP/USD</text>
        <text x="70" y="105" textAnchor="middle" fontSize="8" fill="#717680">USD/JPY</text>
        <text x="70" y="120" textAnchor="middle" fontSize="8" fill="#717680">USD/INR</text>
        <text x="70" y="145" textAnchor="middle" fontSize="7" fill="#533E22">Exchange rates</text>
      </g>
      
      {/* Interest Rates */}
      <g transform="translate(465, 0)">
        <rect x="0" y="0" width="140" height="160" fill="#ECE4F6" rx="10" stroke="#C0A9E2" strokeWidth="1"/>
        <text x="70" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#7A5BA6">Interest Rates</text>
        <text x="70" y="50" textAnchor="middle" fontSize="20">🏦 📋 💰</text>
        <text x="70" y="75" textAnchor="middle" fontSize="8" fill="#717680">Treasury Bonds</text>
        <text x="70" y="90" textAnchor="middle" fontSize="8" fill="#717680">Government Securities</text>
        <text x="70" y="105" textAnchor="middle" fontSize="8" fill="#717680">Eurodollars</text>
        <text x="70" y="120" textAnchor="middle" fontSize="8" fill="#717680">Fed Funds Rate</text>
        <text x="70" y="145" textAnchor="middle" fontSize="7" fill="#533F70">Debt instruments</text>
      </g>
    </g>
    
    {/* Bottom note */}
    <rect x="100" y="245" width="500" height="25" fill="#717680" rx="6"/>
    <text x="350" y="262" textAnchor="middle" fontSize="9" fill="white">Each market has professionals who use it for legitimate business purposes.</text>
  </svg>
);

// SVG 7: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 160" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="160" fill="url(#takeawayGradDeriv2)" rx="16"/>
    
    <defs>
      <linearGradient id="takeawayGradDeriv2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B8923F"/>
        <stop offset="100%" stopColor="#C0623B"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="35" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">🎯 Key Takeaway</text>
    <text x="350" y="60" textAnchor="middle" fontSize="12" fill="white">A futures contract is a binding agreement to buy or sell at a set price on a future date.</text>
    <text x="350" y="85" textAnchor="middle" fontSize="11" fill="#F6ECCE">Both parties MUST complete the transaction — there's no backing out.</text>
    <text x="350" y="110" textAnchor="middle" fontSize="10" fill="#F0C2A9">Futures were invented to help businesses manage price uncertainty (hedging).</text>
    <text x="350" y="135" textAnchor="middle" fontSize="10" fill="#E2C273">The trade-off: You get certainty, but you give up potential gains if prices move in your favor.</text>
  </svg>
);

// SVG 8: Warning Banner
const WarningBannerSVG = () => (
  <svg viewBox="0 0 700 80" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="80" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
    
    {/* Warning icon */}
    <g transform="translate(30, 25)">
      <polygon points="15,0 30,26 0,26" fill="#C7363B"/>
      <text x="15" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">!</text>
    </g>
    
    {/* Text */}
    <text x="80" y="35" fontSize="11" fontWeight="600" fill="#C7363B">Remember: This is Awareness Education</text>
    <text x="80" y="55" fontSize="9" fill="#842428">Understanding futures doesn't mean you should trade them. The obligation aspect makes them risky.</text>
    <text x="80" y="70" fontSize="8" fill="#A52A2F">We're covering concepts, not strategies. Most individual futures traders lose money.</text>
  </svg>
);

const DerivLesson2 = () => {
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const quizQuestions = [
    {
      id: 1,
      question: "What is a futures contract?",
      options: [
        "A loan from a bank",
        "An agreement to buy or sell something at a set price on a future date",
        "A type of savings account",
        "Insurance for your investments"
      ],
      correct: 1,
      explanation: "A futures contract is an agreement made today to buy or sell an asset at a predetermined price on a specific future date. Both parties are obligated to complete the transaction."
    },
    {
      id: 2,
      question: "What happens if you enter a futures contract and the price moves against you?",
      options: [
        "You can cancel the contract for free",
        "The contract automatically adjusts to the new price",
        "You must still complete the deal at the agreed price",
        "Nothing — futures have no risk"
      ],
      correct: 2,
      explanation: "Futures contracts are binding obligations. Once you enter a contract, you MUST complete the transaction at the agreed price, even if the market price has moved against you. This is what makes futures risky."
    }
  ];

  const handleAnswer = (questionId, answerIndex) => {
    setQuizAnswers({ ...quizAnswers, [questionId]: answerIndex });
    setShowResults({ ...showResults, [questionId]: true });
  };

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 pt-24 pb-8 px-4">
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
                Lesson 2 of 7 – Awareness Only
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-800 mb-2 tracking-[-0.025em]">What Are Futures?</h1>
            <p className="text-gray-600 text-lg">
              Understanding agreements about the future.
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mb-8">
          <WarningBannerSVG />
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.025em]">What Is a Futures Contract?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              A <strong>futures contract</strong> is a simple idea: two parties agree 
              <strong> today</strong> on a price for something that will be bought or sold 
              <strong> later</strong>.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Think of it like making a reservation. You call a restaurant and book a table 
              for next Saturday. You've agreed on when you'll arrive — you can't just not 
              show up.
            </p>
            <p className="text-lg leading-relaxed">
              A futures contract works similarly, except instead of a dinner reservation, 
              it's an agreement about buying or selling an asset at a specific price on 
              a specific future date.
            </p>
          </div>
          
          <WhatIsFuturesSVG />
        </div>

        {/* The Obligation */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">The Key Feature: It's an Obligation</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              The most important thing to understand about futures is that they create 
              an <strong>obligation</strong>. Once you enter a futures contract, you 
              <strong> must</strong> follow through.
            </p>
            <p className="text-lg leading-relaxed">
              This is different from options (which we'll cover next), where you have 
              a choice. With futures, there's no backing out.
            </p>
          </div>
          
          <ObligationSVG />
          
          <div className="mt-6 bg-red-50 rounded-xl p-5 border border-red-200">
            <p className="text-red-800">
              <strong>Why this matters:</strong> If you agree to buy something at $100 
              and the price drops to $50, you still have to pay $100. If you agree to 
              sell at $100 and the price rises to $150, you still only get $100. 
              The obligation goes both ways.
            </p>
          </div>
        </div>

        {/* Why Futures Exist */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Why Were Futures Invented?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Futures weren't invented for trading or speculation. They were created to 
              solve a real business problem: <strong>price uncertainty</strong>.
            </p>
            <p className="text-lg leading-relaxed">
              Businesses that depend on commodities — farmers, airlines, food companies — 
              need to plan ahead. But how can you plan if you don't know what prices 
              will be in six months?
            </p>
          </div>
          
          <WhyFuturesExistSVG />
        </div>

        {/* Two Sides */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">The Two Sides of Every Trade</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Every futures contract has two parties: someone who wants to <strong>reduce 
              risk</strong> (a hedger) and someone willing to <strong>take on risk</strong> 
              (often a speculator).
            </p>
            <p className="text-lg leading-relaxed">
              Hedgers created the need for these markets. Speculators provide the 
              liquidity that makes them work. Understanding which category you fall 
              into is crucial.
            </p>
          </div>
          
          <TwoSidesSVG />
          
          <div className="mt-6 bg-amber-50 rounded-xl p-5 border border-amber-200">
            <p className="text-amber-800">
              <strong>Important question:</strong> If you're not a farmer protecting 
              your harvest or an airline locking in fuel costs, which side of this 
              trade would you be on?
            </p>
          </div>
        </div>

        {/* Global Example */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Real-World Example</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Let's see how this works with a practical example that shows both 
              the protection and the trade-off of using futures.
            </p>
          </div>
          
          <GlobalExampleSVG />
          
          <div className="mt-6 bg-brand-soft rounded-xl p-5 border border-brand-line">
            <p className="text-brand">
              <strong>The lesson:</strong> Carlos traded the possibility of higher 
              gains for the certainty of a guaranteed price. For a farmer who needs 
              predictable income to pay workers and buy supplies, this trade-off 
              often makes sense. For a speculator, the calculation is very different.
            </p>
          </div>
        </div>

        {/* Common Futures */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">What Can You Trade Futures On?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Futures exist for many different types of assets. Each market serves 
              different industries and purposes.
            </p>
          </div>
          
          <CommonFuturesSVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
        </div>

        {/* India Context */}
        <div className="bg-amber-50 rounded-2xl p-6 shadow-lg mb-8 border border-amber-200">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">🇮🇳 India-Specific Note</h3>
          <p className="text-amber-900 mb-3">
            In India, index futures (like Nifty 50 and Bank Nifty futures) are among the 
            most actively traded derivatives in the world. Stock futures on individual 
            companies are also available on NSE.
          </p>
          <p className="text-amber-800 text-sm">
            While futures were designed for hedging, the vast majority of trading volume 
            in India comes from speculation. SEBI data consistently shows that most 
            individual traders in the F&O segment lose money — which is why awareness 
            education matters.
          </p>
        </div>

        {/* Knowledge Check */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">📝 Knowledge Check</h2>
          <p className="text-gray-600 mb-6">Test your understanding of futures basics.</p>
          
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
                            ? 'border-brand bg-brand-soft'
                            : quizAnswers[q.id] === index
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 bg-white'
                          : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={showResults[q.id] && index === q.correct ? 'text-brand font-medium' : ''}>
                          {option}
                        </span>
                        {showResults[q.id] && index === q.correct && (
                          <FaCheckCircle className="text-brand" />
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
                    quizAnswers[q.id] === q.correct ? 'bg-brand-soft' : 'bg-amber-100'
                  }`}>
                    <p className={quizAnswers[q.id] === q.correct ? 'text-brand' : 'text-amber-800'}>
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
        <div className="rounded-2xl p-8 shadow-lg mb-8 text-white bg-brand-fill">
          <div className="flex items-center gap-3 mb-4">
            <FaLightbulb className="text-2xl text-amber-200" />
            <h3 className="text-xl font-semibold">Reflection Question</h3>
          </div>
          <div className="bg-white/20 rounded-xl p-5">
            <p className="text-white font-medium mb-3">Think about this:</p>
            <p className="text-amber-100 text-lg mb-4">
              "If you were a wheat farmer, would you prefer the certainty of a guaranteed 
              price or the possibility of selling at whatever the market price is at harvest?"
            </p>
            <p className="text-amber-200 text-sm">
              Consider: What would your answer be if you were NOT a farmer but just 
              someone betting on wheat prices? How does your purpose change the answer?
            </p>
          </div>
        </div>

        {/* Lesson Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📚 Lesson Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">What You Learned</h4>
              <ul className="text-amber-700 text-sm space-y-1">
                <li>✓ Futures are agreements to buy/sell at a future date</li>
                <li>✓ They create obligations — no backing out</li>
                <li>✓ They were invented for hedging (price certainty)</li>
                <li>✓ Trade-off: certainty vs. potential gains</li>
              </ul>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Coming Next</h4>
              <ul className="text-orange-700 text-sm space-y-1">
                <li>→ Lesson 3: Understanding Options</li>
                <li>→ What options contracts are</li>
                <li>→ How they differ from futures (choice vs. obligation)</li>
                <li>→ Why they cost money upfront (premium)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            to="/learn/deriv-lesson-1"
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Previous: What Are Derivatives?</span>
          </Link>
          <Link
            to="/learn/deriv-lesson-3"
            className="flex items-center gap-2 bg-brand-fill hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <span>Next: What Are Options?</span>
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default DerivLesson2;
