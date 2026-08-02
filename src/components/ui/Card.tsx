import { type HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'editorial' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const variantStyles = {
  default: 'bg-white border border-[var(--black)] shadow-[var(--shadow-hard)]',
  editorial: 'bg-white border border-[var(--black)] shadow-[var(--shadow-hard)]',
  interactive: 'bg-white border border-[var(--black)] shadow-[var(--shadow-hard)] hover:shadow-[4px_4px_0_0_var(--black)] cursor-pointer transition-shadow duration-150',
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-7',
  lg: 'p-8',
  xl: 'p-10',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex items-center justify-between mb-5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`font-serif font-bold text-[var(--text-primary)] ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className = '', children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-[var(--text-secondary)] leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);