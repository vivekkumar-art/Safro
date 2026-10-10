// ==============================================================================
// SAFRO ADMIN LIVE TELEMETRY MAP COMPONENT
// Pixel-perfect implementation matching Image 2 (Dehradun Region & Floating User Details)
// ==============================================================================

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AdminLiveUser } from '../../types';
import { adminDataService } from '../services/adminDataService';
import { Search, User, Navigation, X, ShieldAlert, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface AdminMapProps {
  height?: string;
  onSelectUser?: (user: AdminLiveUser) => void;
}

export const AdminMap: React.FC<AdminMapProps> = ({ height = '460px', onSelectUser }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const pulseCircleRef = useRef<L.Circle | null>(null);
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminLiveUser[]>(() => adminDataService.getLiveUsers());
  const [selectedUser, setSelectedUser] = useState<AdminLiveUser | null>(() => users[0]); // Rohit Verma default
  const [filterType, setFilterType] = useState<'all' | 'active' | 'in_transit' | 'alert' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const defaultCenter: [number, number] = [30.3250, 78.0380]; // Dehradun Central
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: false,
      preferCanvas: true,
    });

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // Google Maps Roadmap tile layer or OpenStreetMap fallback
    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let subdomains: string | string[] = 'abc';

    if (GOOGLE_MAPS_API_KEY) {
      tileUrl = `https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${GOOGLE_MAPS_API_KEY}`;
      subdomains = ['0', '1', '2', '3'];
    }

    L.tileLayer(tileUrl, {
      attribution: '&copy; Google Maps / OpenStreetMap',
      maxZoom: 19,
      subdomains,
      updateWhenIdle: false,
      updateWhenZooming: false,
      keepBuffer: 6,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersRef.current = layerGroup;
    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // 2. Render Markers and Route Polyline
  useEffect(() => {
    const map = leafletMapRef.current;
    const layerGroup = markersRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Filter users
    const filtered = users.filter((u) => {
      if (filterType === 'active') return u.status === 'active' || u.status === 'in_transit';
      if (filterType === 'in_transit') return u.status === 'in_transit';
      if (filterType === 'alert') return u.status === 'alert';
      if (filterType === 'inactive') return u.status === 'inactive';
      return true;
    }).filter((u) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.userId.toLowerCase().includes(q);
    });

    // Draw route for in-transit user (Priya Sharma)
    const priya = users.find((u) => u.userId === 'SAF48291');
    if (priya && priya.destinationCoords) {
      const routePoints: [number, number][] = [
        priya.coords,
        [30.3600, 78.0580],
        [30.3950, 78.0620],
        priya.destinationCoords,
      ];
      L.polyline(routePoints, {
        color: '#1D68FE',
        weight: 4,
        opacity: 0.85,
        dashArray: '2, 6',
      }).addTo(layerGroup);
    }

    // Render User Markers
    filtered.forEach((u) => {
      let iconColor = '#1D68FE'; // blue
      if (u.status === 'alert') iconColor = '#EF4444'; // red
      else if (u.status === 'in_transit') iconColor = '#10B981'; // green
      else if (u.status === 'inactive') iconColor = '#94A3B8'; // gray
      else if (u.userId === 'SAF30192') iconColor = '#8B5CF6'; // purple

      // Custom HTML Marker matching Image 2
      const customHtml = `
        <div class="relative group cursor-pointer" style="transform: translate(-50%, -100%);">
          <!-- User Tooltip Pill -->
          <div style="background: white; padding: 3px 8px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #E2E8F0; display: flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; color: #0F172A; white-space: nowrap; margin-bottom: 4px;">
            <span>${u.name}</span>
            <span style="color: ${iconColor}; font-weight: 800;">${u.speedKmH} km/h</span>
          </div>

          <!-- Pin Icon -->
          <div style="width: 28px; height: 28px; border-radius: 50%; background: ${iconColor}; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px ${iconColor}66; border: 2.5px solid white; margin: 0 auto;">
            ${
              u.status === 'alert'
                ? '⚠️'
                : u.status === 'in_transit'
                ? '🚗'
                : '📍'
            }
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: 'custom-admin-marker',
        iconSize: [80, 50],
        iconAnchor: [40, 50],
      });

      const marker = L.marker(u.coords, { icon: customIcon }).addTo(layerGroup);

      marker.on('click', () => {
        setSelectedUser(u);
        if (onSelectUser) onSelectUser(u);
      });

      // If user is in alert state, add pulsating circle around them
      if (u.status === 'alert') {
        const alertCircle = L.circle(u.coords, {
          radius: 350,
          color: '#EF4444',
          fillColor: '#EF4444',
          fillOpacity: 0.15,
          weight: 1.5,
        }).addTo(layerGroup);
        pulseCircleRef.current = alertCircle;
      }
    });
  }, [users, filterType, searchQuery]);

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors">
      {/* 1. Header Bar with Search & Filter Chips matching Image 2 */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h3 className="text-base font-extrabold text-[#031D3D] dark:text-white flex items-center gap-2">
            Live Locations
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              Real-time
            </span>
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* User Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by name or ID..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs text-[#031D3D] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1267D6] w-full sm:w-56"
            />
          </div>

          {/* Filter Chips matching Image 2 */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1267D6] dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All (1,842)
            </button>
            <button
              onClick={() => setFilterType('active')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'active'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Active (1,612)
            </button>
            <button
              onClick={() => setFilterType('inactive')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'inactive'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Inactive (198)
            </button>
            <button
              onClick={() => setFilterType('alert')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'alert'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Alert (32)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Map Container with Floating User Details Card */}
      <div className="relative isolate z-0 w-full" style={{ height }}>
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating User Details Card matching Image 2 */}
        {selectedUser && (
          <div className="absolute top-4 right-4 z-20 w-80 max-w-[calc(100%-2rem)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-4 animate-in fade-in slide-in-from-right-2 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.avatarUrl}
                  alt={selectedUser.name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-2xs"
                />
                <div>
                  <h4 className="text-sm font-extrabold text-[#031D3D] dark:text-white leading-tight">
                    {selectedUser.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      ID: {selectedUser.userId}
                    </span>
                    {selectedUser.status === 'alert' && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-rose-500 text-white animate-pulse">
                        Alert
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3.5 space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current Location
                </span>
                <p className="font-semibold text-[#031D3D] dark:text-slate-100 mt-0.5">
                  {selectedUser.locationName}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {selectedUser.coords[0].toFixed(4)}, {selectedUser.coords[1].toFixed(4)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Speed
                  </span>
                  <p className="font-bold text-[#031D3D] dark:text-slate-100">{selectedUser.speedKmH} km/h</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Trip Status
                  </span>
                  <p className="font-bold text-[#1267D6] dark:text-blue-400">{selectedUser.tripStatus}</p>
                </div>
              </div>

              {selectedUser.destinationName && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Destination
                  </span>
                  <p className="font-semibold text-[#031D3D] dark:text-slate-100 truncate">
                    {selectedUser.destinationName}
                  </p>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Last Updated
                </span>
                <p className="text-slate-500 dark:text-slate-400">{selectedUser.lastUpdated}</p>
              </div>
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => navigate(`/admin/users?id=${selectedUser.userId}`)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#031D3D] dark:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                View Profile
              </button>
              <button
                onClick={() => navigate(`/admin/routes?userId=${selectedUser.userId}`)}
                className="px-3 py-1.5 rounded-xl bg-[#1267D6] hover:bg-[#0E52AD] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                View Route
              </button>
            </div>
          </div>
        )}

        {/* Legend Bar matching Image 2 */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/80 dark:border-slate-800 px-3 py-1.5 flex items-center gap-3 text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1D68FE]" />
            <span>Active User</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>In Transit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Alert</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Inactive</span>
          </div>
        </div>
      </div>
    </div>
  );
};
