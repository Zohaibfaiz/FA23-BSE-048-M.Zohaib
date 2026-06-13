export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-xl bg-white/10 ${className}`} />
);

export const CardSkeleton = () => (
  <div className="glass p-6 space-y-4">
    <Skeleton className="h-12 w-12 rounded-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <Skeleton className="h-10 w-full" />
  </div>
);

export const ListSkeleton = ({ count = 4 }) => (
  <div className="grid gap-4 md:grid-cols-2">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);
