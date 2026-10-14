import React from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaPlay } from "react-icons/fa";
import {
  BalanceScaleIcon,
  BankIcon,
  BookOpenIcon,
  CalculatorIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentCheckIcon,
  KeyIcon,
  PiggyBankIcon,
  ShieldIcon,
  TargetIcon,
  WalletIcon,
  WarningIcon
} from "../../components/LearningIcons";
import { financialPlanningLessons } from "./financialPlanningLessonData";
import ModuleBadge from "../../components/ModuleBadge";

const lessonIcons = [TargetIcon, WalletIcon, BalanceScaleIcon, KeyIcon, ShieldIcon, BankIcon, ClockIcon, PiggyBankIcon, CalculatorIcon];
const colors = [
  "from-indigo-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-blue-500 to-cyan-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-violet-500 to-indigo-500",
  "from-green-500 to-emerald-500",
  "from-cyan-500 to-blue-500"
];

const FinancialPlanningOverview = () => {
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
              <span className="px-4 py-1.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-full text-sm font-semibold shadow-sm">
                Beginner Module
              </span>
              <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4" />
                15 Lessons
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm">
                ~180 min total
              </span>
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                Roadmap
              </span>
            </div>

            <div className="mb-3"><ModuleBadge moduleId="financial-planning" /></div>

            <h1 className="text-3xl md:text-4xl font-display font-normal text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.015em]">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-200 rounded-xl shadow-sm">
                <TargetIcon className="w-7 h-7 text-indigo-600" />
              </span>
              <span>Financial Planning Basics</span>
            </h1>
            <p className="text-lg text-gray-500">
              Bring the beginner journey together with a simple roadmap for income, expenses,
              emergency money, debt, insurance, goals, saving, and investing.
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl p-8 mb-10 border border-indigo-100 shadow-lg">
            <div className="grid md:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-[-0.015em]">This is the beginner capstone.</h2>
                <p className="text-gray-600 leading-relaxed mb-5">
                  This module connects the pieces users have learned separately and turns them into
                  a first practical money plan they can actually follow.
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm">
                    <WalletIcon className="w-6 h-6 text-indigo-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Snapshot</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm">
                    <ShieldIcon className="w-6 h-6 text-emerald-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Safety base</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm">
                    <TargetIcon className="w-6 h-6 text-amber-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Goals</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white shadow-xl">
                <DocumentCheckIcon className="w-12 h-12 text-white/90 mb-4" />
                <p className="text-sm uppercase tracking-wide text-indigo-100 font-semibold mb-2">Core principle</p>
                <p className="text-2xl font-bold leading-tight mb-3">
                  A good plan tells you what to do next.
                </p>
                <p className="text-indigo-50 text-sm leading-relaxed">
                  It should reduce confusion, protect the basics, and move money toward goals in the right order.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 mb-10 border border-emerald-200">
            <h2 className="text-xl font-semibold text-emerald-900 mb-4 flex items-center gap-2">
              <TargetIcon className="w-6 h-6 text-emerald-600" />
              <span>After This Module, You Will:</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                "Create a clear snapshot of your current finances",
                "Set priorities between safety, debt, insurance, and investing",
                "Classify goals by short, medium, and long time horizons",
                "Understand when to save and when to invest",
                "Build a realistic monthly and 90-day money plan",
                "Use a final checklist to maintain your beginner roadmap"
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-emerald-800">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
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
              {financialPlanningLessons.map((lesson, index) => {
                const Icon = lessonIcons[index % lessonIcons.length];
                return (
                  <button
                    key={lesson.num}
                    onClick={() => navigate(`/learn/financial-planning-lesson-${lesson.num}`)}
                    className="w-full text-left bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-indigo-300 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${colors[index % colors.length]} rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
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
              <BalanceScaleIcon className="w-7 h-7 text-indigo-600 mb-3" />
              <h3 className="font-semibold text-indigo-900 mb-1">Priority-based</h3>
              <p className="text-sm text-indigo-700">Know what comes first, next, and later.</p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
              <WarningIcon className="w-7 h-7 text-amber-600 mb-3" />
              <h3 className="font-semibold text-amber-900 mb-1">Mistake-aware</h3>
              <p className="text-sm text-amber-700">Avoid common beginner traps and wrong product order.</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
              <CalculatorIcon className="w-7 h-7 text-emerald-600 mb-3" />
              <h3 className="font-semibold text-emerald-900 mb-1">Action-ready</h3>
              <p className="text-sm text-emerald-700">Leave with a 90-day plan and checklist.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-semibold mb-2 tracking-[-0.015em]">Ready to Build Your First Money Roadmap?</h3>
            <p className="text-indigo-100 mb-6">Start by understanding what financial planning really means.</p>
            <button
              onClick={() => navigate("/learn/financial-planning-lesson-1")}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
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

export default FinancialPlanningOverview;
