interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
}

export const Skeleton = ({ className = '', variant = 'text', width, height }: SkeletonProps) => {
  const baseClasses = 'animate-pulse bg-gray-100 rounded-md';
  
  const variantClasses = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'rounded-2xl h-32 w-full',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};

// Issue card skeleton
export const IssueCardSkeleton = () => (
  <div className="p-4 bg-white rounded-2xl border border-gray-100 space-y-3">
    <Skeleton variant="rectangular" height={160} className="w-full -mx-4 -mt-4 rounded-none rounded-t-2xl" />
    <div className="space-y-2">
      <Skeleton className="w-3/4" />
      <Skeleton className="w-full" />
      <Skeleton className="w-1/2" />
    </div>
    <div className="flex justify-between">
      <Skeleton className="w-24" />
      <Skeleton className="w-16" />
    </div>
  </div>
);

// Detail page skeleton
export const IssueDetailSkeleton = () => (
  <div className="space-y-4 p-4">
    <Skeleton variant="rectangular" height={200} className="w-full -mx-4 rounded-none" />
    <div className="space-y-3">
      <Skeleton className="w-1/3" />
      <Skeleton className="w-full" />
      <Skeleton className="w-3/4" />
    </div>
    <Skeleton variant="rectangular" height={160} />
    <Skeleton variant="card" />
    <Skeleton variant="card" />
  </div>
);

// Health score skeleton
export const HealthScoreSkeleton = () => (
  <div className="space-y-4">
    <div className="flex flex-col items-center py-8">
      <Skeleton variant="circular" width={160} height={160} />
      <Skeleton className="w-24 mt-4" />
    </div>
    <div className="grid grid-cols-3 gap-3">
      <Skeleton variant="card" height={60} />
      <Skeleton variant="card" height={60} />
      <Skeleton variant="card" height={60} />
    </div>
    <Skeleton variant="card" height={80} />
    <Skeleton variant="card" height={80} />
    <Skeleton variant="card" height={80} />
  </div>
);

// List loading skeleton
export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-2/3" />
          <Skeleton className="w-1/2" />
        </div>
      </div>
    ))}
  </div>
);