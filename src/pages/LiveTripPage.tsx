import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useTrip } from '../context/TripContext';
import { useToast } from '../context/ToastContext';
import { useNotification } from '../context/NotificationContext';
import { InteractiveMap, LiveTrackingStats } from '../components/map/InteractiveMap';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  ShieldAlert,
  CloudRain,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Receipt,
  Check,
  BellRing,
  Radio,
} from 'lucide-react';

export const LiveTripPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { trips, completeTrip } = useTrip();
  const { showToast } = useToast();
  const {
    permission,
    promptPermissionFlow,
    sendNavigationNotification,
    sendRouteUpdateNotification,
    sendDestinationNotification,
    sendSafetyNotification,
  } = useNotification();
  const navigate = useNavigate();

  const trip = trips.find((t) => t.id === id) || trips[0];

  const [altAccepted, setAltAccepted] = useState(false);
  const [weatherAltAccepted, setWeatherAltAccepted] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [completionResults, setCompletionResults] = useState<{ savings: number; creditsEarned: number } | null>(null);
  const [liveStats, setLiveStats] = useState<LiveTrackingStats | null>(null);

  useEffect(() => {
    if (permission === 'default') {
      promptPermissionFlow();
    }
    sendNavigationNotification('started', trip?.destination || 'Destination');
  }, []);

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

  const live = trip.liveStatus || {
    currentLocationName: 'En route to Solang Valley (NH3)',
    destinationName: 'Solang Valley Adventure Point',
    etaNormal: '1h 20m',
    etaCurrent: '1h 46m',
    delayMinutes: 26,
    currentSpeedKmH: 0,
    weatherAlert: {
      icon: 'CloudRain',
      temp: '14°C',
      condition: 'Scattered Light Showers',
      alertMessage: 'Rain expected near upper Solang around 3:00 PM. Indoor snow sports center available 2.4 km ahead.',
    },
    trafficAlert: {
      level: 'heavy',
      message: 'Congestion on NH3 before Palchan bridge. Faster scenic bypass available.',
      alternativeAvailable: true,
      savedMinutes: 18,
    },
    vehicleCoords: [32.2798, 77.1685] as [number, number],
    destinationCoords: [32.3168, 77.1578] as [number, number],
    waypoints: [
      [32.2396, 77.1887] as [number, number],
      [32.2612, 77.1820] as [number, number],
      [32.2798, 77.1685] as [number, number],
      [32.3021, 77.1610] as [number, number],
      [32.3168, 77.1578] as [number, number],
    ],
  };

  const handleAcceptAlternativeBypass = () => {
    setAltAccepted(true);
    showToast('Route Updated', 'Rerouted via Burua Scenic Bypass. Saved 18 minutes!', 'success');
    sendRouteUpdateNotification({
      destinationName: live.destinationName,
      savedMinutes: 18,
      newEta: '11:48 AM',
      reason: 'Burua Scenic Bypass avoided 26 min congestion on NH3',
    });
  };

  const handleAcceptWeatherAlternative = () => {
    setWeatherAltAccepted(true);
    showToast('Itinerary Updated', 'Indoor Snow World added to your schedule. Saved ₹250.', 'success');
    sendSafetyNotification(
      'Weather Advisory Reroute',
      'Indoor Snow World reserved 2.4 km ahead. Mountain rain alert bypassed.'
    );
  };

  const handleFinishTrip = () => {
    const res = completeTrip(trip.id);
    if (res) {
      setCompletionResults({ savings: res.savings, creditsEarned: res.creditsEarned });
      setIsCompletionModalOpen(true);
      sendDestinationNotification(live.destinationName, 'reached', {
        savings: res.savings,
        creditsEarned: res.creditsEarned,
      });
      try {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#1267D6', '#19A974', '#F5A623', '#062B5C'],
        });
      } catch {}
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Header Bar with LIVE pulse badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#19A974] border border-emerald-200 text-xs font-extrabold tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-[#19A974] animate-ping" />
              LIVE MONITORING ACTIVE
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              GPS Synchronized
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1267D6] dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
              3D Driver Nav
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#031D3D] dark:text-white tracking-tight mt-1">
            {trip.destination} Live Companion
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              sendRouteUpdateNotification({
                destinationName: live.destinationName,
                savedMinutes: 18,
                newEta: '11:48 AM',
                reason: 'Burua Scenic Bypass route preview',
              })
            }
            leftIcon={<BellRing className="w-3.5 h-3.5 text-[#1267D6]" />}
            className="text-xs font-bold"
            title="Trigger instant native route notification"
          >
            Test Push Alert
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/niel')}
            leftIcon={<Radio className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-pulse" />}
            className="text-xs font-bold border-cyan-500/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 shadow-xs"
            title="Launch NIEL 3D GIS Radar & Corridor Telemetry"
          >
            NIEL 3D Radar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/trips/${trip.id}/expenses`)}
            rightIcon={<Receipt className="w-4 h-4" />}
            className="text-xs font-bold"
          >
            Track Expenses
          </Button>

          <Button
            variant="success"
            size="sm"
            onClick={handleFinishTrip}
            rightIcon={<CheckCircle2 className="w-4 h-4" />}
            className="text-xs font-bold shadow-md shadow-[#19A974]/20"
          >
            Complete Trip & Earn Credits
          </Button>
        </div>
      </div>

      {/* Live Route Corridor Banner with Pickup & Drop Points */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
            Active Corridor:
          </span>
          <div className="flex items-center gap-2 flex-wrap font-bold text-[#031D3D] dark:text-white min-w-0">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 truncate max-w-[260px]" title={trip.pickupPoint || 'Pickup Point'}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              {trip.pickupPoint || 'Delhi Kashmere Gate ISBT / IGI Airport T3'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 truncate max-w-[260px]" title={trip.dropPoint || trip.destination}>
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              {trip.dropPoint || `${trip.destination} Resort & Activity Hub`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {liveStats && liveStats.progressPercent > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[#19A974] dark:text-emerald-300 text-[11px] font-bold">
              {liveStats.progressPercent}% Completed
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            {trip.transportation}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1267D6] dark:text-blue-300 text-[11px] font-bold">
            {trip.travelStyle} Mode
          </span>
        </div>
      </div>

      {/* 2. Full-featured 3D Interactive Map */}
      <div className="relative">
        <InteractiveMap
          center={live.vehicleCoords}
          vehiclePos={live.vehicleCoords}
          destinationPos={live.destinationCoords}
          waypoints={live.waypoints}
          destinationName={live.destinationName}
          delayMinutes={live.delayMinutes}
          showAlternativeRoute={true}
          onAcceptAlternative={handleAcceptAlternativeBypass}
          height="500px"
          onProgressUpdate={setLiveStats}
          onArrival={handleFinishTrip}
        />
      </div>

      {/* 3. Live Monitoring Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Destination Target */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            Destination Target
          </span>
          <h4 className="text-sm sm:text-base font-bold text-[#031D3D] dark:text-white mt-0.5 truncate">
            {live.destinationName}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            {liveStats ? `${liveStats.remainingDistanceFormatted} remaining` : '8.4 km remaining'}
          </p>
        </div>

        {/* ETA */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            Estimated Arrival
          </span>
          <h4 className="text-sm sm:text-base font-bold text-[#031D3D] dark:text-white mt-0.5">
            {liveStats?.etaFormatted || (altAccepted ? '11:48 AM' : '12:06 PM')}
          </h4>
          <p className={`text-xs font-bold mt-0.5 ${altAccepted ? 'text-[#19A974]' : 'text-[#F5A623]'}`}>
            {altAccepted ? 'Optimal Bypass' : `+${live.delayMinutes} min delay`}
          </p>
        </div>

        {/* Speed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            Vehicle Telemetry
          </span>
          <h4 className="text-sm sm:text-base font-bold text-[#031D3D] dark:text-white mt-0.5">
            {liveStats ? `${liveStats.currentSpeedKmH} km/h` : `${live.currentSpeedKmH} km/h`}
          </h4>
          <p className="text-xs font-semibold mt-0.5">
            {(liveStats ? liveStats.currentSpeedKmH : live.currentSpeedKmH) > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                {liveStats?.isSimulating ? 'Simulated Highway Pace' : 'Moving in Transit'}
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500">
                Stationary / Parked
              </span>
            )}
          </p>
        </div>

        {/* Budget Health */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            Budget Remaining
          </span>
          <h4 className="text-sm sm:text-base font-bold text-[#1267D6] dark:text-blue-400 mt-0.5">
            ₹{(trip.budget - trip.actualSpent).toLocaleString('en-IN')}
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
            {Math.round((trip.actualSpent / trip.budget) * 100)}% spent
          </p>
        </div>
      </div>

      {/* 4. NIEL AI Active Assistance Cards (Two Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Intelligence Card */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#1267D6]">
                <CloudRain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#031D3D] dark:text-white">NIEL Weather Advisory</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-400">Solang Valley Mountain Pass</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              14°C • Rain at 3 PM
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 text-xs text-slate-700 dark:text-slate-200 space-y-2">
            <p className="leading-relaxed">
              <strong>"Heavy rain expected at 3 PM.</strong> Your outdoor trek may be affected. I found a heated indoor snow sports lounge 2.4 km ahead that costs <strong>₹250 less</strong>."
            </p>
            {weatherAltAccepted ? (
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs pt-1">
                <Check className="w-4 h-4" />
                <span>Indoor Snow Lounge accepted & reserved.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleAcceptWeatherAlternative}
                  className="px-3 py-1.5 rounded-xl bg-[#1267D6] hover:bg-[#0E52AD] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Accept Indoor Option
                </button>
                <button
                  onClick={() => navigate('/niel-ai?prompt=What+other+activities+are+nearby+Solang+Valley?')}
                  className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white font-semibold text-xs hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  View Alternatives
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Traffic & Bypass Intelligence Card */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#031D3D] dark:text-white">Traffic & Route Optimizer</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-400">NH3 Highway & Palchan Bridge</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/50">
              {altAccepted ? 'Bypass Active' : '+26 min delay'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 text-xs text-slate-700 dark:text-slate-200 space-y-2">
            <p className="leading-relaxed">
              <strong>Heavy traffic on NH3.</strong> Tourist buses causing 26 min delay before the bridge. NIEL mapped the Old Burua bypass route saving 18 mins.
            </p>
            {altAccepted ? (
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs pt-1">
                <Check className="w-4 h-4" />
                <span>Rerouted via Burua Scenic Path. ETA updated to 1h 28m.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleAcceptAlternativeBypass}
                  className="px-3 py-1.5 rounded-xl bg-[#19A974] hover:bg-[#14835A] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Accept Bypass (-18m)
                </button>
                <button
                  onClick={() => {}}
                  className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white font-semibold text-xs hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Stay on NH3
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 5. Trip Completion & Credit Reward Modal */}
      <Modal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        title="Trip Completed!"
        subtitle="Congratulations on your incredible journey"
      >
        <div className="text-center py-4 space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#19A974] dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-900/40">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-[#031D3D] dark:text-white">
              You traveled under budget!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Your disciplined spending earned you real SAFRO Credits for your next journey.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F0F7FF] dark:bg-slate-800/90 border border-[#D8E9FF] dark:border-slate-700 text-left text-xs space-y-2">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Original Budget:</span>
              <span className="font-bold text-[#031D3D] dark:text-white">₹{trip.budget.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Actual Spent:</span>
              <span className="font-bold text-[#031D3D] dark:text-white">₹{trip.actualSpent.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold border-t border-[#D8E9FF] dark:border-slate-700 pt-2">
              <span>Total Savings:</span>
              <span>₹{(completionResults?.savings || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[#1267D6] dark:text-blue-400 font-extrabold text-sm border-t border-[#D8E9FF] dark:border-slate-700 pt-2">
              <span>SAFRO Credits Earned:</span>
              <span>+₹{(completionResults?.creditsEarned || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setIsCompletionModalOpen(false);
                navigate('/trips/new');
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full font-bold shadow-lg shadow-[#1267D6]/20"
            >
              Plan Next Trip (Reuse Credits)
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                setIsCompletionModalOpen(false);
                navigate('/credits');
              }}
              className="w-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              View Updated Wallet Balance
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
