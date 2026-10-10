import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Navigation, Wallet, ChevronLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { AdminThemeToggle } from '../admin/components/AdminThemeToggle';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  icon: React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    title: 'Plan Your Journey',
    subtitle: 'Get personalized itineraries based on your budget, interests and travel style curated by NIEL AI.',
    badge: 'AI Smart Planning',
    image: '/assets/images/onboarding-1.jpg',
    icon: <Sparkles className="w-5 h-5 text-amber-500" />,
  },
  {
    id: 2,
    title: 'Real-Time Monitoring',
    subtitle: 'Stay informed with live weather forecasts, route updates, traffic delays and smart alternative stops.',
    badge: 'Live GPS Tracking',
    image: '/assets/images/onboarding-2.jpg',
    icon: <Navigation className="w-5 h-5 text-[#1267D6]" />,
  },
  {
    id: 3,
    title: 'Travel Within Your Budget',
    subtitle: 'Track expenses in real time, unlock exclusive partner offers, and earn SAFRO Credits for every rupee saved.',
    badge: 'Wallet & Rewards',
    image: '/assets/images/onboarding-3.jpg',
    icon: <Wallet className="w-5 h-5 text-[#19A974]" />,
  },
];

export const OnboardingPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/preferences');
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col justify-between p-6 sm:p-10 max-w-xl mx-auto transition-colors duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        {currentSlide > 0 ? (
          <button
            onClick={handleBack}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#062B5C] dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}

        {/* SAFRO Logo */}
        <span className="font-heading font-extrabold text-xl tracking-tight text-[#062B5C] dark:text-white transition-colors">
          SAFRO
        </span>

        <div className="flex items-center gap-3">
          <AdminThemeToggle size="sm" />
          <button
            onClick={() => navigate('/preferences')}
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-[#1267D6] dark:hover:text-blue-400 transition-colors cursor-pointer px-2 py-1"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Main Slide Carousel */}
      <div className="my-auto py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            {/* Image Card */}
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-4 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-800">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-xs font-bold text-[#062B5C] dark:text-white shadow-sm border border-white/20 dark:border-slate-700">
                {slide.icon}
                <span>{slide.badge}</span>
              </div>
            </div>

            {/* Texts */}
            <div className="space-y-3 px-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031D3D] dark:text-white tracking-tight transition-colors">
                {slide.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed transition-colors">
                {slide.subtitle}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation & Indicators */}
      <div className="space-y-6">
        {/* Dot Indicators */}
        <div className="flex justify-center items-center gap-2">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide ? 'w-8 bg-[#1267D6]' : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleNext}
            variant="secondary"
            size="lg"
            className="w-full text-base font-bold shadow-lg shadow-[#1267D6]/25"
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};
