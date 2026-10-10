import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'white' | 'glass' | 'pastel' | 'navy';
  isHoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'white',
  isHoverable = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    white: 'bg-white dark:bg-slate-900 border border-slate-100/80 dark:border-slate-800 shadow-sm hover:shadow-md text-[#031D3D] dark:text-slate-100 transition-colors duration-200',
    glass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800 shadow-lg text-[#031D3D] dark:text-slate-100 transition-colors duration-200',
    pastel: 'bg-[#F0F7FF] dark:bg-slate-800/60 border border-[#D8E9FF] dark:border-slate-700/80 shadow-sm text-[#031D3D] dark:text-slate-100 transition-colors duration-200',
    navy: 'bg-gradient-to-br from-[#062B5C] to-[#031D3D] text-white shadow-xl shadow-[#062B5C]/20 border border-white/10',
  };

  const hoverMotion = isHoverable
    ? {
        whileHover: { y: -3, transition: { duration: 0.2 } },
        whileTap: { scale: 0.99 },
      }
    : {};

  return (
    <motion.div
      className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-shadow ${variantStyles[variant]} ${className}`}
      {...hoverMotion}
      {...props}
    >
      {children}
    </motion.div>
  );
};
