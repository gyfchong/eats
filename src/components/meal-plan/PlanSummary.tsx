import { useState } from 'react'
import { Image as ImageIcon, ChefHat, Salad, Calendar, Loader2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import type { Doc } from '~convex/_generated/dataModel'

interface PlanSummaryProps {
  numDays: number
  dateRangeDisplay: string
  selectedRecipes: Doc<'recipes'>[]
  selectedSides: Doc<'recipes'>[]
  onCreatePlan: () => Promise<void>
  isCreating: boolean
}

export function PlanSummary({
  numDays,
  dateRangeDisplay,
  selectedRecipes,
  selectedSides,
  onCreatePlan,
  isCreating,
}: PlanSummaryProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Date Range Header */}
      <div className="text-center p-6 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent rounded-2xl">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-display text-2xl mb-1">{dateRangeDisplay}</h3>
        <p className="text-muted-foreground">
          {numDays} day{numDays !== 1 ? 's' : ''} of delicious meals planned
        </p>
      </div>

      {/* Main Recipes */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <ChefHat className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-lg">
            Main Dishes ({selectedRecipes.length})
          </h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {selectedRecipes.map((recipe, index) => (
            <SummaryCard key={recipe._id} recipe={recipe} index={index} />
          ))}
        </div>
      </section>

      {/* Side Dishes */}
      {selectedSides.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Salad className="w-5 h-5 text-accent-foreground" />
            <h4 className="font-semibold text-lg">
              Sides ({selectedSides.length})
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {selectedSides.map((recipe, index) => (
              <SummaryCard key={recipe._id} recipe={recipe} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Create Button */}
      <div className="pt-4">
        <Button
          onClick={onCreatePlan}
          disabled={isCreating || selectedRecipes.length === 0}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Creating your plan...
            </>
          ) : (
            'Create Meal Plan'
          )}
        </Button>
        {selectedRecipes.length === 0 && (
          <p className="text-center text-sm text-destructive mt-2">
            Please select at least one main dish
          </p>
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  recipe,
  index,
}: {
  recipe: Doc<'recipes'>
  index: number
}) {
  const [imageError, setImageError] = useState(false)

  return (
    <div
      className="flex items-center gap-3 p-2 bg-card border border-border/50 rounded-xl animate-fade-up"
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      {/* Thumbnail */}
      <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted/30">
        {recipe.imageUrl && !imageError ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name || 'Recipe'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {recipe.name || 'Untitled'}
        </p>
        {recipe.cuisine && (
          <p className="text-xs text-muted-foreground truncate">
            {recipe.cuisine}
          </p>
        )}
      </div>
    </div>
  )
}
