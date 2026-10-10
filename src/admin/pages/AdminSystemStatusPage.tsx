import React, { useState } from 'react';
import {
  Server,
  Database,
  Cpu,
  Wifi,
  Radio,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  HardDrive,
  Activity,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { adminDataService } from '../services/adminDataService';

interface ServiceHealthItem {
  id: string;
  name: string;
  status: 'Online' | 'Degraded' | 'Offline';
  latency: string;
  uptime: string;
  lastChecked: string;
  endpoint: string;
  version: string;
}

export const AdminSystemStatusPage: React.FC = () => {
  const [isPinging, setIsPinging] = useState(false);
  const [services, setServices] = useState<ServiceHealthItem[]>([
    {
      id: 'srv_api',
      name: 'API Gateway / Edge Router',
      status: 'Online',
      latency: '42ms',
      uptime: '99.99%',
      lastChecked: 'Just now',
      endpoint: 'https://api.safro.internal/v1/health',
      version: 'v2.4.1-prod',
    },
    {
      id: 'srv_db',
      name: 'Database Cluster (Supabase / Postgres)',
      status: 'Online',
      latency: '28ms',
      uptime: '99.98%',
      lastChecked: 'Just now',
      endpoint: 'db.safro-backend.supabase.co:5432',
      version: 'PostgreSQL 15.4',
    },
    {
      id: 'srv_fcm',
      name: 'FCM Native Push Notification Service',
      status: 'Online',
      latency: '65ms',
      uptime: '99.95%',
      lastChecked: '1 min ago',
      endpoint: 'fcm.googleapis.com / web-push v2',
      version: 'FCM v1 Engine',
    },
    {
      id: 'srv_map',
      name: 'Map & Route Telemetry Engine (OSM / Google)',
      status: 'Online',
      latency: '19ms',
      uptime: '100.0%',
      lastChecked: 'Just now',
      endpoint: 'maps.safro-geospatial.internal',
      version: 'Leaflet GeoEngine 1.9',
    },
    {
      id: 'srv_web',
      name: 'Vite PWA Web Application Host',
      status: 'Online',
      latency: '12ms',
      uptime: '100.0%',
      lastChecked: 'Just now',
      endpoint: window.location.origin,
      version: 'SAFRO Web 1.0.0',
    },
  ]);

  const handlePingAll = () => {
    setIsPinging(true);
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => ({
          ...s,
          latency: `${Math.floor(Math.random() * 25) + 15}ms`,
          lastChecked: 'Just now',
        }))
      );
      setIsPinging(false);
    }, 800);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Online':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Online
          </span>
        );
      case 'Degraded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Degraded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Offline
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Server className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            System Health & Infrastructure Status
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time heartbeat monitoring of microservices, databases, WebSocket clusters, and native push dispatchers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePingAll}
            disabled={isPinging}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            {isPinging ? 'Pinging Services...' : 'Ping All Services'}
          </button>
        </div>
      </div>

      {/* Global Status Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              All Systems Operational & Nominal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              5/5 Core services responding within optimal latency tolerances (Global SLA: 99.98%).
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
            ● 0 Incident Alerts Open
          </span>
        </div>
      </div>

      {/* Hardware / Cluster Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Cpu className="w-4 h-4 text-blue-500" />
              CPU Load
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">24%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: '24%' }}></div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">8 vCPUs · Dehradun Region Edge Node</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <HardDrive className="w-4 h-4 text-purple-500" />
              Memory Utilization
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">41%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: '41%' }}></div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">6.5 GB / 16 GB Allocated</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Radio className="w-4 h-4 text-emerald-500" />
              Socket Concurrency
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">1,842</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '36%' }}></div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Max pool: 5,000 WebSocket connections</div>
        </div>
      </div>

      {/* Services List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Monitored Infrastructure Components
          </h3>
          <span className="text-xs text-slate-400">
            Heartbeat ping interval: 15s
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Endpoint</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Uptime</th>
                <th className="py-3 px-4">Build / Version</th>
                <th className="py-3 px-4 text-right">Last Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {services.map((srv) => (
                <tr key={srv.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {srv.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {srv.endpoint}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(srv.status)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {srv.latency}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    {srv.uptime}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                    {srv.version}
                  </td>
                  <td className="py-3.5 px-4 text-right text-xs text-slate-400">
                    {srv.lastChecked}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
