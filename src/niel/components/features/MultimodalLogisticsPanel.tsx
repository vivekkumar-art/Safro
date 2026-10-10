import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Train, Plane, Ship, GitBranch, Navigation, Package, RefreshCw, CheckCircle2, AlertCircle, Sliders } from 'lucide-react';

interface RouteNode {
  id: number;
  name: string;
  nodeType: string;
  operationalStatus: string;
}

interface RouteLeg {
  from: string;
  to: string;
  mode: string;
  distanceKm: number;
  estimatedTimeMin: number;
  estimatedCostInr: number;
  riskScore: number;
}

interface RoutePlan {
  profile: string;
  totalDistanceKm: number;
  totalDurationMin: number;
  totalCostInr: number;
  totalCo2eKg: number;
  legs: RouteLeg[];
}

interface PlanResult {
  origin: string;
  destination: string;
  options: RoutePlan[];
  fallback?: boolean;
}

const MODE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  road: { icon: <Truck className="w-3.5 h-3.5" />, color: 'text-amber-400', label: 'Road' },
  rail: { icon: <Train className="w-3.5 h-3.5" />, color: 'text-cyan-400', label: 'Rail' },
  air: { icon: <Plane className="w-3.5 h-3.5" />, color: 'text-violet-400', label: 'Air' },
  water: { icon: <Ship className="w-3.5 h-3.5" />, color: 'text-sky-400', label: 'Water' },
};

const CARGO_TYPES = ['General', 'Medicine', 'Food', 'Fuel', 'Fragile', 'Military', 'Livestock'];
const WEIGHT_PRESETS = [
  { label: 'Fastest', time: 0.6, distance: 0.2, risk: 0.1, cost: 0.1 },
  { label: 'Cheapest', time: 0.1, distance: 0.2, risk: 0.1, cost: 0.6 },
  { label: 'Safest', time: 0.1, distance: 0.1, risk: 0.7, cost: 0.1 },
  { label: 'Balanced', time: 0.3, distance: 0.3, risk: 0.2, cost: 0.2 },
];

export const MultimodalLogisticsPanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [nodes, setNodes] = useState<RouteNode[]>([]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [cargoType, setCargoType] = useState('General');
  const [modes, setModes] = useState<string[]>(['road', 'rail']);
  const [weightPreset, setWeightPreset] = useState(3);
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nodesLoaded, setNodesLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('niel_token');
    if (!token) return;
    fetch('/api/v1/features/multimodal-logistics/nodes?limit=200', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { setNodes(d.nodes || []); setNodesLoaded(true); })
      .catch(() => setNodesLoaded(true));
  }, []);

  const toggleMode = (m: string) => {
    setModes(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const handlePlan = useCallback(async () => {
    if (!origin || !destination) { setError('Select origin and destination'); return; }
    if (origin === destination) { setError('Origin and destination must differ'); return; }
    if (modes.length === 0) { setError('Select at least one transport mode'); return; }
    setError(''); setLoading(true); setPlan(null);

    const token = localStorage.getItem('niel_token');
    const wp = WEIGHT_PRESETS[weightPreset];
    try {
      const res = await fetch('/api/v1/features/multimodal-logistics/routes/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          originNodeId: Number(origin),
          destinationNodeId: Number(destination),
          cargoType,
          allowedModes: modes,
          weights: { time: wp.time, distance: wp.distance, risk: wp.risk, cost: wp.cost },
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Planning failed'); return; }
      setPlan(data.plan);
    } catch {
      setError('Network error — check backend');
    } finally {
      setLoading(false);
    }
  }, [origin, destination, cargoType, modes, weightPreset]);

  return (
    <div className="absolute left-20 top-4 bottom-4 w-[440px] z-30 flex flex-col gap-3 overflow-hidden">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Multimodal Logistics</h2>
            <p className="text-xs text-slate-400">Road · Rail · Air · Water planner</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all flex items-center justify-center text-xs font-bold">✕</button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {/* Node selectors */}
        <div className="glass-panel rounded-xl p-4 border border-white/10 space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Route</h3>
          {!nodesLoaded && <p className="text-xs text-slate-500">Loading network nodes… (requires login)</p>}
          {['Origin', 'Destination'].map((label, i) => (
            <div key={label}>
              <label className="text-xs text-slate-400 block mb-1">{label} Node</label>
              <select
                value={i === 0 ? origin : destination}
                onChange={e => i === 0 ? setOrigin(e.target.value) : setDestination(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-400/40 focus:outline-none transition-all"
              >
                <option value="">— Select {label} —</option>
                {nodes.map(n => (
                  <option key={n.id} value={String(n.id)}>{n.name} ({n.nodeType})</option>
                ))}
              </select>
            </div>
          ))}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Cargo Type</label>
            <select
              value={cargoType}
              onChange={e => setCargoType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-400/40 focus:outline-none transition-all"
            >
              {CARGO_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Mode toggles */}
        <div className="glass-panel rounded-xl p-4 border border-white/10">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Transport Modes</h3>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(MODE_CONFIG).map(([mode, cfg]) => (
              <button
                key={mode}
                onClick={() => toggleMode(mode)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                  modes.includes(mode)
                    ? `${cfg.color} bg-white/10 border-current/40`
                    : 'text-slate-500 bg-white/3 border-white/8 hover:border-white/15'
                }`}
              >
                {cfg.icon}
                <span className="text-xs font-medium">{cfg.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Weight preset */}
        <div className="glass-panel rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Optimization Goal</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {WEIGHT_PRESETS.map((p, i) => (
              <button
                key={p.label}
                onClick={() => setWeightPreset(i)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  weightPreset === i
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plan button */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
          </div>
        )}
        <button
          onClick={handlePlan}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-300 text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          {loading ? 'Planning…' : 'Plan Multimodal Route'}
        </button>

        {/* Results */}
        {plan && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider px-1">
              Route Options: {plan.origin} → {plan.destination}
            </h3>
            {plan.fallback && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                <AlertCircle className="w-3.5 h-3.5" /> Multimodal path not found — showing road fallback
              </div>
            )}
            {(plan.options || []).map((opt, idx) => (
              <div key={idx} className="glass-panel rounded-xl p-4 border border-amber-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-300 uppercase">{opt.profile || `Option ${idx + 1}`}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: 'Distance', value: `${opt.totalDistanceKm?.toFixed(1)} km` },
                    { label: 'Duration', value: `${Math.round(opt.totalDurationMin || 0)} min` },
                    { label: 'Cost', value: `₹${Math.round(opt.totalCostInr || 0).toLocaleString()}` },
                    { label: 'CO₂e', value: `${opt.totalCo2eKg?.toFixed(1)} kg` },
                  ].map(m => (
                    <div key={m.label} className="bg-white/5 rounded-lg p-2 text-center">
                      <div className="text-white text-sm font-bold">{m.value}</div>
                      <div className="text-slate-400 text-xs">{m.label}</div>
                    </div>
                  ))}
                </div>
                {(opt.legs || []).map((leg, li) => {
                  const mc = MODE_CONFIG[leg.mode] || { icon: <Package className="w-3.5 h-3.5" />, color: 'text-slate-400', label: leg.mode };
                  return (
                    <div key={li} className={`flex items-center gap-2 py-1.5 border-t border-white/5 text-xs ${mc.color}`}>
                      {mc.icon}
                      <span className="text-white flex-1">{leg.from} → {leg.to}</span>
                      <span>{leg.distanceKm?.toFixed(1)} km</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
