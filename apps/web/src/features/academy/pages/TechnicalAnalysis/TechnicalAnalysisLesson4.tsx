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
                : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
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

// SVG 1: Why Prices React at Certain Areas
const WhyPricesReactSVG = () => (
  <svg viewBox="0 0 600 280" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="280" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="15" fontWeight="600" fill="#404047">Why Prices Pause at Certain Areas</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#75757D">Market memory creates zones where price tends to react</text>
    
    {/* Chart area */}
    <rect x="50" y="70" width="500" height="180" fill="#ffffff" rx="12" stroke="#E4E1D9" strokeWidth="2"/>
    
    {/* Price movement showing reactions */}
    <path 
      d="M70 200 L120 180 L160 195 L200 140 L250 155 L290 140 L340 155 L380 140 L430 100 L480 115 L530 85" 
      fill="none" 
      stroke="#5A77AA" 
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Highlighted reaction zone */}
    <rect x="180" y="130" width="220" height="35" fill="#5A77AA" fillOpacity="0.15" rx="4"/>
    <line x1="180" y1="147" x2="400" y2="147" stroke="#5A77AA" strokeWidth="1.5" strokeDasharray="6 4"/>
    
    {/* Bounce points */}
    <circle cx="200" cy="140" r="6" fill="#5A77AA"/>
    <circle cx="290" cy="140" r="6" fill="#5A77AA"/>
    <circle cx="380" cy="140" r="6" fill="#5A77AA"/>
    
    {/* Annotation */}
    <text x="290" y="125" textAnchor="middle" fontSize="9" fill="#344C72">Price reacts at this zone multiple times</text>
    
    {/* Bottom explanation */}
    <rect x="120" y="258" width="360" height="18" fill="#E0E7F1" rx="6"/>
    <text x="300" y="270" textAnchor="middle" fontSize="9" fill="#344C72">These reaction zones form because of collective market memory</text>
  </svg>
);

// SVG 2: Support Zone Explained
const SupportZoneSVG = () => (
  <svg viewBox="0 0 600 320" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="320" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#404047">Understanding Support</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#75757D">An area where buying interest tends to appear</text>
    
    {/* Chart area */}
    <rect x="50" y="70" width="500" height="200" fill="#ffffff" rx="12" stroke="#E4E1D9" strokeWidth="2"/>
    
    {/* Y-axis labels */}
    <text x="40" y="95" textAnchor="end" fontSize="9" fill="#A3A1A6">High</text>
    <text x="40" y="170" textAnchor="end" fontSize="9" fill="#A3A1A6">Mid</text>
    <text x="40" y="245" textAnchor="end" fontSize="9" fill="#A3A1A6">Low</text>
    
    {/* Support zone - highlighted area */}
    <rect x="60" y="215" width="480" height="40" fill="#1FA978" fillOpacity="0.2" rx="4"/>
    <text x="530" y="238" textAnchor="end" fontSize="10" fontWeight="500" fill="#12805A">Support Zone</text>
    
    {/* Price movement bouncing off support */}
    <path 
      d="M80 120 L130 160 L170 140 L210 200 L240 220 L260 200 L300 170 L340 210 L370 225 L400 195 L450 180 L490 215 L520 230 L530 210" 
      fill="none" 
      stroke="#5A77AA" 
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Bounce points at support */}
    <circle cx="240" cy="220" r="7" fill="#1FA978" stroke="#12805A" strokeWidth="2"/>
    <circle cx="370" cy="225" r="7" fill="#1FA978" stroke="#12805A" strokeWidth="2"/>
    <circle cx="520" cy="230" r="7" fill="#1FA978" stroke="#12805A" strokeWidth="2"/>
    
    {/* Bounce arrows */}
    <path d="M240 240 L240 255 M234 249 L240 255 L246 249" stroke="#12805A" strokeWidth="2" strokeLinecap="round" transform="rotate(180, 240, 247)"/>
    <path d="M370 240 L370 255 M364 249 L370 255 L376 249" stroke="#12805A" strokeWidth="2" strokeLinecap="round" transform="rotate(180, 370, 247)"/>
    <path d="M520 240 L520 255 M514 249 L520 255 L526 249" stroke="#12805A" strokeWidth="2" strokeLinecap="round" transform="rotate(180, 520, 247)"/>
    
    {/* Labels */}
    <text x="240" y="270" textAnchor="middle" fontSize="8" fill="#0D543C">Bounce</text>
    <text x="370" y="270" textAnchor="middle" fontSize="8" fill="#0D543C">Bounce</text>
    <text x="520" y="270" textAnchor="middle" fontSize="8" fill="#0D543C">Bounce</text>
    
    {/* Explanation box */}
    <rect x="140" y="285" width="320" height="28" fill="#D5F2E5" rx="8" stroke="#77D3AE" strokeWidth="1"/>
    <text x="300" y="300" textAnchor="middle" fontSize="10" fill="#0D543C">Price falls into the zone → Buyers step in → Price bounces up</text>
  </svg>
);

// SVG 3: Resistance Zone Explained
const ResistanceZoneSVG = () => (
  <svg viewBox="0 0 600 320" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="320" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#404047">Understanding Resistance</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#75757D">An area where selling interest tends to appear</text>
    
    {/* Chart area */}
    <rect x="50" y="70" width="500" height="200" fill="#ffffff" rx="12" stroke="#E4E1D9" strokeWidth="2"/>
    
    {/* Y-axis labels */}
    <text x="40" y="95" textAnchor="end" fontSize="9" fill="#A3A1A6">High</text>
    <text x="40" y="170" textAnchor="end" fontSize="9" fill="#A3A1A6">Mid</text>
    <text x="40" y="245" textAnchor="end" fontSize="9" fill="#A3A1A6">Low</text>
    
    {/* Resistance zone - highlighted area */}
    <rect x="60" y="80" width="480" height="40" fill="#E04848" fillOpacity="0.2" rx="4"/>
    <text x="530" y="103" textAnchor="end" fontSize="10" fontWeight="500" fill="#C7363B">Resistance Zone</text>
    
    {/* Price movement hitting resistance */}
    <path 
      d="M80 220 L130 180 L170 200 L210 140 L240 100 L260 130 L300 160 L340 120 L370 95 L400 125 L450 150 L490 105 L520 90 L530 115" 
      fill="none" 
      stroke="#5A77AA" 
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Rejection points at resistance */}
    <circle cx="240" cy="100" r="7" fill="#E04848" stroke="#C7363B" strokeWidth="2"/>
    <circle cx="370" cy="95" r="7" fill="#E04848" stroke="#C7363B" strokeWidth="2"/>
    <circle cx="520" cy="90" r="7" fill="#E04848" stroke="#C7363B" strokeWidth="2"/>
    
    {/* Rejection arrows pointing down */}
    <path d="M240 75 L240 60 M234 66 L240 60 L246 66" stroke="#C7363B" strokeWidth="2" strokeLinecap="round" transform="rotate(180, 240, 67)"/>
    <path d="M370 75 L370 60 M364 66 L370 60 L376 66" stroke="#C7363B" strokeWidth="2" strokeLinecap="round" transform="rotate(180, 370, 67)"/>
    <path d="M520 75 L520 60 M514 66 L520 60 L526 66" stroke="#C7363B" strokeWidth="2" strokeLinecap="round" transform="rotate(180, 520, 67)"/>
    
    {/* Labels */}
    <text x="240" y="55" textAnchor="middle" fontSize="8" fill="#842428">Rejection</text>
    <text x="370" y="55" textAnchor="middle" fontSize="8" fill="#842428">Rejection</text>
    <text x="520" y="55" textAnchor="middle" fontSize="8" fill="#842428">Rejection</text>
    
    {/* Explanation box */}
    <rect x="140" y="285" width="320" height="28" fill="#FBE1E1" rx="8" stroke="#F09B9B" strokeWidth="1"/>
    <text x="300" y="300" textAnchor="middle" fontSize="10" fill="#842428">Price rises into the zone → Sellers step in → Price falls back</text>
  </svg>
);

// SVG 4: Zones vs Lines
const ZonesVsLinesSVG = () => (
  <svg viewBox="0 0 640 300" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="640" height="300" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="320" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#404047">Zones, Not Exact Lines</text>
    <text x="320" y="48" textAnchor="middle" fontSize="11" fill="#75757D">Support and resistance are areas, not precise price points</text>
    
    {/* Left - Wrong: Exact line */}
    <rect x="30" y="70" width="270" height="200" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
    <text x="165" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">❌ Thinking in Exact Lines</text>
    
    <g transform="translate(165, 175)">
      <rect x="-100" y="-55" width="200" height="110" fill="#ffffff" rx="8" stroke="#F6C3C3" strokeWidth="1"/>
      
      {/* Single thin line */}
      <line x1="-80" y1="20" x2="80" y2="20" stroke="#E04848" strokeWidth="1.5"/>
      
      {/* Price crossing the line multiple times */}
      <path 
        d="M-70 -30 L-40 10 L-20 25 L10 15 L30 25 L50 10 L70 -20" 
        fill="none" 
        stroke="#A3A1A6" 
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Question marks showing confusion */}
      <text x="-20" y="45" fontSize="10" fill="#C7363B">?</text>
      <text x="30" y="45" fontSize="10" fill="#C7363B">?</text>
    </g>
    
    <text x="165" y="250" textAnchor="middle" fontSize="9" fill="#842428">"Price should react exactly here"</text>
    <text x="165" y="263" textAnchor="middle" fontSize="9" fill="#842428">Too rigid — leads to confusion</text>
    
    {/* Right - Correct: Zone */}
    <rect x="340" y="70" width="270" height="200" fill="#EEF9F4" rx="12" stroke="#77D3AE" strokeWidth="2"/>
    <text x="475" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#12805A">✓ Thinking in Zones</text>
    
    <g transform="translate(475, 175)">
      <rect x="-100" y="-55" width="200" height="110" fill="#ffffff" rx="8" stroke="#ABE5CC" strokeWidth="1"/>
      
      {/* Zone area */}
      <rect x="-80" y="5" width="160" height="35" fill="#1FA978" fillOpacity="0.25" rx="4"/>
      
      {/* Price reacting within the zone */}
      <path 
        d="M-70 -30 L-40 5 L-20 20 L10 10 L30 25 L50 15 L70 -25" 
        fill="none" 
        stroke="#1FA978" 
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Check marks */}
      <text x="-20" y="48" fontSize="10" fill="#12805A">✓</text>
      <text x="30" y="48" fontSize="10" fill="#12805A">✓</text>
    </g>
    
    <text x="475" y="250" textAnchor="middle" fontSize="9" fill="#0D543C">"Price tends to react in this area"</text>
    <text x="475" y="263" textAnchor="middle" fontSize="9" fill="#0D543C">Flexible — matches reality</text>
  </svg>
);

// SVG 5: Market Memory Concept
const MarketMemorySVG = () => (
  <svg viewBox="0 0 600 320" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="320" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#404047">Why Do These Zones Form?</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#75757D">Market memory — participants remember significant price areas</text>
    
    {/* Timeline visual */}
    <rect x="50" y="80" width="500" height="180" fill="#ffffff" rx="12" stroke="#E4E1D9" strokeWidth="2"/>
    
    {/* Price chart showing history */}
    <path 
      d="M70 200 L120 160 L160 180 L200 120 L240 140 L280 120 L320 150 L360 125 L400 145 L440 120 L480 140 L530 100" 
      fill="none" 
      stroke="#5A77AA" 
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Significant zone */}
    <rect x="180" y="110" width="280" height="45" fill="#8F6FC4" fillOpacity="0.2" rx="4"/>
    
    {/* Memory points */}
    <circle cx="200" cy="120" r="8" fill="#8F6FC4" stroke="#7A5BA6" strokeWidth="2"/>
    <circle cx="280" cy="120" r="8" fill="#8F6FC4" stroke="#7A5BA6" strokeWidth="2"/>
    <circle cx="360" cy="125" r="8" fill="#8F6FC4" stroke="#7A5BA6" strokeWidth="2"/>
    <circle cx="440" cy="120" r="8" fill="#8F6FC4" stroke="#7A5BA6" strokeWidth="2"/>
    
    {/* Annotation lines */}
    <line x1="200" y1="100" x2="200" y2="85" stroke="#7A5BA6" strokeWidth="1" strokeDasharray="3 2"/>
    <line x1="280" y1="100" x2="280" y2="85" stroke="#7A5BA6" strokeWidth="1" strokeDasharray="3 2"/>
    <line x1="360" y1="105" x2="360" y2="85" stroke="#7A5BA6" strokeWidth="1" strokeDasharray="3 2"/>
    <line x1="440" y1="100" x2="440" y2="85" stroke="#7A5BA6" strokeWidth="1" strokeDasharray="3 2"/>
    
    <text x="320" y="80" textAnchor="middle" fontSize="9" fill="#7A5BA6">Each reaction reinforces this zone in market memory</text>
    
    {/* Bottom explanation boxes */}
    <g transform="translate(0, 275)">
      <rect x="50" y="0" width="160" height="38" fill="#ECE4F6" rx="8" stroke="#C0A9E2" strokeWidth="1"/>
      <text x="130" y="15" textAnchor="middle" fontSize="9" fontWeight="500" fill="#7A5BA6">Traders remember</text>
      <text x="130" y="28" textAnchor="middle" fontSize="8" fill="#533F70">"Price reversed here before"</text>
      
      <rect x="220" y="0" width="160" height="38" fill="#ECE4F6" rx="8" stroke="#C0A9E2" strokeWidth="1"/>
      <text x="300" y="15" textAnchor="middle" fontSize="9" fontWeight="500" fill="#7A5BA6">Orders cluster</text>
      <text x="300" y="28" textAnchor="middle" fontSize="8" fill="#533F70">Around significant levels</text>
      
      <rect x="390" y="0" width="160" height="38" fill="#ECE4F6" rx="8" stroke="#C0A9E2" strokeWidth="1"/>
      <text x="470" y="15" textAnchor="middle" fontSize="9" fontWeight="500" fill="#7A5BA6">Self-reinforcing</text>
      <text x="470" y="28" textAnchor="middle" fontSize="8" fill="#533F70">More reactions = stronger zone</text>
    </g>
  </svg>
);

// SVG 6: Price Bouncing vs Breaking
const BounceVsBreakSVG = () => (
  <svg viewBox="0 0 640 340" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="640" height="340" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="320" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#404047">Two Outcomes at a Zone</text>
    <text x="320" y="48" textAnchor="middle" fontSize="11" fill="#75757D">Price can either bounce off or break through</text>
    
    {/* Left - Bounce */}
    <rect x="30" y="70" width="275" height="240" fill="#EEF9F4" rx="12" stroke="#77D3AE" strokeWidth="2"/>
    <text x="167" y="95" textAnchor="middle" fontSize="13" fontWeight="600" fill="#12805A">Bounce (Respect)</text>
    <text x="167" y="112" textAnchor="middle" fontSize="10" fill="#0E6A4A">Zone holds — price reverses</text>
    
    <g transform="translate(167, 195)">
      <rect x="-105" y="-70" width="210" height="140" fill="#ffffff" rx="8" stroke="#ABE5CC" strokeWidth="1"/>
      
      {/* Support zone */}
      <rect x="-85" y="25" width="170" height="30" fill="#1FA978" fillOpacity="0.25" rx="4"/>
      <text x="70" y="43" fontSize="8" fill="#0D543C">Support</text>
      
      {/* Price approaching and bouncing */}
      <path 
        d="M-70 -50 L-40 -20 L-10 -35 L20 10 L40 35 L50 15 L70 -10 L85 -40" 
        fill="none" 
        stroke="#5A77AA" 
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Bounce point */}
      <circle cx="40" cy="35" r="7" fill="#1FA978" stroke="#12805A" strokeWidth="2"/>
      
      {/* Arrow showing reversal */}
      <path d="M55 50 C70 60, 80 40, 90 -20" fill="none" stroke="#12805A" strokeWidth="1.5" strokeDasharray="4 3"/>
      <path d="M85 -15 L90 -20 L95 -12" fill="none" stroke="#12805A" strokeWidth="1.5"/>
    </g>
    
    <text x="167" y="290" textAnchor="middle" fontSize="9" fill="#0D543C">Price touches zone and reverses</text>
    <text x="167" y="303" textAnchor="middle" fontSize="9" fill="#0D543C">Zone remains valid</text>
    
    {/* Right - Break */}
    <rect x="335" y="70" width="275" height="240" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
    <text x="472" y="95" textAnchor="middle" fontSize="13" fontWeight="600" fill="#C7363B">Break (Violation)</text>
    <text x="472" y="112" textAnchor="middle" fontSize="10" fill="#A52A2F">Zone fails — price continues through</text>
    
    <g transform="translate(472, 195)">
      <rect x="-105" y="-70" width="210" height="140" fill="#ffffff" rx="8" stroke="#F6C3C3" strokeWidth="1"/>
      
      {/* Support zone */}
      <rect x="-85" y="25" width="170" height="30" fill="#E04848" fillOpacity="0.2" rx="4"/>
      <text x="70" y="43" fontSize="8" fill="#842428">Broken</text>
      
      {/* Price breaking through */}
      <path 
        d="M-70 -50 L-40 -20 L-10 -35 L20 10 L40 35 L55 45 L70 55 L85 60" 
        fill="none" 
        stroke="#5A77AA" 
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Break point */}
      <circle cx="55" cy="45" r="7" fill="#E04848" stroke="#C7363B" strokeWidth="2"/>
      
      {/* Arrow showing continuation */}
      <path d="M70 55 L90 70" fill="none" stroke="#C7363B" strokeWidth="2"/>
      <path d="M83 72 L90 70 L88 63" fill="none" stroke="#C7363B" strokeWidth="2"/>
    </g>
    
    <text x="472" y="290" textAnchor="middle" fontSize="9" fill="#842428">Price pushes through the zone</text>
    <text x="472" y="303" textAnchor="middle" fontSize="9" fill="#842428">Zone is broken / invalidated</text>
  </svg>
);

// SVG 7: Practical Example - Support Reaction
const SupportExampleSVG = () => (
  <svg viewBox="0 0 600 300" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="300" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="300" y="25" textAnchor="middle" fontSize="14" fontWeight="600" fill="#404047">Example: Price Reacting at Support</text>
    
    {/* Chart area */}
    <rect x="60" y="50" width="480" height="200" fill="#ffffff" rx="10" stroke="#E4E1D9" strokeWidth="2"/>
    
    {/* Y-axis */}
    <text x="50" y="75" textAnchor="end" fontSize="9" fill="#A3A1A6">$55</text>
    <text x="50" y="120" textAnchor="end" fontSize="9" fill="#A3A1A6">$50</text>
    <text x="50" y="165" textAnchor="end" fontSize="9" fill="#A3A1A6">$45</text>
    <text x="50" y="210" textAnchor="end" fontSize="9" fill="#A3A1A6">$40</text>
    
    {/* Grid */}
    <line x1="70" y1="75" x2="530" y2="75" stroke="#EFEDE7" strokeWidth="1"/>
    <line x1="70" y1="120" x2="530" y2="120" stroke="#EFEDE7" strokeWidth="1"/>
    <line x1="70" y1="165" x2="530" y2="165" stroke="#EFEDE7" strokeWidth="1"/>
    <line x1="70" y1="210" x2="530" y2="210" stroke="#EFEDE7" strokeWidth="1"/>
    
    {/* Support zone */}
    <rect x="70" y="195" width="460" height="35" fill="#1FA978" fillOpacity="0.2" rx="4"/>
    <text x="520" y="215" textAnchor="end" fontSize="9" fill="#12805A">$40-42 Zone</text>
    
    {/* Price movement */}
    <path 
      d="M90 85 L140 100 L190 90 L240 130 L290 150 L340 175 L380 205 L410 185 L450 145 L500 110 L520 95" 
      fill="none" 
      stroke="#5A77AA" 
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Bounce point */}
    <circle cx="380" cy="205" r="8" fill="#1FA978" stroke="#12805A" strokeWidth="2"/>
    
    {/* Annotation */}
    <line x1="380" y1="215" x2="380" y2="235" stroke="#12805A" strokeWidth="1.5"/>
    <text x="380" y="248" textAnchor="middle" fontSize="9" fill="#0D543C">Price touches $41</text>
    <text x="380" y="260" textAnchor="middle" fontSize="9" fill="#0D543C">and bounces higher</text>
    
    {/* Time axis */}
    <text x="150" y="270" textAnchor="middle" fontSize="9" fill="#A3A1A6">Week 1</text>
    <text x="300" y="270" textAnchor="middle" fontSize="9" fill="#A3A1A6">Week 2</text>
    <text x="450" y="270" textAnchor="middle" fontSize="9" fill="#A3A1A6">Week 3</text>
    
    {/* Info box */}
    <rect x="150" y="280" width="300" height="16" fill="#D5F2E5" rx="4"/>
    <text x="300" y="291" textAnchor="middle" fontSize="9" fill="#0D543C">Observation: Buyers appeared around $40-42</text>
  </svg>
);

// SVG 8: Practical Example - Resistance Break
const ResistanceBreakExampleSVG = () => (
  <svg viewBox="0 0 600 300" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="300" fill="#F7F6F2" rx="16"/>
    
    {/* Title */}
    <text x="300" y="25" textAnchor="middle" fontSize="14" fontWeight="600" fill="#404047">Example: Price Breaking Through Resistance</text>
    
    {/* Chart area */}
    <rect x="60" y="50" width="480" height="200" fill="#ffffff" rx="10" stroke="#E4E1D9" strokeWidth="2"/>
    
    {/* Y-axis */}
    <text x="50" y="75" textAnchor="end" fontSize="9" fill="#A3A1A6">$75</text>
    <text x="50" y="120" textAnchor="end" fontSize="9" fill="#A3A1A6">$70</text>
    <text x="50" y="165" textAnchor="end" fontSize="9" fill="#A3A1A6">$65</text>
    <text x="50" y="210" textAnchor="end" fontSize="9" fill="#A3A1A6">$60</text>
    
    {/* Grid */}
    <line x1="70" y1="75" x2="530" y2="75" stroke="#EFEDE7" strokeWidth="1"/>
    <line x1="70" y1="120" x2="530" y2="120" stroke="#EFEDE7" strokeWidth="1"/>
    <line x1="70" y1="165" x2="530" y2="165" stroke="#EFEDE7" strokeWidth="1"/>
    <line x1="70" y1="210" x2="530" y2="210" stroke="#EFEDE7" strokeWidth="1"/>
    
    {/* Resistance zone */}
    <rect x="70" y="105" width="460" height="30" fill="#E04848" fillOpacity="0.2" rx="4"/>
    <text x="520" y="122" textAnchor="end" fontSize="9" fill="#C7363B">$68-70 Zone</text>
    
    {/* Price movement with rejections then break */}
    <path 
      d="M90 200 L130 175 L160 190 L200 150 L230 120 L250 145 L290 160 L330 125 L350 115 L380 130 L420 110 L460 95 L500 80 L520 70" 
      fill="none" 
      stroke="#5A77AA" 
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Rejection points */}
    <circle cx="230" cy="120" r="6" fill="#D2754C" stroke="#C0623B" strokeWidth="2"/>
    <circle cx="350" cy="115" r="6" fill="#D2754C" stroke="#C0623B" strokeWidth="2"/>
    
    {/* Break point */}
    <circle cx="420" cy="110" r="8" fill="#1FA978" stroke="#12805A" strokeWidth="2"/>
    
    {/* Annotations */}
    <text x="230" y="105" textAnchor="middle" fontSize="8" fill="#C0623B">Rejected</text>
    <text x="350" y="100" textAnchor="middle" fontSize="8" fill="#C0623B">Rejected</text>
    
    <line x1="420" y1="95" x2="420" y2="75" stroke="#12805A" strokeWidth="1.5"/>
    <text x="420" y="68" textAnchor="middle" fontSize="9" fill="#0D543C">Breakthrough!</text>
    
    {/* Time axis */}
    <text x="150" y="270" textAnchor="middle" fontSize="9" fill="#A3A1A6">Week 1</text>
    <text x="300" y="270" textAnchor="middle" fontSize="9" fill="#A3A1A6">Week 2</text>
    <text x="450" y="270" textAnchor="middle" fontSize="9" fill="#A3A1A6">Week 3</text>
    
    {/* Info box */}
    <rect x="130" y="280" width="340" height="16" fill="#E0E7F1" rx="4"/>
    <text x="300" y="291" textAnchor="middle" fontSize="9" fill="#344C72">Observation: Two rejections, then a break above $70</text>
  </svg>
);

const TechnicalAnalysisLesson4 = () => {
  const navigate = useNavigate();

  const quizQuestions = [
    {
      question: "What is support?",
      options: [
        "A single exact price where the market always reverses",
        "An area where buying interest tends to appear and price may bounce",
        "A tool used to predict future prices",
        "The highest price an asset has ever reached"
      ],
      correctAnswer: "An area where buying interest tends to appear and price may bounce",
      explanation: "Support is a price zone (not an exact point) where buying interest historically appears. When price falls into this area, buyers may step in, causing price to bounce. It's about observed behavior, not guaranteed outcomes."
    },
    {
      question: "Why do support and resistance zones form?",
      options: [
        "They are randomly placed on charts",
        "They appear only in certain markets",
        "Market participants remember significant price areas and orders cluster there",
        "They are created by trading platforms"
      ],
      correctAnswer: "Market participants remember significant price areas and orders cluster there",
      explanation: "Support and resistance zones form through market memory — traders remember price areas where significant reactions occurred before. This causes orders to cluster around these levels, creating zones where price is more likely to react."
    }
  ];

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/learn/technical-analysis')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <FaArrowLeft />
            <span>Back to Technical Analysis</span>
          </button>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Lesson 4 of 7
            </span>
            <h1 className="text-3xl font-display font-normal text-gray-800 mt-4 tracking-[-0.015em]">Support & Resistance</h1>
            <p className="text-gray-600 mt-2">Understanding price reaction zones in the market</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Why Prices Pause at Certain Areas</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              If you've ever watched a price chart, you may have noticed something curious: 
              prices don't move randomly. They often <strong>pause, hesitate, or reverse</strong> at 
              certain areas — as if there's an invisible force pushing back.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              These areas are called <strong>support</strong> and <strong>resistance</strong>. 
              They're not magic lines drawn by experts. They're zones where market participants 
              have historically shown interest — either buying or selling.
            </p>
            <p className="text-lg leading-relaxed">
              Understanding these zones won't tell you what will happen next. But it will help 
              you recognize <strong>where the market has reacted before</strong> — and that's 
              valuable context.
            </p>
          </div>

          <WhyPricesReactSVG />
          
          <div className="mt-6 bg-blue-50 rounded-xl p-5 border border-blue-200">
            <p className="text-blue-800">
              <strong>Key principle:</strong> Support and resistance are about observation, not prediction. 
              They show where price has reacted — not where it will react.
            </p>
          </div>
        </div>

        {/* Support Explained */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">What is Support?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              <strong>Support</strong> is a price area where <strong>buying interest tends to appear</strong>. 
              When price falls into a support zone, buyers may step in — either because they see 
              value at that price or because they've placed orders there.
            </p>
            <p className="text-lg leading-relaxed">
              Think of it as a "floor" that price tends to bounce off. But remember: floors can 
              break. Support doesn't guarantee a reversal — it just marks an area where buying 
              has appeared before.
            </p>
          </div>

          <SupportZoneSVG />
          
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-5 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Support Zone Characteristics</h4>
              <ul className="text-green-900 text-sm space-y-1">
                <li>• Located below current price</li>
                <li>• Buying interest appears here</li>
                <li>• Price tends to bounce up</li>
                <li>• Formed by historical reactions</li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-2">Important to Remember</h4>
              <ul className="text-slate-700 text-sm space-y-1">
                <li>• It's a zone, not an exact price</li>
                <li>• More touches = stronger zone</li>
                <li>• Can be broken at any time</li>
                <li>• Observation, not certainty</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Resistance Explained */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">What is Resistance?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              <strong>Resistance</strong> is the opposite of support. It's a price area where 
              <strong> selling interest tends to appear</strong>. When price rises into a resistance 
              zone, sellers may step in — either taking profits or entering new positions.
            </p>
            <p className="text-lg leading-relaxed">
              Think of it as a "ceiling" that price struggles to break through. But like support, 
              ceilings can break too. Resistance marks where selling has appeared before — not 
              where it will always appear.
            </p>
          </div>

          <ResistanceZoneSVG />
          
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-xl p-5 border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">Resistance Zone Characteristics</h4>
              <ul className="text-red-900 text-sm space-y-1">
                <li>• Located above current price</li>
                <li>• Selling interest appears here</li>
                <li>• Price tends to fall back</li>
                <li>• Formed by historical reactions</li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-2">Important to Remember</h4>
              <ul className="text-slate-700 text-sm space-y-1">
                <li>• It's a zone, not an exact price</li>
                <li>• Multiple rejections = stronger zone</li>
                <li>• Can be broken at any time</li>
                <li>• Observation, not certainty</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Zones vs Lines */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Zones, Not Exact Lines</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              One of the most important things to understand: support and resistance are 
              <strong> areas</strong>, not precise price points. Beginners often make the mistake 
              of expecting price to react at an exact number — $50.00, not $49.87 or $50.23.
            </p>
            <p className="text-lg leading-relaxed">
              Markets don't work that way. Price might react slightly above or below where you 
              expect. That's why thinking in <strong>zones</strong> is more realistic and flexible 
              than thinking in exact lines.
            </p>
          </div>

          <ZonesVsLinesSVG />
          
          <div className="mt-6 bg-slate-700 rounded-xl p-5 text-white">
            <p className="font-medium">
              💡 When you identify a level, give it some breathing room. Instead of marking 
              "$50 exactly," think "$49-51 area." This matches how markets actually behave.
            </p>
          </div>
        </div>

        {/* Market Memory */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Why Do These Zones Form?</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Support and resistance zones form because of <strong>market memory</strong>. 
              Traders and investors remember price areas where significant events occurred — 
              major reversals, important highs and lows, or prolonged consolidation periods.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              When price approaches these remembered areas again, market participants may act 
              based on that memory. Some place orders in advance. Others react when price arrives. 
              This clustering of interest creates the zone.
            </p>
            <p className="text-lg leading-relaxed">
              The more times price reacts at a zone, the more traders remember it — making it 
              even more significant. It's a self-reinforcing phenomenon.
            </p>
          </div>

          <MarketMemorySVG />
        </div>

        {/* Bounce vs Break */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Two Outcomes at a Zone</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              When price reaches a support or resistance zone, <strong>only two things can happen</strong>:
            </p>
            <ol className="text-lg leading-relaxed mb-4 list-decimal list-inside space-y-2">
              <li><strong>Bounce (Respect):</strong> The zone holds, and price reverses direction</li>
              <li><strong>Break (Violation):</strong> The zone fails, and price continues through</li>
            </ol>
            <p className="text-lg leading-relaxed">
              Neither outcome is predictable in advance. The zone simply marks a place where 
              a reaction is <strong>more likely</strong> — not guaranteed. Sometimes zones hold for 
              months; sometimes they break on the first test.
            </p>
          </div>

          <BounceVsBreakSVG />
          
          <div className="mt-6 bg-amber-50 rounded-xl p-5 border border-amber-200">
            <p className="text-amber-800">
              <strong>Remember:</strong> A broken zone isn't "wrong" — it's just broken. 
              Markets evolve, and zones that once held can eventually give way. This is normal 
              market behavior.
            </p>
          </div>
        </div>

        {/* Practical Examples */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 tracking-[-0.015em]">Practical Examples</h2>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-200">
            <h3 className="text-xl font-semibold text-green-800 mb-4">📌 Example 1: Price Reacting at Support</h3>
            <p className="text-gray-700 mb-4">
              An asset has established a support zone around <strong>$40-42</strong>. Price 
              falls from $55 over two weeks, then enters this zone. At $41, buying interest 
              appears, and price bounces back toward $50.
            </p>
          </div>

          <SupportExampleSVG />

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 my-6 border border-blue-200">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">📌 Example 2: Price Breaking Through Resistance</h3>
            <p className="text-gray-700 mb-4">
              An asset has resistance around <strong>$68-70</strong>. Price approaches this 
              zone twice and gets rejected both times. On the third attempt, however, 
              price pushes through and continues higher to $75.
            </p>
          </div>

          <ResistanceBreakExampleSVG />
          
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-5 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Support Reaction</h4>
              <p className="text-green-900 text-sm">
                The $40-42 zone showed buying interest. Price bounced — but this doesn't 
                mean it will always bounce there in the future.
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Resistance Break</h4>
              <p className="text-blue-900 text-sm">
                The $68-70 zone held twice but eventually broke. Zones can hold for a while 
                and then give way — that's normal market behavior.
              </p>
            </div>
          </div>
        </div>

        {/* India-specific Note */}
        <div className="bg-indigo-50 rounded-2xl p-6 shadow-lg mb-8 border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-800 mb-3">🌍 Global Context</h3>
          <p className="text-indigo-900">
            Support and resistance are universal concepts that appear in every market worldwide — 
            from U.S. equities to European forex to Asian commodity markets. The psychology 
            behind these zones (market memory, order clustering, historical significance) works 
            the same way in India as anywhere else. Whether you're observing the Nifty 50, 
            individual stocks, or global indices, the same principles apply.
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
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-purple-500 rounded-full p-3">
              <FaLightbulb className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-purple-800 mb-3">Reflection Activity</h3>
              <div className="bg-white rounded-xl p-5 border border-purple-200">
                <p className="text-gray-800 font-medium mb-3">
                  Take a moment to consider:
                </p>
                <p className="text-gray-700 mb-4 italic">
                  "Why might price react at the same area repeatedly? Think about what happens 
                  when many people remember a significant event at a particular price — how 
                  might their collective memory influence future behavior?"
                </p>
                <p className="text-gray-600 text-sm">
                  This reflection helps you internalize the concept of market memory. When you 
                  understand <em>why</em> these zones form, you'll recognize them more naturally 
                  when you see them on charts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 shadow-lg mb-8 text-white">
          <h3 className="text-xl font-semibold mb-3">🔑 Key Takeaways</h3>
          <ul className="space-y-2 text-lg">
            <li>• Support = price area where buying interest tends to appear</li>
            <li>• Resistance = price area where selling interest tends to appear</li>
            <li>• These are zones, not exact lines — give them room</li>
            <li>• Market memory creates these zones through collective behavior</li>
            <li>• Price can either bounce off or break through a zone</li>
            <li>• Observation and context — not prediction</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/technical-analysis-lesson-3')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition-colors"
          >
            <FaArrowLeft />
            <span>Previous Lesson</span>
          </button>
          <button
            onClick={() => navigate('/learn/technical-analysis-lesson-5')}
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

export default TechnicalAnalysisLesson4;
