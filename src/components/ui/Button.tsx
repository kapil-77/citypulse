import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const variants = {
  primary: 'bg-[var(--black)] text-white border-[var(--black)] hover:bg-[#222]',
  secondary: 'bg-white text-[var(--text-primary)] border-[var(--black)] hover:bg-[var(--bg-muted)]',
  ghost: 'bg-transparent text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]',
  danger: 'bg-[var(--black)] text-[var(--status-red)] border-[var(--black)] hover:bg-[#222]',
};

const sizes = {
  sm: 'px-3 py-2 text-[0.6875rem] min-h-[36px]',
  md: 'px-6 py-3 text-[0.8125rem] min-h-[48px]',
  lg: 'px-8 py-4 text-[0.875rem] min-h-[52px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, icon, children, className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2 font-semibold
          border transition-all duration-150 ease-in-out
          disabled:opacity-40 disabled:cursor-not-allowed
          uppercase tracking-[0.08em] leading-none
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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