import React from "react";
import { BankIcon, BookOpenIcon, ChartBarIcon, CheckCircleIcon, ClipboardIcon, CoinsIcon, GrowthIcon, HomeIcon, KeyIcon, ReceiptIcon } from "../../components/LearningIcons";
import StudyLesson from "../../components/StudyLesson";
import { realEstateLessons } from "./realEstateLessonData";

const icons = [HomeIcon, KeyIcon, BankIcon, CoinsIcon, ReceiptIcon, ClipboardIcon, BookOpenIcon, GrowthIcon, ChartBarIcon, CheckCircleIcon];

const RealEstateLessonPage = ({ lessonNumber }) => (
  <StudyLesson lessons={realEstateLessons} lessonNumber={lessonNumber} moduleId="real-estate" icons={icons} />
);

export default RealEstateLessonPage;
