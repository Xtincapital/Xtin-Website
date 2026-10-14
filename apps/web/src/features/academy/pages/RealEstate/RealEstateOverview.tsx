import React from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaPlay } from "react-icons/fa";
import {
  HomeIcon,
  TargetIcon,
  CheckCircleIcon,
  BookOpenIcon,
  ClockIcon,
  BankIcon,
  CoinsIcon,
  ReceiptIcon,
  ClipboardIcon,
  GrowthIcon,
  PercentIcon,
  KeyIcon
} from "../../components/LearningIcons";
import { realEstateLessons } from "./realEstateLessonData";
import ModuleBadge from "../../components/ModuleBadge";

const lessonIcons = [
  HomeIcon,
  KeyIcon,
  BankIcon,
  CoinsIcon,
  ReceiptIcon,
  ClipboardIcon,
  BookOpenIcon,
  GrowthIcon,
  PercentIcon,
  CheckCircleIcon
];

const lessonColors = [
  "from-indigo-500 to-blue-500",
  "from-cyan-500 to-blue-500",
  "bg-brand-fill",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-violet-500 to-indigo-500",
  "from-blue-500 to-sky-500",
  "bg-brand-fill",
  "from-teal-500 to-cyan-500",
  "from-slate-500 to-indigo-500"
];

const RealEstateOverview = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-indigo-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/learn")}
            className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-8 group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span>Back to Learn</span>
          </button>

          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-4 py-1.5 text-white rounded-full text-sm font-semibold shadow-sm bg-brand-fill">
                Intermediate Module
              </span>
              <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4" />
                10 Lessons
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm">
                ~100 min total
              </span>
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Home Buying
              </span>
            </div>

            <div className="mb-3"><ModuleBadge moduleId="real-estate" /></div>
<h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-200 rounded-xl shadow-sm">
                <HomeIcon className="w-7 h-7 text-indigo-600" />
              </span>
              <span>Real Estate Basics</span>
            </h1>
            <p className="text-lg text-gray-500">
              Learn how to think about buying, renting, loans, legal checks, hidden costs,
              and property as an investment before making one of life&apos;s biggest purchases.
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl p-8 mb-10 border border-indigo-100 shadow-lg overflow-hidden relative">
            <div className="absolute right-0 top-0 w-40 h-40 bg-indigo-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-70" />
            <div className="relative grid md:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-[-0.015em]">Buy the home. Do not let the home buy you.</h2>
                <p className="text-gray-600 leading-relaxed mb-5">
                  Real estate decisions become healthy when affordability, legal clarity, and lifestyle fit
                  all work together. This module gives you the checklist before the commitment.
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm">
                    <BankIcon className="w-6 h-6 text-brand mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Loan clarity</p>
                    <p className="text-xs text-gray-500">EMI and tenure</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm">
                    <ReceiptIcon className="w-6 h-6 text-rose-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">True cost</p>
                    <p className="text-xs text-gray-500">Taxes and fees</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm">
                    <ClipboardIcon className="w-6 h-6 text-indigo-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Legal checks</p>
                    <p className="text-xs text-gray-500">Documents first</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-6 text-white shadow-xl bg-brand-fill">
                <HomeIcon className="w-12 h-12 text-white/90 mb-4" />
                <p className="text-sm uppercase tracking-wide text-indigo-100 font-semibold mb-2">Core principle</p>
                <p className="text-2xl font-bold leading-tight mb-3">
                  Affordability beats approval.
                </p>
                <p className="text-indigo-50 text-sm leading-relaxed">
                  A bank may approve a bigger loan, but your life needs room for emergencies,
                  investments, family goals, and peace of mind.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-10 border border-amber-200">
            <h2 className="text-xl font-semibold text-amber-900 mb-4 flex items-center gap-2">
              <TargetIcon className="w-6 h-6 text-amber-600" />
              <span>After This Module, You Will:</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                "Understand home as shelter versus investment",
                "Compare rent and buy decisions calmly",
                "Know home loan, EMI, and affordability basics",
                "Budget for hidden property costs",
                "Evaluate under-construction and ready-to-move homes",
                "Run legal and investment checks before buying"
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-amber-800">
                  <CheckCircleIcon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <BookOpenIcon className="w-7 h-7 text-indigo-600" />
              <span>Your Learning Path</span>
            </h2>

            <div className="space-y-4">
              {realEstateLessons.map((lesson, index) => {
                const Icon = lessonIcons[index];
                return (
                  <button
                    key={lesson.num}
                    onClick={() => navigate(`/learn/real-estate-lesson-${lesson.num}`)}
                    className="w-full text-left bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-indigo-300 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${lessonColors[index]} rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-indigo-600">LESSON {lesson.num}</span>
                          <span className="text-gray-300">-</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {lesson.duration}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg">{lesson.title}</h3>
                        <p className="text-sm text-gray-500">{lesson.subtitle}</p>
                      </div>
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                        <FaPlay className="w-3 h-3 text-indigo-600 group-hover:text-white transition-colors ml-0.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-200">
              <PercentIcon className="w-7 h-7 text-indigo-600 mb-3" />
              <h3 className="font-semibold text-indigo-900 mb-1">EMI aware</h3>
              <p className="text-sm text-indigo-700">Understand loan burden before committing.</p>
            </div>
            <div className="bg-brand-soft rounded-2xl p-5 border border-brand-line">
              <GrowthIcon className="w-7 h-7 text-brand mb-3" />
              <h3 className="font-semibold text-brand mb-1">Investment aware</h3>
              <p className="text-sm text-brand">Evaluate yield, appreciation, and liquidity.</p>
            </div>
            <div className="bg-rose-50 rounded-2xl p-5 border border-rose-200">
              <KeyIcon className="w-7 h-7 text-rose-600 mb-3" />
              <h3 className="font-semibold text-rose-900 mb-1">Checklist driven</h3>
              <p className="text-sm text-rose-700">Make the decision with documents, not pressure.</p>
            </div>
          </div>

          <div className="rounded-2xl p-8 text-white text-center relative overflow-hidden bg-brand-fill">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold mb-2 tracking-[-0.015em]">Ready to Buy Smarter?</h3>
              <p className="text-indigo-100 mb-6">Start with the difference between a home and an investment.</p>
              <button
                onClick={() => navigate("/learn/real-estate-lesson-1")}
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                <FaPlay className="w-3 h-3" />
                <span>Start Lesson 1</span>
                <FaArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RealEstateOverview;
