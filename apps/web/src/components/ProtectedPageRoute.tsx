import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SignInModal from './SignInModal';

/**
 * ProtectedPageRoute - Protects main pages like tools, algos, advisory, newsletter
 * Shows a sign-in modal when accessing these pages while not logged in
 * After successful login, user is redirected to the intended page
 *
 * `allowGuest` opens the page to signed-out visitors instead. The page then
 * asks for sign-in itself, at the moment it needs one (lib/guestGate.ts).
 */
const ProtectedPageRoute = ({ children, allowGuest = false }: { children: React.ReactNode; allowGuest?: boolean }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showSignInModal, setShowSignInModal] = useState(false);

  useEffect(() => {
    if (allowGuest) return;
    // If not loading and no user, show the sign-in modal
    if (!loading && !user) {
      // Store the intended URL for redirect after login
      sessionStorage.setItem('returnUrl', location.pathname + location.search);
      setShowSignInModal(true);
    }
  }, [allowGuest, loading, user, location.pathname]);

  // Handle successful sign-in
  const handleSignInSuccess = () => {
    setShowSignInModal(false);
    // The returnUrl is already stored, AuthContext will handle redirect
    const returnUrl = sessionStorage.getItem('returnUrl');
    if (returnUrl) {
      sessionStorage.removeItem('returnUrl');
      navigate(returnUrl, { replace: true });
    }
  };

  // Handle modal close - redirect to home page
  const handleModalClose = () => {
    setShowSignInModal(false);
    sessionStorage.removeItem('returnUrl');
    navigate('/', { replace: true });
  };

  // Open to everyone: no spinner, no modal — the page renders straight away.
  if (allowGuest) return <>{children}</>;

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
        description="Please sign in to access this feature"
      />
    );
  }

  // If logged in, render the children
  return children;
};

export default ProtectedPageRoute;
