import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

// ============================================
// TAX LESSON 3: CAPITAL GAINS – SIMPLE IDEA
// ============================================

// SVG 1: What Is a Capital Gain?
const WhatIsCapitalGainSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F1F4F9" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#2C3F5E">What Is a Capital Gain?</text>
    
    {/* Simple equation visual */}
    <g transform="translate(50, 60)">
      {/* Buy box */}
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="150" height="120" fill="white" rx="12" stroke="#5A77AA" strokeWidth="2"/>
        <text x="75" y="35" textAnchor="middle" fontSize="24">🛒</text>
        <text x="75" y="60" textAnchor="middle" fontSize="12" fontWeight="600" fill="#2C3F5E">You Buy Something</text>
        <text x="75" y="80" textAnchor="middle" fontSize="11" fill="#555A63">Stock, property, etc.</text>
        <rect x="25" y="90" width="100" height="22" fill="#E0E7F1" rx="5"/>
        <text x="75" y="105" textAnchor="middle" fontSize="11" fontWeight="600" fill="#2C3F5E">$1,000</text>
      </g>
      
      {/* Arrow */}
      <g transform="translate(165, 50)">
        <line x1="0" y1="20" x2="60" y2="20" stroke="#717680" strokeWidth="2" strokeDasharray="5,3"/>
        <text x="30" y="10" textAnchor="middle" fontSize="9" fill="#717680">Time passes</text>
      </g>
      
      {/* Sell box */}
      <g transform="translate(240, 0)">
        <rect x="0" y="0" width="150" height="120" fill="white" rx="12" stroke="#12805A" strokeWidth="2"/>
        <text x="75" y="35" textAnchor="middle" fontSize="24">💰</text>
        <text x="75" y="60" textAnchor="middle" fontSize="12" fontWeight="600" fill="#12805A">You Sell It</text>
        <text x="75" y="80" textAnchor="middle" fontSize="11" fill="#555A63">For more than you paid</text>
        <rect x="25" y="90" width="100" height="22" fill="#EEF9F4" rx="5"/>
        <text x="75" y="105" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">$1,500</text>
      </g>
      
      {/* Equals */}
      <g transform="translate(405, 50)">
        <circle cx="15" cy="20" r="18" fill="#2C3F5E"/>
        <text x="15" y="26" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">=</text>
      </g>
      
      {/* Gain box */}
      <g transform="translate(450, 0)">
        <rect x="0" y="0" width="150" height="120" fill="#F6ECCE" rx="12" stroke="#B8923F" strokeWidth="2"/>
        <text x="75" y="35" textAnchor="middle" fontSize="24">📈</text>
        <text x="75" y="60" textAnchor="middle" fontSize="12" fontWeight="600" fill="#654B26">Capital Gain</text>
        <text x="75" y="80" textAnchor="middle" fontSize="11" fill="#555A63">The profit you made</text>
        <rect x="25" y="90" width="100" height="22" fill="#EDD89D" rx="5"/>
        <text x="75" y="105" textAnchor="middle" fontSize="11" fontWeight="600" fill="#654B26">$500</text>
      </g>
    </g>
    
    {/* Definition */}
    <g transform="translate(50, 200)">
      <rect x="0" y="0" width="600" height="60" fill="#E0E7F1" rx="10"/>
      <text x="300" y="25" textAnchor="middle" fontSize="12" fontWeight="600" fill="#2C3F5E">Simple Definition</text>
      <text x="300" y="45" textAnchor="middle" fontSize="11" fill="#2A2A2C">A capital gain is the profit you make when you sell something for more than you paid for it.</text>
    </g>
  </svg>
);

// SVG 2: Buy, Hold, Sell Cycle
const BuyHoldSellSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#EEF9F4" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#12805A">The Three Stages: Buy → Hold → Sell</text>
    
    {/* Stage 1: Buy */}
    <g transform="translate(50, 60)">
      <rect x="0" y="0" width="180" height="200" fill="white" rx="12" stroke="#5A77AA" strokeWidth="2"/>
      
      {/* Number badge */}
      <circle cx="20" cy="20" r="18" fill="#5A77AA"/>
      <text x="20" y="26" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">1</text>
      
      {/* Icon */}
      <g transform="translate(55, 40)">
        <rect x="0" y="0" width="70" height="50" fill="#E0E7F1" rx="8"/>
        <text x="35" y="35" textAnchor="middle" fontSize="28">🛒</text>
      </g>
      
      <text x="90" y="115" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#2C3F5E">BUY</text>
      <text x="90" y="135" textAnchor="middle" fontSize="10" fill="#555A63">You purchase an asset</text>
      <text x="90" y="150" textAnchor="middle" fontSize="10" fill="#555A63">(stock, property, etc.)</text>
      
      <text x="90" y="175" textAnchor="middle" fontSize="10" fill="#717680" fontStyle="italic">This is your "cost basis"</text>
      <text x="90" y="190" textAnchor="middle" fontSize="10" fill="#717680" fontStyle="italic">— what you paid</text>
    </g>
    
    {/* Arrow 1 */}
    <g transform="translate(240, 140)">
      <line x1="0" y1="20" x2="50" y2="20" stroke="#717680" strokeWidth="2"/>
      <polygon points="50,15 60,20 50,25" fill="#717680"/>
    </g>
    
    {/* Stage 2: Hold */}
    <g transform="translate(260, 60)">
      <rect x="0" y="0" width="180" height="200" fill="white" rx="12" stroke="#8F6FC4" strokeWidth="2"/>
      
      {/* Number badge */}
      <circle cx="20" cy="20" r="18" fill="#8F6FC4"/>
      <text x="20" y="26" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">2</text>
      
      {/* Icon */}
      <g transform="translate(55, 40)">
        <rect x="0" y="0" width="70" height="50" fill="#ECE4F6" rx="8"/>
        <text x="35" y="35" textAnchor="middle" fontSize="28">⏳</text>
      </g>
      
      <text x="90" y="115" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#7A5BA6">HOLD</text>
      <text x="90" y="135" textAnchor="middle" fontSize="10" fill="#555A63">You own it over time</text>
      <text x="90" y="150" textAnchor="middle" fontSize="10" fill="#555A63">Value may go up or down</text>
      
      <text x="90" y="175" textAnchor="middle" fontSize="10" fill="#717680" fontStyle="italic">No tax yet — you haven't</text>
      <text x="90" y="190" textAnchor="middle" fontSize="10" fill="#717680" fontStyle="italic">"realized" any gain</text>
    </g>
    
    {/* Arrow 2 */}
    <g transform="translate(450, 140)">
      <line x1="0" y1="20" x2="50" y2="20" stroke="#717680" strokeWidth="2"/>
      <polygon points="50,15 60,20 50,25" fill="#717680"/>
    </g>
    
    {/* Stage 3: Sell */}
    <g transform="translate(470, 60)">
      <rect x="0" y="0" width="180" height="200" fill="white" rx="12" stroke="#12805A" strokeWidth="2"/>
      
      {/* Number badge */}
      <circle cx="20" cy="20" r="18" fill="#12805A"/>
      <text x="20" y="26" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">3</text>
      
      {/* Icon */}
      <g transform="translate(55, 40)">
        <rect x="0" y="0" width="70" height="50" fill="#EEF9F4" rx="8"/>
        <text x="35" y="35" textAnchor="middle" fontSize="28">💵</text>
      </g>
      
      <text x="90" y="115" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#12805A">SELL</text>
      <text x="90" y="135" textAnchor="middle" fontSize="10" fill="#555A63">You sell the asset</text>
      <text x="90" y="150" textAnchor="middle" fontSize="10" fill="#555A63">Profit or loss is "realized"</text>
      
      <text x="90" y="175" textAnchor="middle" fontSize="10" fill="#717680" fontStyle="italic">Now tax may apply</text>
      <text x="90" y="190" textAnchor="middle" fontSize="10" fill="#717680" fontStyle="italic">on your gain</text>
    </g>
    
    {/* Bottom note */}
    <text x="350" y="285" textAnchor="middle" fontSize="11" fill="#373A41" fontWeight="600">Key Insight: Tax typically applies only when you SELL — not while you hold</text>
    <text x="350" y="305" textAnchor="middle" fontSize="10" fill="#717680">This is called "realizing" your gain</text>
  </svg>
);

// SVG 3: Gain vs Loss
const GainVsLossSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F6F2FB" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#7A5BA6">Capital Gain vs Capital Loss</text>
    
    {/* Gain side */}
    <g transform="translate(50, 55)">
      <rect x="0" y="0" width="280" height="200" fill="white" rx="12" stroke="#12805A" strokeWidth="2"/>
      
      {/* Header */}
      <rect x="0" y="0" width="280" height="40" fill="#12805A" rx="12"/>
      <rect x="0" y="20" width="280" height="20" fill="#12805A"/>
      <text x="140" y="27" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">📈 Capital GAIN</text>
      
      {/* Content */}
      <g transform="translate(20, 55)">
        <text x="0" y="15" fontSize="11" fill="#373A41">When you sell for <tspan fontWeight="600" fill="#12805A">MORE</tspan> than you paid</text>
        
        <g transform="translate(0, 35)">
          <rect x="0" y="0" width="110" height="35" fill="#E0E7F1" rx="6"/>
          <text x="55" y="15" textAnchor="middle" fontSize="9" fill="#2C3F5E">Bought at</text>
          <text x="55" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#2C3F5E">$1,000</text>
        </g>
        
        <g transform="translate(130, 35)">
          <rect x="0" y="0" width="110" height="35" fill="#EEF9F4" rx="6"/>
          <text x="55" y="15" textAnchor="middle" fontSize="9" fill="#12805A">Sold at</text>
          <text x="55" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">$1,500</text>
        </g>
        
        <g transform="translate(40, 85)">
          <rect x="0" y="0" width="160" height="40" fill="#EEF9F4" rx="8" stroke="#12805A" strokeWidth="2"/>
          <text x="80" y="17" textAnchor="middle" fontSize="10" fill="#12805A">Capital Gain</text>
          <text x="80" y="32" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#12805A">+$500 Profit</text>
        </g>
        
        <text x="120" y="145" textAnchor="middle" fontSize="9" fill="#717680" fontStyle="italic">May be taxed</text>
      </g>
    </g>
    
    {/* VS circle */}
    <g transform="translate(335, 140)">
      <circle cx="15" cy="15" r="20" fill="#7A5BA6"/>
      <text x="15" y="21" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">VS</text>
    </g>
    
    {/* Loss side */}
    <g transform="translate(370, 55)">
      <rect x="0" y="0" width="280" height="200" fill="white" rx="12" stroke="#E04848" strokeWidth="2"/>
      
      {/* Header */}
      <rect x="0" y="0" width="280" height="40" fill="#E04848" rx="12"/>
      <rect x="0" y="20" width="280" height="20" fill="#E04848"/>
      <text x="140" y="27" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">📉 Capital LOSS</text>
      
      {/* Content */}
      <g transform="translate(20, 55)">
        <text x="0" y="15" fontSize="11" fill="#373A41">When you sell for <tspan fontWeight="600" fill="#E04848">LESS</tspan> than you paid</text>
        
        <g transform="translate(0, 35)">
          <rect x="0" y="0" width="110" height="35" fill="#E0E7F1" rx="6"/>
          <text x="55" y="15" textAnchor="middle" fontSize="9" fill="#2C3F5E">Bought at</text>
          <text x="55" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#2C3F5E">$1,000</text>
        </g>
        
        <g transform="translate(130, 35)">
          <rect x="0" y="0" width="110" height="35" fill="#FBE1E1" rx="6"/>
          <text x="55" y="15" textAnchor="middle" fontSize="9" fill="#C7363B">Sold at</text>
          <text x="55" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">$700</text>
        </g>
        
        <g transform="translate(40, 85)">
          <rect x="0" y="0" width="160" height="40" fill="#FBE1E1" rx="8" stroke="#E04848" strokeWidth="2"/>
          <text x="80" y="17" textAnchor="middle" fontSize="10" fill="#C7363B">Capital Loss</text>
          <text x="80" y="32" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#C7363B">-$300 Loss</text>
        </g>
        
        <text x="120" y="145" textAnchor="middle" fontSize="9" fill="#717680" fontStyle="italic">May offset gains</text>
      </g>
    </g>
  </svg>
);

// SVG 4: Why Governments Tax Capital Gains
const WhyTaxedSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F6ECCE" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#654B26">Why Do Governments Tax Capital Gains?</text>
    
    {/* Reason 1 */}
    <g transform="translate(50, 55)">
      <rect x="0" y="0" width="280" height="110" fill="white" rx="12" stroke="#B8923F" strokeWidth="2"/>
      <circle cx="35" cy="35" r="22" fill="#B8923F"/>
      <text x="35" y="42" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">1</text>
      
      <text x="70" y="32" fontSize="12" fontWeight="600" fill="#654B26">It's Still Income</text>
      <text x="20" y="55" fontSize="10" fill="#555A63">Whether you work for money or your</text>
      <text x="20" y="70" fontSize="10" fill="#555A63">investments earn it, it increases your</text>
      <text x="20" y="85" fontSize="10" fill="#555A63">wealth. Governments see this as a form</text>
      <text x="20" y="100" fontSize="10" fill="#555A63">of income that should be taxed.</text>
    </g>
    
    {/* Reason 2 */}
    <g transform="translate(370, 55)">
      <rect x="0" y="0" width="280" height="110" fill="white" rx="12" stroke="#B8923F" strokeWidth="2"/>
      <circle cx="35" cy="35" r="22" fill="#B8923F"/>
      <text x="35" y="42" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">2</text>
      
      <text x="70" y="32" fontSize="12" fontWeight="600" fill="#654B26">Fairness Principle</text>
      <text x="20" y="55" fontSize="10" fill="#555A63">If only workers paid tax but investors</text>
      <text x="20" y="70" fontSize="10" fill="#555A63">didn't, it wouldn't seem fair. Capital</text>
      <text x="20" y="85" fontSize="10" fill="#555A63">gains tax helps balance the tax burden</text>
      <text x="20" y="100" fontSize="10" fill="#555A63">across different types of earnings.</text>
    </g>
    
    {/* Reason 3 */}
    <g transform="translate(50, 180)">
      <rect x="0" y="0" width="280" height="110" fill="white" rx="12" stroke="#B8923F" strokeWidth="2"/>
      <circle cx="35" cy="35" r="22" fill="#B8923F"/>
      <text x="35" y="42" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">3</text>
      
      <text x="70" y="32" fontSize="12" fontWeight="600" fill="#654B26">Revenue for Services</text>
      <text x="20" y="55" fontSize="10" fill="#555A63">Taxes fund roads, schools, healthcare,</text>
      <text x="20" y="70" fontSize="10" fill="#555A63">and other public services. Capital gains</text>
      <text x="20" y="85" fontSize="10" fill="#555A63">tax is one source of this funding that</text>
      <text x="20" y="100" fontSize="10" fill="#555A63">helps governments provide for citizens.</text>
    </g>
    
    {/* Reason 4 */}
    <g transform="translate(370, 180)">
      <rect x="0" y="0" width="280" height="110" fill="white" rx="12" stroke="#B8923F" strokeWidth="2"/>
      <circle cx="35" cy="35" r="22" fill="#B8923F"/>
      <text x="35" y="42" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">4</text>
      
      <text x="70" y="32" fontSize="12" fontWeight="600" fill="#654B26">Economic Balance</text>
      <text x="20" y="55" fontSize="10" fill="#555A63">Without any tax on gains, speculation</text>
      <text x="20" y="70" fontSize="10" fill="#555A63">might increase. Some level of taxation</text>
      <text x="20" y="85" fontSize="10" fill="#555A63">can help encourage more thoughtful,</text>
      <text x="20" y="100" fontSize="10" fill="#555A63">long-term investment decisions.</text>
    </g>
  </svg>
);

// SVG 5: Global Example - Lisa's Stock
const GlobalExampleSVG = () => (
  <svg viewBox="0 0 700 400" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="400" fill="#F1F4F9" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#2C3F5E">Example: Lisa's Stock Investment</text>
    
    {/* Lisa character */}
    <g transform="translate(50, 55)">
      <circle cx="40" cy="25" r="22" fill="#5A77AA"/>
      <circle cx="33" cy="20" r="3" fill="white"/>
      <circle cx="47" cy="20" r="3" fill="white"/>
      <path d="M32 32 Q40 38 48 32" stroke="white" strokeWidth="2" fill="none"/>
      <rect x="22" y="50" width="36" height="40" fill="#5A77AA" rx="4"/>
      <text x="95" y="35" fontSize="14" fontWeight="600" fill="#2C3F5E">Lisa</text>
      <text x="95" y="55" fontSize="11" fill="#555A63">New investor learning</text>
      <text x="95" y="70" fontSize="11" fill="#555A63">about capital gains</text>
    </g>
    
    {/* Timeline */}
    <g transform="translate(50, 130)">
      {/* Timeline line */}
      <line x1="0" y1="60" x2="600" y2="60" stroke="#CFD0D3" strokeWidth="3"/>
      
      {/* Step 1: Buy */}
      <g transform="translate(0, 0)">
        <circle cx="0" cy="60" r="12" fill="#5A77AA"/>
        <text x="0" y="64" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">1</text>
        
        <rect x="-60" y="80" width="120" height="75" fill="white" rx="8" stroke="#5A77AA" strokeWidth="1"/>
        <text x="0" y="100" textAnchor="middle" fontSize="10" fontWeight="600" fill="#2C3F5E">January 2023</text>
        <text x="0" y="118" textAnchor="middle" fontSize="9" fill="#555A63">Lisa buys 10 shares</text>
        <text x="0" y="132" textAnchor="middle" fontSize="9" fill="#555A63">of TechCorp stock</text>
        <text x="0" y="148" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2C3F5E">$100/share = $1,000</text>
      </g>
      
      {/* Step 2: Hold */}
      <g transform="translate(300, 0)">
        <circle cx="0" cy="60" r="12" fill="#8F6FC4"/>
        <text x="0" y="64" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">2</text>
        
        <rect x="-60" y="80" width="120" height="75" fill="white" rx="8" stroke="#8F6FC4" strokeWidth="1"/>
        <text x="0" y="100" textAnchor="middle" fontSize="10" fontWeight="600" fill="#7A5BA6">Throughout 2023</text>
        <text x="0" y="118" textAnchor="middle" fontSize="9" fill="#555A63">Lisa holds her shares</text>
        <text x="0" y="132" textAnchor="middle" fontSize="9" fill="#555A63">Stock price goes up!</text>
        <text x="0" y="148" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#7A5BA6">No tax yet ⏳</text>
      </g>
      
      {/* Step 3: Sell */}
      <g transform="translate(600, 0)">
        <circle cx="0" cy="60" r="12" fill="#12805A"/>
        <text x="0" y="64" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">3</text>
        
        <rect x="-60" y="80" width="120" height="75" fill="white" rx="8" stroke="#12805A" strokeWidth="1"/>
        <text x="0" y="100" textAnchor="middle" fontSize="10" fontWeight="600" fill="#12805A">December 2023</text>
        <text x="0" y="118" textAnchor="middle" fontSize="9" fill="#555A63">Lisa sells all shares</text>
        <text x="0" y="132" textAnchor="middle" fontSize="9" fill="#555A63">at the higher price</text>
        <text x="0" y="148" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#12805A">$150/share = $1,500</text>
      </g>
    </g>
    
    {/* Result box */}
    <g transform="translate(150, 310)">
      <rect x="0" y="0" width="400" height="70" fill="white" rx="12" stroke="#2C3F5E" strokeWidth="2"/>
      
      <g transform="translate(20, 15)">
        <text x="0" y="15" fontSize="11" fill="#555A63">Cost (what Lisa paid):</text>
        <text x="140" y="15" fontSize="11" fontWeight="600" fill="#2C3F5E">$1,000</text>
        
        <text x="0" y="35" fontSize="11" fill="#555A63">Sale price:</text>
        <text x="140" y="35" fontSize="11" fontWeight="600" fill="#12805A">$1,500</text>
        
        <text x="0" y="55" fontSize="12" fontWeight="600" fill="#373A41">Capital Gain:</text>
        <text x="140" y="55" fontSize="12" fontWeight="bold" fill="#12805A">$500</text>
      </g>
      
      <g transform="translate(220, 15)">
        <rect x="0" y="0" width="160" height="50" fill="#F6ECCE" rx="8"/>
        <text x="80" y="20" textAnchor="middle" fontSize="10" fill="#654B26">This $500 gain may be</text>
        <text x="80" y="35" textAnchor="middle" fontSize="10" fill="#654B26">subject to capital gains tax</text>
      </g>
    </g>
  </svg>
);

// SVG 6: Unrealized vs Realized
const UnrealizedVsRealizedSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#2C3F5E">Important: Unrealized vs Realized Gains</text>
    
    {/* Unrealized side */}
    <g transform="translate(50, 55)">
      <rect x="0" y="0" width="280" height="195" fill="white" rx="12" stroke="#717680" strokeWidth="2" strokeDasharray="5,3"/>
      
      {/* Header */}
      <rect x="0" y="0" width="280" height="40" fill="#A0A3AA" rx="12"/>
      <rect x="0" y="20" width="280" height="20" fill="#A0A3AA"/>
      <text x="140" y="27" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">🔒 Unrealized Gain</text>
      
      {/* Content */}
      <g transform="translate(20, 55)">
        <text x="120" y="15" textAnchor="middle" fontSize="11" fontWeight="600" fill="#373A41">"Paper profit"</text>
        
        <text x="0" y="40" fontSize="10" fill="#555A63">• Value has increased on paper</text>
        <text x="0" y="58" fontSize="10" fill="#555A63">• You still own the asset</text>
        <text x="0" y="76" fontSize="10" fill="#555A63">• Haven't sold yet</text>
        
        <rect x="20" y="95" width="200" height="35" fill="#EEEEF1" rx="6"/>
        <text x="120" y="110" textAnchor="middle" fontSize="10" fill="#717680">Generally NOT taxed</text>
        <text x="120" y="123" textAnchor="middle" fontSize="10" fill="#717680">(until you sell)</text>
      </g>
    </g>
    
    {/* Arrow between */}
    <g transform="translate(340, 140)">
      <line x1="0" y1="0" x2="30" y2="0" stroke="#2C3F5E" strokeWidth="3"/>
      <polygon points="30,-6 42,0 30,6" fill="#2C3F5E"/>
      <text x="21" y="20" textAnchor="middle" fontSize="9" fill="#2C3F5E" fontWeight="600">SELL</text>
    </g>
    
    {/* Realized side */}
    <g transform="translate(370, 55)">
      <rect x="0" y="0" width="280" height="195" fill="white" rx="12" stroke="#12805A" strokeWidth="2"/>
      
      {/* Header */}
      <rect x="0" y="0" width="280" height="40" fill="#12805A" rx="12"/>
      <rect x="0" y="20" width="280" height="20" fill="#12805A"/>
      <text x="140" y="27" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">✓ Realized Gain</text>
      
      {/* Content */}
      <g transform="translate(20, 55)">
        <text x="120" y="15" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">"Actual profit"</text>
        
        <text x="0" y="40" fontSize="10" fill="#555A63">• You've sold the asset</text>
        <text x="0" y="58" fontSize="10" fill="#555A63">• Profit is now real cash</text>
        <text x="0" y="76" fontSize="10" fill="#555A63">• Transaction is complete</text>
        
        <rect x="20" y="95" width="200" height="35" fill="#EEF9F4" rx="6"/>
        <text x="120" y="110" textAnchor="middle" fontSize="10" fill="#12805A">May be taxed</text>
        <text x="120" y="123" textAnchor="middle" fontSize="10" fill="#12805A">(depending on rules)</text>
      </g>
    </g>
  </svg>
);

// SVG 7: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 160" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="160" fill="#E0E7F1" rx="16" stroke="#5A77AA" strokeWidth="2"/>
    
    {/* Lightbulb icon */}
    <g transform="translate(40, 50)">
      <circle cx="30" cy="30" r="28" fill="#5A77AA"/>
      <circle cx="30" cy="25" r="15" fill="#CDAA5F" stroke="#B8923F" strokeWidth="2"/>
      <rect x="24" y="42" width="12" height="8" fill="#CDAA5F"/>
      <line x1="24" y1="52" x2="36" y2="52" stroke="#B8923F" strokeWidth="2"/>
      <line x1="26" y1="55" x2="34" y2="55" stroke="#B8923F" strokeWidth="2"/>
    </g>
    
    {/* Key takeaway text */}
    <g transform="translate(110, 30)">
      <text x="0" y="15" fontSize="14" fontWeight="bold" fill="#2C3F5E">Key Takeaway</text>
      <text x="0" y="42" fontSize="11" fill="#2A2A2C">A capital gain is simply the profit you make when you sell something for more</text>
      <text x="0" y="59" fontSize="11" fill="#2A2A2C">than you paid. It becomes taxable when you "realize" it by actually selling.</text>
      <text x="0" y="85" fontSize="11" fontWeight="600" fill="#2C3F5E">Remember: Holding an asset that increases in value is not the same as having</text>
      <text x="0" y="102" fontSize="11" fontWeight="600" fill="#2C3F5E">a taxable gain. Tax typically applies only when you sell.</text>
    </g>
  </svg>
);

// SVG 8: India Note
const IndiaNotesSVG = () => (
  <svg viewBox="0 0 700 180" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="180" fill="#FCF3EE" rx="16" stroke="#E3906B" strokeWidth="2"/>
    
    {/* India flag icon */}
    <g transform="translate(30, 25)">
      <rect x="0" y="0" width="60" height="15" fill="#FF9933"/>
      <rect x="0" y="15" width="60" height="15" fill="white"/>
      <rect x="0" y="30" width="60" height="15" fill="#138808"/>
      <circle cx="30" cy="22.5" r="6" fill="none" stroke="#000080" strokeWidth="1"/>
    </g>
    
    {/* Title */}
    <text x="110" y="45" fontSize="14" fontWeight="bold" fill="#9C4D2E">India-Specific Note</text>
    
    {/* Content */}
    <g transform="translate(30, 70)">
      <circle cx="8" cy="8" r="4" fill="#E3906B"/>
      <text x="22" y="12" fontSize="10" fill="#663524"><tspan fontWeight="600">Capital Gains in India:</tspan> Governed by the Income Tax Act under a separate head</text>
      
      <circle cx="8" cy="33" r="4" fill="#E3906B"/>
      <text x="22" y="37" fontSize="10" fill="#663524"><tspan fontWeight="600">Short-term vs Long-term:</tspan> India distinguishes based on how long you held the asset</text>
      
      <circle cx="8" cy="58" r="4" fill="#E3906B"/>
      <text x="22" y="62" fontSize="10" fill="#663524"><tspan fontWeight="600">Different Asset Classes:</tspan> Stocks, property, gold, and debt have different holding periods</text>
      
      <circle cx="8" cy="83" r="4" fill="#E3906B"/>
      <text x="22" y="87" fontSize="10" fill="#663524"><tspan fontWeight="600">STT Factor:</tspan> Securities Transaction Tax is already paid when buying/selling listed securities</text>
    </g>
    
    {/* Note */}
    <text x="350" y="168" textAnchor="middle" fontSize="9" fill="#7D3F28" fontStyle="italic">Rules change often. Verify current regulations with a tax professional.</text>
  </svg>
);

// SVG 9: Disclaimer Banner
const DisclaimerBannerSVG = () => (
  <svg viewBox="0 0 700 80" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="80" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
    
    {/* Warning icon */}
    <g transform="translate(25, 25)">
      <circle cx="15" cy="15" r="15" fill="#B8923F"/>
      <text x="15" y="21" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">!</text>
    </g>
    
    {/* Text */}
    <text x="70" y="32" fontSize="11" fontWeight="600" fill="#654B26">Educational Awareness Only</text>
    <text x="70" y="50" fontSize="9" fill="#533E22">This lesson explains the basic concept of capital gains. Actual tax treatment depends on your country's laws,</text>
    <text x="70" y="65" fontSize="9" fill="#533E22">holding periods, asset types, and personal circumstances. Consult a tax professional for specific advice.</text>
  </svg>
);

const TaxLesson3 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const handleAnswerSelect = (questionId, answer) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const checkAnswer = (questionId) => {
    setShowResults(prev => ({ ...prev, [questionId]: true }));
  };

  const quizQuestions = [
    {
      id: 'q1',
      question: 'What is a capital gain?',
      options: [
        { id: 'a', text: 'Any money you receive from investments' },
        { id: 'b', text: 'The profit you make when you sell something for more than you paid' },
        { id: 'c', text: 'The total value of all your investments' },
        { id: 'd', text: 'The interest earned on your savings account' }
      ],
      correctAnswer: 'b',
      explanation: 'A capital gain is specifically the profit (the difference) when you sell an asset for more than your original purchase price. It\'s not the total value or any investment income — just the gain on sale.'
    },
    {
      id: 'q2',
      question: 'When does a capital gain typically become taxable?',
      options: [
        { id: 'a', text: 'As soon as the value of your investment increases' },
        { id: 'b', text: 'At the end of every year, whether you sell or not' },
        { id: 'c', text: 'When you sell the asset and "realize" the gain' },
        { id: 'd', text: 'Capital gains are never taxed' }
      ],
      correctAnswer: 'c',
      explanation: 'Tax on capital gains typically applies when you "realize" the gain by selling the asset. Simply holding an asset that has increased in value (an "unrealized" gain) generally doesn\'t trigger the tax — you need to actually sell it.'
    }
  ];

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 pt-16">
      {/* Header */}
      <div className="text-white py-12 bg-brand-fill">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={() => navigate('/learn/taxes')}
            className="flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-colors"
          >
            <span>←</span>
            <span>Back to Tax Basics</span>
          </button>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              Lesson 3
            </span>
            <span className="bg-indigo-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              Awareness Only
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-semibold mb-4 tracking-[-0.025em]">Capital Gains – Simple Idea</h1>
          <p className="text-xl text-blue-100">
            Understanding what happens when you sell an investment for a profit
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Introduction */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 tracking-[-0.025em]">What Is a "Capital Gain"?</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              You've probably heard people talk about "capital gains" in relation to investing. It might 
              sound complicated, but the concept is actually quite simple. Let's break it down.
            </p>
            <p className="text-gray-600 leading-relaxed">
              A <strong>capital gain</strong> is just a fancy term for the profit you make when you sell 
              something for more than you originally paid for it. That's it. If you bought something 
              and later sold it at a higher price, the difference is your capital gain.
            </p>
          </div>
        </section>

        {/* What Is Capital Gain */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">The Simple Math</h2>
          <WhatIsCapitalGainSVG />
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
            <p className="text-gray-600 leading-relaxed">
              Think of it like buying and selling anything. If you bought a bicycle for $200 and later 
              sold it for $300, you made a $100 profit. In the investment world, that profit is called 
              a "capital gain." The same logic applies to stocks, property, and other investments.
            </p>
          </div>
        </section>

        {/* Buy Hold Sell */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Buy, Hold, Sell: The Three Stages</h2>
          <BuyHoldSellSVG />
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Understanding Each Stage</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">Buy</span>
                <span>You purchase an asset at a certain price. This becomes your "cost basis" — what you paid.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm font-medium">Hold</span>
                <span>You own the asset over time. Its value might go up or down, but you haven't sold yet.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-brand-soft text-brand px-2 py-1 rounded text-sm font-medium">Sell</span>
                <span>You sell the asset. Now your profit or loss is "realized" — it's actual money.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Gain vs Loss */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Gain vs Loss</h2>
          <GainVsLossSVG />
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
            <p className="text-gray-600 mb-4 leading-relaxed">
              It's not always a gain. If you sell for <strong>less</strong> than you paid, that's called 
              a <strong>capital loss</strong>. The investment world doesn't only have winners — sometimes 
              investments go down, and if you sell at a lower price, you've lost money.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Capital losses can sometimes be used to reduce taxes on your gains, but the rules vary by 
              country. The key point: gains can be taxed, while losses might help offset those taxes.
            </p>
          </div>
        </section>

        {/* Unrealized vs Realized */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Unrealized vs Realized Gains</h2>
          <UnrealizedVsRealizedSVG />
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
            <p className="text-gray-600 mb-4 leading-relaxed">
              This is a crucial concept: just because your investment has increased in value doesn't mean 
              you've been taxed on it yet. While you're still holding the asset, any increase is called 
              an <strong>"unrealized gain"</strong> — it exists on paper but isn't real cash in your pocket.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Only when you sell and convert that paper profit into actual money does it become a 
              <strong>"realized gain"</strong> — and that's typically when tax may apply.
            </p>
          </div>
        </section>

        {/* Why Taxed */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Why Do Governments Tax Capital Gains?</h2>
          <WhyTaxedSVG />
        </section>

        {/* Global Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Example: Lisa's Stock Investment</h2>
          <GlobalExampleSVG />
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-6">
            <p className="text-gray-600 leading-relaxed">
              In this example, Lisa bought shares, held them as they increased in value, and then sold 
              them for a profit. Her $500 gain is a <strong>realized capital gain</strong> because she 
              actually sold the shares and received the money. This gain may be subject to capital gains 
              tax, depending on the rules in her country.
            </p>
          </div>
        </section>

        {/* Key Takeaway */}
        <section className="mb-12">
          <KeyTakeawaySVG />
        </section>

        {/* India Note */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">India-Specific Context</h2>
          <IndiaNotesSVG />
        </section>

        {/* Quiz Section */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Check Your Understanding</h2>
            
            {quizQuestions.map((q, index) => (
              <div key={q.id} className={`${index > 0 ? 'mt-8 pt-8 border-t border-gray-200' : ''}`}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Question {index + 1}: {q.question}
                </h3>
                <div className="space-y-3">
                  {q.options.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        quizAnswers[q.id] === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      } ${
                        showResults[q.id]
                          ? option.id === q.correctAnswer
                            ? 'border-brand bg-brand-soft'
                            : quizAnswers[q.id] === option.id
                            ? 'border-red-500 bg-red-50'
                            : ''
                          : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={option.id}
                        checked={quizAnswers[q.id] === option.id}
                        onChange={() => handleAnswerSelect(q.id, option.id)}
                        disabled={showResults[q.id]}
                        className="mr-3"
                      />
                      <span className="text-gray-700">{option.text}</span>
                    </label>
                  ))}
                </div>
                
                {!showResults[q.id] && quizAnswers[q.id] && (
                  <button
                    onClick={() => checkAnswer(q.id)}
                    className="mt-4 px-6 py-2 bg-brand-fill text-white rounded-lg hover:bg-brand-hover transition-colors"
                  >
                    Check Answer
                  </button>
                )}
                
                {showResults[q.id] && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    quizAnswers[q.id] === q.correctAnswer
                      ? 'bg-brand-soft border border-brand-line'
                      : 'bg-red-100 border border-red-300'
                  }`}>
                    <p className={`font-semibold ${
                      quizAnswers[q.id] === q.correctAnswer ? 'text-brand' : 'text-red-800'
                    }`}>
                      {quizAnswers[q.id] === q.correctAnswer ? '✓ Correct!' : '✗ Not quite right'}
                    </p>
                    <p className="text-gray-700 mt-2">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Reflection */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 tracking-[-0.015em]">💭 Reflection Question</h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              Think about something you own that has increased in value over time — maybe a collectible, 
              property, or even an old item. If you sold it today, would you have a capital gain? 
              How does understanding this concept change how you think about the "value" of things 
              you own versus the actual money you'd receive if you sold them?
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="mb-12">
          <DisclaimerBannerSVG />
        </section>

        {/* Navigation */}
        <section className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/tax-lesson-2')}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
          >
            <span>←</span>
            <span>Previous: Taxes on Income vs Investments</span>
          </button>
          <button
            onClick={() => navigate('/learn/tax-lesson-4')}
            className="flex items-center gap-2 px-6 py-3 bg-brand-fill text-white rounded-xl hover:bg-brand-hover transition-colors"
          >
            <span>Next: Capital Gains – Simple Idea</span>
            <span>→</span>
          </button>
        </section>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default TaxLesson3;
