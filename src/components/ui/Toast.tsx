import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';

const typeStyles = {
  success: 'bg-[var(--status-green)] text-white',
  error: 'bg-[var(--status-red)] text-white',
  info: 'bg-[var(--status-blue)] text-white',
};

export const Toast = () => {
  const toast = useStore((s) => s.toast);
  const hideToast = useStore((s) => s.hideToast);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(hideToast, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 border border-white/20 ${typeStyles[toast.type]}`}
          style={{ borderRadius: 'var(--radius)' }}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={hideToast} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};