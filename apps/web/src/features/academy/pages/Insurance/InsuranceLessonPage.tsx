import React from "react";
import { CheckCircleIcon, ClipboardIcon, CoinsIcon, HeartIcon, MedicalIcon, ShieldIcon, WarningIcon } from "../../components/LearningIcons";
import StudyLesson from "../../components/StudyLesson";
import { insuranceLessons } from "./insuranceLessonData";

const icons = [ShieldIcon, MedicalIcon, HeartIcon, WarningIcon, ClipboardIcon, CoinsIcon, CheckCircleIcon];

const InsuranceLessonPage = ({ lessonNumber }) => (
  <StudyLesson lessons={insuranceLessons} lessonNumber={lessonNumber} moduleId="insurance" icons={icons} />
);

export default InsuranceLessonPage;
