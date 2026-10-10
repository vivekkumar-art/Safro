import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { TripStatus } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  CheckCircle2,
  Navigation2,
  ArrowRight,
  Plus,
  Coins,
} from 'lucide-react';

export const TripsPage: React.FC = () => {
  const { trips } = useTrip();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<'all' | TripStatus>('all');

  const filteredTrips = trips.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            YOUR SAFRO JOURNEYS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#031D3D] dark:text-white tracking-tight">
            My Trips
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
            Manage your past, current, and upcoming AI-planned itineraries
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={() => navigate('/trips/new')}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-md shadow-[#1267D6]/20 font-bold self-start sm:self-auto"
        >
          Plan New Trip
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl w-fit shadow-xs">
        {(['all', 'active', 'planned', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold capitalize transition-all cursor-pointer ${
              filter === status
                ? 'bg-[#1267D6] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#031D3D] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Trips Grid */}
      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const isActive = trip.status === 'active';
            const isCompleted = trip.status === 'completed';

            return (
              <Card
                key={trip.id}
                className="p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative aspect-[16/9] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={trip.imageUrl}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md ${
                          isActive
                            ? 'bg-[#19A974] text-white ring-2 ring-white/50 animate-pulse'
                            : isCompleted
                            ? 'bg-slate-800 text-white'
                            : 'bg-[#1267D6] text-white'
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white">
                      {trip.durationDays} Days • {trip.travelers} Travelers
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-[#031D3D] dark:text-white group-hover:text-[#1267D6] transition-colors leading-snug">
                        {trip.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
                        {trip.destination}, {trip.stateOrCountry}
                      </p>

                      {/* Pickup & Drop Points Route Badge */}
                      <div className="mt-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Pickup" />
                        <span className="truncate font-semibold text-[#031D3D] dark:text-white max-w-[45%]" title={trip.pickupPoint || 'Pickup Point'}>
                          {trip.pickupPoint || 'Delhi Kashmere Gate / IGI'}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Drop" />
                        <span className="truncate font-semibold text-[#031D3D] dark:text-white max-w-[45%]" title={trip.dropPoint || trip.destination}>
                          {trip.dropPoint || `${trip.destination} Stay`}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs space-y-1">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Dates:</span>
                        <span className="font-semibold text-[#031D3D] dark:text-white">
                          {trip.startDate} - {trip.endDate}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Budget:</span>
                        <span className="font-semibold text-[#031D3D] dark:text-white">
                          ₹{trip.budget.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>{isCompleted ? 'Total Spent:' : 'Estimated Cost:'}</span>
                        <span className="font-bold text-[#1267D6] dark:text-blue-400">
                          ₹{(isCompleted ? trip.actualSpent : trip.estimatedCost).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {isCompleted && (
                        <div className="flex justify-between text-[#19A974] dark:text-emerald-400 font-bold pt-1 border-t border-slate-200 dark:border-slate-700">
                          <span>Credits Earned:</span>
                          <span>+₹{(trip.budget - trip.actualSpent).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  {isActive ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/trips/${trip.id}/live`)}
                      rightIcon={<Navigation2 className="w-4 h-4 rotate-45" />}
                      className="w-full text-xs font-bold shadow-sm"
                    >
                      Open Live Map
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="w-full text-xs font-bold"
                    >
                      View Trip Preview
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <Card className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 max-w-md mx-auto">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-[#031D3D] dark:text-white">
              No {filter !== 'all' ? filter : ''} trips found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You don't have any trips matching this category yet.
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/trips/new')}
            className="font-bold shadow-md shadow-[#1267D6]/20"
          >
            Plan Your Next Trip
          </Button>
        </Card>
      )}
    </div>
  );
};
