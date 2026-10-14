import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import {
  BankIcon,
  BookOpenIcon,
  BrainIcon,
  CheckCircleIcon,
  ClockIcon,
  CoinsIcon,
  DocumentCheckIcon,
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

const lessonIcons = [
  ShieldIcon,
  LightbulbIcon,
  CalculatorSafeIcon,
  TargetIcon,
  WalletIcon,
  BankIcon,
  CoinsIcon,
  KeyIcon,
  WarningIcon,
  PiggyBankIcon,
  WalletIcon,
  BankIcon,
  TargetIcon,
  DocumentCheckIcon,
  CheckCircleIcon
];

const calloutStyles = {
  principle: {
    box: "bg-brand-soft border-brand-line",
    title: "text-brand",
    text: "text-brand",
    icon: KeyIcon
  },
  warning: {
    box: "bg-amber-50 border-amber-200",
    title: "text-amber-800",
    text: "text-amber-700",
    icon: WarningIcon
  }
};

function CalculatorSafeIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect x="6" y="5" width="20" height="22" rx="3" className="fill-current opacity-20 stroke-current" strokeWidth="2" />
      <path d="M10 11H22M11 16H13M16 16H18M21 16H23M11 21H13M16 21H18M21 21H23" className="stroke-current" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

const EmergencyFundLessonPage = ({ lessonNumber }) => {
  const navigate = useNavigate();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const lesson = emergencyFundLessons.find((item) => item.num === lessonNumber) || emergencyFundLessons[0];
  const LessonIcon = lessonIcons[lesson.num - 1] || ShieldIcon;
  const answered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === lesson.quiz.correct;
  const previousPath = lesson.num === 1 ? "/learn/emergency-fund" : `/learn/emergency-fund-lesson-${lesson.num - 1}`;
  const nextPath = lesson.num === emergencyFundLessons.length ? "/learn/emergency-fund" : `/learn/emergency-fund-lesson-${lesson.num + 1}`;

  return (
    <div className="text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate("/learn/emergency-fund")}
            className="flex items-center gap-2 text-gray-500 hover:text-brand transition-colors mb-8 group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span>Back to Module</span>
          </button>

          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {lesson.num === 1 && <ModuleBadge moduleId="emergency-fund" />}
              <span className="px-4 py-1.5 text-white rounded-full text-sm font-semibold shadow-sm bg-brand-fill">
                Lesson {lesson.num} of {emergencyFundLessons.length}
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm">
                {lesson.duration} read
              </span>
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Beginner Safety
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-sm bg-brand-soft">
                <LessonIcon className="w-7 h-7 text-brand" />
              </span>
              <span>{lesson.title}</span>
            </h1>
            <p className="text-lg text-gray-500">{lesson.subtitle}</p>
          </div>

          <div className="rounded-2xl p-6 mb-10 border border-brand-line shadow-sm bg-brand-soft">
            <h2 className="font-semibold text-brand mb-4 flex items-center gap-3">
              <TargetIcon className="w-5 h-5 text-brand" />
              <span>After this lesson, you will know:</span>
            </h2>
            <ul className="space-y-3">
              {lesson.objectives.map((objective) => (
                <li key={objective} className="flex items-start gap-3 text-brand">
                  <CheckCircleIcon className="w-5 h-5 text-brand mt-0.5 flex-shrink-0" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-10">
            {lesson.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-[-0.025em]">{section.heading}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-gray-600 leading-relaxed mb-4">{paragraph}</p>
                ))}
                {section.bullets && (
                  <div className="grid gap-3 my-6">
                    {section.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-brand-line shadow-sm">
                        <CheckCircleIcon className="w-5 h-5 text-brand mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
                {section.callout && (() => {
                  const style = calloutStyles[section.callout.type] || calloutStyles.principle;
                  const Icon = style.icon;
                  return (
                    <div className={`${style.box} rounded-xl p-5 mt-6 border`}>
                      <h4 className={`font-bold ${style.title} mb-2 flex items-center gap-2`}>
                        <Icon className="w-5 h-5" />
                        {section.callout.title}
                      </h4>
                      <p className={`${style.text} leading-relaxed`}>{section.callout.text}</p>
                    </div>
                  );
                })()}
              </section>
            ))}
          </div>

          <div className="rounded-2xl p-6 border border-brand-line shadow-sm mt-12 bg-brand-soft">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BrainIcon className="w-6 h-6 text-brand" />
              <span>Quick Check</span>
            </h2>
            <p className="font-semibold text-gray-900 mb-4">{lesson.quiz.question}</p>
            <div className="space-y-3">
              {lesson.quiz.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectOption = lesson.quiz.correct === index;
                let stateClass = "bg-white border-gray-200 hover:bg-brand-soft hover:border-brand-line";
                if (answered && isCorrectOption) stateClass = "bg-brand-soft border-brand";
                if (answered && isSelected && !isCorrectOption) stateClass = "bg-red-50 border-red-400";
                return (
                  <button
                    key={option}
                    onClick={() => !answered && setSelectedAnswer(index)}
                    disabled={answered}
                    className={`w-full text-left p-4 rounded-xl border-2 ${stateClass} transition-all`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                        answered && isCorrectOption
                          ? "bg-brand-fill text-white"
                          : answered && isSelected
                            ? "bg-red-500 text-white"
                            : "bg-brand-soft text-brand"
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-700 flex-1">{option}</span>
                      {answered && isCorrectOption && <FaCheckCircle className="text-brand text-lg" />}
                      {answered && isSelected && !isCorrectOption && <FaTimesCircle className="text-red-500 text-lg" />}
                    </span>
                  </button>
                );
              })}
            </div>
            {answered && (
              <div className={`mt-4 p-4 rounded-xl ${isCorrect ? "bg-brand-soft text-brand border border-brand-line" : "bg-amber-100 text-amber-800 border border-amber-200"}`}>
                <p className="font-semibold">{isCorrect ? "Correct" : "Not quite"}</p>
                <p className="text-sm mt-1 opacity-90">{lesson.quiz.explanation}</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl p-6 mt-10 text-white bg-brand-fill">
            <h2 className="font-semibold text-xl mb-3 flex items-center gap-2">
              <BookOpenIcon className="w-6 h-6" />
              Key Takeaway
            </h2>
            <p className="text-white/85 leading-relaxed">{lesson.takeaway}</p>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-8 border-t border-gray-200">
            <button
              onClick={() => navigate(previousPath)}
              className="flex items-center justify-center gap-2 px-6 py-3 text-gray-600 hover:text-brand transition-colors group"
            >
              <FaArrowLeft />
              <span>{lesson.num === 1 ? "Module Overview" : `Lesson ${lesson.num - 1}`}</span>
            </button>
            <button
              onClick={() => navigate(nextPath)}
              className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all bg-brand-fill"
            >
              <span>{lesson.num === emergencyFundLessons.length ? "Finish Module" : `Next: Lesson ${lesson.num + 1}`}</span>
              <FaArrowRight />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EmergencyFundLessonPage;
