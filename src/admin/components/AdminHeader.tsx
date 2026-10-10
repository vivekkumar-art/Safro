// ==============================================================================
// SAFRO ADMIN HEADER COMPONENT
// Search bar, theme switcher, notification popover & admin profile dropdown
// Fully responsive with light & dark theme support matching Image 2
// ==============================================================================

import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminTheme } from '../context/AdminThemeContext';
import { AdminThemeToggle } from './AdminThemeToggle';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  User,
  Settings,
  Activity,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const { adminUser, logout } = useAdminAuth();
  const { theme, toggleTheme } = useAdminTheme();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/users?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="h-16 sm:h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs transition-colors duration-200">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="xl:hidden p-2 text-slate-500 hover:text-[#062B5C] dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users, locations, or anything..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/80 dark:focus:bg-slate-850 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-[#031D3D] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1267D6]/20 focus:border-[#1267D6] transition-all"
          />
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Notification Bell matching Image 2 */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 rounded-xl text-slate-600 hover:text-[#062B5C] dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Admin notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
              3
            </span>
          </button>

          {/* Quick Notification Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-[#031D3D] dark:text-white">Administrative Alerts</span>
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                  3 Active
                </span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate('/admin/safety-alerts');
                  }}
                  className="p-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-100 dark:border-rose-900/40 cursor-pointer transition-colors"
                >
                  <p className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> High Alert: Rohit Verma
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Clock Tower, Dehradun • 2m ago</p>
                </div>
                <div
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate('/admin/routes');
                  }}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700 cursor-pointer transition-colors"
                >
                  <p className="font-bold text-[#031D3D] dark:text-white">Trip Started: Priya Sharma</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Rajpur Road to Mussoorie • 5m ago</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher matching Image 2 */}
        <AdminThemeToggle />

        {/* Admin Profile Dropdown matching Image 2 */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer group"
          >
            <img
              src={adminUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={adminUser?.name || 'Admin'}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover ring-2 ring-blue-500/20"
            />
            <div className="hidden sm:block text-left">
              <span className="text-xs font-extrabold text-[#031D3D] dark:text-white block leading-none group-hover:text-[#1267D6] dark:group-hover:text-blue-400">
                {adminUser?.name || 'Admin'}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 block mt-0.5 leading-none capitalize">
                {adminUser?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 ml-0.5" />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-[#031D3D] dark:text-white">{adminUser?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{adminUser?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/admin/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#062B5C] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/admin/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#062B5C] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Account Settings
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/admin/activity');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#062B5C] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Activity className="w-3.5 h-3.5" />
                  Activity
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
