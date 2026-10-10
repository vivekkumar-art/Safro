import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, X, ArrowRight, ShieldCheck, Radio } from 'lucide-react';
import { useTrip } from '../../context/TripContext';

export const NielFloatingWidget: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeTrip } = useTrip();
  const [isOpen, setIsOpen] = useState(false);

  // Don't show floating widget on the full NIEL AI pages or Command Center
  if (
    location.pathname === '/niel-ai' ||
    location.pathname.startsWith('/niel') ||
    location.pathname.includes('/admin/niel')
  ) {
    return null;
  }

  return (
    <>
      {/* Floating Pill / Avatar */}
      <div className="fixed bottom-20 xl:bottom-8 right-4 xl:right-8 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 p-2 pr-4 bg-gradient-to-r from-[#062B5C] to-[#1267D6] text-white rounded-full shadow-xl shadow-[#062B5C]/30 border-2 border-white ring-2 ring-[#1267D6]/20 cursor-pointer"
          aria-label="Open NIEL AI Assistant"
        >
          <div className="relative w-9 h-9 rounded-full bg-white/20 overflow-hidden ring-2 ring-white/60 flex items-center justify-center shrink-0">
            <img
              src="/assets/images/niel-mascot.jpg"
              alt="NIEL AI"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#19A974] ring-1 ring-white" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold leading-tight flex items-center gap-1">
              NIEL AI <span className="text-[9px] bg-white/20 px-1 py-0.2 rounded-full font-normal">Active</span>
            </p>
            <p className="text-[10px] text-blue-100 font-medium leading-tight">Ask me anything...</p>
          </div>
        </motion.button>
      </div>

      {/* Quick Assistant Drawer / Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-36 xl:bottom-24 right-4 xl:right-8 z-50 w-[92vw] max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-br from-[#062B5C] to-[#1267D6] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden ring-1 ring-white/50 flex items-center justify-center">
                  <img
                    src="/assets/images/niel-mascot.jpg"
                    alt="NIEL AI"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-1.5">
                    NIEL AI Travel Assistant
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </h4>
                  <p className="text-[10px] text-blue-100">Monitoring {activeTrip?.destination || 'your journey'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Context Prompt Suggestions */}
            <div className="p-4 space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick suggestions for your trip:</p>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/niel-ai?prompt=What+is+the+weather+forecast+for+my+route?');
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-[#EAF4FF] dark:hover:bg-slate-700 text-xs font-semibold text-[#031D3D] dark:text-slate-200 hover:text-[#1267D6] dark:hover:text-blue-400 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span>🌤️ Check weather & outdoor alert</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/niel-ai?prompt=Is+there+any+traffic+delay+ahead?');
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-[#EAF4FF] dark:hover:bg-slate-700 text-xs font-semibold text-[#031D3D] dark:text-slate-200 hover:text-[#1267D6] dark:hover:text-blue-400 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span>🚗 Check traffic on NH3 (+26m delay)</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/niel-ai?prompt=How+much+budget+is+remaining?');
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-[#EAF4FF] dark:hover:bg-slate-700 text-xs font-semibold text-[#031D3D] dark:text-slate-200 hover:text-[#1267D6] dark:hover:text-blue-400 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span>💰 How much budget is remaining?</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/niel-ai?prompt=Find+a+cheaper+hotel+alternative');
                }}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-[#EAF4FF] dark:hover:bg-slate-700 text-xs font-semibold text-[#031D3D] dark:text-slate-200 hover:text-[#1267D6] dark:hover:text-blue-400 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span>🏨 Find cheaper hotel deal</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/niel');
                  }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-[#1267D6] hover:from-cyan-500 hover:to-[#0E52AD] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  Launch 3D Command Hub
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/niel-ai');
                  }}
                  className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#031D3D] dark:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#1267D6]" />
                  Open NIEL Travel Chat
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
