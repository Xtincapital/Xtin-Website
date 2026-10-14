import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

// SVG 1: The Purpose Spectrum
const PurposeSpectrumSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">The Purpose Spectrum: Why Are You Using Derivatives?</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Your reason for using them determines whether they make sense</text>
    
    {/* Spectrum bar */}
    <defs>
      <linearGradient id="spectrumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#12805A"/>
        <stop offset="50%" stopColor="#B8923F"/>
        <stop offset="100%" stopColor="#C7363B"/>
      </linearGradient>
    </defs>
    <rect x="100" y="80" width="500" height="25" fill="url(#spectrumGrad)" rx="12"/>
    
    {/* Labels */}
    <text x="100" y="125" textAnchor="start" fontSize="10" fontWeight="600" fill="#12805A">Hedging</text>
    <text x="350" y="125" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B26">Educated Speculation</text>
    <text x="600" y="125" textAnchor="end" fontSize="10" fontWeight="600" fill="#C7363B">Gambling</text>
    
    {/* Descriptions */}
    <g transform="translate(50, 145)">
      <rect x="0" y="0" width="180" height="85" fill="#EEF9F4" rx="8" stroke="#3CCB97" strokeWidth="1"/>
      <text x="90" y="20" textAnchor="middle" fontSize="8" fill="#12805A" fontWeight="500">Reducing existing risk</text>
      <text x="90" y="38" textAnchor="middle" fontSize="7" fill="#373A41">• Protecting investments</text>
      <text x="90" y="52" textAnchor="middle" fontSize="7" fill="#373A41">• Locking in prices</text>
      <text x="90" y="66" textAnchor="middle" fontSize="7" fill="#373A41">• Business planning</text>
      <text x="90" y="80" textAnchor="middle" fontSize="7" fill="#12805A">✓ Generally appropriate</text>
    </g>
    
    <g transform="translate(260, 145)">
      <rect x="0" y="0" width="180" height="85" fill="#F6ECCE" rx="8" stroke="#E2C273" strokeWidth="1"/>
      <text x="90" y="20" textAnchor="middle" fontSize="8" fill="#654B26" fontWeight="500">Informed risk-taking</text>
      <text x="90" y="38" textAnchor="middle" fontSize="7" fill="#373A41">• Deep market knowledge</text>
      <text x="90" y="52" textAnchor="middle" fontSize="7" fill="#373A41">• Risk management plan</text>
      <text x="90" y="66" textAnchor="middle" fontSize="7" fill="#373A41">• Money you can lose</text>
      <text x="90" y="80" textAnchor="middle" fontSize="7" fill="#654B26">⚠️ Requires expertise</text>
    </g>
    
    <g transform="translate(470, 145)">
      <rect x="0" y="0" width="180" height="85" fill="#FDF1F1" rx="8" stroke="#F09B9B" strokeWidth="1"/>
      <text x="90" y="20" textAnchor="middle" fontSize="8" fill="#C7363B" fontWeight="500">Hoping to get rich quick</text>
      <text x="90" y="38" textAnchor="middle" fontSize="7" fill="#373A41">• No real plan</text>
      <text x="90" y="52" textAnchor="middle" fontSize="7" fill="#373A41">• Following tips/rumors</text>
      <text x="90" y="66" textAnchor="middle" fontSize="7" fill="#373A41">• Can't afford losses</text>
      <text x="90" y="80" textAnchor="middle" fontSize="7" fill="#C7363B">✗ Almost always harmful</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="240" width="500" height="30" fill="#2A2A2C" rx="6"/>
    <text x="350" y="253" textAnchor="middle" fontSize="9" fill="white">Most beginners are on the right side of this spectrum without realizing it.</text>
    <text x="350" y="266" textAnchor="middle" fontSize="8" fill="#A0A3AA">Honest self-assessment is the first step to making better decisions.</text>
  </svg>
);

// SVG 2: When Derivatives Make Sense
const WhenUsefulSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">When Derivatives Can Be Useful</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Legitimate use cases where derivatives serve a real purpose</text>
    
    {/* Use case 1: Business Hedging */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="190" height="210" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="2"/>
      <text x="95" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#12805A">🏭 Business Hedging</text>
      
      <g transform="translate(10, 40)">
        <rect x="0" y="0" width="170" height="155" fill="white" rx="8"/>
        <text x="85" y="22" textAnchor="middle" fontSize="8" fill="#373A41" fontWeight="500">Real business needs</text>
        
        <line x1="15" y1="32" x2="155" y2="32" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="85" y="50" textAnchor="middle" fontSize="7" fill="#717680">Airlines hedging fuel costs</text>
        <text x="85" y="65" textAnchor="middle" fontSize="7" fill="#717680">Farmers locking in crop prices</text>
        <text x="85" y="80" textAnchor="middle" fontSize="7" fill="#717680">Importers managing currency</text>
        <text x="85" y="95" textAnchor="middle" fontSize="7" fill="#717680">Manufacturers fixing input costs</text>
        
        <line x1="15" y1="108" x2="155" y2="108" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="85" y="125" textAnchor="middle" fontSize="7" fill="#12805A" fontWeight="500">Why it works:</text>
        <text x="85" y="140" textAnchor="middle" fontSize="7" fill="#12805A">They have real exposure</text>
        <text x="85" y="152" textAnchor="middle" fontSize="7" fill="#12805A">to hedge against</text>
      </g>
    </g>
    
    {/* Use case 2: Portfolio Protection */}
    <g transform="translate(255, 75)">
      <rect x="0" y="0" width="190" height="210" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="2"/>
      <text x="95" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#12805A">🛡️ Portfolio Protection</text>
      
      <g transform="translate(10, 40)">
        <rect x="0" y="0" width="170" height="155" fill="white" rx="8"/>
        <text x="85" y="22" textAnchor="middle" fontSize="8" fill="#373A41" fontWeight="500">Insurance for investments</text>
        
        <line x1="15" y1="32" x2="155" y2="32" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="85" y="50" textAnchor="middle" fontSize="7" fill="#717680">Put options on held stocks</text>
        <text x="85" y="65" textAnchor="middle" fontSize="7" fill="#717680">protecting against crashes</text>
        <text x="85" y="82" textAnchor="middle" fontSize="7" fill="#717680">Index puts for portfolio</text>
        <text x="85" y="97" textAnchor="middle" fontSize="7" fill="#717680">downside protection</text>
        
        <line x1="15" y1="108" x2="155" y2="108" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="85" y="125" textAnchor="middle" fontSize="7" fill="#12805A" fontWeight="500">Why it works:</text>
        <text x="85" y="140" textAnchor="middle" fontSize="7" fill="#12805A">Reduces existing risk</text>
        <text x="85" y="152" textAnchor="middle" fontSize="7" fill="#12805A">rather than adding new</text>
      </g>
    </g>
    
    {/* Use case 3: Professional Trading */}
    <g transform="translate(460, 75)">
      <rect x="0" y="0" width="190" height="210" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
      <text x="95" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B26">📊 Professional Trading</text>
      
      <g transform="translate(10, 40)">
        <rect x="0" y="0" width="170" height="155" fill="white" rx="8"/>
        <text x="85" y="22" textAnchor="middle" fontSize="8" fill="#373A41" fontWeight="500">Full-time, well-resourced</text>
        
        <line x1="15" y1="32" x2="155" y2="32" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="85" y="50" textAnchor="middle" fontSize="7" fill="#717680">Market makers</text>
        <text x="85" y="65" textAnchor="middle" fontSize="7" fill="#717680">Hedge fund traders</text>
        <text x="85" y="80" textAnchor="middle" fontSize="7" fill="#717680">Proprietary trading firms</text>
        <text x="85" y="95" textAnchor="middle" fontSize="7" fill="#717680">Years of training</text>
        
        <line x1="15" y1="108" x2="155" y2="108" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="85" y="125" textAnchor="middle" fontSize="7" fill="#654B26" fontWeight="500">Note:</text>
        <text x="85" y="140" textAnchor="middle" fontSize="7" fill="#654B26">This is NOT most</text>
        <text x="85" y="152" textAnchor="middle" fontSize="7" fill="#654B26">retail traders</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="295" width="500" height="35" fill="#12805A" rx="6"/>
    <text x="350" y="310" textAnchor="middle" fontSize="9" fill="white">Notice the pattern: In each case, there's a specific PURPOSE beyond "making money."</text>
    <text x="350" y="325" textAnchor="middle" fontSize="8" fill="#EEF9F4">If you can't clearly articulate your purpose, derivatives probably aren't right for you.</text>
  </svg>
);

// SVG 3: When Derivatives Don't Make Sense
const WhenNotUsefulSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">When Derivatives Are Not Suitable</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Situations where derivatives are likely to cause harm</text>
    
    {/* Red flag 1 */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="190" height="210" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="95" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">🚩 "Quick Money" Thinking</text>
      
      <g transform="translate(10, 40)">
        <rect x="0" y="0" width="170" height="155" fill="white" rx="8"/>
        <text x="85" y="22" textAnchor="middle" fontSize="8" fill="#373A41" fontWeight="500">Get-rich-quick mindset</text>
        
        <line x1="15" y1="32" x2="155" y2="32" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="85" y="50" textAnchor="middle" fontSize="7" fill="#717680">"I saw someone make</text>
        <text x="85" y="63" textAnchor="middle" fontSize="7" fill="#717680">10x in a week"</text>
        <text x="85" y="80" textAnchor="middle" fontSize="7" fill="#717680">"I just need one big win"</text>
        <text x="85" y="97" textAnchor="middle" fontSize="7" fill="#717680">"Options are like lottery</text>
        <text x="85" y="110" textAnchor="middle" fontSize="7" fill="#717680">tickets with better odds"</text>
        
        <line x1="15" y1="122" x2="155" y2="122" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="85" y="138" textAnchor="middle" fontSize="7" fill="#C7363B" fontWeight="500">Reality: This is gambling</text>
        <text x="85" y="152" textAnchor="middle" fontSize="7" fill="#C7363B">not investing</text>
      </g>
    </g>
    
    {/* Red flag 2 */}
    <g transform="translate(255, 75)">
      <rect x="0" y="0" width="190" height="210" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="95" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">🚩 Can't Afford to Lose</text>
      
      <g transform="translate(10, 40)">
        <rect x="0" y="0" width="170" height="155" fill="white" rx="8"/>
        <text x="85" y="22" textAnchor="middle" fontSize="8" fill="#373A41" fontWeight="500">Essential money at risk</text>
        
        <line x1="15" y1="32" x2="155" y2="32" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="85" y="50" textAnchor="middle" fontSize="7" fill="#717680">Using rent money</text>
        <text x="85" y="65" textAnchor="middle" fontSize="7" fill="#717680">Emergency fund trading</text>
        <text x="85" y="80" textAnchor="middle" fontSize="7" fill="#717680">Borrowed money</text>
        <text x="85" y="95" textAnchor="middle" fontSize="7" fill="#717680">Retirement savings</text>
        
        <line x1="15" y1="108" x2="155" y2="108" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="85" y="125" textAnchor="middle" fontSize="7" fill="#C7363B" fontWeight="500">Reality: If losing would</text>
        <text x="85" y="140" textAnchor="middle" fontSize="7" fill="#C7363B">hurt your life, you</text>
        <text x="85" y="152" textAnchor="middle" fontSize="7" fill="#C7363B">shouldn't be trading</text>
      </g>
    </g>
    
    {/* Red flag 3 */}
    <g transform="translate(460, 75)">
      <rect x="0" y="0" width="190" height="210" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="95" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">🚩 No Real Understanding</text>
      
      <g transform="translate(10, 40)">
        <rect x="0" y="0" width="170" height="155" fill="white" rx="8"/>
        <text x="85" y="22" textAnchor="middle" fontSize="8" fill="#373A41" fontWeight="500">Trading without knowledge</text>
        
        <line x1="15" y1="32" x2="155" y2="32" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="85" y="50" textAnchor="middle" fontSize="7" fill="#717680">"I followed a tip"</text>
        <text x="85" y="65" textAnchor="middle" fontSize="7" fill="#717680">"Someone on YouTube said"</text>
        <text x="85" y="80" textAnchor="middle" fontSize="7" fill="#717680">"I don't know why but</text>
        <text x="85" y="93" textAnchor="middle" fontSize="7" fill="#717680">this stock will go up"</text>
        
        <line x1="15" y1="108" x2="155" y2="108" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="85" y="125" textAnchor="middle" fontSize="7" fill="#C7363B" fontWeight="500">Reality: If you can't</text>
        <text x="85" y="140" textAnchor="middle" fontSize="7" fill="#C7363B">explain your reasoning,</text>
        <text x="85" y="152" textAnchor="middle" fontSize="7" fill="#C7363B">you're guessing</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="295" width="500" height="35" fill="#C7363B" rx="6"/>
    <text x="350" y="310" textAnchor="middle" fontSize="9" fill="white">If any of these describe you, derivatives will likely hurt rather than help.</text>
    <text x="350" y="325" textAnchor="middle" fontSize="8" fill="#F6C3C3">There's no shame in this — most people fit one or more of these categories.</text>
  </svg>
);

// SVG 4: The Honest Questions
const HonestQuestionsSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Questions to Ask Yourself Honestly</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Before considering derivatives, answer these truthfully</text>
    
    {/* Questions */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="600" height="195" fill="white" rx="10" stroke="#E4E4EA" strokeWidth="1"/>
      
      <g transform="translate(30, 25)">
        <text x="0" y="0" fontSize="9" fill="#373A41" fontWeight="500">1. "What is my specific purpose for using derivatives?"</text>
        <text x="20" y="18" fontSize="8" fill="#717680">If your answer is just "to make money," that's not specific enough.</text>
        
        <text x="0" y="45" fontSize="9" fill="#373A41" fontWeight="500">2. "Can I afford to lose 100% of what I'm putting in?"</text>
        <text x="20" y="63" fontSize="8" fill="#717680">If losing this money would cause financial stress, the answer is no.</text>
        
        <text x="0" y="90" fontSize="9" fill="#373A41" fontWeight="500">3. "Do I understand how this specific product works?"</text>
        <text x="20" y="108" fontSize="8" fill="#717680">Not generally — can you explain the mechanics of this exact trade?</text>
        
        <text x="0" y="135" fontSize="9" fill="#373A41" fontWeight="500">4. "What is my plan if the trade goes against me?"</text>
        <text x="20" y="153" fontSize="8" fill="#717680">"I'll figure it out later" is not a plan.</text>
        
        <text x="0" y="180" fontSize="9" fill="#373A41" fontWeight="500">5. "Am I doing this for excitement or for a genuine financial goal?"</text>
        <text x="20" y="198" fontSize="8" fill="#717680">If it's for excitement, that's entertainment, not investing — and expensive entertainment.</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="280" width="500" height="30" fill="#2A2A2C" rx="6"/>
    <text x="350" y="293" textAnchor="middle" fontSize="9" fill="white">If you struggled to answer any of these, that's important information.</text>
    <text x="350" y="306" textAnchor="middle" fontSize="8" fill="#A0A3AA">It might mean you need more preparation — or that derivatives aren't right for you.</text>
  </svg>
);

// SVG 5: Global Example - Two Approaches
const GlobalExampleSVG = () => (
  <svg viewBox="0 0 700 420" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="420" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Same Tool, Different Purposes: James vs. Kevin</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Two people using options with very different approaches</text>
    
    {/* James - Good use */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="290" height="290" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="2"/>
      <text x="145" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">James: Purpose-Driven Use</text>
      
      <g transform="translate(15, 40)">
        <rect x="0" y="0" width="260" height="235" fill="white" rx="8"/>
        
        <text x="130" y="22" textAnchor="middle" fontSize="9" fill="#12805A" fontWeight="500">The Situation</text>
        <text x="130" y="40" textAnchor="middle" fontSize="8" fill="#373A41">James owns $50,000 in stock.</text>
        <text x="130" y="55" textAnchor="middle" fontSize="8" fill="#373A41">Election uncertainty worries him.</text>
        
        <line x1="20" y1="68" x2="240" y2="68" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="130" y="85" textAnchor="middle" fontSize="9" fill="#12805A" fontWeight="500">His Purpose</text>
        <text x="130" y="102" textAnchor="middle" fontSize="8" fill="#373A41">Protect his existing investment</text>
        <text x="130" y="117" textAnchor="middle" fontSize="8" fill="#373A41">from a potential short-term drop.</text>
        
        <line x1="20" y1="130" x2="240" y2="130" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="130" y="147" textAnchor="middle" fontSize="9" fill="#12805A" fontWeight="500">His Action</text>
        <text x="130" y="164" textAnchor="middle" fontSize="8" fill="#373A41">Buys put options for $1,200</text>
        <text x="130" y="179" textAnchor="middle" fontSize="8" fill="#373A41">as "insurance" for 3 months.</text>
        
        <line x1="20" y1="192" x2="240" y2="192" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="130" y="209" textAnchor="middle" fontSize="9" fill="#12805A" fontWeight="500">The Outcome</text>
        <text x="130" y="226" textAnchor="middle" fontSize="8" fill="#373A41">Market drops 15% → Put pays $6,000</text>
        <text x="130" y="241" textAnchor="middle" fontSize="8" fill="#12805A">Net: $4,800 gain, offsetting losses</text>
      </g>
    </g>
    
    {/* Kevin - Poor use */}
    <g transform="translate(360, 75)">
      <rect x="0" y="0" width="290" height="290" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="145" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">Kevin: Gambling Disguised as Trading</text>
      
      <g transform="translate(15, 40)">
        <rect x="0" y="0" width="260" height="235" fill="white" rx="8"/>
        
        <text x="130" y="22" textAnchor="middle" fontSize="9" fill="#C7363B" fontWeight="500">The Situation</text>
        <text x="130" y="40" textAnchor="middle" fontSize="8" fill="#373A41">Kevin has $5,000 in savings.</text>
        <text x="130" y="55" textAnchor="middle" fontSize="8" fill="#373A41">Heard options can make quick money.</text>
        
        <line x1="20" y1="68" x2="240" y2="68" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="130" y="85" textAnchor="middle" fontSize="9" fill="#C7363B" fontWeight="500">His "Purpose"</text>
        <text x="130" y="102" textAnchor="middle" fontSize="8" fill="#373A41">"Turn $5,000 into $50,000"</text>
        <text x="130" y="117" textAnchor="middle" fontSize="8" fill="#373A41">"I have a feeling about this stock"</text>
        
        <line x1="20" y1="130" x2="240" y2="130" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="130" y="147" textAnchor="middle" fontSize="9" fill="#C7363B" fontWeight="500">His Action</text>
        <text x="130" y="164" textAnchor="middle" fontSize="8" fill="#373A41">Buys call options with his entire</text>
        <text x="130" y="179" textAnchor="middle" fontSize="8" fill="#373A41">$5,000 based on a YouTube tip.</text>
        
        <line x1="20" y1="192" x2="240" y2="192" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="130" y="209" textAnchor="middle" fontSize="9" fill="#C7363B" fontWeight="500">The Outcome</text>
        <text x="130" y="226" textAnchor="middle" fontSize="8" fill="#373A41">Stock moves sideways → Options expire</text>
        <text x="130" y="241" textAnchor="middle" fontSize="8" fill="#C7363B">Net: $5,000 completely gone</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="50" y="375" width="600" height="35" fill="#2A2A2C" rx="6"/>
    <text x="350" y="390" textAnchor="middle" fontSize="9" fill="white">Same financial product. Same time period. Completely different outcomes.</text>
    <text x="350" y="405" textAnchor="middle" fontSize="8" fill="#A0A3AA">The difference? James had a purpose. Kevin had a hope.</text>
  </svg>
);

// SVG 6: The Alternatives
const AlternativesSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">If Not Derivatives, Then What?</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">For most beginners, simpler approaches are more appropriate</text>
    
    {/* Alternative 1 */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="190" height="150" fill="#EEF9F4" rx="10" stroke="#3CCB97" strokeWidth="1"/>
      <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#12805A">📈 Index Investing</text>
      
      <g transform="translate(10, 35)">
        <rect x="0" y="0" width="170" height="100" fill="white" rx="6"/>
        <text x="85" y="20" textAnchor="middle" fontSize="7" fill="#373A41">Buy and hold broad market</text>
        <text x="85" y="35" textAnchor="middle" fontSize="7" fill="#373A41">index funds (like S&P 500)</text>
        <text x="85" y="55" textAnchor="middle" fontSize="7" fill="#12805A">✓ Lower risk</text>
        <text x="85" y="70" textAnchor="middle" fontSize="7" fill="#12805A">✓ Lower cost</text>
        <text x="85" y="85" textAnchor="middle" fontSize="7" fill="#12805A">✓ Historically positive</text>
        <text x="85" y="98" textAnchor="middle" fontSize="7" fill="#12805A">✓ No timing needed</text>
      </g>
    </g>
    
    {/* Alternative 2 */}
    <g transform="translate(255, 75)">
      <rect x="0" y="0" width="190" height="150" fill="#E0E7F1" rx="10" stroke="#9FB3D3" strokeWidth="1"/>
      <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#344C72">📊 Direct Stock Investing</text>
      
      <g transform="translate(10, 35)">
        <rect x="0" y="0" width="170" height="100" fill="white" rx="6"/>
        <text x="85" y="20" textAnchor="middle" fontSize="7" fill="#373A41">Buy shares of companies</text>
        <text x="85" y="35" textAnchor="middle" fontSize="7" fill="#373A41">you understand & believe in</text>
        <text x="85" y="55" textAnchor="middle" fontSize="7" fill="#344C72">✓ Ownership in real business</text>
        <text x="85" y="70" textAnchor="middle" fontSize="7" fill="#344C72">✓ No expiration dates</text>
        <text x="85" y="85" textAnchor="middle" fontSize="7" fill="#344C72">✓ Dividends possible</text>
        <text x="85" y="98" textAnchor="middle" fontSize="7" fill="#344C72">✓ Can hold long-term</text>
      </g>
    </g>
    
    {/* Alternative 3 */}
    <g transform="translate(460, 75)">
      <rect x="0" y="0" width="190" height="150" fill="#F6ECCE" rx="10" stroke="#E2C273" strokeWidth="1"/>
      <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#654B26">🎓 Education First</text>
      
      <g transform="translate(10, 35)">
        <rect x="0" y="0" width="170" height="100" fill="white" rx="6"/>
        <text x="85" y="20" textAnchor="middle" fontSize="7" fill="#373A41">Paper trade for 6-12 months</text>
        <text x="85" y="35" textAnchor="middle" fontSize="7" fill="#373A41">before using real money</text>
        <text x="85" y="55" textAnchor="middle" fontSize="7" fill="#654B26">✓ Learn without losing</text>
        <text x="85" y="70" textAnchor="middle" fontSize="7" fill="#654B26">✓ Discover your tendencies</text>
        <text x="85" y="85" textAnchor="middle" fontSize="7" fill="#654B26">✓ Test strategies safely</text>
        <text x="85" y="98" textAnchor="middle" fontSize="7" fill="#654B26">✓ Build real skills</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="235" width="500" height="35" fill="#717680" rx="6"/>
    <text x="350" y="250" textAnchor="middle" fontSize="9" fill="white">There's no prize for using complex instruments. Simple approaches often work better.</text>
    <text x="350" y="265" textAnchor="middle" fontSize="8" fill="#E4E4EA">Warren Buffett has made billions without regularly trading derivatives.</text>
  </svg>
);

// SVG 7: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 170" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="170" fill="url(#takeawayGradDeriv6)" rx="16"/>
    
    <defs>
      <linearGradient id="takeawayGradDeriv6" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B8923F"/>
        <stop offset="100%" stopColor="#C0623B"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="35" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">🎯 Key Takeaway</text>
    <text x="350" y="60" textAnchor="middle" fontSize="12" fill="white">Derivatives are tools — useful for specific purposes, harmful when misused.</text>
    <text x="350" y="85" textAnchor="middle" fontSize="11" fill="#F6ECCE">They make sense for hedging existing risks and for well-resourced professionals.</text>
    <text x="350" y="110" textAnchor="middle" fontSize="11" fill="#F6ECCE">They rarely make sense for beginners seeking quick profits or excitement.</text>
    <text x="350" y="135" textAnchor="middle" fontSize="10" fill="#F0C2A9">The question isn't "Can I use derivatives?" — it's "Should I, given my situation?"</text>
    <text x="350" y="158" textAnchor="middle" fontSize="9" fill="#E2C273">For most people, the honest answer is no.</text>
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
    <text x="80" y="55" fontSize="9" fill="#842428">This lesson isn't telling you what to do — it's helping you think through whether derivatives fit your situation.</text>
    <text x="80" y="70" fontSize="8" fill="#A52A2F">Only you can make that decision, but now you have a framework for thinking about it.</text>
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
                Lesson 6 of 7 – Awareness Only
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-800 mb-2 tracking-[-0.025em]">When Derivatives Are (and Aren't) Useful</h1>
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">The Purpose Question</h2>
          
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">When Derivatives Can Be Useful</h2>
          
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">When Derivatives Are Not Suitable</h2>
          
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">The Self-Assessment</h2>
          
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Same Tool, Different Outcomes</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Let's see how the same financial product can lead to completely 
              different outcomes depending on how it's used.
            </p>
          </div>
          
          <GlobalExampleSVG />
          
          <div className="mt-6 bg-brand-soft rounded-xl p-5 border border-brand-line">
            <p className="text-brand">
              <strong>The difference:</strong> James used options as insurance for 
              something he already owned. Kevin used options as lottery tickets 
              for something he hoped would happen. Same product, opposite purposes.
            </p>
          </div>
        </div>

        {/* Alternatives */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">If Not Derivatives, Then What?</h2>
          
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">📝 Knowledge Check</h2>
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
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📚 Lesson Summary</h3>
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
          <Link
            to="/learn/deriv-lesson-7"
            className="flex items-center gap-2 bg-brand-fill hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <span>Next: Should You Explore Derivatives?</span>
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default DerivLesson6;
