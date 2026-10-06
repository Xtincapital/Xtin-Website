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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<any>;
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

// "Remember me": Supabase persists the session in localStorage, which outlives
// the browser. When the box is unticked we flag the login as session-only and
// drop a cookie with no expiry (it dies when the browser closes). On the next
// load, a flag without its cookie means the browser was closed -> sign out.
const NO_REMEMBER_KEY = 'xtin_no_remember';
const ALIVE_COOKIE = 'xtin_session_alive';
const hasAliveCookie = () => document.cookie.split('; ').some((c) => c.startsWith(`${ALIVE_COOKIE}=`));
const setRememberPreference = (remember: boolean) => {
  try {
    if (remember) {
      localStorage.removeItem(NO_REMEMBER_KEY);
      document.cookie = `${ALIVE_COOKIE}=; path=/; max-age=0`;
    } else {
      localStorage.setItem(NO_REMEMBER_KEY, '1');
      document.cookie = `${ALIVE_COOKIE}=1; path=/; SameSite=Lax`;
    }
  } catch {
    /* storage blocked — fall back to default persistent session */
  }
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
        // Previous login was "don't remember me" and the browser has since
        // been closed: end that session before restoring anything.
        if (localStorage.getItem(NO_REMEMBER_KEY) === '1' && !hasAliveCookie()) {
          await supabase.auth.signOut({ scope: 'local' });
          localStorage.removeItem('auth_token');
          localStorage.removeItem(NO_REMEMBER_KEY);
        }
        const { data: { session } } = await supabase.auth.getSession();
        const storedToken = localStorage.getItem('auth_token');
        // Prefer the live Supabase session token: supabase-js keeps it
        // refreshed, while the copy in auth_token goes stale after an hour
        // and would cost a 401 + refresh + retry on every page load.
        const token = storedToken && session?.access_token ? session.access_token : storedToken;
        if (token && token !== storedToken) {
          localStorage.setItem('auth_token', token);
        }
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

  // Phase 6 (auth consolidation, staged): the client now authenticates
  // directly against Supabase — the same pattern signInWithGoogle already
  // used — instead of going through the backend's /api/auth/login, which
  // minted its own JWT. The backend still accepts and mints that JWT for
  // any other caller (mobile app, etc.); this only changes what the web
  // client itself uses. auth_token now always holds a real Supabase
  // session token, which middlewares/auth.ts already accepts as a
  // fallback (it did before this change too, for OAuth).
  const login = async (email: string, password: string, rememberMe: boolean = true) => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      throw new Error(authError.message || 'Invalid credentials');
    }
    if (!authData.session) {
      throw new Error('Login failed: no session returned');
    }

    setRememberPreference(rememberMe);
    const syncResult = await syncUser(authData.session.access_token);
    localStorage.setItem('auth_token', authData.session.access_token);

    const userData = {
      id: syncResult.data.id,
      email: syncResult.data.email,
      first_name: syncResult.data.first_name,
      last_name: syncResult.data.last_name,
      phone_number: syncResult.data.phone_number,
    };

    setUser(userData);

    // Handle returnUrl redirect if present
    const returnUrl = sessionStorage.getItem('returnUrl');
    if (returnUrl) {
      sessionStorage.removeItem('returnUrl');
      // The redirect will be handled by the component that opened the modal
    }

    return userData;
  };

  const signup = async (
    email: string,
    password: string,
    userData: { firstName?: string; lastName?: string; phone?: string } = {}
  ) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName || '',
          last_name: userData.lastName || '',
          // null, not '': public.users.phone_number is UNIQUE, and a blank
          // string collides with every other blank-phone signup.
          phone_number: userData.phone?.trim() || null,
        },
      },
    });

    if (authError) {
      throw new Error(authError.message || 'Signup failed');
    }

    if (!authData.session) {
      // Email confirmation required — no session yet, nothing to sync.
      return {
        email,
        requires_confirmation: true,
        message: 'Signup successful! Please check your email and click the confirmation link to complete your registration.',
      };
    }

    // Confirmation disabled on this project — session exists immediately.
    setRememberPreference(true);
    const syncResult = await syncUser(authData.session.access_token);
    localStorage.setItem('auth_token', authData.session.access_token);

    const profile = {
      id: syncResult.data.id,
      email: syncResult.data.email,
      first_name: syncResult.data.first_name,
      last_name: syncResult.data.last_name,
      phone_number: syncResult.data.phone_number,
    };
    setUser(profile);

    return { ...profile, requires_confirmation: false, message: 'User created successfully' };
  };

  const signInWithGoogle = async () => {
    setRememberPreference(true);
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
