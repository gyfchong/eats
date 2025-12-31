/**
 * Skeleton loader for filter bar components.
 * Matches the layout of ListFilterBar during loading.
 */
export function FilterBarSkeleton() {
  return (
    <div className="space-y-4 mb-6 animate-pulse">
      <div className="h-9 bg-muted rounded-md" />
      <div className="flex gap-3">
        <div className="h-6 w-24 bg-muted rounded" />
        <div className="h-9 w-[150px] bg-muted rounded-md" />
        <div className="h-9 w-[150px] bg-muted rounded-md" />
        <div className="h-9 w-[180px] bg-muted rounded-md" />
      </div>
    </div>
  )
}
