import React, { useState, useEffect, useCallback } from 'react';
import { Leaf, RefreshCw, TrendingDown, Fuel, DollarSign, Wind, BarChart2, Download, Navigation, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Profile {
  id: number;
  profileName: string;
  vehicleType: string;
  fuelType: string;
  efficiency: number;
  efficiencyUnit: string;
}

interface ComparisonResult {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  profile: { profileName: string; fuelType: string; efficiency: number };
  baseline: { distanceKm: number; durationMin: number; source: string };
  optimized: { distanceKm: number; durationMin: number; source: string };
  metrics: {
    baseline: { consumption: number; co2Kg: number; costInr: number; unit: string };
    optimized: { consumption: number; co2Kg: number; costInr: number; unit: string };
    savings: { distanceSavedKm: number; timeSavedMin: number; distanceSavedPct: number; co2SavedKg: number; fuelSavedCostInr: number };
  };
}

interface AggregateSummary {
  routeCount: number;
  distanceSavedKm: number;
  co2SavedKg: number;
  costSavedInr: number;
  avgImprovementPct: number;
}

const FUEL_COLORS: Record<string, string> = {
  DIESEL: 'text-amber-400',
  PETROL: 'text-orange-400',
  CNG: 'text-sky-400',
  ELECTRIC: 'text-emerald-400',
  LPG: 'text-violet-400',
};

export const FuelCarbonPanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [originLat, setOriginLat] = useState('26.1445');
  const [originLng, setOriginLng] = useState('91.7362');
  const [destLat, setDestLat] = useState('27.5861');
  const [destLng, setDestLng] = useState('91.8594');
  const [originName, setOriginName] = useState('Guwahati');
  const [destName, setDestName] = useState('Tawang');
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [aggregate, setAggregate] = useState<AggregateSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [aggLoading, setAggLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('niel_token');
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!token) return;
    fetch('/api/v1/features/fuel-carbon-analytics/profiles', { headers: authHeaders })
      .then(r => r.json())
      .then(d => { setProfiles(d.profiles || []); if (d.profiles?.length) setSelectedProfile(String(d.profiles[0].id)); })
      .catch(() => {});

    setAggLoading(true);
    fetch('/api/v1/features/fuel-carbon-analytics/summary', { headers: authHeaders })
      .then(r => r.json())
      .then(d => { if (d.summary?.totals) setAggregate(d.summary.totals); })
      .catch(() => {})
      .finally(() => setAggLoading(false));
  }, [token]);

  const handleCompare = useCallback(async () => {
    if (!selectedProfile) { setError('Select a vehicle profile'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/v1/features/fuel-carbon-analytics/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          originLat: Number(originLat), originLng: Number(originLng),
          destinationLat: Number(destLat), destinationLng: Number(destLng),
          profileId: Number(selectedProfile),
          originName, destinationName: destName,
          persist: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Comparison failed'); return; }
      setResult(data.comparison);
    } catch {
      setError('Network error — check backend');
    } finally {
      setLoading(false);
    }
  }, [selectedProfile, originLat, originLng, destLat, destLng, originName, destName, token]);

  const handleDownloadCSV = async () => {
    if (!token) return;
    const url = `/api/v1/features/fuel-carbon-analytics/report?format=csv`;
    const res = await fetch(url, { headers: authHeaders });
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'fuel-carbon-report.csv';
    a.click();
  };

  const selectedProfileObj = profiles.find(p => String(p.id) === selectedProfile);

  return (
    <div className="absolute left-20 top-4 bottom-4 w-[440px] z-30 flex flex-col gap-3 overflow-hidden">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Fuel & Carbon Analytics</h2>
            <p className="text-xs text-slate-400">CO₂ savings · Fuel efficiency · INR cost</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500/20 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all"
            title="Download CSV Report"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all flex items-center justify-center text-xs font-bold">✕</button>
          )}
        </div>
      </div>

      {/* Fleet aggregate */}
      {!aggLoading && aggregate && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Routes Compared', value: String(aggregate.routeCount || 0), icon: <BarChart2 className="w-3.5 h-3.5" />, color: 'text-slate-300' },
            { label: 'Avg Improvement', value: `${Number(aggregate.avgImprovementPct || 0).toFixed(1)}%`, icon: <TrendingDown className="w-3.5 h-3.5" />, color: 'text-emerald-400' },
            { label: 'CO₂ Saved', value: `${Number(aggregate.co2SavedKg || 0).toFixed(1)} kg`, icon: <Wind className="w-3.5 h-3.5" />, color: 'text-sky-400' },
            { label: 'Cost Saved', value: `₹${Math.round(Number(aggregate.costSavedInr || 0)).toLocaleString()}`, icon: <DollarSign className="w-3.5 h-3.5" />, color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="glass-panel rounded-xl p-3 border border-white/10">
              <div className={`flex items-center gap-1.5 ${s.color} mb-0.5`}>
                {s.icon}
                <span className="text-base font-bold">{s.value}</span>
              </div>
              <div className="text-slate-400 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {/* Comparison form */}
        <div className="glass-panel rounded-xl p-4 border border-white/10 space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Route Comparison</h3>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Vehicle Profile</label>
            <select
              value={selectedProfile}
              onChange={e => setSelectedProfile(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400/40 focus:outline-none transition-all"
            >
              <option value="">— Select profile —</option>
              {profiles.map(p => (
                <option key={p.id} value={String(p.id)}>
                  {p.profileName} · {p.fuelType} · {p.efficiency} {p.efficiencyUnit}
                </option>
              ))}
            </select>
            {selectedProfileObj && (
              <p className={`text-xs mt-1 ${FUEL_COLORS[selectedProfileObj.fuelType] || 'text-slate-400'}`}>
                {selectedProfileObj.vehicleType} · {selectedProfileObj.fuelType}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Origin Name', value: originName, set: setOriginName },
              { label: 'Dest Name', value: destName, set: setDestName },
              { label: 'Origin Lat', value: originLat, set: setOriginLat },
              { label: 'Origin Lng', value: originLng, set: setOriginLng },
              { label: 'Dest Lat', value: destLat, set: setDestLat },
              { label: 'Dest Lng', value: destLng, set: setDestLng },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs text-slate-400 block mb-1">{f.label}</label>
                <input
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-400/40 focus:outline-none transition-all"
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}

          <button
            onClick={handleCompare}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            {loading ? 'Comparing…' : 'Run Comparison'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="glass-panel rounded-xl p-4 border border-emerald-500/25 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                {result.profile?.profileName} · {originName} → {destName}
              </h3>
            </div>

            {/* Baseline vs Optimized */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Baseline', d: result.metrics.baseline, route: result.baseline, color: 'border-slate-500/30' },
                { label: 'Optimized', d: result.metrics.optimized, route: result.optimized, color: 'border-emerald-500/30' },
              ].map(col => (
                <div key={col.label} className={`rounded-xl p-3 border ${col.color} bg-white/5`}>
                  <div className="text-xs font-bold text-slate-300 mb-2 uppercase">{col.label}</div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-slate-400">Distance</span><span className="text-white">{col.route.distanceKm?.toFixed(1)} km</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Fuel</span><span className="text-amber-300">{col.d.consumption?.toFixed(2)} {col.d.unit}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">CO₂</span><span className="text-sky-300">{col.d.co2Kg?.toFixed(2)} kg</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Cost</span><span className="text-white">₹{Math.round(col.d.costInr || 0).toLocaleString()}</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Savings */}
            <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-500/25">
              <div className="text-xs font-bold text-emerald-300 mb-2 uppercase">💚 Savings</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Distance</span><span className="text-emerald-300">−{result.metrics.savings.distanceSavedKm?.toFixed(1)} km ({result.metrics.savings.distanceSavedPct?.toFixed(1)}%)</span></div>
                <div className="flex justify-between"><span className="text-slate-400">CO₂</span><span className="text-sky-300">−{result.metrics.savings.co2SavedKg?.toFixed(2)} kg</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Cost</span><span className="text-amber-300">−₹{Math.round(result.metrics.savings.fuelSavedCostInr || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Time</span><span className="text-white">−{Math.round(result.metrics.savings.timeSavedMin || 0)} min</span></div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Fuel className="w-3 h-3" />
              Optimized via NIEL routing engine · Source: {result.optimized?.source}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
