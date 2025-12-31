import { useState } from 'react'
import { Check, Image as ImageIcon } from 'lucide-react'
import type { Doc } from '~convex/_generated/dataModel'
import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'

type RecipeWithUsage = Doc<'recipes'> & { usageCount: number }

interface RecommendationCardProps {
  recipe: RecipeWithUsage
  isSelected: boolean
  onToggle: () => void
  index?: number
}

/**
 * Prominent recipe card for recommendations section.
 * Features larger imagery, usage badges, and elevated selection states.
 */
export function RecommendationCard({
  recipe,
  isSelected,
  onToggle,
  index = 0,
}: RecommendationCardProps) {
  const [imageError, setImageError] = useState(false)
  const hasImage = recipe.imageUrl && !imageError

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden text-left',
        'transition-all duration-300 ease-out',
        'bg-card border-2 animate-fade-up',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isSelected
          ? 'border-primary shadow-lg shadow-primary/15 scale-[1.02]'
          : 'border-transparent hover:border-border/60 hover:shadow-md',
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
        {hasImage ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name || 'Recipe'}
            loading="lazy"
            className={cn(
              'w-full h-full object-cover',
              'transition-transform duration-500 ease-out',
              'group-hover:scale-105',
              isSelected && 'scale-105',
            )}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/40">
            <ImageIcon className="w-8 h-8 text-muted-foreground/25" />
          </div>
        )}

        {/* Selection Overlay */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'transition-all duration-300',
            isSelected
              ? 'bg-primary/35 backdrop-blur-[1px]'
              : 'bg-transparent group-hover:bg-black/10',
          )}
        >
          {/* Central Check Indicator */}
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              'transition-all duration-300 ease-out',
              isSelected
                ? 'bg-primary text-primary-foreground scale-100'
                : 'bg-white/90 scale-0 group-hover:scale-100',
            )}
          >
            <Check
              className={cn(
                'w-5 h-5 transition-colors duration-150',
                isSelected ? 'text-primary-foreground' : 'text-muted-foreground',
              )}
              strokeWidth={2.5}
            />
          </div>
        </div>

        {/* Usage Badge */}
        {recipe.usageCount > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 bg-white/90 backdrop-blur-sm shadow-sm"
            >
              Made {recipe.usageCount}×
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
