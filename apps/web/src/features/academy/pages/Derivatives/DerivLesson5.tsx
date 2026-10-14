import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

// SVG 1: The Statistics Reality
const StatisticsRealitySVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">The Reality: Most Retail Traders Lose</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">This isn't opinion — it's documented by regulators worldwide</text>
    
    {/* Visual representation */}
    <g transform="translate(100, 80)">
      {/* Losing traders */}
      <rect x="0" y="0" width="350" height="120" fill="#FDF1F1" rx="10" stroke="#F09B9B" strokeWidth="2"/>
      <text x="175" y="30" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#C7363B">70-90%</text>
      <text x="175" y="55" textAnchor="middle" fontSize="11" fill="#C7363B">of retail derivative traders</text>
      <text x="175" y="75" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">LOSE MONEY</text>
      <text x="175" y="100" textAnchor="middle" fontSize="8" fill="#717680">Across all major markets globally</text>
    </g>
    
    {/* Winning traders */}
    <g transform="translate(470, 80)">
      <rect x="0" y="0" width="130" height="120" fill="#EEF9F4" rx="10" stroke="#3CCB97" strokeWidth="2"/>
      <text x="65" y="30" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#12805A">10-30%</text>
      <text x="65" y="55" textAnchor="middle" fontSize="9" fill="#12805A">make money</text>
      <text x="65" y="80" textAnchor="middle" fontSize="7" fill="#717680">Usually professionals</text>
      <text x="65" y="95" textAnchor="middle" fontSize="7" fill="#717680">with years of</text>
      <text x="65" y="108" textAnchor="middle" fontSize="7" fill="#717680">experience</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="215" width="500" height="55" fill="#2A2A2C" rx="6"/>
    <text x="350" y="235" textAnchor="middle" fontSize="9" fill="white">This isn't about being "smart enough." Even highly educated people lose consistently.</text>
    <text x="350" y="252" textAnchor="middle" fontSize="9" fill="#A0A3AA">The game itself is structured in ways that make sustained profitability very difficult.</text>
    <text x="350" y="267" textAnchor="middle" fontSize="8" fill="#717680">Understanding WHY helps you make informed decisions about whether to participate.</text>
  </svg>
);

// SVG 2: Common Mistakes Overview
const CommonMistakesSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">The Three Categories of Beginner Mistakes</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Most losses come from these recurring patterns</text>
    
    {/* Mistake 1: Overconfidence */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="190" height="195" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
      <text x="95" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B26">🧠 Overconfidence</text>
      
      <g transform="translate(10, 40)">
        <rect x="0" y="0" width="170" height="140" fill="white" rx="8"/>
        <text x="85" y="25" textAnchor="middle" fontSize="8" fill="#373A41" fontWeight="500">"I've figured it out"</text>
        
        <line x1="15" y1="35" x2="155" y2="35" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="85" y="55" textAnchor="middle" fontSize="7" fill="#717680">• Thinking you're smarter</text>
        <text x="85" y="68" textAnchor="middle" fontSize="7" fill="#717680">than the market</text>
        <text x="85" y="85" textAnchor="middle" fontSize="7" fill="#717680">• "This time is different"</text>
        <text x="85" y="102" textAnchor="middle" fontSize="7" fill="#717680">• Confusing luck with skill</text>
        <text x="85" y="119" textAnchor="middle" fontSize="7" fill="#717680">• Ignoring warning signs</text>
        <text x="85" y="135" textAnchor="middle" fontSize="7" fill="#654B26">after early wins</text>
      </g>
    </g>
    
    {/* Mistake 2: Poor Risk Understanding */}
    <g transform="translate(255, 75)">
      <rect x="0" y="0" width="190" height="195" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="95" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">⚠️ Risk Blindness</text>
      
      <g transform="translate(10, 40)">
        <rect x="0" y="0" width="170" height="140" fill="white" rx="8"/>
        <text x="85" y="25" textAnchor="middle" fontSize="8" fill="#373A41" fontWeight="500">"It won't happen to me"</text>
        
        <line x1="15" y1="35" x2="155" y2="35" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="85" y="55" textAnchor="middle" fontSize="7" fill="#717680">• Not understanding how</text>
        <text x="85" y="68" textAnchor="middle" fontSize="7" fill="#717680">quickly losses multiply</text>
        <text x="85" y="85" textAnchor="middle" fontSize="7" fill="#717680">• Underestimating worst</text>
        <text x="85" y="98" textAnchor="middle" fontSize="7" fill="#717680">case scenarios</text>
        <text x="85" y="115" textAnchor="middle" fontSize="7" fill="#717680">• Position sizes too large</text>
        <text x="85" y="132" textAnchor="middle" fontSize="7" fill="#C7363B">for account</text>
      </g>
    </g>
    
    {/* Mistake 3: Emotional Trading */}
    <g transform="translate(460, 75)">
      <rect x="0" y="0" width="190" height="195" fill="#E0E7F1" rx="12" stroke="#9FB3D3" strokeWidth="2"/>
      <text x="95" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#344C72">😰 Emotional Decisions</text>
      
      <g transform="translate(10, 40)">
        <rect x="0" y="0" width="170" height="140" fill="white" rx="8"/>
        <text x="85" y="25" textAnchor="middle" fontSize="8" fill="#373A41" fontWeight="500">"I need to win it back"</text>
        
        <line x1="15" y1="35" x2="155" y2="35" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="85" y="55" textAnchor="middle" fontSize="7" fill="#717680">• Chasing losses with</text>
        <text x="85" y="68" textAnchor="middle" fontSize="7" fill="#717680">bigger bets</text>
        <text x="85" y="85" textAnchor="middle" fontSize="7" fill="#717680">• FOMO (fear of missing out)</text>
        <text x="85" y="102" textAnchor="middle" fontSize="7" fill="#717680">• Panic selling at lows</text>
        <text x="85" y="119" textAnchor="middle" fontSize="7" fill="#717680">• Greed-driven holding</text>
        <text x="85" y="135" textAnchor="middle" fontSize="7" fill="#344C72">past exit points</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="280" width="500" height="30" fill="#717680" rx="6"/>
    <text x="350" y="293" textAnchor="middle" fontSize="9" fill="white">These aren't character flaws — they're normal human psychology that markets exploit.</text>
    <text x="350" y="306" textAnchor="middle" fontSize="8" fill="#E4E4EA">Professional traders spend years learning to manage these tendencies.</text>
  </svg>
);

// SVG 3: The Overconfidence Cycle
const OverconfidenceCycleSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">The Dangerous Overconfidence Cycle</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Early wins often lead to bigger losses later</text>
    
    {/* Step 1 */}
    <g transform="translate(50, 80)">
      <rect x="0" y="0" width="130" height="100" fill="#EEF9F4" rx="10" stroke="#3CCB97" strokeWidth="2"/>
      <text x="65" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#12805A">Step 1</text>
      <text x="65" y="45" textAnchor="middle" fontSize="18">🎉</text>
      <text x="65" y="65" textAnchor="middle" fontSize="8" fill="#373A41">Early Win</text>
      <text x="65" y="80" textAnchor="middle" fontSize="7" fill="#717680">"I made $500!</text>
      <text x="65" y="92" textAnchor="middle" fontSize="7" fill="#717680">This is easy!"</text>
    </g>
    
    {/* Arrow */}
    <g transform="translate(185, 120)">
      <line x1="0" y1="0" x2="35" y2="0" stroke="#717680" strokeWidth="2"/>
      <polygon points="35,0 28,-4 28,4" fill="#717680"/>
    </g>
    
    {/* Step 2 */}
    <g transform="translate(225, 80)">
      <rect x="0" y="0" width="130" height="100" fill="#F6ECCE" rx="10" stroke="#E2C273" strokeWidth="2"/>
      <text x="65" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#654B26">Step 2</text>
      <text x="65" y="45" textAnchor="middle" fontSize="18">📈</text>
      <text x="65" y="65" textAnchor="middle" fontSize="8" fill="#373A41">Increase Size</text>
      <text x="65" y="80" textAnchor="middle" fontSize="7" fill="#717680">"I'll bet bigger</text>
      <text x="65" y="92" textAnchor="middle" fontSize="7" fill="#717680">to make more"</text>
    </g>
    
    {/* Arrow */}
    <g transform="translate(360, 120)">
      <line x1="0" y1="0" x2="35" y2="0" stroke="#717680" strokeWidth="2"/>
      <polygon points="35,0 28,-4 28,4" fill="#717680"/>
    </g>
    
    {/* Step 3 */}
    <g transform="translate(400, 80)">
      <rect x="0" y="0" width="130" height="100" fill="#FDF1F1" rx="10" stroke="#F09B9B" strokeWidth="2"/>
      <text x="65" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#C7363B">Step 3</text>
      <text x="65" y="45" textAnchor="middle" fontSize="18">💥</text>
      <text x="65" y="65" textAnchor="middle" fontSize="8" fill="#373A41">Big Loss</text>
      <text x="65" y="80" textAnchor="middle" fontSize="7" fill="#717680">One bad trade</text>
      <text x="65" y="92" textAnchor="middle" fontSize="7" fill="#717680">wipes out gains</text>
    </g>
    
    {/* Arrow */}
    <g transform="translate(535, 120)">
      <line x1="0" y1="0" x2="35" y2="0" stroke="#717680" strokeWidth="2"/>
      <polygon points="35,0 28,-4 28,4" fill="#717680"/>
    </g>
    
    {/* Step 4 */}
    <g transform="translate(575, 80)">
      <rect x="0" y="0" width="75" height="100" fill="#FDF1F1" rx="10" stroke="#C7363B" strokeWidth="2"/>
      <text x="37" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#C7363B">Step 4</text>
      <text x="37" y="50" textAnchor="middle" fontSize="18">😰</text>
      <text x="37" y="70" textAnchor="middle" fontSize="7" fill="#373A41">Chase</text>
      <text x="37" y="82" textAnchor="middle" fontSize="7" fill="#373A41">losses</text>
      <text x="37" y="94" textAnchor="middle" fontSize="6" fill="#C7363B">→ More loss</text>
    </g>
    
    {/* The math */}
    <g transform="translate(100, 200)">
      <rect x="0" y="0" width="500" height="70" fill="white" rx="8" stroke="#E4E4EA" strokeWidth="1"/>
      <text x="250" y="22" textAnchor="middle" fontSize="10" fontWeight="500" fill="#373A41">The Math That Gets Ignored</text>
      <text x="250" y="42" textAnchor="middle" fontSize="8" fill="#373A41">5 small wins of $200 = +$1,000 | Then 1 big loss of $2,000 = -$1,000 net</text>
      <text x="250" y="58" textAnchor="middle" fontSize="8" fill="#C7363B">The early wins created confidence that led to the big loss</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="280" width="500" height="30" fill="#C7363B" rx="6"/>
    <text x="350" y="293" textAnchor="middle" fontSize="9" fill="white">Markets are very good at giving beginners early wins. This isn't a gift — it's a trap.</text>
    <text x="350" y="306" textAnchor="middle" fontSize="8" fill="#F6C3C3">The confidence from those wins often leads to the big losses that follow.</text>
  </svg>
);

// SVG 4: Compounding Losses
const CompoundingLossesSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Why Small Losses Compound Into Big Problems</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">The math works against you when you're losing</text>
    
    {/* Loss visualization */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="600" height="170" fill="white" rx="10" stroke="#E4E4EA" strokeWidth="1"/>
      
      {/* Starting point */}
      <g transform="translate(30, 30)">
        <rect x="0" y="0" width="80" height="50" fill="#EEF9F4" rx="6"/>
        <text x="40" y="22" textAnchor="middle" fontSize="8" fill="#12805A">Start</text>
        <text x="40" y="38" textAnchor="middle" fontSize="10" fontWeight="600" fill="#12805A">$10,000</text>
      </g>
      
      {/* After 20% loss */}
      <g transform="translate(140, 30)">
        <text x="0" y="25" fontSize="8" fill="#717680">-20%</text>
        <line x1="15" y1="25" x2="45" y2="25" stroke="#717680" strokeWidth="1"/>
        <polygon points="45,25 40,22 40,28" fill="#717680"/>
      </g>
      <g transform="translate(165, 30)">
        <rect x="0" y="0" width="80" height="50" fill="#F6ECCE" rx="6"/>
        <text x="40" y="22" textAnchor="middle" fontSize="8" fill="#654B26">Remaining</text>
        <text x="40" y="38" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B26">$8,000</text>
      </g>
      
      {/* Recovery needed */}
      <g transform="translate(275, 30)">
        <text x="0" y="25" fontSize="8" fill="#C7363B">Need +25%</text>
        <line x1="30" y1="25" x2="60" y2="25" stroke="#C7363B" strokeWidth="1"/>
        <polygon points="60,25 55,22 55,28" fill="#C7363B"/>
      </g>
      <g transform="translate(310, 30)">
        <rect x="0" y="0" width="100" height="50" fill="#FDF1F1" rx="6"/>
        <text x="50" y="22" textAnchor="middle" fontSize="8" fill="#C7363B">To break even</text>
        <text x="50" y="38" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">$10,000</text>
      </g>
      
      {/* More examples */}
      <g transform="translate(30, 95)">
        <text x="0" y="15" fontSize="9" fontWeight="500" fill="#373A41">The Recovery Problem:</text>
        <text x="150" y="15" fontSize="8" fill="#717680">Lose 10% → Need 11% gain to recover</text>
        <text x="150" y="30" fontSize="8" fill="#717680">Lose 25% → Need 33% gain to recover</text>
        <text x="150" y="45" fontSize="8" fill="#C7363B" fontWeight="500">Lose 50% → Need 100% gain to recover</text>
        <text x="150" y="60" fontSize="8" fill="#C7363B" fontWeight="500">Lose 80% → Need 400% gain to recover</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="255" width="500" height="35" fill="#2A2A2C" rx="6"/>
    <text x="350" y="270" textAnchor="middle" fontSize="9" fill="white">The bigger your loss, the harder it becomes to recover. This math is why "just one more trade"</text>
    <text x="350" y="285" textAnchor="middle" fontSize="9" fill="#A0A3AA">to make back losses rarely works — you need increasingly larger wins.</text>
  </svg>
);

// SVG 5: Global Example - Lisa's Journey
const GlobalExampleSVG = () => (
  <svg viewBox="0 0 700 440" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="440" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Real-World Example: Lisa's Options Journey</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">A common pattern that plays out for many beginners</text>
    
    {/* Month 1 */}
    <g transform="translate(50, 70)">
      <rect x="0" y="0" width="600" height="55" fill="#EEF9F4" rx="8" stroke="#3CCB97" strokeWidth="1"/>
      <text x="50" y="20" fontSize="9" fontWeight="600" fill="#12805A">Month 1: The Beginning</text>
      <text x="50" y="35" fontSize="8" fill="#373A41">Lisa starts with $5,000. Buys call options on a popular tech stock.</text>
      <text x="50" y="48" fontSize="8" fill="#12805A">Stock goes up → She makes $800 (16% return). "This is amazing!"</text>
    </g>
    
    {/* Month 2 */}
    <g transform="translate(50, 135)">
      <rect x="0" y="0" width="600" height="55" fill="#EEF9F4" rx="8" stroke="#3CCB97" strokeWidth="1"/>
      <text x="50" y="20" fontSize="9" fontWeight="600" fill="#12805A">Month 2: Building Confidence</text>
      <text x="50" y="35" fontSize="8" fill="#373A41">Another win! She makes $600 more. Account now at $6,400.</text>
      <text x="50" y="48" fontSize="8" fill="#12805A">"I've got the hang of this. I'll increase my position sizes."</text>
    </g>
    
    {/* Month 3 */}
    <g transform="translate(50, 200)">
      <rect x="0" y="0" width="600" height="55" fill="#F6ECCE" rx="8" stroke="#E2C273" strokeWidth="1"/>
      <text x="50" y="20" fontSize="9" fontWeight="600" fill="#654B26">Month 3: The Turn</text>
      <text x="50" y="35" fontSize="8" fill="#373A41">Lisa buys $3,000 worth of options (bigger position). Stock doesn't move much.</text>
      <text x="50" y="48" fontSize="8" fill="#654B26">Options lose value from time decay. Loses $1,500. Account: $4,900</text>
    </g>
    
    {/* Month 4 */}
    <g transform="translate(50, 265)">
      <rect x="0" y="0" width="600" height="55" fill="#FDF1F1" rx="8" stroke="#F09B9B" strokeWidth="1"/>
      <text x="50" y="20" fontSize="9" fontWeight="600" fill="#C7363B">Month 4: Chasing</text>
      <text x="50" y="35" fontSize="8" fill="#373A41">"I need to make back that money." She bets $3,500 on a "sure thing."</text>
      <text x="50" y="48" fontSize="8" fill="#C7363B">The trade goes wrong. Loses $2,800. Account: $2,100</text>
    </g>
    
    {/* Month 5 */}
    <g transform="translate(50, 330)">
      <rect x="0" y="0" width="600" height="55" fill="#FDF1F1" rx="8" stroke="#C7363B" strokeWidth="2"/>
      <text x="50" y="20" fontSize="9" fontWeight="600" fill="#C7363B">Month 5: The End</text>
      <text x="50" y="35" fontSize="8" fill="#373A41">Desperate to recover, she makes one more big bet with remaining funds.</text>
      <text x="50" y="48" fontSize="8" fill="#C7363B">Total loss. Account: $400 remaining. Started with $5,000.</text>
    </g>
    
    {/* Summary */}
    <g transform="translate(50, 395)">
      <rect x="0" y="0" width="600" height="35" fill="#2A2A2C" rx="6"/>
      <text x="300" y="15" textAnchor="middle" fontSize="9" fill="white">Lisa wasn't foolish — she followed a pattern that affects most beginners.</text>
      <text x="300" y="28" textAnchor="middle" fontSize="8" fill="#A0A3AA">Early wins → Overconfidence → Bigger positions → Big loss → Emotional chasing → Account wipeout</text>
    </g>
  </svg>
);

// SVG 6: The House Edge Concept
const HouseEdgeSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">The Structural Disadvantages</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Beyond mistakes, the system itself creates headwinds for retail traders</text>
    
    {/* Factor 1 */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="190" height="150" fill="#FDF1F1" rx="10" stroke="#F09B9B" strokeWidth="1"/>
      <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#C7363B">Transaction Costs</text>
      
      <g transform="translate(10, 35)">
        <rect x="0" y="0" width="170" height="100" fill="white" rx="6"/>
        <text x="85" y="22" textAnchor="middle" fontSize="18">💸</text>
        <text x="85" y="42" textAnchor="middle" fontSize="7" fill="#373A41">Every trade has costs:</text>
        <text x="85" y="56" textAnchor="middle" fontSize="7" fill="#717680">• Brokerage fees</text>
        <text x="85" y="69" textAnchor="middle" fontSize="7" fill="#717680">• Bid-ask spread</text>
        <text x="85" y="82" textAnchor="middle" fontSize="7" fill="#717680">• Taxes on gains</text>
        <text x="85" y="95" textAnchor="middle" fontSize="7" fill="#C7363B">Adds up over many trades</text>
      </g>
    </g>
    
    {/* Factor 2 */}
    <g transform="translate(255, 75)">
      <rect x="0" y="0" width="190" height="150" fill="#F6ECCE" rx="10" stroke="#E2C273" strokeWidth="1"/>
      <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#654B26">Information Asymmetry</text>
      
      <g transform="translate(10, 35)">
        <rect x="0" y="0" width="170" height="100" fill="white" rx="6"/>
        <text x="85" y="22" textAnchor="middle" fontSize="18">🏦 vs 👤</text>
        <text x="85" y="42" textAnchor="middle" fontSize="7" fill="#373A41">Institutions have:</text>
        <text x="85" y="56" textAnchor="middle" fontSize="7" fill="#717680">• Faster data & execution</text>
        <text x="85" y="69" textAnchor="middle" fontSize="7" fill="#717680">• Research teams</text>
        <text x="85" y="82" textAnchor="middle" fontSize="7" fill="#717680">• Better pricing</text>
        <text x="85" y="95" textAnchor="middle" fontSize="7" fill="#654B26">You're competing with them</text>
      </g>
    </g>
    
    {/* Factor 3 */}
    <g transform="translate(460, 75)">
      <rect x="0" y="0" width="190" height="150" fill="#E0E7F1" rx="10" stroke="#9FB3D3" strokeWidth="1"/>
      <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#344C72">Time Decay</text>
      
      <g transform="translate(10, 35)">
        <rect x="0" y="0" width="170" height="100" fill="white" rx="6"/>
        <text x="85" y="22" textAnchor="middle" fontSize="18">⏰📉</text>
        <text x="85" y="42" textAnchor="middle" fontSize="7" fill="#373A41">For option buyers:</text>
        <text x="85" y="56" textAnchor="middle" fontSize="7" fill="#717680">• Value erodes daily</text>
        <text x="85" y="69" textAnchor="middle" fontSize="7" fill="#717680">• Even when "right"</text>
        <text x="85" y="82" textAnchor="middle" fontSize="7" fill="#717680">• Accelerates near expiry</text>
        <text x="85" y="95" textAnchor="middle" fontSize="7" fill="#344C72">Working against you 24/7</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="235" width="500" height="35" fill="#717680" rx="6"/>
    <text x="350" y="250" textAnchor="middle" fontSize="9" fill="white">Even without making mistakes, these factors create a constant headwind.</text>
    <text x="350" y="265" textAnchor="middle" fontSize="8" fill="#E4E4EA">You need to be right MORE often than wrong just to break even — and that's hard to sustain.</text>
  </svg>
);

// SVG 7: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 170" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="170" fill="url(#takeawayGradDeriv5)" rx="16"/>
    
    <defs>
      <linearGradient id="takeawayGradDeriv5" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B8923F"/>
        <stop offset="100%" stopColor="#C0623B"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="35" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">🎯 Key Takeaway</text>
    <text x="350" y="60" textAnchor="middle" fontSize="12" fill="white">Most beginners lose in derivatives due to a combination of psychological traps and structural disadvantages.</text>
    <text x="350" y="85" textAnchor="middle" fontSize="11" fill="#F6ECCE">Overconfidence after early wins, poor understanding of risk, and emotional decision-making</text>
    <text x="350" y="108" textAnchor="middle" fontSize="11" fill="#F6ECCE">combine with transaction costs, information gaps, and time decay.</text>
    <text x="350" y="135" textAnchor="middle" fontSize="10" fill="#F0C2A9">This isn't about intelligence — it's about the structure of the game.</text>
    <text x="350" y="158" textAnchor="middle" fontSize="9" fill="#E2C273">Knowing this helps you make informed decisions about whether to participate at all.</text>
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
    <text x="80" y="55" fontSize="9" fill="#842428">Understanding why people lose doesn't give you a formula to win. Knowledge of the trap doesn't make you immune to it.</text>
    <text x="80" y="70" fontSize="8" fill="#A52A2F">We're explaining patterns, not offering solutions. The safest approach may be not to play at all.</text>
  </svg>
);

const DerivLesson5 = () => {
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const quizQuestions = [
    {
      id: 1,
      question: "Why can early wins in derivatives trading be dangerous?",
      options: [
        "They attract too much attention from regulators",
        "They create overconfidence that leads to bigger positions and bigger losses",
        "They're usually illegal gains",
        "They require you to pay higher fees"
      ],
      correct: 1,
      explanation: "Early wins often create false confidence. Beginners interpret luck as skill, increase their position sizes, and then suffer larger losses when the inevitable losing trades come. The market is very good at giving beginners early wins."
    },
    {
      id: 2,
      question: "If you lose 50% of your trading account, how much do you need to gain to get back to your starting amount?",
      options: [
        "50% gain",
        "75% gain",
        "100% gain",
        "150% gain"
      ],
      correct: 2,
      explanation: "If you start with $10,000 and lose 50%, you have $5,000. To get back to $10,000, you need to gain $5,000 — which is 100% of your current $5,000. This asymmetric math is why losses compound so dangerously."
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
                Lesson 5 of 7 – Awareness Only
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-800 mb-2 tracking-[-0.025em]">Why Most Beginners Lose in Derivatives</h1>
            <p className="text-gray-600 text-lg">
              Understanding the patterns that lead to losses.
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mb-8">
          <WarningBannerSVG />
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.025em]">The Numbers Don't Lie</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Before we explore <em>why</em> beginners lose, let's acknowledge 
              the reality: <strong>the vast majority of retail derivative traders 
              lose money</strong>. This isn't speculation — it's documented by 
              financial regulators around the world.
            </p>
            <p className="text-lg leading-relaxed">
              Understanding this isn't meant to discourage you — it's meant to 
              help you make informed decisions with realistic expectations.
            </p>
          </div>
          
          <StatisticsRealitySVG />
        </div>

        {/* Common Mistakes Overview */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">The Three Categories of Mistakes</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Most beginner losses fall into three psychological categories. 
              These aren't character flaws — they're normal human tendencies 
              that derivatives markets are particularly good at exploiting.
            </p>
            <p className="text-lg leading-relaxed">
              Professional traders spend years learning to manage these tendencies. 
              That's partly why they can be profitable while most beginners aren't.
            </p>
          </div>
          
          <CommonMistakesSVG />
        </div>

        {/* The Overconfidence Cycle */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">The Dangerous Overconfidence Cycle</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              One of the cruelest aspects of derivatives trading is that markets 
              often give beginners <strong>early wins</strong>. These wins feel 
              like validation — "I've figured it out!" — but they're usually 
              just luck.
            </p>
            <p className="text-lg leading-relaxed">
              The confidence from those early wins leads to bigger positions, 
              which leads to bigger losses when the inevitable bad trade comes.
            </p>
          </div>
          
          <OverconfidenceCycleSVG />
          
          <div className="mt-6 bg-amber-50 rounded-xl p-5 border border-amber-200">
            <p className="text-amber-800">
              <strong>Key insight:</strong> A few winning trades don't prove 
              you have skill. Markets are random enough that almost anyone can 
              have a winning streak. The question is: what happens after that streak ends?
            </p>
          </div>
        </div>

        {/* Compounding Losses */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Why Losses Compound So Quickly</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              There's a mathematical reality that many beginners don't understand: 
              <strong> recovering from losses requires disproportionately larger gains</strong>.
            </p>
            <p className="text-lg leading-relaxed">
              This is why "I'll just make it back with one good trade" almost 
              never works. The deeper the hole, the more impossible it becomes 
              to climb out.
            </p>
          </div>
          
          <CompoundingLossesSVG />
        </div>

        {/* Global Example */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Real-World Example</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Let's follow a typical beginner's journey. This story is 
              fictional but represents a pattern that plays out thousands 
              of times every day.
            </p>
          </div>
          
          <GlobalExampleSVG />
          
          <div className="mt-6 bg-red-50 rounded-xl p-5 border border-red-200">
            <p className="text-red-800">
              <strong>Note:</strong> Lisa wasn't greedy, stupid, or reckless. 
              She followed a pattern that feels completely logical in the moment. 
              That's what makes it so dangerous.
            </p>
          </div>
        </div>

        {/* Structural Disadvantages */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">The Structural Disadvantages</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Beyond psychological mistakes, there are structural factors that 
              work against retail traders. Even if you could trade without 
              emotion, these headwinds make sustained profitability very difficult.
            </p>
            <p className="text-lg leading-relaxed">
              This isn't about "beating" these factors — it's about understanding 
              that the game itself is tilted.
            </p>
          </div>
          
          <HouseEdgeSVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
        </div>

        {/* India Context */}
        <div className="bg-amber-50 rounded-2xl p-6 shadow-lg mb-8 border border-amber-200">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">🇮🇳 India-Specific Note</h3>
          <p className="text-amber-900 mb-3">
            SEBI's 2023 study found that 89% of individual traders in the equity 
            F&O segment made losses, with an average net loss of ₹1.1 lakh per 
            person. Only about 11% were profitable, and most of those were 
            algorithmic or institutional traders.
          </p>
          <p className="text-amber-800 text-sm">
            These aren't random people — they include engineers, doctors, and 
            professionals who believed they could beat the odds. The data shows 
            that education and intelligence don't protect you from the structural 
            challenges of derivative trading.
          </p>
        </div>

        {/* Knowledge Check */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">📝 Knowledge Check</h2>
          <p className="text-gray-600 mb-6">Test your understanding of why beginners lose.</p>
          
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
              "If 70-90% of retail traders lose money, and most of them are 
              smart people who also believed they'd be in the winning minority, 
              what makes you think you'd be different?"
            </p>
            <p className="text-amber-200 text-sm">
              This isn't meant to insult — it's meant to prompt honest self-reflection. 
              Everyone who lost money also had reasons they thought they'd succeed.
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
                <li>✓ 70-90% of retail traders lose money</li>
                <li>✓ Overconfidence from early wins is dangerous</li>
                <li>✓ Losses require larger gains to recover</li>
                <li>✓ Structural factors work against retail traders</li>
              </ul>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Coming Next</h4>
              <ul className="text-orange-700 text-sm space-y-1">
                <li>→ Lesson 6: Time Decay and Expiration</li>
                <li>→ How options lose value over time</li>
                <li>→ Why "waiting it out" doesn't work</li>
                <li>→ The hidden cost of holding options</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            to="/learn/deriv-lesson-4"
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Previous: Risk in Futures & Options</span>
          </Link>
          <Link
            to="/learn/deriv-lesson-6"
            className="flex items-center gap-2 bg-brand-fill hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <span>Next: When Derivatives Are (and Aren't) Useful</span>
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default DerivLesson5;
