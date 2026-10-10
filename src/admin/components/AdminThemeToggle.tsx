// ==============================================================================
// SAFRO DUAL-ICON PILL THEME TOGGLE
// Pixel-perfect implementation matching Image 1 (Login) and Image 2 (Dashboard)
// Displays [ ☀️  🌙 ] side-by-side with animated active slider badge
// ==============================================================================

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAdminTheme } from '../context/AdminThemeContext';

interface AdminThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const AdminThemeToggle: React.FC<AdminThemeToggleProps> = ({
  className = '',
  size = 'md',
}) => {
  const { theme, setTheme, toggleTheme } = useAdminTheme();
  const isDark = theme === 'dark';

  const isSmall = size === 'sm';
  const containerPadding = isSmall ? 'p-0.5' : 'p-1';
  const buttonSize = isSmall ? 'w-6 h-6' : 'w-7 h-7 sm:w-7.5 sm:h-7.5';
  const iconSize = isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div
      role="group"
      aria-label="Theme preference switcher"
      className={`relative inline-flex items-center ${containerPadding} rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs backdrop-blur-xs transition-colors duration-200 ${className}`}
    >
      {/* Light Mode Button (Sun) */}
      <button
        type="button"
        onClick={() => setTheme('light')}
        title="Switch to Light Mode"
        aria-label="Light mode"
        aria-pressed={!isDark}
        className={`relative z-10 flex items-center justify-center ${buttonSize} rounded-full transition-all duration-200 cursor-pointer ${
          !isDark
            ? 'bg-white text-amber-500 shadow-xs font-bold'
            : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        }`}
      >
        <Sun className={`${iconSize} transition-transform ${!isDark ? 'scale-105' : 'scale-90 hover:scale-100'}`} />
      </button>

      {/* Dark Mode Button (Moon) */}
      <button
        type="button"
        onClick={() => setTheme('dark')}
        title="Switch to Dark Mode"
        aria-label="Dark mode"
        aria-pressed={isDark}
        className={`relative z-10 flex items-center justify-center ${buttonSize} rounded-full transition-all duration-200 cursor-pointer ${
          isDark
            ? 'bg-slate-900 text-indigo-400 shadow-xs ring-1 ring-slate-700/80 font-bold'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        }`}
      >
        <Moon className={`${iconSize} transition-transform ${isDark ? 'scale-105' : 'scale-90 hover:scale-100'}`} />
      </button>
    </div>
  );
};

export const ThemeToggle = AdminThemeToggle;
