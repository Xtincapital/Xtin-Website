import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaLightbulb, FaGraduationCap } from 'react-icons/fa';

// SVG 1: Derivatives Are Optional
const OptionalNotRequiredSVG = () => (
  <svg viewBox="0 0 700 260" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="260" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Derivatives Are Optional, Not Required</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">You can build wealth without ever touching derivatives</text>
    
    {/* Two paths visualization */}
    <g transform="translate(50, 75)">
      {/* Path 1: Without derivatives */}
      <rect x="0" y="0" width="280" height="140" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">Path A: Without Derivatives</text>
      
      <g transform="translate(15, 40)">
        <rect x="0" y="0" width="250" height="85" fill="white" rx="8"/>
        <text x="125" y="18" textAnchor="middle" fontSize="8" fill="#374151">Index funds, stocks, bonds, real estate</text>
        <text x="125" y="35" textAnchor="middle" fontSize="8" fill="#374151">Time in market, compound growth</text>
        <line x1="20" y1="45" x2="230" y2="45" stroke="#e5e7eb" strokeWidth="1"/>
        <text x="125" y="60" textAnchor="middle" fontSize="8" fill="#166534">✓ Proven path to wealth</text>
        <text x="125" y="75" textAnchor="middle" fontSize="8" fill="#166534">✓ Lower complexity</text>
        <text x="125" y="88" textAnchor="middle" fontSize="8" fill="#166534">✓ Most successful investors use this</text>
      </g>
    </g>
    
    <g transform="translate(370, 75)">
      {/* Path 2: With derivatives */}
      <rect x="0" y="0" width="280" height="140" fill="#fef3c7" rx="12" stroke="#fcd34d" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#92400e">Path B: With Derivatives</text>
      
      <g transform="translate(15, 40)">
        <rect x="0" y="0" width="250" height="85" fill="white" rx="8"/>
        <text x="125" y="18" textAnchor="middle" fontSize="8" fill="#374151">Futures, options, other derivatives</text>
        <text x="125" y="35" textAnchor="middle" fontSize="8" fill="#374151">Active trading, complex strategies</text>
        <line x1="20" y1="45" x2="230" y2="45" stroke="#e5e7eb" strokeWidth="1"/>
        <text x="125" y="60" textAnchor="middle" fontSize="8" fill="#92400e">⚠️ Requires significant expertise</text>
        <text x="125" y="75" textAnchor="middle" fontSize="8" fill="#92400e">⚠️ Most beginners lose money</text>
        <text x="125" y="88" textAnchor="middle" fontSize="8" fill="#92400e">⚠️ Optional, not necessary</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="225" width="500" height="25" fill="#1e293b" rx="6"/>
    <text x="350" y="242" textAnchor="middle" fontSize="9" fill="white">Warren Buffett, the world's most successful investor, rarely uses derivatives for speculation.</text>
  </svg>
);

// SVG 2: What Derivatives Demand
const WhatDemandsSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">What Derivatives Demand From You</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">These aren't suggestions — they're requirements for survival</text>
    
    {/* Requirement 1: Knowledge */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="190" height="200" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="95" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">📚 Deep Knowledge</text>
      
      <g transform="translate(10, 40)">
        <rect x="0" y="0" width="170" height="145" fill="white" rx="8"/>
        <text x="85" y="18" textAnchor="middle" fontSize="8" fill="#374151" fontWeight="500">You need to understand:</text>
        
        <text x="85" y="38" textAnchor="middle" fontSize="7" fill="#64748b">• How the specific product works</text>
        <text x="85" y="52" textAnchor="middle" fontSize="7" fill="#64748b">• How pricing is determined</text>
        <text x="85" y="66" textAnchor="middle" fontSize="7" fill="#64748b">• What affects value</text>
        <text x="85" y="80" textAnchor="middle" fontSize="7" fill="#64748b">• When you can lose everything</text>
        <text x="85" y="94" textAnchor="middle" fontSize="7" fill="#64748b">• Market mechanics</text>
        
        <line x1="15" y1="105" x2="155" y2="105" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="85" y="120" textAnchor="middle" fontSize="7" fill="#dc2626" fontWeight="500">This takes months to years</text>
        <text x="85" y="134" textAnchor="middle" fontSize="7" fill="#dc2626">of serious study</text>
      </g>
    </g>
    
    {/* Requirement 2: Discipline */}
    <g transform="translate(255, 75)">
      <rect x="0" y="0" width="190" height="200" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="95" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">🎯 Iron Discipline</text>
      
      <g transform="translate(10, 40)">
        <rect x="0" y="0" width="170" height="145" fill="white" rx="8"/>
        <text x="85" y="18" textAnchor="middle" fontSize="8" fill="#374151" fontWeight="500">You need ability to:</text>
        
        <text x="85" y="38" textAnchor="middle" fontSize="7" fill="#64748b">• Follow rules when losing</text>
        <text x="85" y="52" textAnchor="middle" fontSize="7" fill="#64748b">• Cut losses without hesitation</text>
        <text x="85" y="66" textAnchor="middle" fontSize="7" fill="#64748b">• Not chase losing trades</text>
        <text x="85" y="80" textAnchor="middle" fontSize="7" fill="#64748b">• Stay calm under pressure</text>
        <text x="85" y="94" textAnchor="middle" fontSize="7" fill="#64748b">• Walk away from FOMO</text>
        
        <line x1="15" y1="105" x2="155" y2="105" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="85" y="120" textAnchor="middle" fontSize="7" fill="#dc2626" fontWeight="500">Most people overestimate</text>
        <text x="85" y="134" textAnchor="middle" fontSize="7" fill="#dc2626">their discipline</text>
      </g>
    </g>
    
    {/* Requirement 3: Risk Tolerance */}
    <g transform="translate(460, 75)">
      <rect x="0" y="0" width="190" height="200" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="95" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">💸 Financial Cushion</text>
      
      <g transform="translate(10, 40)">
        <rect x="0" y="0" width="170" height="145" fill="white" rx="8"/>
        <text x="85" y="18" textAnchor="middle" fontSize="8" fill="#374151" fontWeight="500">You need to have:</text>
        
        <text x="85" y="38" textAnchor="middle" fontSize="7" fill="#64748b">• Money you can lose 100%</text>
        <text x="85" y="52" textAnchor="middle" fontSize="7" fill="#64748b">• No impact on lifestyle</text>
        <text x="85" y="66" textAnchor="middle" fontSize="7" fill="#64748b">• Emergency fund secure</text>
        <text x="85" y="80" textAnchor="middle" fontSize="7" fill="#64748b">• Long-term savings untouched</text>
        <text x="85" y="94" textAnchor="middle" fontSize="7" fill="#64748b">• No borrowed money</text>
        
        <line x1="15" y1="105" x2="155" y2="105" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="85" y="120" textAnchor="middle" fontSize="7" fill="#dc2626" fontWeight="500">If you're trading money</text>
        <text x="85" y="134" textAnchor="middle" fontSize="7" fill="#dc2626">you need, you'll lose it</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="290" width="500" height="40" fill="#dc2626" rx="6"/>
    <text x="350" y="307" textAnchor="middle" fontSize="9" fill="white">Missing ANY of these requirements dramatically increases your odds of losing money.</text>
    <text x="350" y="322" textAnchor="middle" fontSize="8" fill="#fecaca">Be honest with yourself about whether you truly meet all three.</text>
  </svg>
);

// SVG 3: Curiosity vs Readiness
const CuriosityVsReadinessSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Curiosity vs. Readiness</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Being interested is not the same as being prepared</text>
    
    {/* Curiosity side */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="280" height="170" fill="#e0f2fe" rx="12" stroke="#7dd3fc" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#0369a1">🔍 Curiosity</text>
      
      <g transform="translate(15, 40)">
        <rect x="0" y="0" width="250" height="115" fill="white" rx="8"/>
        <text x="125" y="18" textAnchor="middle" fontSize="8" fill="#374151" fontWeight="500">Signs you're curious:</text>
        
        <text x="125" y="38" textAnchor="middle" fontSize="7" fill="#64748b">"I want to understand how derivatives work"</text>
        <text x="125" y="52" textAnchor="middle" fontSize="7" fill="#64748b">"This sounds interesting"</text>
        <text x="125" y="66" textAnchor="middle" fontSize="7" fill="#64748b">"I've heard people make money with options"</text>
        
        <line x1="20" y1="78" x2="230" y2="78" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="125" y="95" textAnchor="middle" fontSize="7" fill="#0369a1">Curiosity is healthy — keep learning</text>
        <text x="125" y="108" textAnchor="middle" fontSize="7" fill="#0369a1">But curiosity ≠ readiness to trade</text>
      </g>
    </g>
    
    {/* Readiness side */}
    <g transform="translate(370, 75)">
      <rect x="0" y="0" width="280" height="170" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">✓ Readiness</text>
      
      <g transform="translate(15, 40)">
        <rect x="0" y="0" width="250" height="115" fill="white" rx="8"/>
        <text x="125" y="18" textAnchor="middle" fontSize="8" fill="#374151" fontWeight="500">Signs you might be ready:</text>
        
        <text x="125" y="38" textAnchor="middle" fontSize="7" fill="#64748b">"I've studied for 6+ months"</text>
        <text x="125" y="52" textAnchor="middle" fontSize="7" fill="#64748b">"I've paper traded extensively"</text>
        <text x="125" y="66" textAnchor="middle" fontSize="7" fill="#64748b">"I have a specific purpose (hedging)"</text>
        
        <line x1="20" y1="78" x2="230" y2="78" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="125" y="95" textAnchor="middle" fontSize="7" fill="#166534">Even then, start very small</text>
        <text x="125" y="108" textAnchor="middle" fontSize="7" fill="#166534">And expect to make mistakes</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="255" width="500" height="35" fill="#1e293b" rx="6"/>
    <text x="350" y="270" textAnchor="middle" fontSize="9" fill="white">Most people who trade derivatives are curious but not ready.</text>
    <text x="350" y="285" textAnchor="middle" fontSize="8" fill="#94a3b8">That's a large part of why most people lose money.</text>
  </svg>
);

// SVG 4: The Honest Self-Test
const SelfTestSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">The Honest Self-Test</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Can you honestly answer "Yes" to ALL of these?</text>
    
    {/* Test questions */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="600" height="215" fill="white" rx="10" stroke="#e5e7eb" strokeWidth="1"/>
      
      <g transform="translate(30, 25)">
        <circle cx="12" cy="0" r="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1"/>
        <text x="12" y="4" textAnchor="middle" fontSize="10" fill="#f59e0b">1</text>
        <text x="35" y="4" fontSize="9" fill="#374151">"I can explain how futures/options pricing works without looking it up."</text>
        
        <circle cx="12" cy="35" r="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1"/>
        <text x="12" y="39" textAnchor="middle" fontSize="10" fill="#f59e0b">2</text>
        <text x="35" y="39" fontSize="9" fill="#374151">"I've paper traded for at least 6 months and tracked my results honestly."</text>
        
        <circle cx="12" cy="70" r="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1"/>
        <text x="12" y="74" textAnchor="middle" fontSize="10" fill="#f59e0b">3</text>
        <text x="35" y="74" fontSize="9" fill="#374151">"I have money set aside that I could lose 100% without impacting my life."</text>
        
        <circle cx="12" cy="105" r="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1"/>
        <text x="12" y="109" textAnchor="middle" fontSize="10" fill="#f59e0b">4</text>
        <text x="35" y="109" fontSize="9" fill="#374151">"I have a specific purpose beyond 'making money' — like hedging existing positions."</text>
        
        <circle cx="12" cy="140" r="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1"/>
        <text x="12" y="144" textAnchor="middle" fontSize="10" fill="#f59e0b">5</text>
        <text x="35" y="144" fontSize="9" fill="#374151">"I can walk away from a trade emotionally — I won't chase losses."</text>
        
        <circle cx="12" cy="175" r="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1"/>
        <text x="12" y="179" textAnchor="middle" fontSize="10" fill="#f59e0b">6</text>
        <text x="35" y="179" fontSize="9" fill="#374151">"I accept that I will likely lose money, especially at first, and I'm okay with that."</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="300" width="500" height="30" fill="#dc2626" rx="6"/>
    <text x="350" y="315" textAnchor="middle" fontSize="9" fill="white">If you can't honestly say "Yes" to ALL six, you're not ready — and that's okay.</text>
    <text x="350" y="328" textAnchor="middle" fontSize="8" fill="#fecaca">Most successful investors never use derivatives at all.</text>
  </svg>
);

// SVG 5: Global Example - Two Journeys
const GlobalExampleSVG = () => (
  <svg viewBox="0 0 700 400" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="400" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Two Different Journeys: Sarah vs. David</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Both started with $100,000 — different approaches, different outcomes</text>
    
    {/* Sarah - No derivatives */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="290" height="270" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="145" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">Sarah: No Derivatives</text>
      
      <g transform="translate(15, 40)">
        <rect x="0" y="0" width="260" height="215" fill="white" rx="8"/>
        
        <text x="130" y="22" textAnchor="middle" fontSize="9" fill="#166534" fontWeight="500">The Approach</text>
        <text x="130" y="40" textAnchor="middle" fontSize="8" fill="#374151">Index funds + dividend stocks</text>
        <text x="130" y="55" textAnchor="middle" fontSize="8" fill="#374151">Long-term buy and hold</text>
        
        <line x1="20" y1="68" x2="240" y2="68" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="130" y="85" textAnchor="middle" fontSize="9" fill="#166534" fontWeight="500">10 Years Later</text>
        <text x="130" y="102" textAnchor="middle" fontSize="8" fill="#374151">$100,000 → $250,000</text>
        <text x="130" y="117" textAnchor="middle" fontSize="8" fill="#374151">Average 9.6% annual return</text>
        
        <line x1="20" y1="130" x2="240" y2="130" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="130" y="147" textAnchor="middle" fontSize="9" fill="#166534" fontWeight="500">The Experience</text>
        <text x="130" y="165" textAnchor="middle" fontSize="8" fill="#374151">Low stress, minimal time spent</text>
        <text x="130" y="180" textAnchor="middle" fontSize="8" fill="#374151">Slept well during market crashes</text>
        <text x="130" y="195" textAnchor="middle" fontSize="8" fill="#374151">Never panicked, just held</text>
        
        <text x="130" y="215" textAnchor="middle" fontSize="8" fill="#166534" fontWeight="600">Result: +$150,000 gain</text>
      </g>
    </g>
    
    {/* David - Derivatives */}
    <g transform="translate(360, 75)">
      <rect x="0" y="0" width="290" height="270" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="145" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">David: Derivatives Trading</text>
      
      <g transform="translate(15, 40)">
        <rect x="0" y="0" width="260" height="215" fill="white" rx="8"/>
        
        <text x="130" y="22" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="500">The Approach</text>
        <text x="130" y="40" textAnchor="middle" fontSize="8" fill="#374151">Options trading for "better returns"</text>
        <text x="130" y="55" textAnchor="middle" fontSize="8" fill="#374151">Frequent trading, leverage</text>
        
        <line x1="20" y1="68" x2="240" y2="68" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="130" y="85" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="500">10 Years Later</text>
        <text x="130" y="102" textAnchor="middle" fontSize="8" fill="#374151">$100,000 → $35,000</text>
        <text x="130" y="117" textAnchor="middle" fontSize="8" fill="#374151">Average -10% annual loss</text>
        
        <line x1="20" y1="130" x2="240" y2="130" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="130" y="147" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="500">The Experience</text>
        <text x="130" y="165" textAnchor="middle" fontSize="8" fill="#374151">High stress, constant monitoring</text>
        <text x="130" y="180" textAnchor="middle" fontSize="8" fill="#374151">Sleepless nights, anxiety</text>
        <text x="130" y="195" textAnchor="middle" fontSize="8" fill="#374151">Years of trying to "recover"</text>
        
        <text x="130" y="215" textAnchor="middle" fontSize="8" fill="#dc2626" fontWeight="600">Result: -$65,000 loss</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="50" y="355" width="600" height="35" fill="#1e293b" rx="6"/>
    <text x="350" y="370" textAnchor="middle" fontSize="9" fill="white">Both are common outcomes. David isn't stupid — he just chose a harder path he wasn't prepared for.</text>
    <text x="350" y="385" textAnchor="middle" fontSize="8" fill="#94a3b8">The difference in outcomes: $215,000 over 10 years. Simplicity often wins.</text>
  </svg>
);

// SVG 6: The Decision Framework
const DecisionFrameworkSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">A Simple Decision Framework</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">How to think about whether derivatives are right for you</text>
    
    {/* Flowchart */}
    <g transform="translate(50, 75)">
      {/* Question 1 */}
      <rect x="200" y="0" width="200" height="40" fill="#e0f2fe" rx="8" stroke="#0369a1" strokeWidth="2"/>
      <text x="300" y="25" textAnchor="middle" fontSize="9" fill="#0369a1">Do you have a specific purpose?</text>
      
      {/* Arrows */}
      <line x1="250" y1="40" x2="150" y2="70" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead)"/>
      <line x1="350" y1="40" x2="450" y2="70" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrowhead)"/>
      <text x="185" y="52" fontSize="8" fill="#64748b">No</text>
      <text x="405" y="52" fontSize="8" fill="#64748b">Yes</text>
      
      {/* No branch */}
      <rect x="50" y="70" width="200" height="35" fill="#dcfce7" rx="8"/>
      <text x="150" y="92" textAnchor="middle" fontSize="8" fill="#166534">Simpler investments are better</text>
      
      {/* Yes branch - Question 2 */}
      <rect x="350" y="70" width="200" height="40" fill="#e0f2fe" rx="8" stroke="#0369a1" strokeWidth="2"/>
      <text x="450" y="92" textAnchor="middle" fontSize="9" fill="#0369a1">Have you studied deeply?</text>
      
      {/* More arrows */}
      <line x1="400" y1="110" x2="350" y2="140" stroke="#64748b" strokeWidth="1.5"/>
      <line x1="500" y1="110" x2="550" y2="140" stroke="#64748b" strokeWidth="1.5"/>
      <text x="360" y="122" fontSize="8" fill="#64748b">No</text>
      <text x="535" y="122" fontSize="8" fill="#64748b">Yes</text>
      
      {/* No - keep learning */}
      <rect x="250" y="140" width="200" height="35" fill="#fef3c7" rx="8"/>
      <text x="350" y="162" textAnchor="middle" fontSize="8" fill="#92400e">Keep learning, not ready yet</text>
      
      {/* Yes branch - Question 3 */}
      <rect x="450" y="140" width="200" height="40" fill="#e0f2fe" rx="8" stroke="#0369a1" strokeWidth="2"/>
      <text x="550" y="162" textAnchor="middle" fontSize="9" fill="#0369a1">Can you afford 100% loss?</text>
      
      {/* Final arrows */}
      <line x1="500" y1="180" x2="450" y2="210" stroke="#64748b" strokeWidth="1.5"/>
      <line x1="600" y1="180" x2="600" y2="210" stroke="#64748b" strokeWidth="1.5"/>
      <text x="460" y="192" fontSize="8" fill="#64748b">No</text>
      <text x="615" y="192" fontSize="8" fill="#64748b">Yes</text>
      
      {/* No - not ready */}
      <rect x="350" y="210" width="200" height="35" fill="#fef2f2" rx="8"/>
      <text x="450" y="232" textAnchor="middle" fontSize="8" fill="#dc2626">Don't risk money you need</text>
      
      {/* Yes - maybe proceed */}
      <rect x="500" y="210" width="150" height="50" fill="#fef3c7" rx="8" stroke="#f59e0b" strokeWidth="2"/>
      <text x="575" y="230" textAnchor="middle" fontSize="8" fill="#92400e">Consider starting very small</text>
      <text x="575" y="245" textAnchor="middle" fontSize="7" fill="#92400e">and expect to make mistakes</text>
    </g>
    
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#64748b"/>
      </marker>
    </defs>
  </svg>
);

// SVG 7: Module Completion
const ModuleCompletionSVG = () => (
  <svg viewBox="0 0 700 200" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="200" fill="url(#completionGradDeriv)" rx="16"/>
    
    <defs>
      <linearGradient id="completionGradDeriv" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#166534"/>
        <stop offset="100%" stopColor="#14532d"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="35" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">🎓 Congratulations on Completing This Module</text>
    <text x="350" y="60" textAnchor="middle" fontSize="11" fill="#dcfce7">You now understand derivatives better than most people who trade them.</text>
    
    <g transform="translate(100, 80)">
      <rect x="0" y="0" width="500" height="90" fill="white" fillOpacity="0.15" rx="8"/>
      
      <text x="250" y="25" textAnchor="middle" fontSize="10" fill="white" fontWeight="500">What you've learned:</text>
      <text x="250" y="45" textAnchor="middle" fontSize="9" fill="#dcfce7">✓ What derivatives are and how they work</text>
      <text x="250" y="62" textAnchor="middle" fontSize="9" fill="#dcfce7">✓ Why they're risky and why most beginners lose</text>
      <text x="250" y="79" textAnchor="middle" fontSize="9" fill="#dcfce7">✓ How to decide if they're right for you (probably not)</text>
    </g>
    
    <text x="350" y="190" textAnchor="middle" fontSize="9" fill="#86efac">This awareness may save you from costly mistakes. That's the real value.</text>
  </svg>
);

// SVG 8: Final Warning
const FinalWarningSVG = () => (
  <svg viewBox="0 0 700 100" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="100" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
    
    {/* Warning icon */}
    <g transform="translate(30, 35)">
      <polygon points="15,0 30,26 0,26" fill="#dc2626"/>
      <text x="15" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">!</text>
    </g>
    
    {/* Text */}
    <text x="80" y="35" fontSize="11" fontWeight="600" fill="#dc2626">Final Reminder: This Module Doesn't Prepare You to Trade</text>
    <text x="80" y="55" fontSize="9" fill="#991b1b">You've learned awareness — not execution. If you decide to explore derivatives further,</text>
    <text x="80" y="72" fontSize="9" fill="#991b1b">you'll need months more study, paper trading practice, and ideally professional guidance.</text>
    <text x="80" y="90" fontSize="8" fill="#b91c1c">There are no shortcuts, and anyone telling you otherwise is likely trying to sell you something.</text>
  </svg>
);

const DerivLesson7 = () => {
  const navigate = useNavigate();
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const quizQuestions = [
    {
      id: 1,
      question: "Which statement best describes the role of derivatives in wealth building?",
      options: [
        "Derivatives are essential for building serious wealth",
        "Everyone should trade derivatives at some point in their investing journey",
        "Derivatives are optional tools — many successful investors never use them",
        "You can't protect your portfolio without derivatives"
      ],
      correct: 2,
      explanation: "Derivatives are entirely optional. Many of the world's most successful investors, including Warren Buffett, build enormous wealth through simple strategies like index investing and holding quality stocks long-term. Derivatives are specialized tools for specific purposes, not requirements."
    },
    {
      id: 2,
      question: "What's the difference between being 'curious' about derivatives and being 'ready' to use them?",
      options: [
        "There's no real difference — if you're curious, you're ready",
        "Ready means you've seen a few YouTube videos about options",
        "Curious means wanting to learn; ready means having knowledge, discipline, and money you can lose",
        "Ready means you've made money in stocks, so you're ready for the next level"
      ],
      correct: 2,
      explanation: "Curiosity is about interest — wanting to understand something. Readiness requires deep knowledge (months of study), tested discipline (paper trading experience), and financial cushion (money you can genuinely afford to lose). Many curious people trade before they're ready, which is why most lose money."
    }
  ];

  const handleAnswer = (questionId, answerIndex) => {
    setQuizAnswers({ ...quizAnswers, [questionId]: answerIndex });
    setShowResults({ ...showResults, [questionId]: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 py-8 px-4">
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
                <FaGraduationCap className="text-amber-600 text-2xl" />
              </div>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Lesson 7 of 7 – Final Lesson
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Should You Explore Derivatives?</h1>
            <p className="text-gray-600 text-lg">
              Helping you decide if derivatives fit your goals.
            </p>
          </div>
        </div>

        {/* Final Warning */}
        <div className="mb-8">
          <FinalWarningSVG />
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">The Final Question</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              You've completed an entire module on derivatives. You now understand 
              what they are, how they work, why they're risky, and why most 
              beginners lose money.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Now comes the most important question: <strong>Should you 
              personally explore derivatives?</strong>
            </p>
            <p className="text-lg leading-relaxed">
              This lesson won't tell you what to do — only you can make that 
              decision. But it will give you a framework for thinking clearly 
              about it.
            </p>
          </div>
          
          <OptionalNotRequiredSVG />
        </div>

        {/* What Derivatives Demand */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">What Derivatives Demand</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Derivatives aren't like buying index funds where you can learn as 
              you go. They demand certain things from you <em>before</em> you 
              start, or they will take your money.
            </p>
            <p className="text-lg leading-relaxed">
              These requirements aren't optional — they're survival prerequisites.
            </p>
          </div>
          
          <WhatDemandsSVG />
        </div>

        {/* Curiosity vs Readiness */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Curiosity vs. Readiness</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Many people confuse being interested in derivatives with being 
              prepared to use them. These are very different things.
            </p>
            <p className="text-lg leading-relaxed">
              Being curious is healthy — it brought you to this course. But 
              curiosity alone doesn't qualify you to risk real money.
            </p>
          </div>
          
          <CuriosityVsReadinessSVG />
        </div>

        {/* Self-Test */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">The Honest Self-Test</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Here's a simple test. Can you honestly answer "Yes" to <strong>all</strong> 
              of these questions? Not "kind of" or "mostly" — genuinely yes?
            </p>
          </div>
          
          <SelfTestSVG />
          
          <div className="mt-6 bg-amber-50 rounded-xl p-5 border border-amber-200">
            <p className="text-amber-800">
              <strong>If you answered "No" to any of these:</strong> That's not 
              failure — it's clarity. You now know what you'd need to work on if 
              you ever wanted to explore derivatives. Or you might decide simpler 
              approaches are better, which is also a perfectly valid conclusion.
            </p>
          </div>
        </div>

        {/* Global Example */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Two Different Journeys</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Let's look at two real-world-style examples. Both started with the 
              same amount of money. Both were intelligent people. They made 
              different choices.
            </p>
          </div>
          
          <GlobalExampleSVG />
          
          <div className="mt-6 bg-green-50 rounded-xl p-5 border border-green-200">
            <p className="text-green-800">
              <strong>The key insight:</strong> Sarah's "boring" approach 
              outperformed David's "sophisticated" approach by $215,000 over 10 
              years. Complexity doesn't guarantee better returns — often it 
              guarantees worse ones for unprepared investors.
            </p>
          </div>
        </div>

        {/* Decision Framework */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">A Decision Framework</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              If you're trying to decide whether derivatives are right for you, 
              here's a simple way to think through it.
            </p>
          </div>
          
          <DecisionFrameworkSVG />
        </div>

        {/* Module Completion */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <ModuleCompletionSVG />
        </div>

        {/* India Context */}
        <div className="bg-amber-50 rounded-2xl p-6 shadow-lg mb-8 border border-amber-200">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">🇮🇳 India-Specific Note</h3>
          <p className="text-amber-900 mb-3">
            SEBI data shows that 89% of individual F&O traders lost money between 
            FY22-FY24, with average losses of ₹1.2 lakhs per person. The regulator 
            has explicitly stated that F&O trading is "not suitable for most retail 
            investors."
          </p>
          <p className="text-amber-800 text-sm">
            If the Indian market regulator is telling retail traders that 
            derivatives probably aren't for them, that's worth serious 
            consideration. They have access to data we don't.
          </p>
        </div>

        {/* Knowledge Check */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Final Knowledge Check</h2>
          <p className="text-gray-600 mb-6">Test your understanding before completing the module.</p>
          
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
                            ? 'border-green-500 bg-green-50'
                            : quizAnswers[q.id] === index
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 bg-white'
                          : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={showResults[q.id] && index === q.correct ? 'text-green-700 font-medium' : ''}>
                          {option}
                        </span>
                        {showResults[q.id] && index === q.correct && (
                          <FaCheckCircle className="text-green-500" />
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
                    quizAnswers[q.id] === q.correct ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    <p className={quizAnswers[q.id] === q.correct ? 'text-green-800' : 'text-amber-800'}>
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
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 shadow-lg mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <FaLightbulb className="text-2xl text-amber-200" />
            <h3 className="text-xl font-bold">Final Reflection</h3>
          </div>
          <div className="bg-white/20 rounded-xl p-5">
            <p className="text-white font-medium mb-3">Take a moment to consider:</p>
            <p className="text-amber-100 text-lg mb-4">
              "After everything you've learned in this module, do you feel 
              derivatives would genuinely help you achieve your financial goals, 
              or might simpler approaches serve you better?"
            </p>
            <p className="text-amber-200 text-sm">
              There's no right answer. Some people will conclude derivatives 
              aren't for them — that's wisdom, not defeat. Others might decide 
              to pursue more learning — that's also valid, as long as it's informed.
            </p>
          </div>
        </div>

        {/* Module Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Module Complete</h3>
          <div className="bg-green-50 rounded-xl p-6 border border-green-200 mb-6">
            <h4 className="font-semibold text-green-800 mb-3">What You've Learned in This Module:</h4>
            <ul className="text-green-700 space-y-2">
              <li>✓ <strong>Lesson 1:</strong> What derivatives are and why they exist</li>
              <li>✓ <strong>Lesson 2:</strong> How futures contracts work</li>
              <li>✓ <strong>Lesson 3:</strong> How options contracts work</li>
              <li>✓ <strong>Lesson 4:</strong> How leverage and margin amplify risk</li>
              <li>✓ <strong>Lesson 5:</strong> Why most beginners lose money in derivatives</li>
              <li>✓ <strong>Lesson 6:</strong> When derivatives are (and aren't) useful</li>
              <li>✓ <strong>Lesson 7:</strong> How to decide if derivatives are right for you</li>
            </ul>
          </div>
          
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
            <h4 className="font-semibold text-amber-800 mb-3">The Most Important Takeaway:</h4>
            <p className="text-amber-900">
              You now understand derivatives better than most people who trade 
              them. This awareness — knowing what you don't know and what the 
              risks really are — may be the most valuable thing you've gained. 
              It could save you from expensive mistakes, whether you ever trade 
              derivatives or not.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            to="/learn/deriv-lesson-6"
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Previous: When Derivatives Are (and Aren't) Useful</span>
          </Link>
          <Link
            to="/learn/derivatives"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <FaGraduationCap />
            <span>Complete Module</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DerivLesson7;
