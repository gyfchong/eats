import { Suspense, useState, useDeferredValue } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { usePaginatedQuery } from 'convex/react'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '~convex/_generated/api'
import type { Doc, Id } from '~convex/_generated/dataModel'
import { Button } from '~/components/ui/button'
import { RestaurantForm } from '~/components/RestaurantForm'
import { RestaurantListItem } from '~/components/RestaurantListItem'
import { RestaurantListSkeleton } from '~/components/RestaurantListItemSkeleton'
import { ListFilterBar } from '~/components/ListFilterBar'
import { FilterBarSkeleton } from '~/components/FilterBarSkeleton'
import {
  useListFilters,
  type RestaurantFilters,
} from '~/hooks/useListFilters'
import { useInfiniteScroll } from '~/hooks/useInfiniteScroll'

const ITEMS_PER_PAGE = 10

export const Route = createFileRoute('/restaurants/')({
  component: RestaurantsPage,
})

function RestaurantsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState<
    Doc<'restaurants'> | undefined
  >(undefined)

  const { filters, updateFilter, resetFilters, hasActiveFilters } =
    useListFilters<RestaurantFilters>({
      favoritesOnly: false,
      cuisine: undefined,
      mealType: undefined,
      searchQuery: '',
      suburb: undefined,
    })

  // Debounce search query
  const deferredSearchQuery = useDeferredValue(filters.searchQuery)

  return (
    <div className="container mx-auto px-4 sm:px-8 py-6 sm:py-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display">Restaurants</h1>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto"
        >
          Add Restaurant
        </Button>
      </div>

      <Suspense fallback={<FilterBarSkeleton />}>
        <RestaurantsFilterBar
          filters={filters}
          updateFilter={updateFilter}
          resetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </Suspense>

      <RestaurantsList
        filters={{ ...filters, searchQuery: deferredSearchQuery }}
        onEdit={setEditingRestaurant}
      />

      <RestaurantForm
        restaurant={editingRestaurant}
        open={isAddModalOpen || !!editingRestaurant}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingRestaurant(undefined)
        }}
        onSaved={() => {
          setIsAddModalOpen(false)
          setEditingRestaurant(undefined)
        }}
      />
    </div>
  )
}

function RestaurantsFilterBar({
  filters,
  updateFilter,
  resetFilters,
  hasActiveFilters,
}: {
  filters: RestaurantFilters
  updateFilter: <K extends keyof RestaurantFilters>(
    key: K,
    value: RestaurantFilters[K],
  ) => void
  resetFilters: () => void
  hasActiveFilters: boolean
}) {
  const { data: cuisines } = useSuspenseQuery(
    convexQuery(api.restaurants.getCuisines, {}),
  )
  const { data: mealTypes } = useSuspenseQuery(
    convexQuery(api.restaurants.getMealTypes, {}),
  )
  const { data: suburbs } = useSuspenseQuery(
    convexQuery(api.restaurants.getSuburbs, {}),
  )

  return (
    <ListFilterBar
      searchQuery={filters.searchQuery}
      favoritesOnly={filters.favoritesOnly}
      cuisine={filters.cuisine}
      mealType={filters.mealType}
      suburb={filters.suburb}
      cuisineOptions={cuisines}
      mealTypeOptions={mealTypes}
      suburbOptions={suburbs}
      onSearchChange={(v) => updateFilter('searchQuery', v)}
      onFavoritesOnlyChange={(v) => updateFilter('favoritesOnly', v)}
      onCuisineChange={(v) => updateFilter('cuisine', v)}
      onMealTypeChange={(v) => updateFilter('mealType', v)}
      onSuburbChange={(v) => updateFilter('suburb', v)}
      onReset={resetFilters}
      hasActiveFilters={hasActiveFilters}
    />
  )
}

interface RestaurantsListProps {
  filters: RestaurantFilters
  onEdit: (restaurant: Doc<'restaurants'>) => void
}

function RestaurantsList({ filters, onEdit }: RestaurantsListProps) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.restaurants.listPaginated,
    {
      favoritesOnly: filters.favoritesOnly || undefined,
      cuisine: filters.cuisine,
      suburb: filters.suburb,
      mealType: filters.mealType,
      searchQuery: filters.searchQuery || undefined,
    },
    { initialNumItems: ITEMS_PER_PAGE },
  )

  const toggleFavoriteMutation = useConvexMutation(
    api.restaurants.toggleFavorite,
  )
  const removeMutation = useConvexMutation(api.restaurants.remove)

  const isLoading = status === 'LoadingMore'
  const hasMore = status === 'CanLoadMore'

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: () => loadMore(ITEMS_PER_PAGE),
  })

  const handleDelete = async (id: Id<'restaurants'>) => {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      await removeMutation({ id })
    }
  }

  if (status === 'LoadingFirstPage') {
    return <RestaurantListSkeleton count={4} />
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 text-muted-foreground">
        <p className="text-lg">No restaurants found</p>
        <p className="text-sm mt-1">
          Try adjusting your filters or add a new restaurant!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {results.map((restaurant, index) => (
        <div
          key={restaurant._id}
          className="animate-fade-up"
          style={{ animationDelay: `${Math.min(index, 4) * 0.05}s` }}
        >
          <RestaurantListItem
            restaurant={restaurant}
            onToggleFavorite={async (id) =>
              await toggleFavoriteMutation({ id })
            }
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        </div>
      ))}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />

      {/* Loading indicator */}
      {isLoading && (
        <div className="py-4">
          <RestaurantListSkeleton count={2} />
        </div>
      )}

      {/* End of list indicator */}
      {status === 'Exhausted' && results.length > 0 && (
        <p className="text-center text-muted-foreground text-sm py-4">
          You've reached the end
        </p>
      )}
    </div>
  )
}
