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

// SVG 1: Capital Is The Foundation
const CapitalFoundationSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="350" y="30" textAnchor="middle" fontSize="15" fontWeight="600" fill="#404047">Capital Is The Foundation of Everything</text>
    
    {/* Building structure */}
    <g transform="translate(200, 50)">
      {/* Foundation - Capital */}
      <rect x="0" y="200" width="300" height="40" fill="#12805A" rx="4" stroke="#0E6A4A" strokeWidth="2"/>
      <text x="150" y="225" textAnchor="middle" fontSize="12" fontWeight="700" fill="white">CAPITAL</text>
      
      {/* Floor 1 - Opportunity */}
      <rect x="20" y="160" width="260" height="35" fill="#1FA978" rx="4"/>
      <text x="150" y="182" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">Opportunity to Invest</text>
      
      {/* Floor 2 - Participation */}
      <rect x="40" y="120" width="220" height="35" fill="#3CCB97" rx="4"/>
      <text x="150" y="142" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">Market Participation</text>
      
      {/* Floor 3 - Compounding */}
      <rect x="60" y="80" width="180" height="35" fill="#77D3AE" rx="4"/>
      <text x="150" y="102" textAnchor="middle" fontSize="10" fontWeight="600" fill="#0D543C">Compounding Growth</text>
      
      {/* Roof - Success */}
      <polygon points="150,30 250,75 50,75" fill="#ABE5CC" stroke="#77D3AE" strokeWidth="2"/>
      <text x="150" y="62" textAnchor="middle" fontSize="9" fontWeight="600" fill="#0D543C">Success</text>
    </g>
    
    {/* Arrow pointing to foundation */}
    <g transform="translate(520, 220)">
      <line x1="0" y1="0" x2="-20" y2="0" stroke="#12805A" strokeWidth="3" markerEnd="url(#arrowGreen)"/>
      <defs>
        <marker id="arrowGreen" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#12805A"/>
        </marker>
      </defs>
      <text x="10" y="-10" fontSize="9" fill="#0D543C">Without this,</text>
      <text x="10" y="5" fontSize="9" fill="#0D543C">nothing above</text>
      <text x="10" y="20" fontSize="9" fill="#0D543C">is possible</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="260" width="500" height="30" fill="#232327" rx="6"/>
    <text x="350" y="280" textAnchor="middle" fontSize="10" fill="white">💡 Capital is not just money — it's your ability to participate in future opportunities.</text>
  </svg>
);

// SVG 2: Survival Before Success
const SurvivalBeforeSuccessSVG = () => (
  <svg viewBox="0 0 700 280" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="280" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#404047">The First Rule: Survive</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#75757D">You cannot succeed if you're eliminated from the game</text>
    
    {/* Left: Eliminated */}
    <g transform="translate(50, 70)">
      <rect x="0" y="0" width="270" height="180" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="135" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">❌ Eliminated Investor</text>
      
      {/* X mark over investor icon */}
      <circle cx="135" cy="85" r="30" fill="#FBE1E1" stroke="#E04848" strokeWidth="2"/>
      <text x="135" y="92" textAnchor="middle" fontSize="20" fill="#E04848">👤</text>
      <line x1="110" y1="60" x2="160" y2="110" stroke="#E04848" strokeWidth="4"/>
      <line x1="160" y1="60" x2="110" y2="110" stroke="#E04848" strokeWidth="4"/>
      
      <text x="135" y="135" textAnchor="middle" fontSize="9" fill="#842428">Lost too much capital</text>
      <text x="135" y="152" textAnchor="middle" fontSize="9" fill="#842428">Cannot participate anymore</text>
      <text x="135" y="169" textAnchor="middle" fontSize="9" fill="#6B2023">Future opportunities: ZERO</text>
    </g>
    
    {/* Right: Surviving */}
    <g transform="translate(380, 70)">
      <rect x="0" y="0" width="270" height="180" fill="#D5F2E5" rx="12" stroke="#77D3AE" strokeWidth="2"/>
      <text x="135" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0D543C">✓ Surviving Investor</text>
      
      {/* Checkmark with investor icon */}
      <circle cx="135" cy="85" r="30" fill="#EEF9F4" stroke="#1FA978" strokeWidth="2"/>
      <text x="135" y="92" textAnchor="middle" fontSize="20" fill="#1FA978">👤</text>
      <circle cx="155" cy="65" r="12" fill="#1FA978"/>
      <text x="155" y="70" textAnchor="middle" fontSize="12" fill="white">✓</text>
      
      <text x="135" y="135" textAnchor="middle" fontSize="9" fill="#0B4532">Capital protected</text>
      <text x="135" y="152" textAnchor="middle" fontSize="9" fill="#0B4532">Still in the game</text>
      <text x="135" y="169" textAnchor="middle" fontSize="9" fill="#0D543C">Future opportunities: UNLIMITED</text>
    </g>
  </svg>
);

// SVG 3: Losses Hurt More Than Gains Help
const LossesHurtMoreSVG = () => (
  <svg viewBox="0 0 700 320" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="320" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#404047">Losses Hurt More Than Gains Help</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#75757D">The asymmetry that defines risk management</text>
    
    {/* Visual scale/balance */}
    <g transform="translate(350, 180)">
      {/* Fulcrum */}
      <polygon points="0,60 -20,100 20,100" fill="#75757D"/>
      
      {/* Tilted beam */}
      <line x1="-180" y1="-20" x2="180" y2="40" stroke="#404047" strokeWidth="6" strokeLinecap="round"/>
      
      {/* Loss side (heavier, lower) */}
      <g transform="translate(-180, -20)">
        <rect x="-50" y="0" width="100" height="60" fill="#E04848" rx="8"/>
        <text x="0" y="25" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">LOSS</text>
        <text x="0" y="45" textAnchor="middle" fontSize="8" fill="#F6C3C3">Heavy impact</text>
      </g>
      
      {/* Gain side (lighter, higher) */}
      <g transform="translate(180, 40)">
        <rect x="-50" y="-60" width="100" height="60" fill="#1FA978" rx="8"/>
        <text x="0" y="-35" textAnchor="middle" fontSize="10" fontWeight="600" fill="white">GAIN</text>
        <text x="0" y="-15" textAnchor="middle" fontSize="8" fill="#D5F2E5">Lighter impact</text>
      </g>
    </g>
    
    {/* Explanation boxes */}
    <g transform="translate(50, 70)">
      <rect x="0" y="0" width="180" height="70" fill="#FDF1F1" rx="8" stroke="#F09B9B" strokeWidth="1"/>
      <text x="90" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#C7363B">After a significant loss...</text>
      <text x="90" y="45" textAnchor="middle" fontSize="8" fill="#842428">You need a MUCH larger gain</text>
      <text x="90" y="60" textAnchor="middle" fontSize="8" fill="#842428">just to get back to where you started</text>
    </g>
    
    <g transform="translate(470, 70)">
      <rect x="0" y="0" width="180" height="70" fill="#D5F2E5" rx="8" stroke="#77D3AE" strokeWidth="1"/>
      <text x="90" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#0D543C">When you preserve capital...</text>
      <text x="90" y="45" textAnchor="middle" fontSize="8" fill="#0B4532">Even modest gains compound</text>
      <text x="90" y="60" textAnchor="middle" fontSize="8" fill="#0B4532">into meaningful growth over time</text>
    </g>
    
    {/* Bottom insight */}
    <rect x="100" y="285" width="500" height="25" fill="#232327" rx="6"/>
    <text x="350" y="302" textAnchor="middle" fontSize="9" fill="white">This asymmetry is why capital protection must come before profit-seeking.</text>
  </svg>
);

// SVG 4: Capital Erosion Path
const CapitalErosionSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#404047">The Path of Capital Erosion</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#75757D">How losses accumulate and become harder to recover from</text>
    
    {/* Erosion visualization - stacked bars getting smaller */}
    <g transform="translate(100, 75)">
      {/* Starting capital */}
      <rect x="0" y="0" width="80" height="180" fill="#1FA978" rx="4"/>
      <text x="40" y="95" textAnchor="middle" fontSize="9" fontWeight="600" fill="white" transform="rotate(-90 40 95)">Starting Capital</text>
      <text x="40" y="200" textAnchor="middle" fontSize="8" fill="#0D543C">Full</text>
      
      {/* After first loss */}
      <rect x="110" y="30" width="80" height="150" fill="#1FA978" rx="4"/>
      <text x="150" y="110" textAnchor="middle" fontSize="9" fontWeight="600" fill="white" transform="rotate(-90 150 110)">After Loss 1</text>
      <text x="150" y="200" textAnchor="middle" fontSize="8" fill="#12805A">Reduced</text>
      
      {/* After second loss */}
      <rect x="220" y="70" width="80" height="110" fill="#B8923F" rx="4"/>
      <text x="260" y="130" textAnchor="middle" fontSize="9" fontWeight="600" fill="white" transform="rotate(-90 260 130)">After Loss 2</text>
      <text x="260" y="200" textAnchor="middle" fontSize="8" fill="#7C5D2B">Smaller</text>
      
      {/* After third loss */}
      <rect x="330" y="110" width="80" height="70" fill="#D2754C" rx="4"/>
      <text x="370" y="150" textAnchor="middle" fontSize="9" fontWeight="600" fill="white" transform="rotate(-90 370 150)">After Loss 3</text>
      <text x="370" y="200" textAnchor="middle" fontSize="8" fill="#C0623B">Critical</text>
      
      {/* After severe loss */}
      <rect x="440" y="150" width="80" height="30" fill="#E04848" rx="4"/>
      <text x="480" y="170" textAnchor="middle" fontSize="8" fontWeight="600" fill="white">Severe</text>
      <text x="480" y="200" textAnchor="middle" fontSize="8" fill="#C7363B">Danger</text>
    </g>
    
    {/* Arrow showing decline */}
    <path d="M140 250 Q300 230 520 260" fill="none" stroke="#E04848" strokeWidth="2" strokeDasharray="5"/>
    <text x="330" y="248" fontSize="9" fill="#C7363B">Each loss makes recovery harder</text>
    
    {/* Recovery difficulty indicator */}
    <g transform="translate(560, 100)">
      <rect x="0" y="0" width="100" height="150" fill="#FDF1F1" rx="8" stroke="#F09B9B" strokeWidth="1"/>
      <text x="50" y="25" textAnchor="middle" fontSize="9" fontWeight="600" fill="#C7363B">Recovery</text>
      <text x="50" y="40" textAnchor="middle" fontSize="9" fontWeight="600" fill="#C7363B">Difficulty</text>
      
      <rect x="10" y="55" width="80" height="15" fill="#D5F2E5" rx="2"/>
      <text x="50" y="66" textAnchor="middle" fontSize="7" fill="#0D543C">Easy</text>
      
      <rect x="10" y="75" width="80" height="15" fill="#F6ECCE" rx="2"/>
      <text x="50" y="86" textAnchor="middle" fontSize="7" fill="#7C5D2B">Moderate</text>
      
      <rect x="10" y="95" width="80" height="15" fill="#F0C2A9" rx="2"/>
      <text x="50" y="106" textAnchor="middle" fontSize="7" fill="#9C4D2E">Hard</text>
      
      <rect x="10" y="115" width="80" height="15" fill="#F6C3C3" rx="2"/>
      <text x="50" y="126" textAnchor="middle" fontSize="7" fill="#C7363B">Very Hard</text>
      
      <rect x="10" y="135" width="80" height="10" fill="#E04848" rx="2"/>
      <text x="50" y="143" textAnchor="middle" fontSize="6" fill="white">Nearly Impossible</text>
    </g>
  </svg>
);

// SVG 5: Two Investors Story
const TwoInvestorsSVG = () => (
  <svg viewBox="0 0 700 340" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="340" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#404047">Two Investors, Two Paths</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#75757D">Same starting point, different priorities, different outcomes</text>
    
    {/* Starting point */}
    <circle cx="350" cy="90" r="30" fill="#8F6FC4" stroke="#7A5BA6" strokeWidth="3"/>
    <text x="350" y="88" textAnchor="middle" fontSize="9" fill="white">Both start</text>
    <text x="350" y="100" textAnchor="middle" fontSize="9" fill="white">with capital</text>
    
    {/* Branching paths */}
    <path d="M320 110 Q250 150 150 180" fill="none" stroke="#1FA978" strokeWidth="3"/>
    <path d="M380 110 Q450 150 550 180" fill="none" stroke="#E04848" strokeWidth="3"/>
    
    {/* Investor A - Protection focused */}
    <g transform="translate(50, 170)">
      <rect x="0" y="0" width="200" height="150" fill="#D5F2E5" rx="12" stroke="#77D3AE" strokeWidth="2"/>
      <text x="100" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0D543C">Investor A</text>
      <text x="100" y="42" textAnchor="middle" fontSize="9" fill="#0B4532">"Protection First"</text>
      
      <text x="15" y="65" fontSize="8" fill="#0D543C">• Limits exposure in uncertain times</text>
      <text x="15" y="82" fontSize="8" fill="#0D543C">• Accepts missing some gains</text>
      <text x="15" y="99" fontSize="8" fill="#0D543C">• Keeps capital intact through storms</text>
      <text x="15" y="116" fontSize="8" fill="#0D543C">• Still in the game after years</text>
      
      <rect x="20" y="125" width="160" height="18" fill="#1FA978" rx="4"/>
      <text x="100" y="138" textAnchor="middle" fontSize="8" fontWeight="600" fill="white">Outcome: SURVIVING & GROWING</text>
    </g>
    
    {/* Investor B - Return focused */}
    <g transform="translate(450, 170)">
      <rect x="0" y="0" width="200" height="150" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="100" y="25" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">Investor B</text>
      <text x="100" y="42" textAnchor="middle" fontSize="9" fill="#842428">"Returns First"</text>
      
      <text x="15" y="65" fontSize="8" fill="#842428">• Maximizes exposure for gains</text>
      <text x="15" y="82" fontSize="8" fill="#842428">• Ignores warning signs</text>
      <text x="15" y="99" fontSize="8" fill="#842428">• Suffers severe losses in downturns</text>
      <text x="15" y="116" fontSize="8" fill="#842428">• Struggling to recover capital</text>
      
      <rect x="20" y="125" width="160" height="18" fill="#E04848" rx="4"/>
      <text x="100" y="138" textAnchor="middle" fontSize="8" fontWeight="600" fill="white">Outcome: DAMAGED & STUCK</text>
    </g>
  </svg>
);

// SVG 6: Drawdown vs Volatility
const DrawdownVsVolatilitySVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#404047">Drawdown vs Volatility</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#75757D">Both involve movement, but they measure different things</text>
    
    {/* Left: Volatility */}
    <g transform="translate(50, 70)">
      <rect x="0" y="0" width="270" height="200" fill="#ECE4F6" rx="12" stroke="#C0A9E2" strokeWidth="2"/>
      <text x="135" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#7A5BA6">📊 Volatility</text>
      
      {/* Wavy line showing up and down */}
      <path d="M30 120 Q60 80 90 120 T150 120 T210 120 T240 120" 
            fill="none" stroke="#8F6FC4" strokeWidth="3"/>
      
      <text x="135" y="155" textAnchor="middle" fontSize="9" fill="#533F70">How much prices move</text>
      <text x="135" y="172" textAnchor="middle" fontSize="9" fill="#533F70">up AND down over time</text>
      
      <rect x="20" y="182" width="230" height="12" fill="#ECE4F6" rx="3"/>
      <text x="135" y="192" textAnchor="middle" fontSize="7" fill="#533F70">Can be temporary — prices may recover</text>
    </g>
    
    {/* Right: Drawdown */}
    <g transform="translate(380, 70)">
      <rect x="0" y="0" width="270" height="200" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
      <text x="135" y="28" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">📉 Drawdown</text>
      
      {/* Declining line from peak */}
      <circle cx="50" cy="80" r="6" fill="#1FA978"/>
      <text x="50" y="70" textAnchor="middle" fontSize="7" fill="#0D543C">Peak</text>
      <path d="M56 85 L100 100 L140 130 L180 150 L220 160" 
            fill="none" stroke="#E04848" strokeWidth="3"/>
      <circle cx="220" cy="160" r="6" fill="#E04848"/>
      <text x="220" y="175" textAnchor="middle" fontSize="7" fill="#C7363B">Current</text>
      
      {/* Double-headed arrow showing drop */}
      <line x1="240" y1="80" x2="240" y2="160" stroke="#C7363B" strokeWidth="2" strokeDasharray="4"/>
      <text x="255" y="125" fontSize="7" fill="#C7363B">Drop</text>
      
      <text x="135" y="185" textAnchor="middle" fontSize="9" fill="#842428">How far you've fallen from</text>
      <text x="135" y="200" textAnchor="middle" fontSize="9" fill="#842428">your highest point</text>
    </g>
    
    {/* Bottom comparison */}
    <rect x="100" y="275" width="500" height="20" fill="#232327" rx="5"/>
    <text x="350" y="289" textAnchor="middle" fontSize="8" fill="white">Volatility is movement. Drawdown is damage. Managing drawdown protects capital.</text>
  </svg>
);

// SVG 7: The Compounding Advantage
const CompoundingAdvantageSVG = () => (
  <svg viewBox="0 0 700 300" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="300" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="350" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#404047">Why Survival Enables Compounding</text>
    <text x="350" y="48" textAnchor="middle" fontSize="10" fill="#75757D">Protected capital grows; destroyed capital cannot</text>
    
    {/* Timeline */}
    <line x1="80" y1="250" x2="620" y2="250" stroke="#CFCBC1" strokeWidth="2"/>
    <text x="350" y="270" textAnchor="middle" fontSize="9" fill="#75757D">Time →</text>
    
    {/* Protected path - steady growth */}
    <path d="M100 200 Q200 190 300 170 Q400 140 500 100 Q550 80 600 60" 
          fill="none" stroke="#1FA978" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="600" cy="60" r="8" fill="#1FA978"/>
    <text x="620" y="55" fontSize="9" fontWeight="600" fill="#0D543C">Growing</text>
    <text x="620" y="70" fontSize="8" fill="#0B4532">steadily</text>
    
    {/* Unprotected path - crash and struggle */}
    <path d="M100 200 Q150 150 200 120 L250 200 Q300 210 350 205 Q400 200 450 210 Q500 215 550 220 L600 225" 
          fill="none" stroke="#E04848" strokeWidth="4" strokeLinecap="round" strokeDasharray="8"/>
    <circle cx="600" cy="225" r="8" fill="#E04848"/>
    <text x="620" y="220" fontSize="9" fontWeight="600" fill="#C7363B">Stuck</text>
    <text x="620" y="235" fontSize="8" fill="#842428">recovering</text>
    
    {/* Labels */}
    <rect x="80" y="60" width="120" height="50" fill="#D5F2E5" rx="6" stroke="#77D3AE" strokeWidth="1"/>
    <text x="140" y="82" textAnchor="middle" fontSize="8" fontWeight="600" fill="#0D543C">Protected Capital</text>
    <text x="140" y="98" textAnchor="middle" fontSize="7" fill="#0B4532">Compounds over time</text>
    
    <rect x="80" y="120" width="120" height="50" fill="#FDF1F1" rx="6" stroke="#F09B9B" strokeWidth="1"/>
    <text x="140" y="142" textAnchor="middle" fontSize="8" fontWeight="600" fill="#C7363B">Damaged Capital</text>
    <text x="140" y="158" textAnchor="middle" fontSize="7" fill="#842428">Struggles to recover</text>
    
    {/* Key insight */}
    <rect x="250" y="130" width="200" height="40" fill="#F6ECCE" rx="6" stroke="#E2C273" strokeWidth="1"/>
    <text x="350" y="148" textAnchor="middle" fontSize="8" fontWeight="600" fill="#654B26">The gap widens with time</text>
    <text x="350" y="162" textAnchor="middle" fontSize="7" fill="#7C5D2B">Protection's benefit compounds too</text>
  </svg>
);

// SVG 8: Key Takeaway
const KeyTakeawaySVG = () => (
  <svg viewBox="0 0 700 200" className="w-full max-w-3xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="700" height="200" fill="#F7F6F2" rx="16"/>
    
    {/* Central message */}
    <rect x="50" y="25" width="600" height="150" fill="url(#protectGradient)" rx="16"/>
    
    <defs>
      <linearGradient id="protectGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#12805A"/>
        <stop offset="100%" stopColor="#2A8C9A"/>
      </linearGradient>
    </defs>
    
    <text x="350" y="60" textAnchor="middle" fontSize="14" fontWeight="600" fill="white">🛡️ Key Takeaway</text>
    
    <text x="350" y="95" textAnchor="middle" fontSize="12" fill="white">Capital is not just money — it's opportunity, participation, and future growth.</text>
    <text x="350" y="120" textAnchor="middle" fontSize="12" fill="white">Protecting it is not conservative — it's strategic.</text>
    <text x="350" y="150" textAnchor="middle" fontSize="16" fontWeight="700" fill="#F6ECCE">SURVIVE FIRST. SUCCEED LATER.</text>
  </svg>
);

const RiskLesson2 = () => {
  const navigate = useNavigate();

  const quizQuestions = [
    {
      question: "Why is capital protection more important than seeking high returns?",
      options: [
        "Because high returns are impossible to achieve",
        "Because losses are harder to recover from than gains are to achieve — protecting capital keeps you in the game",
        "Because all investments are dangerous",
        "Because professional investors never take risks"
      ],
      correctAnswer: "Because losses are harder to recover from than gains are to achieve — protecting capital keeps you in the game",
      explanation: "The asymmetry of losses means that recovering from damage requires disproportionately larger gains. Protecting capital ensures you remain able to participate in future opportunities."
    },
    {
      question: "What happens to an investor who loses a significant portion of their capital?",
      options: [
        "They automatically recover over time",
        "They face a much harder path to recovery, and may be eliminated from opportunities entirely",
        "Nothing significant — markets always come back",
        "They receive compensation from the market"
      ],
      correctAnswer: "They face a much harder path to recovery, and may be eliminated from opportunities entirely",
      explanation: "Severe capital loss creates a compounding disadvantage. Not only must the investor recover what was lost, but they've also lost the ability to benefit from opportunities during the recovery period."
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
              Lesson 2 of 7
            </span>
            <h1 className="text-3xl font-display font-normal text-gray-800 mt-4 tracking-[-0.015em]">Why Capital Protection Comes First</h1>
            <p className="text-gray-600 mt-2">The foundation of sustainable investing</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Protecting Capital Is More Important Than Making Profits</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              This might sound counterintuitive. After all, isn't the point of investing to make 
              money? To grow wealth? To achieve returns?
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Yes — but here's what most people miss: <strong>you cannot grow what you've destroyed</strong>. 
              Every successful long-term investor, every fund manager who has survived decades in 
              markets, every institution that has endured multiple cycles understands this truth: 
              capital protection comes first.
            </p>
            <p className="text-lg leading-relaxed">
              Not because returns don't matter. But because without capital, returns become 
              impossible. You cannot compound what no longer exists. You cannot participate in 
              opportunities you can no longer afford. Survival is the prerequisite for success.
            </p>
          </div>

          <CapitalFoundationSVG />
        </div>

        {/* Capital as Raw Material */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Capital: The Raw Material of Markets</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Think of capital not just as money, but as the raw material that makes everything 
              else possible. A carpenter needs wood. A chef needs ingredients. An investor needs 
              capital.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Without capital, you cannot:
            </p>
            <ul className="text-lg space-y-2 mb-4">
              <li>• Participate in market opportunities</li>
              <li>• Benefit from compounding over time</li>
              <li>• Weather temporary downturns</li>
              <li>• Take advantage of favorable conditions</li>
            </ul>
            <p className="text-lg leading-relaxed">
              When capital is damaged or destroyed, all of these possibilities disappear with it. 
              This is why protecting capital isn't a defensive choice — it's the foundation upon 
              which everything else is built.
            </p>
          </div>

          <SurvivalBeforeSuccessSVG />
        </div>

        {/* Loss Asymmetry */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Losses Hurt More Than Gains Help</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              There's a fundamental asymmetry in markets that every investor must understand: 
              <strong> losses and gains are not equal</strong>. A loss of a certain size requires 
              a larger gain to recover from.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              This isn't opinion or philosophy — it's arithmetic. When you lose a portion of your 
              capital, the remaining capital is smaller. Any gain is now calculated on that smaller 
              base. To return to where you started, you need a proportionally larger gain.
            </p>
            <p className="text-lg leading-relaxed">
              This asymmetry is why experienced investors prioritize avoiding large losses over 
              capturing large gains. The math is simply not in your favor once significant damage 
              has occurred.
            </p>
          </div>

          <LossesHurtMoreSVG />
        </div>

        {/* Capital Erosion */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">The Danger of Capital Erosion</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Capital erosion rarely happens in one dramatic event. More often, it's a gradual 
              process — a series of losses that each seem manageable on their own but accumulate 
              into something much more serious.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              What makes this particularly dangerous is that recovery becomes progressively harder 
              with each loss. The first loss might be easy to recover from. The second is harder. 
              By the third or fourth significant loss, the path back to your starting point has 
              become steep — sometimes impossibly so.
            </p>
            <p className="text-lg leading-relaxed">
              This is why risk management must be proactive, not reactive. Waiting until capital 
              is severely damaged before taking protection seriously is like waiting until you're 
              lost to look at the map.
            </p>
          </div>

          <CapitalErosionSVG />
        </div>

        {/* Two Investors Example */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">A Tale of Two Investors</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Consider two investors who start at the same point with the same capital. They 
              face the same market conditions, the same opportunities, and the same risks. But 
              they have different priorities.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              <strong>Investor A</strong> prioritizes capital protection. They accept that this 
              means sometimes missing out on gains. They limit their exposure during uncertain 
              periods. They're willing to look "boring" if it means staying safe.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              <strong>Investor B</strong> prioritizes returns. They maximize exposure to capture 
              every possible gain. They dismiss caution as "leaving money on the table." They 
              focus on what they might make, not what they might lose.
            </p>
            <p className="text-lg leading-relaxed">
              Over time, when markets inevitably face turbulence, these two investors diverge 
              dramatically. One is still in the game, capital intact, ready for opportunities. 
              The other is struggling to recover, watching opportunities pass by.
            </p>
          </div>

          <TwoInvestorsSVG />
        </div>

        {/* Drawdown vs Volatility */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Drawdown vs Volatility: Understanding the Difference</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Many investors confuse volatility with drawdown. They're related but measure 
              different things — and the distinction matters.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              <strong>Volatility</strong> measures how much prices move up and down over time. 
              It's about movement in both directions. A volatile investment might swing widely 
              but end up roughly where it started.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              <strong>Drawdown</strong> measures how far you've fallen from your highest point. 
              It's specifically about decline — the distance between where you were at your best 
              and where you are now. This is what damages capital.
            </p>
            <p className="text-lg leading-relaxed">
              You can tolerate volatility if you have time and psychological resilience. Drawdown 
              is more dangerous because it represents actual damage to your capital base — damage 
              that must be recovered before you can grow again.
            </p>
          </div>

          <DrawdownVsVolatilitySVG />
        </div>

        {/* Compounding Advantage */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Why Survival Enables Long-Term Success</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              The most powerful force in investing is compounding — growth building on growth 
              over time. But compounding only works if you stay in the game. Every time you 
              suffer a significant loss, you interrupt the compounding process.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Protected capital compounds. Damaged capital struggles. Over time, this difference 
              becomes enormous. The investor who avoided a major loss doesn't just have more 
              capital — they have more capital that has been compounding for longer.
            </p>
            <p className="text-lg leading-relaxed">
              This is why experienced investors often say that avoiding losses is more important 
              than capturing gains. It's not pessimism — it's mathematics. The long-term advantage 
              goes to those who survive.
            </p>
          </div>

          <CompoundingAdvantageSVG />
        </div>

        {/* Key Takeaway Visual */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <KeyTakeawaySVG />
          
          <div className="mt-6 bg-emerald-50 rounded-xl p-5 border border-emerald-200">
            <p className="text-emerald-800 font-medium">
              Remember: Capital protection is not about fear. It's not about being conservative. 
              It's about being strategic. The goal is to stay in the game long enough for 
              compounding to work in your favor.
            </p>
          </div>
        </div>

        {/* India-specific Context */}
        <div className="bg-emerald-50 rounded-2xl p-6 shadow-lg mb-8 border border-emerald-200">
          <h3 className="text-lg font-semibold text-emerald-800 mb-3">🌍 Global Context</h3>
          <p className="text-emerald-900">
            Long-term investors around the world — from the United States to Europe to India — 
            consistently prioritize capital protection. The most successful institutional investors, 
            endowment funds, and family offices all share this philosophy: survive first, grow later. 
            This isn't cultural — it's universal wisdom born from decades of market experience. 
            In emerging markets where growth opportunities are abundant, the temptation to chase 
            returns is strong. But the principle remains: protected capital participates in 
            growth; destroyed capital does not.
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
                  Consider how you currently think about losses in your financial life:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">1.</span>
                    <span>When you think about investing, do you focus more on what you might gain or what you might lose?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">2.</span>
                    <span>Have you ever experienced a significant financial loss? How long did it take to recover — financially and emotionally?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">3.</span>
                    <span>If you had to choose between a strategy that offers high returns with high risk versus moderate returns with capital protection, which would you choose? Why?</span>
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                  <p className="text-emerald-800 text-sm">
                    <strong>Why this matters:</strong> Understanding your current relationship with 
                    loss helps you recognize whether your instincts align with sustainable investing 
                    principles. There's no judgment here — only awareness.
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
            <li>• Capital is the raw material of all investing — without it, nothing is possible</li>
            <li>• Losses hurt more than gains help due to mathematical asymmetry</li>
            <li>• Capital erosion becomes progressively harder to recover from</li>
            <li>• Drawdown (decline from peak) damages capital; volatility is just movement</li>
            <li>• Survival enables compounding; elimination ends all opportunity</li>
            <li>• Protection first is not conservative — it's strategic</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/risk-lesson-1')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition-colors"
          >
            <FaArrowLeft />
            <span>Previous Lesson</span>
          </button>
          <button
            onClick={() => navigate('/learn/risk-lesson-3')}
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

export default RiskLesson2;
