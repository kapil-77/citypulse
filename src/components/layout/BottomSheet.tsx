import { useRef, useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { useStore } from '../../store';
import type { BottomSheetView } from '../../store/slices/uiSlice';

const SNAP_POINTS: Record<BottomSheetView, number> = {
  none: 0,
  issues_list: 40,
  issue_detail: 70,
  report: 90,
  locality: 60,
};

interface BottomSheetProps {
  children: ReactNode;
  view?: BottomSheetView;
}

export const BottomSheet = ({ children, view }: BottomSheetProps) => {
  const { isBottomSheetOpen, bottomSheetView, closeBottomSheet, setBottomSheetHeight } = useStore();
  const activeView = view || bottomSheetView;
  const [height, setHeight] = useState(SNAP_POINTS[activeView]);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  useEffect(() => {
    if (isBottomSheetOpen) {
      setHeight(SNAP_POINTS[activeView]);
    }
  }, [isBottomSheetOpen, activeView]);

  const handleDragStart = (_: any, info: PanInfo) => {
    startY.current = info.point.y;
  };

  const handleDrag = (_: any, info: PanInfo) => {
    const deltaY = info.point.y - startY.current;
    const windowHeight = window.innerHeight;
    const deltaPercent = (deltaY / windowHeight) * 100;
    const newHeight = Math.max(20, Math.min(95, height - deltaPercent));
    setHeight(newHeight);
    startY.current = info.point.y;
  };

  const handleDragEnd = () => {
    const snapValues = Object.values(SNAP_POINTS).filter((v) => v > 0);
    const nearest = snapValues.reduce((prev, curr) =>
      Math.abs(curr - height) < Math.abs(prev - height) ? curr : prev
    );

    if (nearest < 25) {
      closeBottomSheet();
    } else {
      setHeight(nearest);
      setBottomSheetHeight(nearest);
    }
  };

  return (
    <AnimatePresence>
      {isBottomSheetOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/10"
            onClick={closeBottomSheet}
          />

          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{ height: `${height}%` }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)] border-t border-[var(--border)] overflow-hidden"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            dragDirectionLock
          >
            <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
              <div className="w-8 h-0.5 rounded-full bg-[var(--border-dark)]" />
            </div>

            <div className="h-full overflow-y-auto px-[var(--page-padding)] pb-8 scroll-smooth">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const useBottomSheet = () => {
  const { openBottomSheet, closeBottomSheet } = useStore();
  return { open: openBottomSheet, close: closeBottomSheet };
};