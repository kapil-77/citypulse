import { motion } from 'framer-motion';
import { Button } from './Button';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({ icon, title, description, actionLabel, onAction, className = '' }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
    >
      <div className="text-3xl mb-4 font-serif">{icon}</div>
      <h3 className="text-lg font-serif font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-xs mb-5">{description}</p>
      {actionLabel && onAction && <Button variant="primary" size="sm" onClick={onAction}>{actionLabel}</Button>}
    </motion.div>
  );
};