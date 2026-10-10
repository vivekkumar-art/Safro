// ==============================================================================
// SAFRO ADMIN LAYOUT & ROUTE PROTECTION
// ==============================================================================

import React, { useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { isAdmin, isLoading: isAdminLoading } = useAdminAuth();
  const { isAuthenticated: isConsumerUserAuthenticated, isLoading: isConsumerLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isAdminLoading || isConsumerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#1267D6] border-t-transparent animate-spin" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Verifying Admin Session...
          </span>
        </div>
      </div>
    );
  }

  // 1. If consumer user is logged in but has no admin privileges:
  if (!isAdmin && isConsumerUserAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 max-w-md w-full text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Access Denied
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              You do not have permission to access the SAFRO Admin Panel. This administrative control system requires verified administrator credentials.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to="/home"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to SAFRO User App
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign in as Administrator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. If not authenticated as admin, redirect to admin login
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#031D3D] dark:text-slate-100 flex transition-colors duration-200">
      {/* Fixed / Drawer Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Administrative Container */}
      <div className="flex-1 xl:ml-64 flex flex-col min-w-0 min-h-screen">
        <AdminHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
