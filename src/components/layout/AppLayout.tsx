import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { NielFloatingWidget } from '../ai/NielFloatingWidget';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#020617] text-[#031D3D] dark:text-slate-100 pb-24 xl:pb-8 transition-colors duration-200">
      {/* Top Header */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Outlet />
      </main>

      {/* Floating AI Widget */}
      <NielFloatingWidget />

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
