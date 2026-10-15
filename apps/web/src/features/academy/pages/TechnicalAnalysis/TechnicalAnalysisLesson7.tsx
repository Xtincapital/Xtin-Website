import React, { useState } from 'react';
import StudyShell from "../../components/StudyShell";
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaLightbulb, FaTrophy } from 'react-icons/fa';

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
                  ? 'border-brand bg-brand-soft'
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
        <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${isCorrect ? 'bg-brand-soft' : 'bg-red-100'}`}>
          {isCorrect ? (
            <FaCheckCircle className="text-brand text-xl flex-shrink-0 mt-0.5" />
          ) : (
            <FaTimesCircle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`font-semibold ${isCorrect ? 'text-brand' : 'text-red-800'}`}>
              {isCorrect ? 'Correct!' : 'Not quite right'}
            </p>
            <p className="text-gray-700 mt-1">{explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// SVG 1: Overloaded vs Clean Chart
const OverloadedVsCleanSVG = () => (
  <svg viewBox="0 0 640 340" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="640" height="340" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="320" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#373A41">Mistake #1: Overloading the Chart</text>
    <text x="320" y="48" textAnchor="middle" fontSize="11" fill="#717680">More indicators don't mean better understanding</text>
    
    {/* Left - Overloaded */}
    <rect x="30" y="70" width="275" height="240" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
    <text x="167" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">❌ Overloaded Chart</text>
    
    <g transform="translate(167, 185)">
      <rect x="-105" y="-70" width="210" height="140" fill="#ffffff" rx="8" stroke="#F6C3C3" strokeWidth="1"/>
      
      {/* Chaotic overlapping lines */}
      <path d="M-85 30 L-50 10 L-20 25 L10 5 L40 20 L70 -10 L85 0" fill="none" stroke="#A0A3AA" strokeWidth="1.5"/>
      <path d="M-85 20 L-40 15 L0 5 L40 -5 L85 -15" fill="none" stroke="#5A77AA" strokeWidth="1.5"/>
      <path d="M-85 40 L-30 25 L20 35 L60 15 L85 25" fill="none" stroke="#16A34A" strokeWidth="1.5"/>
      <path d="M-85 -20 L-50 -30 L-10 -15 L30 -35 L70 -20 L85 -30" fill="none" stroke="#D2754C" strokeWidth="1.5"/>
      <path d="M-85 -10 L-40 0 L10 -20 L50 -5 L85 -25" fill="none" stroke="#8F6FC4" strokeWidth="1.5"/>
      <path d="M-85 50 L-30 35 L30 50 L85 30" fill="none" stroke="#E04848" strokeWidth="1.5" strokeDasharray="4 2"/>
      <path d="M-85 -40 L0 -50 L85 -35" fill="none" stroke="#33A0AE" strokeWidth="1.5" strokeDasharray="3 3"/>
      
      {/* Confusion indicators */}
      <text x="-60" y="-50" fontSize="14" fill="#C7363B">?</text>
      <text x="30" y="55" fontSize="14" fill="#C7363B">?</text>
      <text x="65" y="-45" fontSize="14" fill="#C7363B">?</text>
    </g>
    
    <text x="167" y="288" textAnchor="middle" fontSize="9" fill="#842428">"I can't tell what's happening"</text>
    <text x="167" y="302" textAnchor="middle" fontSize="9" fill="#842428">Overwhelmed and confused</text>
    
    {/* Right - Clean */}
    <rect x="335" y="70" width="275" height="240" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
    <text x="472" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A">✓ Clean Chart</text>
    
    <g transform="translate(472, 185)">
      <rect x="-105" y="-70" width="210" height="140" fill="#ffffff" rx="8" stroke="#BBF7D0" strokeWidth="1"/>
      
      {/* Clean price only */}
      <path d="M-85 30 L-50 10 L-20 25 L10 5 L40 20 L70 -10 L85 0" fill="none" stroke="#717680" strokeWidth="2.5"/>
      
      {/* One simple moving average */}
      <path d="M-85 25 L-40 15 L5 8 L50 -2 L85 -8" fill="none" stroke="#16A34A" strokeWidth="2"/>
    </g>
    
    <text x="472" y="288" textAnchor="middle" fontSize="9" fill="#16A34A">"Price is trending up"</text>
    <text x="472" y="302" textAnchor="middle" fontSize="9" fill="#16A34A">Clear and focused</text>
  </svg>
);

// SVG 2: Prediction vs Observation Mindset
const PredictionVsObservationSVG = () => (
  <svg viewBox="0 0 640 320" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="640" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="320" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#373A41">Mistake #2: Predicting Instead of Observing</text>
    <text x="320" y="48" textAnchor="middle" fontSize="11" fill="#717680">Charts show context, not certainty</text>
    
    {/* Left - Prediction mindset */}
    <rect x="30" y="70" width="275" height="220" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
    <text x="167" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">❌ Prediction Mindset</text>
    
    <g transform="translate(167, 170)">
      <rect x="-100" y="-50" width="200" height="100" fill="#FBE1E1" rx="8" stroke="#F09B9B" strokeWidth="1"/>
      
      {/* Price chart */}
      <path d="M-80 30 L-40 10 L0 20 L40 -10 L70 0" fill="none" stroke="#717680" strokeWidth="2"/>
      
      {/* Predicted future arrow */}
      <path d="M70 0 L90 -30" stroke="#C7363B" strokeWidth="2" strokeDasharray="4 3"/>
      <polygon points="88,-35 95,-28 85,-28" fill="#C7363B"/>
      <text x="95" y="-35" fontSize="8" fill="#C7363B">"It WILL go up!"</text>
      
      {/* Crystal ball */}
      <circle cx="-70" cy="-30" r="12" fill="#ECE4F6" stroke="#8F6FC4" strokeWidth="1"/>
      <text x="-70" y="-26" textAnchor="middle" fontSize="8">🔮</text>
    </g>
    
    <text x="167" y="255" textAnchor="middle" fontSize="9" fill="#842428">"I know what happens next"</text>
    <text x="167" y="269" textAnchor="middle" fontSize="9" fill="#842428">Overconfident, often wrong</text>
    
    {/* Right - Observation mindset */}
    <rect x="335" y="70" width="275" height="220" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
    <text x="472" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A">✓ Observation Mindset</text>
    
    <g transform="translate(472, 170)">
      <rect x="-100" y="-50" width="200" height="100" fill="#F0FDF4" rx="8" stroke="#16A34A" strokeWidth="1"/>
      
      {/* Price chart */}
      <path d="M-80 30 L-40 10 L0 20 L40 -10 L70 0" fill="none" stroke="#717680" strokeWidth="2"/>
      
      {/* Question mark for future */}
      <text x="85" y="5" fontSize="14" fill="#717680">?</text>
      
      {/* Eye icon */}
      <ellipse cx="-70" cy="-30" rx="14" ry="10" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5"/>
      <circle cx="-70" cy="-30" r="4" fill="#16A34A"/>
    </g>
    
    <text x="472" y="255" textAnchor="middle" fontSize="9" fill="#16A34A">"Price is currently rising"</text>
    <text x="472" y="269" textAnchor="middle" fontSize="9" fill="#16A34A">Humble, context-aware</text>
  </svg>
);

// SVG 3: Ignoring Higher Timeframe
const HigherTimeframeSVG = () => (
  <svg viewBox="0 0 640 380" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="640" height="380" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="320" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#373A41">Mistake #3: Ignoring the Bigger Picture</text>
    <text x="320" y="48" textAnchor="middle" fontSize="11" fill="#717680">Short-term noise can mislead without higher timeframe context</text>
    
    {/* Short timeframe only - Mistake */}
    <rect x="30" y="70" width="275" height="140" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
    <text x="167" y="95" textAnchor="middle" fontSize="11" fontWeight="600" fill="#C7363B">❌ Only Looking at Short Timeframe</text>
    
    <g transform="translate(167, 145)">
      <rect x="-100" y="-35" width="200" height="70" fill="#ffffff" rx="6" stroke="#F6C3C3" strokeWidth="1"/>
      <text x="-90" y="-20" fontSize="7" fill="#C7363B">5-min chart</text>
      
      {/* Short term uptrend */}
      <path d="M-80 25 L-50 15 L-20 20 L10 5 L40 10 L70 -5 L85 -15" fill="none" stroke="#16A34A" strokeWidth="2"/>
      <text x="0" y="-20" textAnchor="middle" fontSize="8" fill="#16A34A">"Strong uptrend!"</text>
    </g>
    
    {/* Higher timeframe context - Correct */}
    <rect x="335" y="70" width="275" height="140" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
    <text x="472" y="95" textAnchor="middle" fontSize="11" fontWeight="600" fill="#16A34A">✓ With Higher Timeframe Context</text>
    
    <g transform="translate(472, 145)">
      <rect x="-100" y="-35" width="200" height="70" fill="#ffffff" rx="6" stroke="#BBF7D0" strokeWidth="1"/>
      <text x="-90" y="-20" fontSize="7" fill="#16A34A">Daily chart</text>
      
      {/* Long term downtrend with small bounce */}
      <path d="M-80 -20 L-50 -10 L-20 5 L10 15 L40 25 L70 20 L85 30" fill="none" stroke="#E04848" strokeWidth="2"/>
      
      {/* Small rectangle showing where short-term is */}
      <rect x="50" y="15" width="35" height="20" fill="none" stroke="#5A77AA" strokeWidth="1" strokeDasharray="3 2"/>
      <text x="67" y="10" textAnchor="middle" fontSize="6" fill="#5A77AA">5-min</text>
    </g>
    
    {/* Insight box */}
    <rect x="80" y="230" width="480" height="130" fill="#E0E7F1" rx="12" stroke="#9FB3D3" strokeWidth="2"/>
    <text x="320" y="258" textAnchor="middle" fontSize="12" fontWeight="600" fill="#344C72">The Reality</text>
    
    <g transform="translate(320, 300)">
      <rect x="-180" y="-25" width="360" height="50" fill="#ffffff" rx="8"/>
      
      {/* Combined view */}
      <path d="M-160 -5 L-120 5 L-80 15 L-40 10 L0 20 L40 15 L80 25 L120 20 L145 30" fill="none" stroke="#E04848" strokeWidth="2"/>
      
      {/* Small uptick at end */}
      <path d="M120 20 L145 30 L155 25" fill="none" stroke="#16A34A" strokeWidth="2"/>
      
      <text x="0" y="-35" textAnchor="middle" fontSize="9" fill="#717680">Short-term rise within a larger decline</text>
    </g>
    
    <text x="320" y="355" textAnchor="middle" fontSize="10" fill="#26354F">What looks strong in isolation may be weak in context</text>
  </svg>
);

// SVG 4: Drawing Too Many Lines
const TooManyLinesSVG = () => (
  <svg viewBox="0 0 640 320" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="640" height="320" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="320" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#373A41">Mistake #4: Drawing Too Many Lines</text>
    <text x="320" y="48" textAnchor="middle" fontSize="11" fill="#717680">When everything is important, nothing is</text>
    
    {/* Left - Too many lines */}
    <rect x="30" y="70" width="275" height="220" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
    <text x="167" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">❌ Line Overload</text>
    
    <g transform="translate(167, 180)">
      <rect x="-105" y="-65" width="210" height="130" fill="#ffffff" rx="8" stroke="#F6C3C3" strokeWidth="1"/>
      
      {/* Price */}
      <path d="M-85 20 L-50 0 L-20 15 L10 -10 L40 5 L70 -20 L85 -10" fill="none" stroke="#717680" strokeWidth="2"/>
      
      {/* Too many horizontal lines */}
      <line x1="-90" y1="-50" x2="90" y2="-50" stroke="#E04848" strokeWidth="1"/>
      <line x1="-90" y1="-35" x2="90" y2="-35" stroke="#D2754C" strokeWidth="1"/>
      <line x1="-90" y1="-20" x2="90" y2="-20" stroke="#B8923F" strokeWidth="1"/>
      <line x1="-90" y1="-5" x2="90" y2="-5" stroke="#16A34A" strokeWidth="1"/>
      <line x1="-90" y1="10" x2="90" y2="10" stroke="#5A77AA" strokeWidth="1"/>
      <line x1="-90" y1="25" x2="90" y2="25" stroke="#8F6FC4" strokeWidth="1"/>
      <line x1="-90" y1="40" x2="90" y2="40" stroke="#8F6FC4" strokeWidth="1"/>
      
      {/* Trendlines */}
      <line x1="-85" y1="50" x2="50" y2="-40" stroke="#33A0AE" strokeWidth="1" strokeDasharray="4 2"/>
      <line x1="-60" y1="50" x2="85" y2="-20" stroke="#33A0AE" strokeWidth="1" strokeDasharray="4 2"/>
    </g>
    
    <text x="167" y="268" textAnchor="middle" fontSize="9" fill="#842428">"Every level matters!"</text>
    <text x="167" y="282" textAnchor="middle" fontSize="9" fill="#842428">Analysis paralysis</text>
    
    {/* Right - Key levels only */}
    <rect x="335" y="70" width="275" height="220" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
    <text x="472" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A">✓ Key Levels Only</text>
    
    <g transform="translate(472, 180)">
      <rect x="-105" y="-65" width="210" height="130" fill="#ffffff" rx="8" stroke="#BBF7D0" strokeWidth="1"/>
      
      {/* Price */}
      <path d="M-85 20 L-50 0 L-20 15 L10 -10 L40 5 L70 -20 L85 -10" fill="none" stroke="#717680" strokeWidth="2"/>
      
      {/* Only 2 key levels */}
      <line x1="-90" y1="-25" x2="90" y2="-25" stroke="#E04848" strokeWidth="1.5"/>
      <text x="95" y="-22" fontSize="7" fill="#E04848">Resistance</text>
      
      <line x1="-90" y1="25" x2="90" y2="25" stroke="#16A34A" strokeWidth="1.5"/>
      <text x="95" y="28" fontSize="7" fill="#16A34A">Support</text>
    </g>
    
    <text x="472" y="268" textAnchor="middle" fontSize="9" fill="#16A34A">"Two key zones to watch"</text>
    <text x="472" y="282" textAnchor="middle" fontSize="9" fill="#16A34A">Focused and actionable</text>
  </svg>
);

// SVG 5: Changing Tools Frequently
const ChangingToolsSVG = () => (
  <svg viewBox="0 0 640 300" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="640" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="320" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#373A41">Mistake #5: Constantly Changing Tools</text>
    <text x="320" y="48" textAnchor="middle" fontSize="11" fill="#717680">Jumping between setups prevents understanding any of them</text>
    
    {/* Left - Tool hopping */}
    <rect x="30" y="70" width="275" height="200" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
    <text x="167" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">❌ Tool Hopping</text>
    
    <g transform="translate(167, 170)">
      {/* Timeline with different tools */}
      <line x1="-100" y1="0" x2="100" y2="0" stroke="#E4E4EA" strokeWidth="2"/>
      
      {/* Week 1 */}
      <circle cx="-75" cy="0" r="15" fill="#FBE1E1" stroke="#F09B9B" strokeWidth="1"/>
      <text x="-75" y="4" textAnchor="middle" fontSize="8" fill="#842428">MA</text>
      <text x="-75" y="-25" textAnchor="middle" fontSize="7" fill="#717680">Week 1</text>
      
      {/* Week 2 */}
      <circle cx="-25" cy="0" r="15" fill="#F6ECCE" stroke="#E2C273" strokeWidth="1"/>
      <text x="-25" y="4" textAnchor="middle" fontSize="8" fill="#7C5D2B">RSI</text>
      <text x="-25" y="-25" textAnchor="middle" fontSize="7" fill="#717680">Week 2</text>
      
      {/* Week 3 */}
      <circle cx="25" cy="0" r="15" fill="#E0E7F1" stroke="#9FB3D3" strokeWidth="1"/>
      <text x="25" y="4" textAnchor="middle" fontSize="7" fill="#344C72">MACD</text>
      <text x="25" y="-25" textAnchor="middle" fontSize="7" fill="#717680">Week 3</text>
      
      {/* Week 4 */}
      <circle cx="75" cy="0" r="15" fill="#ECE4F6" stroke="#C0A9E2" strokeWidth="1"/>
      <text x="75" y="4" textAnchor="middle" fontSize="7" fill="#7A5BA6">Bands</text>
      <text x="75" y="-25" textAnchor="middle" fontSize="7" fill="#717680">Week 4</text>
      
      <text x="0" y="45" textAnchor="middle" fontSize="8" fill="#C7363B">→ Never masters any tool</text>
    </g>
    
    <text x="167" y="250" textAnchor="middle" fontSize="9" fill="#842428">"This one doesn't work, try another"</text>
    
    {/* Right - Consistent approach */}
    <rect x="335" y="70" width="275" height="200" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
    <text x="472" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A">✓ Consistent Approach</text>
    
    <g transform="translate(472, 170)">
      {/* Timeline with same tool */}
      <line x1="-100" y1="0" x2="100" y2="0" stroke="#16A34A" strokeWidth="2"/>
      
      {/* All weeks same tool */}
      <circle cx="-75" cy="0" r="15" fill="#F0FDF4" stroke="#16A34A" strokeWidth="2"/>
      <text x="-75" y="4" textAnchor="middle" fontSize="8" fill="#16A34A">MA</text>
      <text x="-75" y="-25" textAnchor="middle" fontSize="7" fill="#717680">Week 1</text>
      
      <circle cx="-25" cy="0" r="15" fill="#F0FDF4" stroke="#16A34A" strokeWidth="2"/>
      <text x="-25" y="4" textAnchor="middle" fontSize="8" fill="#16A34A">MA</text>
      <text x="-25" y="-25" textAnchor="middle" fontSize="7" fill="#717680">Week 2</text>
      
      <circle cx="25" cy="0" r="15" fill="#F0FDF4" stroke="#16A34A" strokeWidth="2"/>
      <text x="25" y="4" textAnchor="middle" fontSize="8" fill="#16A34A">MA</text>
      <text x="25" y="-25" textAnchor="middle" fontSize="7" fill="#717680">Week 3</text>
      
      <circle cx="75" cy="0" r="15" fill="#F0FDF4" stroke="#16A34A" strokeWidth="2"/>
      <text x="75" y="4" textAnchor="middle" fontSize="8" fill="#16A34A">MA</text>
      <text x="75" y="-25" textAnchor="middle" fontSize="7" fill="#717680">Week 4</text>
      
      <text x="0" y="45" textAnchor="middle" fontSize="8" fill="#16A34A">→ Develops real understanding</text>
    </g>
    
    <text x="472" y="250" textAnchor="middle" fontSize="9" fill="#16A34A">"I'll learn this tool deeply first"</text>
  </svg>
);

// SVG 6: Confused vs Calm Observer
const ConfusedVsCalmSVG = () => (
  <svg viewBox="0 0 640 300" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="640" height="300" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="320" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#373A41">The Result: Confusion vs Clarity</text>
    <text x="320" y="48" textAnchor="middle" fontSize="11" fill="#717680">Your approach determines your experience</text>
    
    {/* Left - Confused trader */}
    <rect x="30" y="70" width="275" height="200" fill="#FDF1F1" rx="12" stroke="#F09B9B" strokeWidth="2"/>
    <text x="167" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C7363B">Confused Approach</text>
    
    <g transform="translate(167, 165)">
      {/* Stressed figure */}
      <circle cx="0" cy="-40" r="25" fill="#FBE1E1" stroke="#F09B9B" strokeWidth="2"/>
      <text x="0" y="-35" textAnchor="middle" fontSize="20">😰</text>
      
      {/* Thought bubbles */}
      <ellipse cx="-60" cy="-60" rx="30" ry="15" fill="#FBE1E1" stroke="#F09B9B" strokeWidth="1"/>
      <text x="-60" y="-57" textAnchor="middle" fontSize="7" fill="#842428">Buy? Sell?</text>
      
      <ellipse cx="60" cy="-60" rx="30" ry="15" fill="#FBE1E1" stroke="#F09B9B" strokeWidth="1"/>
      <text x="60" y="-57" textAnchor="middle" fontSize="7" fill="#842428">Too many signals!</text>
      
      {/* Surrounding chaos symbols */}
      <text x="-80" y="0" fontSize="12" fill="#C7363B">📈</text>
      <text x="80" y="0" fontSize="12" fill="#C7363B">📉</text>
      <text x="-60" y="30" fontSize="10" fill="#C7363B">⚡</text>
      <text x="60" y="30" fontSize="10" fill="#C7363B">⚡</text>
    </g>
    
    <text x="167" y="245" textAnchor="middle" fontSize="9" fill="#842428">Stressed, reactive, overwhelmed</text>
    
    {/* Right - Calm observer */}
    <rect x="335" y="70" width="275" height="200" fill="#F0FDF4" rx="12" stroke="#16A34A" strokeWidth="2"/>
    <text x="472" y="95" textAnchor="middle" fontSize="12" fontWeight="600" fill="#16A34A">Calm Observer</text>
    
    <g transform="translate(472, 165)">
      {/* Calm figure */}
      <circle cx="0" cy="-40" r="25" fill="#F0FDF4" stroke="#16A34A" strokeWidth="2"/>
      <text x="0" y="-35" textAnchor="middle" fontSize="20">😌</text>
      
      {/* Simple thought */}
      <ellipse cx="0" cy="-80" rx="50" ry="18" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1"/>
      <text x="0" y="-77" textAnchor="middle" fontSize="8" fill="#16A34A">Price is above average</text>
      
      {/* Clean chart icon */}
      <rect x="-35" y="10" width="70" height="40" fill="#ffffff" rx="6" stroke="#16A34A" strokeWidth="1"/>
      <path d="M-25 40 L-10 30 L5 35 L20 20 L30 25" fill="none" stroke="#16A34A" strokeWidth="1.5"/>
    </g>
    
    <text x="472" y="245" textAnchor="middle" fontSize="9" fill="#16A34A">Patient, observant, clear-headed</text>
  </svg>
);

// SVG 7: The Simplicity Principle
const SimplicityPrincipleSVG = () => (
  <svg viewBox="0 0 600 260" className="w-full max-w-2xl mx-auto">
    {/* Background */}
    <rect x="0" y="0" width="600" height="260" fill="#F5F5F7" rx="16"/>
    
    {/* Title */}
    <text x="300" y="28" textAnchor="middle" fontSize="16" fontWeight="600" fill="#373A41">The Simplicity Principle</text>
    <text x="300" y="48" textAnchor="middle" fontSize="11" fill="#717680">Less complexity often leads to better understanding</text>
    
    {/* Progression */}
    <g transform="translate(100, 140)">
      {/* Start - Many tools */}
      <rect x="-60" y="-50" width="120" height="100" fill="#FBE1E1" rx="10" stroke="#F09B9B" strokeWidth="2"/>
      <text x="0" y="-25" textAnchor="middle" fontSize="22">🔧🔨🪛</text>
      <text x="0" y="-5" textAnchor="middle" fontSize="9" fill="#842428">Many tools</text>
      <text x="0" y="10" textAnchor="middle" fontSize="9" fill="#842428">Much confusion</text>
      <text x="0" y="30" textAnchor="middle" fontSize="8" fill="#C7363B">Low clarity</text>
    </g>
    
    {/* Arrow */}
    <path d="M180 140 L230 140" stroke="#A0A3AA" strokeWidth="2" markerEnd="url(#simplicity-arrow)"/>
    <defs>
      <marker id="simplicity-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#A0A3AA"/>
      </marker>
    </defs>
    
    {/* Middle - Reducing */}
    <g transform="translate(300, 140)">
      <rect x="-60" y="-50" width="120" height="100" fill="#F6ECCE" rx="10" stroke="#E2C273" strokeWidth="2"/>
      <text x="0" y="-25" textAnchor="middle" fontSize="22">🔧🔨</text>
      <text x="0" y="-5" textAnchor="middle" fontSize="9" fill="#7C5D2B">Fewer tools</text>
      <text x="0" y="10" textAnchor="middle" fontSize="9" fill="#7C5D2B">Less noise</text>
      <text x="0" y="30" textAnchor="middle" fontSize="8" fill="#B8923F">Growing clarity</text>
    </g>
    
    {/* Arrow */}
    <path d="M380 140 L430 140" stroke="#A0A3AA" strokeWidth="2" markerEnd="url(#simplicity-arrow)"/>
    
    {/* End - Simple */}
    <g transform="translate(500, 140)">
      <rect x="-60" y="-50" width="120" height="100" fill="#F0FDF4" rx="10" stroke="#16A34A" strokeWidth="2"/>
      <text x="0" y="-25" textAnchor="middle" fontSize="22">🔧</text>
      <text x="0" y="-5" textAnchor="middle" fontSize="9" fill="#16A34A">One tool</text>
      <text x="0" y="10" textAnchor="middle" fontSize="9" fill="#16A34A">Deep understanding</text>
      <text x="0" y="30" textAnchor="middle" fontSize="8" fill="#16A34A">High clarity</text>
    </g>
  </svg>
);

// SVG 8: Module Completion Badge
const ModuleCompletionSVG = () => (
  <svg viewBox="0 0 400 280" className="w-full max-w-md mx-auto">
    {/* Background gradient */}
    <defs>
      <linearGradient id="badge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5A77AA"/>
        <stop offset="100%" stopColor="#8F6FC4"/>
      </linearGradient>
      <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#CDAA5F"/>
        <stop offset="100%" stopColor="#B8923F"/>
      </linearGradient>
    </defs>
    
    {/* Background */}
    <rect x="0" y="0" width="400" height="280" fill="#F5F5F7" rx="16"/>
    
    {/* Celebration rays */}
    <g transform="translate(200, 130)">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <line
          key={i}
          x1="0"
          y1="0"
          x2={Math.cos((angle * Math.PI) / 180) * 100}
          y2={Math.sin((angle * Math.PI) / 180) * 100}
          stroke="#E2C273"
          strokeWidth="2"
          opacity="0.4"
        />
      ))}
    </g>
    
    {/* Badge circle */}
    <circle cx="200" cy="130" r="70" fill="url(#badge-gradient)" stroke="#2C3F5E" strokeWidth="3"/>
    
    {/* Inner circle */}
    <circle cx="200" cy="130" r="55" fill="none" stroke="#9FB3D3" strokeWidth="2"/>
    
    {/* Star */}
    <polygon
      points="200,75 210,110 245,110 218,130 228,165 200,145 172,165 182,130 155,110 190,110"
      fill="url(#gold-gradient)"
      stroke="#9A7634"
      strokeWidth="1"
    />
    
    {/* Text */}
    <text x="200" y="215" textAnchor="middle" fontSize="14" fontWeight="700" fill="#2C3F5E">Module Complete!</text>
    <text x="200" y="235" textAnchor="middle" fontSize="11" fill="#717680">Technical Analysis – Visual Foundations</text>
    <text x="200" y="255" textAnchor="middle" fontSize="10" fill="#A0A3AA">You've built a strong foundation</text>
  </svg>
);

const TechnicalAnalysisLesson7 = () => {
  const navigate = useNavigate();

  const quizQuestions = [
    {
      question: "Why is overloading a chart with many indicators problematic?",
      options: [
        "Indicators are expensive to use",
        "It creates conflicting signals and makes the chart harder to read",
        "Charts can only display three indicators at once",
        "Multiple indicators always show the same thing"
      ],
      correctAnswer: "It creates conflicting signals and makes the chart harder to read",
      explanation: "Adding too many indicators leads to conflicting signals, visual clutter, and analysis paralysis. A cleaner chart with fewer tools often provides more clarity than a rainbow of overlapping indicators."
    },
    {
      question: "What's wrong with trying to 'predict' where price will go using charts?",
      options: [
        "Charts are always wrong",
        "Prediction creates false certainty — charts provide context, not guarantees",
        "Prediction is only for professional traders",
        "Charts can only show the past, never the present"
      ],
      correctAnswer: "Prediction creates false certainty — charts provide context, not guarantees",
      explanation: "Charts help you observe and understand current conditions, but they cannot predict the future with certainty. Approaching charts with an observation mindset keeps you humble and realistic."
    }
  ];

  const commonMistakes = [
    {
      title: "Overloading charts with indicators",
      description: "Adding every indicator you learn about, creating visual chaos that obscures price action."
    },
    {
      title: "Predicting instead of observing",
      description: "Treating charts as crystal balls that tell the future rather than tools for understanding the present."
    },
    {
      title: "Ignoring higher timeframe context",
      description: "Making conclusions from short-term charts without checking what the bigger picture shows."
    },
    {
      title: "Drawing too many lines",
      description: "Marking every possible support, resistance, and trendline until the chart becomes unreadable."
    },
    {
      title: "Changing tools too frequently",
      description: "Jumping from one indicator or method to another before developing real understanding of any."
    }
  ];

  return (
    <StudyShell module="TechnicalAnalysis" lessonNumber={7}>
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
              Lesson 7 of 7 – Final Lesson
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mt-4 tracking-[-0.025em]">Common Charting Mistakes Beginners Make</h1>
            <p className="text-gray-600 mt-2">Awareness before action — avoiding the pitfalls</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.025em]">Why Charting Mistakes Are Common</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Congratulations on reaching the final lesson! Before we wrap up this module, let's talk about 
              something that will save you significant frustration: <strong>the common mistakes nearly every 
              beginner makes</strong> when they start using charts.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              These mistakes aren't signs of failure — they're natural parts of the learning process. The 
              difference between struggling for months and progressing efficiently is often simply 
              <strong> awareness</strong>. When you know what traps exist, you can consciously avoid them.
            </p>
            <p className="text-lg leading-relaxed">
              The internet is full of complex charts with dozens of indicators, bold predictions, and 
              complicated systems. It's easy to assume that complexity equals sophistication. In reality, 
              <strong> simplicity and understanding almost always beat complexity and confusion</strong>.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <p className="text-blue-800 font-medium">
              💡 The goal isn't to never make mistakes — it's to recognize them quickly and correct course.
            </p>
          </div>
        </div>

        {/* Common Mistakes Overview */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Five Common Beginner Mistakes</h2>
          
          <div className="space-y-4">
            {commonMistakes.map((mistake, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 text-red-600 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{mistake.title}</h4>
                    <p className="text-gray-600 mt-1">{mistake.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mistake 1: Overloading */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Mistake #1: Overloading the Chart</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              This is perhaps the most common mistake. As beginners learn about different indicators, 
              the natural instinct is to add them all — surely more information means better decisions, right?
            </p>
            <p className="text-lg leading-relaxed">
              In practice, the opposite happens. <strong>Too many indicators create conflicting signals</strong>, 
              visual clutter, and analysis paralysis. You end up staring at a rainbow of lines with no 
              clear understanding of what's actually happening with price.
            </p>
          </div>

          <OverloadedVsCleanSVG />
          
          <div className="mt-6 bg-brand-soft rounded-xl p-5 border border-brand-line">
            <p className="text-brand">
              <strong>Better approach:</strong> Start with price alone. Add one tool only if it helps you 
              see something you couldn't see before. If a tool doesn't add clarity, remove it.
            </p>
          </div>
        </div>

        {/* Mistake 2: Predicting */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Mistake #2: Predicting Instead of Observing</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Charts are often marketed as fortune-telling tools. "Learn to read charts and know where 
              price will go!" This creates a prediction mindset that leads to overconfidence and disappointment.
            </p>
            <p className="text-lg leading-relaxed">
              Charts don't predict the future — <strong>they describe the present and recent past</strong>. 
              An observation mindset is healthier: "Price is currently above its average" rather than 
              "Price WILL go up from here."
            </p>
          </div>

          <PredictionVsObservationSVG />
          
          <div className="mt-6 bg-amber-50 rounded-xl p-5 border border-amber-200">
            <p className="text-amber-800">
              <strong>Remember:</strong> Even the best chart readers are frequently wrong. The goal is 
              understanding context, not achieving prediction accuracy.
            </p>
          </div>
        </div>

        {/* Mistake 3: Ignoring Context */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Mistake #3: Ignoring the Bigger Picture</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              It's easy to get excited about a strong move on a short-term chart. But that excitement 
              can be misleading if you haven't checked what's happening on higher timeframes.
            </p>
            <p className="text-lg leading-relaxed">
              A strong 5-minute uptrend might be just a small bounce within a larger daily downtrend. 
              <strong>Context from higher timeframes helps you understand what the shorter-term 
              moves actually mean</strong>.
            </p>
          </div>

          <HigherTimeframeSVG />
        </div>

        {/* Mistake 4: Too Many Lines */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Mistake #4: Drawing Too Many Lines</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              Support, resistance, trendlines — these are useful concepts. But beginners often mark 
              every possible level until the chart looks like a grid. When everything is marked as 
              "important," <strong>nothing is actually important anymore</strong>.
            </p>
            <p className="text-lg leading-relaxed">
              Focus on the most obvious, most tested levels. If a level has been touched multiple times 
              and is clearly visible, it's worth noting. Minor levels that are barely noticeable 
              probably don't deserve your attention.
            </p>
          </div>

          <TooManyLinesSVG />
        </div>

        {/* Mistake 5: Changing Tools */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">Mistake #5: Constantly Changing Tools</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              When a tool doesn't immediately produce perfect results, it's tempting to abandon it and 
              try something else. This creates a cycle of tool-hopping where you never develop deep 
              understanding of anything.
            </p>
            <p className="text-lg leading-relaxed">
              <strong>Every tool has limitations</strong>. The goal isn't to find a perfect tool — it's 
              to understand one tool well enough to know when it's helpful and when it's not.
            </p>
          </div>

          <ChangingToolsSVG />
          
          <div className="mt-6 bg-blue-50 rounded-xl p-5 border border-blue-200">
            <p className="text-blue-800">
              <strong>Better approach:</strong> Pick one simple approach. Stick with it for weeks or months. 
              Understand its strengths and weaknesses thoroughly before considering alternatives.
            </p>
          </div>
        </div>

        {/* The Result */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">The Result: Confusion vs Clarity</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed">
              Your approach to charting determines your experience. Making these common mistakes leads to 
              stress, confusion, and reactive decisions. Avoiding them creates space for calm observation 
              and clear thinking.
            </p>
          </div>

          <ConfusedVsCalmSVG />
        </div>

        {/* The Simplicity Principle */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">The Simplicity Principle</h2>
          
          <div className="prose max-w-none text-gray-700 mb-6">
            <p className="text-lg leading-relaxed mb-4">
              There's a counterintuitive truth in chart analysis: <strong>reducing complexity often 
              increases understanding</strong>. The journey from confusion to clarity usually involves 
              removing things, not adding them.
            </p>
            <p className="text-lg leading-relaxed">
              Start simple. Stay simple. Add complexity only when you've genuinely outgrown simplicity — 
              and that takes longer than most people think.
            </p>
          </div>

          <SimplicityPrincipleSVG />
        </div>

        {/* India-specific Note */}
        <div className="bg-indigo-50 rounded-2xl p-6 shadow-lg mb-8 border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-800 mb-3">🌍 Global Context</h3>
          <p className="text-indigo-900">
            These mistakes are universal — they happen to beginners in New York, London, Singapore, 
            Mumbai, and everywhere else people look at charts. The human tendencies toward complexity, 
            prediction, and impatience are not specific to any market or region. The good news? The 
            solutions are also universal: simplicity, observation, patience, and consistency.
          </p>
        </div>

        {/* Quiz Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-[-0.015em]">📝 Knowledge Check</h2>
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
              <h3 className="text-xl font-semibold text-purple-800 mb-3">Final Reflection Activity</h3>
              <div className="bg-white rounded-xl p-5 border border-purple-200">
                <p className="text-gray-800 font-medium mb-3">
                  Take a moment to think and write:
                </p>
                <p className="text-gray-700 mb-4 italic">
                  "Based on what I've learned, what will I simplify in my charting approach? 
                  What tools or habits will I avoid or remove to maintain clarity?"
                </p>
                <p className="text-gray-600 text-sm">
                  This reflection helps you commit to a simpler, more sustainable approach. 
                  Write down your answer — commitments we write down are more likely to stick.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Module Completion */}
        <div className="rounded-2xl p-8 shadow-lg mb-8 text-white bg-brand-fill">
          <div className="flex items-center gap-3 mb-4">
            <FaTrophy className="text-yellow-400 text-2xl" />
            <h3 className="text-xl font-semibold">Module Complete!</h3>
          </div>
          
          <ModuleCompletionSVG />
          
          <div className="mt-6">
            <h4 className="font-semibold text-lg mb-3">What You've Learned:</h4>
            <ul className="space-y-2">
              <li>✓ How to read candlestick charts and understand price behavior</li>
              <li>✓ How to identify trends and market direction</li>
              <li>✓ The concept of support and resistance zones</li>
              <li>✓ How moving averages provide context</li>
              <li>✓ The purpose and limitations of indicators</li>
              <li>✓ Common mistakes to avoid as you continue learning</li>
            </ul>
          </div>
          
          <div className="mt-6 bg-white/10 rounded-xl p-4">
            <p className="text-blue-100">
              <strong>Remember:</strong> This is just the foundation. Real understanding comes from 
              observation and practice over time. Keep your charts simple, maintain an observation 
              mindset, and be patient with your progress.
            </p>
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8 border-2 border-blue-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">🔑 Final Takeaways</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="font-semibold text-gray-800 mb-1">Simplicity wins</p>
              <p className="text-gray-600 text-sm">A clean chart beats a cluttered one every time.</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="font-semibold text-gray-800 mb-1">Observe, don't predict</p>
              <p className="text-gray-600 text-sm">Charts describe conditions, not destinies.</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="font-semibold text-gray-800 mb-1">Context matters</p>
              <p className="text-gray-600 text-sm">Check higher timeframes before drawing conclusions.</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="font-semibold text-gray-800 mb-1">Consistency builds skill</p>
              <p className="text-gray-600 text-sm">Stick with one approach long enough to understand it.</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/learn/technical-analysis-lesson-6')}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition-colors"
          >
            <FaArrowLeft />
            <span>Previous Lesson</span>
          </button>
          <button
            onClick={() => navigate('/learn/technical-analysis')}
            className="flex items-center gap-2 bg-brand-fill hover:bg-brand-hover text-white px-6 py-3 rounded-xl transition-colors"
          >
            <span>Back to Module Overview</span>
          </button>
        </div>
      </div>
    </div>
    </StudyShell>
  );
};

export default TechnicalAnalysisLesson7;
