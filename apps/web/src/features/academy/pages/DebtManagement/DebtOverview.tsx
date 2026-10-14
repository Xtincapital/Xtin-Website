import React from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaPlay } from "react-icons/fa";
import {
  BalanceScaleIcon,
  BankIcon,
  BookOpenIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CoinsIcon,
  CreditCardIcon,
  KeyIcon,
  PercentIcon,
  ReceiptIcon,
  TargetIcon,
  WarningIcon
} from "../../components/LearningIcons";
import { debtLessons } from "./debtLessonData";
import ModuleBadge from "../../components/ModuleBadge";

const lessonIcons = [CoinsIcon, BalanceScaleIcon, ChartBarIcon, CreditCardIcon, WarningIcon, BankIcon, PercentIcon, TargetIcon];
const colors = [
  "from-blue-500 to-cyan-500",
  "bg-brand-fill",
  "from-indigo-500 to-blue-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-violet-500 to-indigo-500",
  "from-cyan-500 to-blue-500",
  "bg-brand-fill"
];

const DebtOverview = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-blue-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/learn")}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span>Back to Learn</span>
          </button>

          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-4 py-1.5 text-white rounded-full text-sm font-semibold shadow-sm bg-brand-fill">
                Intermediate Module
              </span>
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4" />
                15 Lessons
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm">
                ~180 min total
              </span>
              <span className="px-3 py-1.5 bg-brand-soft text-brand rounded-full text-sm font-medium">
                Credit Control
              </span>
            </div>

            <div className="mb-3"><ModuleBadge moduleId="debt-management" /></div>

            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-xl shadow-sm">
                <CreditCardIcon className="w-7 h-7 text-blue-600" />
              </span>
              <span>Debt Management & Credit Score</span>
            </h1>
            <p className="text-lg text-gray-500">
              Learn how debt works, how credit scores are built, how cards and EMIs can trap you,
              and how to borrow or repay with control instead of stress.
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 mb-10 border border-blue-100 shadow-lg">
            <div className="grid md:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-[-0.015em]">Debt is not shame. Debt needs a system.</h2>
                <p className="text-gray-600 leading-relaxed mb-5">
                  This module is designed to make debt visible, understandable, and manageable.
                  The tone is practical: no guilt, no judgment, only better control.
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
                    <ChartBarIcon className="w-6 h-6 text-indigo-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Credit score</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
                    <CreditCardIcon className="w-6 h-6 text-rose-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Card traps</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
                    <BankIcon className="w-6 h-6 text-brand mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Loan strategy</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-6 text-white shadow-xl bg-brand-fill">
                <BalanceScaleIcon className="w-12 h-12 text-white/90 mb-4" />
                <p className="text-sm uppercase tracking-wide text-blue-100 font-semibold mb-2">Core principle</p>
                <p className="text-2xl font-bold leading-tight mb-3">
                  Borrow only when the future can carry it.
                </p>
                <p className="text-blue-50 text-sm leading-relaxed">
                  Debt should support life goals, not quietly consume every future paycheck.
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
                "Understand good debt, bad debt, and future income pressure",
                "Know how credit scores and reports work in India",
                "Use credit cards without falling into minimum-due traps",
                "Compare EMI, flat rate, reducing balance, and total loan cost",
                "Build a debt payoff plan using snowball or avalanche",
                "Use a final debt safety checklist before borrowing"
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-amber-800">
                  <CheckCircleIcon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 tracking-[-0.015em]">
              <BookOpenIcon className="w-7 h-7 text-blue-600" />
              <span>Your Learning Path</span>
            </h2>

            <div className="space-y-4">
              {debtLessons.map((lesson, index) => {
                const Icon = lessonIcons[index % lessonIcons.length];
                return (
                  <button
                    key={lesson.num}
                    onClick={() => navigate(`/learn/debt-management-lesson-${lesson.num}`)}
                    className="w-full text-left bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${colors[index % colors.length]} rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-blue-600">LESSON {lesson.num}</span>
                          <span className="text-gray-300">-</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {lesson.duration}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg">{lesson.title}</h3>
                        <p className="text-sm text-gray-500">{lesson.subtitle}</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                        <FaPlay className="w-3 h-3 text-blue-600 group-hover:text-white transition-colors ml-0.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
              <PercentIcon className="w-7 h-7 text-blue-600 mb-3" />
              <h3 className="font-semibold text-blue-900 mb-1">Cost aware</h3>
              <p className="text-sm text-blue-700">Look beyond EMI to total repayment.</p>
            </div>
            <div className="bg-rose-50 rounded-2xl p-5 border border-rose-200">
              <WarningIcon className="w-7 h-7 text-rose-600 mb-3" />
              <h3 className="font-semibold text-rose-900 mb-1">Trap aware</h3>
              <p className="text-sm text-rose-700">BNPL, app loans, and minimum-due cycles.</p>
            </div>
            <div className="bg-brand-soft rounded-2xl p-5 border border-brand-line">
              <KeyIcon className="w-7 h-7 text-brand mb-3" />
              <h3 className="font-semibold text-brand mb-1">Action focused</h3>
              <p className="text-sm text-brand">List, prioritize, repay, and rebuild credit.</p>
            </div>
          </div>

          <div className="rounded-2xl p-8 text-white text-center bg-brand-fill">
            <h3 className="text-2xl font-bold mb-2 tracking-[-0.015em]">Ready to Take Control of Debt?</h3>
            <p className="text-blue-100 mb-6">Start with what debt really is: borrowing future income.</p>
            <button
              onClick={() => navigate("/learn/debt-management-lesson-1")}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
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

export default DebtOverview;
