import { Suspense } from 'react'
import { Sparkles, ChefHat } from 'lucide-react'
import type { Doc, Id } from '~convex/_generated/dataModel'
import { RecipeFilterBar, RecipeFilterBarSkeleton } from '~/components/RecipeFilterBar'
import { useListFilters, type ListFilters } from '~/hooks/useListFilters'
import { RecommendationCard } from './RecommendationCard'
import { RecipeGrid } from './RecipeGrid'

type RecipeWithUsage = Doc<'recipes'> & { usageCount: number }

interface RecipeSelectorProps {
  mode: 'recipes' | 'sides'
  recommendations: RecipeWithUsage[]
  selectedIds: Id<'recipes'>[]
  onToggleSelection: (id: Id<'recipes'>) => void
  validationError?: string
}

/**
 * Recipe selection interface for meal planning wizard.
 * Composes recommendations, filters, and browsable recipe grid.
 */
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
        <RecommendationsSection
          mode={mode}
          recommendations={recommendations}
          isSelected={isSelected}
          onToggleSelection={onToggleSelection}
        />
      )}

      {/* Section Divider */}
      <SectionDivider mode={mode} />

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

      {/* Validation Error */}
      {validationError && <ValidationError message={validationError} />}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Sub-components (internal to this file, focused on composition)
─────────────────────────────────────────────────────────────────────────────── */

interface RecommendationsSectionProps {
  mode: 'recipes' | 'sides'
  recommendations: RecipeWithUsage[]
  isSelected: (id: Id<'recipes'>) => boolean
  onToggleSelection: (id: Id<'recipes'>) => void
}

function RecommendationsSection({
  mode,
  recommendations,
  isSelected,
  onToggleSelection,
}: RecommendationsSectionProps) {
  return (
    <section className="relative">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 -mx-4 sm:-mx-8 bg-gradient-to-b from-accent/20 via-accent/10 to-transparent rounded-3xl -z-10" />

      <div className="py-6">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-display text-lg sm:text-xl">
            {mode === 'sides' ? 'Recommended Sides' : 'Your Favorites'}
          </h3>
        </div>

        {/* Recommendations Grid */}
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
  )
}

interface SectionDividerProps {
  mode: 'recipes' | 'sides'
}

function SectionDivider({ mode }: SectionDividerProps) {
  return (
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
  )
}

interface ValidationErrorProps {
  message: string
}

function ValidationError({ message }: ValidationErrorProps) {
  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center mt-8">
      <p className="text-sm text-destructive font-medium">{message}</p>
    </div>
  )
}
