import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import {
  BankIcon,
  BookOpenIcon,
  BrainIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  GrowthIcon,
  KeyIcon,
  LockIcon,
  ShieldIcon,
  TargetIcon,
  WarningIcon
} from "../../components/LearningIcons";
import { cryptoLessons } from "./cryptoLessonData";
import ModuleBadge from "../../components/ModuleBadge";

const lessonIcons = [
  ShieldIcon,
  ChartBarIcon,
  GrowthIcon,
  BankIcon,
  KeyIcon,
  LockIcon,
  BankIcon,
  ShieldIcon,
  ChartBarIcon,
  GrowthIcon,
  BookOpenIcon,
  WarningIcon,
  BankIcon,
  TargetIcon,
  CheckCircleIcon
];

const calloutStyles = {
  principle: {
    box: "bg-yellow-50 border-yellow-200",
    title: "text-yellow-800",
    text: "text-yellow-700",
    icon: KeyIcon
  },
  warning: {
    box: "bg-red-50 border-red-200",
    title: "text-red-800",
    text: "text-red-700",
    icon: WarningIcon
  }
};

const CryptoLessonPage = ({ lessonNumber }) => {
  const navigate = useNavigate();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const lesson = cryptoLessons.find((item) => item.num === lessonNumber) || cryptoLessons[0];
  const LessonIcon = lessonIcons[lesson.num - 1] || ShieldIcon;
  const answered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === lesson.quiz.correct;
  const previousPath = lesson.num === 1 ? "/learn/crypto" : `/learn/crypto-lesson-${lesson.num - 1}`;
  const nextPath = lesson.num === cryptoLessons.length ? "/learn/crypto" : `/learn/crypto-lesson-${lesson.num + 1}`;

  return (
    <div className="bg-gradient-to-b from-white to-yellow-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate("/learn/crypto")}
            className="flex items-center gap-2 text-gray-500 hover:text-yellow-700 transition-colors mb-8 group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span>Back to Module</span>
          </button>

          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {lesson.num === 1 && <ModuleBadge moduleId="crypto" />}
              <span className="px-4 py-1.5 text-white rounded-full text-sm font-semibold shadow-sm bg-brand-fill">
                Lesson {lesson.num} of {cryptoLessons.length}
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm">
                {lesson.duration} read
              </span>
              <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                Risk Awareness
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.025em]">
              <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-xl shadow-sm">
                <LessonIcon className="w-7 h-7 text-yellow-700" />
              </span>
              <span>{lesson.title}</span>
            </h1>
            <p className="text-lg text-gray-500">{lesson.subtitle}</p>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-6 mb-10 border border-yellow-200 shadow-sm">
            <h2 className="font-semibold text-yellow-900 mb-4 flex items-center gap-3">
              <TargetIcon className="w-5 h-5 text-yellow-700" />
              <span>After this lesson, you will know:</span>
            </h2>
            <ul className="space-y-3">
              {lesson.objectives.map((objective) => (
                <li key={objective} className="flex items-start gap-3 text-yellow-900">
                  <CheckCircleIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
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
                  <p key={paragraph} className="text-gray-600 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}

                {section.bullets && (
                  <div className="grid gap-3 my-6">
                    {section.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-yellow-100 shadow-sm">
                        <CheckCircleIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
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

          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-200 shadow-sm mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BrainIcon className="w-6 h-6 text-yellow-700" />
              <span>Quick Check</span>
            </h2>
            <p className="font-semibold text-gray-900 mb-4">{lesson.quiz.question}</p>
            <div className="space-y-3">
              {lesson.quiz.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectOption = lesson.quiz.correct === index;
                let stateClass = "bg-white border-gray-200 hover:bg-yellow-50 hover:border-yellow-300";
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
                            : "bg-yellow-100 text-yellow-800"
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
            <p className="text-yellow-50 leading-relaxed">{lesson.takeaway}</p>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-8 border-t border-gray-200">
            <button
              onClick={() => navigate(previousPath)}
              className="flex items-center justify-center gap-2 px-6 py-3 text-gray-600 hover:text-yellow-700 transition-colors group"
            >
              <FaArrowLeft />
              <span>{lesson.num === 1 ? "Module Overview" : `Lesson ${lesson.num - 1}`}</span>
            </button>
            <button
              onClick={() => navigate(nextPath)}
              className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all bg-brand-fill"
            >
              <span>{lesson.num === cryptoLessons.length ? "Finish Module" : `Next: Lesson ${lesson.num + 1}`}</span>
              <FaArrowRight />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CryptoLessonPage;
