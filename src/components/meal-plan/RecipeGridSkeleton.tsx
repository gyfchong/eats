import { cn } from '~/lib/utils'

interface RecipeCardSkeletonProps {
  className?: string
}

/**
 * Skeleton loader for individual recipe cards.
 * Uses custom shimmer animation for smooth loading states.
 */
export function RecipeCardSkeleton({ className }: RecipeCardSkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-card border border-border/40',
        className,
      )}
    >
      <div className="aspect-square bg-muted relative overflow-hidden skeleton-shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-muted rounded-md w-3/4 relative overflow-hidden skeleton-shimmer" />
        <div className="h-3 bg-muted rounded-md w-1/2 relative overflow-hidden skeleton-shimmer" />
      </div>
    </div>
  )
}

interface RecipeGridSkeletonProps {
  count?: number
  className?: string
}

/**
 * Grid skeleton for recipe loading states.
 * Matches the responsive grid layout of RecipeGrid.
 */
export function RecipeGridSkeleton({
  count = 8,
  className,
}: RecipeGridSkeletonProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4',
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  )
}
