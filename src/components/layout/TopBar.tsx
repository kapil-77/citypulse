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
    <header className={`border-b border-[var(--border)] bg-[var(--bg-surface)] ${className}`}>
      <div className="max-w-[var(--page-max-width)] mx-auto px-[var(--page-padding)]">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-7 h-7 hover:bg-[var(--bg-muted)] transition-colors"
                aria-label="Go back"
                style={{ borderRadius: 'var(--radius-sm)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path
                    fillRule="evenodd"
                    d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
            <h1 className="font-serif text-lg font-semibold text-[var(--text-primary)]">{title}</h1>
          </div>
          {rightAction && <div className="flex items-center">{rightAction}</div>}
        </div>
      </div>
    </header>
  );
};