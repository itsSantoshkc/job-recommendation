import { cn } from '../../lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({ className, variant = 'text', ...props }: SkeletonProps) {
  const variants = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  return (
    <div
      className={cn('animate-pulse bg-gray-200 dark:bg-gray-700', variants[variant], className)}
      {...props}
    />
  )
}

export function JobCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-6 dark:border-gray-700">
      <div className="flex gap-4">
        <Skeleton className="h-16 w-16 rounded-lg" variant="rectangular" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded" variant="circular" />
            <Skeleton className="h-6 w-24 rounded" variant="circular" />
            <Skeleton className="h-6 w-24 rounded" variant="circular" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function JobDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-5 w-1/3 mt-2" />
        <div className="flex gap-4 mt-4 flex-wrap">
          <Skeleton className="h-6 w-24 rounded" variant="circular" />
          <Skeleton className="h-6 w-24 rounded" variant="circular" />
          <Skeleton className="h-6 w-24 rounded" variant="circular" />
          <Skeleton className="h-6 w-24 rounded" variant="circular" />
        </div>
      </div>
      <div>
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-full mt-1" />
        <Skeleton className="h-4 w-3/4 mt-1" />
      </div>
      <div>
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-full mt-1" />
        <Skeleton className="h-4 w-3/4 mt-1" />
        <Skeleton className="h-4 w-1/2 mt-1" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="border border-gray-200 rounded-lg p-6 dark:border-gray-700">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-1/2 mt-2" />
        </div>
      ))}
    </div>
  )
}