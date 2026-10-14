import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

// SVG 1: Why Derivatives Are Risky
const WhyRiskySVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Why Are Derivatives Risky?</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Three core reasons derivatives can lead to large losses</text>
    
    {/* Reason 1: Amplified moves */}
    <g transform="translate(50, 80)">
      <rect x="0" y="0" width="190" height="170" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="95" y="28" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">Amplified Moves</text>
      
      <g transform="translate(15, 45)">
        <rect x="0" y="0" width="160" height="105" fill="white" rx="8"/>
        <text x="80" y="25" textAnchor="middle" fontSize="24">📈📉</text>
        <text x="80" y="50" textAnchor="middle" fontSize="8" fill="#373A41">Small price changes in</text>
        <text x="80" y="63" textAnchor="middle" fontSize="8" fill="#373A41">the underlying asset can</text>
        <text x="80" y="76" textAnchor="middle" fontSize="8" fill="#C7363B" fontWeight="500">cause BIG changes</text>
        <text x="80" y="89" textAnchor="middle" fontSize="8" fill="#C7363B" fontWeight="500">in your position</text>
      </g>
    </g>
    
    {/* Reason 2: Time works against you */}
    <g transform="translate(255, 80)">
      <rect x="0" y="0" width="190" height="170" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
      <text x="95" y="28" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B26">Time Pressure</text>
      
      <g transform="translate(15, 45)">
        <rect x="0" y="0" width="160" height="105" fill="white" rx="8"/>
        <text x="80" y="25" textAnchor="middle" fontSize="24">⏰💸</text>
        <text x="80" y="50" textAnchor="middle" fontSize="8" fill="#373A41">Derivatives have</text>
        <text x="80" y="63" textAnchor="middle" fontSize="8" fill="#373A41">expiration dates.</text>
        <text x="80" y="76" textAnchor="middle" fontSize="8" fill="#654B26" fontWeight="500">Time constantly</text>
        <text x="80" y="89" textAnchor="middle" fontSize="8" fill="#654B26" fontWeight="500">erodes value</text>
      </g>
    </g>
    
    {/* Reason 3: Obligations */}
    <g transform="translate(460, 80)">
      <rect x="0" y="0" width="190" height="170" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="95" y="28" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">Binding Obligations</text>
      
      <g transform="translate(15, 45)">
        <rect x="0" y="0" width="160" height="105" fill="white" rx="8"/>
        <text x="80" y="25" textAnchor="middle" fontSize="24">⛓️📋</text>
        <text x="80" y="50" textAnchor="middle" fontSize="8" fill="#373A41">With futures (and selling</text>
        <text x="80" y="63" textAnchor="middle" fontSize="8" fill="#373A41">options), you can be</text>
        <text x="80" y="76" textAnchor="middle" fontSize="8" fill="#C7363B" fontWeight="500">forced to fulfill the</text>
        <text x="80" y="89" textAnchor="middle" fontSize="8" fill="#C7363B" fontWeight="500">contract at a loss</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="260" width="500" height="30" fill="#C7363B" rx="6"/>
    <text x="350" y="273" textAnchor="middle" fontSize="9" fill="white">These factors combine to make derivatives much riskier than simply buying and holding stocks.</text>
    <text x="350" y="286" textAnchor="middle" fontSize="8" fill="#F6C3C3">Understanding these risks is essential before even considering derivatives.</text>
  </svg>
);

// SVG 2: Limited vs Unlimited Risk
const LimitedUnlimitedRiskSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Limited Risk vs. Unlimited Risk</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Understanding the spectrum of potential losses</text>
    
    {/* Limited Risk - Buying Options */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="280" height="210" fill="#EEF9F4" rx="12" stroke="#3CCB97" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#12805A">LIMITED RISK</text>
      <text x="140" y="42" textAnchor="middle" fontSize="9" fill="#717680">Buying options</text>
      
      <g transform="translate(20, 55)">
        <rect x="0" y="0" width="240" height="135" fill="white" rx="8"/>
        
        <text x="120" y="25" textAnchor="middle" fontSize="24">🎫</text>
        
        <text x="120" y="50" textAnchor="middle" fontSize="9" fill="#373A41">When you BUY an option:</text>
        
        <line x1="20" y1="62" x2="220" y2="62" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="120" y="80" textAnchor="middle" fontSize="8" fill="#12805A" fontWeight="500">Maximum loss = Premium paid</text>
        <text x="120" y="95" textAnchor="middle" fontSize="8" fill="#373A41">You paid $500 for the option?</text>
        <text x="120" y="108" textAnchor="middle" fontSize="8" fill="#373A41">Worst case: you lose $500.</text>
        <text x="120" y="125" textAnchor="middle" fontSize="7" fill="#717680">The option expires worthless, but</text>
        <text x="120" y="135" textAnchor="middle" fontSize="7" fill="#717680">you can't lose more than you paid.</text>
      </g>
    </g>
    
    {/* Unlimited Risk - Futures & Selling Options */}
    <g transform="translate(370, 75)">
      <rect x="0" y="0" width="280" height="210" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">UNLIMITED RISK</text>
      <text x="140" y="42" textAnchor="middle" fontSize="9" fill="#717680">Futures & Selling options</text>
      
      <g transform="translate(20, 55)">
        <rect x="0" y="0" width="240" height="135" fill="white" rx="8"/>
        
        <text x="120" y="25" textAnchor="middle" fontSize="24">⚠️</text>
        
        <text x="120" y="50" textAnchor="middle" fontSize="9" fill="#373A41">With futures or selling options:</text>
        
        <line x1="20" y1="62" x2="220" y2="62" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="120" y="80" textAnchor="middle" fontSize="8" fill="#C7363B" fontWeight="500">Losses can exceed your initial amount</text>
        <text x="120" y="95" textAnchor="middle" fontSize="8" fill="#373A41">You might deposit $5,000...</text>
        <text x="120" y="108" textAnchor="middle" fontSize="8" fill="#373A41">and lose $15,000 or more.</text>
        <text x="120" y="125" textAnchor="middle" fontSize="7" fill="#717680">There's no natural cap on how much</text>
        <text x="120" y="135" textAnchor="middle" fontSize="7" fill="#717680">the market can move against you.</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="295" width="500" height="35" fill="#2A2A2C" rx="6"/>
    <text x="350" y="310" textAnchor="middle" fontSize="9" fill="white">"Limited risk" sounds safer — but remember, losing 100% of your premium is still losing everything you put in.</text>
    <text x="350" y="325" textAnchor="middle" fontSize="8" fill="#A0A3AA">"Unlimited risk" can mean owing MORE money than you started with.</text>
  </svg>
);

// SVG 3: Speed of Losses
const SpeedOfLossesSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Losses Can Happen Faster Than You Expect</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Derivatives move quickly — there's often no time to react</text>
    
    {/* Stocks comparison */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="280" height="180" fill="#E0E7F1" rx="12" stroke="#9FB3D3" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#344C72">Stocks</text>
      <text x="140" y="42" textAnchor="middle" fontSize="9" fill="#717680">Slower, more gradual changes</text>
      
      <g transform="translate(20, 55)">
        <rect x="0" y="0" width="240" height="105" fill="white" rx="8"/>
        
        {/* Gradual decline visual */}
        <g transform="translate(20, 15)">
          <line x1="0" y1="0" x2="200" y2="0" stroke="#E4E4EA" strokeWidth="1"/>
          <line x1="0" y1="25" x2="200" y2="25" stroke="#E4E4EA" strokeWidth="1"/>
          <line x1="0" y1="50" x2="200" y2="50" stroke="#E4E4EA" strokeWidth="1"/>
          
          {/* Gradual line */}
          <polyline points="0,10 50,15 100,20 150,30 200,40" fill="none" stroke="#344C72" strokeWidth="2"/>
          <text x="100" y="70" textAnchor="middle" fontSize="7" fill="#717680">Gradual decline over weeks/months</text>
        </g>
        
        <text x="120" y="95" textAnchor="middle" fontSize="8" fill="#373A41">Time to think, react, or hold</text>
      </g>
    </g>
    
    {/* Derivatives comparison */}
    <g transform="translate(370, 75)">
      <rect x="0" y="0" width="280" height="180" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">Derivatives</text>
      <text x="140" y="42" textAnchor="middle" fontSize="9" fill="#717680">Rapid, dramatic changes</text>
      
      <g transform="translate(20, 55)">
        <rect x="0" y="0" width="240" height="105" fill="white" rx="8"/>
        
        {/* Sharp decline visual */}
        <g transform="translate(20, 15)">
          <line x1="0" y1="0" x2="200" y2="0" stroke="#E4E4EA" strokeWidth="1"/>
          <line x1="0" y1="25" x2="200" y2="25" stroke="#E4E4EA" strokeWidth="1"/>
          <line x1="0" y1="50" x2="200" y2="50" stroke="#E4E4EA" strokeWidth="1"/>
          
          {/* Sharp drop line */}
          <polyline points="0,5 30,5 35,45 200,50" fill="none" stroke="#C7363B" strokeWidth="2"/>
          <text x="100" y="70" textAnchor="middle" fontSize="7" fill="#717680">Sudden drop in hours or minutes</text>
        </g>
        
        <text x="120" y="95" textAnchor="middle" fontSize="8" fill="#C7363B" fontWeight="500">No time to react — damage is done</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="265" width="500" height="25" fill="#C7363B" rx="6"/>
    <text x="350" y="282" textAnchor="middle" fontSize="9" fill="white">Markets can gap overnight, open sharply against you, and you can't do anything about it.</text>
  </svg>
);

// SVG 4: The Margin Call Problem
const MarginCallSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">The Margin Call: When Losses Force Action</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">With futures, you can be forced to add money or have your position closed</text>
    
    {/* Step 1 */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="140" height="190" fill="#E0E7F1" rx="10" stroke="#9FB3D3" strokeWidth="1"/>
      <text x="70" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#344C72">Step 1</text>
      <text x="70" y="38" textAnchor="middle" fontSize="7" fill="#717680">You deposit margin</text>
      
      <g transform="translate(10, 50)">
        <rect x="0" y="0" width="120" height="125" fill="white" rx="6"/>
        <text x="60" y="25" textAnchor="middle" fontSize="20">💰</text>
        <text x="60" y="50" textAnchor="middle" fontSize="8" fill="#373A41">Deposit $5,000</text>
        <text x="60" y="65" textAnchor="middle" fontSize="8" fill="#373A41">as "good faith"</text>
        <text x="60" y="85" textAnchor="middle" fontSize="7" fill="#717680">This is your margin</text>
        <text x="60" y="100" textAnchor="middle" fontSize="7" fill="#717680">It's not the full</text>
        <text x="60" y="112" textAnchor="middle" fontSize="7" fill="#717680">contract value</text>
      </g>
    </g>
    
    {/* Arrow */}
    <g transform="translate(195, 160)">
      <line x1="0" y1="0" x2="25" y2="0" stroke="#717680" strokeWidth="2"/>
      <polygon points="25,0 18,-4 18,4" fill="#717680"/>
    </g>
    
    {/* Step 2 */}
    <g transform="translate(230, 75)">
      <rect x="0" y="0" width="140" height="190" fill="#F6ECCE" rx="10" stroke="#E2C273" strokeWidth="1"/>
      <text x="70" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#654B26">Step 2</text>
      <text x="70" y="38" textAnchor="middle" fontSize="7" fill="#717680">Market moves against you</text>
      
      <g transform="translate(10, 50)">
        <rect x="0" y="0" width="120" height="125" fill="white" rx="6"/>
        <text x="60" y="25" textAnchor="middle" fontSize="20">📉</text>
        <text x="60" y="50" textAnchor="middle" fontSize="8" fill="#373A41">Your position loses</text>
        <text x="60" y="65" textAnchor="middle" fontSize="8" fill="#373A41">value rapidly</text>
        <text x="60" y="85" textAnchor="middle" fontSize="7" fill="#654B26">Margin balance</text>
        <text x="60" y="100" textAnchor="middle" fontSize="7" fill="#654B26">drops below</text>
        <text x="60" y="112" textAnchor="middle" fontSize="7" fill="#654B26">required level</text>
      </g>
    </g>
    
    {/* Arrow */}
    <g transform="translate(375, 160)">
      <line x1="0" y1="0" x2="25" y2="0" stroke="#717680" strokeWidth="2"/>
      <polygon points="25,0 18,-4 18,4" fill="#717680"/>
    </g>
    
    {/* Step 3 */}
    <g transform="translate(410, 75)">
      <rect x="0" y="0" width="140" height="190" fill="#FDF1F1" rx="10" stroke="#F09B9B" strokeWidth="1"/>
      <text x="70" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#C7363B">Step 3</text>
      <text x="70" y="38" textAnchor="middle" fontSize="7" fill="#717680">Margin call!</text>
      
      <g transform="translate(10, 50)">
        <rect x="0" y="0" width="120" height="125" fill="white" rx="6"/>
        <text x="60" y="25" textAnchor="middle" fontSize="20">📞</text>
        <text x="60" y="50" textAnchor="middle" fontSize="8" fill="#C7363B" fontWeight="500">Add more money</text>
        <text x="60" y="65" textAnchor="middle" fontSize="8" fill="#C7363B" fontWeight="500">immediately!</text>
        <text x="60" y="85" textAnchor="middle" fontSize="7" fill="#373A41">Or your position</text>
        <text x="60" y="100" textAnchor="middle" fontSize="7" fill="#373A41">will be forcibly</text>
        <text x="60" y="112" textAnchor="middle" fontSize="7" fill="#373A41">closed at a loss</text>
      </g>
    </g>
    
    {/* Arrow */}
    <g transform="translate(555, 160)">
      <line x1="0" y1="0" x2="25" y2="0" stroke="#717680" strokeWidth="2"/>
      <polygon points="25,0 18,-4 18,4" fill="#717680"/>
    </g>
    
    {/* Step 4 */}
    <g transform="translate(590, 75)">
      <rect x="0" y="0" width="60" height="190" fill="#FDF1F1" rx="10" stroke="#C7363B" strokeWidth="2"/>
      <text x="30" y="100" textAnchor="middle" fontSize="24">😰</text>
      <text x="30" y="130" textAnchor="middle" fontSize="7" fill="#C7363B">Loss</text>
      <text x="30" y="145" textAnchor="middle" fontSize="7" fill="#C7363B">locked</text>
      <text x="30" y="160" textAnchor="middle" fontSize="7" fill="#C7363B">in</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="280" width="500" height="30" fill="#2A2A2C" rx="6"/>
    <text x="350" y="293" textAnchor="middle" fontSize="9" fill="white">Margin calls don't wait for you to check your phone. They happen automatically.</text>
    <text x="350" y="306" textAnchor="middle" fontSize="8" fill="#A0A3AA">You can wake up to find your position closed and money gone.</text>
  </svg>
);

// SVG 5: Global Example - Tom's Futures Loss
const GlobalExampleSVG = () => (
  <svg viewBox="0 0 700 420" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="420" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Real-World Example: Tom's Oil Futures</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">How a "sure thing" became a nightmare</text>
    
    {/* Setup */}
    <g transform="translate(50, 70)">
      <rect x="0" y="0" width="600" height="65" fill="#E0E7F1" rx="10" stroke="#9FB3D3" strokeWidth="1"/>
      <text x="300" y="18" textAnchor="middle" fontSize="10" fontWeight="500" fill="#344C72">The Setup</text>
      <text x="300" y="35" textAnchor="middle" fontSize="9" fill="#373A41">Tom reads that oil prices will rise due to supply cuts. He's confident.</text>
      <text x="300" y="50" textAnchor="middle" fontSize="9" fill="#373A41">He deposits $10,000 margin to buy oil futures worth $100,000 (10:1 exposure).</text>
    </g>
    
    {/* His thinking */}
    <g transform="translate(50, 145)">
      <rect x="0" y="0" width="600" height="50" fill="#EEF9F4" rx="8" stroke="#3CCB97" strokeWidth="1"/>
      <text x="300" y="18" textAnchor="middle" fontSize="9" fontWeight="500" fill="#12805A">Tom's Thinking</text>
      <text x="300" y="35" textAnchor="middle" fontSize="8" fill="#373A41">"If oil goes up 5%, I make $5,000 on my $10,000 — that's 50% return! Easy money!"</text>
    </g>
    
    {/* What happened */}
    <g transform="translate(50, 210)">
      <rect x="0" y="0" width="600" height="65" fill="#FDF1F1" rx="10" stroke="#F09B9B" strokeWidth="1"/>
      <text x="300" y="18" textAnchor="middle" fontSize="10" fontWeight="500" fill="#C7363B">What Actually Happened</text>
      <text x="300" y="35" textAnchor="middle" fontSize="9" fill="#373A41">Unexpected news: A country increased production. Oil dropped 8% overnight.</text>
      <text x="300" y="50" textAnchor="middle" fontSize="9" fill="#373A41">Tom's position lost $8,000 while he was sleeping. He woke up to a margin call.</text>
    </g>
    
    {/* The math */}
    <g transform="translate(50, 290)">
      <rect x="0" y="0" width="290" height="85" fill="white" rx="8" stroke="#E4E4EA" strokeWidth="1"/>
      <text x="145" y="20" textAnchor="middle" fontSize="9" fontWeight="500" fill="#373A41">The Math (simplified)</text>
      <text x="145" y="40" textAnchor="middle" fontSize="8" fill="#717680">$100,000 exposure × 8% drop = $8,000 loss</text>
      <text x="145" y="55" textAnchor="middle" fontSize="8" fill="#717680">Tom's $10,000 margin → $2,000 remaining</text>
      <text x="145" y="70" textAnchor="middle" fontSize="8" fill="#C7363B" fontWeight="500">80% of his money gone in one night</text>
    </g>
    
    {/* Outcome */}
    <g transform="translate(360, 290)">
      <rect x="0" y="0" width="290" height="85" fill="#FDF1F1" rx="8" stroke="#F09B9B" strokeWidth="1"/>
      <text x="145" y="20" textAnchor="middle" fontSize="9" fontWeight="500" fill="#C7363B">The Outcome</text>
      <text x="145" y="40" textAnchor="middle" fontSize="8" fill="#373A41">Tom had to deposit more money or</text>
      <text x="145" y="55" textAnchor="middle" fontSize="8" fill="#373A41">close his position at a massive loss.</text>
      <text x="145" y="70" textAnchor="middle" fontSize="8" fill="#C7363B" fontWeight="500">His "sure thing" cost him $8,000.</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="50" y="385" width="600" height="25" fill="#2A2A2C" rx="6"/>
    <text x="350" y="402" textAnchor="middle" fontSize="9" fill="white">Tom was RIGHT about the long-term trend. But futures don't care about "long-term" — they punish you NOW.</text>
  </svg>
);

// SVG 6: Common Ways People Lose
const CommonLossesSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Common Ways Beginners Lose Money</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Understanding these patterns can help you avoid them</text>
    
    {/* Loss type 1 */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="190" height="175" fill="#FDF1F1" rx="10" stroke="#F09B9B" strokeWidth="1"/>
      <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#C7363B">Premiums Add Up</text>
      
      <g transform="translate(10, 35)">
        <rect x="0" y="0" width="170" height="125" fill="white" rx="6"/>
        <text x="85" y="22" textAnchor="middle" fontSize="18">💸💸💸</text>
        <text x="85" y="45" textAnchor="middle" fontSize="8" fill="#373A41">Buying options that</text>
        <text x="85" y="58" textAnchor="middle" fontSize="8" fill="#373A41">expire worthless,</text>
        <text x="85" y="71" textAnchor="middle" fontSize="8" fill="#373A41">over and over.</text>
        <text x="85" y="90" textAnchor="middle" fontSize="7" fill="#C7363B">"I only lost $200 each time"</text>
        <text x="85" y="103" textAnchor="middle" fontSize="7" fill="#C7363B">× 50 trades = $10,000</text>
        <text x="85" y="118" textAnchor="middle" fontSize="6" fill="#717680">Small losses compound</text>
      </g>
    </g>
    
    {/* Loss type 2 */}
    <g transform="translate(255, 75)">
      <rect x="0" y="0" width="190" height="175" fill="#FDF1F1" rx="10" stroke="#F09B9B" strokeWidth="1"/>
      <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#C7363B">Holding Too Long</text>
      
      <g transform="translate(10, 35)">
        <rect x="0" y="0" width="170" height="125" fill="white" rx="6"/>
        <text x="85" y="22" textAnchor="middle" fontSize="18">🙈⏰</text>
        <text x="85" y="45" textAnchor="middle" fontSize="8" fill="#373A41">Hoping a losing</text>
        <text x="85" y="58" textAnchor="middle" fontSize="8" fill="#373A41">position will recover</text>
        <text x="85" y="71" textAnchor="middle" fontSize="8" fill="#373A41">while time erodes value.</text>
        <text x="85" y="90" textAnchor="middle" fontSize="7" fill="#C7363B">"It'll come back"</text>
        <text x="85" y="103" textAnchor="middle" fontSize="7" fill="#C7363B">→ It doesn't</text>
        <text x="85" y="118" textAnchor="middle" fontSize="6" fill="#717680">Time decay is relentless</text>
      </g>
    </g>
    
    {/* Loss type 3 */}
    <g transform="translate(460, 75)">
      <rect x="0" y="0" width="190" height="175" fill="#FDF1F1" rx="10" stroke="#F09B9B" strokeWidth="1"/>
      <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#C7363B">Overleveraging</text>
      
      <g transform="translate(10, 35)">
        <rect x="0" y="0" width="170" height="125" fill="white" rx="6"/>
        <text x="85" y="22" textAnchor="middle" fontSize="18">🎰📈</text>
        <text x="85" y="45" textAnchor="middle" fontSize="8" fill="#373A41">Taking positions</text>
        <text x="85" y="58" textAnchor="middle" fontSize="8" fill="#373A41">too large for</text>
        <text x="85" y="71" textAnchor="middle" fontSize="8" fill="#373A41">your account size.</text>
        <text x="85" y="90" textAnchor="middle" fontSize="7" fill="#C7363B">"Go big or go home"</text>
        <text x="85" y="103" textAnchor="middle" fontSize="7" fill="#C7363B">→ Goes home broke</text>
        <text x="85" y="118" textAnchor="middle" fontSize="6" fill="#717680">One bad trade = account wipeout</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="260" width="500" height="30" fill="#717680" rx="6"/>
    <text x="350" y="273" textAnchor="middle" fontSize="9" fill="white">None of these require being "wrong" about the market direction.</text>
    <text x="350" y="286" textAnchor="middle" fontSize="8" fill="#E4E4EA">You can be right about the direction and STILL lose money with derivatives.</text>
  </svg>
);

// SVG 7: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 170" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="170" fill="url(#takeawayGradDeriv4)" rx="16"/>
    
    <defs>
      <linearGradient id="takeawayGradDeriv4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C7363B"/>
        <stop offset="100%" stopColor="#842428"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="35" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">⚠️ Key Takeaway</text>
    <text x="350" y="60" textAnchor="middle" fontSize="12" fill="white">Derivatives are risky because losses can be large, fast, and sometimes unlimited.</text>
    <text x="350" y="85" textAnchor="middle" fontSize="11" fill="#F6C3C3">With futures and selling options, you can lose MORE than you invested.</text>
    <text x="350" y="110" textAnchor="middle" fontSize="10" fill="#F09B9B">Even buying options (limited risk) means you can lose 100% of your premium.</text>
    <text x="350" y="135" textAnchor="middle" fontSize="10" fill="#F26B6B">Being "right" about direction isn't enough — timing and position size matter enormously.</text>
    <text x="350" y="158" textAnchor="middle" fontSize="9" fill="#F09B9B">This is why most retail derivative traders lose money.</text>
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
    <text x="80" y="55" fontSize="9" fill="#842428">Understanding risk doesn't mean you can manage it. Professional traders with years of experience still lose.</text>
    <text x="80" y="70" fontSize="8" fill="#A52A2F">We're explaining WHY derivatives are risky — not how to "handle" the risk.</text>
  </svg>
);

const DerivLesson4 = () => {
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const quizQuestions = [
    {
      id: 1,
      question: "What does 'unlimited risk' mean in derivatives trading?",
      options: [
        "You might not make any profit",
        "The market can be unpredictable",
        "You can lose more money than you initially invested",
        "There are many different strategies to learn"
      ],
      correct: 2,
      explanation: "Unlimited risk means your losses are not capped at your initial investment. With futures or selling options, if the market moves sharply against you, you can end up owing more money than you put in."
    },
    {
      id: 2,
      question: "Why can derivatives losses happen faster than stock losses?",
      options: [
        "Derivatives are traded on faster computers",
        "Derivatives have amplified exposure and time pressure",
        "Stocks are protected by regulations",
        "Derivatives only trade during certain hours"
      ],
      correct: 1,
      explanation: "Derivatives have amplified exposure (small market moves = big position changes) and time pressure (options lose value as expiration approaches). These factors can cause rapid, dramatic losses that don't occur with simply holding stocks."
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
              <div className="bg-red-100 p-3 rounded-xl">
                <FaExclamationTriangle className="text-red-600 text-2xl" />
              </div>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                Lesson 4 of 7 – Awareness Only
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-800 mb-2 tracking-[-0.025em]">Risk in Futures & Options</h1>
            <p className="text-gray-600 text-lg">
              Understanding why derivatives can lead to large losses.
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mb-8">
          <WarningBannerSVG />
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.025em]">Why Are Derivatives Risky?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              By now you understand what futures and options are. But understanding 
              <strong> what</strong> they are is different from understanding 
              <strong> why</strong> they're dangerous.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Derivatives aren't inherently "bad" — they serve important purposes 
              for businesses. But for individual traders, especially beginners, 
              they carry risks that aren't obvious until you experience them.
            </p>
            <p className="text-lg leading-relaxed">
              Let's explore the core reasons why derivatives lead to losses for 
              most retail traders.
            </p>
          </div>
          
          <WhyRiskySVG />
        </div>

        {/* Limited vs Unlimited Risk */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Limited Risk vs. Unlimited Risk</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Not all derivative positions carry the same level of risk. The key 
              distinction is between <strong>limited</strong> and <strong>unlimited</strong> risk.
            </p>
            <p className="text-lg leading-relaxed">
              When you <em>buy</em> an option, your maximum loss is what you paid 
              (the premium). When you trade <em>futures</em> or <em>sell</em> options, 
              your potential losses have no natural ceiling.
            </p>
          </div>
          
          <LimitedUnlimitedRiskSVG />
          
          <div className="mt-6 bg-red-50 rounded-xl p-5 border border-red-200">
            <p className="text-red-800">
              <strong>Important:</strong> "Limited risk" doesn't mean "safe." If you 
              buy an option for $1,000 and it expires worthless, you've lost $1,000 — 
              that's 100% of what you put in. It's just that you can't lose <em>more</em> 
              than $1,000.
            </p>
          </div>
        </div>

        {/* Speed of Losses */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Losses Happen Fast</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              With stocks, if you buy at $100 and it drops to $90, you're down 10%. 
              You have time to think, to wait, to decide.
            </p>
            <p className="text-lg leading-relaxed">
              With derivatives, that same 10% move in the underlying can mean a 
              50%, 80%, or even 100% loss in your position — sometimes overnight 
              or within hours.
            </p>
          </div>
          
          <SpeedOfLossesSVG />
        </div>

        {/* Margin Calls */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">The Margin Call</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              When trading futures, you don't pay the full value of the contract — 
              you deposit a smaller amount called "margin." This amplifies your 
              exposure.
            </p>
            <p className="text-lg leading-relaxed">
              If your position loses money, your broker can demand you add more 
              funds immediately. If you can't (or don't), they'll close your 
              position — locking in your loss.
            </p>
          </div>
          
          <MarginCallSVG />
          
          <div className="mt-6 bg-amber-50 rounded-xl p-5 border border-amber-200">
            <p className="text-amber-800">
              <strong>Key point:</strong> Margin calls don't come at convenient times. 
              They happen when markets move sharply — often during volatile moments 
              when prices are at their worst.
            </p>
          </div>
        </div>

        {/* Global Example */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Real-World Example</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Let's see how these risks play out in a realistic scenario. Note: 
              this story is simplified but represents what happens to many traders.
            </p>
          </div>
          
          <GlobalExampleSVG />
          
          <div className="mt-6 bg-red-50 rounded-xl p-5 border border-red-200">
            <p className="text-red-800">
              <strong>The cruel irony:</strong> Tom might have been right about oil 
              prices eventually. But with futures, "eventually" doesn't matter. 
              The margin call forced him out before his thesis could play out.
            </p>
          </div>
        </div>

        {/* Common Ways to Lose */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">How Beginners Typically Lose</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Understanding common loss patterns can help you recognize why 
              derivatives are particularly challenging for new traders.
            </p>
          </div>
          
          <CommonLossesSVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
        </div>

        {/* India Context */}
        <div className="bg-amber-50 rounded-2xl p-6 shadow-lg mb-8 border border-amber-200">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">🇮🇳 India-Specific Note</h3>
          <p className="text-amber-900 mb-3">
            SEBI studies have consistently shown that over 90% of individual 
            F&O traders in India lose money. The average loss is significant — 
            often ₹50,000 or more per year.
          </p>
          <p className="text-amber-800 text-sm">
            In response, SEBI has introduced peak margin requirements, increased 
            lot sizes, and restricted weekly expiries. These regulations exist 
            specifically because of the documented harm to retail traders.
          </p>
        </div>

        {/* Knowledge Check */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">📝 Knowledge Check</h2>
          <p className="text-gray-600 mb-6">Test your understanding of derivative risks.</p>
          
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
        <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-2xl p-8 shadow-lg mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <FaLightbulb className="text-2xl text-red-200" />
            <h3 className="text-xl font-semibold">Reflection Question</h3>
          </div>
          <div className="bg-white/20 rounded-xl p-5">
            <p className="text-white font-medium mb-3">Think about this:</p>
            <p className="text-red-100 text-lg mb-4">
              "If you bought an option and were right about the direction but 
              still lost money, how would that feel? Would you understand why it happened?"
            </p>
            <p className="text-red-200 text-sm">
              Consider: Being "right" about the market isn't the same as making money. 
              Timing, position size, and time decay all play crucial roles.
            </p>
          </div>
        </div>

        {/* Lesson Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📚 Lesson Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">What You Learned</h4>
              <ul className="text-red-700 text-sm space-y-1">
                <li>✓ Why derivatives carry amplified risk</li>
                <li>✓ Difference between limited and unlimited risk</li>
                <li>✓ How losses can happen extremely fast</li>
                <li>✓ What margin calls are and why they hurt</li>
              </ul>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Coming Next</h4>
              <ul className="text-orange-700 text-sm space-y-1">
                <li>→ Lesson 5: Time Decay and Expiration</li>
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
            to="/learn/deriv-lesson-3"
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Previous: What Are Options?</span>
          </Link>
          <Link
            to="/learn/deriv-lesson-5"
            className="flex items-center gap-2 bg-brand-fill hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <span>Next: Why Most Beginners Lose in Derivatives</span>
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default DerivLesson4;
