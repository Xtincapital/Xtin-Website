// Phase 12: removed login/signup/logout/signInWithGoogle/getCurrentUser/
// onAuthStateChange — all fully superseded by contexts/AuthContext.tsx's
// own implementations (confirmed zero live callers of the versions that
// lived here). AuthContext.tsx is the single source of truth for the auth
// lifecycle; this file's remaining job is purely the authenticated-request
// helper + a couple of small standalone reads still used directly.
import supabase from '../supabase';

class AuthService {
  // Get current session
  getCurrentSession() {
    return supabase.auth.getSession();
  }

  // Check if user is authenticated
  isAuthenticated() {
    return supabase.auth.getSession().then(({ data: { session } }) => !!session);
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message || 'Failed to send reset email');
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to send reset email. Please try again.');
    }
  }

  // Make authenticated API requests
  async makeAuthenticatedRequest(url, options: RequestInit = {}) {
    let token = null;

    // 1) Try Supabase session first (OAuth login)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      token = session.access_token;
    }

    // 2) Fallback to localStorage auth_token (email/password login)
    if (!token) {
      token = localStorage.getItem('auth_token');
    }

    if (!token) {
      throw new Error('No authentication session found');
    }

    // Extract headers from options so we don't lose them when merging
    const customHeaders = options.headers || {};
    const { headers: _headers, ...restOptions } = options;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(url, {
      ...restOptions,
      headers: {
        ...defaultHeaders,
        ...customHeaders,
      },
    });

    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      try { await supabase.auth.signOut(); } catch { /* ignore sign-out failure */ }
      throw new Error('Session expired. Please login again.');
    }

    return response;
  }
}

export default new AuthService();
