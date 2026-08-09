import { useState } from 'react';
import type { Photo } from '../../types/issue';

interface PhotoGalleryProps {
  photos: Photo[];
  title: string;
  className?: string;
}

export const PhotoGallery = ({ photos, title, className = '' }: PhotoGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) return null;

  const goTo = (index: number) => {
    if (index < 0) setActiveIndex(photos.length - 1);
    else if (index >= photos.length) setActiveIndex(0);
    else setActiveIndex(index);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative aspect-[4/3] overflow-hidden border-2 border-[var(--black)] shadow-[6px_6px_0_0_var(--accent)] transition-transform duration-300 hover:scale-[1.02] hover:shadow-[8px_8px_0_0_var(--accent)]" style={{ borderRadius: 'var(--radius)' }}>
        <img
          key={activeIndex}
          src={photos[activeIndex].url}
          alt={`${title} — Photo ${activeIndex + 1}`}
          className="w-full h-full object-cover animate-photo-fade"
        />

          {photos.length > 1 && (
            <div className="absolute top-3 right-3 bg-[var(--black)] border border-[var(--black)] px-2 py-0.5">
              <span className="label text-white text-[0.625rem]">{activeIndex + 1} / {photos.length}</span>
            </div>
          )}

          {photos.length > 1 && (
            <>
              <button onClick={() => goTo(activeIndex - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--black)] text-white flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity" aria-label="Previous photo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>
              </button>
              <button onClick={() => goTo(activeIndex + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--black)] text-white flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity" aria-label="Next photo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
              </button>
            </>
          )}

          {photos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, i) => (
                <button key={i} onClick={() => setActiveIndex(i)} className={`w-2 h-2 border transition-all duration-200 ${i === activeIndex ? 'bg-white border-white' : 'bg-transparent border-white opacity-60'}`} aria-label={`Go to photo ${i + 1}`} />
              ))}
            </div>
          )}
      </div>
    </div>
  );
};
