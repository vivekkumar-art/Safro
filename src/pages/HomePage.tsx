import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import { POPULAR_DESTINATIONS } from '../services/mockTripService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  MapPin,
  Sparkles,
  ArrowRight,
  Calendar,
  Receipt,
  Navigation2,
  Tag,
  Wallet,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { activeTrip, credits, updateDraft } = useTrip();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/niel-ai?prompt=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectDestination = (destName: string) => {
    updateDraft({ destination: destName });
    navigate('/trips/new');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Location */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5 text-[#1267D6]" />
            <span>{user?.location || 'New Delhi, India'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#031D3D] dark:text-white tracking-tight">
            Good morning, {user?.name?.split(' ')[0] || 'Aarav'} 👋
          </h1>
        </div>

        {/* Quick Travel Style Badge */}
        <div className="flex items-center gap-2">
          <Link
            to="/preferences"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#1267D6] text-xs font-semibold text-[#031D3D] dark:text-slate-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#19A974]" />
            <span>{user?.preferences?.travelStyle || 'Balanced'} Mode</span>
          </Link>
        </div>
      </div>

      {/* 2. NIEL AI Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4.5 flex items-center gap-2 pointer-events-none">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ask NIEL anything... (e.g. Plan a weekend trip to Manali under ₹25k)"
            className="w-full pl-13 pr-28 sm:pr-36 py-4 sm:py-4.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 focus:border-[#1267D6] rounded-3xl text-sm sm:text-base font-medium text-[#031D3D] dark:text-white shadow-lg shadow-slate-200/50 dark:shadow-none focus:outline-none focus:ring-4 focus:ring-[#1267D6]/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="absolute right-3 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-gradient-to-r from-[#062B5C] to-[#1267D6] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#062B5C]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Ask NIEL</span>
            <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
          </button>
        </div>
      </form>

      {/* 3. Hero Card: Plan Your Next Trip */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-[#062B5C]/15 text-white bg-gradient-to-r from-[#031D3D] via-[#062B5C] to-[#1267D6] p-6 sm:p-10 border border-white/10">
        {/* Background Subtle Gradient & Accents */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
        <div className="absolute right-0 bottom-0 max-w-sm w-full h-full opacity-25 hidden lg:block pointer-events-none">
          <img
            src="/assets/images/hero-mountains.jpg"
            alt="Mountains"
            className="w-full h-full object-cover rounded-l-full"
          />
        </div>

        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-sky-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            SAFRO AI TRIP DESIGNER
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Plan Your Next Trip
          </h2>
          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Let NIEL AI engineer the perfect travel itinerary tailored to your exact budget, schedule, and interests.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => navigate('/trips/new')}
              variant="white"
              size="lg"
              className="text-black font-bold shadow-lg shadow-black/10"
              rightIcon={<ArrowRight className="w-4 h-4 text-[#1267D6]" />}
            >
              Plan Trip Now
            </Button>
            <Button
              onClick={() => navigate('/offers')}
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/10 border border-white/20 font-semibold"
            >
              View Available Offers
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Quick Actions */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link
            to="/trips"
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#1267D6]/30 dark:hover:border-[#1267D6]/50 transition-all flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1267D6] dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#031D3D] dark:text-white group-hover:text-[#1267D6] dark:group-hover:text-blue-400 transition-colors">
                My Trips
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">View & organize</p>
            </div>
          </Link>

          <Link
            to="/expenses"
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#1267D6]/30 dark:hover:border-[#1267D6]/50 transition-all flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#19A974] dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#031D3D] dark:text-white group-hover:text-[#19A974] dark:group-hover:text-emerald-400 transition-colors">
                Expenses
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Track & budget</p>
            </div>
          </Link>

          <Link
            to={`/trips/${activeTrip?.id || 'trip_manali_01'}/live`}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#1267D6]/30 dark:hover:border-[#1267D6]/50 transition-all flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <Navigation2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-[#031D3D] dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Live Map
                </h4>
                <span className="w-2 h-2 rounded-full bg-[#19A974] animate-ping" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">GPS & Traffic</p>
            </div>
          </Link>

          <Link
            to="/offers"
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#1267D6]/30 dark:hover:border-[#1267D6]/50 transition-all flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#031D3D] dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Offers
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Coupons & deals</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 5. SAFRO Credits Card + Active Trip Card (Two Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: SAFRO Credits Card (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="h-full bg-gradient-to-br from-[#062B5C] to-[#031D3D] text-white flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                    <Wallet className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    SAFRO Credits
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-[#19A974]/20 border border-[#19A974]/40 text-emerald-300 px-2.5 py-0.5 rounded-full">
                  Ready to Redeem
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-300 font-medium">Available Balance</p>
                <h3 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mt-1">
                  ₹{credits.toLocaleString('en-IN')}
                </h3>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-xs text-blue-100 flex items-start gap-2.5">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Earn credits on every completed trip</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Any funds saved under your original budget are automatically converted 1:1 into SAFRO Credits for future adventures.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between">
              <Link
                to="/credits"
                className="text-xs font-bold text-sky-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View Wallet & History</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Button
                variant="white"
                size="sm"
                onClick={() => navigate('/trips/new')}
                className="text-black font-bold text-xs"
              >
                Apply on New Trip
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: Active Trip Card (7 Cols) */}
        <div className="lg:col-span-7">
          {activeTrip ? (
            <Card className="h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md flex flex-col justify-between">
              <div>
                {/* Trip Header with Live Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#19A974] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-xs font-extrabold tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-[#19A974] animate-pulse" />
                      ACTIVE TRIP • LIVE
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      {activeTrip.durationDays} Days • {activeTrip.travelers} Travelers
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#1267D6] dark:text-blue-400">
                    {activeTrip.startDate} - {activeTrip.endDate}
                  </span>
                </div>

                {/* Destination & Photo Banner */}
                <div className="relative aspect-[16/7] rounded-2xl overflow-hidden mb-4 shadow-sm bg-slate-100 dark:bg-slate-800">
                  <img
                    src={activeTrip.imageUrl}
                    alt={activeTrip.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-white">
                        {activeTrip.title}
                      </h3>
                      <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        {activeTrip.stateOrCountry}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transit Corridor: Pickup & Drop Points */}
                <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Pickup Point" />
                  <span className="font-bold text-[#031D3D] dark:text-white truncate max-w-[45%]" title={activeTrip.pickupPoint || 'Pickup Point'}>
                    {activeTrip.pickupPoint || 'Delhi Kashmere Gate / IGI'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Drop Point" />
                  <span className="font-bold text-[#031D3D] dark:text-white truncate max-w-[45%]" title={activeTrip.dropPoint || activeTrip.destination}>
                    {activeTrip.dropPoint || `${activeTrip.destination} Resort`}
                  </span>
                </div>

                {/* Live Route Monitoring Status Preview */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#031D3D] dark:text-white">
                        En Route to Solang Valley (NH3)
                      </h4>
                      <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                        +26 min delay
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      Faster scenic bypass via Burua available. Save 18 mins.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/trips/${activeTrip.id}`)}
                  className="text-xs font-bold"
                >
                  View Preview & Itinerary
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/trips/${activeTrip.id}/live`)}
                  rightIcon={<Navigation2 className="w-4 h-4 rotate-45" />}
                  className="text-xs font-bold shadow-md shadow-[#1267D6]/20"
                >
                  Open Live Monitoring
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-[#031D3D] dark:text-white">No Active Trip Currently</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xs">
                Plan a new adventure with NIEL AI to activate live monitoring.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/trips/new')}
                className="mt-4"
              >
                Plan a Trip
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* 6. Popular Destinations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#031D3D] dark:text-white tracking-tight">
              Popular Destinations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Curated trending spots with budget benchmarks</p>
          </div>
          <Link
            to="/trips/new"
            className="text-xs font-bold text-[#1267D6] dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Explore all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_DESTINATIONS.slice(0, 4).map((dest) => (
            <div
              key={dest.id}
              onClick={() => handleSelectDestination(dest.name)}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 overflow-hidden cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                    ★ {dest.rating}
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <h4 className="text-base font-extrabold text-[#031D3D] dark:text-white group-hover:text-[#1267D6] dark:group-hover:text-blue-400 transition-colors">
                    {dest.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{dest.state}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{dest.tagline}</p>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-2">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Est. Budget</span>
                  <p className="text-xs font-extrabold text-[#062B5C] dark:text-slate-100">
                    ₹{dest.avgBudget.toLocaleString('en-IN')}
                  </p>
                </div>
                <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-[#1267D6] group-hover:text-white text-slate-600 dark:text-slate-300 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
