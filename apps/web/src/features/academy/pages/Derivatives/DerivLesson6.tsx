import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';

// SVG 1: The Purpose Spectrum
const PurposeSpectrumSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">The Purpose Spectrum: Why Are You Using Derivatives?</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Your reason for using them determines whether they make sense</text>
    
    {/* Spectrum bar */}
    <defs>
      <linearGradient id="spectrumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#22c55e"/>
        <stop offset="50%" stopColor="#f59e0b"/>
        <stop offset="100%" stopColor="#dc2626"/>
      </linearGradient>
    </defs>
    <rect x="100" y="80" width="500" height="25" fill="url(#spectrumGrad)" rx="12"/>
    
    {/* Labels */}
    <text x="100" y="125" textAnchor="start" fontSize="10" fontWeight="600" fill="#166534">Hedging</text>
    <text x="350" y="125" textAnchor="middle" fontSize="10" fontWeight="600" fill="#92400e">Educated Speculation</text>
    <text x="600" y="125" textAnchor="end" fontSize="10" fontWeight="600" fill="#dc2626">Gambling</text>
    
    {/* Descriptions */}
    <g transform="translate(50, 145)">
      <rect x="0" y="0" width="180" height="85" fill="#dcfce7" rx="8" stroke="#86efac" strokeWidth="1"/>
      <text x="90" y="20" textAnchor="middle" fontSize="8" fill="#166534" fontWeight="500">Reducing existing risk</text>
      <text x="90" y="38" textAnchor="middle" fontSize="7" fill="#374151">• Protecting investments</text>
      <text x="90" y="52" textAnchor="middle" fontSize="7" fill="#374151">• Locking in prices</text>
      <text x="90" y="66" textAnchor="middle" fontSize="7" fill="#374151">• Business planning</text>
      <text x="90" y="80" textAnchor="middle" fontSize="7" fill="#166534">✓ Generally appropriate</text>
    </g>
    
    <g transform="translate(260, 145)">
      <rect x="0" y="0" width="180" height="85" fill="#fef3c7" rx="8" stroke="#fcd34d" strokeWidth="1"/>
      <text x="90" y="20" textAnchor="middle" fontSize="8" fill="#92400e" fontWeight="500">Informed risk-taking</text>
      <text x="90" y="38" textAnchor="middle" fontSize="7" fill="#374151">• Deep market knowledge</text>
      <text x="90" y="52" textAnchor="middle" fontSize="7" fill="#374151">• Risk management plan</text>
      <text x="90" y="66" textAnchor="middle" fontSize="7" fill="#374151">• Money you can lose</text>
      <text x="90" y="80" textAnchor="middle" fontSize="7" fill="#92400e">⚠️ Requires expertise</text>
    </g>
    
    <g transform="translate(470, 145)">
      <rect x="0" y="0" width="180" height="85" fill="#fef2f2" rx="8" stroke="#fca5a5" strokeWidth="1"/>
      <text x="90" y="20" textAnchor="middle" fontSize="8" fill="#dc2626" fontWeight="500">Hoping to get rich quick</text>
      <text x="90" y="38" textAnchor="middle" fontSize="7" fill="#374151">• No real plan</text>
      <text x="90" y="52" textAnchor="middle" fontSize="7" fill="#374151">• Following tips/rumors</text>
      <text x="90" y="66" textAnchor="middle" fontSize="7" fill="#374151">• Can't afford losses</text>
      <text x="90" y="80" textAnchor="middle" fontSize="7" fill="#dc2626">✗ Almost always harmful</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="240" width="500" height="30" fill="#1e293b" rx="6"/>
    <text x="350" y="253" textAnchor="middle" fontSize="9" fill="white">Most beginners are on the right side of this spectrum without realizing it.</text>
    <text x="350" y="266" textAnchor="middle" fontSize="8" fill="#94a3b8">Honest self-assessment is the first step to making better decisions.</text>
  </svg>
);

// SVG 2: When Derivatives Make Sense
const WhenUsefulSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">When Derivatives Can Be Useful</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Legitimate use cases where derivatives serve a real purpose</text>
    
    {/* Use case 1: Business Hedging */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="190" height="210" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="95" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">🏭 Business Hedging</text>
      
      <g transform="translate(10, 40)">
        <rect x="0" y="0" width="170" height="155" fill="white" rx="8"/>
        <text x="85" y="22" textAnchor="middle" fontSize="8" fill="#374151" fontWeight="500">Real business needs</text>
        
        <line x1="15" y1="32" x2="155" y2="32" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="85" y="50" textAnchor="middle" fontSize="7" fill="#64748b">Airlines hedging fuel costs</text>
        <text x="85" y="65" textAnchor="middle" fontSize="7" fill="#64748b">Farmers locking in crop prices</text>
        <text x="85" y="80" textAnchor="middle" fontSize="7" fill="#64748b">Importers managing currency</text>
        <text x="85" y="95" textAnchor="middle" fontSize="7" fill="#64748b">Manufacturers fixing input costs</text>
        
        <line x1="15" y1="108" x2="155" y2="108" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="85" y="125" textAnchor="middle" fontSize="7" fill="#166534" fontWeight="500">Why it works:</text>
        <text x="85" y="140" textAnchor="middle" fontSize="7" fill="#166534">They have real exposure</text>
        <text x="85" y="152" textAnchor="middle" fontSize="7" fill="#166534">to hedge against</text>
      </g>
    </g>
    
    {/* Use case 2: Portfolio Protection */}
    <g transform="translate(255, 75)">
      <rect x="0" y="0" width="190" height="210" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="95" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#166534">🛡️ Portfolio Protection</text>
      
      <g transform="translate(10, 40)">
        <rect x="0" y="0" width="170" height="155" fill="white" rx="8"/>
        <text x="85" y="22" textAnchor="middle" fontSize="8" fill="#374151" fontWeight="500">Insurance for investments</text>
        
        <line x1="15" y1="32" x2="155" y2="32" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="85" y="50" textAnchor="middle" fontSize="7" fill="#64748b">Put options on held stocks</text>
        <text x="85" y="65" textAnchor="middle" fontSize="7" fill="#64748b">protecting against crashes</text>
        <text x="85" y="82" textAnchor="middle" fontSize="7" fill="#64748b">Index puts for portfolio</text>
        <text x="85" y="97" textAnchor="middle" fontSize="7" fill="#64748b">downside protection</text>
        
        <line x1="15" y1="108" x2="155" y2="108" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="85" y="125" textAnchor="middle" fontSize="7" fill="#166534" fontWeight="500">Why it works:</text>
        <text x="85" y="140" textAnchor="middle" fontSize="7" fill="#166534">Reduces existing risk</text>
        <text x="85" y="152" textAnchor="middle" fontSize="7" fill="#166534">rather than adding new</text>
      </g>
    </g>
    
    {/* Use case 3: Professional Trading */}
    <g transform="translate(460, 75)">
      <rect x="0" y="0" width="190" height="210" fill="#fef3c7" rx="12" stroke="#fcd34d" strokeWidth="2"/>
      <text x="95" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#92400e">📊 Professional Trading</text>
      
      <g transform="translate(10, 40)">
        <rect x="0" y="0" width="170" height="155" fill="white" rx="8"/>
        <text x="85" y="22" textAnchor="middle" fontSize="8" fill="#374151" fontWeight="500">Full-time, well-resourced</text>
        
        <line x1="15" y1="32" x2="155" y2="32" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="85" y="50" textAnchor="middle" fontSize="7" fill="#64748b">Market makers</text>
        <text x="85" y="65" textAnchor="middle" fontSize="7" fill="#64748b">Hedge fund traders</text>
        <text x="85" y="80" textAnchor="middle" fontSize="7" fill="#64748b">Proprietary trading firms</text>
        <text x="85" y="95" textAnchor="middle" fontSize="7" fill="#64748b">Years of training</text>
        
        <line x1="15" y1="108" x2="155" y2="108" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="85" y="125" textAnchor="middle" fontSize="7" fill="#92400e" fontWeight="500">Note:</text>
        <text x="85" y="140" textAnchor="middle" fontSize="7" fill="#92400e">This is NOT most</text>
        <text x="85" y="152" textAnchor="middle" fontSize="7" fill="#92400e">retail traders</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="295" width="500" height="35" fill="#166534" rx="6"/>
    <text x="350" y="310" textAnchor="middle" fontSize="9" fill="white">Notice the pattern: In each case, there's a specific PURPOSE beyond "making money."</text>
    <text x="350" y="325" textAnchor="middle" fontSize="8" fill="#dcfce7">If you can't clearly articulate your purpose, derivatives probably aren't right for you.</text>
  </svg>
);

// SVG 3: When Derivatives Don't Make Sense
const WhenNotUsefulSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">When Derivatives Are Not Suitable</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Situations where derivatives are likely to cause harm</text>
    
    {/* Red flag 1 */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="190" height="210" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="95" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">🚩 "Quick Money" Thinking</text>
      
      <g transform="translate(10, 40)">
        <rect x="0" y="0" width="170" height="155" fill="white" rx="8"/>
        <text x="85" y="22" textAnchor="middle" fontSize="8" fill="#374151" fontWeight="500">Get-rich-quick mindset</text>
        
        <line x1="15" y1="32" x2="155" y2="32" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="85" y="50" textAnchor="middle" fontSize="7" fill="#64748b">"I saw someone make</text>
        <text x="85" y="63" textAnchor="middle" fontSize="7" fill="#64748b">10x in a week"</text>
        <text x="85" y="80" textAnchor="middle" fontSize="7" fill="#64748b">"I just need one big win"</text>
        <text x="85" y="97" textAnchor="middle" fontSize="7" fill="#64748b">"Options are like lottery</text>
        <text x="85" y="110" textAnchor="middle" fontSize="7" fill="#64748b">tickets with better odds"</text>
        
        <line x1="15" y1="122" x2="155" y2="122" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="85" y="138" textAnchor="middle" fontSize="7" fill="#dc2626" fontWeight="500">Reality: This is gambling</text>
        <text x="85" y="152" textAnchor="middle" fontSize="7" fill="#dc2626">not investing</text>
      </g>
    </g>
    
    {/* Red flag 2 */}
    <g transform="translate(255, 75)">
      <rect x="0" y="0" width="190" height="210" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="95" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">🚩 Can't Afford to Lose</text>
      
      <g transform="translate(10, 40)">
        <rect x="0" y="0" width="170" height="155" fill="white" rx="8"/>
        <text x="85" y="22" textAnchor="middle" fontSize="8" fill="#374151" fontWeight="500">Essential money at risk</text>
        
        <line x1="15" y1="32" x2="155" y2="32" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="85" y="50" textAnchor="middle" fontSize="7" fill="#64748b">Using rent money</text>
        <text x="85" y="65" textAnchor="middle" fontSize="7" fill="#64748b">Emergency fund trading</text>
        <text x="85" y="80" textAnchor="middle" fontSize="7" fill="#64748b">Borrowed money</text>
        <text x="85" y="95" textAnchor="middle" fontSize="7" fill="#64748b">Retirement savings</text>
        
        <line x1="15" y1="108" x2="155" y2="108" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="85" y="125" textAnchor="middle" fontSize="7" fill="#dc2626" fontWeight="500">Reality: If losing would</text>
        <text x="85" y="140" textAnchor="middle" fontSize="7" fill="#dc2626">hurt your life, you</text>
        <text x="85" y="152" textAnchor="middle" fontSize="7" fill="#dc2626">shouldn't be trading</text>
      </g>
    </g>
    
    {/* Red flag 3 */}
    <g transform="translate(460, 75)">
      <rect x="0" y="0" width="190" height="210" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="95" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#dc2626">🚩 No Real Understanding</text>
      
      <g transform="translate(10, 40)">
        <rect x="0" y="0" width="170" height="155" fill="white" rx="8"/>
        <text x="85" y="22" textAnchor="middle" fontSize="8" fill="#374151" fontWeight="500">Trading without knowledge</text>
        
        <line x1="15" y1="32" x2="155" y2="32" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="85" y="50" textAnchor="middle" fontSize="7" fill="#64748b">"I followed a tip"</text>
        <text x="85" y="65" textAnchor="middle" fontSize="7" fill="#64748b">"Someone on YouTube said"</text>
        <text x="85" y="80" textAnchor="middle" fontSize="7" fill="#64748b">"I don't know why but</text>
        <text x="85" y="93" textAnchor="middle" fontSize="7" fill="#64748b">this stock will go up"</text>
        
        <line x1="15" y1="108" x2="155" y2="108" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="85" y="125" textAnchor="middle" fontSize="7" fill="#dc2626" fontWeight="500">Reality: If you can't</text>
        <text x="85" y="140" textAnchor="middle" fontSize="7" fill="#dc2626">explain your reasoning,</text>
        <text x="85" y="152" textAnchor="middle" fontSize="7" fill="#dc2626">you're guessing</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="295" width="500" height="35" fill="#dc2626" rx="6"/>
    <text x="350" y="310" textAnchor="middle" fontSize="9" fill="white">If any of these describe you, derivatives will likely hurt rather than help.</text>
    <text x="350" y="325" textAnchor="middle" fontSize="8" fill="#fecaca">There's no shame in this — most people fit one or more of these categories.</text>
  </svg>
);

// SVG 4: The Honest Questions
const HonestQuestionsSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Questions to Ask Yourself Honestly</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Before considering derivatives, answer these truthfully</text>
    
    {/* Questions */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="600" height="195" fill="white" rx="10" stroke="#e5e7eb" strokeWidth="1"/>
      
      <g transform="translate(30, 25)">
        <text x="0" y="0" fontSize="9" fill="#374151" fontWeight="500">1. "What is my specific purpose for using derivatives?"</text>
        <text x="20" y="18" fontSize="8" fill="#64748b">If your answer is just "to make money," that's not specific enough.</text>
        
        <text x="0" y="45" fontSize="9" fill="#374151" fontWeight="500">2. "Can I afford to lose 100% of what I'm putting in?"</text>
        <text x="20" y="63" fontSize="8" fill="#64748b">If losing this money would cause financial stress, the answer is no.</text>
        
        <text x="0" y="90" fontSize="9" fill="#374151" fontWeight="500">3. "Do I understand how this specific product works?"</text>
        <text x="20" y="108" fontSize="8" fill="#64748b">Not generally — can you explain the mechanics of this exact trade?</text>
        
        <text x="0" y="135" fontSize="9" fill="#374151" fontWeight="500">4. "What is my plan if the trade goes against me?"</text>
        <text x="20" y="153" fontSize="8" fill="#64748b">"I'll figure it out later" is not a plan.</text>
        
        <text x="0" y="180" fontSize="9" fill="#374151" fontWeight="500">5. "Am I doing this for excitement or for a genuine financial goal?"</text>
        <text x="20" y="198" fontSize="8" fill="#64748b">If it's for excitement, that's entertainment, not investing — and expensive entertainment.</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="280" width="500" height="30" fill="#1e293b" rx="6"/>
    <text x="350" y="293" textAnchor="middle" fontSize="9" fill="white">If you struggled to answer any of these, that's important information.</text>
    <text x="350" y="306" textAnchor="middle" fontSize="8" fill="#94a3b8">It might mean you need more preparation — or that derivatives aren't right for you.</text>
  </svg>
);

// SVG 5: Global Example - Two Approaches
const GlobalExampleSVG = () => (
  <svg viewBox="0 0 700 420" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="420" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">Same Tool, Different Purposes: James vs. Kevin</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">Two people using options with very different approaches</text>
    
    {/* James - Good use */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="290" height="290" fill="#dcfce7" rx="12" stroke="#86efac" strokeWidth="2"/>
      <text x="145" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#166534">James: Purpose-Driven Use</text>
      
      <g transform="translate(15, 40)">
        <rect x="0" y="0" width="260" height="235" fill="white" rx="8"/>
        
        <text x="130" y="22" textAnchor="middle" fontSize="9" fill="#166534" fontWeight="500">The Situation</text>
        <text x="130" y="40" textAnchor="middle" fontSize="8" fill="#374151">James owns $50,000 in stock.</text>
        <text x="130" y="55" textAnchor="middle" fontSize="8" fill="#374151">Election uncertainty worries him.</text>
        
        <line x1="20" y1="68" x2="240" y2="68" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="130" y="85" textAnchor="middle" fontSize="9" fill="#166534" fontWeight="500">His Purpose</text>
        <text x="130" y="102" textAnchor="middle" fontSize="8" fill="#374151">Protect his existing investment</text>
        <text x="130" y="117" textAnchor="middle" fontSize="8" fill="#374151">from a potential short-term drop.</text>
        
        <line x1="20" y1="130" x2="240" y2="130" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="130" y="147" textAnchor="middle" fontSize="9" fill="#166534" fontWeight="500">His Action</text>
        <text x="130" y="164" textAnchor="middle" fontSize="8" fill="#374151">Buys put options for $1,200</text>
        <text x="130" y="179" textAnchor="middle" fontSize="8" fill="#374151">as "insurance" for 3 months.</text>
        
        <line x1="20" y1="192" x2="240" y2="192" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="130" y="209" textAnchor="middle" fontSize="9" fill="#166534" fontWeight="500">The Outcome</text>
        <text x="130" y="226" textAnchor="middle" fontSize="8" fill="#374151">Market drops 15% → Put pays $6,000</text>
        <text x="130" y="241" textAnchor="middle" fontSize="8" fill="#166534">Net: $4,800 gain, offsetting losses</text>
      </g>
    </g>
    
    {/* Kevin - Poor use */}
    <g transform="translate(360, 75)">
      <rect x="0" y="0" width="290" height="290" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
      <text x="145" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#dc2626">Kevin: Gambling Disguised as Trading</text>
      
      <g transform="translate(15, 40)">
        <rect x="0" y="0" width="260" height="235" fill="white" rx="8"/>
        
        <text x="130" y="22" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="500">The Situation</text>
        <text x="130" y="40" textAnchor="middle" fontSize="8" fill="#374151">Kevin has $5,000 in savings.</text>
        <text x="130" y="55" textAnchor="middle" fontSize="8" fill="#374151">Heard options can make quick money.</text>
        
        <line x1="20" y1="68" x2="240" y2="68" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="130" y="85" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="500">His "Purpose"</text>
        <text x="130" y="102" textAnchor="middle" fontSize="8" fill="#374151">"Turn $5,000 into $50,000"</text>
        <text x="130" y="117" textAnchor="middle" fontSize="8" fill="#374151">"I have a feeling about this stock"</text>
        
        <line x1="20" y1="130" x2="240" y2="130" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="130" y="147" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="500">His Action</text>
        <text x="130" y="164" textAnchor="middle" fontSize="8" fill="#374151">Buys call options with his entire</text>
        <text x="130" y="179" textAnchor="middle" fontSize="8" fill="#374151">$5,000 based on a YouTube tip.</text>
        
        <line x1="20" y1="192" x2="240" y2="192" stroke="#e5e7eb" strokeWidth="1"/>
        
        <text x="130" y="209" textAnchor="middle" fontSize="9" fill="#dc2626" fontWeight="500">The Outcome</text>
        <text x="130" y="226" textAnchor="middle" fontSize="8" fill="#374151">Stock moves sideways → Options expire</text>
        <text x="130" y="241" textAnchor="middle" fontSize="8" fill="#dc2626">Net: $5,000 completely gone</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="50" y="375" width="600" height="35" fill="#1e293b" rx="6"/>
    <text x="350" y="390" textAnchor="middle" fontSize="9" fill="white">Same financial product. Same time period. Completely different outcomes.</text>
    <text x="350" y="405" textAnchor="middle" fontSize="8" fill="#94a3b8">The difference? James had a purpose. Kevin had a hope.</text>
  </svg>
);

// SVG 6: The Alternatives
const AlternativesSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#f8fafc" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">If Not Derivatives, Then What?</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#64748b">For most beginners, simpler approaches are more appropriate</text>
    
    {/* Alternative 1 */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="190" height="150" fill="#dcfce7" rx="10" stroke="#86efac" strokeWidth="1"/>
      <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#166534">📈 Index Investing</text>
      
      <g transform="translate(10, 35)">
        <rect x="0" y="0" width="170" height="100" fill="white" rx="6"/>
        <text x="85" y="20" textAnchor="middle" fontSize="7" fill="#374151">Buy and hold broad market</text>
        <text x="85" y="35" textAnchor="middle" fontSize="7" fill="#374151">index funds (like S&P 500)</text>
        <text x="85" y="55" textAnchor="middle" fontSize="7" fill="#166534">✓ Lower risk</text>
        <text x="85" y="70" textAnchor="middle" fontSize="7" fill="#166534">✓ Lower cost</text>
        <text x="85" y="85" textAnchor="middle" fontSize="7" fill="#166534">✓ Historically positive</text>
        <text x="85" y="98" textAnchor="middle" fontSize="7" fill="#166534">✓ No timing needed</text>
      </g>
    </g>
    
    {/* Alternative 2 */}
    <g transform="translate(255, 75)">
      <rect x="0" y="0" width="190" height="150" fill="#e0f2fe" rx="10" stroke="#7dd3fc" strokeWidth="1"/>
      <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#0369a1">📊 Direct Stock Investing</text>
      
      <g transform="translate(10, 35)">
        <rect x="0" y="0" width="170" height="100" fill="white" rx="6"/>
        <text x="85" y="20" textAnchor="middle" fontSize="7" fill="#374151">Buy shares of companies</text>
        <text x="85" y="35" textAnchor="middle" fontSize="7" fill="#374151">you understand & believe in</text>
        <text x="85" y="55" textAnchor="middle" fontSize="7" fill="#0369a1">✓ Ownership in real business</text>
        <text x="85" y="70" textAnchor="middle" fontSize="7" fill="#0369a1">✓ No expiration dates</text>
        <text x="85" y="85" textAnchor="middle" fontSize="7" fill="#0369a1">✓ Dividends possible</text>
        <text x="85" y="98" textAnchor="middle" fontSize="7" fill="#0369a1">✓ Can hold long-term</text>
      </g>
    </g>
    
    {/* Alternative 3 */}
    <g transform="translate(460, 75)">
      <rect x="0" y="0" width="190" height="150" fill="#fef3c7" rx="10" stroke="#fcd34d" strokeWidth="1"/>
      <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#92400e">🎓 Education First</text>
      
      <g transform="translate(10, 35)">
        <rect x="0" y="0" width="170" height="100" fill="white" rx="6"/>
        <text x="85" y="20" textAnchor="middle" fontSize="7" fill="#374151">Paper trade for 6-12 months</text>
        <text x="85" y="35" textAnchor="middle" fontSize="7" fill="#374151">before using real money</text>
        <text x="85" y="55" textAnchor="middle" fontSize="7" fill="#92400e">✓ Learn without losing</text>
        <text x="85" y="70" textAnchor="middle" fontSize="7" fill="#92400e">✓ Discover your tendencies</text>
        <text x="85" y="85" textAnchor="middle" fontSize="7" fill="#92400e">✓ Test strategies safely</text>
        <text x="85" y="98" textAnchor="middle" fontSize="7" fill="#92400e">✓ Build real skills</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="235" width="500" height="35" fill="#64748b" rx="6"/>
    <text x="350" y="250" textAnchor="middle" fontSize="9" fill="white">There's no prize for using complex instruments. Simple approaches often work better.</text>
    <text x="350" y="265" textAnchor="middle" fontSize="8" fill="#e5e7eb">Warren Buffett has made billions without regularly trading derivatives.</text>
  </svg>
);

// SVG 7: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 170" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="170" fill="url(#takeawayGradDeriv6)" rx="16"/>
    
    <defs>
      <linearGradient id="takeawayGradDeriv6" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b"/>
        <stop offset="100%" stopColor="#ea580c"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="35" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">🎯 Key Takeaway</text>
    <text x="350" y="60" textAnchor="middle" fontSize="12" fill="white">Derivatives are tools — useful for specific purposes, harmful when misused.</text>
    <text x="350" y="85" textAnchor="middle" fontSize="11" fill="#fef3c7">They make sense for hedging existing risks and for well-resourced professionals.</text>
    <text x="350" y="110" textAnchor="middle" fontSize="11" fill="#fef3c7">They rarely make sense for beginners seeking quick profits or excitement.</text>
    <text x="350" y="135" textAnchor="middle" fontSize="10" fill="#fed7aa">The question isn't "Can I use derivatives?" — it's "Should I, given my situation?"</text>
    <text x="350" y="158" textAnchor="middle" fontSize="9" fill="#fcd34d">For most people, the honest answer is no.</text>
  </svg>
);

// SVG 8: Warning Banner
const WarningBannerSVG = () => (
  <svg viewBox="0 0 700 80" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="80" fill="#fef2f2" rx="12" stroke="#fca5a5" strokeWidth="2"/>
    
    {/* Warning icon */}
    <g transform="translate(30, 25)">
      <polygon points="15,0 30,26 0,26" fill="#dc2626"/>
      <text x="15" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">!</text>
    </g>
    
    {/* Text */}
    <text x="80" y="35" fontSize="11" fontWeight="600" fill="#dc2626">Remember: This is Awareness Education</text>
    <text x="80" y="55" fontSize="9" fill="#991b1b">This lesson isn't telling you what to do — it's helping you think through whether derivatives fit your situation.</text>
    <text x="80" y="70" fontSize="8" fill="#b91c1c">Only you can make that decision, but now you have a framework for thinking about it.</text>
  </svg>
);

const DerivLesson6 = () => {
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const quizQuestions = [
    {
      id: 1,
      question: "Which of the following is a legitimate use case for derivatives?",
      options: [
        "Trying to double your money quickly based on a tip",
        "An airline locking in fuel prices for the year ahead",
        "Using your emergency fund to speculate on stock movements",
        "Following a social media influencer's trade recommendations"
      ],
      correct: 1,
      explanation: "Airlines using futures to lock in fuel prices is a classic example of hedging — using derivatives to reduce existing business risk. The other options describe gambling or speculation without proper knowledge or risk management."
    },
    {
      id: 2,
      question: "What's the key difference between using derivatives for hedging versus gambling?",
      options: [
        "Hedging uses more money than gambling",
        "Gambling is done by professionals, hedging by amateurs",
        "Hedging reduces existing risk, gambling creates new risk for potential profit",
        "There's no real difference — it's all speculation"
      ],
      correct: 2,
      explanation: "Hedging means using derivatives to reduce or offset risk you already have (like a farmer protecting crop prices). Gambling means taking on new risk hoping to profit, without a specific purpose beyond making money."
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
                <FaExclamationTriangle className="text-amber-600 text-2xl" />
              </div>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                Lesson 6 of 7 – Awareness Only
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">When Derivatives Are (and Aren't) Useful</h1>
            <p className="text-gray-600 text-lg">
              Understanding whether derivatives fit your situation.
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mb-8">
          <WarningBannerSVG />
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">The Purpose Question</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              We've covered what derivatives are, how they work, and why they're 
              risky. Now comes the most important question: <strong>Should you 
              use them at all?</strong>
            </p>
            <p className="text-lg leading-relaxed mb-4">
              The answer depends entirely on your <em>purpose</em>. Derivatives 
              are tools — like a chainsaw. In the right hands, for the right 
              job, they're useful. In the wrong hands or for the wrong purpose, 
              they cause harm.
            </p>
            <p className="text-lg leading-relaxed">
              Let's think through when they make sense and when they don't.
            </p>
          </div>
          
          <PurposeSpectrumSVG />
        </div>

        {/* When Useful */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">When Derivatives Can Be Useful</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Derivatives were invented for a reason — they solve real problems 
              for businesses and investors. Here are situations where they 
              genuinely make sense.
            </p>
            <p className="text-lg leading-relaxed">
              Notice the pattern: in each case, there's a <strong>specific 
              purpose</strong> beyond just "making money."
            </p>
          </div>
          
          <WhenUsefulSVG />
        </div>

        {/* When Not Useful */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">When Derivatives Are Not Suitable</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Most individual traders fall into one of these categories. If any 
              of these describe you, derivatives will likely cause harm rather 
              than help.
            </p>
            <p className="text-lg leading-relaxed">
              This isn't judgment — it's honest recognition of reality. Even smart, 
              successful people can fall into these patterns.
            </p>
          </div>
          
          <WhenNotUsefulSVG />
        </div>

        {/* Honest Questions */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">The Self-Assessment</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Before considering derivatives, answer these questions with complete 
              honesty. No one else will know your answers — but they'll determine 
              whether derivatives are appropriate for you.
            </p>
          </div>
          
          <HonestQuestionsSVG />
          
          <div className="mt-6 bg-amber-50 rounded-xl p-5 border border-amber-200">
            <p className="text-amber-800">
              <strong>Important:</strong> If you struggled with any of these questions, 
              that's not failure — it's valuable information. It might mean you need 
              more preparation, or that derivatives simply aren't right for your situation.
            </p>
          </div>
        </div>

        {/* Global Example */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Same Tool, Different Outcomes</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Let's see how the same financial product can lead to completely 
              different outcomes depending on how it's used.
            </p>
          </div>
          
          <GlobalExampleSVG />
          
          <div className="mt-6 bg-green-50 rounded-xl p-5 border border-green-200">
            <p className="text-green-800">
              <strong>The difference:</strong> James used options as insurance for 
              something he already owned. Kevin used options as lottery tickets 
              for something he hoped would happen. Same product, opposite purposes.
            </p>
          </div>
        </div>

        {/* Alternatives */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">If Not Derivatives, Then What?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              If you've concluded that derivatives aren't right for you, that's 
              not a defeat — it's wisdom. There are simpler, more appropriate 
              ways to grow wealth.
            </p>
            <p className="text-lg leading-relaxed">
              Remember: complexity doesn't equal better returns. Often the opposite 
              is true.
            </p>
          </div>
          
          <AlternativesSVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
        </div>

        {/* India Context */}
        <div className="bg-amber-50 rounded-2xl p-6 shadow-lg mb-8 border border-amber-200">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">🇮🇳 India-Specific Note</h3>
          <p className="text-amber-900 mb-3">
            SEBI has specifically cautioned retail investors about F&O trading, 
            noting that it's designed primarily for hedging and professional use. 
            The regulator has increased restrictions on weekly options and lot 
            sizes specifically to discourage speculative retail participation.
          </p>
          <p className="text-amber-800 text-sm">
            If the market regulator itself is warning retail traders about 
            derivatives, that's worth considering. They have access to data 
            showing exactly how much money retail traders lose.
          </p>
        </div>

        {/* Knowledge Check */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Knowledge Check</h2>
          <p className="text-gray-600 mb-6">Test your understanding of appropriate derivative use.</p>
          
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
            <h3 className="text-xl font-bold">Reflection Question</h3>
          </div>
          <div className="bg-white/20 rounded-xl p-5">
            <p className="text-white font-medium mb-3">Think about this:</p>
            <p className="text-amber-100 text-lg mb-4">
              "Based on what you've learned, do you have a legitimate purpose 
              for using derivatives? Or would simpler investment approaches 
              better serve your actual goals?"
            </p>
            <p className="text-amber-200 text-sm">
              There's no wrong answer — only honest answers. The goal is clarity 
              about what you're trying to achieve and whether derivatives help with that.
            </p>
          </div>
        </div>

        {/* Lesson Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Lesson Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">What You Learned</h4>
              <ul className="text-amber-700 text-sm space-y-1">
                <li>✓ Derivatives are tools — useful or harmful depending on use</li>
                <li>✓ Hedging = reducing risk you already have</li>
                <li>✓ Speculation without knowledge = gambling</li>
                <li>✓ Most beginners don't have legitimate use cases</li>
              </ul>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Coming Next</h4>
              <ul className="text-orange-700 text-sm space-y-1">
                <li>→ Lesson 7: Final Thoughts and Key Principles</li>
                <li>→ Summarizing what you've learned</li>
                <li>→ Framework for making informed decisions</li>
                <li>→ Resources for further learning</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            to="/learn/deriv-lesson-5"
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Previous: Why Most Beginners Lose</span>
          </Link>
          <button
            disabled
            className="flex items-center gap-2 bg-gray-300 text-gray-500 px-6 py-3 rounded-xl font-semibold cursor-not-allowed"
          >
            <span>Next: Final Thoughts</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DerivLesson6;
