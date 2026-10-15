import React from "react";
import { BalanceScaleIcon, BankIcon, CalculatorIcon, CheckCircleIcon, ClockIcon, DocumentCheckIcon, KeyIcon, LightbulbIcon, PiggyBankIcon, ShieldIcon, TargetIcon, WalletIcon, WarningIcon } from "../../components/LearningIcons";
import StudyLesson from "../../components/StudyLesson";
import { financialPlanningLessons } from "./financialPlanningLessonData";

const icons = [TargetIcon, WalletIcon, BalanceScaleIcon, KeyIcon, ShieldIcon, BankIcon, ShieldIcon, ClockIcon, PiggyBankIcon, CalculatorIcon, DocumentCheckIcon, LightbulbIcon, WarningIcon, TargetIcon, CheckCircleIcon];

const FinancialPlanningLessonPage = ({ lessonNumber }) => (
  <StudyLesson lessons={financialPlanningLessons} lessonNumber={lessonNumber} moduleId="financial-planning" icons={icons} />
);

export default FinancialPlanningLessonPage;
