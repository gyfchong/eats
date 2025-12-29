import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '~convex/_generated/api'
import { ListFilterBar } from '~/components/ListFilterBar'
import type { ListFilters } from '~/hooks/useListFilters'
import { Skeleton } from '~/components/ui/skeleton'

interface RecipeFilterBarProps {
  filters: ListFilters
  updateFilter: <K extends keyof ListFilters>(key: K, value: ListFilters[K]) => void
  resetFilters: () => void
  hasActiveFilters: boolean
  lockedMealType?: string
}

export function RecipeFilterBar({
  filters,
  updateFilter,
  resetFilters,
  hasActiveFilters,
  lockedMealType,
}: RecipeFilterBarProps) {
  const { data: cuisines } = useSuspenseQuery(
    convexQuery(api.recipes.getCuisines, {}),
  )
  const { data: mealTypes } = useSuspenseQuery(
    convexQuery(api.recipes.getMealTypes, {}),
  )

  const handleMealTypeChange = (value: string | undefined) => {
    if (lockedMealType) return
    updateFilter('mealType', value)
  }

  return (
    <ListFilterBar
      searchQuery={filters.searchQuery}
      favoritesOnly={filters.favoritesOnly}
      cuisine={filters.cuisine}
      mealType={lockedMealType ?? filters.mealType}
      cuisineOptions={cuisines}
      mealTypeOptions={lockedMealType ? [lockedMealType] : mealTypes}
      onSearchChange={(v) => updateFilter('searchQuery', v)}
      onFavoritesOnlyChange={(v) => updateFilter('favoritesOnly', v)}
      onCuisineChange={(v) => updateFilter('cuisine', v)}
      onMealTypeChange={handleMealTypeChange}
      onReset={resetFilters}
      hasActiveFilters={hasActiveFilters}
    />
  )
}

export function RecipeFilterBarSkeleton() {
  return (
    <div className="space-y-4 mb-6 animate-pulse">
      <Skeleton className="h-9 bg-muted rounded-md" />
      <div className="flex gap-3">
        <Skeleton className="h-6 w-24 bg-muted rounded" />
        <Skeleton className="h-9 w-[150px] bg-muted rounded-md" />
        <Skeleton className="h-9 w-[150px] bg-muted rounded-md" />
      </div>
    </div>
  )
}
