import React from "react";
import { BankIcon, BookOpenIcon, ChartBarIcon, CheckCircleIcon, GrowthIcon, KeyIcon, LockIcon, ShieldIcon, TargetIcon, WarningIcon } from "../../components/LearningIcons";
import StudyLesson from "../../components/StudyLesson";
import { cryptoLessons } from "./cryptoLessonData";

const icons = [ShieldIcon, ChartBarIcon, GrowthIcon, BankIcon, KeyIcon, LockIcon, BankIcon, ShieldIcon, ChartBarIcon, GrowthIcon, BookOpenIcon, WarningIcon, BankIcon, TargetIcon, CheckCircleIcon];

const CryptoLessonPage = ({ lessonNumber }) => (
  <StudyLesson lessons={cryptoLessons} lessonNumber={lessonNumber} moduleId="crypto" icons={icons} />
);

export default CryptoLessonPage;
