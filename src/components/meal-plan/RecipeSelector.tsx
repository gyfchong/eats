import { useState, Suspense } from 'react'
import { usePaginatedQuery } from 'convex/react'
import { Check, Image as ImageIcon, Sparkles, ChefHat } from 'lucide-react'
import { api } from '~convex/_generated/api'
import type { Doc, Id } from '~convex/_generated/dataModel'
import { RecipeFilterBar, RecipeFilterBarSkeleton } from '~/components/RecipeFilterBar'
import { useListFilters, type ListFilters } from '~/hooks/useListFilters'
import { useInfiniteScroll } from '~/hooks/useInfiniteScroll'
import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'

const ITEMS_PER_PAGE = 12

type RecipeWithUsage = Doc<'recipes'> & { usageCount: number }

interface RecipeSelectorProps {
  mode: 'recipes' | 'sides'
  recommendations: RecipeWithUsage[]
  selectedIds: Id<'recipes'>[]
  onToggleSelection: (id: Id<'recipes'>) => void
  validationError?: string
}

export function RecipeSelector({
  mode,
  recommendations,
  selectedIds,
  onToggleSelection,
  validationError,
}: RecipeSelectorProps) {
  const { filters, updateFilter, resetFilters, hasActiveFilters } =
    useListFilters<ListFilters>({
      favoritesOnly: false,
      cuisine: undefined,
      mealType: mode === 'sides' ? 'sides' : undefined,
      searchQuery: '',
    })

  const isSelected = (id: Id<'recipes'>) => selectedIds.includes(id)

  return (
    <div className="space-y-8">
      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <section className="relative">
          {/* Decorative background */}
          <div className="absolute inset-0 -mx-4 sm:-mx-8 bg-gradient-to-b from-accent/20 via-accent/10 to-transparent rounded-3xl -z-10" />

          <div className="py-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-display text-lg sm:text-xl">
                {mode === 'sides' ? 'Recommended Sides' : 'Your Favorites'}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {recommendations.map((recipe, index) => (
                <RecommendationCard
                  key={recipe._id}
                  recipe={recipe}
                  isSelected={isSelected(recipe._id)}
                  onToggle={() => onToggleSelection(recipe._id)}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-sm text-muted-foreground flex items-center gap-2">
            <ChefHat className="w-4 h-4" />
            {mode === 'sides' ? 'All Side Dishes' : 'All Recipes'}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <Suspense fallback={<RecipeFilterBarSkeleton />}>
        <RecipeFilterBar
          filters={filters}
          updateFilter={updateFilter}
          resetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
          lockedMealType={mode === 'sides' ? 'sides' : undefined}
        />
      </Suspense>

      {/* Recipe Grid */}
      <RecipeGrid
        mode={mode}
        filters={filters}
        selectedIds={selectedIds}
        onToggleSelection={onToggleSelection}
      />

      {/* Validation error */}
      {validationError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center mt-8">
          <p className="text-sm text-destructive font-medium">
            {validationError}
          </p>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   RECOMMENDATION CARD
   Larger, more prominent cards for the recommendations section
─────────────────────────────────────────────────────────────────────────────── */

function RecommendationCard({
  recipe,
  isSelected,
  onToggle,
  index,
}: {
  recipe: RecipeWithUsage
  isSelected: boolean
  onToggle: () => void
  index: number
}) {
  const [imageError, setImageError] = useState(false)

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 text-left',
        'bg-card border-2 animate-fade-up',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isSelected
          ? 'border-primary shadow-lg shadow-primary/20 scale-[1.02]'
          : 'border-transparent hover:border-border hover:shadow-md',
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
        {recipe.imageUrl && !imageError ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name || 'Recipe'}
            className={cn(
              'w-full h-full object-cover transition-transform duration-500',
              'group-hover:scale-105',
              isSelected && 'scale-105',
            )}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}

        {/* Selection Overlay */}
        <div
          className={cn(
            'absolute inset-0 transition-all duration-300 flex items-center justify-center',
            isSelected
              ? 'bg-primary/40 backdrop-blur-[1px]'
              : 'bg-black/0 group-hover:bg-black/10',
          )}
        >
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
              isSelected
                ? 'bg-primary text-primary-foreground scale-100'
                : 'bg-white/90 text-transparent scale-0 group-hover:scale-100 group-hover:text-muted-foreground',
            )}
          >
            <Check className="w-5 h-5" strokeWidth={3} />
          </div>
        </div>

        {/* Usage badge */}
        {recipe.usageCount > 0 && (
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 bg-white/90 backdrop-blur-sm"
            >
              Made {recipe.usageCount}x
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-1">
        <h4 className="font-semibold text-sm line-clamp-2 leading-tight">
          {recipe.name || 'Untitled Recipe'}
        </h4>
        {recipe.cuisine && (
          <p className="text-xs text-muted-foreground">{recipe.cuisine}</p>
        )}
      </div>
    </button>
  )
}


/* ─────────────────────────────────────────────────────────────────────────────
   RECIPE GRID (main list with infinite scroll)
─────────────────────────────────────────────────────────────────────────────── */

function RecipeGrid({
  mode,
  filters,
  selectedIds,
  onToggleSelection,
}: {
  mode: 'recipes' | 'sides'
  filters: ListFilters
  selectedIds: Id<'recipes'>[]
  onToggleSelection: (id: Id<'recipes'>) => void
}) {
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

  if (status === 'LoadingFirstPage') {
    return <RecipeGridSkeleton />
  }

  if (results.length === 0) {
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

  return (
    <div className="space-y-4">
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
      <div ref={sentinelRef} className="h-1" />

      {/* Loading more indicator */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* End indicator */}
      {status === 'Exhausted' && results.length > 0 && (
        <p className="text-center text-muted-foreground text-sm py-4">
          That's all of them
        </p>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   RECIPE CARD (compact version for grid)
─────────────────────────────────────────────────────────────────────────────── */

function RecipeCard({
  recipe,
  isSelected,
  onToggle,
  index,
}: {
  recipe: Doc<'recipes'>
  isSelected: boolean
  onToggle: () => void
  index: number
}) {
  const [imageError, setImageError] = useState(false)

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'group relative flex flex-col rounded-xl overflow-hidden transition-all duration-200 text-left',
        'bg-card border animate-fade-up',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isSelected
          ? 'border-primary ring-1 ring-primary/30 shadow-md'
          : 'border-border/50 hover:border-border hover:shadow-sm',
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 0.03}s` }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted/20">
        {recipe.imageUrl && !imageError ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name || 'Recipe'}
            className={cn(
              'w-full h-full object-cover transition-transform duration-300',
              'group-hover:scale-105',
            )}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-muted-foreground/20" />
          </div>
        )}

        {/* Selection indicator */}
        <div
          className={cn(
            'absolute inset-0 transition-all duration-200',
            isSelected
              ? 'bg-primary/30'
              : 'bg-transparent group-hover:bg-black/5',
          )}
        />

        {/* Checkmark */}
        <div
          className={cn(
            'absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200',
            isSelected
              ? 'bg-primary text-primary-foreground scale-100'
              : 'bg-white/80 border border-border/50 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100',
          )}
        >
          <Check
            className={cn('w-3.5 h-3.5', !isSelected && 'opacity-0')}
            strokeWidth={3}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3">
        <h4 className="font-medium text-sm line-clamp-2 leading-snug">
          {recipe.name || 'Untitled'}
        </h4>
        {recipe.cuisine && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {recipe.cuisine}
          </p>
        )}
      </div>
    </button>
  )
}

function RecipeCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border/50 animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </div>
  )
}

function RecipeGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  )
}
