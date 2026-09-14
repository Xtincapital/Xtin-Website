import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import progressService from '../../../services/progressService';
import { getLessonInfoFromPath } from '../../../utils/lessonProgress';

const LessonProgressTracker = () => {
  const { user } = useAuth();
  const location = useLocation();
  const lastMarkedRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const lessonInfo = getLessonInfoFromPath(location.pathname);
    if (!lessonInfo) return;

    const key = `${lessonInfo.moduleSlug}:${lessonInfo.lessonSlug}`;
    if (lastMarkedRef.current === key) return;
    lastMarkedRef.current = key;

    let isActive = true;

    const markProgress = async () => {
      try {
        await progressService.markLessonCompleted(lessonInfo.moduleSlug, lessonInfo.lessonSlug);
        if (isActive) {
          window.dispatchEvent(new CustomEvent('lesson_progress_marked', { detail: lessonInfo }));
        }
      } catch (error) {
        console.error('Failed to mark lesson as completed:', error);
      }
    };

    markProgress();

    return () => {
      isActive = false;
    };
  }, [location.pathname, user]);

  return null;
};

export default LessonProgressTracker;
