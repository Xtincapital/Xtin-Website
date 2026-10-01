import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// SVG Icons
const Icons = {
  Architecture: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      <path d="M10 6.5H14M6.5 10V14M17.5 10V14M10 17.5H14" strokeLinecap="round"/>
    </svg>
  ),
  Target: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>
    </svg>
  ),
  CheckCircle: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9"/><path d="M8 12L11 15L16 9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Database: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6V12C4 13.66 7.58 15 12 15C16.42 15 20 13.66 20 12V6"/>
      <path d="M4 12V18C4 19.66 7.58 21 12 21C16.42 21 20 19.66 20 18V12"/>
    </svg>
  ),
  Cpu: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
      <path d="M9 1V4M15 1V4M9 20V23M15 20V23M1 9H4M1 15H4M20 9H23M20 15H23"/>
    </svg>
  ),
  Shield: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3L20 7V11C20 15.42 16.42 19 12 21C7.58 19 4 15.42 4 11V7L12 3Z"/>
      <path d="M9 12L11 14L15 10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Zap: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Key: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="15" r="5"/><path d="M11.5 11.5L21 2M18 5L21 2L21 5L18 5Z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

// Quiz Component
const QuizQuestion = ({ question, options, correctAnswer, explanation }) => {
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const handleClick = (idx) => { if (!showResult) { setSelected(String.fromCharCode(65+idx)); setShowResult(true); }};
  const isCorrect = selected === correctAnswer;
  return (
    <div className="bg-white  rounded-2xl p-6 shadow-lg border border-gray-100  mb-6">
      <h4 className="text-lg font-semibold text-gray-900  mb-4">{question}</h4>
      <div className="space-y-3">
        {options.map((opt, i) => {
          const letter = String.fromCharCode(65+i);
          const isThis = selected === letter, isRight = correctAnswer === letter;
          let bg = "bg-gray-50  hover:bg-indigo-50", border = "border-gray-200 ";
          if (showResult) { if (isRight) { bg="bg-emerald-50 "; border="border-emerald-400"; } 
            else if (isThis) { bg="bg-red-50 "; border="border-red-400"; }}
          return (
            <button key={i} onClick={()=>handleClick(i)} disabled={showResult}
              className={`w-full text-left p-4 rounded-xl border-2 ${border} ${bg} transition-all`}>
              <span className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${showResult && isRight ? 'bg-emerald-500 text-white' : showResult && isThis ? 'bg-red-500 text-white' : 'bg-indigo-100  text-indigo-600'}`}>{letter}</span>
                <span className="text-gray-700 ">{opt}</span>
                {showResult && isRight && <FaCheckCircle className="ml-auto text-emerald-500"/>}
                {showResult && isThis && !isRight && <FaTimesCircle className="ml-auto text-red-500"/>}
              </span>
            </button>
          );
        })}
      </div>
      {showResult && (
        <div className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-emerald-100  text-emerald-800 ' : 'bg-amber-100  text-amber-800 '}`}>
          <p className="font-medium flex items-center gap-2">
            {isCorrect ? <><FaCheckCircle/> Correct!</> : <><FaTimesCircle/> Not quite.</>}
          </p>
          <p className="text-sm mt-1">{explanation}</p>
        </div>
      )}
    </div>
  );
};

const AlgoTradingLesson2 = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-indigo-50/30   text-gray-900  min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb */}
          <button onClick={() => navigate('/learn/algorithmic-trading')}
            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-8 group">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/><span>Back to Algorithmic Trading</span>
          </button>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full text-sm font-bold">Lesson 2 of 9</span>
              <span className="px-3 py-1.5 bg-gray-100  text-gray-600  rounded-full text-sm">18 min read</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-4">
              <span className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
                <Icons.Architecture className="w-8 h-8 text-white"/>
              </span>
              Trading System Architecture
            </h1>
            <p className="text-xl text-gray-600 ">
              Understand the building blocks of any algorithmic trading system and how they work together.
            </p>
          </div>

          {/* Learning Objectives */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50   rounded-2xl p-6 mb-10 border border-violet-200 ">
            <h2 className="font-bold text-violet-800  mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center"><Icons.Target className="w-5 h-5 text-white"/></span>
              What You'll Learn
            </h2>
            <ul className="space-y-2">
              {["Identify the 5 core components of any trading system", "Understand data flow from market to execution", 
                "Learn what each component does and why it matters", "See how institutional systems differ from retail"].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-violet-700 ">
                  <Icons.CheckCircle className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0"/><span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none ">
            
            {/* Intro */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50   rounded-2xl p-6 mb-10 border border-amber-200 ">
              <h3 className="font-bold text-amber-900  mb-3 text-lg">Think of it Like a Factory</h3>
              <p className="text-amber-800 ">
                Every manufacturing plant has raw materials coming in, machines processing them, and finished products going out. 
                A trading system works the same way: <strong>market data comes in</strong>, <strong>logic processes it</strong>, and <strong>orders go out</strong>.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-indigo-100  rounded-xl flex items-center justify-center">
                <Icons.Architecture className="w-5 h-5 text-indigo-600 "/>
              </span>
              The 5 Core Components
            </h2>

            {/* System Architecture SVG */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 mb-10 border border-indigo-800/50 shadow-xl">
              <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 380" fill="none">
                <text x="350" y="25" textAnchor="middle" fill="#e0e7ff" fontSize="15" fontWeight="700">TRADING SYSTEM ARCHITECTURE</text>
                <text x="350" y="45" textAnchor="middle" fill="#94a3b8" fontSize="10">Data flows left to right through each component</text>

                {/* Component 1: Data Handler */}
                <g transform="translate(20, 70)">
                  <rect x="0" y="0" width="120" height="100" rx="10" fill="#1e293b" stroke="#3b82f6" strokeWidth="2"/>
                  <circle cx="60" cy="30" r="15" fill="#3b82f6"/>
                  <text x="60" y="35" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">1</text>
                  <text x="60" y="60" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="600">DATA</text>
                  <text x="60" y="75" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="600">HANDLER</text>
                  <text x="60" y="92" textAnchor="middle" fill="#64748b" fontSize="8">Receives market data</text>
                </g>

                {/* Arrow 1 */}
                <path d="M145 120 L175 120" stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)"/>

                {/* Component 2: Signal Generator */}
                <g transform="translate(160, 70)">
                  <rect x="20" y="0" width="120" height="100" rx="10" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2"/>
                  <circle cx="80" cy="30" r="15" fill="#8b5cf6"/>
                  <text x="80" y="35" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">2</text>
                  <text x="80" y="60" textAnchor="middle" fill="#c4b5fd" fontSize="11" fontWeight="600">SIGNAL</text>
                  <text x="80" y="75" textAnchor="middle" fill="#c4b5fd" fontSize="11" fontWeight="600">GENERATOR</text>
                  <text x="80" y="92" textAnchor="middle" fill="#64748b" fontSize="8">Creates trade signals</text>
                </g>

                {/* Arrow 2 */}
                <path d="M305 120 L335 120" stroke="#475569" strokeWidth="2"/>

                {/* Component 3: Risk Manager */}
                <g transform="translate(320, 70)">
                  <rect x="20" y="0" width="120" height="100" rx="10" fill="#1e293b" stroke="#f43f5e" strokeWidth="2"/>
                  <circle cx="80" cy="30" r="15" fill="#f43f5e"/>
                  <text x="80" y="35" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">3</text>
                  <text x="80" y="60" textAnchor="middle" fill="#fda4af" fontSize="11" fontWeight="600">RISK</text>
                  <text x="80" y="75" textAnchor="middle" fill="#fda4af" fontSize="11" fontWeight="600">MANAGER</text>
                  <text x="80" y="92" textAnchor="middle" fill="#64748b" fontSize="8">Validates & sizes</text>
                </g>

                {/* Arrow 3 */}
                <path d="M465 120 L495 120" stroke="#475569" strokeWidth="2"/>

                {/* Component 4: Execution Engine */}
                <g transform="translate(480, 70)">
                  <rect x="20" y="0" width="120" height="100" rx="10" fill="#1e293b" stroke="#22c55e" strokeWidth="2"/>
                  <circle cx="80" cy="30" r="15" fill="#22c55e"/>
                  <text x="80" y="35" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">4</text>
                  <text x="80" y="60" textAnchor="middle" fill="#86efac" fontSize="11" fontWeight="600">EXECUTION</text>
                  <text x="80" y="75" textAnchor="middle" fill="#86efac" fontSize="11" fontWeight="600">ENGINE</text>
                  <text x="80" y="92" textAnchor="middle" fill="#64748b" fontSize="8">Sends orders</text>
                </g>

                {/* Component 5: Monitor (bottom) */}
                <g transform="translate(150, 200)">
                  <rect x="0" y="0" width="400" height="80" rx="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="2"/>
                  <circle cx="40" cy="40" r="15" fill="#f59e0b"/>
                  <text x="40" y="45" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">5</text>
                  <text x="200" y="35" textAnchor="middle" fill="#fcd34d" fontSize="12" fontWeight="600">MONITORING & LOGGING</text>
                  <text x="200" y="55" textAnchor="middle" fill="#64748b" fontSize="9">Tracks performance • Records all activity • Sends alerts • Enables debugging</text>
                </g>

                {/* Connection lines to monitor */}
                <path d="M80 175 L80 200 L150 200" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,2" fill="none"/>
                <path d="M240 175 L240 200" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,2"/>
                <path d="M400 175 L400 200" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,2"/>
                <path d="M560 175 L560 200 L550 200" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,2" fill="none"/>

                {/* Legend */}
                <g transform="translate(150, 310)">
                  <rect x="0" y="0" width="400" height="50" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
                  <text x="200" y="20" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">DATA FLOW</text>
                  <text x="200" y="38" textAnchor="middle" fill="#64748b" fontSize="9">Market Data → Signals → Risk Check → Orders → Exchange</text>
                </g>
              </svg>
            </div>

            {/* Component Details */}
            <div className="grid gap-6 mb-10">
              {[
                { num: 1, title: "Data Handler", icon: Icons.Database, color: "blue", 
                  desc: "Receives and normalizes market data from exchanges. Handles price feeds, order book data, and news.",
                  details: ["Connects to exchange APIs or data vendors", "Normalizes data into consistent format", "Stores historical data for backtesting", "Handles reconnections and data gaps"]},
                { num: 2, title: "Signal Generator", icon: Icons.Cpu, color: "violet",
                  desc: "The \"brain\" — applies your strategy logic to generate buy/sell signals.",
                  details: ["Runs technical indicators or ML models", "Identifies entry and exit opportunities", "Can run multiple strategies simultaneously", "Outputs signals with confidence levels"]},
                { num: 3, title: "Risk Manager", icon: Icons.Shield, color: "rose",
                  desc: "The \"gatekeeper\" — validates signals and determines position sizing.",
                  details: ["Checks portfolio exposure limits", "Calculates position size per trade", "Enforces maximum drawdown rules", "Can reject or modify signals"]},
                { num: 4, title: "Execution Engine", icon: Icons.Zap, color: "emerald",
                  desc: "Converts approved signals into actual orders sent to exchanges.",
                  details: ["Chooses order types (market, limit, etc.)", "Implements execution algorithms (TWAP, VWAP)", "Manages order lifecycle", "Handles partial fills and rejections"]}
              ].map((comp) => {
                const colors = { blue: "border-blue-500 bg-blue-50 ", violet: "border-violet-500 bg-violet-50 ",
                  rose: "border-rose-500 bg-rose-50 ", emerald: "border-emerald-500 bg-emerald-50 " };
                const iconColors = { blue: "bg-blue-600", violet: "bg-violet-600", rose: "bg-rose-600", emerald: "bg-emerald-600" };
                const IconComp = comp.icon;
                return (
                  <div key={comp.num} className={`rounded-xl p-5 border-l-4 ${colors[comp.color]}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`w-10 h-10 ${iconColors[comp.color]} rounded-lg flex items-center justify-center`}>
                        <IconComp className="w-5 h-5 text-white"/>
                      </span>
                      <div>
                        <span className="text-xs font-bold text-gray-500 ">COMPONENT {comp.num}</span>
                        <h4 className="font-bold text-gray-900 ">{comp.title}</h4>
                      </div>
                    </div>
                    <p className="text-gray-600  mb-3">{comp.desc}</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {comp.details.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 ">
                          <Icons.CheckCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"/>{d}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Institutional vs Retail */}
            <h2 className="text-2xl font-bold mb-4">Institutional vs Retail Systems</h2>
            <div className="overflow-x-auto mb-10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-indigo-100 ">
                    <th className="p-3 text-left font-bold text-indigo-800 ">Aspect</th>
                    <th className="p-3 text-left font-bold text-indigo-800 ">Institutional</th>
                    <th className="p-3 text-left font-bold text-indigo-800 ">Retail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 ">
                  {[
                    ["Infrastructure", "Co-located servers, dedicated lines", "Cloud or home computer"],
                    ["Latency", "Microseconds", "Milliseconds to seconds"],
                    ["Data", "Premium tick-by-tick feeds", "Delayed or free feeds"],
                    ["Execution", "Direct market access", "Through broker APIs"],
                    ["Cost", "₹10L+ per year", "₹0 - ₹50K per year"]
                  ].map((row, i) => (
                    <tr key={i} className="bg-white ">
                      <td className="p-3 font-medium text-gray-900 ">{row[0]}</td>
                      <td className="p-3 text-gray-600 ">{row[1]}</td>
                      <td className="p-3 text-gray-600 ">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Key Takeaways */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50   rounded-2xl p-6 mb-10 border border-emerald-200 ">
              <h3 className="font-bold text-emerald-800  mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center"><Icons.Key className="w-5 h-5 text-white"/></span>
                Key Takeaways
              </h3>
              <ul className="space-y-2">
                {["Every trading system has 5 core components: Data, Signals, Risk, Execution, Monitoring",
                  "Data flows in one direction: Market → Your System → Exchange",
                  "The Risk Manager is your protection — never skip it",
                  "You don't need institutional infrastructure to build a working system",
                  "Start simple: a basic system that works beats a complex one that doesn't"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-emerald-700 ">
                    <Icons.CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0"/><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quiz */}
            <h2 className="text-2xl font-bold mb-6">Test Your Understanding</h2>
            <QuizQuestion
              question="Which component acts as the 'gatekeeper' that validates signals before execution?"
              options={["Data Handler", "Signal Generator", "Risk Manager", "Execution Engine"]}
              correctAnswer="C"
              explanation="The Risk Manager validates every signal, checks exposure limits, and determines position sizing before allowing execution."
            />
            <QuizQuestion
              question="What is the correct order of data flow in a trading system?"
              options={["Execution → Risk → Signal → Data", "Data → Signal → Risk → Execution", "Signal → Data → Execution → Risk", "Risk → Data → Signal → Execution"]}
              correctAnswer="B"
              explanation="Data comes in first, signals are generated, risk validates them, then execution sends orders. This is a one-way flow."
            />
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/algo-trading-lesson-1')}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors group">
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/>Back: Foundations
            </button>
            <button onClick={() => navigate('/learn/algo-trading-lesson-3')}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all">
              Next: Strategy Development<FaArrowRight/>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AlgoTradingLesson2;
