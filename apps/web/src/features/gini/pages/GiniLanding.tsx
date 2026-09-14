import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { GINI_URL } from '../../../constants/externalApps';
import useRegion from '../../../hooks/useRegion';

// Region-natural showcase figures (not FX-converted — each region gets clean,
// believable demo numbers in its own currency).
const GINI_SHOWCASE = {
  IN:     { saved: '₹5L+',  advisor: '₹5 Lakh Advisor',   advice: 'Increase SIP by ₹15,000',          assets: '₹45L',  liab: '₹22L',  networth: '₹23L',  bigSaved: '₹5,00,000+', advisorRange: '₹2-5 Lakhs', advisorRangeYear: '₹2-5 Lakhs/year', advisorShort: '₹5 Lakh advisor', saveHeadline: 'Save ₹5+ Lakhs Every Year' },
  US:     { saved: '$3K+',  advisor: '$3,000 Advisor',    advice: 'Increase investing by $250/mo',     assets: '$540K', liab: '$260K', networth: '$280K', bigSaved: '$3,000+',    advisorRange: '$1,500-3,000', advisorRangeYear: '$1,500-3,000/year', advisorShort: '$3,000 advisor', saveHeadline: 'Save $3,000+ Every Year' },
  GB:     { saved: '£2K+',  advisor: '£2,000 Adviser',    advice: 'Increase investing by £200/mo',     assets: '£420K', liab: '£200K', networth: '£220K', bigSaved: '£2,000+',    advisorRange: '£1,000-2,000', advisorRangeYear: '£1,000-2,000/year', advisorShort: '£2,000 adviser', saveHeadline: 'Save £2,000+ Every Year' },
  EU:     { saved: '€2K+',  advisor: '€2,000 Advisor',    advice: 'Increase your savings plan by €220/mo', assets: '€480K', liab: '€230K', networth: '€250K', bigSaved: '€2,500+',    advisorRange: '€1,200-2,500', advisorRangeYear: '€1,200-2,500/year', advisorShort: '€2,000 advisor', saveHeadline: 'Save €2,500+ Every Year' },
  AE:     { saved: '$3K+',  advisor: '$3,000 Advisor',    advice: 'Increase investing by $250/mo',     assets: '$540K', liab: '$260K', networth: '$280K', bigSaved: '$3,000+',    advisorRange: '$1,500-3,000', advisorRangeYear: '$1,500-3,000/year', advisorShort: '$3,000 advisor', saveHeadline: 'Save $3,000+ Every Year' },
  SG:     { saved: 'S$4K+', advisor: 'S$4,000 Advisor',   advice: 'Increase investing by S$300/mo',    assets: 'S$720K', liab: 'S$350K', networth: 'S$370K', bigSaved: 'S$4,000+', advisorRange: 'S$2,000-4,000', advisorRangeYear: 'S$2,000-4,000/year', advisorShort: 'S$4,000 advisor', saveHeadline: 'Save S$4,000+ Every Year' },
  GLOBAL: { saved: '$3K+',  advisor: '$3,000 Advisor',    advice: 'Increase investing by $250/mo',     assets: '$540K', liab: '$260K', networth: '$280K', bigSaved: '$3,000+',    advisorRange: '$1,500-3,000', advisorRangeYear: '$1,500-3,000/year', advisorShort: '$3,000 advisor', saveHeadline: 'Save $3,000+ Every Year' },
};

const GiniLanding = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { region } = useRegion();
  const show = GINI_SHOWCASE[region] || GINI_SHOWCASE.GLOBAL;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { value: show.saved, label: 'Saved vs Advisors' },
    { value: '24/7', label: 'Available' },
    { value: '100%', label: 'Personalized' },
    { value: '1000+', label: 'Happy Users' },
  ];

  return (
    <div className="min-h-screen bg-white  text-gray-900  transition-colors duration-300">
      <Navbar />

      {/* Subtle Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] " style={{
          backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.4) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500/10  rounded-full blur-[120px]" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-teal-500/5  rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-emerald-400/5  rounded-full blur-[80px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50  border border-emerald-200  rounded-full mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-emerald-700 ">Your AI Financial Advisor</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="text-gray-900 ">
                  Replace Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent">
                  {show.advisor}
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600  mb-10 leading-relaxed max-w-xl">
                <span className="text-emerald-600  font-medium">Gini</span> is your personal AI financial advisor. 
                Input your assets, liabilities & goals <span className="font-medium">once</span> — get unlimited personalized advice, 
                insights & answers like a real advisor, but <span className="text-emerald-600  font-medium">free forever</span>.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <a
                  href={GINI_URL}
                  className="group relative inline-flex items-center justify-center px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center">
                    Start Free Consultation
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </a>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gray-100  text-gray-700  font-semibold rounded-xl border border-gray-200  hover:bg-gray-200  transition-all duration-300"
                >
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Home
                </Link>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-emerald-600 ">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-gray-500  mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - AI Advisor Interface */}
            <div className={`relative transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-3xl scale-90" />
                
                {/* Main Card */}
                <div className="relative bg-white  rounded-3xl border border-gray-200  p-6 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-gray-900  font-semibold">Gini - Your AI Advisor</div>
                        <div className="flex items-center gap-1 text-emerald-600  text-sm">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          Online & Ready
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                  </div>

                  {/* AI Chat Interface Mock */}
                  <div className="bg-gray-50  rounded-2xl p-5 mb-4 space-y-4">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-md px-4 py-2 max-w-[80%]">
                        <p className="text-sm">Based on my profile, should I increase my SIP or pay off my home loan faster?</p>
                      </div>
                    </div>
                    
                    {/* AI Response */}
                    <div className="flex justify-start">
                      <div className="bg-white  border border-gray-200  rounded-2xl rounded-tl-md px-4 py-3 max-w-[90%]">
                        <p className="text-sm text-gray-700 ">
                          Based on your profile: <span className="font-semibold text-emerald-600 ">{show.advice}</span>.
                          Your loan rate (8.5%) is lower than expected equity returns (12%). After tax benefits, effective loan cost is ~6.2%.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="text-xs bg-emerald-50  text-emerald-600  px-2 py-1 rounded-full">Personalized</span>
                          <span className="text-xs bg-blue-50  text-blue-600  px-2 py-1 rounded-full">Tax Optimized</span>
                          <span className="text-xs bg-purple-50  text-purple-600  px-2 py-1 rounded-full">Goal Based</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Profile Summary */}
                  <div className="bg-emerald-50  rounded-xl p-4 border border-emerald-100 ">
                    <p className="text-xs text-emerald-700  font-medium mb-3">Your Financial Profile</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-lg font-bold text-gray-900 ">{show.assets}</div>
                        <div className="text-xs text-gray-500">Assets</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900 ">{show.liab}</div>
                        <div className="text-xs text-gray-500">Liabilities</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-emerald-600 ">{show.networth}</div>
                        <div className="text-xs text-gray-500">Net Worth</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-white  rounded-2xl border border-gray-200  p-4 shadow-xl animate-bounce-slow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100  flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-gray-900  text-sm font-medium">Saved</div>
                      <div className="text-emerald-600  text-xs font-bold">{show.bigSaved}</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white  rounded-2xl border border-gray-200  p-4 shadow-xl animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100  flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-gray-900  text-sm font-medium">Ask Anything</div>
                      <div className="text-blue-600  text-xs">Like a real advisor</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-gray-300  flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-gray-400  rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* Why Replace Traditional Advisors Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100  rounded-full mb-6">
              <span className="text-emerald-600  text-sm font-medium">The Smart Choice</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900  mb-6">
              Why <span className="text-emerald-600 ">Gini</span> Over Traditional Advisors?
            </h2>
            <p className="text-lg text-gray-600 ">
              Human financial advisors charge {show.advisorRange} for the same advice Gini gives you for free.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Traditional Advisor */}
            <div className="bg-white  rounded-2xl p-8 border border-red-200 ">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-100  flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 ">Traditional Advisor</h3>
                  <p className="text-red-600  text-sm font-medium">{show.advisorRangeYear}</p>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-gray-600 ">Limited availability (office hours only)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-gray-600 ">May push products for commission</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-gray-600 ">Slow response for simple queries</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-gray-600 ">Expensive annual fees</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-gray-600 ">Need appointments for every question</span>
                </li>
              </ul>
            </div>

            {/* Gini AI Advisor */}
            <div className="bg-white  rounded-2xl p-8 border-2 border-emerald-500  relative">
              <div className="absolute -top-3 left-6 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                RECOMMENDED
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-100  flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 ">Gini AI Advisor</h3>
                  <p className="text-emerald-600  text-sm font-medium">FREE Forever</p>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 ">Available 24/7, anytime you need</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 ">100% unbiased, no hidden agenda</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 ">Instant answers to any question</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 ">Completely free, no hidden costs</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600 ">Unlimited questions, no appointments</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100  rounded-full mb-6">
              <span className="text-emerald-600  text-sm font-medium">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900  mb-6">
              How <span className="text-emerald-600 ">Gini</span> Works
            </h2>
            <p className="text-lg text-gray-600 ">
              Input once, get personalized advice forever. It's that simple.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="text-center">
                <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                  <span className="text-white text-3xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900  mb-3">Input Your Profile</h3>
                <p className="text-gray-600 ">
                  Enter your assets, liabilities, income, expenses, and financial goals. Do this once and Gini remembers everything.
                </p>
              </div>
              {/* Connector Line */}
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="text-center">
                <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-6 shadow-lg shadow-teal-500/30">
                  <span className="text-white text-3xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900  mb-3">AI Analyzes Everything</h3>
                <p className="text-gray-600 ">
                  Gini analyzes your complete financial picture, calculates projections, and understands your unique situation.
                </p>
              </div>
              {/* Connector Line */}
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500" />
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="text-center">
                <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30">
                  <span className="text-white text-3xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900  mb-3">Ask Anything</h3>
                <p className="text-gray-600 ">
                  Get personalized advice, insights, and answers to any financial question — just like talking to a real advisor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Ask Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100  rounded-full mb-6">
              <span className="text-emerald-600  text-sm font-medium">Your Questions Answered</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900  mb-6">
              Ask <span className="text-emerald-600 ">Gini</span> Anything
            </h2>
            <p className="text-lg text-gray-600 ">
              Just like a real financial advisor, Gini answers all your money questions based on your actual data.
            </p>
          </div>

          {/* Sample Questions Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white  rounded-2xl p-6 border border-gray-100  hover:shadow-lg transition-all duration-300">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100  text-emerald-600 ">
                Investment
              </span>
              <p className="mt-4 text-gray-900  font-medium">"Should I invest in SIP or lumpsum right now?"</p>
            </div>
            <div className="bg-white  rounded-2xl p-6 border border-gray-100  hover:shadow-lg transition-all duration-300">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100  text-blue-600 ">
                Loan
              </span>
              <p className="mt-4 text-gray-900  font-medium">"Should I prepay my loan or invest the extra money?"</p>
            </div>
            <div className="bg-white  rounded-2xl p-6 border border-gray-100  hover:shadow-lg transition-all duration-300">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100  text-purple-600 ">
                Tax
              </span>
              <p className="mt-4 text-gray-900  font-medium">"How can I save more tax this year based on my income?"</p>
            </div>
            <div className="bg-white  rounded-2xl p-6 border border-gray-100  hover:shadow-lg transition-all duration-300">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100  text-orange-600 ">
                Retirement
              </span>
              <p className="mt-4 text-gray-900  font-medium">"Am I on track for retirement? What should I change?"</p>
            </div>
            <div className="bg-white  rounded-2xl p-6 border border-gray-100  hover:shadow-lg transition-all duration-300">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-pink-100  text-pink-600 ">
                Insurance
              </span>
              <p className="mt-4 text-gray-900  font-medium">"Do I have enough life and health insurance coverage?"</p>
            </div>
            <div className="bg-white  rounded-2xl p-6 border border-gray-100  hover:shadow-lg transition-all duration-300">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-teal-100  text-teal-600 ">
                Goals
              </span>
              <p className="mt-4 text-gray-900  font-medium">"Can I afford to buy a house in 3 years?"</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100  rounded-full mb-6">
              <span className="text-emerald-600  text-sm font-medium">Capabilities</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900  mb-6">
              What <span className="text-emerald-600 ">Gini</span> Can Do
            </h2>
            <p className="text-lg text-gray-600 ">
              Everything a {show.advisorShort} does, and more — powered by AI.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white  rounded-2xl p-6 border border-gray-100  hover:shadow-xl hover:border-emerald-200  transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100  flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-emerald-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900  mb-3">Complete Financial Calculations</h3>
              <p className="text-gray-600 ">SIP, SWP, EMI, CAGR, XIRR, Net Worth, Tax planning — all calculations done instantly.</p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white  rounded-2xl p-6 border border-gray-100  hover:shadow-xl hover:border-blue-200  transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-blue-100  flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blue-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900  mb-3">Portfolio Analysis</h3>
              <p className="text-gray-600 ">Analyze your investments, check asset allocation, and get rebalancing suggestions.</p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white  rounded-2xl p-6 border border-gray-100  hover:shadow-xl hover:border-purple-200  transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-purple-100  flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-purple-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900  mb-3">Goal-Based Planning</h3>
              <p className="text-gray-600 ">Plan for retirement, children's education, house purchase, or any financial goal.</p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white  rounded-2xl p-6 border border-gray-100  hover:shadow-xl hover:border-orange-200  transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-orange-100  flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-orange-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900  mb-3">Tax Optimization</h3>
              <p className="text-gray-600 ">Get personalized tax-saving suggestions based on your income and investments.</p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-white  rounded-2xl p-6 border border-gray-100  hover:shadow-xl hover:border-pink-200  transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-pink-100  flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-pink-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900  mb-3">Ask Any Question</h3>
              <p className="text-gray-600 ">Natural conversation — ask anything about money in plain English, Hindi, or any language.</p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-white  rounded-2xl p-6 border border-gray-100  hover:shadow-xl hover:border-teal-200  transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-teal-100  flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-teal-600 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900  mb-3">Instant Insights</h3>
              <p className="text-gray-600 ">Get AI-powered insights on your financial health, risks, and opportunities instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-12 md:p-16">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8">
                <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span className="text-white/90 text-sm font-medium">{show.saveHeadline}</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Pay Lakhs When<br />Gini is Free?
              </h2>
              <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
                Start getting personalized financial advice today. No fees, no hidden costs, no appointments needed.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={GINI_URL}
                  className="group inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <span className="flex items-center">
                    Start Free Consultation
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </a>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  Back to Home
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-12 pt-10 border-t border-white/10">
                <div className="flex flex-wrap justify-center gap-8 text-white/60 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Your Data is Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>24/7 Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Instant Answers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>100% Free Forever</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes scroll {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(8px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default GiniLanding;
