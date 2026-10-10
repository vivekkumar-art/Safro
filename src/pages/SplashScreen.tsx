import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Compass, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button';

import { useAuth } from '../context/AuthContext';

export const SplashScreen: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between p-6 sm:p-12 overflow-hidden bg-[#031D3D] text-white">
      {/* Background Hero Travel Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/images/hero-mountains.jpg"
          alt="Himalayan Mountains"
          className="w-full h-full object-cover opacity-45 scale-105 animate-in fade-in duration-1000"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#031D3D] via-[#062B5C]/75 to-[#031D3D]/60" />
      </div>

      {/* Top Header: Brand & Skip */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <Plane className="w-6 h-6 text-white rotate-45" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-2xl tracking-wider text-white">
              SAFRO
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/home')}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-xs font-bold text-white transition-all cursor-pointer"
        >
          Explore App →
        </button>
      </header>

      {/* Center Hero Content */}
      <main className="relative z-10 my-auto py-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1267D6]/30 backdrop-blur-md border border-[#1267D6]/50 text-blue-200 text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-300" />
            AI-POWERED INTELLIGENT TRAVEL
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
            Plan smarter. <br />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
              Travel better.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-lg leading-relaxed pt-2">
            Meet <strong className="text-white">NIEL AI</strong> — your proactive travel companion. Get custom itineraries, real-time traffic & weather rerouting, and earn SAFRO credits on every trip you save.
          </p>
        </motion.div>
      </main>

      {/* Bottom Actions */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6 border-t border-white/10">
        <Button
          onClick={() => navigate('/onboarding')}
          size="lg"
          variant="secondary"
          rightIcon={<ArrowRight className="w-5 h-5" />}
          className="w-full sm:w-auto shadow-xl shadow-[#1267D6]/40 text-base"
        >
          Get Started
        </Button>

        <Button
          onClick={() => navigate('/login')}
          size="lg"
          variant="ghost"
          className="w-full sm:w-auto text-white hover:bg-white/10 text-base border border-white/20"
        >
          Sign In
        </Button>

        <div className="sm:ml-auto flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-400" />
            Live GPS Tracking
          </span>
          <span>•</span>
          <span>Verified Local Stays</span>
          <span>•</span>
          <span>Wallet Rewards</span>
        </div>
      </footer>
    </div>
  );
};
