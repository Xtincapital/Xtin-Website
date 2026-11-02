import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SignInModal from './SignInModal';
import LearnLockScreen from '../features/academy/components/LearnLockScreen';
import { getLessonInfoFromPath } from '../utils/lessonProgress';
import { isLessonLocked, getModuleConfig, subscribeLearnPlan } from '../lib/learnPlan';
import { guestMayOpenLesson } from '../lib/guestGate';
import learnPlanService from '../features/academy/services/learnPlanService';

/**
 * ProtectedModuleRoute - Protects learning module routes
 * 1. Signed-out visitors can read a module's page and open one free lesson
 *    (lib/guestGate.ts); anything beyond that shows a sign-in modal.
 * 2. Shows the Academy Pro lock screen when a free learner opens a Pro
 *    lesson (all Beginner modules + the first lessons of every other
 *    module stay free).
 * After successful login, user is redirected to the intended module.
 */
const ProtectedModuleRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showSignInModal, setShowSignInModal] = useState(false);
  // Re-render when the plan changes (e.g. the upgrade completes).
  const [, setPlanTick] = useState(0);
  useEffect(() => {
    const unsub = subscribeLearnPlan(() => setPlanTick((t) => t + 1));
    return () => { unsub(); };
  }, []);

  // Re-read the plan from the server whenever a signed-in user opens a
  // lesson, so a hand-edited local cache can't unlock Pro lessons for long.
  useEffect(() => {
    if (user) learnPlanService.syncPlan();
  }, [user]);

  const lessonInfo = getLessonInfoFromPath(location.pathname);
  // A signed-out visitor may view a module page, and a lesson that is free for
  // everyone as long as they haven't used up their free lessons. A lesson that
  // needs Pro never uses one up.
  const guestMayView =
    !loading &&
    !user &&
    (!lessonInfo ||
      (!isLessonLocked(lessonInfo.moduleSlug, lessonInfo.lessonSlug) &&
        guestMayOpenLesson(`${lessonInfo.moduleSlug}/${lessonInfo.lessonSlug}`)));

  useEffect(() => {
    // Not loading, no user, and nothing a guest may see here: show the sign-in modal
    if (!loading && !user && !guestMayView) {
      // Store the intended URL for redirect after login
      sessionStorage.setItem('returnUrl', location.pathname);
      setShowSignInModal(true);
    }
  }, [loading, user, guestMayView, location.pathname]);

  // Handle successful sign-in
  const handleSignInSuccess = () => {
    setShowSignInModal(false);
    // The returnUrl is already stored, AuthContext will handle redirect
    // Or we can navigate directly here
    const returnUrl = sessionStorage.getItem('returnUrl');
    if (returnUrl) {
      sessionStorage.removeItem('returnUrl');
      navigate(returnUrl, { replace: true });
    }
  };

  // Handle modal close - redirect to learn page
  const handleModalClose = () => {
    setShowSignInModal(false);
    sessionStorage.removeItem('returnUrl');
    navigate('/learn', { replace: true });
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Signed out and past the free preview: ask them to sign in.
  if (!user && !guestMayView) {
    return (
      <SignInModal
        isOpen={showSignInModal}
        onClose={handleModalClose}
        onSuccess={handleSignInSuccess}
        targetToolPath={location.pathname}
        headline="Sign in free to keep learning"
        description="Sign in or create a free account to open more lessons and keep track of your progress."
      />
    );
  }

  // Signed-out visitors see the free preview as it is, with no Pro lock screen.
  if (!user) return children;

  // Academy Pro gate: Beginner modules and free-preview lessons pass straight
  // through; deeper lessons of Intermediate/Advanced modules need Pro.
  if (lessonInfo && isLessonLocked(lessonInfo.moduleSlug, lessonInfo.lessonSlug)) {
    const lessonNumber = parseInt(String(lessonInfo.lessonSlug).replace('lesson-', ''), 10);
    return (
      <LearnLockScreen
        moduleConfig={getModuleConfig(lessonInfo.moduleSlug)}
        lessonNumber={Number.isFinite(lessonNumber) ? lessonNumber : ''}
      />
    );
  }

  // If logged in, render the children
  return children;
};

export default ProtectedModuleRoute;
