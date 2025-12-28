import { Skeleton } from '~/components/ui/skeleton'

export function RecipeDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-6 sm:py-8 max-w-3xl animate-fade-up">
      {/* Back button */}
      <Skeleton className="h-8 w-20 mb-4 sm:mb-6 rounded-md" />

      <div className="bg-card border border-border/50 rounded-2xl p-5 sm:p-8">
        {/* Title */}
        <Skeleton className="h-8 sm:h-10 w-3/4 mb-2" />

        {/* Cuisine */}
        <Skeleton className="h-5 sm:h-6 w-1/4 mb-4 sm:mb-6" />

        {/* Ingredients section */}
        <div className="mb-6 sm:mb-8">
          <Skeleton className="h-7 sm:h-8 w-32 mb-3 sm:mb-4" />
          <div className="space-y-2.5 sm:space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton variant="circular" className="size-1.5 mt-2 shrink-0" />
                <Skeleton
                  className="h-4 sm:h-5"
                  style={{ width: `${70 + Math.sin(i) * 20}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notes section */}
        <div className="mb-6 sm:mb-8">
          <Skeleton className="h-7 sm:h-8 w-20 mb-3 sm:mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Button */}
        <Skeleton className="h-10 w-full sm:w-40 rounded-md" />
      </div>
    </div>
  )
}
