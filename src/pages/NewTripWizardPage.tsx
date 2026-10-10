import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { destinationDatabase } from '../services/destinationDatabase';
import { Destination } from '../types/destination';
import { DestinationDetailModal } from '../components/destination/DestinationDetailModal';
import { GeographicExplorerModal } from '../components/destination/GeographicExplorerModal';
import { TravelStyle, TransportType } from '../types';
import { Stepper } from '../components/common/Stepper';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import {
  Calendar,
  Users,
  Sparkles,
  TreePine,
  Flame,
  Utensils,
  Landmark,
  ShoppingBag,
  Palmtree,
  Car,
  Bus,
  Footprints,
  CarTaxiFront,
  ArrowRight,
  ChevronLeft,
  Check,
  Plus,
  Minus,
  Search,
  Navigation,
  MapPin,
  Compass,
  Info,
  ShieldCheck,
} from 'lucide-react';

const STEPS = [
  'Destination',
  'Dates',
  'Travelers',
  'Budget',
  'Style',
  'Interests',
  'Transport',
];

const DESTINATION_CATEGORY_TABS: Array<{ label: string; value: string }> = [
  { label: 'All India', value: 'All' },
  { label: 'Hill Stations', value: 'Hill Station' },
  { label: 'Pilgrimage & Spiritual', value: 'Pilgrimage & Spiritual' },
  { label: 'Heritage & Forts', value: 'Heritage & Forts' },
  { label: 'Beaches & Coastal', value: 'Beaches & Coastal' },
  { label: 'Nature & Waterfalls', value: 'Nature & Waterfalls' },
  { label: 'Wildlife', value: 'Wildlife & Sanctuaries' },
  { label: 'Adventure', value: 'Adventure & Trekking' },
  { label: 'Cities & Culture', value: 'Cities & Culture' },
];

export const NewTripWizardPage: React.FC = () => {
  const { newTripDraft, updateDraft } = useTrip();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [destinationSearch, setDestinationSearch] = useState(newTripDraft.destination || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isGeoModalOpen, setIsGeoModalOpen] = useState(false);
  const [detailModalDest, setDetailModalDest] = useState<Destination | null>(null);

  // Form states
  const destination = newTripDraft.destination || 'Manali';
  const [pickupPoint, setPickupPoint] = useState(
    newTripDraft.pickupPoint || 'Delhi Kashmere Gate ISBT / IGI Airport T3'
  );
  const [dropPoint, setDropPoint] = useState(
    newTripDraft.dropPoint || 'Sterling Himalayan Resort, Old Manali'
  );
  const durationDays = newTripDraft.durationDays || 4;
  const travelers = newTripDraft.travelers || 2;
  const budget = newTripDraft.budget || 25000;
  const travelStyle = newTripDraft.travelStyle || user?.preferences?.travelStyle || 'Balanced';
  const interests = newTripDraft.interests || user?.preferences?.interests || ['Nature', 'Adventure', 'Food'];
  const transportation = newTripDraft.transportation || user?.preferences?.preferredTransport || 'Car';

  // Autocomplete & filtered destinations from authoritative database
  const autocompleteResults = useMemo(() => {
    if (!destinationSearch.trim()) return [];
    return destinationDatabase.searchDestinations(destinationSearch, {
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
    }).slice(0, 6);
  }, [destinationSearch, selectedCategory]);

  const displayedDestinations = useMemo(() => {
    if (destinationSearch.trim()) {
      return destinationDatabase.searchDestinations(destinationSearch, {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      });
    }
    if (selectedCategory !== 'All') {
      return destinationDatabase.searchDestinations('', { category: selectedCategory });
    }
    return destinationDatabase.getPopularDestinations();
  }, [destinationSearch, selectedCategory]);

  // Budget allocation percentages
  const transportCost = Math.round(budget * 0.2);
  const stayCost = Math.round(budget * 0.3);
  const foodCost = Math.round(budget * 0.15);
  const activitiesCost = Math.round(budget * 0.2);
  const otherCost = Math.round(budget * 0.15);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step: Send to NIEL AI planning with pickup and drop points
      updateDraft({
        destination,
        pickupPoint,
        dropPoint,
        durationDays,
        travelers,
        budget,
        travelStyle,
        interests,
        transportation,
        estimatedCost: Math.round(budget * 0.91),
      });
      navigate('/trips/ai-planning');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/home');
    }
  };

  const selectDestinationRecord = (dest: Destination) => {
    setDestinationSearch(dest.officialName);
    const newPickup = dest.transport?.defaultPickupTransit || `${dest.officialName} Central Transit Hub / Airport`;
    const newDrop = dest.transport?.defaultDropTransit || `${dest.officialName} Boutique Resort & Activity Hub`;
    setPickupPoint(newPickup);
    setDropPoint(newDrop);
    updateDraft({
      destination: dest.officialName,
      stateOrCountry: `${dest.stateName}, India`,
      pickupPoint: newPickup,
      dropPoint: newDrop,
      imageUrl: dest.imageUrl,
      durationDays: dest.suggestedDurationDays || durationDays,
    });
    setIsSearchFocused(false);
  };

  const selectDestination = (
    name: string,
    state: string,
    img: string,
    defPickup?: string,
    defDrop?: string
  ) => {
    setDestinationSearch(name);
    const newPickup = defPickup || (name === 'Manali' ? 'Delhi Kashmere Gate ISBT / IGI Airport T3' : `${name} Central Transit Hub / Airport`);
    const newDrop = defDrop || `${name} Boutique Resort & Activity Hub`;
    setPickupPoint(newPickup);
    setDropPoint(newDrop);
    updateDraft({
      destination: name,
      pickupPoint: newPickup,
      dropPoint: newDrop,
      stateOrCountry: `${state}, India`,
      imageUrl: img,
    });
    setIsSearchFocused(false);
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      updateDraft({ interests: interests.filter((i) => i !== interest) });
    } else {
      if (interests.length >= 3) {
        showToast('Max 3', 'You can select up to 3 primary interests.', 'info');
        return;
      }
      updateDraft({ interests: [...interests, interest] });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:text-[#062B5C] transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            SAFRO AI TRIP WIZARD
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#031D3D] dark:text-white">
            Plan a New Trip
          </h1>
        </div>

        <button
          onClick={() => navigate('/home')}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer px-2"
        >
          Cancel
        </button>
      </div>

      {/* Stepper Component */}
      <Stepper
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* Main Step Container */}
      <Card className="min-h-[460px] flex flex-col justify-between p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div>
          {/* STEP 1: DESTINATION */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#031D3D] dark:text-white">
                    Where in India are you going?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Search across all 28 states & 8 UTs or explore by administrative geography
                  </p>
                </div>

                {/* Explore by Geography Button */}
                <button
                  type="button"
                  onClick={() => setIsGeoModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#031D3D] to-[#1267D6] text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-lg hover:brightness-110 transition-all cursor-pointer shrink-0"
                >
                  <Compass className="w-4 h-4 text-sky-300" />
                  <span>Explore by Geography (36 States & UTs)</span>
                </button>
              </div>

              {/* Destination Search Box & Live Autocomplete */}
              <div className="relative">
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={destinationSearch}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(e) => {
                      setDestinationSearch(e.target.value);
                      updateDraft({ destination: e.target.value });
                    }}
                    placeholder="Search any state, district, temple, hill station (e.g. Kedarnath, Jaipur, Munnar, Hampi...)"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-[#1267D6] rounded-2xl text-sm font-semibold text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-[#1267D6]/10 transition-all"
                  />
                  {destinationSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setDestinationSearch('');
                        setIsSearchFocused(false);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Live Autocomplete Dropdown */}
                {isSearchFocused && autocompleteResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-30 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {autocompleteResults.map((dest) => (
                      <div
                        key={dest.id}
                        onMouseDown={() => selectDestinationRecord(dest)}
                        className="p-3.5 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                            <img src={dest.imageUrl} alt={dest.officialName} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-[#031D3D] dark:text-white group-hover:text-[#1267D6] transition-colors">
                                {dest.officialName}
                              </span>
                              {dest.hindiName && (
                                <span className="text-xs text-slate-400 font-medium">({dest.hindiName})</span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">
                              {dest.settlementName} • {dest.districtName} • {dest.stateName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1267D6]/10 text-[#1267D6]">
                            {dest.category}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" />
                            {dest.dataConfidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Destination Category Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
                {DESTINATION_CATEGORY_TABS.map((tab) => {
                  const isActive = selectedCategory === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setSelectedCategory(tab.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-[#1267D6] text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Popular / Filtered Destination Cards */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                    {destinationSearch
                      ? `Matching Destinations (${displayedDestinations.length})`
                      : selectedCategory !== 'All'
                      ? `${selectedCategory} Destinations (${displayedDestinations.length})`
                      : 'Featured Verified Destinations'}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Showing {displayedDestinations.length} verified records
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {displayedDestinations.map((dest) => {
                    const isSelected = destination.toLowerCase() === dest.officialName.toLowerCase();
                    return (
                      <div
                        key={dest.id}
                        className={`rounded-2xl border-2 p-3 transition-all cursor-pointer relative overflow-hidden group ${
                          isSelected
                            ? 'border-[#1267D6] bg-[#EAF4FF]/40 dark:bg-blue-950/40 ring-2 ring-[#1267D6]/20'
                            : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-800/90'
                        }`}
                        onClick={() => selectDestinationRecord(dest)}
                      >
                        <div className="aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-slate-100 dark:bg-slate-700 relative">
                          <img
                            src={dest.imageUrl}
                            alt={dest.officialName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          {/* Info Button to Open Dossier */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailModalDest(dest);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition-colors cursor-pointer"
                            title="View Verified Dossier"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="min-w-0 pr-1">
                            <h4 className="text-xs sm:text-sm font-bold text-[#031D3D] dark:text-white truncate">
                              {dest.officialName}
                            </h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
                              {dest.stateName} • {dest.category}
                            </p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#1267D6] stroke-[3] shrink-0" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>


              {/* Transit & Route: Pickup & Drop Point Inputs */}
              <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#1267D6]/10 text-[#1267D6]">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-[#031D3D] dark:text-white">
                        Pickup & Drop Locations
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Specify where your journey starts and where you'll stay
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#19A974] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Auto-Synchronized
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pickup Point Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900" />
                      Pickup Point (Origin / Departure)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={pickupPoint}
                        onChange={(e) => {
                          setPickupPoint(e.target.value);
                          updateDraft({ pickupPoint: e.target.value });
                        }}
                        placeholder="e.g. Delhi Kashmere Gate / IGI Airport T3"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#1267D6] rounded-xl text-xs sm:text-sm font-semibold text-[#031D3D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1267D6]/10 transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Airport terminal, railway station, or home address
                    </p>
                  </div>

                  {/* Drop Point Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200 dark:ring-rose-900" />
                      Drop Point (Hotel / Destination Hub)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={dropPoint}
                        onChange={(e) => {
                          setDropPoint(e.target.value);
                          updateDraft({ dropPoint: e.target.value });
                        }}
                        placeholder={`e.g. Resort or Hotel in ${destination}`}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#1267D6] rounded-xl text-xs sm:text-sm font-semibold text-[#031D3D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1267D6]/10 transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Hotel, luxury resort, or base camp
                    </p>
                  </div>
                </div>

                {/* Visual Route Corridor Preview */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 flex items-center gap-2.5 text-xs">
                  <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Transit Corridor:</span>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate max-w-[45%]">
                      {pickupPoint || 'Pickup Location'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-bold text-rose-600 dark:text-rose-400 truncate max-w-[45%]">
                      {dropPoint || `${destination} Resort`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DATES & DURATION */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#031D3D] dark:text-white">
                  How long will you stay in {destination}?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Select your travel duration or choose convenient presets
                </p>
              </div>

              {/* Duration Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { days: 3, label: '3 Days', desc: 'Weekend Getaway' },
                  { days: 4, label: '4 Days', desc: 'Most Popular' },
                  { days: 5, label: '5 Days', desc: 'Extended Leisure' },
                  { days: 7, label: '7 Days', desc: 'Full Week Holiday' },
                ].map((item) => {
                  const isSelected = durationDays === item.days;
                  return (
                    <div
                      key={item.days}
                      onClick={() => updateDraft({ durationDays: item.days })}
                      className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1267D6] bg-[#EAF4FF] dark:bg-blue-950/50 ring-2 ring-[#1267D6]/20'
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-800/90'
                      }`}
                    >
                      <h4 className="text-lg font-extrabold text-[#031D3D] dark:text-white">{item.label}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Custom Date Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-700 text-[#1267D6] shadow-xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wide">
                      Selected Dates
                    </p>
                    <p className="text-sm font-bold text-[#031D3D] dark:text-white">
                      12 Dec 2026 – {12 + durationDays - 1} Dec 2026 ({durationDays} Days)
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#19A974] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Peak Season Deal
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: TRAVELERS */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#031D3D] dark:text-white">
                  Who is traveling with you?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  NIEL AI optimizes hotel rooms, activity slots, and transport seating
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { count: 1, label: 'Solo Traveler', desc: 'Single room, flexible pace' },
                  { count: 2, label: 'Couple / Pair', desc: '1 Room • 2 Travelers' },
                  { count: 4, label: 'Family / Friends', desc: '2 Rooms • Group discounts' },
                ].map((item) => {
                  const isSelected = travelers === item.count;
                  return (
                    <div
                      key={item.count}
                      onClick={() => updateDraft({ travelers: item.count })}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1267D6] bg-[#EAF4FF] dark:bg-blue-950/50 ring-2 ring-[#1267D6]/20'
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-800/90'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Users className="w-5 h-5 text-[#1267D6]" />
                        {isSelected && <Check className="w-4 h-4 text-[#1267D6] stroke-[3]" />}
                      </div>
                      <h4 className="text-base font-bold text-[#031D3D] dark:text-white">{item.label}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Custom Count Stepper */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-sm font-bold text-[#031D3D] dark:text-white">Custom Traveler Count:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateDraft({ travelers: Math.max(1, travelers - 1) })}
                    className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-base font-extrabold text-[#062B5C] dark:text-white w-6 text-center">
                    {travelers}
                  </span>
                  <button
                    onClick={() => updateDraft({ travelers: travelers + 1 })}
                    className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: BUDGET ALLOCATION */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#031D3D] dark:text-white">
                  What's your total budget?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Adjust your total spending limit. NIEL AI distributes costs dynamically.
                </p>
              </div>

              {/* Budget Display with Controls */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#062B5C] to-[#031D3D] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div>
                  <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider">
                    Total Estimated Budget
                  </span>
                  <h3 className="text-4xl sm:text-5xl font-extrabold text-white mt-1">
                    ₹{budget.toLocaleString('en-IN')}
                  </h3>
                </div>

                {/* Minus / Plus Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateDraft({ budget: Math.max(5000, budget - 2000) })}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm cursor-pointer"
                  >
                    - ₹2,000
                  </button>
                  <button
                    onClick={() => updateDraft({ budget: budget + 2000 })}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm cursor-pointer"
                  >
                    + ₹2,000
                  </button>
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                {[10000, 20000, 25000, 30000, 50000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => updateDraft({ budget: preset })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      budget === preset
                        ? 'bg-[#1267D6] text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    ₹{(preset / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>

              {/* Dynamic Budget Allocation Breakdown */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  AI Dynamic Cost Allocation
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Transport (20%)</span>
                    <p className="text-sm font-bold text-[#1267D6] dark:text-blue-400 mt-0.5">
                      ₹{transportCost.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Stay (30%)</span>
                    <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400 mt-0.5">
                      ₹{stayCost.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Food (15%)</span>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                      ₹{foodCost.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Activities (20%)</span>
                    <p className="text-sm font-bold text-[#19A974] dark:text-emerald-400 mt-0.5">
                      ₹{activitiesCost.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Other (15%)</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                      ₹{otherCost.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: TRAVEL STYLE */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#031D3D] dark:text-white">
                  Select your travel comfort level
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Adjusts hotel star ratings and dining choices
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'Budget' as TravelStyle, title: 'Budget', desc: 'Hostels, shared transfers & street delicacies', icon: '🎒' },
                  { id: 'Balanced' as TravelStyle, title: 'Balanced', desc: '3-4 star boutique stays & popular guided spots', icon: '⚖️' },
                  { id: 'Premium' as TravelStyle, title: 'Premium', desc: '5 star luxury resorts & private chauffeur transfers', icon: '✨' },
                ].map((s) => {
                  const isSelected = travelStyle === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => updateDraft({ travelStyle: s.id })}
                      className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1267D6] bg-[#EAF4FF] dark:bg-blue-950/50 ring-2 ring-[#1267D6]/20'
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-800/90'
                      }`}
                    >
                      <span className="text-3xl block mb-2">{s.icon}</span>
                      <h4 className="text-base font-bold text-[#031D3D] dark:text-white">{s.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: INTERESTS */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#031D3D] dark:text-white">
                    What activities excite you most?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Select up to 3 for your custom itinerary
                  </p>
                </div>
                <span className="text-xs font-bold text-[#1267D6] dark:text-blue-300 bg-[#EAF4FF] dark:bg-blue-950/50 px-3 py-1 rounded-full">
                  {interests.length}/3 Selected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {[
                  { id: 'Nature', label: 'Nature', icon: TreePine },
                  { id: 'Adventure', label: 'Adventure', icon: Flame },
                  { id: 'Food', label: 'Food & Dining', icon: Utensils },
                  { id: 'Culture', label: 'Culture & Heritage', icon: Landmark },
                  { id: 'Shopping', label: 'Shopping', icon: ShoppingBag },
                  { id: 'Relaxation', label: 'Relaxation', icon: Palmtree },
                ].map((item) => {
                  const isSelected = interests.includes(item.id);
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleInterest(item.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#1267D6] bg-[#EAF4FF] dark:bg-blue-950/50'
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-800/90'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-[#1267D6]' : 'text-slate-500 dark:text-slate-400'}`} />
                        <span className="text-xs sm:text-sm font-bold text-[#031D3D] dark:text-white">{item.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#1267D6] stroke-[3]" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: TRANSPORTATION */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#031D3D] dark:text-white">
                  How would you like to travel?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Choose primary transport mode for route optimization
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { id: 'Car' as TransportType, label: 'Private Car', icon: Car, desc: 'Highest flexibility' },
                  { id: 'Public' as TransportType, label: 'Public Transit', icon: Bus, desc: 'Eco & budget friendly' },
                  { id: 'Taxi' as TransportType, label: 'Cab / Taxi', icon: CarTaxiFront, desc: 'On-demand rides' },
                  { id: 'Walking' as TransportType, label: 'Walking', icon: Footprints, desc: 'City center strolls' },
                ].map((item) => {
                  const isSelected = transportation === item.id;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => updateDraft({ transportation: item.id })}
                      className={`p-5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1267D6] bg-[#EAF4FF] dark:bg-blue-950/50 ring-2 ring-[#1267D6]/20'
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-800/90'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-[#1267D6]' : 'text-slate-500 dark:text-slate-400'}`} />
                      <h4 className="text-sm font-bold text-[#031D3D] dark:text-white">{item.label}</h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Wizard Bottom Nav Buttons */}
        <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Button
            variant="ghost"
            size="md"
            onClick={handleBack}
            className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={handleNext}
            rightIcon={
              currentStep === STEPS.length ? (
                <Sparkles className="w-4 h-4 text-amber-300" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )
            }
            className="shadow-lg shadow-[#1267D6]/20 text-sm font-bold"
          >
            {currentStep === STEPS.length ? 'Let NIEL AI Plan My Trip' : 'Continue'}
          </Button>
        </div>
      </Card>

      {/* Destination Detail Dossier Modal */}
      <DestinationDetailModal
        destination={detailModalDest}
        isOpen={!!detailModalDest}
        onClose={() => setDetailModalDest(null)}
        onSelectForTrip={selectDestinationRecord}
        isSelected={detailModalDest?.officialName.toLowerCase() === destination.toLowerCase()}
      />

      {/* Explore by Geography Modal */}
      <GeographicExplorerModal
        isOpen={isGeoModalOpen}
        onClose={() => setIsGeoModalOpen(false)}
        onSelectDestination={selectDestinationRecord}
        onOpenDetails={(d) => setDetailModalDest(d)}
        selectedDestinationName={destination}
      />
    </div>
  );
};

