// ==============================================================================
// SAFRO THEME CONTEXT & CONTROLLER
// Robust Light & Dark theme management across Admin & SAFRO Application
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AdminTheme = 'light' | 'dark';

interface AdminThemeContextType {
  theme: AdminTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: AdminTheme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'safro_admin_theme';

const applyThemeToDOM = (theme: AdminTheme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;
  const isDark = theme === 'dark';

  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
    if (body) {
      body.classList.add('dark');
      body.setAttribute('data-theme', 'dark');
    }
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
    if (body) {
      body.classList.remove('dark');
      body.setAttribute('data-theme', 'light');
    }
  }
};

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AdminTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        applyThemeToDOM(saved);
        return saved;
      }
    } catch {}
    // Default to clean Light mode matching Image 1 & Image 2 designs
    applyThemeToDOM('light');
    return 'light';
  });

  // Apply theme to DOM on state change
  useEffect(() => {
    applyThemeToDOM(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const setTheme = (newTheme: AdminTheme) => {
    applyThemeToDOM(newTheme);
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    applyThemeToDOM(next);
    setThemeState(next);
  };

  const isDark = theme === 'dark';

  return (
    <AdminThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      <div className={`w-full min-h-screen ${isDark ? 'dark' : ''}`} data-theme={theme}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider');
  }
  return context;
};

// Convenient aliases for usage across user and admin applications
export const useTheme = useAdminTheme;
export const ThemeProvider = AdminThemeProvider;
