import React from "react";
import { ChartBarIcon, ClipboardIcon, ClockIcon, CoinsIcon, GrowthIcon, PercentIcon, PiggyBankIcon } from "../../components/LearningIcons";
import StudyLesson from "../../components/StudyLesson";
import { retirementLessons } from "./retirementLessonData";

const icons = [ClockIcon, CoinsIcon, PiggyBankIcon, ChartBarIcon, GrowthIcon, PercentIcon, ClipboardIcon];

const RetirementLessonPage = ({ lessonNumber }) => (
  <StudyLesson lessons={retirementLessons} lessonNumber={lessonNumber} moduleId="retirement-planning" icons={icons} />
);

export default RetirementLessonPage;
