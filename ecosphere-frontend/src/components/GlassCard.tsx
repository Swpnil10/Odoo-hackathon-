import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'env' | 'social' | 'gov' | 'default';
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glowColor = 'default',
  hoverEffect = true,
  onClick,
}) => {
  const glowClasses = {
    env: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.18)] hover:border-env-primary/40',
    social: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.18)] hover:border-social-primary/40',
    gov: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.18)] hover:border-gov-primary/40',
    default: 'hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:border-white/15',
  };

  const cardContent = (
    <div
      onClick={onClick}
      className={`glass-panel rounded-2xl p-6 transition-all duration-300 select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${
        hoverEffect ? `glass-panel-hover ${glowClasses[glowColor]}` : ''
      } ${className}`}
    >
      {children}
    </div>
  );

  if (hoverEffect) {
    return (
      <motion.div
        whileHover={{ scale: 1.015, y: -2 }}
        whileTap={onClick ? { scale: 0.99 } : undefined}
        transition={{ type: 'spring', stiffness: 350, damping: 18 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
};
export default GlassCard;
