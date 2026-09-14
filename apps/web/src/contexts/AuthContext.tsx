import React, { createContext, useContext, useState, useEffect } from "react";
import supabase from "../supabase";
import { BACKEND_URL, AUTH_BYPASS } from "../config/env";

interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  // Present when `user` still holds a raw Supabase Auth session shape
  // (e.g. mid-OAuth, before the backend `users` row sync completes).
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    [key: string]: unknown;
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<any>;
  signup: (
    email: string,
    password: string,
    userData?: { firstName?: string; lastName?: string; phone?: string }
  ) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<AuthUser>) => void;
  refreshToken: () => Promise<string | undefined>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const MOCK_USER: AuthUser = {
  id: 'dev-bypass-user',
  email: 'dev@localhost',
  first_name: 'Dev',
  last_name: 'User',
  phone_number: '',
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(AUTH_BYPASS ? MOCK_USER : null);
  const [loading, setLoading] = useState(AUTH_BYPASS ? false : true);

  useEffect(() => {
    // Skip all auth checks when the dev bypass is enabled.
    if (AUTH_BYPASS) {
      console.warn('[AuthContext] VITE_AUTH_BYPASS is ON — sign-in is bypassed with a mock user.');
      return;
    }

    // Unified auth restoration on page load / refresh
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          try {
            // Verify token by calling profile endpoint
            const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const result = await response.json();
              setUser({
                id: result.data.id,
                email: result.data.email,
                first_name: result.data.first_name,
                last_name: result.data.last_name,
                phone_number: result.data.phone_number,
              });
            } else if (response.status === 401) {
              // Token expired, try to refresh
              try {
                console.log('Token expired, attempting refresh...');
                const newToken = await refreshToken();
                if (newToken) {
                  const retryResponse = await fetch(`${BACKEND_URL}/api/auth/profile`, {
                    headers: {
                      'Authorization': `Bearer ${newToken}`,
                    },
                  });
                  if (retryResponse.ok) {
                    const result = await retryResponse.json();
                    setUser({
                      id: result.data.id,
                      email: result.data.email,
                      first_name: result.data.first_name,
                      last_name: result.data.last_name,
                      phone_number: result.data.phone_number,
                    });
                  }
                }
              } catch (refreshError) {
                console.error('Token refresh failed during restore:', refreshError);
                localStorage.removeItem('auth_token');
              }
            } else {
              localStorage.removeItem('auth_token');
            }
          } catch (error) {
            console.error('Failed to restore session:', error);
            localStorage.removeItem('auth_token');
          }
        } else {
          // If no local token exists, check for existing Supabase session (for OAuth redirects)
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            console.log('Found existing Supabase session, syncing user:', session.user.email);
            try {
              const syncResult = await syncUser(session.access_token);
              localStorage.setItem('auth_token', syncResult.data.token);
              setUser({
                id: syncResult.data.id,
                email: syncResult.data.email,
                first_name: syncResult.data.first_name,
                last_name: syncResult.data.last_name,
                phone_number: syncResult.data.phone_number,
              });
            } catch (error) {
              console.error('Failed to sync user from existing session:', error);
            }
          }
        }
      } catch (err) {
        console.error('[AuthContext] Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for Supabase auth state changes (for OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase auth event:', event, session?.user?.email);

      if (event === 'SIGNED_IN' && session?.user) {
        // User signed in via OAuth, sync with backend
        try {
          const syncResult = await syncUser(session.access_token);

          // Store the token and set user data
          localStorage.setItem('auth_token', syncResult.data.token);
          setUser({
            id: syncResult.data.id,
            email: syncResult.data.email,
            first_name: syncResult.data.first_name,
            last_name: syncResult.data.last_name,
            phone_number: syncResult.data.phone_number,
          });

          // Clear returnUrl from sessionStorage after successful OAuth
          sessionStorage.removeItem('returnUrl');

          setLoading(false);
        } catch (error) {
          console.error('Failed to sync user after OAuth:', error);
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('returnUrl');
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const result = await response.json();

    // Store the token in localStorage
    localStorage.setItem('auth_token', result.data.token);

    // Set user data directly (don't rely on Supabase auth state)
    const userData = {
      id: result.data.userId,
      email: result.data.email,
      first_name: result.data.first_name,
      last_name: result.data.last_name,
      phone_number: result.data.phone_number,
    };

    setUser(userData);

    // Handle returnUrl redirect if present
    const returnUrl = sessionStorage.getItem('returnUrl');
    if (returnUrl) {
      sessionStorage.removeItem('returnUrl');
      // The redirect will be handled by the component that opened the modal
    }

    return result.data;
  };

  const signup = async (
    email: string,
    password: string,
    userData: { firstName?: string; lastName?: string; phone?: string } = {}
  ) => {
    const signupData = {
      first_name: userData.firstName || '',
      last_name: userData.lastName || '',
      email,
      password,
      phone_number: userData.phone || '',
    };

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
    return result.data;
  };

  const signInWithGoogle = async () => {
    // Check if there's a returnUrl stored (from SignInModal)
    const returnUrl = sessionStorage.getItem('returnUrl');
    const redirectPath = returnUrl || '/dashboard';
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectPath}`
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  };

  const logout = async () => {
    // Clear stored token and user state
    const token = localStorage.getItem('auth_token');
    localStorage.removeItem('auth_token');
    setUser(null);

    if (token) {
      // Call backend to blacklist the token
      try {
        await fetch(`${BACKEND_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.warn('[AuthContext] Backend logout call failed:', err);
      }

      // Also sign out from Supabase to invalidate any OAuth session
      try {
        await supabase.auth.signOut();
      } catch (supabaseErr) {
        // Supabase signOut may fail if there's no session; that's fine
        console.warn('[AuthContext] Supabase signOut (optional) failed:', supabaseErr.message);
      }
    }
  };

  const syncUser = async (token) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to sync user');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('User sync error:', error);
      throw error;
    }
  };

  const updateUser = (userData) => {
    // Update user metadata if needed
    setUser(prev => ({ ...prev, ...userData }));
  };

  // Add token refresh function
  const refreshToken = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      if (session?.access_token) {
        // Update localStorage with new token
        localStorage.setItem('auth_token', session.access_token);
        return session.access_token;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      localStorage.removeItem('auth_token');
      setUser(null);
      throw error;
    }
  };

  const value = {
    user,
    login,
    signup,
    signInWithGoogle,
    logout,
    updateUser,
    refreshToken,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
