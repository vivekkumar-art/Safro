// ==============================================================================
// SAFRO ADMIN AUTH CONTEXT & ROLE-BASED ACCESS CONTROL
// Server-Synced Admin Session Provider
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../../types';
import { adminAuthService } from '../services/adminAuthService';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  currentAdmin: AdminUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<AdminUser>;
  signup: (name: string, email: string, phone: string, pass: string, inviteCode: string) => Promise<AdminUser>;
  forgotPassword: (email: string) => Promise<{ configured: boolean; message: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => adminAuthService.getCurrentAdmin());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // Verify session against backend /api/admin/me on startup
    const checkServerSession = async () => {
      try {
        const verified = await adminAuthService.verifySession();
        if (isMounted) {
          setAdminUser(verified);
        }
      } catch (err) {
        console.warn('[SAFRO Admin Auth Context] Initial session check failed:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkServerSession();

    const handleSessionChange = (e: any) => {
      if (isMounted) {
        setAdminUser(e.detail || null);
      }
    };

    window.addEventListener('safro:admin_session_changed', handleSessionChange);
    return () => {
      isMounted = false;
      window.removeEventListener('safro:admin_session_changed', handleSessionChange);
    };
  }, []);

  const login = async (email: string, pass: string, rememberMe: boolean = true) => {
    setIsLoading(true);
    try {
      const user = await adminAuthService.login(email, pass, rememberMe);
      setAdminUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    phone: string,
    pass: string,
    inviteCode: string
  ) => {
    setIsLoading(true);
    try {
      const user = await adminAuthService.signup(name, email, phone, pass, inviteCode);
      setAdminUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    return adminAuthService.forgotPassword(email);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const user = await adminAuthService.loginWithGoogle();
      if (user) {
        setAdminUser(user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await adminAuthService.logout();
    setAdminUser(null);
  };

  const isAdmin = !!adminUser && adminUser.status === 'active';
  const isSuperAdmin = adminUser?.role === 'super_admin';

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        currentAdmin: adminUser,
        isAdmin,
        isSuperAdmin,
        isLoading,
        login,
        signup,
        forgotPassword,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
