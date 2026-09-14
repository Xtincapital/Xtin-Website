import supabase from '../supabase';
import { BACKEND_URL } from '../config/env';

class AuthService {
  // Login user
  async login(email, password) {
    try {
      // Validate and sanitize input
      const loginData = {
        email: email?.trim(),
        password: password?.trim(),
      };

      // Validate required fields
      if (!loginData.email || !loginData.password) {
        throw new Error('Email and password are required');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        throw new Error(error.message || 'Login failed');
      }

      return { data, user: data.user };
    } catch (error) {
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  }

  // Signup user
  async signup(userData) {
    try {
      // Validate and sanitize input
      const signupData = {
        first_name: userData.firstName?.trim(),
        last_name: userData.lastName?.trim(),
        email: userData.email?.trim(),
        phone_number: userData.phone?.trim(),
        password: userData.password?.trim(),
      };

      // Validate required fields
      if (!signupData.email || !signupData.password || !signupData.first_name || !signupData.last_name) {
        throw new Error('All fields are required');
      }

      const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      const result = await response.json();

      // Also sign up with Supabase for client-side session management
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            first_name: signupData.first_name,
            last_name: signupData.last_name,
            phone_number: signupData.phone_number,
          }
        }
      });

      if (error) {
        console.warn('Supabase signup failed, but backend succeeded:', error);
      }

      return { data: result.data, user: data?.user };
    } catch (error) {
      throw new Error(error.message || 'Signup failed. Please try again.');
    }
  }

  // Get current user
  getCurrentUser() {
    return supabase.auth.getUser();
  }

  // Get current session
  getCurrentSession() {
    return supabase.auth.getSession();
  }

  // Check if user is authenticated
  isAuthenticated() {
    return supabase.auth.getSession().then(({ data: { session } }) => !!session);
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard` // Redirect to dashboard after login
        }
      });

      if (error) {
        throw new Error(error.message || 'Google sign-in failed');
      }

      return { data };
    } catch (error) {
      throw new Error(error.message || 'Google sign-in failed. Please try again.');
    }
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



  // Logout user
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message || 'Logout failed');
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Make authenticated API requests
  async makeAuthenticatedRequest(url, options: RequestInit = {}) {
    let token = null;

    // 1) Try Supabase session first (OAuth login)
    const { data: { session }, error } = await supabase.auth.getSession();
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
      try { await supabase.auth.signOut(); } catch (_) {}
      throw new Error('Session expired. Please login again.');
    }

    return response;
  }
}

export default new AuthService();
