// ==============================================================================
// SAFRO PAN-INDIA DESTINATION DETAIL MODAL
// Verified dossier displaying administrative hierarchy, permits, costs & sources
// ==============================================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Plane,
  Train,
  Car,
  ExternalLink,
  AlertTriangle,
  Compass,
  CheckCircle2,
  DollarSign,
  Mountain,
  Sparkles,
} from 'lucide-react';
import { Destination } from '../../types/destination';
import { Button } from '../common/Button';

interface DestinationDetailModalProps {
  destination: Destination | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectForTrip: (destination: Destination) => void;
  isSelected?: boolean;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destination,
  isOpen,
  onClose,
  onSelectForTrip,
  isSelected,
}) => {
  if (!destination || !isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#031D3D]/60 dark:bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden z-10"
        >
          {/* Header Image & Badge Overlays */}
          <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
            <img
              src={destination.imageUrl}
              alt={destination.officialName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#031D3D] via-[#031D3D]/30 to-black/30" />

            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Left Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1267D6] text-white shadow-md">
                {destination.category}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white flex items-center gap-1 shadow-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                {destination.dataConfidence}% Verified
              </span>
            </div>

            {/* Title & Hierarchy at Bottom of Hero */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-200 mb-1">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  {destination.settlementName} • {destination.districtName} • {destination.stateName}, India
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {destination.officialName}
                </h2>
                {destination.hindiName && (
                  <span className="text-lg sm:text-xl font-medium text-slate-300">
                    ({destination.hindiName})
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 line-clamp-1">
                {destination.subcategory}
              </p>
            </div>
          </div>

          {/* Content Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-[#031D3D] dark:text-slate-200">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#1267D6]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Best Season</p>
                  <p className="text-xs font-bold">{destination.bestVisitingSeason}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Ideal Duration</p>
                  <p className="text-xs font-bold">{destination.suggestedDurationDays} Days</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Daily Est.</p>
                  <p className="text-xs font-bold">
                    ₹{destination.costEstimate.dailyBudgetMin.toLocaleString('en-IN')} - ₹{destination.costEstimate.dailyBudgetMax.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600">
                  <Mountain className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Elevation / Coords</p>
                  <p className="text-xs font-bold">
                    {destination.elevationMeters ? `${destination.elevationMeters}m` : `${destination.latitude.toFixed(2)}°N`}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
                About the Destination
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {destination.detailedDescription}
              </p>
            </div>

            {/* Attractions & Experiences */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Signature Attractions & Activities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {destination.attractions.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#1267D6] shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{att}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transport & Route Connectivity */}
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-slate-800/40 border border-blue-100 dark:border-slate-700 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1267D6] flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                Transit & Connectivity
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Nearest Airport</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {destination.transport.nearestAirport} ({destination.transport.nearestAirportDistanceKm} km)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Train className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Nearest Railhead</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {destination.transport.nearestRailwayStation} ({destination.transport.nearestRailwayDistanceKm} km)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Suggested Hub</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {destination.transport.defaultPickupTransit}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                {destination.transport.roadAccessDescription}
              </p>
            </div>

            {/* Local Rules, Permits & Safety Advisories */}
            {destination.permitInfo.required && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-amber-900 dark:text-amber-300">
                    {destination.permitInfo.permitType}
                  </h4>
                  <p className="text-amber-800 dark:text-amber-400 leading-relaxed">
                    {destination.permitInfo.details}
                  </p>
                  {destination.permitInfo.portalUrl && (
                    <a
                      href={destination.permitInfo.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-[#1267D6] hover:underline pt-1"
                    >
                      Official Permit Registration Portal <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Official Sources & Verification Provenance */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>
                  Source: <strong>{destination.sources[0]?.name || 'Official Ministry of Tourism'}</strong>
                  {destination.sources[0]?.verificationDate && ` (Verified: ${destination.sources[0].verificationDate})`}
                </span>
              </div>
              {destination.sources[0]?.url && (
                <a
                  href={destination.sources[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1267D6] hover:underline font-bold inline-flex items-center gap-1"
                >
                  View Portal <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              Close
            </button>

            <Button
              variant="primary"
              onClick={() => {
                onSelectForTrip(destination);
                onClose();
              }}
              className="gap-2 cursor-pointer shadow-lg shadow-[#1267D6]/20"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {isSelected ? 'Selected for Trip' : `Select ${destination.officialName} for Trip`}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
