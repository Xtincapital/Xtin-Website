import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// Custom SVG Icons
const Icons = {
  // Brain/Psychology Icon
  Brain: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4C9 4 7 6 7 8C7 9 7 9.5 7.5 10C6.5 10.5 6 11.5 6 12.5C6 14 7 15 8.5 15.5C8 16.5 8.5 17.5 9.5 18C10 18.5 11 19 12 19C13 19 14 18.5 14.5 18C15.5 17.5 16 16.5 15.5 15.5C17 15 18 14 18 12.5C18 11.5 17.5 10.5 16.5 10C17 9.5 17 9 17 8C17 6 15 4 12 4Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 19V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Fear Icon (Scared face)
  Fear: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
      <ellipse cx="12" cy="16" rx="2" ry="2.5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Greed Icon (Dollar eyes)
  Greed: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <text x="9" y="12" fontSize="6" fill="currentColor" fontWeight="bold">$</text>
      <text x="15" y="12" fontSize="6" fill="currentColor" fontWeight="bold">$</text>
      <path d="M8 16C8 16 10 18 12 18C14 18 16 16 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // FOMO Icon (Running figure)
  FOMO: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="5" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 22L10 15L7 12L10 10H14L17 12L14 15L16 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Revenge Icon (Angry face)
  Revenge: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 9L10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 9L14 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="9" cy="11" r="1" fill="currentColor"/>
      <circle cx="15" cy="11" r="1" fill="currentColor"/>
      <path d="M8 17C8 17 10 15 12 15C14 15 16 17 16 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Hope Icon (Star)
  Hope: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L14.4 9.2H22L16 13.8L18.4 21L12 16.4L5.6 21L8 13.8L2 9.2H9.6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),

  // Overconfidence Icon (Crown)
  Overconfidence: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 18H21V20H3V18Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 18L6 8L12 12L18 8L20 18" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="2"/>
      <circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Clock Icon
  Clock: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Emotion Cycle Icon
  Cycle: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 3L16 7L12 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // India Flag Icon
  IndiaFlag: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 15H21" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),

  // Lightbulb Icon
  Lightbulb: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 17H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 3C8.13401 3 5 6.13401 5 10C5 12.38 6.19 14.47 8 15.74V17H16V15.74C17.81 14.47 19 12.38 19 10C19 6.13401 15.866 3 12 3Z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Warning Icon
  Warning: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L22 20H2L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>
  ),

  // Calm/Zen Icon
  Calm: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 10H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Checklist Icon
  Checklist: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Journal Icon
  Journal: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4H20C20.5523 4 21 4.44772 21 5V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V5C3 4.44772 3.44772 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 8H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 16H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Heart Rate Icon
  HeartRate: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12H7L9 8L12 16L14 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

// Quiz Question Component
const QuizQuestion = ({ question, options, correctAnswer, explanation }) => {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index) => {
    if (showResult) return;
    setSelected(index);
    setShowResult(true);
  };

  const isCorrect = selected === correctAnswer;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <h4 className="font-bold text-gray-900 mb-4">{question}</h4>
      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(index)}
            disabled={showResult}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              showResult
                ? index === correctAnswer
                  ? "border-green-500 bg-green-50"
                  : index === selected
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 bg-gray-50"
                : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={showResult && index === correctAnswer ? "text-green-700 font-medium" : showResult && index === selected ? "text-red-700" : "text-gray-700"}>
                {option}
              </span>
              {showResult && index === correctAnswer && (
                <FaCheckCircle className="text-green-500" />
              )}
              {showResult && index === selected && index !== correctAnswer && (
                <FaTimesCircle className="text-red-500" />
              )}
            </div>
          </button>
        ))}
      </div>
      {showResult && (
        <div className={`mt-4 p-4 rounded-xl ${isCorrect ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
          <p className="font-medium">{isCorrect ? "Correct!" : "Not quite!"}</p>
          <p className="text-sm mt-1">{explanation}</p>
        </div>
      )}
    </div>
  );
};

// Emotion Card Component
const EmotionCard = ({ icon: Icon, title, description, triggers, consequences, remedy, color, bgColor }) => {
  return (
    <div className={`${bgColor} rounded-2xl p-5 border-2 ${color} mb-4`}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${color.replace('border-', 'text-')}`} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">TRIGGERS</p>
          <p className="text-sm text-gray-700">{triggers}</p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">CONSEQUENCES</p>
          <p className="text-sm text-red-700">{consequences}</p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">REMEDY</p>
          <p className="text-sm text-green-700">{remedy}</p>
        </div>
      </div>
    </div>
  );
};

const TradingBasicsLesson5 = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-purple-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/learn/trading-basics')}
              className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors group"
            >
              <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
              <span>Module 4: Trading Basics</span>
            </button>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-1.5">
              <Icons.Clock className="w-4 h-4" />
              10 min read
            </span>
          </div>

          {/* Lesson Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-full text-sm font-semibold">
                Lesson 5 of 7
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Critical
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-200 rounded-xl shadow-sm">
                <Icons.Brain className="w-7 h-7 text-purple-600" />
              </span>
              <span>Trading Psychology</span>
            </h1>
            <p className="text-lg text-gray-500">
              Your biggest enemy in trading isn't the market — it's yourself. Master your emotions or they'll master you.
            </p>
          </div>

          {/* The Hook */}
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 mb-10 border-2 border-purple-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                <Icons.Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-purple-900 mb-2">Why Smart People Make Dumb Trading Decisions</h3>
                <p className="text-purple-800">
                  Doctors, engineers, MBAs — they all lose money trading. Intelligence isn't the problem. 
                  The human brain is simply NOT wired for trading. Our survival instincts (fear, greed, herd mentality) 
                  that kept our ancestors alive are the exact traits that destroy trading accounts.
                </p>
              </div>
            </div>
          </div>

          {/* Visual: The Emotion Cycle */}
          <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">The Emotional Cycle of Trading</h2>
            
            <svg className="w-full max-w-2xl mx-auto mb-4" viewBox="0 0 600 350" fill="none">
              {/* Cycle Circle Background */}
              <circle cx="300" cy="180" r="140" fill="none" stroke="#e5e7eb" strokeWidth="30" strokeDasharray="5,5"/>
              
              {/* Emotions around the cycle */}
              {/* Optimism - Top */}
              <g transform="translate(300, 30)">
                <circle cx="0" cy="0" r="35" fill="#dcfce7" stroke="#22c55e" strokeWidth="2"/>
                <text x="0" y="-5" textAnchor="middle" fill="#166534" fontSize="10" fontWeight="600">Optimism</text>
                <text x="0" y="8" textAnchor="middle" fill="#166534" fontSize="8">"I got this!"</text>
              </g>
              
              {/* Excitement - Top Right */}
              <g transform="translate(430, 80)">
                <circle cx="0" cy="0" r="35" fill="#d1fae5" stroke="#10b981" strokeWidth="2"/>
                <text x="0" y="-5" textAnchor="middle" fill="#065f46" fontSize="10" fontWeight="600">Excitement</text>
                <text x="0" y="8" textAnchor="middle" fill="#065f46" fontSize="8">"Making money!"</text>
              </g>
              
              {/* Thrill - Right */}
              <g transform="translate(480, 180)">
                <circle cx="0" cy="0" r="35" fill="#fef9c3" stroke="#eab308" strokeWidth="2"/>
                <text x="0" y="-5" textAnchor="middle" fill="#854d0e" fontSize="10" fontWeight="600">Thrill</text>
                <text x="0" y="8" textAnchor="middle" fill="#854d0e" fontSize="8">"I'm a genius!"</text>
              </g>
              
              {/* Euphoria - Bottom Right */}
              <g transform="translate(430, 280)">
                <circle cx="0" cy="0" r="35" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2"/>
                <text x="0" y="-5" textAnchor="middle" fill="#92400e" fontSize="9" fontWeight="600">Euphoria</text>
                <text x="0" y="8" textAnchor="middle" fill="#92400e" fontSize="7">"Can't lose!"</text>
                <text x="0" y="25" textAnchor="middle" fill="#dc2626" fontSize="7" fontWeight="700">⚠️ DANGER</text>
              </g>
              
              {/* Anxiety - Bottom */}
              <g transform="translate(300, 330)">
                <circle cx="0" cy="0" r="35" fill="#fce7f3" stroke="#ec4899" strokeWidth="2"/>
                <text x="0" y="-5" textAnchor="middle" fill="#9d174d" fontSize="10" fontWeight="600">Anxiety</text>
                <text x="0" y="8" textAnchor="middle" fill="#9d174d" fontSize="8">"Wait, what?"</text>
              </g>
              
              {/* Denial - Bottom Left */}
              <g transform="translate(170, 280)">
                <circle cx="0" cy="0" r="35" fill="#fee2e2" stroke="#ef4444" strokeWidth="2"/>
                <text x="0" y="-5" textAnchor="middle" fill="#991b1b" fontSize="10" fontWeight="600">Denial</text>
                <text x="0" y="8" textAnchor="middle" fill="#991b1b" fontSize="8">"It'll recover"</text>
              </g>
              
              {/* Panic - Left */}
              <g transform="translate(120, 180)">
                <circle cx="0" cy="0" r="35" fill="#fecaca" stroke="#dc2626" strokeWidth="2"/>
                <text x="0" y="-5" textAnchor="middle" fill="#7f1d1d" fontSize="10" fontWeight="600">Panic</text>
                <text x="0" y="8" textAnchor="middle" fill="#7f1d1d" fontSize="8">"Get me out!"</text>
              </g>
              
              {/* Capitulation - Top Left */}
              <g transform="translate(170, 80)">
                <circle cx="0" cy="0" r="35" fill="#f3e8ff" stroke="#a855f7" strokeWidth="2"/>
                <text x="0" y="-5" textAnchor="middle" fill="#6b21a8" fontSize="9" fontWeight="600">Capitulation</text>
                <text x="0" y="8" textAnchor="middle" fill="#6b21a8" fontSize="7">"Never again"</text>
              </g>
              
              {/* Arrow showing cycle direction */}
              <path d="M340 40 L360 40 L350 25" fill="#6b7280"/>
              
              {/* Center Text */}
              <text x="300" y="175" textAnchor="middle" fill="#374151" fontSize="11" fontWeight="600">Every trader</text>
              <text x="300" y="190" textAnchor="middle" fill="#374151" fontSize="11" fontWeight="600">goes through this</text>
            </svg>

            <div className="bg-purple-100 rounded-lg p-4 text-center">
              <p className="text-purple-800 text-sm">
                <strong>The trap:</strong> Most traders buy at Euphoria (top) and sell at Panic (bottom). 
                The successful ones do the opposite.
              </p>
            </div>
          </div>

          {/* The Six Deadly Emotions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Icons.Warning className="w-6 h-6 text-purple-600" />
              <span>The Six Deadly Trading Emotions</span>
            </h2>

            <EmotionCard
              icon={Icons.Fear}
              title="1. Fear"
              description="The paralysis that stops you from acting rationally"
              triggers="After losses, market crashes, news headlines"
              consequences="Exit winners too early, miss good opportunities"
              remedy="Pre-defined rules, stick to plan regardless of feelings"
              color="border-blue-400"
              bgColor="bg-blue-50"
            />

            <EmotionCard
              icon={Icons.Greed}
              title="2. Greed"
              description="The desire for more that blinds you to risk"
              triggers="Winning streaks, easy money, seeing others profit"
              consequences="Overleveraging, ignoring stop losses, doubling down"
              remedy="Set profit targets BEFORE entering, take profits"
              color="border-green-400"
              bgColor="bg-green-50"
            />

            <EmotionCard
              icon={Icons.FOMO}
              title="3. FOMO (Fear of Missing Out)"
              description="Jumping into trades without proper analysis because others are profiting"
              triggers="Social media tips, friends boasting, viral stock picks"
              consequences="Buying at tops, chasing rallies, no exit plan"
              remedy="If you missed it, wait for next opportunity. There's always one."
              color="border-orange-400"
              bgColor="bg-orange-50"
            />

            <EmotionCard
              icon={Icons.Revenge}
              title="4. Revenge Trading"
              description="Trying to recover losses immediately with bigger, riskier trades"
              triggers="After a loss, feeling cheated by market"
              consequences="Bigger losses, account destruction, emotional spiral"
              remedy="Walk away after 2 consecutive losses. Come back tomorrow."
              color="border-red-400"
              bgColor="bg-red-50"
            />

            <EmotionCard
              icon={Icons.Hope}
              title="5. Hope (Hopium)"
              description="Holding losing trades hoping they'll recover instead of cutting losses"
              triggers="Attachment to positions, unable to accept being wrong"
              consequences="Small losses become catastrophic, portfolio stuck"
              remedy="Stop losses are non-negotiable. Hope is NOT a strategy."
              color="border-yellow-400"
              bgColor="bg-yellow-50"
            />

            <EmotionCard
              icon={Icons.Overconfidence}
              title="6. Overconfidence"
              description="After wins, believing you've 'figured out' the market"
              triggers="Winning streaks, successful predictions"
              consequences="Larger positions, ignoring risk, inevitable big loss"
              remedy="Every trade is independent. Past success ≠ future success."
              color="border-purple-400"
              bgColor="bg-purple-50"
            />
          </div>

          {/* The Amateur vs Pro Mindset */}
          <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Amateur vs Professional Mindset</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 rounded-tl-lg font-semibold">Situation</th>
                    <th className="text-left p-3 font-semibold text-red-700">Amateur Thinks</th>
                    <th className="text-left p-3 rounded-tr-lg font-semibold text-green-700">Pro Thinks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium">After a loss</td>
                    <td className="p-3 text-red-700">"I need to make it back NOW"</td>
                    <td className="p-3 text-green-700">"Losses are business expenses"</td>
                  </tr>
                  <tr className="border-t border-gray-100 bg-gray-50">
                    <td className="p-3 font-medium">After a win</td>
                    <td className="p-3 text-red-700">"I'm so good at this!"</td>
                    <td className="p-3 text-green-700">"Did I follow my rules?"</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium">Missing a move</td>
                    <td className="p-3 text-red-700">"Let me jump in before it's too late"</td>
                    <td className="p-3 text-green-700">"There will always be another opportunity"</td>
                  </tr>
                  <tr className="border-t border-gray-100 bg-gray-50">
                    <td className="p-3 font-medium">Price hitting stop loss</td>
                    <td className="p-3 text-red-700">"Let me move the SL, it'll recover"</td>
                    <td className="p-3 text-green-700">"Stop loss worked as intended"</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium">Getting a tip</td>
                    <td className="p-3 text-red-700">"Quick, let me buy before it runs!"</td>
                    <td className="p-3 text-green-700">"Let me do my own analysis first"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* How to Manage Trading Psychology */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 border-2 border-green-300">
            <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
              <Icons.Calm className="w-6 h-6 text-green-600" />
              <span>Practical Ways to Manage Your Psychology</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Icons.Journal className="w-5 h-5 text-green-600" />
                  <h4 className="font-bold text-green-800">1. Keep a Trading Journal</h4>
                </div>
                <p className="text-sm text-green-700 mb-2">
                  Record every trade: entry, exit, reason, emotion felt. Review weekly.
                </p>
                <p className="text-xs text-gray-500">
                  You'll discover your emotional patterns and when you trade worst.
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Icons.Checklist className="w-5 h-5 text-green-600" />
                  <h4 className="font-bold text-green-800">2. Pre-Trade Checklist</h4>
                </div>
                <p className="text-sm text-green-700 mb-2">
                  Have a checklist before every trade. If all boxes aren't checked, don't trade.
                </p>
                <p className="text-xs text-gray-500">
                  Removes emotion from the decision process.
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Icons.HeartRate className="w-5 h-5 text-green-600" />
                  <h4 className="font-bold text-green-800">3. Set Daily Loss Limits</h4>
                </div>
                <p className="text-sm text-green-700 mb-2">
                  Max 2-3% loss per day. Hit the limit? Stop trading. Go outside.
                </p>
                <p className="text-xs text-gray-500">
                  Prevents revenge trading and emotional spirals.
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Icons.Brain className="w-5 h-5 text-green-600" />
                  <h4 className="font-bold text-green-800">4. Trade Smaller Than Comfortable</h4>
                </div>
                <p className="text-sm text-green-700 mb-2">
                  If a position causes anxiety, it's too big. Reduce size until you can sleep.
                </p>
                <p className="text-xs text-gray-500">
                  Smaller positions = clearer thinking = better decisions.
                </p>
              </div>
            </div>

            <div className="mt-4 bg-green-100 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                <strong>The Goal:</strong> Trading should feel boring, not exciting. Excitement means you're 
                gambling. Boredom means you're following a system.
              </p>
            </div>
          </div>

          {/* India Focus Section */}
          <div className="bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-2xl p-6 mb-10 border border-orange-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icons.IndiaFlag className="w-6 h-6 text-orange-600" />
              <span>India Focus: Our Cultural Challenges</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">Challenges We Face</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span><strong>Tips culture:</strong> "Mera friend ka source..." leads to blind trades</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span><strong>Social pressure:</strong> Showing off wins, hiding losses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span><strong>Telegram/WhatsApp groups:</strong> Echo chambers of bad advice</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span><strong>YouTube gurus:</strong> Survivorship bias, showing only wins</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">The WhatsApp Trap</h4>
                <p className="text-sm text-gray-700 mb-2">
                  "FREE CALLS! Join our channel for 5000% returns!"
                </p>
                <ul className="space-y-1 text-sm text-red-700">
                  <li>• They make money from you, not from trading</li>
                  <li>• They show winning calls, hide 100 losing ones</li>
                  <li>• When you lose, they blame "you didn't follow properly"</li>
                  <li>• They're selling courses, not trading successfully</li>
                </ul>
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <p className="text-red-800 text-sm">
                <strong>Reality:</strong> If someone could really generate 5000% returns consistently, 
                why would they sell Rs. 999 courses on Telegram? Think about it.
              </p>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 mb-10 border border-purple-200">
            <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
              <Icons.Lightbulb className="w-6 h-6 text-purple-600" />
              <span>Key Takeaways</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-purple-800">
                  <strong>6 deadly emotions:</strong> Fear, Greed, FOMO, Revenge, Hope, Overconfidence
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-purple-800">
                  <strong>Process over outcome:</strong> Good trade = followed rules, regardless of result
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-purple-800">
                  <strong>Keep a journal:</strong> Track emotions, discover your patterns
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <p className="text-purple-800">
                  <strong>Trading should be boring:</strong> If it's exciting, you're gambling
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl">
                <span className="text-xl">✍️</span>
              </span>
              <span>Quick Quiz</span>
            </h2>
            
            <div className="space-y-6">
              <QuizQuestion
                question="You just had 3 winning trades in a row and feel invincible. What should you do?"
                options={[
                  "Increase position size — you're on a hot streak!",
                  "Stick to your rules — your next trade is independent of past ones",
                  "Take bigger risks since you have profits to play with",
                  "Tell everyone on social media about your genius"
                ]}
                correctAnswer={1}
                explanation="Each trade is independent. Winning streaks create overconfidence, which is one of the six deadly emotions. The professional mindset is to stick to your rules regardless of recent results. Past success doesn't guarantee future success."
              />
              
              <QuizQuestion
                question="What is 'revenge trading'?"
                options={[
                  "Trading against someone who gave you a bad tip",
                  "Taking bigger, riskier trades to recover losses quickly",
                  "Waiting patiently for the next opportunity",
                  "Following your trading plan after a loss"
                ]}
                correctAnswer={1}
                explanation="Revenge trading is the emotional response to losses where you try to 'get back' at the market by taking bigger, riskier trades. It almost always leads to even bigger losses. The solution is to walk away after losses and come back fresh."
              />
              
              <QuizQuestion
                question="Why do professionals say 'trading should feel boring'?"
                options={[
                  "Because the market is actually boring",
                  "To discourage new traders from entering",
                  "Because excitement means you're emotional, not systematic",
                  "It's just something they say to sound cool"
                ]}
                correctAnswer={2}
                explanation="When trading feels exciting, it means emotions are involved — and emotions lead to poor decisions. Professional traders follow systems mechanically, which feels boring but is profitable. If you're feeling thrilled or anxious, you're gambling, not trading."
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/learn/trading-basics-lesson-4')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors w-full sm:w-auto justify-center"
            >
              <FaArrowLeft className="text-sm" />
              <span>Previous: Risk & Stop Loss</span>
            </button>
            
            <button
              onClick={() => navigate('/learn/trading-basics-lesson-6')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white rounded-xl transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
            >
              <span>Next: Why Most Traders Lose</span>
              <FaArrowRight className="text-sm" />
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TradingBasicsLesson5;
