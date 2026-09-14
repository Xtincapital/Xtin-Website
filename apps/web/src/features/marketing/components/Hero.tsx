import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [showDemo, setShowDemo] = useState(false);
  const [currentDemoStep, setCurrentDemoStep] = useState(0);

  const demoSteps = [
    {
      title: "Advanced Trading Algorithms",
      description: "Access AI-powered trading algorithms designed for modern markets. Our platform uses machine learning to analyze market trends and optimize your trading strategies.",
      image: (
        <svg className="w-16 h-16 mx-auto text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      features: [
        "Real-time market analysis",
        "AI-driven predictions",
        "Automated trading strategies",
        "Risk management tools"
      ]
    },
    {
      title: "Professional Tools & Analytics",
      description: "Get access to institutional-grade tools including backtesting, portfolio management, and advanced charting capabilities.",
      image: (
        <svg className="w-16 h-16 mx-auto text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      features: [
        "Advanced charting tools",
        "Portfolio tracking",
        "Performance analytics",
        "Custom indicators"
      ]
    },
    {
      title: "Educational Resources",
      description: "Learn algorithmic trading through our comprehensive courses, webinars, and community support.",
      image: (
        <svg className="w-16 h-16 mx-auto text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      features: [
        "Step-by-step courses",
        "Live webinars",
        "Trading strategies",
        "Community forum"
      ]
    }
  ];

  const nextStep = () => {
    if (currentDemoStep < demoSteps.length - 1) {
      setCurrentDemoStep(currentDemoStep + 1);
    }
  };

  const prevStep = () => {
    if (currentDemoStep > 0) {
      setCurrentDemoStep(currentDemoStep - 1);
    }
  };

  const closeDemo = () => {
    setShowDemo(false);
    setCurrentDemoStep(0);
  };

  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 py-20 px-6 md:px-12 lg:px-24 mt-16 overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="heroGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#10B981"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroGrid)"/>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-green-200 dark:border-emerald-700/50">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Building for Everyone
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 dark:text-slate-100 mb-6">
              World's Most Advanced{' '}
              <span className="text-green-600">Finance Ecosystem</span>
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-slate-300 mb-8 max-w-lg mx-auto lg:mx-0">
              Simple, powerful financial tools designed for everyone. Where technology meets simplicity to grow your wealth.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Link 
                to="/tools"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Explore Tools
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a 
                href="https://t.me/MarketXtin" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-emerald-500 text-gray-700 dark:text-slate-200 font-semibold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Join Community
              </a>
            </div>
            
          </div>
          
          {/* Right - Simple Finance Illustration */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              {/* Main Illustration Container */}
              <div className="w-80 h-80 relative">
                {/* Central Circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 bg-green-50 dark:bg-emerald-900/20 rounded-full border-2 border-green-100 dark:border-emerald-700/40 flex items-center justify-center">
                    <svg className="w-24 h-24 text-green-600" viewBox="0 0 100 100" fill="none">
                      {/* Growth Chart */}
                      <path d="M15 70 L30 55 L50 60 L70 35 L85 25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      <circle cx="15" cy="70" r="4" fill="#10B981"/>
                      <circle cx="30" cy="55" r="4" fill="#10B981"/>
                      <circle cx="50" cy="60" r="4" fill="#10B981"/>
                      <circle cx="70" cy="35" r="4" fill="#10B981"/>
                      <circle cx="85" cy="25" r="4" fill="#10B981"/>
                      {/* Arrow */}
                      <path d="M78 22 L88 20 L86 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </div>
                </div>
                
                {/* Orbiting Elements */}
                {/* Tools Icon */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-14 h-14 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </div>
                
                {/* Calculator Icon */}
                <div className="absolute top-1/2 right-0 translate-x-2 -translate-y-1/2 w-14 h-14 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="2" width="16" height="20" rx="2"/>
                    <path d="M8 6h8M8 10h8M8 14h2M8 18h2M14 14h2M14 18h2"/>
                  </svg>
                </div>
                
                {/* Chart Icon */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-14 h-14 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 20V10M12 20V4M6 20v-6"/>
                  </svg>
                </div>
                
                {/* Wallet Icon */}
                <div className="absolute top-1/2 left-0 -translate-x-2 -translate-y-1/2 w-14 h-14 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12V7H5a2 2 0 010-4h14v4"/>
                    <path d="M3 5v14a2 2 0 002 2h16v-5"/>
                    <path d="M18 12a2 2 0 100 4 2 2 0 000-4z"/>
                  </svg>
                </div>
                
                {/* Floating Badge */}
                <div className="absolute top-8 right-4 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  +24.5%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black/60 dark:bg-slate-950/85 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-transparent dark:border-slate-700">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-green-50 to-white dark:from-slate-900 dark:to-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Platform Demo</h2>
                <p className="text-sm text-gray-600 dark:text-slate-400">Step {currentDemoStep + 1} of {demoSteps.length}</p>
              </div>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl"
                onClick={closeDemo}
              >
                ×
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-slate-700 h-2">
              <div 
                className="bg-green-600 h-2 transition-all duration-300"
                style={{ width: `${((currentDemoStep + 1) / demoSteps.length) * 100}%` }}
              />
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="mb-4">{demoSteps[currentDemoStep].image}</div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">
                  {demoSteps[currentDemoStep].title}
                </h3>
                <p className="text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
                  {demoSteps[currentDemoStep].description}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {demoSteps[currentDemoStep].features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-4 bg-green-50 dark:bg-emerald-900/20 rounded-lg border border-green-200 dark:border-emerald-700/40"
                  >
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Demo Stats (for first step) */}
              {currentDemoStep === 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6 p-6 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">99.9%</div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">50K+</div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">0.1ms</div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">Latency</div>
                  </div>
                </div>
              )}

              {/* Call to Action on Last Step */}
              {currentDemoStep === demoSteps.length - 1 && (
                <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-emerald-700 dark:to-green-800 text-white p-6 rounded-lg text-center mb-6">
                  <h4 className="text-xl font-bold mb-2">Ready to Get Started?</h4>
                  <p className="mb-4">Join thousands of successful traders on Xtin Capital</p>
                  <a 
                    href="https://t.me/MarketXtin" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-white dark:bg-slate-100 text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-white transition"
                  >
                    Join Telegram Community
                  </a>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
              <button 
                onClick={prevStep}
                disabled={currentDemoStep === 0}
                className="px-6 py-2 border border-gray-300 dark:border-slate-600 rounded-lg font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex gap-2">
                {demoSteps.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentDemoStep ? 'bg-green-600 w-6' : 'bg-gray-300 dark:bg-slate-600'
                    }`}
                  />
                ))}
              </div>

              {currentDemoStep === demoSteps.length - 1 ? (
                <button 
                  onClick={closeDemo}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                >
                  Finish
                </button>
              ) : (
                <button 
                  onClick={nextStep}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
