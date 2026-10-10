// ==============================================================================
// SAFRO ADMIN KPI CARD COMPONENT
// Pixel-perfect KPI metrics card matching Image 2 with dark mode support
// ==============================================================================

import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AdminKpiCardProps {
  title: string;
  value: string | number;
  changePercent: number;
  changePeriod?: string;
  icon: LucideIcon;
  variant: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'indigo';
  isReversePolarity?: boolean; // For safety alerts where a decrease is positive!
}

export const AdminKpiCard: React.FC<AdminKpiCardProps> = ({
  title,
  value,
  changePercent,
  changePeriod = 'last 7 days',
  icon: Icon,
  variant,
  isReversePolarity = false,
}) => {
  const variantStyles = {
    blue: {
      bg: 'bg-blue-50/80 dark:bg-blue-950/50',
      text: 'text-[#1267D6] dark:text-blue-400',
    },
    emerald: {
      bg: 'bg-emerald-50/80 dark:bg-emerald-950/50',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    purple: {
      bg: 'bg-purple-50/80 dark:bg-purple-950/50',
      text: 'text-purple-600 dark:text-purple-400',
    },
    amber: {
      bg: 'bg-amber-50/80 dark:bg-amber-950/50',
      text: 'text-amber-600 dark:text-amber-400',
    },
    rose: {
      bg: 'bg-rose-50/80 dark:bg-rose-950/50',
      text: 'text-rose-600 dark:text-rose-400',
    },
    indigo: {
      bg: 'bg-indigo-50/80 dark:bg-indigo-950/50',
      text: 'text-indigo-600 dark:text-indigo-400',
    },
  };

  const style = variantStyles[variant] || variantStyles.blue;
  const isPositive = changePercent >= 0;
  // If reverse polarity (e.g. alerts), negative change is good (green)!
  const isGoodTrend = isReversePolarity ? !isPositive : isPositive;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className={`p-2.5 rounded-xl ${style.bg} ${style.text} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
          {title}
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#031D3D] dark:text-white tracking-tight mt-0.5">
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </h3>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 text-xs">
        <span
          className={`font-bold flex items-center ${
            isGoodTrend ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
          )}
          {Math.abs(changePercent)}%
        </span>
        <span className="text-slate-400 dark:text-slate-500 text-[11px]">vs. {changePeriod}</span>
      </div>
    </div>
  );
};
