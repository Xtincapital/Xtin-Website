import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SignInModal from './SignInModal';
import LearnLockScreen from '../features/academy/components/LearnLockScreen';
import { getLessonInfoFromPath } from '../utils/lessonProgress';
import { isLessonLocked, getModuleConfig, subscribeLearnPlan } from '../lib/learnPlan';
import learnPlanService from '../features/academy/services/learnPlanService';

/**
 * ProtectedModuleRoute - Protects learning module routes
 * 1. Shows a sign-in modal when accessing a module while not logged in.
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

  useEffect(() => {
    // If not loading and no user, show the sign-in modal
    if (!loading && !user) {
      // Store the intended URL for redirect after login
      sessionStorage.setItem('returnUrl', location.pathname);
      setShowSignInModal(true);
    }
  }, [loading, user, location.pathname]);

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

  // If not logged in, show modal
  if (!user) {
    return (
      <SignInModal
        isOpen={showSignInModal}
        onClose={handleModalClose}
        onSuccess={handleSignInSuccess}
        targetToolPath={location.pathname}
        headline="Sign In Required"
        description="Please sign in to access this learning module"
      />
    );
  }

  // Academy Pro gate: Beginner modules and free-preview lessons pass straight
  // through; deeper lessons of Intermediate/Advanced modules need Pro.
  const lessonInfo = getLessonInfoFromPath(location.pathname);
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
