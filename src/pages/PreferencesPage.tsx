import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TravelStyle, TransportType } from '../types';
import { Button } from '../components/common/Button';
import { AdminThemeToggle } from '../admin/components/AdminThemeToggle';
import {
  Sparkles,
  Check,
  Compass,
  TreePine,
  Flame,
  Utensils,
  Landmark,
  ShoppingBag,
  Palmtree,
  Footprints,
  Bus,
  Car,
  CarTaxiFront,
  ArrowRight,
} from 'lucide-react';

const TRAVEL_STYLES: { id: TravelStyle; title: string; desc: string; icon: string }[] = [
  { id: 'Budget', title: 'Budget Explorer', desc: 'Hostels, public transit, street food & best value deals', icon: '🎒' },
  { id: 'Balanced', title: 'Balanced Traveler', desc: 'Boutique hotels, curated activities & authentic cafes', icon: '⚖️' },
  { id: 'Premium', title: 'Premium Luxury', desc: '5-star resorts, private transfers & VIP bespoke experiences', icon: '✨' },
];

const INTERESTS = [
  { id: 'Nature', label: 'Nature', icon: TreePine, desc: 'Mountains, lakes & scenic views' },
  { id: 'Adventure', label: 'Adventure', icon: Flame, desc: 'Trekking, rafting & sports' },
  { id: 'Food', label: 'Food & Dining', icon: Utensils, desc: 'Local delicacies & cafes' },
  { id: 'Culture', label: 'Culture & Art', icon: Landmark, desc: 'Temples, heritage & museums' },
  { id: 'Shopping', label: 'Shopping', icon: ShoppingBag, desc: 'Local markets & souvenirs' },
  { id: 'Relaxation', label: 'Relaxation', icon: Palmtree, desc: 'Yoga, spas & peaceful retreats' },
];

const TRANSPORTS: { id: TransportType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'Walking', label: 'Walking', icon: Footprints },
  { id: 'Public', label: 'Public Transit', icon: Bus },
  { id: 'Car', label: 'Private Car', icon: Car },
  { id: 'Taxi', label: 'Cab / Taxi', icon: CarTaxiFront },
];

export const PreferencesPage: React.FC = () => {
  const { user, updatePreferences } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedStyle, setSelectedStyle] = useState<TravelStyle>(user?.preferences?.travelStyle || 'Balanced');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.preferences?.interests || ['Nature', 'Adventure', 'Food']);
  const [selectedTransport, setSelectedTransport] = useState<TransportType>(user?.preferences?.preferredTransport || 'Car');
  const [isSaving, setIsSaving] = useState(false);

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== id));
    } else {
      if (selectedInterests.length >= 3) {
        showToast('Maximum reached', 'You can select up to 3 primary interests.', 'info');
        return;
      }
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const prefs = {
        travelStyle: selectedStyle,
        interests: selectedInterests,
        preferredTransport: selectedTransport,
      };
      if (user) {
        await updatePreferences(prefs);
      } else {
        localStorage.setItem('safro_pending_preferences', JSON.stringify(prefs));
      }
      showToast('Preferences Saved', 'NIEL AI has personalized your travel profile!', 'success');
      navigate('/home');
    } catch {
      showToast('Error', 'Unable to save preferences.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-slate-950 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto transition-colors duration-200">
      {/* Top Right Theme Toggle */}
      <div className="flex justify-end mb-4">
        <AdminThemeToggle size="sm" />
      </div>

      {/* Top Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF4FF] dark:bg-blue-950/60 text-[#1267D6] dark:text-blue-400 text-xs font-bold tracking-wide mb-3 border border-transparent dark:border-blue-900/50">
          <Sparkles className="w-4 h-4 text-amber-500" />
          NIEL AI PERSONALIZATION
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#031D3D] dark:text-white tracking-tight transition-colors">
          Tell SAFRO how you travel
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto transition-colors">
          This helps NIEL AI craft tailored itineraries, suggest optimized budgets, and unlock personalized offers.
        </p>
      </div>

      <div className="space-y-10">
        {/* Section 1: Travel Style */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#031D3D] dark:text-white">1. Select Travel Style</h2>
            <span className="text-xs font-semibold text-slate-400">Choose one</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TRAVEL_STYLES.map((style) => {
              const isSelected = selectedStyle === style.id;
              return (
                <div
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-[#1267D6] dark:border-blue-500 shadow-lg shadow-[#1267D6]/10 ring-4 ring-[#EAF4FF] dark:ring-blue-950/50'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#1267D6] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                  <span className="text-3xl block mb-2">{style.icon}</span>
                  <h3 className="text-base font-bold text-[#031D3D] dark:text-white">{style.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{style.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Interests (Up to 3) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#031D3D] dark:text-white">2. Your Travel Interests</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pick up to 3 priorities for your recommendations</p>
            </div>
            <span className="text-xs font-extrabold text-[#1267D6] dark:text-blue-400 bg-[#EAF4FF] dark:bg-blue-950/60 px-3 py-1 rounded-full">
              {selectedInterests.length}/3 Selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              const Icon = interest.icon;

              return (
                <div
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-[#1267D6] dark:border-blue-500 shadow-md shadow-[#1267D6]/10 ring-2 ring-[#EAF4FF] dark:ring-blue-950/50'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isSelected ? 'bg-[#1267D6] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#031D3D] dark:text-white">{interest.label}</h4>
                      {isSelected && <Check className="w-4 h-4 text-[#1267D6] dark:text-blue-400 stroke-[3]" />}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{interest.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Preferred Transport */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#031D3D] dark:text-white">3. Preferred Mode of Transport</h2>
            <span className="text-xs font-semibold text-slate-400">Choose one</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {TRANSPORTS.map((t) => {
              const isSelected = selectedTransport === t.id;
              const Icon = t.icon;

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTransport(t.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-[#1267D6] dark:border-blue-500 shadow-md ring-2 ring-[#EAF4FF] dark:ring-blue-950/50'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-[#1267D6] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#031D3D] dark:text-white">{t.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Compass className="w-4 h-4 text-[#19A974]" />
            <span>You can modify these preferences anytime from your Profile</span>
          </div>

          <Button
            onClick={handleSave}
            variant="secondary"
            size="lg"
            isLoading={isSaving}
            className="w-full sm:w-auto px-8 text-sm font-bold shadow-xl shadow-[#1267D6]/30"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Save & Continue to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
