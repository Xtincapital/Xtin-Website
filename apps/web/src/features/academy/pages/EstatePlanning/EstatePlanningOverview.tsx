import React from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaPlay } from "react-icons/fa";
import {
  BankIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClipboardIcon,
  ClockIcon,
  HomeIcon,
  KeyIcon,
  LockIcon,
  ReceiptIcon,
  ShieldIcon,
  TargetIcon,
  WarningIcon
} from "../../components/LearningIcons";
import { estatePlanningLessons } from "./estatePlanningLessonData";
import ModuleBadge from "../../components/ModuleBadge";

const lessonIcons = [ShieldIcon, KeyIcon, ReceiptIcon, ClipboardIcon, BankIcon, LockIcon, HomeIcon, WarningIcon];
const colors = [
  "bg-brand-fill",
  "from-blue-500 to-indigo-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-violet-500 to-indigo-500",
  "from-slate-500 to-gray-600",
  "bg-brand-fill",
  "from-cyan-500 to-blue-500"
];

const EstatePlanningOverview = () => {
  const navigate = useNavigate();

  return (
    <div className="text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/learn")}
            className="flex items-center gap-2 text-gray-500 hover:text-brand transition-colors mb-8 group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span>Back to Learn</span>
          </button>

          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-4 py-1.5 text-white rounded-full text-sm font-semibold shadow-sm bg-brand-fill">
                Intermediate Module
              </span>
              <span className="px-3 py-1.5 bg-brand-soft text-brand rounded-full text-sm flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4" />
                12 Lessons
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm">
                ~135 min total
              </span>
              <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                Legal Awareness
              </span>
            </div>

            <div className="mb-3"><ModuleBadge moduleId="estate-planning" /></div>
<h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-sm bg-brand-soft">
                <ShieldIcon className="w-7 h-7 text-brand" />
              </span>
              <span>Estate Planning & Will Basics</span>
            </h1>
            <p className="text-lg text-gray-500">
              Learn how nominees, legal heirs, wills, joint ownership, insurance, property,
              and digital assets fit together so your family is not left guessing.
            </p>
          </div>

          <div className="rounded-3xl p-8 mb-10 border border-brand-line shadow-lg bg-brand-soft">
            <div className="grid md:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-[-0.015em]">Clarity is protection.</h2>
                <p className="text-gray-600 leading-relaxed mb-5">
                  Estate planning is not about fear. It is about making sure your family can find,
                  claim, transfer, and understand your assets without unnecessary disputes or delays.
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl p-4 border border-brand-line shadow-sm">
                    <ReceiptIcon className="w-6 h-6 text-amber-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Will basics</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-brand-line shadow-sm">
                    <KeyIcon className="w-6 h-6 text-blue-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Nominees</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-brand-line shadow-sm">
                    <LockIcon className="w-6 h-6 text-slate-600 mb-2" />
                    <p className="text-sm font-semibold text-gray-900">Digital access</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-6 text-white shadow-xl bg-brand-fill">
                <ShieldIcon className="w-12 h-12 text-white/90 mb-4" />
                <p className="text-sm uppercase tracking-wide text-white/85 font-semibold mb-2">Core principle</p>
                <p className="text-2xl font-bold leading-tight mb-3">
                  Make it clear. Keep it current. Tell the right people.
                </p>
                <p className="text-white/85 text-sm leading-relaxed">
                  This module is educational awareness only. Legal execution should be done with a
                  qualified lawyer or professional advisor.
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
                "Understand nominee vs legal heir",
                "Know what a simple will should include",
                "Use joint ownership and POA more carefully",
                "Connect insurance and property with inheritance",
                "Plan digital assets and passwords responsibly",
                "Use a practical estate planning checklist"
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
              <BookOpenIcon className="w-7 h-7 text-brand" />
              <span>Your Learning Path</span>
            </h2>

            <div className="space-y-4">
              {estatePlanningLessons.map((lesson, index) => {
                const Icon = lessonIcons[index % lessonIcons.length];
                return (
                  <button
                    key={lesson.num}
                    onClick={() => navigate(`/learn/estate-planning-lesson-${lesson.num}`)}
                    className="w-full text-left bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-brand-line hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${colors[index % colors.length]} rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-brand">LESSON {lesson.num}</span>
                          <span className="text-gray-300">-</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {lesson.duration}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg">{lesson.title}</h3>
                        <p className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: lesson.subtitle }} />
                      </div>
                      <div className="w-10 h-10 bg-brand-soft rounded-full flex items-center justify-center group-hover:bg-brand-hover transition-colors">
                        <FaPlay className="w-3 h-3 text-brand group-hover:text-white transition-colors ml-0.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <div className="bg-brand-soft rounded-2xl p-5 border border-brand-line">
              <ClipboardIcon className="w-7 h-7 text-brand mb-3" />
              <h3 className="font-semibold text-brand mb-1">Document aware</h3>
              <p className="text-sm text-brand">Know what papers family may need.</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
              <HomeIcon className="w-7 h-7 text-blue-600 mb-3" />
              <h3 className="font-semibold text-blue-900 mb-1">Asset connected</h3>
              <p className="text-sm text-blue-700">Property, insurance, investments, and digital assets.</p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
              <WarningIcon className="w-7 h-7 text-amber-600 mb-3" />
              <h3 className="font-semibold text-amber-900 mb-1">Dispute reducing</h3>
              <p className="text-sm text-amber-700">Avoid outdated nominees and hidden assets.</p>
            </div>
          </div>

          <div className="rounded-2xl p-8 text-white text-center bg-brand-fill">
            <h3 className="text-2xl font-bold mb-2 tracking-[-0.015em]">Ready to Protect Your Family With Clarity?</h3>
            <p className="text-white/85 mb-6">Start with why estate planning matters for ordinary families.</p>
            <button
              onClick={() => navigate("/learn/estate-planning-lesson-1")}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-brand rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
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

export default EstatePlanningOverview;
