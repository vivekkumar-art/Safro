import React, { useState, useEffect, useCallback } from 'react';
import { Users, CheckCircle2, Clock, XCircle, RefreshCw, MapPin, Camera, Shield, ChevronRight, AlertTriangle } from 'lucide-react';

interface CitizenReport {
  id: number;
  description: string;
  incident_type: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'RESOLVED';
  location_name: string;
  district: string;
  severity: string;
  photo_url: string | null;
  created_at: string;
  identifier_name?: string;
}

interface CitizenCrowdsourcingPanelProps {
  onClose?: () => void;
}

const STATUS_CONFIG = {
  PENDING: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', label: 'Pending Review' },
  VERIFIED: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', label: 'Verified' },
  REJECTED: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30', label: 'Rejected' },
  RESOLVED: { icon: CheckCircle2, color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/30', label: 'Resolved' },
};

const SEVERITY_COLORS: Record<string, string> = {
  LOW: 'text-sky-400',
  MODERATE: 'text-amber-400',
  HIGH: 'text-orange-400',
  CRITICAL: 'text-rose-400',
};

export const CitizenCrowdsourcingPanel: React.FC<CitizenCrowdsourcingPanelProps> = ({ onClose }) => {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'RESOLVED'>('ALL');
  const [stats, setStats] = useState({ pending: 0, verified: 0, resolved: 0, total: 0 });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('niel_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/v1/features/citizen-crowdsourcing/reports?limit=50', { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rows: CitizenReport[] = data.reports || data.data || [];
      setReports(rows);

      const s = { pending: 0, verified: 0, resolved: 0, total: rows.length };
      for (const r of rows) {
        if (r.status === 'PENDING') s.pending++;
        else if (r.status === 'VERIFIED') s.verified++;
        else if (r.status === 'RESOLVED') s.resolved++;
      }
      setStats(s);
    } catch (err) {
      console.warn('[CitizenPanel] fetch error:', err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const visible = filter === 'ALL' ? reports : reports.filter(r => r.status === filter);

  return (
    <div className="absolute left-20 top-4 bottom-4 w-[420px] z-30 flex flex-col gap-3 overflow-hidden">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center">
            <Users className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Citizen Crowdsourcing</h2>
            <p className="text-xs text-slate-400">Community incident reports</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReports}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all flex items-center justify-center text-xs font-bold">✕</button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Pending', value: stats.pending, color: 'text-amber-400', bg: 'border-amber-500/20' },
          { label: 'Verified', value: stats.verified, color: 'text-emerald-400', bg: 'border-emerald-500/20' },
          { label: 'Resolved', value: stats.resolved, color: 'text-cyan-400', bg: 'border-cyan-500/20' },
        ].map(s => (
          <div key={s.label} className={`glass-panel rounded-xl p-3 border ${s.bg} text-center`}>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'PENDING', 'VERIFIED', 'RESOLVED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
              filter === f
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
            }`}
          >
            {f === 'ALL' ? `All (${stats.total})` : f}
          </button>
        ))}
      </div>

      {/* Reports list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading reports...
          </div>
        ) : visible.length === 0 ? (
          <div className="glass-panel rounded-xl p-6 text-center border border-white/10">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No reports found</p>
            <p className="text-slate-500 text-xs mt-1">Citizens can submit field reports from the incident modal</p>
          </div>
        ) : (
          visible.map(report => {
            const s = STATUS_CONFIG[report.status] || STATUS_CONFIG.PENDING;
            const StatusIcon = s.icon;
            return (
              <div key={report.id} className={`glass-panel rounded-xl p-3.5 border ${s.bg} transition-all hover:scale-[1.01]`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${s.bg} ${s.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {s.label}
                      </span>
                      {report.severity && (
                        <span className={`text-xs font-bold ${SEVERITY_COLORS[report.severity] || 'text-slate-400'}`}>
                          {report.severity}
                        </span>
                      )}
                    </div>
                    <p className="text-white text-sm font-medium line-clamp-2 leading-snug">{report.description || report.incident_type}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {report.district || report.location_name || 'Unknown'}
                      </span>
                      {report.photo_url && (
                        <span className="text-violet-400 text-xs flex items-center gap-1">
                          <Camera className="w-3 h-3" /> Photo attached
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-slate-500 text-xs text-right shrink-0">
                    <div>#{report.id}</div>
                    <div className="mt-1">{report.created_at ? new Date(report.created_at).toLocaleDateString() : ''}</div>
                  </div>
                </div>
                {report.identifier_name && (
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1 text-xs text-slate-500">
                    <Shield className="w-3 h-3" /> Reported by: {report.identifier_name}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Submit CTA */}
      <div className="glass-panel rounded-xl p-3 border border-violet-500/20">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-violet-400 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-white font-medium">Spotted an incident?</p>
            <p className="text-xs text-slate-400">Use the incident report modal on the map</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>
    </div>
  );
};
