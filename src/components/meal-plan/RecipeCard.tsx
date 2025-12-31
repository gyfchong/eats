import { useState } from 'react'
import { Check, Image as ImageIcon } from 'lucide-react'
import type { Doc } from '~convex/_generated/dataModel'
import { cn } from '~/lib/utils'

interface RecipeCardProps {
  recipe: Doc<'recipes'>
  isSelected: boolean
  onToggle: () => void
  index?: number
}

/**
 * Compact recipe card for grid selection.
 * Features subtle selection states and smooth hover transitions.
 */
export function RecipeCard({
  recipe,
  isSelected,
  onToggle,
  index = 0,
}: RecipeCardProps) {
  const [imageError, setImageError] = useState(false)
  const hasImage = recipe.imageUrl && !imageError

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      className={cn(
        'group relative flex flex-col rounded-xl overflow-hidden text-left',
        'transition-all duration-200 ease-out',
        'bg-card border animate-fade-up',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isSelected
          ? 'border-primary ring-1 ring-primary/20 shadow-md shadow-primary/10'
          : 'border-border/40 hover:border-border hover:shadow-sm',
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted/20">
        {hasImage ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name || 'Recipe'}
            loading="lazy"
            className={cn(
              'w-full h-full object-cover',
              'transition-transform duration-300 ease-out',
              'group-hover:scale-[1.03]',
            )}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/50">
            <ImageIcon className="w-6 h-6 text-muted-foreground/20" />
          </div>
        )}

        {/* Selection Overlay */}
        <div
          className={cn(
            'absolute inset-0 pointer-events-none',
            'transition-colors duration-200',
            isSelected
              ? 'bg-primary/25'
              : 'bg-transparent group-hover:bg-black/5',
          )}
        />

        {/* Selection Indicator */}
        <div
          className={cn(
            'absolute top-2 right-2 w-6 h-6 rounded-full',
            'flex items-center justify-center',
            'transition-all duration-200 ease-out',
            isSelected
              ? 'bg-primary text-primary-foreground scale-100 opacity-100'
              : 'bg-white/80 border border-border/50 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100',
          )}
        >
          <Check
            className={cn(
              'w-3.5 h-3.5 transition-opacity duration-150',
              isSelected ? 'opacity-100' : 'opacity-0',
            )}
            strokeWidth={2.5}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3 space-y-0.5">
        <h4 className="font-medium text-sm line-clamp-2 leading-snug">
          {recipe.name || 'Untitled'}
        </h4>
        {recipe.cuisine && (
          <p className="text-xs text-muted-foreground truncate">
            {recipe.cuisine}
          </p>
        )}
      </div>
    </button>
  )
}
