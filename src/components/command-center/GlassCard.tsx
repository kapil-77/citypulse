import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const GlassCard = ({ children, className = '', delay = 0 }: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={`rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] ${className}`}
    >
      {children}
    </motion.div>
  );
};