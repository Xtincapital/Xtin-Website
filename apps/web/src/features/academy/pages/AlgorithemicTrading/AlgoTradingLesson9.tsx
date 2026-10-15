import React, { useState } from "react";
import StudyShell from "../../components/StudyShell";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaTrophy, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// SVG Icons
const Icons = {
  Api: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 17L10 11L4 5"/><path d="M12 19H20"/>
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
  Warning: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 9V13M12 17H12.01"/><path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.54 21H20.46A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z"/>
    </svg>
  ),
  Key: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="15" r="5"/><path d="M11.5 11.5L21 2M18 5L21 2L21 5L18 5Z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Lock: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7A5 5 0 0 1 17 7V11"/>
    </svg>
  ),
  Zap: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 3L4 14H12L11 21L20 10H12L13 3Z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Code: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/>
    </svg>
  ),
  Link: ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13A5 5 0 0 0 14 11L18 7A5 5 0 0 0 8 7L10 9"/><path d="M14 11A5 5 0 0 0 10 13L6 17A5 5 0 0 0 16 17L14 15"/>
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
          let bg = "bg-gray-50  hover:bg-brand-soft ", border = "border-gray-200 ";
          if (showResult) { if (isRight) { bg="bg-brand-soft "; border="border-brand"; } 
            else if (isThis) { bg="bg-red-50 "; border="border-red-400"; }}
          return (
            <button key={i} onClick={()=>handleClick(i)} disabled={showResult}
              className={`w-full text-left p-4 rounded-xl border-2 ${border} ${bg} transition-all`}>
              <span className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${showResult && isRight ? 'bg-brand-fill text-white' : showResult && isThis ? 'bg-red-500 text-white' : 'bg-brand-soft  text-brand'}`}>{letter}</span>
                <span className="text-gray-700 ">{opt}</span>
                {showResult && isRight && <FaCheckCircle className="ml-auto text-brand"/>}
                {showResult && isThis && !isRight && <FaTimesCircle className="ml-auto text-red-500"/>}
              </span>
            </button>
          );
        })}
      </div>
      {showResult && (
        <div className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-brand-soft  text-brand ' : 'bg-amber-100  text-amber-800 '}`}>
          <p className="font-medium flex items-center gap-2">
            {isCorrect ? <><FaCheckCircle/> Correct!</> : <><FaTimesCircle/> Not quite.</>}
          </p>
          <p className="text-sm mt-1">{explanation}</p>
        </div>
      )}
    </div>
  );
};

const AlgoTradingLesson9 = () => {
  const navigate = useNavigate();

  return (
    <StudyShell module="AlgorithemicTrading" lessonNumber={9}>
      <div>
        <div className="max-w-4xl mx-auto">
          
          {/* Breadcrumb */}
          <button onClick={() => navigate('/learn/algorithmic-trading')}
            className="flex items-center gap-2 text-gray-500 hover:text-brand transition-colors mb-8 group">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/><span>Back to Algorithmic Trading</span>
          </button>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 text-white rounded-full text-sm font-bold bg-brand-fill">Lesson 9 of 9 • Final</span>
              <span className="px-3 py-1.5 bg-gray-100  text-gray-600  rounded-full text-sm">20 min read</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 flex items-center gap-4 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg bg-brand-fill">
                <Icons.Api className="w-8 h-8 text-white"/>
              </span>
              Broker APIs & Integration
            </h1>
            <p className="text-xl text-gray-600 ">
              Connect your algorithms to real markets. Learn how to integrate with Indian brokers.
            </p>
          </div>

          {/* Learning Objectives */}
          <div className="rounded-2xl p-6 mb-10 border border-brand-line bg-brand-soft">
            <h2 className="font-semibold text-brand  mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-brand-fill rounded-lg flex items-center justify-center"><Icons.Target className="w-5 h-5 text-white"/></span>
              What You'll Learn
            </h2>
            <ul className="space-y-2">
              {["Understand how broker APIs work (REST, WebSocket)", "Compare popular Indian broker APIs (Zerodha, Upstox, Fyers)", 
                "Learn the authentication flow (OAuth, TOTP)", "Understand order placement and management basics"].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-brand ">
                  <Icons.CheckCircle className="w-5 h-5 text-brand mt-0.5 flex-shrink-0"/><span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none ">
            
            {/* Warning Banner */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50   rounded-2xl p-6 mb-10 border border-red-200 ">
              <h3 className="font-semibold text-red-900  mb-3 text-lg flex items-center gap-2">
                <Icons.Warning className="w-5 h-5"/> Important Disclaimer
              </h3>
              <p className="text-red-800 ">
                This lesson covers API <strong>concepts and awareness</strong> only. Actual implementation requires careful testing 
                with paper trading first. <strong>Never deploy untested code with real money.</strong> Always understand broker 
                rate limits and terms of service.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-4 tracking-[-0.025em]">How Broker APIs Work</h2>
            <p className="text-gray-700  mb-6">
              Broker APIs let your code communicate with the exchange through the broker's servers. Here's the flow:
            </p>

            {/* API Flow SVG */}
            <div className="rounded-2xl p-6 mb-10 border border-brand/50 shadow-xl bg-brand-fill">
              <svg className="w-full max-w-3xl mx-auto" viewBox="0 0 700 280" fill="none">
                <text x="350" y="25" textAnchor="middle" fill="#ECE4F6" fontSize="14" fontWeight="700">BROKER API FLOW</text>

                {/* Your Algorithm */}
                <g transform="translate(30, 60)">
                  <rect x="0" y="0" width="130" height="80" rx="10" fill="#5A77AA" opacity="0.9"/>
                  <text x="65" y="35" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">YOUR</text>
                  <text x="65" y="52" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">ALGORITHM</text>
                  <text x="65" y="70" textAnchor="middle" fill="#C3D0E4" fontSize="8">Python/Node.js</text>
                </g>

                {/* Arrow 1 */}
                <g transform="translate(170, 90)">
                  <path d="M0 10 L60 10" stroke="#16A34A" strokeWidth="2"/>
                  <polygon points="60,10 50,5 50,15" fill="#16A34A"/>
                  <text x="30" y="0" textAnchor="middle" fill="#16A34A" fontSize="8">REST/WebSocket</text>
                </g>

                {/* Broker API */}
                <g transform="translate(240, 60)">
                  <rect x="0" y="0" width="130" height="80" rx="10" fill="#8F6FC4" opacity="0.9"/>
                  <text x="65" y="35" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">BROKER</text>
                  <text x="65" y="52" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">API SERVER</text>
                  <text x="65" y="70" textAnchor="middle" fill="#C0A9E2" fontSize="8">Zerodha/Upstox</text>
                </g>

                {/* Arrow 2 */}
                <g transform="translate(380, 90)">
                  <path d="M0 10 L60 10" stroke="#16A34A" strokeWidth="2"/>
                  <polygon points="60,10 50,5 50,15" fill="#16A34A"/>
                  <text x="30" y="0" textAnchor="middle" fill="#16A34A" fontSize="8">FIX Protocol</text>
                </g>

                {/* Exchange */}
                <g transform="translate(450, 60)">
                  <rect x="0" y="0" width="130" height="80" rx="10" fill="#16A34A" opacity="0.9"/>
                  <text x="65" y="35" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">EXCHANGE</text>
                  <text x="65" y="52" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">(NSE/BSE)</text>
                  <text x="65" y="70" textAnchor="middle" fill="#BBF7D0" fontSize="8">Order matching</text>
                </g>

                {/* Return flow */}
                <path d="M515 150 L515 180 L95 180 L95 150" stroke="#E2C273" strokeWidth="2" strokeDasharray="5,5" fill="none"/>
                <text x="305" y="200" textAnchor="middle" fill="#E2C273" fontSize="9">Order confirmations, market data, fills</text>

                {/* Two API Types */}
                <g transform="translate(50, 220)">
                  <rect x="0" y="0" width="280" height="45" rx="8" fill="#2A2A2C"/>
                  <text x="140" y="18" textAnchor="middle" fill="#9FB3D3" fontSize="10" fontWeight="600">REST API</text>
                  <text x="140" y="35" textAnchor="middle" fill="#717680" fontSize="8">Request-response • Orders, account info</text>
                </g>
                <g transform="translate(370, 220)">
                  <rect x="0" y="0" width="280" height="45" rx="8" fill="#2A2A2C"/>
                  <text x="140" y="18" textAnchor="middle" fill="#16A34A" fontSize="10" fontWeight="600">WebSocket</text>
                  <text x="140" y="35" textAnchor="middle" fill="#717680" fontSize="8">Real-time stream • Price ticks, order updates</text>
                </g>
              </svg>
            </div>

            {/* Indian Broker APIs */}
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="w-10 h-10 bg-blue-100  rounded-xl flex items-center justify-center">
                <Icons.Link className="w-5 h-5 text-blue-600 "/>
              </span>
              Popular Indian Broker APIs
            </h2>

            <p className="text-gray-700  mb-6">
              Here's a comparison of the main API options for retail algo traders in India:
            </p>

            {/* Broker Comparison */}
            <div className="bg-white  rounded-2xl p-6 mb-10 border border-gray-200  overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 ">
                    <th className="text-left py-3 text-gray-600 ">Broker</th>
                    <th className="text-left py-3 text-gray-600 ">API Cost</th>
                    <th className="text-left py-3 text-gray-600 ">Data Access</th>
                    <th className="text-left py-3 text-gray-600 ">Best For</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 ">
                  {[
                    { broker: "Zerodha Kite", cost: "₹2000/month", data: "Historical + Real-time", best: "Most popular, best docs", color: "emerald" },
                    { broker: "Upstox", cost: "Free with account", data: "Historical + Real-time", best: "Cost-effective option", color: "blue" },
                    { broker: "Fyers", cost: "Free with account", data: "Historical + Real-time", best: "Good for options", color: "violet" },
                    { broker: "Angel One", cost: "Free (SmartAPI)", data: "Limited historical", best: "Easy to start", color: "amber" },
                    { broker: "5Paisa", cost: "Free tier available", data: "Basic access", best: "Budget traders", color: "gray" },
                  ].map((row, i) => {
                    const colors = { emerald: "bg-brand-soft text-brand  ",
                      blue: "bg-blue-100 text-blue-700  ",
                      violet: "bg-violet-100 text-violet-700  ",
                      amber: "bg-amber-100 text-amber-700  ",
                      gray: "bg-gray-100 text-gray-700  " };
                    return (
                      <tr key={i} className="border-b border-gray-100 ">
                        <td className="py-3"><span className={`px-2 py-1 rounded-md font-medium ${colors[row.color]}`}>{row.broker}</span></td>
                        <td className="py-3 font-mono text-sm">{row.cost}</td>
                        <td className="py-3">{row.data}</td>
                        <td className="py-3">{row.best}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Authentication */}
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 tracking-[-0.015em]">
              <span className="w-10 h-10 bg-amber-100  rounded-xl flex items-center justify-center">
                <Icons.Lock className="w-5 h-5 text-amber-600 "/>
              </span>
              Authentication Flow
            </h2>

            <p className="text-gray-700  mb-6">
              Most Indian brokers use OAuth 2.0 + TOTP (Time-based One-Time Password) for security:
            </p>

            {/* Auth Flow */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50   rounded-2xl p-6 mb-10 border border-amber-200 ">
              <h3 className="font-semibold text-amber-800  mb-4">Typical Login Flow</h3>
              <div className="space-y-3">
                {[
                  { step: "1", title: "Redirect to Broker Login", desc: "User logs in via broker's website" },
                  { step: "2", title: "OAuth Callback", desc: "Broker redirects back with request_token" },
                  { step: "3", title: "Exchange for Access Token", desc: "Your app exchanges request_token for access_token" },
                  { step: "4", title: "TOTP Verification", desc: "Some brokers require additional TOTP code" },
                  { step: "5", title: "API Access", desc: "Use access_token in all API requests" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white  rounded-lg p-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">{item.step}</span>
                    <div>
                      <h4 className="font-semibold text-amber-700 ">{item.title}</h4>
                      <p className="text-sm text-amber-600 ">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-amber-700  mt-4 bg-amber-100  rounded-lg p-3">
                <strong>Note:</strong> Access tokens typically expire daily. You'll need to re-authenticate each trading day.
              </p>
            </div>

            {/* API Capabilities */}
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 tracking-[-0.015em]">
              <span className="w-10 h-10 bg-violet-100  rounded-xl flex items-center justify-center">
                <Icons.Code className="w-5 h-5 text-violet-600 "/>
              </span>
              Common API Capabilities
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {[
                { category: "Market Data", items: ["Live quotes (LTP)", "OHLC candles", "Market depth (L2)", "Instrument lists"] },
                { category: "Orders", items: ["Place orders (Market/Limit)", "Modify orders", "Cancel orders", "Order status"] },
                { category: "Portfolio", items: ["Holdings", "Positions", "P&L", "Margins available"] },
                { category: "Historical", items: ["Daily candles", "Intraday candles", "Tick data (some)"] },
              ].map((cat, i) => {
                const colors = ["emerald", "blue", "violet", "amber"];
                const bgColors = { emerald: "bg-brand-soft  border-brand-line ",
                  blue: "bg-blue-50  border-blue-200 ",
                  violet: "bg-violet-50  border-violet-200 ",
                  amber: "bg-amber-50  border-amber-200 " };
                const textColors = { emerald: "text-brand ", blue: "text-blue-700 ",
                  violet: "text-violet-700 ", amber: "text-amber-700 " };
                return (
                  <div key={i} className={`rounded-xl p-4 border ${bgColors[colors[i]]}`}>
                    <h4 className={`font-bold mb-3 ${textColors[colors[i]]}`}>{cat.category}</h4>
                    <ul className="space-y-1">
                      {cat.items.map((item, j) => (
                        <li key={j} className={`text-sm flex items-center gap-2 ${textColors[colors[i]]}`}>
                          <Icons.CheckCircle className="w-4 h-4 flex-shrink-0"/>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Code Example */}
            <h2 className="text-2xl font-bold mb-4 tracking-[-0.015em]">Conceptual Code Structure</h2>
            <p className="text-gray-700  mb-4">
              Here's what a typical trading script structure looks like (pseudocode):
            </p>

            <div className="bg-slate-900 rounded-2xl p-6 mb-10 font-mono text-sm overflow-x-auto border border-slate-700 brand-on-dark">
              <pre className="text-brand leading-relaxed">
                <code>
{`# 1. Initialize and Authenticate
kite = KiteConnect(api_key="your_api_key")
kite.set_access_token(access_token)

# 2. Get Market Data
quote = kite.quote("NSE:RELIANCE")
print(f"LTP: {quote['last_price']}")

# 3. Place an Order
order_id = kite.place_order(
    variety="regular",
    exchange="NSE",
    tradingsymbol="RELIANCE",
    transaction_type="BUY",
    quantity=10,
    product="CNC",
    order_type="LIMIT",
    price=2500.00
)

# 4. Check Order Status
order = kite.order_history(order_id)
print(f"Status: {order[-1]['status']}")

# 5. Monitor with WebSocket
def on_tick(ws, ticks):
    for tick in ticks:
        print(f"Price: {tick['last_price']}")

kite_ticker = KiteTicker(api_key, access_token)
kite_ticker.on_ticks = on_tick
kite_ticker.subscribe([738561])  # RELIANCE token
kite_ticker.connect()`}
                </code>
              </pre>
            </div>

            {/* Rate Limits */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50   rounded-2xl p-6 mb-10 border border-red-200 ">
              <h3 className="font-semibold text-red-800  mb-4 flex items-center gap-3">
                <Icons.Warning className="w-5 h-5"/> Rate Limits & Best Practices
              </h3>
              <div className="space-y-3">
                {[
                  { rule: "Respect rate limits", detail: "Most APIs allow 3-10 requests/second. Exceeding = temporary ban" },
                  { rule: "Use WebSocket for live data", detail: "Don't poll REST API for prices — use streaming" },
                  { rule: "Handle errors gracefully", detail: "Network issues happen. Implement retry logic with backoff" },
                  { rule: "Log everything", detail: "Keep records of all orders, fills, and errors for debugging" },
                  { rule: "Test on paper first", detail: "Most brokers offer paper trading mode. Use it!" },
                ].map((item, i) => (
                  <div key={i} className="bg-white  rounded-lg p-3 flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{i + 1}</span>
                    <div>
                      <span className="font-semibold text-red-700 ">{item.rule}:</span>
                      <span className="text-red-600  ml-1">{item.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50   rounded-2xl p-6 mb-10 border border-blue-200 ">
              <h3 className="font-semibold text-blue-800  mb-4 flex items-center gap-3">
                <Icons.Zap className="w-5 h-5"/> Getting Started Checklist
              </h3>
              <ol className="space-y-2">
                {[
                  "Open a demat account with an API-enabled broker",
                  "Apply for API access (may require separate approval)",
                  "Set up developer credentials (API key, secret)",
                  "Install the broker's Python/Node library",
                  "Test authentication in paper trading mode",
                  "Start with simple market data queries",
                  "Progress to paper order placement",
                  "Only go live after thorough testing",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-blue-700 ">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{i + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Key Takeaways */}
            <div className="rounded-2xl p-6 mb-10 border border-brand-line bg-brand-soft">
              <h3 className="font-semibold text-brand  mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-brand-fill rounded-lg flex items-center justify-center"><Icons.Key className="w-5 h-5 text-white"/></span>
                Key Takeaways
              </h3>
              <ul className="space-y-2">
                {["Broker APIs let your code place orders and receive market data",
                  "REST APIs are for request-response; WebSockets for real-time streaming",
                  "Zerodha Kite is most popular in India; Upstox/Fyers are free alternatives",
                  "Authentication uses OAuth + TOTP; tokens expire daily",
                  "Always respect rate limits to avoid being blocked",
                  "Test extensively on paper trading before going live",
                  "Log all orders and errors — debugging is crucial"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-brand ">
                    <Icons.CheckCircle className="w-5 h-5 text-brand mt-0.5 flex-shrink-0"/><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quiz */}
            <h2 className="text-2xl font-bold mb-6 tracking-[-0.015em]">Test Your Understanding</h2>
            <QuizQuestion
              question="What is the main difference between REST API and WebSocket?"
              options={["REST is free, WebSocket is paid", "REST is request-response, WebSocket is real-time streaming", "REST is for orders, WebSocket is for data only", "There is no difference"]}
              correctAnswer="B"
              explanation="REST APIs work on a request-response basis — you ask for data, you get it. WebSockets maintain a persistent connection and push data to you in real-time, ideal for live price feeds and order updates."
            />
            <QuizQuestion
              question="Why do access tokens typically expire daily?"
              options={["To save server resources", "For security — limits damage from leaked tokens", "Brokers want to increase login metrics", "It's a technical limitation"]}
              correctAnswer="B"
              explanation="Daily token expiry is a security measure. If a token is compromised, the damage window is limited to one day. It also ensures users re-authenticate regularly, adding an extra layer of security."
            />
            <QuizQuestion
              question="What should you do before placing live orders via API?"
              options={["Just start trading to learn faster", "Test thoroughly on paper trading mode", "Ask other traders for their code", "Wait for market crash to start"]}
              correctAnswer="B"
              explanation="Always test your code extensively on paper trading mode first. This lets you verify your logic, catch bugs, and understand the API behavior without risking real money."
            />

            {/* Completion Banner */}
            <div className="bg-gradient-to-r from-amber-100 to-yellow-100   rounded-2xl p-8 mb-10 border-2 border-amber-400  text-center">
              <FaTrophy className="w-16 h-16 text-amber-500 mx-auto mb-4"/>
              <h2 className="text-2xl font-bold text-amber-900  mb-2 tracking-[-0.015em]">🎉 Congratulations!</h2>
              <p className="text-amber-800  mb-4">
                You've completed the entire <strong>Algorithmic Trading Module</strong>! 
                You now understand the full journey from strategy concept to live deployment.
              </p>
              <div className="bg-white  rounded-xl p-4 text-left max-w-md mx-auto">
                <h4 className="font-bold text-amber-800  mb-2">You've learned:</h4>
                <ul className="text-sm text-amber-700  space-y-1">
                  <li>✓ Algorithmic trading foundations & architecture</li>
                  <li>✓ Strategy types & development frameworks</li>
                  <li>✓ Backtesting & avoiding overfitting</li>
                  <li>✓ Risk management & position sizing</li>
                  <li>✓ Execution, order types & slippage</li>
                  <li>✓ Live trading & monitoring</li>
                  <li>✓ Data management & sources</li>
                  <li>✓ Broker APIs & integration</li>
                </ul>
              </div>
              <p className="text-sm text-amber-700  mt-4">
                The best algo traders combine technical skill with disciplined risk management. Start small, test thoroughly, and keep learning!
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-gray-200 ">
            <button onClick={() => navigate('/learn/algo-trading-lesson-8')}
              className="flex items-center gap-2 text-gray-600 hover:text-brand transition-colors group">
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform"/>Back: Data Management
            </button>
            <button onClick={() => navigate('/learn/algorithmic-trading')}
              className="flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition-all bg-brand-fill">
              <FaTrophy className="mr-1"/> Back to Module Overview
            </button>
          </div>
        </div>
      </div>
    </StudyShell>
  );
};

export default AlgoTradingLesson9;
