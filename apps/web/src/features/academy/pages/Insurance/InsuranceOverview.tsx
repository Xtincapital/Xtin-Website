import React from "react";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaPlay } from "react-icons/fa";
import { ShieldIcon, TargetIcon, CheckCircleIcon, BookOpenIcon, ClockIcon, MedicalIcon, HeartIcon, WarningIcon, ClipboardIcon, CoinsIcon, KeyIcon } from "../../components/LearningIcons";
import { insuranceLessons } from "./insuranceLessonData";

const lessonIcons = [ShieldIcon, MedicalIcon, HeartIcon, WarningIcon, ClipboardIcon, CoinsIcon, CheckCircleIcon];
const colors = ["from-emerald-500 to-teal-500", "from-rose-500 to-pink-500", "from-blue-500 to-indigo-500", "from-amber-500 to-orange-500", "from-cyan-500 to-blue-500", "from-teal-500 to-emerald-500", "from-green-500 to-emerald-500"];

const InsuranceOverview = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-gradient-to-b from-white to-emerald-50/30 text-gray-900 min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate("/learn")} className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors mb-8 group"><FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" /><span>Back to Learn</span></button>
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4"><span className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-sm font-semibold shadow-sm">Beginner Module</span><span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm flex items-center gap-1.5"><ClockIcon className="w-4 h-4" />7 Lessons</span><span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm">~65 min total</span><span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">Protection First</span></div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3"><span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-xl shadow-sm"><ShieldIcon className="w-7 h-7 text-emerald-600" /></span><span>Insurance Deep Dive</span></h1>
            <p className="text-lg text-gray-500">Learn how to protect your family, health, and money before chasing bigger returns. This module keeps insurance practical, simple, and India-focused.</p>
          </div>
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-3xl p-8 mb-10 border border-emerald-100 shadow-lg">
            <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
              <div><h2 className="text-2xl font-bold text-gray-900 mb-4">Insurance is not a return product.</h2><p className="text-gray-600 leading-relaxed mb-5">It is a financial shock absorber. A good policy helps you avoid selling investments, taking expensive loans, or depending on family during an emergency.</p><div className="grid sm:grid-cols-3 gap-3"><div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm"><MedicalIcon className="w-6 h-6 text-rose-600 mb-2" /><p className="text-sm font-semibold text-gray-900">Health cover</p></div><div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm"><HeartIcon className="w-6 h-6 text-blue-600 mb-2" /><p className="text-sm font-semibold text-gray-900">Term life</p></div><div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm"><ClipboardIcon className="w-6 h-6 text-teal-600 mb-2" /><p className="text-sm font-semibold text-gray-900">Policy clarity</p></div></div></div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl"><ShieldIcon className="w-12 h-12 text-white/90 mb-4" /><p className="text-sm uppercase tracking-wide text-emerald-100 font-semibold mb-2">Core principle</p><p className="text-2xl font-bold leading-tight mb-3">Protect first. Invest second.</p><p className="text-emerald-50 text-sm leading-relaxed">Transfer the big risks you cannot comfortably pay for yourself.</p></div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-10 border border-amber-200"><h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2"><TargetIcon className="w-6 h-6 text-amber-600" />After This Module, You Will:</h2><div className="grid md:grid-cols-2 gap-3">{["Know why insurance is protection, not investment", "Understand health insurance terms", "Calculate when term life is needed", "Spot common policy traps", "Read policy documents with more confidence", "Use a checklist before choosing cover"].map((item) => <div key={item} className="flex items-start gap-3 text-amber-800"><CheckCircleIcon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" /><span>{item}</span></div>)}</div></div>
          <div className="mb-10"><h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"><BookOpenIcon className="w-7 h-7 text-emerald-600" />Your Learning Path</h2><div className="space-y-4">{insuranceLessons.map((lesson, index) => { const Icon = lessonIcons[index]; return <button key={lesson.num} onClick={() => navigate(`/learn/insurance-lesson-${lesson.num}`)} className="w-full text-left bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-emerald-300 hover:shadow-lg transition-all group"><div className="flex items-center gap-4"><div className={`w-14 h-14 bg-gradient-to-br ${colors[index]} rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}><Icon className="w-7 h-7 text-white" /></div><div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="text-xs font-semibold text-emerald-600">LESSON {lesson.num}</span><span className="text-gray-300">-</span><span className="text-xs text-gray-500 flex items-center gap-1"><ClockIcon className="w-3 h-3" />{lesson.duration}</span></div><h3 className="font-bold text-gray-900 text-lg">{lesson.title}</h3><p className="text-sm text-gray-500">{lesson.subtitle}</p></div><div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-500 transition-colors"><FaPlay className="w-3 h-3 text-emerald-600 group-hover:text-white transition-colors ml-0.5" /></div></div></button>; })}</div></div>
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white text-center"><h3 className="text-2xl font-bold mb-2">Ready to Build Your Safety Net?</h3><p className="text-emerald-100 mb-6">Start with what insurance is really for.</p><button onClick={() => navigate("/learn/insurance-lesson-1")} className="inline-flex items-center gap-2 px-8 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"><FaPlay className="w-3 h-3" /><span>Start Lesson 1</span><FaArrowRight className="w-3 h-3" /></button></div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InsuranceOverview;
