import React from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaPlay } from "react-icons/fa";
import {
  BankIcon,
  BookOpenIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  KeyIcon,
  LockIcon,
  ShieldIcon,
  TargetIcon,
  WarningIcon
} from "../../components/LearningIcons";
import { cryptoLessons } from "./cryptoLessonData";

const lessonIcons = [
  ShieldIcon,
  ChartBarIcon,
  BankIcon,
  KeyIcon,
  LockIcon,
  WarningIcon
];

const colors = [
  "from-yellow-500 to-amber-500",
  "from-blue-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-violet-500 to-indigo-500",
  "from-red-500 to-rose-500",
  "from-slate-500 to-gray-600"
];

const CryptoOverview = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-yellow-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/learn")}
            className="flex items-center gap-2 text-gray-500 hover:text-yellow-700 transition-colors mb-8 group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span>Back to Learn</span>
          </button>

          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-full text-sm font-semibold shadow-sm">
                Advanced Module
              </span>
              <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4" />
                15 Lessons
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm">
                ~200 min total
              </span>
              <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                Awareness Only
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-xl shadow-sm">
                <ShieldIcon className="w-7 h-7 text-yellow-700" />
              </span>
              <span>Crypto Basics</span>
            </h1>
            <p className="text-lg text-gray-500">
              Learn blockchain, Bitcoin, Ethereum, wallets, DeFi, tokens, taxes, scams, and safety
              with a clear risk-first lens. This module is education, not coin recommendations.
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-yellow-50 rounded-3xl p-8 mb-10 border border-yellow-100 shadow-lg">
            <div className="grid md:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Understand before exposure.</h2>
                <p className="text-gray-600 leading-relaxed mb-5">
                  Crypto combines technology, markets, security, tax, and psychology. The goal here is
                  to help you understand the system deeply enough to avoid hype-driven mistakes.
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl p-4 border border-yellow-100 shadow-sm">
                    <LockIcon className="w-6 h-6 text-yellow-700 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Wallet safety</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-yellow-100 shadow-sm">
                    <WarningIcon className="w-6 h-6 text-red-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Scam defense</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-yellow-100 shadow-sm">
                    <ChartBarIcon className="w-6 h-6 text-indigo-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Token analysis</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-6 text-white shadow-xl">
                <ShieldIcon className="w-12 h-12 text-white/90 mb-4" />
                <p className="text-sm uppercase tracking-wide text-yellow-100 font-semibold mb-2">Core principle</p>
                <p className="text-2xl font-bold leading-tight mb-3">
                  No hype. No leverage. No blind trust.
                </p>
                <p className="text-yellow-50 text-sm leading-relaxed">
                  Crypto is optional. If you do not understand it, cannot secure it, or cannot afford
                  to lose it, you should not buy it.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl p-6 mb-10 border border-red-200">
            <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
              <TargetIcon className="w-6 h-6 text-red-600" />
              <span>After This Module, You Will:</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                "Understand blockchain, Bitcoin, and Ethereum fundamentals",
                "Know wallets, private keys, exchanges, and custody risk",
                "Read stablecoins, tokenomics, DeFi, and NFTs more critically",
                "Recognize common crypto scams and leverage traps",
                "Understand India tax and regulatory awareness",
                "Use a personal crypto safety checklist"
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-red-800">
                  <CheckCircleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <BookOpenIcon className="w-7 h-7 text-yellow-700" />
              <span>Your Learning Path</span>
            </h2>

            <div className="space-y-4">
              {cryptoLessons.map((lesson, index) => {
                const Icon = lessonIcons[index % lessonIcons.length];
                return (
                  <button
                    key={lesson.num}
                    onClick={() => navigate(`/learn/crypto-lesson-${lesson.num}`)}
                    className="w-full text-left bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-yellow-300 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${colors[index % colors.length]} rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-yellow-700">LESSON {lesson.num}</span>
                          <span className="text-gray-300">-</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {lesson.duration}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">{lesson.title}</h3>
                        <p className="text-sm text-gray-500">{lesson.subtitle}</p>
                      </div>
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-500 transition-colors">
                        <FaPlay className="w-3 h-3 text-yellow-700 group-hover:text-white transition-colors ml-0.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200">
              <KeyIcon className="w-7 h-7 text-yellow-700 mb-3" />
              <h3 className="font-bold text-yellow-900 mb-1">Technology first</h3>
              <p className="text-sm text-yellow-800">Learn the system before thinking about assets.</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
              <WarningIcon className="w-7 h-7 text-red-600 mb-3" />
              <h3 className="font-bold text-red-900 mb-1">Risk explicit</h3>
              <p className="text-sm text-red-700">Volatility, scams, custody, and tax are central.</p>
            </div>
            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-200">
              <BankIcon className="w-7 h-7 text-indigo-600 mb-3" />
              <h3 className="font-bold text-indigo-900 mb-1">India aware</h3>
              <p className="text-sm text-indigo-700">Tax, TDS, records, and regulation are covered.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-2">Ready to Learn Crypto Safely?</h3>
            <p className="text-yellow-100 mb-6">Start with what crypto really is before touching wallets or exchanges.</p>
            <button
              onClick={() => navigate("/learn/crypto-lesson-1")}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-yellow-700 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              <FaPlay className="w-3 h-3" />
              <span>Start Lesson 1</span>
              <FaArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CryptoOverview;
