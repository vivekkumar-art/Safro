import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, TravelPreferences } from '../types';
import {
  supabaseAuthService,
  mapSupabaseUserToProfile,
  syncProfileWithDb,
} from '../services/supabaseAuthService';
import { supabase } from '../services/supabaseClient';

import { safeLocalStorage } from '../services/storageHelper';

interface SignupResult {
  requiresEmailConfirmation: boolean;
  user: UserProfile | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: (account?: { name?: string; email?: string; avatarUrl?: string }) => Promise<UserProfile>;
  signup: (name: string, email: string, pass: string) => Promise<SignupResult>;
  resetPassword: (email: string) => Promise<void>;
  updatePreferences: (prefs: TravelPreferences) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial session restoration on application startup
    const initSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Error restoring Supabase session:', error.message);
        }
        if (isMounted) {
          if (data?.session?.user) {
            const mapped = mapSupabaseUserToProfile(data.session.user);
            setUser(mapped);
            // Async sync with public.profiles if table exists
            syncProfileWithDb(data.session.user).then((dbProfile) => {
              if (isMounted) setUser(dbProfile);
            });
          } else {
            // Check if local user profile exists
            const localUser = localStorage.getItem('safro_user_profile');
            if (localUser) {
              try {
                setUser(JSON.parse(localUser));
              } catch {
                setUser(null);
              }
            } else {
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        const localUser = localStorage.getItem('safro_user_profile');
        if (isMounted && localUser) {
          try {
            setUser(JSON.parse(localUser));
          } catch {
            setUser(null);
          }
        } else if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initSession();

    // 2. Real-time auth state listener across the application
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        const mapped = mapSupabaseUserToProfile(session.user);
        setUser(mapped);
        syncProfileWithDb(session.user).then((dbProfile) => {
          if (isMounted) setUser(dbProfile);
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('safro_user_profile');
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await supabaseAuthService.signIn(email, pass);
      setUser(res.user);
      localStorage.setItem('safro_user_profile', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (account?: { name?: string; email?: string; avatarUrl?: string }): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await supabaseAuthService.signInWithGoogle(account);
      if (res && (res as any).fallbackUser) {
        const fallback = (res as any).fallbackUser;
        setUser(fallback);
        safeLocalStorage.setItem('safro_user_profile', JSON.stringify(fallback));
        safeLocalStorage.setItem(`safro_user_profile_${fallback.id}`, JSON.stringify(fallback));
        return fallback;
      }
      if (res && (res as any).user) {
        const u = (res as any).user;
        setUser(u);
        safeLocalStorage.setItem('safro_user_profile', JSON.stringify(u));
        return u;
      }
      const { mockAuthService } = await import('../services/mockAuthService');
      const fallback = await mockAuthService.loginWithGoogle(account);
      setUser(fallback);
      safeLocalStorage.setItem('safro_user_profile', JSON.stringify(fallback));
      safeLocalStorage.setItem(`safro_user_profile_${fallback.id}`, JSON.stringify(fallback));
      return fallback;
    } catch (err) {
      console.warn('Google login fallback triggered:', err);
      const { mockAuthService } = await import('../services/mockAuthService');
      const fallback = await mockAuthService.loginWithGoogle(account);
      setUser(fallback);
      safeLocalStorage.setItem('safro_user_profile', JSON.stringify(fallback));
      safeLocalStorage.setItem(`safro_user_profile_${fallback.id}`, JSON.stringify(fallback));
      return fallback;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    pass: string
  ): Promise<SignupResult> => {
    setIsLoading(true);
    try {
      const res = await supabaseAuthService.signUp(name, email, pass);
      if (res.user && !res.requiresEmailConfirmation) {
        setUser(res.user);
      }
      return {
        requiresEmailConfirmation: res.requiresEmailConfirmation,
        user: res.user,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await supabaseAuthService.resetPassword(email);
  };

  const updatePreferences = async (prefs: TravelPreferences) => {
    const updated = await supabaseAuthService.updatePreferences(prefs);
    setUser(updated);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = await supabaseAuthService.updateProfile(updates);
    setUser(updated);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabaseAuthService.signOut();
      setUser(null);
      localStorage.removeItem('safro_user_profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        resetPassword,
        updatePreferences,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
