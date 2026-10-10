import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
  Search,
  Filter,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  PhoneCall,
  User,
} from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { AdminSafetyAlert } from '../../types';
import { useNavigate } from 'react-router-dom';

export const AdminSafetyAlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AdminSafetyAlert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Acknowledged' | 'Resolved'>('All');
  const [selectedAlert, setSelectedAlert] = useState<AdminSafetyAlert | null>(null);

  const loadAlerts = () => {
    setAlerts(adminDataService.getSafetyAlerts());
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleUpdateStatus = (alertId: string, newStatus: 'Acknowledged' | 'Resolved') => {
    adminDataService.updateAlertStatus(alertId, newStatus);
    loadAlerts();
    if (selectedAlert && selectedAlert.id === alertId) {
      setSelectedAlert((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'All' || a.severity.toLowerCase() === severityFilter.toLowerCase();
    const matchesStatus = statusFilter === 'All' || a.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'high':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50';
      case 'medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50';
      default:
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50';
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st.toLowerCase()) {
      case 'active':
        return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 ring-1 ring-rose-500/30 animate-pulse';
      case 'acknowledged':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-amber-500/30';
      default:
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 ring-1 ring-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-rose-600 dark:text-rose-400" />
            Safety Alert Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time emergency telemetry, collision detection, and user SOS dispatches across the SAFRO network.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAlerts}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Feed
          </button>
          <button
            onClick={() => navigate('/admin/live-locations')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            View Live SOS on Map
          </button>
        </div>
      </div>

      {/* Metrics strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Alerts Today</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">14</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">↓ 32% vs last 7 days</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/40 rounded-xl p-4 shadow-sm bg-gradient-to-br from-rose-50/30 to-transparent dark:from-rose-950/20">
          <div className="text-xs font-medium text-rose-600 dark:text-rose-400">Active High Priority</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">1</div>
          <div className="text-[11px] text-rose-500 font-semibold mt-1">Immediate response required</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/40 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-amber-600 dark:text-amber-400">Acknowledged / In Review</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">2</div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">Support team dispatched</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/40 rounded-xl p-4 shadow-sm">
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Resolved Today</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">11</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Avg turnaround: 4.2 mins</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by user, ID, location, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Severity filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Severity:
            </span>
            {(['All', 'High', 'Medium', 'Low'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  severityFilter === sev
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            {(['All', 'Active', 'Acknowledged', 'Resolved'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table of Alerts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    No safety alerts match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {alert.userAvatar ? (
                          <img
                            src={alert.userAvatar}
                            alt={alert.userName}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                            {alert.userName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                            {alert.userName}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            {alert.userId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium text-xs">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        {alert.locationName}
                      </div>
                      {alert.coords && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {alert.coords[0].toFixed(4)}, {alert.coords[1].toFixed(4)}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {alert.time}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(alert.status)}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-xs text-slate-600 dark:text-slate-300" title={alert.description}>
                      {alert.description}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          View
                        </button>
                        {alert.status === 'Active' && (
                          <button
                            onClick={() => handleUpdateStatus(alert.id, 'Acknowledged')}
                            className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                          >
                            Acknowledge
                          </button>
                        )}
                        {alert.status !== 'Resolved' && (
                          <button
                            onClick={() => handleUpdateStatus(alert.id, 'Resolved')}
                            className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Emergency Alert Incident</h3>
                  <p className="text-xs text-slate-400 font-mono">Incident #{selectedAlert.id.toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-sm">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 text-xs">User Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedAlert.userName} ({selectedAlert.userId})</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 text-xs">Incident Severity</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getSeverityBadge(selectedAlert.severity)}`}>
                  {selectedAlert.severity}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 text-xs">Current Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(selectedAlert.status)}`}>
                  {selectedAlert.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 text-xs">Location</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{selectedAlert.locationName}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 dark:text-slate-400 text-xs">Timestamp</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{selectedAlert.time}</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase text-slate-400 mb-1">Telemetry Diagnostics</div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg">
                {selectedAlert.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setSelectedAlert(null);
                  navigate('/admin/live-locations');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <MapPin className="w-3.5 h-3.5" />
                Track live on map →
              </button>
              <div className="flex items-center gap-2">
                {selectedAlert.status === 'Active' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'Acknowledged')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                  >
                    Mark Acknowledged
                  </button>
                )}
                {selectedAlert.status !== 'Resolved' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedAlert.id, 'Resolved')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                  >
                    Mark Resolved
                  </button>
                )}
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
