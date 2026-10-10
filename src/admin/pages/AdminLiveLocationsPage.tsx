// ==============================================================================
// SAFRO ADMIN FULL-SCREEN LIVE LOCATIONS TELEMETRY
// ==============================================================================

import React from 'react';
import { AdminMap } from '../components/AdminMap';

export const AdminLiveLocationsPage: React.FC = () => {
  return (
    <div className="space-y-4 animate-in fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#031D3D] tracking-tight">
          Live User Telemetry & GPS Tracking
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Real-time vehicle movement, speed monitoring, and distress alerts
        </p>
      </div>

      <div className="w-full">
        <AdminMap height="calc(100vh - 220px)" />
      </div>
    </div>
  );
};
