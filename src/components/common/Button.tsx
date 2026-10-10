import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger' | 'white';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl sm:rounded-2xl transition-all duration-200 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 sm:px-5 sm:py-3 gap-2',
    lg: 'text-base px-6 py-3.5 sm:px-8 sm:py-4 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#062B5C] dark:bg-[#1267D6] hover:bg-[#031D3D] dark:hover:bg-[#0E52AD] text-white shadow-md shadow-[#062B5C]/20 hover:shadow-lg hover:shadow-[#062B5C]/30',
    secondary: 'bg-[#1267D6] hover:bg-[#0E52AD] text-white shadow-md shadow-[#1267D6]/25 hover:shadow-lg',
    outline: 'border-2 border-slate-200 dark:border-slate-700 hover:border-[#1267D6] dark:hover:border-[#1267D6] text-[#062B5C] dark:text-slate-100 hover:text-[#1267D6] dark:hover:text-[#1267D6] bg-white dark:bg-slate-900 hover:bg-[#EAF4FF]/40 dark:hover:bg-slate-800/80',
    ghost: 'text-[#062B5C] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#1267D6] dark:hover:text-[#1267D6]',
    white: 'bg-white hover:bg-slate-100 dark:bg-slate-100 dark:hover:bg-white text-black shadow-md shadow-black/10 hover:shadow-lg',
    success: 'bg-[#19A974] hover:bg-[#14835A] text-white shadow-md shadow-[#19A974]/25',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span className="inline-flex items-center justify-center gap-2">{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
