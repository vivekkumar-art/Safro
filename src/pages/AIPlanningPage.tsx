import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import { Sparkles, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { ProgressBar } from '../components/common/ProgressBar';
import { Button } from '../components/common/Button';

const CHECKLIST_ITEMS = [
  'Analyzing destination climate & topography',
  'Finding top-rated boutique stays within budget',
  'Optimizing scenic travel routes & timing',
  'Checking real-time activity rates & fees',
  'Matching applicable SAFRO promo offers',
  'Generating day-by-day personalized itinerary',
];

export const AIPlanningPage: React.FC = () => {
  const { newTripDraft, createTrip } = useTrip();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [createdTripId, setCreatedTripId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < CHECKLIST_ITEMS.length) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeStep >= CHECKLIST_ITEMS.length && !createdTripId) {
      // Create trip in state
      const created = createTrip({
        ...newTripDraft,
        title: `${newTripDraft.destination || 'Manali'} Adventure Escape`,
        status: 'planned',
      });
      setCreatedTripId(created.id);

      // Auto redirect after 1.2s delay
      const timer = setTimeout(() => {
        navigate(`/trips/${created.id}`);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [activeStep, createdTripId, createTrip, newTripDraft, navigate]);

  const progressPercent = Math.min(100, Math.round((activeStep / CHECKLIST_ITEMS.length) * 100));

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 px-4 max-w-xl mx-auto text-center">
      {/* Animated NIEL AI Mascot & Radar Ring */}
      <div className="relative mb-6">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-[#062B5C] via-[#1267D6] to-sky-400 shadow-2xl shadow-[#1267D6]/30 flex items-center justify-center"
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-white ring-4 ring-white flex items-center justify-center">
            <img
              src="/assets/images/niel-mascot.jpg"
              alt="NIEL AI"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <Sparkles className="w-12 h-12 text-amber-400 absolute" />
          </div>
        </motion.div>

        {/* Orbiting particles */}
        <div className="absolute -inset-4 rounded-full border-2 border-dashed border-[#1267D6]/40 animate-spin" style={{ animationDuration: '15s' }} />
      </div>

      {/* Headings */}
      <div className="space-y-2 mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF4FF] text-[#1267D6] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Synthesizing Travel Intelligence
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#031D3D] tracking-tight">
          NIEL AI is creating your trip...
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Tailoring {newTripDraft.destination || 'Manali'} for {newTripDraft.travelers || 2} travelers within ₹{(newTripDraft.budget || 25000).toLocaleString('en-IN')}.
        </p>
        {/* Route Corridor Indicator */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-1 border border-slate-200 dark:border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-[#031D3D] dark:text-white font-bold truncate max-w-[160px]" title={newTripDraft.pickupPoint || 'Pickup Point'}>
            {newTripDraft.pickupPoint || 'Delhi Kashmere Gate / IGI'}
          </span>
          <span className="text-slate-400">➔</span>
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span className="text-[#031D3D] dark:text-white font-bold truncate max-w-[160px]" title={newTripDraft.dropPoint || newTripDraft.destination || 'Destination'}>
            {newTripDraft.dropPoint || newTripDraft.destination || 'Manali Resort'}
          </span>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="w-full mb-8">
        <ProgressBar value={progressPercent} height="md" color="blue" />
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 mt-2">
          <span>{activeStep >= CHECKLIST_ITEMS.length ? 'Finalizing plan' : 'Optimizing parameters'}</span>
          <span className="text-[#1267D6]">{progressPercent}%</span>
        </div>
      </div>

      {/* Checklist items */}
      <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-3 text-left">
        {CHECKLIST_ITEMS.map((item, index) => {
          const isDone = index < activeStep;
          const isCurrent = index === activeStep;

          return (
            <div
              key={item}
              className={`flex items-center gap-3 text-xs sm:text-sm font-semibold transition-all duration-300 ${
                isDone
                  ? 'text-[#031D3D]'
                  : isCurrent
                  ? 'text-[#1267D6]'
                  : 'text-slate-300'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-[#19A974] shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-[#1267D6] animate-spin shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0" />
              )}
              <span className={isDone ? 'line-through text-slate-400' : ''}>{item}</span>
            </div>
          );
        })}
      </div>

      {/* Manual Continue Button when ready */}
      {createdTripId && (
        <div className="mt-8 animate-in fade-in">
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate(`/trips/${createdTripId}`)}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="shadow-xl shadow-[#1267D6]/20 font-bold"
          >
            View Trip Preview Now
          </Button>
        </div>
      )}
    </div>
  );
};
