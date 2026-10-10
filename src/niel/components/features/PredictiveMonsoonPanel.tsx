import React, { useState, useEffect, useCallback } from 'react';
import { CloudRain, RefreshCw, BarChart2, MapPin, Zap, Shield, AlertTriangle, Play } from 'lucide-react';

interface HeatmapSummary {
  total: number;
  high: number;
  critical: number;
  districts: string[];
  dataCoverage: string;
}

interface DistrictRisk {
  district: string;
  avgScore: number;
  riskLevel: string;
  roadCount: number;
  highCount: number;
  criticalCount: number;
}

interface MonsoonMetrics {
  modelVersion: string;
  cache: { total: number; valid: number; expired: number };
  runs: { total: number; successful: number; failed: number };
  latestRun: { started_at: string; status: string; summary: any } | null;
  inputs: { roads: number; incidents: number; incidentsWithCoords: number };
}

const RISK_COLORS: Record<string, string> = {
  LOW: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  MEDIUM: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  HIGH: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
  CRITICAL: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const PredictiveMonsoonPanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [summary, setSummary] = useState<HeatmapSummary | null>(null);
  const [districts, setDistricts] = useState<DistrictRisk[]>([]);
  const [metrics, setMetrics] = useState<MonsoonMetrics | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const token = localStorage.getItem('niel_token');
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [riskRes, metricsRes] = await Promise.all([
        fetch(`/api/v1/features/predictive-monsoon/risk?month=${selectedMonth}`, { headers: authHeaders }),
        fetch('/api/v1/features/predictive-monsoon/metrics', { headers: authHeaders }),
      ]);

      if (riskRes.ok) {
        const d = await riskRes.json();
        setSummary(d.summary || null);
        setDistricts(d.districts || []);
      }
      if (metricsRes.ok) {
        const m = await metricsRes.json();
        setMetrics(m);
      }

      // Detect admin from JWT payload
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setIsAdmin(payload.role === 'admin');
        } catch {}
      }
    } catch (err) {
      console.warn('[MonsoonPanel] load error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, token]);

  useEffect(() => { load(); }, [load]);

  const handleRun = async () => {
    if (!token) return;
    setRunning(true);
    try {
      await fetch('/api/v1/features/predictive-monsoon/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ months: [selectedMonth], force: true }),
      });
      await load();
    } catch {}
    setRunning(false);
  };

  const monsoonMonths = [6, 7, 8, 9]; // Jun–Sep NER monsoon window

  return (
    <div className="absolute left-20 top-4 bottom-4 w-[440px] z-30 flex flex-col gap-3 overflow-hidden">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
            <CloudRain className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Predictive Monsoon</h2>
            <p className="text-xs text-slate-400">NER road risk heatmap · explainable AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold hover:bg-sky-500/30 transition-all disabled:opacity-50"
            >
              {running ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              {running ? 'Running…' : 'Re-run'}
            </button>
          )}
          <button onClick={load} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all flex items-center justify-center text-xs font-bold">✕</button>
          )}
        </div>
      </div>

      {/* Month selector */}
      <div className="glass-panel rounded-xl p-3 border border-white/10">
        <p className="text-xs text-slate-400 mb-2">Select month</p>
        <div className="grid grid-cols-6 gap-1">
          {MONTHS.map((m, i) => {
            const month = i + 1;
            const isMonsoon = monsoonMonths.includes(month);
            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(month)}
                className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedMonth === month
                    ? 'bg-sky-500/25 text-sky-300 border-sky-400/40'
                    : isMonsoon
                    ? 'bg-blue-500/10 text-blue-300 border-blue-500/20 hover:border-blue-400/40'
                    : 'bg-white/5 text-slate-400 border-white/8 hover:border-white/20'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          <span className="text-blue-400">■</span> Peak monsoon months (Jun–Sep)
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {/* Summary cards */}
        {loading ? (
          <div className="flex items-center justify-center h-24 text-slate-400 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading heatmap…
          </div>
        ) : summary ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Road Segments', value: summary.total, icon: <MapPin className="w-4 h-4" />, color: 'text-slate-300' },
                { label: 'Coverage', value: summary.dataCoverage || 'n/a', icon: <Shield className="w-4 h-4" />, color: 'text-emerald-400' },
                { label: 'High Risk', value: summary.high, icon: <AlertTriangle className="w-4 h-4" />, color: 'text-orange-400' },
                { label: 'Critical', value: summary.critical, icon: <Zap className="w-4 h-4" />, color: 'text-rose-400' },
              ].map(s => (
                <div key={s.label} className="glass-panel rounded-xl p-3 border border-white/10">
                  <div className={`flex items-center gap-2 ${s.color} mb-1`}>
                    {s.icon}
                    <span className="text-lg font-bold">{s.value}</span>
                  </div>
                  <div className="text-slate-400 text-xs">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Districts table */}
            {districts.length > 0 && (
              <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8">
                  <BarChart2 className="w-3.5 h-3.5 text-sky-400" />
                  <h3 className="text-xs font-semibold text-white">District Risk Summary</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {districts.slice(0, 12).map((d, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="text-white text-xs font-medium truncate">{d.district}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-xs text-slate-400">{d.roadCount} roads</div>
                          <div className="text-xs text-rose-400">{d.criticalCount} critical</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full border text-xs font-bold ${RISK_COLORS[d.riskLevel] || 'text-slate-400 bg-white/5 border-white/10'}`}>
                          {d.riskLevel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="glass-panel rounded-xl p-6 text-center border border-white/10">
            <CloudRain className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No heatmap data for month {selectedMonth}</p>
            <p className="text-slate-500 text-xs mt-1">
              {isAdmin ? 'Click "Re-run" to generate the risk model' : 'Contact admin to regenerate the model'}
            </p>
          </div>
        )}

        {/* Pipeline metrics */}
        {metrics && (
          <div className="glass-panel rounded-xl p-4 border border-sky-500/20">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Pipeline Status</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Model Version</span>
                <span className="font-mono">{metrics.modelVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Road network</span>
                <span className="text-white">{metrics.inputs?.roads} segments</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Historical incidents</span>
                <span className="text-white">{metrics.inputs?.incidents} ({metrics.inputs?.incidentsWithCoords} geo-tagged)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cache entries</span>
                <span className="text-white">{metrics.cache?.valid} valid / {metrics.cache?.expired} expired</span>
              </div>
              {metrics.latestRun && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Last run</span>
                  <span className={metrics.latestRun.status === 'completed' ? 'text-emerald-400' : 'text-rose-400'}>
                    {new Date(metrics.latestRun.started_at).toLocaleString()} · {metrics.latestRun.status}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
