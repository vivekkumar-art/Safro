// ==============================================================================
// SAFRO ADMIN SIDEBAR COMPONENT
// Pixel-perfect implementation matching Image 2
// ==============================================================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Route,
  Bell,
  ShieldAlert,
  FileText,
  BarChart3,
  Cpu,
  Settings,
  Shield,
  X,
  Radio,
  Compass,
} from 'lucide-react';

interface AdminSidebarProps {
  onClose: () => void;
  isOpen: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Destinations & Coverage', path: '/admin/destinations', icon: Compass, badge: 'PAN-INDIA' },
    { label: 'NIEL Command Center', path: '/admin/niel', icon: Radio, badge: '3D RADAR' },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Live Locations', path: '/admin/live-locations', icon: MapPin },
    { label: 'Routes & Trips', path: '/admin/routes', icon: Route },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: 'Safety Alerts', path: '/admin/safety-alerts', icon: ShieldAlert },
    { label: 'Activity Logs', path: '/admin/activity', icon: FileText },
    { label: 'Reports & Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'System Status', path: '/admin/system', icon: Cpu },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs xl:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0A192F] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800/80 ${
          isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'
        }`}
      >
        {/* Top Logo & Branding */}
        <div className="h-16 sm:h-20 flex items-center justify-between px-6 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1267D6] to-[#1FA2FF] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Shield className="w-5 h-5 fill-white/20 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-white block leading-none">
                SAFRO
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                Admin Panel
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="xl:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-5 px-3.5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#1D68FE] text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-1.5 py-0.5 rounded-full tracking-wider animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Badge matching Image 2 */}
        <div className="p-4 border-t border-slate-800/60">
          <div className="p-4 rounded-2xl bg-[#0F2342] border border-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-[#1FA2FF] flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-extrabold text-white block truncate">
                SAFRO
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                Safer Journeys. Together.
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
