import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle, FaLightbulb } from 'react-icons/fa';
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";

const QuizQuestion = ({ question, options, correctAnswer, explanation }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswerClick = (option) => {
    setSelectedAnswer(option);
    setShowResult(true);
  };

  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <div className="bg-white rounded-xl p-6 shadow-md mb-6 border border-gray-100">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">{question}</h4>
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(option)}
            disabled={showResult}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              showResult
                ? option === correctAnswer
                  ? 'border-green-500 bg-green-50'
                  : option === selectedAnswer
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-gray-50'
                : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {showResult && (
        <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          {isCorrect ? (
            <FaCheckCircle className="text-green-600 text-xl flex-shrink-0 mt-0.5" />
          ) : (
            <FaTimesCircle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
              {isCorrect ? 'Correct!' : 'Not quite right'}
            </p>
            <p className="text-gray-700 mt-1">{explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// SVG 1: Three Layers of Risk
const ThreeLayersOfRiskSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="15" fontWeight="600" fill="#404047">The Three Layers of Risk</text>
    <text x="350" y="50" textAnchor="middle" fontSize="10" fill="#75757D">Every investment decision involves multiple risk dimensions</text>
    
    {/* Concentric circles showing layers */}
    <g transform="translate(350, 185)">
      {/* Outer layer - Market Risk */}
      <ellipse cx="0" cy="0" rx="200" ry="120" fill="#E0E7F1" stroke="#5A77AA" strokeWidth="3"/>
      <text x="0" y="-95" textAnchor="middle" fontSize="11" fontWeight="600" fill="#2C3F5E">MARKET RISK</text>
      <text x="0" y="-80" textAnchor="middle" fontSize="8" fill="#2C3F5E">Price movements • Volatility • External forces</text>
      
      {/* Middle layer - System Risk */}
      <ellipse cx="0" cy="0" rx="130" ry="75" fill="#F6ECCE" stroke="#B8923F" strokeWidth="3"/>
      <text x="0" y="-50" textAnchor="middle" fontSize="11" fontWeight="600" fill="#7C5D2B">SYSTEM RISK</text>
      <text x="0" y="-35" textAnchor="middle" fontSize="8" fill="#7C5D2B">Tools • Execution • Process</text>
      
      {/* Inner layer - Emotional Risk */}
      <ellipse cx="0" cy="0" rx="60" ry="35" fill="#ECE4F6" stroke="#8F6FC4" strokeWidth="3"/>
      <text x="0" y="-5" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B8A">EMOTIONAL</text>
      <text x="0" y="10" textAnchor="middle" fontSize="10" fontWeight="600" fill="#654B8A">RISK</text>
      <text x="0" y="25" textAnchor="middle" fontSize="7" fill="#654B8A">You</text>
    </g>
    
    {/* Legend */}
    <g transform="translate(50, 280)">
      <rect x="0" y="0" width="600" height="30" fill="#232327" rx="6"/>
      <circle cx="100" cy="15" r="6" fill="#5A77AA"/>
      <text x="115" y="19" fontSize="8" fill="white">Visible on charts</text>
      <circle cx="280" cy="15" r="6" fill="#B8923F"/>
      <text x="295" y="19" fontSize="8" fill="white">Hidden in process</text>
      <circle cx="460" cy="15" r="6" fill="#8F6FC4"/>
      <text x="475" y="19" fontSize="8" fill="white">Inside your mind</text>
    </g>
  </svg>
);

// SVG 2: Market Risk Explained
const MarketRiskSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#404047">Market Risk: The Visible Risk</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#75757D">What most people think of when they hear "risk"</text>
    
    {/* Chart visualization */}
    <g transform="translate(100, 70)">
      <rect x="0" y="0" width="500" height="150" fill="#F1F4F9" rx="8" stroke="#C3D0E4" strokeWidth="1"/>
      
      {/* Price line with volatility */}
      <path d="M30 100 L80 80 L130 110 L180 60 L230 90 L280 40 L330 120 L380 70 L430 85 L470 50" 
            fill="none" stroke="#5A77AA" strokeWidth="3" strokeLinecap="round"/>
      
      {/* Downward arrow showing risk */}
      <g transform="translate(330, 90)">
        <line x1="0" y1="0" x2="0" y2="40" stroke="#E04848" strokeWidth="3"/>
        <polygon points="-8,35 0,50 8,35" fill="#E04848"/>
        <text x="15" y="30" fontSize="8" fill="#C7363B">Price drops</text>
      </g>
      
      {/* Upward arrow */}
      <g transform="translate(180, 90)">
        <line x1="0" y1="30" x2="0" y2="-10" stroke="#1FA978" strokeWidth="3"/>
        <polygon points="-8,-5 0,-20 8,-5" fill="#1FA978"/>
        <text x="15" y="10" fontSize="8" fill="#12805A">Price rises</text>
      </g>
      
      {/* Y-axis label */}
      <text x="15" y="75" fontSize="8" fill="#75757D" transform="rotate(-90 15 75)">Price</text>
      
      {/* X-axis label */}
      <text x="250" y="145" textAnchor="middle" fontSize="8" fill="#75757D">Time</text>
    </g>
    
    {/* Examples */}
    <g transform="translate(50, 235)">
      <text x="0" y="0" fontSize="9" fontWeight="600" fill="#2C3F5E">Examples:</text>
      <text x="70" y="0" fontSize="9" fill="#404047">Economic news • Company earnings • Interest rate changes • Global events • Sector movements</text>
    </g>
    
    {/* Key insight */}
    <rect x="50" y="250" width="600" height="20" fill="#E0E7F1" rx="4"/>
    <text x="350" y="264" textAnchor="middle" fontSize="8" fill="#2C3F5E">Market risk is external — you cannot control it, only respond to it.</text>
  </svg>
);

// SVG 3: System Risk Explained
const SystemRiskSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#404047">System Risk: The Hidden Risk</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#75757D">Risks in processes, tools, and execution that don't appear on price charts</text>
    
    {/* Process flow with failure points */}
    <g transform="translate(50, 80)">
      {/* Step 1: Decision */}
      <rect x="0" y="30" width="100" height="60" fill="#D5F2E5" rx="8" stroke="#77D3AE" strokeWidth="2"/>
      <text x="50" y="55" textAnchor="middle" fontSize="9" fontWeight="600" fill="#0D543C">Decision</text>
      <text x="50" y="70" textAnchor="middle" fontSize="7" fill="#0D543C">Make a choice</text>
      
      {/* Arrow 1 */}
      <line x1="105" y1="60" x2="140" y2="60" stroke="#A3A1A6" strokeWidth="2"/>
      <polygon points="138,55 150,60 138,65" fill="#A3A1A6"/>
      
      {/* Step 2: Platform */}
      <rect x="150" y="30" width="100" height="60" fill="#F6ECCE" rx="8" stroke="#E2C273" strokeWidth="2"/>
      <text x="200" y="55" textAnchor="middle" fontSize="9" fontWeight="600" fill="#7C5D2B">Platform</text>
      <text x="200" y="70" textAnchor="middle" fontSize="7" fill="#7C5D2B">Submit order</text>
      
      {/* Failure indicator */}
      <circle cx="250" cy="30" r="12" fill="#FDF1F1" stroke="#E04848" strokeWidth="2"/>
      <text x="250" y="35" textAnchor="middle" fontSize="10" fill="#E04848">!</text>
      <text x="250" y="15" fontSize="6" fill="#C7363B">App crash?</text>
      
      {/* Arrow 2 */}
      <line x1="255" y1="60" x2="290" y2="60" stroke="#A3A1A6" strokeWidth="2"/>
      <polygon points="288,55 300,60 288,65" fill="#A3A1A6"/>
      
      {/* Step 3: Network */}
      <rect x="300" y="30" width="100" height="60" fill="#F6ECCE" rx="8" stroke="#E2C273" strokeWidth="2"/>
      <text x="350" y="55" textAnchor="middle" fontSize="9" fontWeight="600" fill="#7C5D2B">Network</text>
      <text x="350" y="70" textAnchor="middle" fontSize="7" fill="#7C5D2B">Transmit data</text>
      
      {/* Failure indicator */}
      <circle cx="400" cy="30" r="12" fill="#FDF1F1" stroke="#E04848" strokeWidth="2"/>
      <text x="400" y="35" textAnchor="middle" fontSize="10" fill="#E04848">!</text>
      <text x="400" y="15" fontSize="6" fill="#C7363B">Slow/offline?</text>
      
      {/* Arrow 3 */}
      <line x1="405" y1="60" x2="440" y2="60" stroke="#A3A1A6" strokeWidth="2"/>
      <polygon points="438,55 450,60 438,65" fill="#A3A1A6"/>
      
      {/* Step 4: Exchange */}
      <rect x="450" y="30" width="100" height="60" fill="#F6ECCE" rx="8" stroke="#E2C273" strokeWidth="2"/>
      <text x="500" y="55" textAnchor="middle" fontSize="9" fontWeight="600" fill="#7C5D2B">Exchange</text>
      <text x="500" y="70" textAnchor="middle" fontSize="7" fill="#7C5D2B">Execute trade</text>
      
      {/* Failure indicator */}
      <circle cx="550" cy="30" r="12" fill="#FDF1F1" stroke="#E04848" strokeWidth="2"/>
      <text x="550" y="35" textAnchor="middle" fontSize="10" fill="#E04848">!</text>
      <text x="550" y="15" fontSize="6" fill="#C7363B">Delayed?</text>
    </g>
    
    {/* System risk categories */}
    <g transform="translate(50, 180)">
      <rect x="0" y="0" width="190" height="70" fill="#F6ECCE" rx="8" stroke="#E2C273" strokeWidth="1"/>
      <text x="95" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#7C5D2B">Technology Failures</text>
      <text x="95" y="38" textAnchor="middle" fontSize="7" fill="#533E22">App crashes, freezes,</text>
      <text x="95" y="50" textAnchor="middle" fontSize="7" fill="#533E22">wrong price display</text>
      
      <rect x="205" y="0" width="190" height="70" fill="#F6ECCE" rx="8" stroke="#E2C273" strokeWidth="1"/>
      <text x="300" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#7C5D2B">Connectivity Issues</text>
      <text x="300" y="38" textAnchor="middle" fontSize="7" fill="#533E22">Internet outages, slow</text>
      <text x="300" y="50" textAnchor="middle" fontSize="7" fill="#533E22">connections, data lag</text>
      
      <rect x="410" y="0" width="190" height="70" fill="#F6ECCE" rx="8" stroke="#E2C273" strokeWidth="1"/>
      <text x="505" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#7C5D2B">Execution Gaps</text>
      <text x="505" y="38" textAnchor="middle" fontSize="7" fill="#533E22">Slippage, delays,</text>
      <text x="505" y="50" textAnchor="middle" fontSize="7" fill="#533E22">partial fills, errors</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="50" y="265" width="600" height="25" fill="#F6ECCE" rx="6"/>
    <text x="350" y="282" textAnchor="middle" fontSize="9" fill="#654B26">System risk can strike at the worst possible moment — when you need to act quickly.</text>
  </svg>
);

// SVG 4: Emotional Risk Explained
const EmotionalRiskSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#404047">Emotional Risk: The Internal Risk</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#75757D">The risk you bring to every decision — your own psychology</text>
    
    {/* Brain with emotion zones */}
    <g transform="translate(350, 165)">
      {/* Brain outline */}
      <ellipse cx="0" cy="0" rx="100" ry="80" fill="#F6F2FB" stroke="#C0A9E2" strokeWidth="3"/>
      
      {/* Emotional zones */}
      <g transform="translate(-60, -30)">
        <circle cx="0" cy="0" r="25" fill="#F6C3C3" stroke="#E04848" strokeWidth="2"/>
        <text x="0" y="-5" textAnchor="middle" fontSize="7" fontWeight="600" fill="#C7363B">FEAR</text>
        <text x="0" y="8" textAnchor="middle" fontSize="6" fill="#842428">Panic selling</text>
      </g>
      
      <g transform="translate(60, -30)">
        <circle cx="0" cy="0" r="25" fill="#ABE5CC" stroke="#1FA978" strokeWidth="2"/>
        <text x="0" y="-5" textAnchor="middle" fontSize="7" fontWeight="600" fill="#12805A">GREED</text>
        <text x="0" y="8" textAnchor="middle" fontSize="6" fill="#0D543C">Over-exposure</text>
      </g>
      
      <g transform="translate(-60, 35)">
        <circle cx="0" cy="0" r="25" fill="#F6ECCE" stroke="#B8923F" strokeWidth="2"/>
        <text x="0" y="-5" textAnchor="middle" fontSize="7" fontWeight="600" fill="#9A7634">HOPE</text>
        <text x="0" y="8" textAnchor="middle" fontSize="6" fill="#7C5D2B">Denial of loss</text>
      </g>
      
      <g transform="translate(60, 35)">
        <circle cx="0" cy="0" r="25" fill="#D9CBEE" stroke="#8F6FC4" strokeWidth="2"/>
        <text x="0" y="-5" textAnchor="middle" fontSize="7" fontWeight="600" fill="#7A5BA6">REGRET</text>
        <text x="0" y="8" textAnchor="middle" fontSize="6" fill="#654B8A">Revenge trades</text>
      </g>
      
      {/* Center */}
      <circle cx="0" cy="0" r="15" fill="#C0A9E2" stroke="#8F6FC4" strokeWidth="2"/>
      <text x="0" y="4" textAnchor="middle" fontSize="6" fontWeight="600" fill="#654B8A">YOU</text>
    </g>
    
    {/* Side labels */}
    <g transform="translate(50, 120)">
      <rect x="0" y="0" width="130" height="100" fill="#ECE4F6" rx="8" stroke="#C0A9E2" strokeWidth="1"/>
      <text x="65" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#654B8A">Emotional Triggers</text>
      <text x="65" y="42" textAnchor="middle" fontSize="7" fill="#533F70">• Seeing losses grow</text>
      <text x="65" y="56" textAnchor="middle" fontSize="7" fill="#533F70">• Missing opportunities</text>
      <text x="65" y="70" textAnchor="middle" fontSize="7" fill="#533F70">• Comparing to others</text>
      <text x="65" y="84" textAnchor="middle" fontSize="7" fill="#533F70">• Time pressure</text>
    </g>
    
    <g transform="translate(520, 120)">
      <rect x="0" y="0" width="130" height="100" fill="#ECE4F6" rx="8" stroke="#C0A9E2" strokeWidth="1"/>
      <text x="65" y="22" textAnchor="middle" fontSize="9" fontWeight="600" fill="#654B8A">Emotional Actions</text>
      <text x="65" y="42" textAnchor="middle" fontSize="7" fill="#533F70">• Abandon plan</text>
      <text x="65" y="56" textAnchor="middle" fontSize="7" fill="#533F70">• Size up impulsively</text>
      <text x="65" y="70" textAnchor="middle" fontSize="7" fill="#533F70">• Exit too early/late</text>
      <text x="65" y="84" textAnchor="middle" fontSize="7" fill="#533F70">• Chase price moves</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="265" width="500" height="25" fill="#ECE4F6" rx="6"/>
    <text x="350" y="282" textAnchor="middle" fontSize="9" fill="#654B8A">Emotional risk is the only risk you have direct control over — and often the most destructive.</text>
  </svg>
);

// SVG 5: Risks Interact and Compound
const RisksInteractSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#404047">How Risks Interact and Compound</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#75757D">Risks rarely appear alone — they trigger and amplify each other</text>
    
    {/* Three risk nodes */}
    <g transform="translate(350, 170)">
      {/* Market Risk Node */}
      <circle cx="-120" cy="-60" r="45" fill="#E0E7F1" stroke="#5A77AA" strokeWidth="3"/>
      <text x="-120" y="-65" textAnchor="middle" fontSize="9" fontWeight="600" fill="#2C3F5E">Market</text>
      <text x="-120" y="-50" textAnchor="middle" fontSize="9" fontWeight="600" fill="#2C3F5E">Risk</text>
      
      {/* System Risk Node */}
      <circle cx="120" cy="-60" r="45" fill="#F6ECCE" stroke="#B8923F" strokeWidth="3"/>
      <text x="120" y="-65" textAnchor="middle" fontSize="9" fontWeight="600" fill="#7C5D2B">System</text>
      <text x="120" y="-50" textAnchor="middle" fontSize="9" fontWeight="600" fill="#7C5D2B">Risk</text>
      
      {/* Emotional Risk Node */}
      <circle cx="0" cy="80" r="45" fill="#ECE4F6" stroke="#8F6FC4" strokeWidth="3"/>
      <text x="0" y="75" textAnchor="middle" fontSize="9" fontWeight="600" fill="#654B8A">Emotional</text>
      <text x="0" y="90" textAnchor="middle" fontSize="9" fontWeight="600" fill="#654B8A">Risk</text>
      
      {/* Connecting arrows with labels */}
      {/* Market → Emotional */}
      <path d="M-85 -25 Q-60 30 -35 55" fill="none" stroke="#A3A1A6" strokeWidth="2" markerEnd="url(#arrowGray)"/>
      <text x="-80" y="25" fontSize="6" fill="#75757D">Price drops</text>
      <text x="-80" y="35" fontSize="6" fill="#75757D">trigger fear</text>
      
      {/* System → Emotional */}
      <path d="M85 -25 Q60 30 35 55" fill="none" stroke="#A3A1A6" strokeWidth="2" markerEnd="url(#arrowGray)"/>
      <text x="55" y="25" fontSize="6" fill="#75757D">Failures</text>
      <text x="55" y="35" fontSize="6" fill="#75757D">cause panic</text>
      
      {/* Market ↔ System */}
      <path d="M-70 -60 L70 -60" fill="none" stroke="#A3A1A6" strokeWidth="2"/>
      <text x="0" y="-70" textAnchor="middle" fontSize="6" fill="#75757D">Volatility overloads systems</text>
      
      {/* Emotional → Both */}
      <path d="M-25 45 Q-70 0 -90 -20" fill="none" stroke="#E04848" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrowRed)"/>
      <path d="M25 45 Q70 0 90 -20" fill="none" stroke="#E04848" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrowRed)"/>
      
      <defs>
        <marker id="arrowGray" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#A3A1A6"/>
        </marker>
        <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#E04848"/>
        </marker>
      </defs>
    </g>
    
    {/* Feedback loop warning */}
    <g transform="translate(520, 200)">
      <rect x="0" y="0" width="140" height="60" fill="#FDF1F1" rx="8" stroke="#F09B9B" strokeWidth="1"/>
      <text x="70" y="20" textAnchor="middle" fontSize="8" fontWeight="600" fill="#C7363B">⚠️ Feedback Loop</text>
      <text x="70" y="35" textAnchor="middle" fontSize="7" fill="#842428">Emotional reactions</text>
      <text x="70" y="48" textAnchor="middle" fontSize="7" fill="#842428">create new risks</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="285" width="500" height="25" fill="#232327" rx="6"/>
    <text x="350" y="302" textAnchor="middle" fontSize="9" fill="white">A single risk rarely causes failure. Risk compounding does.</text>
  </svg>
);

// SVG 6: Visible vs Invisible Risk
const VisibleVsInvisibleSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#404047">Visible vs Invisible Risk</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#75757D">What you see on charts is only part of the picture</text>
    
    {/* Iceberg visualization */}
    <g transform="translate(350, 175)">
      {/* Water line */}
      <line x1="-250" y1="0" x2="250" y2="0" stroke="#5A77AA" strokeWidth="2" strokeDasharray="8"/>
      <text x="220" y="-10" fontSize="8" fill="#344C72">Surface</text>
      
      {/* Above water - visible */}
      <polygon points="-60,-80 60,-80 80,-10 -80,-10" fill="#E0E7F1" stroke="#5A77AA" strokeWidth="2"/>
      <text x="0" y="-50" textAnchor="middle" fontSize="10" fontWeight="600" fill="#2C3F5E">MARKET RISK</text>
      <text x="0" y="-35" textAnchor="middle" fontSize="7" fill="#2C3F5E">Price charts, news,</text>
      <text x="0" y="-22" textAnchor="middle" fontSize="7" fill="#2C3F5E">visible movements</text>
      
      {/* Below water - invisible */}
      <polygon points="-80,10 80,10 120,50 100,90 -100,90 -120,50" fill="#F6ECCE" stroke="#B8923F" strokeWidth="2"/>
      <text x="0" y="35" textAnchor="middle" fontSize="9" fontWeight="600" fill="#7C5D2B">SYSTEM RISK</text>
      <text x="0" y="50" textAnchor="middle" fontSize="7" fill="#654B26">Hidden process failures</text>
      <text x="0" y="63" textAnchor="middle" fontSize="7" fill="#654B26">Technology vulnerabilities</text>
      
      {/* Deepest - emotional */}
      <polygon points="-100,95 100,95 60,130 -60,130" fill="#ECE4F6" stroke="#8F6FC4" strokeWidth="2"/>
      <text x="0" y="115" textAnchor="middle" fontSize="9" fontWeight="600" fill="#654B8A">EMOTIONAL RISK</text>
      
      {/* Water effect */}
      <rect x="-250" y="0" width="500" height="140" fill="rgba(90, 119, 170, 0.1)"/>
    </g>
    
    {/* Labels */}
    <g transform="translate(50, 100)">
      <rect x="0" y="0" width="100" height="50" fill="#E0E7F1" rx="6"/>
      <text x="50" y="20" textAnchor="middle" fontSize="8" fontWeight="600" fill="#2C3F5E">👁️ VISIBLE</text>
      <text x="50" y="35" textAnchor="middle" fontSize="7" fill="#2C3F5E">Easy to track</text>
    </g>
    
    <g transform="translate(550, 180)">
      <rect x="0" y="0" width="100" height="50" fill="#FDF1F1" rx="6"/>
      <text x="50" y="20" textAnchor="middle" fontSize="8" fontWeight="600" fill="#C7363B">🙈 INVISIBLE</text>
      <text x="50" y="35" textAnchor="middle" fontSize="7" fill="#C7363B">Easy to ignore</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="265" width="500" height="25" fill="#232327" rx="6"/>
    <text x="350" y="282" textAnchor="middle" fontSize="9" fill="white">The risks you don't see are often the ones that sink you.</text>
  </svg>
);

// SVG 7: Scenario - Multiple Risks at Once
const MultipleRisksScenarioSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#404047">When All Three Risks Strike Together</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#75757D">A realistic scenario showing risk compounding</text>
    
    {/* Timeline */}
    <line x1="80" y1="280" x2="620" y2="280" stroke="#CFCBC1" strokeWidth="2"/>
    
    {/* Event 1: Market */}
    <g transform="translate(100, 80)">
      <circle cx="30" cy="200" r="8" fill="#5A77AA" stroke="#2C3F5E" strokeWidth="2"/>
      <line x1="30" y1="192" x2="30" y2="130" stroke="#5A77AA" strokeWidth="2"/>
      
      <rect x="0" y="0" width="130" height="120" fill="#E0E7F1" rx="8" stroke="#5A77AA" strokeWidth="2"/>
      <text x="65" y="22" textAnchor="middle" fontSize="9" fontWeight="700" fill="#2C3F5E">1️⃣ MARKET RISK</text>
      <text x="65" y="40" textAnchor="middle" fontSize="8" fill="#2C3F5E">Unexpected news</text>
      <text x="65" y="55" textAnchor="middle" fontSize="8" fill="#2C3F5E">drops market sharply</text>
      
      <rect x="10" y="65" width="110" height="45" fill="#F1F4F9" rx="4"/>
      <text x="65" y="82" textAnchor="middle" fontSize="7" fill="#404047">Your holdings</text>
      <text x="65" y="95" textAnchor="middle" fontSize="7" fill="#404047">are affected</text>
    </g>
    
    {/* Event 2: System */}
    <g transform="translate(285, 80)">
      <circle cx="30" cy="200" r="8" fill="#B8923F" stroke="#7C5D2B" strokeWidth="2"/>
      <line x1="30" y1="192" x2="30" y2="130" stroke="#B8923F" strokeWidth="2"/>
      
      <rect x="0" y="0" width="130" height="120" fill="#F6ECCE" rx="8" stroke="#B8923F" strokeWidth="2"/>
      <text x="65" y="22" textAnchor="middle" fontSize="9" fontWeight="700" fill="#7C5D2B">2️⃣ SYSTEM RISK</text>
      <text x="65" y="40" textAnchor="middle" fontSize="8" fill="#7C5D2B">Trading app slows</text>
      <text x="65" y="55" textAnchor="middle" fontSize="8" fill="#7C5D2B">under heavy traffic</text>
      
      <rect x="10" y="65" width="110" height="45" fill="#FBF7EC" rx="4"/>
      <text x="65" y="82" textAnchor="middle" fontSize="7" fill="#404047">You cannot act</text>
      <text x="65" y="95" textAnchor="middle" fontSize="7" fill="#404047">when you want to</text>
    </g>
    
    {/* Event 3: Emotional */}
    <g transform="translate(470, 80)">
      <circle cx="30" cy="200" r="8" fill="#8F6FC4" stroke="#654B8A" strokeWidth="2"/>
      <line x1="30" y1="192" x2="30" y2="130" stroke="#8F6FC4" strokeWidth="2"/>
      
      <rect x="0" y="0" width="130" height="120" fill="#ECE4F6" rx="8" stroke="#8F6FC4" strokeWidth="2"/>
      <text x="65" y="22" textAnchor="middle" fontSize="9" fontWeight="700" fill="#654B8A">3️⃣ EMOTIONAL RISK</text>
      <text x="65" y="40" textAnchor="middle" fontSize="8" fill="#654B8A">Panic sets in</text>
      <text x="65" y="55" textAnchor="middle" fontSize="8" fill="#654B8A">as losses mount</text>
      
      <rect x="10" y="65" width="110" height="45" fill="#F6F2FB" rx="4"/>
      <text x="65" y="82" textAnchor="middle" fontSize="7" fill="#404047">You make impulsive</text>
      <text x="65" y="95" textAnchor="middle" fontSize="7" fill="#404047">decisions</text>
    </g>
    
    {/* Connection arrows */}
    <path d="M230 140 L270 140" fill="none" stroke="#E04848" strokeWidth="2" markerEnd="url(#arrowScenario)"/>
    <path d="M415 140 L455 140" fill="none" stroke="#E04848" strokeWidth="2" markerEnd="url(#arrowScenario)"/>
    
    <defs>
      <marker id="arrowScenario" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#E04848"/>
      </marker>
    </defs>
    
    {/* Result */}
    <rect x="200" y="300" width="300" height="30" fill="#E04848" rx="6"/>
    <text x="350" y="320" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">Result: Compounded damage to capital</text>
  </svg>
);

// SVG 8: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 200" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="200" fill="#F7F6F2" rx="16"/>
    
    {/* Central message */}
    <rect x="50" y="25" width="600" height="150" fill="url(#awarenessGradient)" rx="16"/>
    
    <defs>
      <linearGradient id="awarenessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#12805A"/>
        <stop offset="100%" stopColor="#2A8C9A"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="60" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">🔍 Key Takeaway</text>
    
    <text x="350" y="90" textAnchor="middle" fontSize="11" fill="white">Risk is not just what happens to prices.</text>
    <text x="350" y="110" textAnchor="middle" fontSize="11" fill="white">It's also what happens to your tools and what happens inside you.</text>
    <text x="350" y="145" textAnchor="middle" fontSize="15" fontWeight="700" fill="#F6ECCE">AWARENESS IS THE FIRST DEFENSE.</text>
  </svg>
);

const RiskLesson3 = () => {
  const navigate = useNavigate();

  const quizQuestions = [
    {
      question: "Which type of risk is NOT visible on a price chart?",
      options: [
        "Market risk from price movements",
        "System risk from technology failures and emotional risk from human reactions",
        "Volatility risk",
        "All risks are visible on price charts"
      ],
      correctAnswer: "System risk from technology failures and emotional risk from human reactions",
      explanation: "System risk (technology, execution) and emotional risk (psychology) don't show up on charts but can significantly impact your outcomes."
    },
    {
      question: "Why do risks often compound (make each other worse)?",
      options: [
        "Because risks are mathematically linked",
        "Because one risk can trigger another — for example, a market drop can cause system overload and emotional panic",
        "Because all risks happen at the same time by definition",
        "Risks don't actually compound"
      ],
      correctAnswer: "Because one risk can trigger another — for example, a market drop can cause system overload and emotional panic",
      explanation: "Risks interact in chains: market events can overload systems, and both can trigger emotional responses that lead to poor decisions."
    }
  ];

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/learn/risk-management')}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 transition-colors mb-4"
          >
            <FaArrowLeft />
            <span>Back to Risk Management</span>
          </button>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
              Lesson 3 of 7
            </span>
            <h1 className="text-3xl font-display font-normal text-gray-800 mt-4 tracking-[-0.015em]">Types of Risk – Market, System & Emotional</h1>
            <p className="text-gray-600 mt-2">Understanding the multiple dimensions of risk</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Why Identifying Risk Types Matters</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              When most people think about risk in financial markets, they think about one thing: 
              <strong> prices going down</strong>. While that's certainly a form of risk, it's far 
              from the complete picture.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              In reality, risk comes in multiple layers. Some risks are visible on charts. Others 
              hide in the systems you depend on. And some of the most dangerous risks live inside 
              your own mind, invisible until they cause damage.
            </p>
            <p className="text-lg leading-relaxed">
              Understanding these different types of risk doesn't eliminate them — but awareness 
              reduces surprises. When you can name what's threatening your capital, you're better 
              positioned to recognize it before it strikes.
            </p>
          </div>

          <ThreeLayersOfRiskSVG />
        </div>

        {/* Market Risk */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Market Risk: The Visible Layer</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              <strong>Market risk</strong> is what most people mean when they talk about risk. It's 
              the risk that prices will move against you — that what you own will become worth less, 
              or that what you want to buy will become more expensive.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              This type of risk is driven by external forces you cannot control: economic news, 
              company performance, interest rate changes, geopolitical events, sector rotations, 
              and the collective behavior of millions of market participants.
            </p>
            <p className="text-lg leading-relaxed">
              Market risk is <strong>visible</strong> — you can see it on price charts, read about 
              it in headlines, and track it in real-time. This visibility makes it the most studied 
              form of risk. But visibility doesn't mean controllability. Market risk happens to you; 
              you can only decide how to respond.
            </p>
          </div>

          <MarketRiskSVG />
        </div>

        {/* System Risk */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">System Risk: The Hidden Layer</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              <strong>System risk</strong> encompasses everything that can go wrong between your 
              decision and its execution. It lives in the tools, platforms, networks, and processes 
              you depend on to participate in markets.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              This includes technology failures (app crashes, slow loading, wrong data display), 
              connectivity issues (internet outages, server problems, data delays), and execution 
              gaps (slippage, partial fills, order errors).
            </p>
            <p className="text-lg leading-relaxed">
              What makes system risk particularly dangerous is its <strong>timing</strong>. Systems 
              tend to fail exactly when you need them most — during high volatility, when everyone 
              is trying to act at once, when speed matters. The same market event that creates market 
              risk can simultaneously create system risk by overloading infrastructure.
            </p>
          </div>

          <SystemRiskSVG />
        </div>

        {/* Emotional Risk */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Emotional Risk: The Internal Layer</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              <strong>Emotional risk</strong> is the risk you bring to every financial decision 
              through your own psychology. Fear, greed, hope, regret, impatience, overconfidence — 
              these emotions can turn a manageable situation into a disaster.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Emotional risk is triggered by circumstances: watching losses grow, seeing others 
              profit while you don't, feeling time pressure, or experiencing unexpected volatility. 
              These triggers don't cause damage directly — they cause you to act in ways that 
              create damage.
            </p>
            <p className="text-lg leading-relaxed">
              The paradox of emotional risk is that it's the <strong>only type you can directly 
              control</strong> — yet it's often the hardest to manage. You cannot control market 
              prices. You cannot guarantee systems won't fail. But you can, with awareness and 
              discipline, control your responses.
            </p>
          </div>

          <EmotionalRiskSVG />
        </div>

        {/* How Risks Interact */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">How Risks Interact and Compound</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Understanding each risk type individually is important, but real danger often comes 
              from how risks <strong>interact</strong>. A single risk rarely causes catastrophic 
              failure — it's the compounding of multiple risks that does.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Market risk triggers emotional risk: prices drop, fear kicks in. System risk amplifies 
              emotional risk: you can't act, panic grows. Emotional risk creates new market risk: 
              panicked decisions lead to poorly timed actions.
            </p>
            <p className="text-lg leading-relaxed">
              This creates feedback loops. Each risk makes the others worse. A market decline that 
              would be manageable on its own becomes devastating when combined with system failures 
              and emotional reactions. Recognizing these interactions is crucial for understanding 
              why capital protection requires awareness of all three layers.
            </p>
          </div>

          <RisksInteractSVG />
        </div>

        {/* Visible vs Invisible */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">The Iceberg: Visible vs Invisible Risk</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Think of risk like an iceberg. Market risk — price movements, volatility, news 
              events — is the visible portion above the waterline. It's what everyone sees, 
              discusses, and tracks.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Below the surface lies system risk: the hidden vulnerabilities in tools and processes 
              that only reveal themselves when something goes wrong. And deeper still lies emotional 
              risk: the psychological patterns that influence every decision you make.
            </p>
            <p className="text-lg leading-relaxed">
              The danger is that we tend to prepare only for what we can see. We watch charts, 
              follow news, and track prices — but ignore the larger mass of risk hidden below. 
              Yet it's often those invisible risks that cause the most damage, precisely because 
              we weren't prepared for them.
            </p>
          </div>

          <VisibleVsInvisibleSVG />
        </div>

        {/* Practical Scenario */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">A Real-World Scenario: Multiple Risks at Once</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Imagine this scenario: <strong>Major unexpected news hits the market</strong>. Prices 
              begin dropping sharply. This is market risk in action — external forces moving 
              prices against you.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              You decide you want to reduce your exposure. But when you open your trading app, 
              it's slow. Very slow. Millions of other people are trying to do the same thing. 
              The platform struggles under the load. This is system risk — the infrastructure 
              failing exactly when you need it.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              As you watch prices fall and your app refuses to respond, <strong>panic sets in</strong>. 
              Your heart races. You start making rapid decisions — any decision — just to feel 
              like you're doing something. This is emotional risk hijacking your judgment.
            </p>
            <p className="text-lg leading-relaxed">
              Each risk made the others worse. The market event overloaded the system. The system 
              failure intensified your emotions. Your emotions led to worse decisions than you 
              would have made with a calm mind. This is how risks compound.
            </p>
          </div>

          <MultipleRisksScenarioSVG />
        </div>

        {/* Key Takeaway */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
          
          <div className="mt-6 bg-emerald-50 rounded-xl p-5 border border-emerald-200">
            <p className="text-emerald-800 font-medium">
              Remember: You don't need to have solutions for every risk type right now. The goal 
              of this lesson is simply awareness — recognizing that risk is multi-dimensional 
              and that the risks you don't see can be just as dangerous as the ones you do.
            </p>
          </div>
        </div>

        {/* India-specific Context */}
        <div className="bg-emerald-50 rounded-2xl p-6 shadow-lg mb-8 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-800 mb-3">🌍 Global Context</h3>
          <p className="text-emerald-900">
            These three categories of risk — market, system, and emotional — exist in every 
            financial market worldwide, from Wall Street to European exchanges to Asian markets 
            including India. The technology may differ, the specific triggers may vary, but the 
            fundamental structure of risk remains universal. A trader in Mumbai faces the same 
            types of risk as one in New York or London: prices that move unpredictably, systems 
            that can fail under pressure, and human emotions that can override rational planning. 
            Awareness of this universal structure helps you prepare regardless of where you operate.
          </p>
        </div>

        {/* Quiz Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">📝 Knowledge Check</h2>
          {quizQuestions.map((q, index) => (
            <QuizQuestion key={index} {...q} />
          ))}
        </div>

        {/* Reflection Activity */}
        <div className="bg-gradient-to-r from-teal-100 to-emerald-100 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-500 rounded-full p-3">
              <FaLightbulb className="text-white text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-emerald-800 mb-3">Reflection Activity</h3>
              <div className="bg-white rounded-xl p-5 border border-emerald-200">
                <p className="text-gray-800 font-medium mb-4">
                  Consider the three types of risk and your own experience:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">1.</span>
                    <span>Of the three risk types (market, system, emotional), which do you think you have the most control over? Why?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">2.</span>
                    <span>Have you ever experienced a situation where multiple risks combined to make things worse? What happened?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">3.</span>
                    <span>Which "invisible" risk (system or emotional) do you think you currently pay the least attention to?</span>
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                  <p className="text-emerald-800 text-sm">
                    <strong>Hint:</strong> Emotional risk is the one type you can directly control — 
                    but most people underestimate how much it influences their decisions. System 
                    risk is often ignored until something goes wrong.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 shadow-lg mb-8 text-white">
          <h3 className="text-xl font-semibold mb-4">🔑 Lesson Summary</h3>
          <ul className="space-y-2 text-lg">
            <li>• <strong>Market risk</strong> is visible — price movements driven by external forces</li>
            <li>• <strong>System risk</strong> is hidden — failures in tools, platforms, and execution</li>
            <li>• <strong>Emotional risk</strong> is internal — your psychology influencing decisions</li>
            <li>• Risks interact and compound — one risk often triggers or amplifies others</li>
            <li>• The risks you don't see (below the surface) can be most dangerous</li>
            <li>• Awareness of all three layers is the foundation of risk management</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/risk-lesson-2')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition-colors"
          >
            <FaArrowLeft />
            <span>Previous Lesson</span>
          </button>
          <button
            onClick={() => navigate('/learn/risk-lesson-4')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-colors"
          >
            <span>Next Lesson</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default RiskLesson3;
