import React, { useState } from 'react';
import {
  Activity,
  Search,
  Filter,
  ShieldAlert,
  Car,
  UserCheck,
  Bell,
  Navigation,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { AdminActivityItem } from '../../types';

interface ExtendedActivityItem extends AdminActivityItem {
  details?: string;
  ipAddress?: string;
  category?: 'security' | 'trip' | 'user' | 'broadcast' | 'routing';
}

const INITIAL_EXTENDED_LOGS: ExtendedActivityItem[] = [
  {
    id: 'act_1',
    title: 'Safety Alert Triggered',
    user: 'Rohit Verma (SAF12345)',
    time: '2 mins ago',
    type: 'alert',
    badge: 'High',
    badgeVariant: 'rose',
    details: 'Sudden deceleration (58 km/h to 0 km/h) & SOS trigger near Clock Tower, Dehradun.',
    ipAddress: '157.34.192.11',
    category: 'security',
  },
  {
    id: 'act_2',
    title: 'Trip Started',
    user: 'Priya Sharma (SAF48291)',
    time: '5 mins ago',
    type: 'trip',
    badge: 'Normal',
    badgeVariant: 'emerald',
    details: 'Navigating Rajpur Road -> Mussoorie View Point (24.2 km). Telemetry stream online.',
    ipAddress: '106.51.78.44',
    category: 'trip',
  },
  {
    id: 'act_3',
    title: 'New User Registered',
    user: 'Ankit Mehta (SAF99231)',
    time: '12 mins ago',
    type: 'user',
    badge: 'Info',
    badgeVariant: 'blue',
    details: 'Email verification verified and emergency contacts configured (2 contacts added).',
    ipAddress: '49.36.12.98',
    category: 'user',
  },
  {
    id: 'act_4',
    title: 'Push Notification Broadcast',
    user: 'System Admin (Super Admin)',
    time: '18 mins ago',
    type: 'notification',
    badge: 'Success',
    badgeVariant: 'purple',
    details: 'Broadcast delivered to 1,842 online users: "SAFRO Monsoon Safe Driving Protocols".',
    ipAddress: '127.0.0.1 (Panel)',
    category: 'broadcast',
  },
  {
    id: 'act_5',
    title: 'Route Recalculated',
    user: 'Neha Joshi (SAF30192)',
    time: '24 mins ago',
    type: 'route',
    badge: 'Warning',
    badgeVariant: 'amber',
    details: 'Hazard avoidance recalculation due to construction work near ISBT Dehradun.',
    ipAddress: '182.73.49.12',
    category: 'routing',
  },
  {
    id: 'act_6',
    title: 'Admin Session Login',
    user: 'Admin (admin@safro.com)',
    time: '45 mins ago',
    type: 'user',
    badge: 'Info',
    badgeVariant: 'blue',
    details: 'Two-factor authorized administrative login to SAFRO Control Station.',
    ipAddress: '192.168.1.104',
    category: 'security',
  },
  {
    id: 'act_7',
    title: 'Trip Completed Successfully',
    user: 'Karan Mehra (SAF66120)',
    time: '1 hr ago',
    type: 'trip',
    badge: 'Normal',
    badgeVariant: 'emerald',
    details: 'Arrived at destination Jolly Grant Airport on schedule. Safe arrival confirmed.',
    ipAddress: '117.211.89.33',
    category: 'trip',
  },
  {
    id: 'act_8',
    title: 'Emergency Contact Verified',
    user: 'Divya Rawat (SAF81903)',
    time: '1.5 hrs ago',
    type: 'user',
    badge: 'Info',
    badgeVariant: 'blue',
    details: 'SMS OTP verification handshake completed for guardian primary contact.',
    ipAddress: '223.187.9.61',
    category: 'user',
  },
];

export const AdminActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ExtendedActivityItem[]>(INITIAL_EXTENDED_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'alert' | 'trip' | 'user' | 'notification' | 'route'>('All');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'All' || log.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'trip':
        return <Car className="w-4 h-4 text-emerald-500" />;
      case 'user':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case 'notification':
        return <Bell className="w-4 h-4 text-purple-500" />;
      case 'route':
        return <Navigation className="w-4 h-4 text-amber-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  const getBadgeStyle = (variant: string) => {
    switch (variant) {
      case 'rose':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400';
      case 'emerald':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400';
      case 'blue':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400';
      case 'purple':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400';
      case 'amber':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const exportAsCsv = () => {
    const rows = [
      ['ID', 'Title', 'User', 'Time', 'Type', 'Badge', 'IP', 'Details'],
      ...filteredLogs.map((l) => [
        l.id,
        l.title,
        l.user,
        l.time,
        l.type,
        l.badge,
        l.ipAddress || '',
        l.details || '',
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map(item => `"${item}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SAFRO_Activity_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            System Activity & Audit Logs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable chronological audit trail of telemetry events, emergency trips, and administrative actions.
          </p>
        </div>
        <button
          onClick={exportAsCsv}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export Audit CSV
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events, user names, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs w-full md:w-auto">
          <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter by:
          </span>
          {(['All', 'alert', 'trip', 'user', 'notification', 'route'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-md font-semibold capitalize transition-all ${
                typeFilter === type
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {type === 'All' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            Showing {filteredLogs.length} events
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Live Streaming (UTC+5:30)
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Layers className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              No activity logs match your filter criteria.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 sm:px-6 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {getLogIcon(log.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {log.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${getBadgeStyle(log.badgeVariant)}`}>
                        {log.badge}
                      </span>
                      <span className="text-xs text-slate-400">· {log.time}</span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                      Subject: <span className="text-blue-600 dark:text-blue-400 font-semibold">{log.user}</span>
                    </div>

                    {log.details && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        {log.details}
                      </p>
                    )}
                  </div>
                </div>

                {log.ipAddress && (
                  <div className="sm:text-right shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      IP: {log.ipAddress}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
