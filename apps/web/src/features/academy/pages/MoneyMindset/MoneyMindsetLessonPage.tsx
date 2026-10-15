import React from "react";
import { BalanceScaleIcon, BookOpenIcon, BrainIcon, CheckCircleIcon, ClockIcon, HeartIcon, KeyIcon, LightbulbIcon, PiggyBankIcon, ShieldIcon, TargetIcon, WalletIcon, WarningIcon } from "../../components/LearningIcons";
import StudyLesson from "../../components/StudyLesson";
import { moneyMindsetLessons } from "./moneyMindsetLessonData";

const icons = [BrainIcon, BalanceScaleIcon, WarningIcon, TargetIcon, HeartIcon, ClockIcon, PiggyBankIcon, ShieldIcon, LightbulbIcon, HeartIcon, WalletIcon, BalanceScaleIcon, KeyIcon, BookOpenIcon, CheckCircleIcon];

const MoneyMindsetLessonPage = ({ lessonNumber }) => (
  <StudyLesson lessons={moneyMindsetLessons} lessonNumber={lessonNumber} moduleId="money-mindset" icons={icons} topic="Habit Building" />
);

export default MoneyMindsetLessonPage;
