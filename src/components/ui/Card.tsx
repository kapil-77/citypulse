import { type HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'editorial' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-[var(--bg-surface)] border border-[var(--border)]',
  editorial: 'bg-[var(--bg-surface)] border border-[var(--border)]',
  interactive: 'bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[var(--border-dark)] cursor-pointer transition-colors duration-150',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
        style={{ borderRadius: 'var(--radius)' }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex items-center justify-between mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`font-serif font-semibold text-[var(--text-primary)] ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className = '', children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-[var(--text-secondary)] leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);