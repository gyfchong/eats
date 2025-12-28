import { Skeleton } from '~/components/ui/skeleton'

interface RecipeListItemSkeletonProps {
  index?: number
}

export function RecipeListItemSkeleton({ index = 0 }: RecipeListItemSkeletonProps) {
  return (
    <div
      className="bg-card border border-border/50 rounded-xl p-4 sm:p-6 animate-fade-up opacity-0"
      style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards' }}
    >
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title */}
            <Skeleton className="h-5 sm:h-6 w-3/4" />
            {/* Cuisine */}
            <Skeleton className="h-3.5 sm:h-4 w-1/3" />
          </div>
          {/* Heart button placeholder */}
          <Skeleton variant="circular" className="size-9 shrink-0" />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1 sm:pt-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2 sm:ml-auto">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-10 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function RecipeListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <RecipeListItemSkeleton key={i} index={i} />
      ))}
    </div>
  )
}
