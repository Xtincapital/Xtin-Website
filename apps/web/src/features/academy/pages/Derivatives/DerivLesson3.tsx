import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

// SVG 1: What Is an Option
const WhatIsOptionSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">An Option: The Right, But Not the Obligation</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">You pay for the RIGHT to buy or sell — but you don't HAVE to use it</text>
    
    {/* Left side - Pay premium */}
    <g transform="translate(50, 80)">
      <rect x="0" y="0" width="180" height="150" fill="#E0E7F1" rx="12" stroke="#9FB3D3" strokeWidth="2"/>
      <text x="90" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#344C72">Step 1: Pay Premium</text>
      
      <g transform="translate(15, 45)">
        <rect x="0" y="0" width="150" height="90" fill="white" rx="8"/>
        <text x="75" y="25" textAnchor="middle" fontSize="22">💵</text>
        <text x="75" y="50" textAnchor="middle" fontSize="9" fill="#373A41">You pay a small amount</text>
        <text x="75" y="65" textAnchor="middle" fontSize="9" fill="#373A41">upfront (the "premium")</text>
        <text x="75" y="80" textAnchor="middle" fontSize="8" fill="#717680">This is non-refundable</text>
      </g>
    </g>
    
    {/* Arrow 1 */}
    <g transform="translate(240, 140)">
      <line x1="0" y1="15" x2="50" y2="15" stroke="#717680" strokeWidth="2"/>
      <polygon points="50,15 40,10 40,20" fill="#717680"/>
    </g>
    
    {/* Middle - Get the right */}
    <g transform="translate(260, 80)">
      <rect x="0" y="0" width="180" height="150" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
      <text x="90" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">Step 2: Receive a Right</text>
      
      <g transform="translate(15, 45)">
        <rect x="0" y="0" width="150" height="90" fill="white" rx="8"/>
        <text x="75" y="25" textAnchor="middle" fontSize="22">🎫</text>
        <text x="75" y="50" textAnchor="middle" fontSize="9" fill="#373A41">You now have the RIGHT</text>
        <text x="75" y="65" textAnchor="middle" fontSize="9" fill="#373A41">to buy/sell at a set price</text>
        <text x="75" y="80" textAnchor="middle" fontSize="8" fill="#717680">Until a specific date</text>
      </g>
    </g>
    
    {/* Arrow 2 */}
    <g transform="translate(450, 140)">
      <line x1="0" y1="15" x2="50" y2="15" stroke="#717680" strokeWidth="2"/>
      <polygon points="50,15 40,10 40,20" fill="#717680"/>
    </g>
    
    {/* Right side - Your choice */}
    <g transform="translate(470, 80)">
      <rect x="0" y="0" width="180" height="150" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
      <text x="90" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#654B26">Step 3: Your Choice</text>
      
      <g transform="translate(15, 45)">
        <rect x="0" y="0" width="150" height="90" fill="white" rx="8"/>
        <text x="75" y="25" textAnchor="middle" fontSize="22">🤔</text>
        <text x="75" y="50" textAnchor="middle" fontSize="9" fill="#373A41">Use it or let it expire</text>
        <text x="75" y="65" textAnchor="middle" fontSize="9" fill="#16A34A" fontWeight="500">It's YOUR decision</text>
        <text x="75" y="80" textAnchor="middle" fontSize="8" fill="#717680">No one can force you</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="240" width="500" height="30" fill="#2A2A2C" rx="6"/>
    <text x="350" y="253" textAnchor="middle" fontSize="9" fill="white">An option gives you the RIGHT to do something — you're not OBLIGATED to do it.</text>
    <text x="350" y="266" textAnchor="middle" fontSize="8" fill="#A0A3AA">If the deal doesn't make sense, you can simply walk away (losing only the premium).</text>
  </svg>
);

// SVG 2: Options vs Futures Comparison
const OptionsVsFuturesSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Options vs. Futures: The Key Difference</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">One is a choice, the other is an obligation</text>
    
    {/* Futures side */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="280" height="220" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">FUTURES</text>
      <text x="140" y="45" textAnchor="middle" fontSize="9" fill="#717680">An obligation</text>
      
      <g transform="translate(20, 60)">
        <rect x="0" y="0" width="240" height="140" fill="white" rx="8"/>
        
        <text x="120" y="25" textAnchor="middle" fontSize="24">📋 ⛓️</text>
        
        <text x="120" y="55" textAnchor="middle" fontSize="9" fill="#C7363B" fontWeight="500">You MUST complete the deal</text>
        
        <line x1="20" y1="70" x2="220" y2="70" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="120" y="88" textAnchor="middle" fontSize="8" fill="#373A41">• No upfront payment (premium)</text>
        <text x="120" y="103" textAnchor="middle" fontSize="8" fill="#373A41">• Both parties are bound</text>
        <text x="120" y="118" textAnchor="middle" fontSize="8" fill="#373A41">• No walking away</text>
        <text x="120" y="133" textAnchor="middle" fontSize="8" fill="#373A41">• Unlimited potential loss</text>
      </g>
    </g>
    
    {/* VS in middle */}
    <g transform="translate(330, 175)">
      <circle cx="20" cy="20" r="25" fill="#717680"/>
      <text x="20" y="26" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">VS</text>
    </g>
    
    {/* Options side */}
    <g transform="translate(370, 75)">
      <rect x="0" y="0" width="280" height="220" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A">OPTIONS</text>
      <text x="140" y="45" textAnchor="middle" fontSize="9" fill="#717680">A right (choice)</text>
      
      <g transform="translate(20, 60)">
        <rect x="0" y="0" width="240" height="140" fill="white" rx="8"/>
        
        <text x="120" y="25" textAnchor="middle" fontSize="24">🎫 ✓</text>
        
        <text x="120" y="55" textAnchor="middle" fontSize="9" fill="#16A34A" fontWeight="500">You CAN complete the deal (if you want)</text>
        
        <line x1="20" y1="70" x2="220" y2="70" stroke="#E4E4EA" strokeWidth="1"/>
        
        <text x="120" y="88" textAnchor="middle" fontSize="8" fill="#373A41">• Pay premium upfront</text>
        <text x="120" y="103" textAnchor="middle" fontSize="8" fill="#373A41">• Only seller is bound</text>
        <text x="120" y="118" textAnchor="middle" fontSize="8" fill="#373A41">• Buyer can walk away</text>
        <text x="120" y="133" textAnchor="middle" fontSize="8" fill="#373A41">• Max loss = premium paid</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="305" width="500" height="25" fill="#2A2A2C" rx="6"/>
    <text x="350" y="322" textAnchor="middle" fontSize="9" fill="white">Options cost money upfront — but that's the price of having a choice instead of an obligation.</text>
  </svg>
);

// SVG 3: The Movie Ticket Analogy
const MovieTicketAnalogySVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Think of It Like a Movie Ticket</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">A simple analogy to understand options</text>
    
    {/* Buy ticket */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="180" height="200" fill="#E0E7F1" rx="12" stroke="#9FB3D3" strokeWidth="2"/>
      <text x="90" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#344C72">You Buy a Ticket</text>
      
      <g transform="translate(15, 40)">
        <rect x="0" y="0" width="150" height="145" fill="white" rx="8"/>
        <text x="75" y="35" textAnchor="middle" fontSize="36">🎟️</text>
        <text x="75" y="65" textAnchor="middle" fontSize="9" fill="#373A41">You pay $15 for a</text>
        <text x="75" y="80" textAnchor="middle" fontSize="9" fill="#373A41">movie ticket</text>
        <text x="75" y="100" textAnchor="middle" fontSize="8" fill="#344C72">This is like paying</text>
        <text x="75" y="115" textAnchor="middle" fontSize="8" fill="#344C72">the "premium"</text>
        <text x="75" y="135" textAnchor="middle" fontSize="7" fill="#717680">Non-refundable</text>
      </g>
    </g>
    
    {/* Arrow */}
    <g transform="translate(240, 165)">
      <line x1="0" y1="0" x2="40" y2="0" stroke="#717680" strokeWidth="2"/>
      <polygon points="40,0 30,-5 30,5" fill="#717680"/>
    </g>
    
    {/* Your choice */}
    <g transform="translate(260, 75)">
      <rect x="0" y="0" width="180" height="200" fill="#F6ECCE" rx="12" stroke="#E2C273" strokeWidth="2"/>
      <text x="90" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B26">Movie Night Arrives</text>
      
      <g transform="translate(15, 40)">
        <rect x="0" y="0" width="150" height="145" fill="white" rx="8"/>
        <text x="75" y="35" textAnchor="middle" fontSize="36">🎬</text>
        <text x="75" y="65" textAnchor="middle" fontSize="9" fill="#373A41">You have the RIGHT</text>
        <text x="75" y="80" textAnchor="middle" fontSize="9" fill="#373A41">to watch the movie</text>
        <text x="75" y="100" textAnchor="middle" fontSize="8" fill="#654B26">But you don't</text>
        <text x="75" y="115" textAnchor="middle" fontSize="8" fill="#654B26">HAVE to go</text>
        <text x="75" y="135" textAnchor="middle" fontSize="7" fill="#717680">It's your choice!</text>
      </g>
    </g>
    
    {/* Arrow */}
    <g transform="translate(450, 165)">
      <line x1="0" y1="0" x2="40" y2="0" stroke="#717680" strokeWidth="2"/>
      <polygon points="40,0 30,-5 30,5" fill="#717680"/>
    </g>
    
    {/* Outcomes */}
    <g transform="translate(470, 75)">
      <rect x="0" y="0" width="180" height="200" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
      <text x="90" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16A34A">Two Possibilities</text>
      
      <g transform="translate(15, 40)">
        <rect x="0" y="0" width="150" height="65" fill="white" rx="6"/>
        <text x="75" y="18" textAnchor="middle" fontSize="8" fontWeight="500" fill="#16A34A">You go: 🎉</text>
        <text x="75" y="35" textAnchor="middle" fontSize="7" fill="#373A41">Enjoy the movie!</text>
        <text x="75" y="50" textAnchor="middle" fontSize="7" fill="#373A41">Ticket was worth it.</text>
        <text x="75" y="62" textAnchor="middle" fontSize="6" fill="#717680">(Exercise the option)</text>
      </g>
      
      <g transform="translate(15, 115)">
        <rect x="0" y="0" width="150" height="65" fill="white" rx="6"/>
        <text x="75" y="18" textAnchor="middle" fontSize="8" fontWeight="500" fill="#C7363B">You skip: 😴</text>
        <text x="75" y="35" textAnchor="middle" fontSize="7" fill="#373A41">Something came up.</text>
        <text x="75" y="50" textAnchor="middle" fontSize="7" fill="#373A41">You lose only $15.</text>
        <text x="75" y="62" textAnchor="middle" fontSize="6" fill="#717680">(Let option expire)</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="285" width="500" height="25" fill="#2A2A2C" rx="6"/>
    <text x="350" y="302" textAnchor="middle" fontSize="9" fill="white">The premium (ticket price) buys you the choice — not the obligation.</text>
  </svg>
);

// SVG 4: Two Types of Options
const TwoTypesOptionsSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">The Two Types of Options</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Call = Right to buy | Put = Right to sell (that's all you need to know for now)</text>
    
    {/* Call Option */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="280" height="180" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A">CALL OPTION</text>
      <text x="140" y="45" textAnchor="middle" fontSize="9" fill="#717680">The right to BUY</text>
      
      <g transform="translate(20, 60)">
        <rect x="0" y="0" width="240" height="100" fill="white" rx="8"/>
        
        <text x="120" y="28" textAnchor="middle" fontSize="28">📈 🛒</text>
        
        <text x="120" y="55" textAnchor="middle" fontSize="9" fill="#373A41">Gives you the right to</text>
        <text x="120" y="70" textAnchor="middle" fontSize="10" fill="#16A34A" fontWeight="600">BUY at a set price</text>
        
        <text x="120" y="90" textAnchor="middle" fontSize="8" fill="#717680">Useful if you think prices will go UP</text>
      </g>
    </g>
    
    {/* Put Option */}
    <g transform="translate(370, 75)">
      <rect x="0" y="0" width="280" height="180" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="140" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">PUT OPTION</text>
      <text x="140" y="45" textAnchor="middle" fontSize="9" fill="#717680">The right to SELL</text>
      
      <g transform="translate(20, 60)">
        <rect x="0" y="0" width="240" height="100" fill="white" rx="8"/>
        
        <text x="120" y="28" textAnchor="middle" fontSize="28">📉 🏷️</text>
        
        <text x="120" y="55" textAnchor="middle" fontSize="9" fill="#373A41">Gives you the right to</text>
        <text x="120" y="70" textAnchor="middle" fontSize="10" fill="#C7363B" fontWeight="600">SELL at a set price</text>
        
        <text x="120" y="90" textAnchor="middle" fontSize="8" fill="#717680">Useful if you think prices will go DOWN</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="265" width="500" height="25" fill="#717680" rx="6"/>
    <text x="350" y="282" textAnchor="middle" fontSize="9" fill="white">Don't worry about the details yet — just remember: Call = Buy, Put = Sell.</text>
  </svg>
);

// SVG 5: Global Example - Sarah's House
const GlobalExampleSVG = () => (
  <svg viewBox="0 0 700 420" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="420" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Real-World Example: Sarah and the House</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">Understanding options through a home-buying scenario</text>
    
    {/* Setup */}
    <g transform="translate(50, 70)">
      <rect x="0" y="0" width="600" height="70" fill="#E0E7F1" rx="10" stroke="#9FB3D3" strokeWidth="1"/>
      <text x="300" y="20" textAnchor="middle" fontSize="10" fontWeight="500" fill="#344C72">The Situation</text>
      <text x="300" y="38" textAnchor="middle" fontSize="9" fill="#373A41">Sarah finds a house she loves for $400,000. She's interested, but needs 3 months</text>
      <text x="300" y="53" textAnchor="middle" fontSize="9" fill="#373A41">to arrange financing and do inspections. She's worried someone else might buy it.</text>
    </g>
    
    {/* The option deal */}
    <g transform="translate(50, 150)">
      <rect x="0" y="0" width="600" height="55" fill="#F6ECCE" rx="8" stroke="#E2C273" strokeWidth="1"/>
      <text x="300" y="18" textAnchor="middle" fontSize="9" fontWeight="500" fill="#654B26">Sarah's Solution: Buy an Option</text>
      <text x="300" y="35" textAnchor="middle" fontSize="8" fill="#373A41">She pays the seller $5,000 for the RIGHT to buy the house at $400,000 within 3 months.</text>
      <text x="300" y="48" textAnchor="middle" fontSize="8" fill="#373A41">The $5,000 is the "premium" — it's non-refundable, but it secures her choice.</text>
    </g>
    
    {/* Scenario 1: She buys */}
    <g transform="translate(50, 220)">
      <rect x="0" y="0" width="290" height="145" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
      <text x="145" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#16A34A">Scenario A: She Exercises</text>
      <text x="145" y="38" textAnchor="middle" fontSize="8" fill="#717680">Financing approved, inspections pass</text>
      
      <g transform="translate(15, 50)">
        <rect x="0" y="0" width="260" height="80" fill="white" rx="6"/>
        
        <text x="130" y="20" textAnchor="middle" fontSize="22">🏠 ✅</text>
        
        <text x="130" y="42" textAnchor="middle" fontSize="8" fill="#373A41">Sarah uses her option and buys at $400,000</text>
        <text x="130" y="56" textAnchor="middle" fontSize="8" fill="#16A34A" fontWeight="500">Total cost: $405,000 ($400K + $5K premium)</text>
        <text x="130" y="70" textAnchor="middle" fontSize="7" fill="#717680">The premium was worth it for the certainty</text>
      </g>
    </g>
    
    {/* Scenario 2: She walks away */}
    <g transform="translate(360, 220)">
      <rect x="0" y="0" width="290" height="145" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="145" y="22" textAnchor="middle" fontSize="10" fontWeight="600" fill="#C7363B">Scenario B: She Walks Away</text>
      <text x="145" y="38" textAnchor="middle" fontSize="8" fill="#717680">Inspection reveals major problems</text>
      
      <g transform="translate(15, 50)">
        <rect x="0" y="0" width="260" height="80" fill="white" rx="6"/>
        
        <text x="130" y="20" textAnchor="middle" fontSize="22">🚶‍♀️ 💸</text>
        
        <text x="130" y="42" textAnchor="middle" fontSize="8" fill="#373A41">Sarah lets the option expire — doesn't buy</text>
        <text x="130" y="56" textAnchor="middle" fontSize="8" fill="#C7363B" fontWeight="500">She loses only the $5,000 premium</text>
        <text x="130" y="70" textAnchor="middle" fontSize="7" fill="#717680">Much better than being stuck with a bad house!</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="50" y="375" width="600" height="35" fill="#2A2A2C" rx="6"/>
    <text x="350" y="390" textAnchor="middle" fontSize="9" fill="white">The premium bought Sarah TIME and CHOICE. She wasn't obligated to buy.</text>
    <text x="350" y="405" textAnchor="middle" fontSize="8" fill="#A0A3AA">If it were a futures contract, she'd HAVE to buy — even with a defective foundation!</text>
  </svg>
);

// SVG 6: Why Options Cost Money
const WhyOptionsCostMoneySVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="14" fontWeight="600" fill="#373A41">Why Do Options Cost Money?</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#717680">The premium compensates the seller for taking on risk</text>
    
    {/* Buyer perspective */}
    <g transform="translate(50, 75)">
      <rect x="0" y="0" width="280" height="160" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">Option Buyer (You)</text>
      
      <g transform="translate(20, 45)">
        <rect x="0" y="0" width="240" height="95" fill="white" rx="8"/>
        
        <text x="120" y="22" textAnchor="middle" fontSize="18">😊</text>
        
        <text x="120" y="42" textAnchor="middle" fontSize="8" fill="#16A34A" fontWeight="500">Limited downside (lose only premium)</text>
        <text x="120" y="58" textAnchor="middle" fontSize="8" fill="#16A34A" fontWeight="500">Unlimited upside potential</text>
        <text x="120" y="74" textAnchor="middle" fontSize="8" fill="#16A34A" fontWeight="500">You have the CHOICE</text>
        
        <text x="120" y="90" textAnchor="middle" fontSize="7" fill="#717680">This flexibility has value!</text>
      </g>
    </g>
    
    {/* Seller perspective */}
    <g transform="translate(370, 75)">
      <rect x="0" y="0" width="280" height="160" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="140" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">Option Seller</text>
      
      <g transform="translate(20, 45)">
        <rect x="0" y="0" width="240" height="95" fill="white" rx="8"/>
        
        <text x="120" y="22" textAnchor="middle" fontSize="18">😰</text>
        
        <text x="120" y="42" textAnchor="middle" fontSize="8" fill="#C7363B" fontWeight="500">Limited upside (keeps only premium)</text>
        <text x="120" y="58" textAnchor="middle" fontSize="8" fill="#C7363B" fontWeight="500">Potentially large losses</text>
        <text x="120" y="74" textAnchor="middle" fontSize="8" fill="#C7363B" fontWeight="500">They're OBLIGATED if you exercise</text>
        
        <text x="120" y="90" textAnchor="middle" fontSize="7" fill="#717680">They need compensation for this risk!</text>
      </g>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="245" width="500" height="25" fill="#2A2A2C" rx="6"/>
    <text x="350" y="262" textAnchor="middle" fontSize="9" fill="white">The premium is the price of having flexibility. The seller gets paid to give up their choice.</text>
  </svg>
);

// SVG 7: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 160" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="160" fill="url(#takeawayGradDeriv3)" rx="16"/>
    
    <defs>
      <linearGradient id="takeawayGradDeriv3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#B8923F"/>
        <stop offset="100%" stopColor="#C0623B"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="35" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">🎯 Key Takeaway</text>
    <text x="350" y="60" textAnchor="middle" fontSize="12" fill="white">An option gives you the RIGHT, but not the obligation, to buy or sell.</text>
    <text x="350" y="85" textAnchor="middle" fontSize="11" fill="#F6ECCE">This is the key difference from futures (where both parties MUST complete the deal).</text>
    <text x="350" y="110" textAnchor="middle" fontSize="10" fill="#F0C2A9">You pay a premium upfront for this flexibility — it's the cost of having a choice.</text>
    <text x="350" y="135" textAnchor="middle" fontSize="10" fill="#E2C273">Call = Right to buy | Put = Right to sell</text>
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
    <text x="80" y="55" fontSize="9" fill="#842428">Options sound simpler because you "can't lose more than the premium" — but most option buyers lose.</text>
    <text x="80" y="70" fontSize="8" fill="#A52A2F">We're covering concepts only. The premium you pay often expires worthless.</text>
  </svg>
);

const DerivLesson3 = () => {
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const quizQuestions = [
    {
      id: 1,
      question: "What is the key difference between an option and a futures contract?",
      options: [
        "Options are cheaper than futures",
        "Options give you a choice; futures are an obligation",
        "Futures expire; options don't",
        "Options are only for stocks; futures are for commodities"
      ],
      correct: 1,
      explanation: "The fundamental difference is that an option gives you the RIGHT (but not obligation) to buy or sell, while a futures contract is a binding OBLIGATION — both parties must complete the transaction."
    },
    {
      id: 2,
      question: "What is the 'premium' in options?",
      options: [
        "The profit you make from the option",
        "The upfront payment for the right to buy or sell",
        "A bonus the seller gives you",
        "The interest rate on the contract"
      ],
      correct: 1,
      explanation: "The premium is the upfront cost you pay to purchase an option. It gives you the right (choice) to buy or sell at a set price. If you don't use the option, you lose only this premium."
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
                Lesson 3 of 7 – Awareness Only
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-2 tracking-[-0.025em]">What Are Options?</h1>
            <p className="text-gray-600 text-lg">
              Understanding the right to choose.
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="mb-8">
          <WarningBannerSVG />
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.025em]">What Is an Option?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              An <strong>option</strong> is exactly what it sounds like — it gives you 
              an <strong>option</strong> (a choice).
            </p>
            <p className="text-lg leading-relaxed mb-4">
              When you buy an option, you're paying for the <strong>right</strong> to 
              buy or sell something at a specific price — but you're not 
              <strong> required</strong> to do it.
            </p>
            <p className="text-lg leading-relaxed">
              This is the crucial difference from futures. With futures, you <em>must</em> 
              complete the deal. With options, you can walk away.
            </p>
          </div>
          
          <WhatIsOptionSVG />
        </div>

        {/* Options vs Futures */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Options vs. Futures: Side by Side</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Now that you understand both concepts, let's see them side by side. 
              The core difference comes down to one word: <strong>obligation</strong>.
            </p>
            <p className="text-lg leading-relaxed">
              With futures, you're locked in. With options, you have flexibility — 
              but you pay for that flexibility upfront.
            </p>
          </div>
          
          <OptionsVsFuturesSVG />
          
          <div className="mt-6 bg-amber-50 rounded-xl p-5 border border-amber-200">
            <p className="text-amber-800">
              <strong>Key insight:</strong> Options cost money upfront (the premium), 
              but this limits your maximum loss. With futures, there's no upfront 
              cost, but your potential losses can be much larger.
            </p>
          </div>
        </div>

        {/* Movie Ticket Analogy */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">A Simple Analogy</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Think of an option like buying a movie ticket. You pay upfront, 
              and you get the <strong>right</strong> to watch the movie — but 
              if something comes up, you don't have to go. You just lose the 
              ticket price.
            </p>
          </div>
          
          <MovieTicketAnalogySVG />
        </div>

        {/* Two Types */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">The Two Types of Options</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              There are two basic types of options. For now, you just need to 
              know they exist — we won't go deeper into how they work.
            </p>
            <p className="text-lg leading-relaxed">
              <strong>Call</strong> = The right to BUY. 
              <strong> Put</strong> = The right to SELL. That's it.
            </p>
          </div>
          
          <TwoTypesOptionsSVG />
          
          <div className="mt-6 bg-gray-100 rounded-xl p-5">
            <p className="text-gray-700">
              <strong>Don't memorize details.</strong> Many beginners get overwhelmed 
              trying to understand calls and puts. For this awareness lesson, just 
              know they exist and what they represent at a basic level.
            </p>
          </div>
        </div>

        {/* Global Example */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Real-World Example</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Let's see how options work in a practical scenario that has 
              nothing to do with trading — buying a house.
            </p>
          </div>
          
          <GlobalExampleSVG />
          
          <div className="mt-6 bg-brand-soft rounded-xl p-5 border border-brand-line">
            <p className="text-brand">
              <strong>The lesson:</strong> The $5,000 premium bought Sarah something 
              valuable: time and flexibility. She could investigate properly without 
              fear of losing the house, and walk away if it wasn't right.
            </p>
          </div>
        </div>

        {/* Why Options Cost Money */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Why Do Options Cost Money?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Options aren't free because they shift risk from the buyer to the seller. 
              The premium compensates the seller for taking on potential obligations.
            </p>
            <p className="text-lg leading-relaxed">
              Think about it: if you have all the upside and can walk away from 
              downside, someone on the other side is absorbing that risk. They 
              need to be paid for it.
            </p>
          </div>
          
          <WhyOptionsCostMoneySVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
        </div>

        {/* India Context */}
        <div className="bg-amber-50 rounded-2xl p-6 shadow-lg mb-8 border border-amber-200">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">🇮🇳 India-Specific Note</h3>
          <p className="text-amber-900 mb-3">
            In India, options on Nifty 50 and Bank Nifty are extremely popular — 
            some of the most traded in the world. Individual stock options are 
            also available on NSE.
          </p>
          <p className="text-amber-800 text-sm">
            However, SEBI studies consistently show that most retail traders who 
            buy options lose money. The "limited loss" feature sounds attractive, 
            but premiums add up quickly, and most options expire worthless. This 
            is why we're focusing on awareness, not trading.
          </p>
        </div>

        {/* Knowledge Check */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">📝 Knowledge Check</h2>
          <p className="text-gray-600 mb-6">Test your understanding of options basics.</p>
          
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
              "If options limit your loss to just the premium, why do most 
              retail option buyers lose money over time?"
            </p>
            <p className="text-amber-200 text-sm">
              Hint: Think about how often you'd need to be right versus how 
              much you pay in premiums over many trades.
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
                <li>✓ Options give you a right, not an obligation</li>
                <li>✓ You pay a premium upfront for flexibility</li>
                <li>✓ Call = right to buy, Put = right to sell</li>
                <li>✓ Max loss for buyer = premium paid</li>
              </ul>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Coming Next</h4>
              <ul className="text-orange-700 text-sm space-y-1">
                <li>→ Lesson 4: Leverage and Margin</li>
                <li>→ How derivatives amplify gains AND losses</li>
                <li>→ Why a small move can wipe you out</li>
                <li>→ The danger of "easy money" thinking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            to="/learn/deriv-lesson-2"
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Previous: What Are Futures?</span>
          </Link>
          <Link
            to="/learn/deriv-lesson-4"
            className="flex items-center gap-2 bg-brand-fill hover:bg-brand-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <span>Next: Risk in Futures & Options</span>
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default DerivLesson3;
