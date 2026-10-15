import React from "react";
import { BankIcon, CheckCircleIcon, CoinsIcon, DocumentCheckIcon, KeyIcon, LightbulbIcon, PiggyBankIcon, ShieldIcon, TargetIcon, WalletIcon, WarningIcon } from "../../components/LearningIcons";
import StudyLesson from "../../components/StudyLesson";
import { emergencyFundLessons } from "./emergencyFundLessonData";

function CalculatorSafeIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <rect x="6" y="5" width="20" height="22" rx="3" className="fill-current opacity-20 stroke-current" strokeWidth="2" />
      <path d="M10 11H22M11 16H13M16 16H18M21 16H23M11 21H13M16 21H18M21 21H23" className="stroke-current" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

const icons = [ShieldIcon, LightbulbIcon, CalculatorSafeIcon, TargetIcon, WalletIcon, BankIcon, CoinsIcon, KeyIcon, WarningIcon, PiggyBankIcon, WalletIcon, BankIcon, TargetIcon, DocumentCheckIcon, CheckCircleIcon];

const EmergencyFundLessonPage = ({ lessonNumber }) => (
  <StudyLesson lessons={emergencyFundLessons} lessonNumber={lessonNumber} moduleId="emergency-fund" icons={icons} />
);

export default EmergencyFundLessonPage;
