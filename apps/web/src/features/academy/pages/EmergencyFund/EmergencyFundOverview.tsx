import React from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaPlay } from "react-icons/fa";
import {
  BankIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  CoinsIcon,
  KeyIcon,
  LightbulbIcon,
  PiggyBankIcon,
  ShieldIcon,
  TargetIcon,
  WalletIcon,
  WarningIcon
} from "../../components/LearningIcons";
import { emergencyFundLessons } from "./emergencyFundLessonData";
import ModuleBadge from "../../components/ModuleBadge";

const lessonIcons = [ShieldIcon, LightbulbIcon, TargetIcon, WalletIcon, BankIcon, CoinsIcon, KeyIcon, WarningIcon, PiggyBankIcon];
const colors = [
  "from-emerald-500 to-teal-500",
  "from-blue-500 to-cyan-500",
  "from-indigo-500 to-blue-500",
  "from-amber-500 to-orange-500",
  "from-green-500 to-emerald-500",
  "from-rose-500 to-pink-500",
  "from-cyan-500 to-blue-500",
  "from-violet-500 to-indigo-500"
];

const EmergencyFundOverview = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-white to-emerald-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/learn")}
            className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors mb-8 group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span>Back to Learn</span>
          </button>

          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-sm font-semibold shadow-sm">
                Beginner Module
              </span>
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4" />
                15 Lessons
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm">
                ~170 min total
              </span>
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Safety Net
              </span>
            </div>

            <div className="mb-3"><ModuleBadge moduleId="emergency-fund" /></div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-xl shadow-sm">
                <ShieldIcon className="w-7 h-7 text-emerald-600" />
              </span>
              <span>Emergency Fund & Financial Safety Net</span>
            </h1>
            <p className="text-lg text-gray-500">
              Build the first layer of financial security: how much to keep, where to keep it,
              when to use it, and how to rebuild it after life gets messy.
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-3xl p-8 mb-10 border border-emerald-100 shadow-lg">
            <div className="grid md:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Before wealth grows, safety must exist.</h2>
                <p className="text-gray-600 leading-relaxed mb-5">
                  This module teaches a practical system for emergency money. It is built for beginners
                  who want financial confidence before taking bigger investing risks.
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm">
                    <WalletIcon className="w-6 h-6 text-emerald-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Expense target</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm">
                    <BankIcon className="w-6 h-6 text-blue-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Safe storage</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm">
                    <KeyIcon className="w-6 h-6 text-amber-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Clear rules</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
                <ShieldIcon className="w-12 h-12 text-white/90 mb-4" />
                <p className="text-sm uppercase tracking-wide text-emerald-100 font-semibold mb-2">Core principle</p>
                <p className="text-2xl font-bold leading-tight mb-3">
                  Safety money should be easy to access and hard to misuse.
                </p>
                <p className="text-emerald-50 text-sm leading-relaxed">
                  The goal is calm decision-making when income, health, job, or family pressure changes suddenly.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-10 border border-blue-200">
            <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <TargetIcon className="w-6 h-6 text-blue-600" />
              <span>After This Module, You Will:</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                "Know your personal emergency fund target",
                "Separate essentials from lifestyle expenses",
                "Choose between savings account, FD, and liquid fund",
                "Define what counts as a true emergency",
                "Build safety plans for students, salaried people, and freelancers",
                "Use and rebuild the fund without guilt or confusion"
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-blue-800">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <BookOpenIcon className="w-7 h-7 text-emerald-600" />
              <span>Your Learning Path</span>
            </h2>

            <div className="space-y-4">
              {emergencyFundLessons.map((lesson, index) => {
                const Icon = lessonIcons[index % lessonIcons.length];
                return (
                  <button
                    key={lesson.num}
                    onClick={() => navigate(`/learn/emergency-fund-lesson-${lesson.num}`)}
                    className="w-full text-left bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-emerald-300 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${colors[index % colors.length]} rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-emerald-600">LESSON {lesson.num}</span>
                          <span className="text-gray-300">-</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {lesson.duration}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">{lesson.title}</h3>
                        <p className="text-sm text-gray-500">{lesson.subtitle}</p>
                      </div>
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                        <FaPlay className="w-3 h-3 text-emerald-600 group-hover:text-white transition-colors ml-0.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
              <PiggyBankIcon className="w-7 h-7 text-emerald-600 mb-3" />
              <h3 className="font-bold text-emerald-900 mb-1">Beginner first</h3>
              <p className="text-sm text-emerald-700">Simple rules before advanced products.</p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
              <WarningIcon className="w-7 h-7 text-amber-600 mb-3" />
              <h3 className="font-bold text-amber-900 mb-1">Misuse proof</h3>
              <p className="text-sm text-amber-700">Clear boundaries for what counts as emergency.</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
              <CoinsIcon className="w-7 h-7 text-blue-600 mb-3" />
              <h3 className="font-bold text-blue-900 mb-1">Cash-flow calm</h3>
              <p className="text-sm text-blue-700">Reduce panic borrowing during hard months.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-2">Ready to Build Your Safety Net?</h3>
            <p className="text-emerald-100 mb-6">Start with the simple idea: emergency money protects your plan.</p>
            <button
              onClick={() => navigate("/learn/emergency-fund-lesson-1")}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
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

export default EmergencyFundOverview;
