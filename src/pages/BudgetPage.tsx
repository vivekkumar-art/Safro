import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ArrowRight, ChevronLeft, Sparkles, Plus, Minus } from 'lucide-react';

export const BudgetPage: React.FC = () => {
  const { newTripDraft, updateDraft } = useTrip();
  const navigate = useNavigate();

  const budget = newTripDraft.budget || 25000;

  // 20% Transport, 30% Stay, 15% Food, 20% Activities, 15% Other
  const transportCost = Math.round(budget * 0.2);
  const stayCost = Math.round(budget * 0.3);
  const foodCost = Math.round(budget * 0.15);
  const activitiesCost = Math.round(budget * 0.2);
  const otherCost = Math.round(budget * 0.15);

  const handleNext = () => {
    navigate('/trips/new');
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-[#062B5C] transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#031D3D]">
          What's your budget?
        </h1>
        <div className="w-9" />
      </div>

      <Card className="p-6 sm:p-8 bg-white border border-slate-100 shadow-md space-y-6">
        {/* Main Budget Display */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#062B5C] to-[#031D3D] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider">
              Total Budget
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mt-1">
              ₹{budget.toLocaleString('en-IN')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateDraft({ budget: Math.max(5000, budget - 2000) })}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm cursor-pointer"
            >
              - ₹2,000
            </button>
            <button
              onClick={() => updateDraft({ budget: budget + 2000 })}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm cursor-pointer"
            >
              + ₹2,000
            </button>
          </div>
        </div>

        {/* Preset Buttons */}
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Popular Presets
          </span>
          <div className="flex flex-wrap gap-2">
            {[10000, 20000, 25000, 30000, 50000].map((preset) => (
              <button
                key={preset}
                onClick={() => updateDraft({ budget: preset })}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  budget === preset
                    ? 'bg-[#1267D6] text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                ₹{(preset / 1000).toFixed(0)}K
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Allocation Breakdown */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Budget Allocation
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="text-xs font-semibold text-slate-500">Transport - 20%</span>
              <p className="text-base font-bold text-[#1267D6] mt-0.5">
                ₹{transportCost.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
              <span className="text-xs font-semibold text-slate-500">Stay - 30%</span>
              <p className="text-base font-bold text-indigo-700 mt-0.5">
                ₹{stayCost.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-xs font-semibold text-slate-500">Food - 15%</span>
              <p className="text-base font-bold text-amber-700 mt-0.5">
                ₹{foodCost.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-xs font-semibold text-slate-500">Activities - 20%</span>
              <p className="text-base font-bold text-[#19A974] mt-0.5">
                ₹{activitiesCost.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-xs font-semibold text-slate-500">Other - 15%</span>
              <p className="text-base font-bold text-slate-700 mt-0.5">
                ₹{otherCost.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button
            size="lg"
            variant="secondary"
            onClick={handleNext}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto font-bold shadow-md shadow-[#1267D6]/20"
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
};
