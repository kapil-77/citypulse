import { useState, useRef, useCallback } from 'react';
import type { Photo } from '../../types/issue';

interface BeforeAfterSliderProps {
  beforePhoto: Photo;
  afterPhoto: Photo;
  className?: string;
}

export const BeforeAfterSlider = ({ beforePhoto, afterPhoto, className = '' }: BeforeAfterSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchStart = () => {
    isDragging.current = true;
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[4/3] overflow-hidden rounded-xl select-none cursor-col-resize group ${className}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      {/* After photo (full width, clipped) */}
      <img
        src={afterPhoto.url}
        alt="After"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Before photo (clipped by slider position) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforePhoto.url}
          alt="Before"
          className="absolute top-0 left-0 w-full h-full object-cover"
          style={{ width: `${100 / (sliderPosition / 100)}%` }}
          draggable={false}
        />
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
        Before
      </div>
      <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
        After
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-600">
            <path fillRule="evenodd" d="M10.53 3.47a.75.75 0 0 0-1.06 0L6.22 6.72a.75.75 0 0 0 1.06 1.06L10 5.06l2.72 2.72a.75.75 0 1 0 1.06-1.06l-3.25-3.25Zm-4.31 9.81 3.25 3.25a.75.75 0 0 0 1.06 0l3.25-3.25a.75.75 0 1 0-1.06-1.06L10 14.94l-2.72-2.72a.75.75 0 0 0-1.06 1.06Z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};