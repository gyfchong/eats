import { Suspense, useState, useDeferredValue } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { usePaginatedQuery } from 'convex/react'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '~convex/_generated/api'
import type { Doc, Id } from '~convex/_generated/dataModel'
import { Button } from '~/components/ui/button'
import { RecipeForm } from '~/components/RecipeForm'
import { RecipeListItem } from '~/components/RecipeListItem'
import { RecipeListSkeleton } from '~/components/RecipeListItemSkeleton'
import { RecipeFilterBar, RecipeFilterBarSkeleton } from '~/components/RecipeFilterBar'
import { useListFilters, type ListFilters } from '~/hooks/useListFilters'
import { useInfiniteScroll } from '~/hooks/useInfiniteScroll'

const ITEMS_PER_PAGE = 10

export const Route = createFileRoute('/recipes/')({
  component: RecipesPage,
})

function RecipesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<
    Doc<'recipes'> | undefined
  >(undefined)

  const { filters, updateFilter, resetFilters, hasActiveFilters } =
    useListFilters<ListFilters>({
      favoritesOnly: false,
      cuisine: undefined,
      mealType: undefined,
      searchQuery: '',
    })

  // Debounce search query
  const deferredSearchQuery = useDeferredValue(filters.searchQuery)

  return (
    <div className="container mx-auto px-4 sm:px-8 py-6 sm:py-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display">Recipes</h1>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto"
        >
          Add Recipe
        </Button>
      </div>

      <Suspense fallback={<RecipeFilterBarSkeleton />}>
        <RecipeFilterBar
          filters={filters}
          updateFilter={updateFilter}
          resetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </Suspense>

      <RecipesList
        filters={{ ...filters, searchQuery: deferredSearchQuery }}
        onEdit={setEditingRecipe}
      />

      <RecipeForm
        recipe={editingRecipe}
        open={isAddModalOpen || !!editingRecipe}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingRecipe(undefined)
        }}
        onSaved={() => {
          setIsAddModalOpen(false)
          setEditingRecipe(undefined)
        }}
      />
    </div>
  )
}


interface RecipesListProps {
  filters: ListFilters
  onEdit: (recipe: Doc<'recipes'>) => void
}

function RecipesList({ filters, onEdit }: RecipesListProps) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.recipes.listPaginated,
    {
      favoritesOnly: filters.favoritesOnly || undefined,
      cuisine: filters.cuisine,
      mealType: filters.mealType,
      searchQuery: filters.searchQuery || undefined,
    },
    { initialNumItems: ITEMS_PER_PAGE },
  )

  const toggleFavoriteMutation = useConvexMutation(api.recipes.toggleFavorite)
  const removeMutation = useConvexMutation(api.recipes.remove)

  const isLoading = status === 'LoadingMore'
  const hasMore = status === 'CanLoadMore'

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: () => loadMore(ITEMS_PER_PAGE),
  })

  const handleDelete = async (id: Id<'recipes'>) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      await removeMutation({ id })
    }
  }

  if (status === 'LoadingFirstPage') {
    return <RecipeListSkeleton count={4} />
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 text-muted-foreground">
        <p className="text-lg">No recipes found</p>
        <p className="text-sm mt-1">
          Try adjusting your filters or add a new recipe!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {results.map((recipe, index) => (
        <div
          key={recipe._id}
          className="animate-fade-up"
          style={{ animationDelay: `${Math.min(index, 4) * 0.05}s` }}
        >
          <RecipeListItem
            recipe={recipe}
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
          <RecipeListSkeleton count={2} />
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

