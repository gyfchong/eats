import { Skeleton } from '~/components/ui/skeleton'

export function RestaurantDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-6 sm:py-8 max-w-3xl animate-fade-up">
      {/* Back button */}
      <Skeleton className="h-8 w-20 mb-4 sm:mb-6 rounded-md" />

      <div className="bg-card border border-border/50 rounded-2xl p-5 sm:p-8">
        {/* Title */}
        <Skeleton className="h-8 sm:h-10 w-2/3 mb-1" />

        {/* Suburb */}
        <Skeleton className="h-5 sm:h-6 w-1/4 mb-4" />

        {/* Cuisine */}
        <Skeleton className="h-4 sm:h-5 w-1/5 mb-4 sm:mb-6" />

        {/* Meal Type Badges */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>

        {/* Dishes section */}
        <div className="mb-6 sm:mb-8">
          <Skeleton className="h-7 sm:h-8 w-24 mb-4" />
          <div className="divide-y divide-border/50">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <Skeleton
                  className="h-4 sm:h-5"
                  style={{ width: `${40 + i * 10}%` }}
                />
                {/* Star rating placeholder */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} variant="circular" className="size-4" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Button */}
        <Skeleton className="h-10 w-full sm:w-40 rounded-md" />
      </div>
    </div>
  )
}
