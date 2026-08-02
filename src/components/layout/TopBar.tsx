import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

export const TopBar = ({ title = 'CityPulse', showBack = false, rightAction, className = '' }: TopBarProps) => {
  const navigate = useNavigate();

  return (
    <header className={`bg-[var(--black)] ${className}`}>
      <div className="container">
        <div className="flex items-center justify-between py-4 min-h-[64px]">
          <div className="flex items-center gap-4">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-8 h-8 hover:bg-white/10 transition-colors"
                aria-label="Go back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                  <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            <h1 className="font-serif text-xl font-bold text-white tracking-tight">{title}</h1>
          </div>
          {rightAction && <div className="flex items-center gap-3">{rightAction}</div>}
        </div>
        <div className="h-px" style={{
          background: 'repeating-linear-gradient(to right, #ffffff 0, #ffffff 2px, transparent 2px, transparent 6px)'
        }} />
      </div>
    </header>
  );
};