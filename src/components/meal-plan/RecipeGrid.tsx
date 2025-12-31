import { usePaginatedQuery } from 'convex/react'
import { ChefHat } from 'lucide-react'
import { api } from '~convex/_generated/api'
import type { Id } from '~convex/_generated/dataModel'
import { useInfiniteScroll } from '~/hooks/useInfiniteScroll'
import type { ListFilters } from '~/hooks/useListFilters'
import { RecipeCard } from './RecipeCard'
import { RecipeCardSkeleton, RecipeGridSkeleton } from './RecipeGridSkeleton'

const ITEMS_PER_PAGE = 12

interface RecipeGridProps {
  mode: 'recipes' | 'sides'
  filters: ListFilters
  selectedIds: Id<'recipes'>[]
  onToggleSelection: (id: Id<'recipes'>) => void
}

/**
 * Paginated recipe grid with infinite scroll.
 * Handles data fetching, loading states, and empty states.
 */
export function RecipeGrid({
  mode,
  filters,
  selectedIds,
  onToggleSelection,
}: RecipeGridProps) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.recipes.listPaginated,
    {
      favoritesOnly: filters.favoritesOnly || undefined,
      cuisine: filters.cuisine,
      mealType: mode === 'sides' ? 'sides' : filters.mealType,
      searchQuery: filters.searchQuery || undefined,
    },
    { initialNumItems: ITEMS_PER_PAGE },
  )

  const isLoading = status === 'LoadingMore'
  const hasMore = status === 'CanLoadMore'

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: () => loadMore(ITEMS_PER_PAGE),
  })

  const isSelected = (id: Id<'recipes'>) => selectedIds.includes(id)

  // Initial loading state
  if (status === 'LoadingFirstPage') {
    return <RecipeGridSkeleton />
  }

  // Empty state
  if (results.length === 0) {
    return <RecipeGridEmptyState />
  }

  return (
    <div className="space-y-4">
      {/* Recipe Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {results.map((recipe, index) => (
          <RecipeCard
            key={recipe._id}
            recipe={recipe}
            isSelected={isSelected(recipe._id)}
            onToggle={() => onToggleSelection(recipe._id)}
            index={index}
          />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" aria-hidden="true" />

      {/* Loading more indicator */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* End of results indicator */}
      {status === 'Exhausted' && results.length > 0 && (
        <p className="text-center text-muted-foreground text-sm py-4">
          That's all of them
        </p>
      )}
    </div>
  )
}

/**
 * Empty state display when no recipes match filters.
 */
function RecipeGridEmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
        <ChefHat className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <p className="text-lg font-medium text-muted-foreground">
        No recipes found
      </p>
      <p className="text-sm text-muted-foreground/70 mt-1">
        Try adjusting your filters
      </p>
    </div>
  )
}
