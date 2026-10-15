import React from "react";
import { BankIcon, BookOpenIcon, CheckCircleIcon, ClipboardIcon, HeartIcon, HomeIcon, KeyIcon, LockIcon, ReceiptIcon, ShieldIcon, WarningIcon } from "../../components/LearningIcons";
import StudyLesson from "../../components/StudyLesson";
import { estatePlanningLessons } from "./estatePlanningLessonData";

const icons = [ShieldIcon, KeyIcon, ReceiptIcon, ClipboardIcon, BankIcon, LockIcon, HeartIcon, HomeIcon, LockIcon, BookOpenIcon, WarningIcon, CheckCircleIcon];

const EstatePlanningLessonPage = ({ lessonNumber }) => (
  <StudyLesson lessons={estatePlanningLessons} lessonNumber={lessonNumber} moduleId="estate-planning" icons={icons} topic="Legal Awareness" />
);

export default EstatePlanningLessonPage;
