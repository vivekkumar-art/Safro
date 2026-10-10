// ==============================================================================
// SAFRO PAN-INDIA GEOGRAPHIC EXPLORER MODAL
// Hierarchical browser: India -> 28 States & 8 UTs -> Districts -> Destinations
// ==============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  ChevronRight,
  Search,
  Building2,
  Compass,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { StateOrUT, District, Destination } from '../../types/destination';
import { destinationDatabase } from '../../services/destinationDatabase';

interface GeographicExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDestination: (dest: Destination) => void;
  onOpenDetails: (dest: Destination) => void;
  selectedDestinationName?: string;
}

export const GeographicExplorerModal: React.FC<GeographicExplorerModalProps> = ({
  isOpen,
  onClose,
  onSelectDestination,
  onOpenDetails,
  selectedDestinationName,
}) => {
  const [selectedState, setSelectedState] = useState<StateOrUT | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [searchStateQuery, setSearchStateQuery] = useState('');

  if (!isOpen) return null;

  const allStates = destinationDatabase.getAllStatesAndUTs();
  const filteredStates = allStates.filter((s) => {
    const q = searchStateQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      (s.hindiName && s.hindiName.includes(q)) ||
      s.capital.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q)
    );
  });

  const districtsInState = selectedState ? destinationDatabase.getDistrictsByState(selectedState.id) : [];
  const destinationsInState = selectedState ? destinationDatabase.getDestinationsByState(selectedState.id) : [];
  const destinationsInDistrict = selectedDistrict ? destinationDatabase.getDestinationsByDistrict(selectedDistrict.id) : [];

  const handleBackToStates = () => {
    setSelectedDistrict(null);
    setSelectedState(null);
  };

  const handleBackToDistricts = () => {
    setSelectedDistrict(null);
  };

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
          className="relative w-full max-w-4xl max-h-[88vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-[#031D3D] to-[#0A2E63] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              {(selectedState || selectedDistrict) && (
                <button
                  onClick={selectedDistrict ? handleBackToDistricts : handleBackToStates}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block">
                  SAFRO GEOGRAPHIC EXPLORER
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
                  <Compass className="w-5 h-5 text-sky-400" />
                  {selectedDistrict
                    ? `${selectedDistrict.name} District, ${selectedState?.name}`
                    : selectedState
                    ? `${selectedState.name} (${selectedState.type === 'state' ? 'State' : 'Union Territory'})`
                    : 'Explore India by State & District'}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Breadcrumb Bar */}
          <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-500 shrink-0 overflow-x-auto">
            <button
              onClick={handleBackToStates}
              className={`hover:text-[#1267D6] transition-colors cursor-pointer shrink-0 ${!selectedState ? 'text-[#1267D6] font-bold' : ''}`}
            >
              🇮🇳 India (36 States & UTs)
            </button>

            {selectedState && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <button
                  onClick={handleBackToDistricts}
                  className={`hover:text-[#1267D6] transition-colors cursor-pointer shrink-0 ${!selectedDistrict ? 'text-[#1267D6] font-bold' : ''}`}
                >
                  {selectedState.name}
                </button>
              </>
            )}

            {selectedDistrict && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[#1267D6] font-bold shrink-0">{selectedDistrict.name}</span>
              </>
            )}
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* LEVEL 1: ALL 28 STATES & 8 UNION TERRITORIES */}
            {!selectedState && (
              <div className="space-y-4">
                {/* Search State Box */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchStateQuery}
                    onChange={(e) => setSearchStateQuery(e.target.value)}
                    placeholder="Search Indian State or UT (e.g. Uttarakhand, Rajasthan, Kerala, Meghalaya...)"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-[#031D3D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1267D6]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredStates.map((state) => {
                    const destCount = destinationDatabase.getDestinationsByState(state.id).length;
                    return (
                      <div
                        key={state.id}
                        onClick={() => setSelectedState(state)}
                        className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-[#1267D6]/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#031D3D] dark:text-white group-hover:text-[#1267D6] transition-colors">
                              {state.name}
                            </span>
                            {state.hindiName && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                ({state.hindiName})
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Capital: {state.capital} • {state.zone} Zone
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {destCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1267D6]/10 text-[#1267D6]">
                              {destCount} {destCount === 1 ? 'dest' : 'dests'}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1267D6] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEVEL 2: DISTRICTS & DESTINATIONS IN SELECTED STATE */}
            {selectedState && !selectedDistrict && (
              <div className="space-y-6">
                {/* State Overview Header Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#031D3D] dark:text-white">
                      {selectedState.name} Tourism Overview
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedState.description}
                    </p>
                  </div>
                  <a
                    href={selectedState.officialPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#1267D6] font-bold hover:underline shrink-0"
                  >
                    Official State Portal →
                  </a>
                </div>

                {/* Popular Destinations in this State */}
                {destinationsInState.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Destinations in {selectedState.name} ({destinationsInState.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {destinationsInState.map((dest) => {
                        const isSelected = selectedDestinationName?.toLowerCase() === dest.officialName.toLowerCase();
                        return (
                          <div
                            key={dest.id}
                            className={`p-3.5 rounded-2xl border-2 transition-all flex gap-3 ${
                              isSelected
                                ? 'border-[#1267D6] bg-blue-50/50 dark:bg-blue-950/40'
                                : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
                              <img
                                src={dest.imageUrl}
                                alt={dest.officialName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between">
                                  <h5 className="text-xs font-bold text-[#031D3D] dark:text-white">
                                    {dest.officialName}
                                  </h5>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 font-bold">
                                    {dest.dataConfidence}% Verified
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                  {dest.districtName} • {dest.category}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 pt-2">
                                <button
                                  onClick={() => onOpenDetails(dest)}
                                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                                >
                                  View Dossier
                                </button>
                                <button
                                  onClick={() => {
                                    onSelectDestination(dest);
                                    onClose();
                                  }}
                                  className="text-[11px] font-bold text-[#1267D6] hover:underline cursor-pointer ml-auto flex items-center gap-1"
                                >
                                  {isSelected ? <Check className="w-3 h-3" /> : null}
                                  {isSelected ? 'Selected' : 'Select for Trip'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Districts in this State */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Districts in {selectedState.name}
                  </h4>
                  {districtsInState.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500">
                      Administrative sub-districts are currently being indexed for {selectedState.name}. More data will be available shortly.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {districtsInState.map((dist) => {
                        const count = destinationDatabase.getDestinationsByDistrict(dist.id).length;
                        return (
                          <div
                            key={dist.id}
                            onClick={() => setSelectedDistrict(dist)}
                            className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-[#1267D6]/30 bg-white dark:bg-slate-800/80 transition-colors cursor-pointer flex items-center justify-between"
                          >
                            <div>
                              <span className="text-xs font-bold text-[#031D3D] dark:text-white block">
                                {dist.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                HQ: {dist.headquarters}
                              </span>
                            </div>
                            {count > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#1267D6]">
                                {count}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LEVEL 3: DESTINATIONS IN SELECTED DISTRICT */}
            {selectedDistrict && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Destinations in {selectedDistrict.name} District
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Showing verified destinations and tourist spots indexed for this administrative district.
                    </p>
                  </div>
                </div>

                {destinationsInDistrict.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                    <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      No destinations yet in {selectedDistrict.name}
                    </h5>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      In keeping with SAFRO policy, we do not fabricate destinations. Authorized records for {selectedDistrict.name} will appear once verified by the tourism ingestion pipeline.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {destinationsInDistrict.map((dest) => (
                      <div
                        key={dest.id}
                        className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 flex gap-3.5"
                      >
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={dest.imageUrl}
                            alt={dest.officialName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h5 className="text-sm font-bold text-[#031D3D] dark:text-white">
                              {dest.officialName}
                            </h5>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {dest.category} • {dest.subcategory}
                            </span>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                              {dest.shortDescription}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={() => onOpenDetails(dest)}
                              className="text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => {
                                onSelectDestination(dest);
                                onClose();
                              }}
                              className="text-xs font-bold text-[#1267D6] hover:underline cursor-pointer ml-auto"
                            >
                              Select for Trip
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
