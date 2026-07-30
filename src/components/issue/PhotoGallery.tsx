import { useState } from 'react';
import type { Photo } from '../../types/issue';

interface PhotoGalleryProps {
  photos: Photo[];
  title: string;
}

export const PhotoGallery = ({ photos, title }: PhotoGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) return null;

  const goTo = (index: number) => {
    if (index < 0) setActiveIndex(photos.length - 1);
    else if (index >= photos.length) setActiveIndex(0);
    else setActiveIndex(index);
  };

  return (
    <div className="relative bg-[var(--bg-muted)] border-b border-[var(--border)]">
      <div className="max-w-[var(--page-max-width)] mx-auto">
        <div className="relative aspect-[16/9] md:aspect-[21/9]">
          <img
            src={photos[activeIndex].url}
            alt={`${title} — Photo ${activeIndex + 1}`}
            className="w-full h-full object-cover"
          />

          {photos.length > 1 && (
            <div className="absolute top-3 right-3 bg-[var(--bg-surface)] border border-[var(--border)] px-2 py-0.5">
              <span className="label text-[0.625rem]">{activeIndex + 1} / {photos.length}</span>
            </div>
          )}

          {photos.length > 1 && (
            <>
              <button
                onClick={() => goTo(activeIndex - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--bg-surface)] border border-[var(--border)] hover:bg-[var(--bg-muted)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous photo"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => goTo(activeIndex + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--bg-surface)] border border-[var(--border)] hover:bg-[var(--bg-muted)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next photo"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          )}

          {photos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-2 h-2 border transition-all duration-200 ${
                    i === activeIndex ? 'bg-[var(--text-primary)] border-[var(--text-primary)]' : 'bg-[var(--bg-surface)] border-[var(--border)]'
                  }`}
                  aria-label={`Go to photo ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};