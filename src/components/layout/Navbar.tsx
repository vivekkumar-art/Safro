import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTrip } from '../../context/TripContext';
import { useNotification } from '../../context/NotificationContext';
import { NotificationModal } from './NotificationModal';
import { AdminThemeToggle } from '../../admin/components/AdminThemeToggle';
import {
  Compass,
  MapPin,
  Calendar,
  Wallet,
  Tag,
  Receipt,
  Sparkles,
  Bell,
  Menu,
  X,
  ChevronDown,
  Radio,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { credits, activeTrip } = useTrip();
  const { unreadCount } = useNotification();
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/home', icon: Compass },
    { label: 'Trips', path: '/trips', icon: Calendar },
    { label: 'Plan Trip', path: '/trips/new', icon: MapPin },
    { label: 'Live Map', path: `/trips/${activeTrip?.id || 'trip_manali_01'}/live`, icon: Compass, badge: 'LIVE' },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Offers', path: '/offers', icon: Tag },
    { label: 'Credits', path: '/credits', icon: Wallet },
    { label: 'NIEL AI', path: '/niel-ai', icon: Sparkles, highlight: true },
    { label: 'NIEL 3D Radar', path: '/niel', icon: Radio, badge: '3D', highlight: true },
  ];

  const isActive = (path: string) => {
    if (path.includes('/live')) {
      return location.pathname.includes('/live');
    }
    return location.pathname === path;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Brand */}
            <div className="flex items-center gap-6">
              <Link to="/home" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#062B5C] to-[#1267D6] flex items-center justify-center shadow-md shadow-[#062B5C]/20 group-hover:scale-105 transition-transform overflow-hidden">
                  <img
                    src="/safro-icon.jpeg"
                    alt="SAFRO"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <Compass className="w-5 h-5 text-white absolute" />
                </div>
                <div>
                  <span className="font-heading font-extrabold text-2xl tracking-tight text-[#062B5C] dark:text-white group-hover:text-[#1267D6] transition-colors">
                    SAFRO
                  </span>
                  <span className="hidden sm:block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 tracking-wider -mt-1">
                    AI Travel Companion
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden xl:flex items-center gap-1 ml-4">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                        active
                          ? 'text-[#1267D6] dark:text-blue-400 bg-[#EAF4FF] dark:bg-blue-950/60'
                          : link.highlight
                          ? 'text-[#062B5C] dark:text-indigo-300 hover:text-[#1267D6] bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-indigo-100/80 dark:border-indigo-800/60'
                          : 'text-slate-600 dark:text-slate-300 hover:text-[#062B5C] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-[#1267D6] dark:text-blue-400' : link.highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="text-[9px] font-extrabold bg-[#19A974] text-white px-1.5 py-0.2 rounded-full uppercase tracking-wider animate-pulse">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              {/* Credits Chip */}
              <Link
                to="/credits"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF4FF] dark:bg-slate-800/90 hover:bg-blue-100/70 dark:hover:bg-slate-700/90 border border-[#D8E9FF] dark:border-slate-700 text-[#062B5C] dark:text-slate-200 transition-all cursor-pointer group"
                title="Your SAFRO Credits Balance"
              >
                <div className="w-5 h-5 rounded-full bg-[#1267D6] text-white flex items-center justify-center font-bold text-xs">
                  ₹
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-extrabold text-[#1267D6] dark:text-blue-400 group-hover:underline">
                    ₹{credits.toLocaleString('en-IN')}
                  </span>
                  <span className="hidden sm:inline text-[9px] font-semibold text-slate-500 dark:text-slate-400 -mt-0.5">
                    Credits
                  </span>
                </div>
              </Link>

              {/* Notification Button */}
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-[#062B5C] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-[#1267D6] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Theme Switcher */}
              <div className="hidden sm:block">
                <AdminThemeToggle size="sm" />
              </div>

              {/* Profile Avatar / Link */}
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-all cursor-pointer group"
              >
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-white dark:ring-slate-700 shadow-xs"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-[#031D3D] dark:text-white leading-tight group-hover:text-[#1267D6] transition-colors">
                    {user?.name?.split(' ')[0] || 'Aarav'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-300 font-semibold mt-0.5 leading-none">
                    {user?.preferences?.travelStyle || 'Balanced'}
                  </p>
                </div>
                <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-[#062B5C] dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-2xl text-sm font-semibold transition-colors ${
                    active ? 'text-[#1267D6] dark:text-blue-400 bg-[#EAF4FF] dark:bg-blue-950/60' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${active ? 'text-[#1267D6] dark:text-blue-400' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] font-bold bg-[#19A974] text-white px-2 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Mobile Theme Toggle Row */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Display Theme</span>
              <AdminThemeToggle size="sm" />
            </div>
          </div>
        )}
      </header>

      {/* Notifications Modal */}
      <NotificationModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
