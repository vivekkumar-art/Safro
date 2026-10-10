// ==============================================================================
// SAFRO ADMIN ROUTES & ACTIVE TRIPS PAGE
// Active trips monitoring table with speed, ETA, and distance in light & dark mode
// ==============================================================================

import React, { useState } from 'react';
import { Route, MapPin, Clock, ExternalLink, Search, CheckCircle, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MockAdminRouteTrip {
  id: string;
  userId: string;
  userName: string;
  startLocation: string;
  destination: string;
  distanceKm: number;
  eta: string;
  status: 'In Progress' | 'Completed' | 'Delayed' | 'Rerouted';
  startedAt: string;
  speedKmH: number;
}

const INITIAL_TRIPS: MockAdminRouteTrip[] = [
  {
    id: 'TRIP_DEH_01',
    userId: 'SAF48291',
    userName: 'Priya Sharma',
    startLocation: 'Dehradun Railway Station',
    destination: 'Mussoorie View Point',
    distanceKm: 34.2,
    eta: '45 mins',
    status: 'In Progress',
    startedAt: '10:15 AM',
    speedKmH: 42,
  },
  {
    id: 'TRIP_DEH_02',
    userId: 'SAF12345',
    userName: 'Rohit Verma',
    startLocation: 'Clock Tower, Dehradun',
    destination: 'Pacific Mall, Dehradun',
    distanceKm: 8.4,
    eta: 'Stopped',
    status: 'Delayed',
    startedAt: '10:20 AM',
    speedKmH: 0,
  },
  {
    id: 'TRIP_DEH_03',
    userId: 'SAF30192',
    userName: 'Neha Joshi',
    startLocation: 'ISBT Dehradun',
    destination: 'Rishikesh Bypass',
    distanceKm: 46.0,
    eta: '1h 12m',
    status: 'Rerouted',
    startedAt: '09:45 AM',
    speedKmH: 28,
  },
  {
    id: 'TRIP_MANALI_01',
    userId: 'SAF91024',
    userName: 'Aarav Singh',
    startLocation: 'Mall Road, Manali',
    destination: 'Solang Valley Adventure Point',
    distanceKm: 14.5,
    eta: '25 mins',
    status: 'In Progress',
    startedAt: '10:00 AM',
    speedKmH: 38,
  },
];

export const AdminRoutesPage: React.FC = () => {
  const [trips, setTrips] = useState<MockAdminRouteTrip[]>(INITIAL_TRIPS);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = trips.filter(
    (t) =>
      t.userName.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#031D3D] dark:text-white tracking-tight">
            Routes & Live Trips Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Active navigation routes, turn-by-turn bypasses, and live vehicle speed
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
            {filtered.length} Active Routes
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trip ID, user, or destination..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-[#031D3D] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1267D6]"
          />
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Trip ID & User</th>
                <th className="px-6 py-4">Start Location</th>
                <th className="px-6 py-4">Destination Target</th>
                <th className="px-6 py-4">Distance & ETA</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-white block">
                      {t.id}
                    </span>
                    <span className="text-xs text-[#1267D6] dark:text-blue-400 font-semibold block mt-0.5">
                      {t.userName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                    {t.startLocation}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#031D3D] dark:text-white">
                    {t.destination}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#031D3D] dark:text-white block">{t.distanceKm} km</span>
                    <span className="text-[11px] text-slate-400 font-semibold block">ETA: {t.eta}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        t.status === 'In Progress'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : t.status === 'Delayed'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          : t.status === 'Rerouted'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate('/admin/live-locations')}
                      className="px-3 py-1.5 bg-[#1267D6] hover:bg-[#0E52AD] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1"
                    >
                      <span>Track</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
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
