import React, { useState } from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { ClockIcon, TargetIcon, CheckCircleIcon, BookOpenIcon, BrainIcon, KeyIcon, WarningIcon, CoinsIcon, PiggyBankIcon, ChartBarIcon, GrowthIcon, PercentIcon, ClipboardIcon } from "../../components/LearningIcons";
import { retirementLessons } from "./retirementLessonData";
import ModuleBadge from "../../components/ModuleBadge";

const icons = [ClockIcon, CoinsIcon, PiggyBankIcon, ChartBarIcon, GrowthIcon, PercentIcon, ClipboardIcon];
const styles = {
  principle: { box: "bg-rose-50 border-rose-200", title: "text-rose-800", text: "text-rose-700", icon: KeyIcon },
  warning: { box: "bg-amber-50 border-amber-200", title: "text-amber-800", text: "text-amber-700", icon: WarningIcon }
};

const RetirementLessonPage = ({ lessonNumber }) => {
  const navigate = useNavigate();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const lesson = retirementLessons.find((item) => item.num === lessonNumber) || retirementLessons[0];
  const LessonIcon = icons[lesson.num - 1] || ClockIcon;
  const answered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === lesson.quiz.correct;
  const previousPath = lesson.num === 1 ? "/learn/retirement-planning" : `/learn/retirement-planning-lesson-${lesson.num - 1}`;
  const nextPath = lesson.num === retirementLessons.length ? "/learn/retirement-planning" : `/learn/retirement-planning-lesson-${lesson.num + 1}`;

  return (
    <div className="bg-gradient-to-b from-white to-rose-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => navigate("/learn/retirement-planning")} className="flex items-center gap-2 text-gray-500 hover:text-rose-600 transition-colors mb-8 group"><FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" /><span>Back to Module</span></button>
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">{lesson.num === 1 && <ModuleBadge moduleId="retirement-planning" />}<span className="px-4 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full text-sm font-semibold shadow-sm">Lesson {lesson.num} of {retirementLessons.length}</span><span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm">{lesson.duration} read</span></div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 flex items-center gap-3 tracking-[-0.025em]"><span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-200 rounded-xl shadow-sm"><LessonIcon className="w-7 h-7 text-rose-600" /></span><span>{lesson.title}</span></h1>
            <p className="text-lg text-gray-500">{lesson.subtitle}</p>
          </div>
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 mb-10 border border-rose-200 shadow-sm"><h2 className="font-semibold text-rose-900 mb-4 flex items-center gap-3"><TargetIcon className="w-5 h-5 text-rose-600" />After this lesson, you will know:</h2><ul className="space-y-3">{lesson.objectives.map((item) => <li key={item} className="flex items-start gap-3 text-rose-800"><CheckCircleIcon className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" /><span>{item}</span></li>)}</ul></div>
          <div className="space-y-10">{lesson.sections.map((section) => <section key={section.heading}><h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-[-0.025em]">{section.heading}</h2>{section.body.map((paragraph) => <p key={paragraph} className="text-gray-600 leading-relaxed mb-4">{paragraph}</p>)}{section.bullets && <div className="grid gap-3 my-6">{section.bullets.map((bullet) => <div key={bullet} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-rose-100 shadow-sm"><CheckCircleIcon className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" /><span className="text-gray-700">{bullet}</span></div>)}</div>}{section.callout && (() => { const style = styles[section.callout.type] || styles.principle; const Icon = style.icon; return <div className={`${style.box} rounded-xl p-5 mt-6 border`}><h4 className={`font-bold ${style.title} mb-2 flex items-center gap-2`}><Icon className="w-5 h-5" />{section.callout.title}</h4><p className={`${style.text} leading-relaxed`}>{section.callout.text}</p></div>; })()}</section>)}</div>
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-200 shadow-sm mt-12"><h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"><BrainIcon className="w-6 h-6 text-rose-600" />Quick Check</h2><p className="font-semibold text-gray-900 mb-4">{lesson.quiz.question}</p><div className="space-y-3">{lesson.quiz.options.map((option, index) => { const isSelected = selectedAnswer === index; const isCorrectOption = lesson.quiz.correct === index; let stateClass = "bg-white border-gray-200 hover:bg-rose-50 hover:border-rose-300"; if (answered && isCorrectOption) stateClass = "bg-brand-soft border-brand"; if (answered && isSelected && !isCorrectOption) stateClass = "bg-red-50 border-red-400"; return <button key={option} onClick={() => !answered && setSelectedAnswer(index)} disabled={answered} className={`w-full text-left p-4 rounded-xl border-2 ${stateClass} transition-all`}><span className="flex items-center gap-3"><span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${answered && isCorrectOption ? "bg-brand-fill text-white" : answered && isSelected ? "bg-red-500 text-white" : "bg-rose-100 text-rose-700"}`}>{String.fromCharCode(65 + index)}</span><span className="text-gray-700 flex-1">{option}</span>{answered && isCorrectOption && <FaCheckCircle className="text-brand text-lg" />}{answered && isSelected && !isCorrectOption && <FaTimesCircle className="text-red-500 text-lg" />}</span></button>; })}</div>{answered && <div className={`mt-4 p-4 rounded-xl ${isCorrect ? "bg-brand-soft text-brand border border-brand-line" : "bg-amber-100 text-amber-800 border border-amber-200"}`}><p className="font-semibold">{isCorrect ? "Correct" : "Not quite"}</p><p className="text-sm mt-1 opacity-90">{lesson.quiz.explanation}</p></div>}</div>
          <div className="bg-gradient-to-r from-rose-500 to-indigo-600 rounded-2xl p-6 mt-10 text-white"><h2 className="font-semibold text-xl mb-3 flex items-center gap-2"><BookOpenIcon className="w-6 h-6" />Key Takeaway</h2><p className="text-rose-50 leading-relaxed">{lesson.takeaway}</p></div>
          <div className="mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-8 border-t border-gray-200"><button onClick={() => navigate(previousPath)} className="flex items-center justify-center gap-2 px-6 py-3 text-gray-600 hover:text-rose-600 transition-colors group"><FaArrowLeft /><span>{lesson.num === 1 ? "Module Overview" : `Lesson ${lesson.num - 1}`}</span></button><button onClick={() => navigate(nextPath)} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"><span>{lesson.num === retirementLessons.length ? "Finish Module" : `Next: Lesson ${lesson.num + 1}`}</span><FaArrowRight /></button></div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RetirementLessonPage;
