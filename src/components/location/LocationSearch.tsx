import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchLocations } from '../../services/location/locationSearch';
import type { LocationResult } from '../../data/indiaLocations';

interface LocationSearchProps {
  onSelect: (location: LocationResult) => void;
  className?: string;
}

export const LocationSearch = ({ onSelect, className = '' }: LocationSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim()) {
      setResults(searchLocations(query));
      setIsOpen(true);
      setActiveIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }, [query]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (location: LocationResult) => {
    onSelect(location);
    setQuery(location.name);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) {
          handleSelect(results[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-stretch border border-[var(--black)] bg-white h-[60px]">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder="Search your city or state"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Search your city or state"
          className="location-search-input flex-1 min-w-0 px-5 text-base md:text-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-transparent border-0 outline-none focus:outline-none focus:ring-0"
        />
        <button
          type="button"
          aria-label="Search"
          className="flex-shrink-0 w-[60px] bg-[var(--black)] text-white flex items-center justify-center hover:bg-[#222] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-[var(--black)] shadow-[var(--shadow-hard)] max-h-[320px] overflow-y-auto"
            role="listbox"
          >
            {results.map((loc, idx) => (
              <li
                key={`${loc.name}-${loc.state}`}
                role="option"
                aria-selected={idx === activeIndex}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => handleSelect(loc)}
                className={`px-4 py-4 cursor-pointer transition-colors duration-100 ${
                  idx === activeIndex ? 'bg-[var(--black)] text-white' : 'bg-white text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold truncate">{loc.name}</span>
                  <span className={`text-[0.625rem] uppercase tracking-[0.08em] flex-shrink-0 ${idx === activeIndex ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>
                    {loc.type === 'state' ? 'STATE' : loc.type === 'ut' ? 'UT' : 'CITY'}
                  </span>
                </div>
                <div className={`text-xs mt-0.5 truncate ${idx === activeIndex ? 'text-white/70' : 'text-[var(--text-secondary)]'}`}>
                  {loc.state}
                </div>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};