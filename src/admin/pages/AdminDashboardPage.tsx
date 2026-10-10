// ==============================================================================
// SAFRO ADMIN DASHBOARD PAGE
// Pixel-perfect implementation matching Image 2 with Light & Dark mode
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminKpiCard } from '../components/AdminKpiCard';
import { AdminMap } from '../components/AdminMap';
import { adminDataService } from '../services/adminDataService';
import {
  AdminKpiMetrics,
  AdminActivityItem,
  AdminSafetyAlert,
} from '../../types';
import {
  Users,
  UserCheck,
  Radio,
  Car,
  AlertTriangle,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<AdminKpiMetrics | null>(null);
  const [activities, setActivities] = useState<AdminActivityItem[]>([]);
  const [safetyAlerts, setSafetyAlerts] = useState<AdminSafetyAlert[]>([]);
  const [systemStatus, setSystemStatus] = useState<any[]>([]);

  // Current formatted date/time matching Image 2
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // Load data
    adminDataService.getKpiMetrics().then(setMetrics);
    setActivities(adminDataService.getRecentActivities());
    setSafetyAlerts(adminDataService.getSafetyAlerts());
    setSystemStatus(adminDataService.getSystemStatus());

    const updateClock = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTime(`${formatted} | ${timeStr}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* =========================================================================
          TOP HEADER BAR: Title, Subtitle, Date & System Online Badge
          Matching Image 2
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#031D3D] dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Overview of SAFRO system, users, trips and safety status
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Date & Time pill matching Image 2 */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentTime || 'Apr 29, 2026 | 10:42 AM'}</span>
          </div>

          {/* System Online badge matching Image 2 */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>System Online</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 1: 6 KPI CARDS
          Matching Image 2
          ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        <AdminKpiCard
          title="Total Users"
          value={metrics?.totalUsers || 8542}
          changePercent={metrics?.totalUsersChange || 12}
          icon={Users}
          variant="blue"
        />
        <AdminKpiCard
          title="Active Users"
          value={metrics?.activeUsers || 6327}
          changePercent={metrics?.activeUsersChange || 18}
          icon={UserCheck}
          variant="emerald"
        />
        <AdminKpiCard
          title="Users Online"
          value={metrics?.usersOnline || 1842}
          changePercent={metrics?.usersOnlineChange || 22}
          icon={Radio}
          variant="purple"
        />
        <AdminKpiCard
          title="Active Trips"
          value={metrics?.activeTrips || 892}
          changePercent={metrics?.activeTripsChange || 16}
          icon={Car}
          variant="amber"
        />
        <AdminKpiCard
          title="Safety Alerts"
          value={metrics?.safetyAlerts || 14}
          changePercent={metrics?.safetyAlertsChange || -32}
          icon={AlertTriangle}
          variant="rose"
          isReversePolarity={true}
        />
        <AdminKpiCard
          title="Notifications Sent"
          value={metrics?.notificationsSent || 12684}
          changePercent={metrics?.notificationsSentChange || 27}
          icon={Send}
          variant="indigo"
        />
      </div>

      {/* =========================================================================
          ROW 2: MIDDLE SECTION — LIVE LOCATIONS MAP (2/3) + RECENT ACTIVITY (1/3)
          Matching Image 2
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Live Locations Map Component (Dehradun Region) */}
        <div className="lg:col-span-2">
          <AdminMap height="480px" />
        </div>

        {/* Right: Recent Activity Feed matching Image 2 */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-[#031D3D] dark:text-white">
                Recent Activity
              </h3>
              <button
                onClick={() => navigate('/admin/activity')}
                className="text-xs font-bold text-[#1267D6] dark:text-blue-400 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {activities.map((item) => {
                let badgeStyle = 'bg-blue-50 text-[#1267D6] dark:bg-blue-950/60 dark:text-blue-400';
                if (item.badgeVariant === 'rose') badgeStyle = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400';
                if (item.badgeVariant === 'emerald') badgeStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400';
                if (item.badgeVariant === 'amber') badgeStyle = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400';
                if (item.badgeVariant === 'purple') badgeStyle = 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400';

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/60 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 border border-slate-200/60 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 mt-0.5 shadow-2xs">
                        {item.type === 'alert' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                        {item.type === 'trip' && <Car className="w-4 h-4 text-emerald-600" />}
                        {item.type === 'user' && <Users className="w-4 h-4 text-blue-600" />}
                        {item.type === 'notification' && <Send className="w-4 h-4 text-purple-600" />}
                        {item.type === 'route' && <MapPin className="w-4 h-4 text-amber-600" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#031D3D] dark:text-white truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.user}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {item.time}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 ${badgeStyle}`}>
                      {item.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-center">
            <button
              onClick={() => navigate('/admin/activity')}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-[#062B5C] dark:hover:text-white transition-colors"
            >
              Real-time audit log synced
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: BOTTOM SECTION — USER ACTIVITY (Chart) + TRIPS OVERVIEW (Donut)
                 + SAFETY ALERTS + SYSTEM STATUS
          Matching Image 2
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* 1. User Activity Area Line Chart */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-[#031D3D] dark:text-white">User Activity</h3>
              <select className="text-[11px] font-bold text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[10px] font-bold mt-3">
              <div className="flex items-center gap-1 text-[#1D68FE] dark:text-blue-400">
                <span className="w-2 h-2 rounded-full bg-[#1D68FE] dark:bg-blue-400" />
                <span>Active Users</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span>Total Users</span>
              </div>
            </div>

            {/* SVG Interactive Line Chart matching Image 2 */}
            <div className="mt-3 h-36 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 280 100">
                <defs>
                  <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1D68FE" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#1D68FE" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal gridlines */}
                <line x1="0" y1="20" x2="280" y2="20" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
                <line x1="0" y1="50" x2="280" y2="50" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
                <line x1="0" y1="80" x2="280" y2="80" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />

                {/* Total Users Line (Grey) */}
                <path
                  d="M 10 70 Q 50 65 90 60 T 170 50 T 230 42 T 270 38"
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-300 dark:text-slate-600"
                  strokeWidth="2"
                />

                {/* Active Users Area & Line (Blue) */}
                <path
                  d="M 10 85 Q 50 78 90 70 T 170 60 T 230 48 T 270 40 L 270 95 L 10 95 Z"
                  fill="url(#activeGrad)"
                />
                <path
                  d="M 10 85 Q 50 78 90 70 T 170 60 T 230 48 T 270 40"
                  fill="none"
                  stroke="#1D68FE"
                  strokeWidth="2.5"
                />

                {/* Marker dots */}
                <circle cx="270" cy="40" r="3.5" fill="#1D68FE" className="stroke-white dark:stroke-slate-900" strokeWidth="2" />
                <circle cx="230" cy="48" r="3" fill="#1D68FE" />
                <circle cx="170" cy="60" r="3" fill="#1D68FE" />
                <circle cx="90" cy="70" r="3" fill="#1D68FE" />
              </svg>

              <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-1 mt-1">
                <span>Apr 23</span>
                <span>Apr 25</span>
                <span>Apr 27</span>
                <span>Apr 29</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% user growth this week</span>
          </div>
        </div>

        {/* 2. Trips Overview Donut Chart matching Image 2 */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-[#031D3D] dark:text-white">Trips Overview</h3>
              <select className="text-[11px] font-bold text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:outline-none">
                <option>Last 7 Days</option>
                <option>Month</option>
              </select>
            </div>

            {/* Donut Graphic */}
            <div className="mt-3 flex items-center justify-center relative">
              <div className="w-28 h-28 relative flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Completed: 72% (Emerald) */}
                  <path
                    className="text-emerald-500"
                    strokeDasharray="72, 100"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* In Progress: 22% (Blue) */}
                  <path
                    className="text-[#1D68FE]"
                    strokeDasharray="22, 100"
                    strokeDashoffset="-72"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-black text-[#031D3D] dark:text-white leading-none">892</span>
                  <span className="text-[9px] text-slate-400 font-bold mt-0.5">Total Trips</span>
                </div>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-300">Completed</span>
                </div>
                <span className="font-bold text-[#031D3D] dark:text-white">642 <span className="text-slate-400 font-normal">(72%)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1D68FE]" />
                  <span className="text-slate-600 dark:text-slate-300">In Progress</span>
                </div>
                <span className="font-bold text-[#031D3D] dark:text-white">198 <span className="text-slate-400 font-normal">(22%)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-slate-600 dark:text-slate-300">Cancelled</span>
                </div>
                <span className="font-bold text-[#031D3D] dark:text-white">52 <span className="text-slate-400 font-normal">(6%)</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Safety Alerts Feed matching Image 2 */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-[#031D3D] dark:text-white">Safety Alerts</h3>
              <button
                onClick={() => navigate('/admin/safety-alerts')}
                className="text-xs font-bold text-[#1267D6] dark:text-blue-400 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {safetyAlerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => navigate(`/admin/safety-alerts?id=${alert.id}`)}
                  className="p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/60 transition-colors cursor-pointer flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#031D3D] dark:text-white truncate">
                        {alert.userName}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {alert.locationName}
                      </p>
                      <span className="text-[9px] text-slate-400 block mt-0.5">
                        {alert.time}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                      alert.severity === 'High'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        : alert.severity === 'Medium'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. System Status Health matching Image 2 */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-[#031D3D] dark:text-white">System Status</h3>
              <button
                onClick={() => navigate('/admin/system')}
                className="text-xs font-bold text-[#1267D6] dark:text-blue-400 hover:underline cursor-pointer"
              >
                View Details
              </button>
            </div>

            <div className="mt-3.5 space-y-3 text-xs">
              {systemStatus.map((srv) => (
                <div key={srv.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{srv.name}</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800/60">
                    Online
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 text-[11px] text-slate-400 text-center">
            All systems fully operational • 99.98% uptime
          </div>
        </div>
      </div>
    </div>
  );
};
