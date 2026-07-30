import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const variants = {
  primary: 'bg-[var(--accent)] text-white border-[var(--accent)] hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)]',
  secondary: 'bg-transparent text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--bg-hover)]',
  ghost: 'bg-transparent text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]',
  danger: 'bg-[var(--status-red)] text-white border-[var(--status-red)] hover:bg-[var(--accent-hover)]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, icon, children, className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2 font-medium
          border transition-all duration-150 ease-in-out
          disabled:opacity-40 disabled:cursor-not-allowed
          uppercase tracking-wider
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        style={{ borderRadius: 'var(--radius)' }}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';