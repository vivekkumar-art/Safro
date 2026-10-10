import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: string[];
  currentStep: number; // 1-indexed
  onStepClick?: (step: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="w-full py-4">
      {/* Mobile concise indicator */}
      <div className="sm:hidden flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-bold text-[#1267D6] uppercase tracking-wider">
          Step {currentStep} of {steps.length}
        </span>
        <span className="text-xs font-semibold text-[#031D3D] dark:text-white">{steps[currentStep - 1]}</span>
      </div>

      <div className="flex items-center justify-between relative">
        {/* Background connecting line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-700 w-full z-0 rounded-full" />
        
        {/* Active connecting line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#1267D6] z-0 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={label}
              onClick={() => onStepClick && stepNumber <= currentStep && onStepClick(stepNumber)}
              className={`relative z-10 flex flex-col items-center group ${
                stepNumber <= currentStep ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 shadow-sm ${
                  isCompleted
                    ? 'bg-[#19A974] text-white ring-4 ring-white dark:ring-slate-900'
                    : isCurrent
                    ? 'bg-[#1267D6] text-white ring-4 ring-[#EAF4FF] dark:ring-slate-800 scale-110 shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700 ring-4 ring-white dark:ring-slate-900'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : stepNumber}
              </div>
              <span
                className={`hidden md:block absolute -bottom-6 text-[11px] font-semibold tracking-tight whitespace-nowrap transition-colors ${
                  isCurrent ? 'text-[#1267D6] dark:text-blue-400 font-bold' : isCompleted ? 'text-[#062B5C] dark:text-slate-300' : 'text-slate-400 dark:text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
