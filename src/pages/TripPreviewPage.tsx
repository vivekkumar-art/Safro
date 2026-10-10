import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { InteractiveMap } from '../components/map/InteractiveMap';
import {
  MapPin,
  Calendar,
  Users,
  Wallet,
  Tag,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Navigation2,
  Coins,
} from 'lucide-react';

export const TripPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { trips } = useTrip();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'places' | 'map'>('overview');

  const trip = trips.find((t) => t.id === id) || trips[0];

  if (!trip) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold">Trip not found</h2>
        <Button onClick={() => navigate('/trips')} className="mt-4">
          View All Trips
        </Button>
      </div>
    );
  }

  // Cost calculations
  const finalPayable = Math.max(0, trip.estimatedCost - trip.appliedOfferDiscount - trip.creditsUsed);

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* 1. Hero Destination Header Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[21/9] min-h-[260px] bg-slate-900 text-white">
        <img
          src={trip.imageUrl}
          alt={trip.title}
          className="w-full h-full object-cover opacity-75"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#031D3D] via-[#031D3D]/50 to-transparent flex flex-col justify-end p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider text-white">
              {trip.status.toUpperCase()}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#1267D6]/80 backdrop-blur-md text-xs font-semibold text-white">
              {trip.travelStyle} Mode
            </span>
            {trip.isPaid && (
              <span className="px-3 py-1 rounded-full bg-[#19A974] text-xs font-bold text-white flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirmed & Paid
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            {trip.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200 mt-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-red-400" />
              {trip.destination}, {trip.stateOrCountry}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-300" />
              {trip.durationDays} Days ({trip.startDate} - {trip.endDate})
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-300" />
              {trip.travelers} Travelers
            </span>
          </div>
        </div>
      </div>

      {/* Transit & Route Corridor Card */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#EAF4FF] dark:bg-blue-950/60 text-[#1267D6] dark:text-blue-400 shrink-0">
            <Navigation2 className="w-5 h-5 rotate-45" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Trip Transit Route
            </span>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs sm:text-sm font-bold text-[#031D3D] dark:text-white">
                  {trip.pickupPoint || 'Delhi Kashmere Gate ISBT / IGI Airport T3'}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-xs sm:text-sm font-bold text-[#031D3D] dark:text-white">
                  {trip.dropPoint || `${trip.destination} Resort & Activity Hub`}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {trip.transportation}
          </span>
          <span className="px-3 py-1 rounded-full bg-[#EAF4FF] dark:bg-blue-950/60 text-[#1267D6] dark:text-blue-300 text-xs font-bold">
            {trip.travelStyle} Mode
          </span>
        </div>
      </Card>

      {/* 2. Financial Breakdown & Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Financial summary (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#1267D6]" />
                <h3 className="text-sm font-bold text-[#031D3D] dark:text-white uppercase tracking-wider">
                  Cost Breakdown
                </h3>
              </div>
              <span className="text-[11px] font-bold text-[#19A974] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                Under Budget
              </span>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span>User Budget:</span>
                <span className="font-bold text-[#031D3D] dark:text-white">
                  ₹{trip.budget.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span>Total Estimated Cost:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  ₹{trip.estimatedCost.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400 font-medium">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Applied Offers:
                </span>
                <span className="font-bold">-₹{trip.appliedOfferDiscount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-[#1267D6] dark:text-blue-400 font-medium">
                <span className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" />
                  SAFRO Credits Used:
                </span>
                <span className="font-bold">-₹{trip.creditsUsed.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Final Payable Amount</span>
                <h4 className="text-2xl sm:text-3xl font-extrabold text-[#062B5C] dark:text-white">
                  ₹{finalPayable.toLocaleString('en-IN')}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Est. Savings</span>
                <p className="text-xs font-extrabold text-[#19A974] dark:text-emerald-400">
                  ₹{(trip.budget - finalPayable).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="pt-2">
              {trip.isPaid ? (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate(`/trips/${trip.id}/live`)}
                  rightIcon={<Navigation2 className="w-4 h-4 rotate-45" />}
                  className="w-full font-bold shadow-md shadow-[#1267D6]/20"
                >
                  Open Live Trip Monitoring
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate(`/trips/${trip.id}/payment`)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full font-bold shadow-md shadow-[#1267D6]/20"
                >
                  Continue to Payment (₹{finalPayable.toLocaleString('en-IN')})
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Tabs & Details (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tabs bar */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
            {(['overview', 'itinerary', 'places', 'map'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all capitalize cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-800 text-[#1267D6] dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-base font-extrabold text-[#031D3D] dark:text-white">Trip Highlights</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {trip.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Duration</span>
                  <p className="text-sm font-bold text-[#031D3D] dark:text-white mt-0.5">{trip.durationDays} Days / 3 Nights</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Travelers</span>
                  <p className="text-sm font-bold text-[#031D3D] dark:text-white mt-0.5">{trip.travelers} Persons</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Transport</span>
                  <p className="text-sm font-bold text-[#031D3D] dark:text-white mt-0.5">{trip.transportation}</p>
                </div>
              </div>

              {/* Transit & Boarding Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Pickup / Boarding Point
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-[#031D3D] dark:text-white mt-1">
                    {trip.pickupPoint || 'Delhi Kashmere Gate ISBT / IGI Airport T3'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                  <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Drop / Arrival Stay
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-[#031D3D] dark:text-white mt-1">
                    {trip.dropPoint || `${trip.destination} Resort & Activity Hub`}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Matched Interests
                </h4>
                <div className="flex flex-wrap gap-2">
                  {trip.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 rounded-full bg-[#EAF4FF] dark:bg-blue-950/60 text-[#1267D6] dark:text-blue-300 text-xs font-bold"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setActiveTab('itinerary')}
                  rightIcon={<ChevronDown className="w-4 h-4" />}
                  className="w-full text-xs font-bold"
                >
                  View Day-by-Day Itinerary Plan
                </Button>
              </div>
            </Card>
          )}

          {/* TAB 2: ITINERARY */}
          {activeTab === 'itinerary' && (
            <div className="space-y-4 animate-in fade-in">
              {trip.itinerary && trip.itinerary.length > 0 ? (
                trip.itinerary.map((day) => (
                  <Card key={day.dayNumber} className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] font-bold text-[#1267D6] dark:text-blue-400 uppercase tracking-wider">
                          Day {day.dayNumber}
                        </span>
                        <h4 className="text-sm sm:text-base font-extrabold text-[#031D3D] dark:text-white">
                          {day.title}
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{day.date}</span>
                    </div>

                    <div className="space-y-3">
                      {day.activities.map((act) => (
                        <div
                          key={act.id}
                          className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 flex items-start justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <span className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-[#1267D6] dark:text-blue-300 shrink-0">
                              {act.time}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs sm:text-sm font-bold text-[#031D3D] dark:text-white">
                                  {act.title}
                                </h5>
                                {act.isCompleted && (
                                  <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-md">
                                    Done
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                {act.location} • {act.duration}
                              </p>
                              {act.notes && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                                  "{act.notes}"
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#062B5C] dark:text-blue-400 shrink-0">
                            ₹{act.estimatedCost.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <p>Detailed itinerary items being synchronized by NIEL AI.</p>
                </Card>
              )}
            </div>
          )}

          {/* TAB 3: PLACES */}
          {activeTab === 'places' && (
            <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in">
              <h3 className="text-sm font-extrabold text-[#031D3D] dark:text-white">Recommended Stops & POIs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Solang Valley Adventure Point', type: 'Adventure', rating: 4.8 },
                  { name: 'Hadimba Wooden Temple', type: 'Heritage', rating: 4.7 },
                  { name: 'Jogini Waterfalls & Pine Trek', type: 'Nature', rating: 4.9 },
                  { name: 'Old Manali River Cafes', type: 'Dining', rating: 4.6 },
                ].map((place) => (
                  <div key={place.name} className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#031D3D] dark:text-white">{place.name}</h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{place.type}</span>
                    </div>
                    <span className="text-xs font-bold text-amber-500">★ {place.rating}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 4: MAP PREVIEW */}
          {activeTab === 'map' && (
            <div className="space-y-3 animate-in fade-in">
              <InteractiveMap
                height="340px"
                destinationName={trip.destination}
                showAlternativeRoute={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
