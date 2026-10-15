import React from "react";
import { BalanceScaleIcon, BankIcon, BookOpenIcon, ChartBarIcon, CheckCircleIcon, CoinsIcon, CreditCardIcon, KeyIcon, PercentIcon, ReceiptIcon, TargetIcon, WarningIcon } from "../../components/LearningIcons";
import StudyLesson from "../../components/StudyLesson";
import { debtLessons } from "./debtLessonData";

const icons = [CoinsIcon, BalanceScaleIcon, ChartBarIcon, TargetIcon, CreditCardIcon, WarningIcon, BankIcon, PercentIcon, ReceiptIcon, KeyIcon, WarningIcon, TargetIcon, BookOpenIcon, BankIcon, CheckCircleIcon];

const DebtLessonPage = ({ lessonNumber }) => (
  <StudyLesson lessons={debtLessons} lessonNumber={lessonNumber} moduleId="debt-management" icons={icons} />
);

export default DebtLessonPage;
