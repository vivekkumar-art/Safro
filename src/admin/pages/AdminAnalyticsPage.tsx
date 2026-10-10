import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Users,
  Car,
  ShieldAlert,
  Bell,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  // Chart telemetry data
  const activityData7d = [
    { label: 'Apr 23', active: 3100, total: 4200 },
    { label: 'Apr 24', active: 3400, total: 4600 },
    { label: 'Apr 25', active: 4100, total: 5300 },
    { label: 'Apr 26', active: 4500, total: 6100 },
    { label: 'Apr 27', active: 5200, total: 7200 },
    { label: 'Apr 28', active: 5900, total: 7900 },
    { label: 'Apr 29', active: 6327, total: 8542 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep dive into user acquisition, live telemetry utilization, emergency trip completions, and platform safety scores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Range picker */}
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700/80 text-xs">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  timeRange === r
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'Last 3 Months'}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Safety Index Score</span>
            <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +4.2%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">99.4%</div>
          <div className="text-xs text-slate-400 mt-1">Incident-free trips across Dehradun</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Avg Emergency Response</span>
            <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> -38s faster
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">2m 45s</div>
          <div className="text-xs text-slate-400 mt-1">From trigger to guardian contact</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Trip Completion Rate</span>
            <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +2.1%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">94.2%</div>
          <div className="text-xs text-slate-400 mt-1">642 completed out of 892 active trips</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Push Delivery Reliability</span>
            <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +0.8%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">99.8%</div>
          <div className="text-xs text-slate-400 mt-1">12,684 instant native device alerts</div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth & Engagement Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                User Adoption & Active Trajectory
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparison of Total Registered Users vs Daily Active Users
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span>Active Users</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                <span>Total Users</span>
              </div>
            </div>
          </div>

          {/* SVG Vector Interactive Line Chart */}
          <div className="h-64 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 240">
              <defs>
                <linearGradient id="analyticsGradBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 60, 120, 180, 240].map((y) => (
                <line
                  key={y}
                  x1="40"
                  y1={y}
                  x2="680"
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="1"
                />
              ))}

              {/* Y Axis Labels */}
              <text x="5" y="10" className="text-[10px] fill-slate-400">10K</text>
              <text x="5" y="70" className="text-[10px] fill-slate-400">7.5K</text>
              <text x="5" y="130" className="text-[10px] fill-slate-400">5K</text>
              <text x="5" y="190" className="text-[10px] fill-slate-400">2.5K</text>
              <text x="15" y="235" className="text-[10px] fill-slate-400">0</text>

              {/* Total Users Line (Grey) */}
              <path
                d="M 60 140 Q 150 120, 250 100 T 450 60 T 660 35"
                fill="none"
                stroke="currentColor"
                className="text-slate-300 dark:text-slate-600"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />

              {/* Active Users Area Gradient */}
              <path
                d="M 60 165 Q 150 155, 250 135 T 450 105 T 660 85 L 660 240 L 60 240 Z"
                fill="url(#analyticsGradBlue)"
              />

              {/* Active Users Line */}
              <path
                d="M 60 165 Q 150 155, 250 135 T 450 105 T 660 85"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3.5"
              />

              {/* Data points */}
              {[
                { cx: 60, cy: 165, val: '3.1K' },
                { cx: 160, cy: 155, val: '3.4K' },
                { cx: 260, cy: 135, val: '4.1K' },
                { cx: 360, cy: 120, val: '4.5K' },
                { cx: 460, cy: 105, val: '5.2K' },
                { cx: 560, cy: 95, val: '5.9K' },
                { cx: 660, cy: 85, val: '6.3K' },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.cx} cy={pt.cy} r="5" fill="#2563eb" className="stroke-white dark:stroke-slate-900" strokeWidth="2" />
                  <text x={pt.cx} y={235} textAnchor="middle" className="text-[10px] fill-slate-400">
                    {activityData7d[i].label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center mt-2">
            <div>
              <div className="text-xs text-slate-400">New Registrations</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">+482</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Daily Active Ratio</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">74.1%</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Retention 30D</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">88.6%</div>
            </div>
          </div>
        </div>

        {/* Trips & Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Trip Status Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live distribution of 892 concurrent trips
            </p>

            <div className="flex items-center justify-center my-6">
              <div className="relative w-44 h-44">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="14" fill="none" className="dark:stroke-slate-800" />
                  {/* Completed: 72% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#10b981"
                    strokeWidth="14"
                    strokeDasharray="172 239"
                    strokeDashoffset="0"
                    fill="none"
                  />
                  {/* In Progress: 22% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#3b82f6"
                    strokeWidth="14"
                    strokeDasharray="52 239"
                    strokeDashoffset="-172"
                    fill="none"
                  />
                  {/* Cancelled: 6% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#ef4444"
                    strokeWidth="14"
                    strokeDasharray="15 239"
                    strokeDashoffset="-224"
                    fill="none"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">892</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Trips</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Completed Safely</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white">642 <span className="text-slate-400 font-normal">(72%)</span></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">In Transit / Live</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white">198 <span className="text-slate-400 font-normal">(22%)</span></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Cancelled / Stopped</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white">52 <span className="text-slate-400 font-normal">(6%)</span></div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
            Updated continuously via WebSockets & GPS telemetry
          </div>
        </div>
      </div>
    </div>
  );
};
