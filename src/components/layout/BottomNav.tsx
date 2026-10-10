import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { Home, Calendar, Navigation2, Receipt, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTrip } = useTrip();
  const location = useLocation();

  const isLiveMapActive = location.pathname.includes('/live');

  return (
    <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1 safe-area-pb transition-colors duration-200">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Home */}
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-150 ${
              isActive ? 'text-[#1267D6] dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Home className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'font-bold' : ''}`}>
                Home
              </span>
            </>
          )}
        </NavLink>

        {/* Trips */}
        <NavLink
          to="/trips"
          className={({ isActive }) =>
            `flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-150 ${
              isActive ? 'text-[#1267D6] dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Calendar className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'font-bold' : ''}`}>
                Trips
              </span>
            </>
          )}
        </NavLink>

        {/* Live Map (Elevated Center) */}
        <NavLink
          to={`/trips/${activeTrip?.id || 'trip_manali_01'}/live`}
          className="relative -top-3.5 flex flex-col items-center group cursor-pointer"
        >
          <div
            className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 active:scale-95 ${
              isLiveMapActive
                ? 'bg-[#19A974] text-white shadow-[#19A974]/30 ring-4 ring-white dark:ring-slate-900 animate-pulse-glow'
                : 'bg-gradient-to-tr from-[#062B5C] to-[#1267D6] text-white shadow-[#1267D6]/30 ring-4 ring-white dark:ring-slate-900'
            }`}
          >
            <Navigation2 className="w-6 h-6 rotate-45" />
          </div>
          <span
            className={`text-[10px] mt-0.5 font-extrabold tracking-tight ${
              isLiveMapActive ? 'text-[#19A974]' : 'text-[#062B5C] dark:text-slate-300'
            }`}
          >
            Live Map
          </span>
        </NavLink>

        {/* Expenses */}
        <NavLink
          to="/expenses"
          className={({ isActive }) =>
            `flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-150 ${
              isActive ? 'text-[#1267D6] dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Receipt className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'font-bold' : ''}`}>
                Expenses
              </span>
            </>
          )}
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-150 ${
              isActive ? 'text-[#1267D6] dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <User className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'font-bold' : ''}`}>
                Profile
              </span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};
