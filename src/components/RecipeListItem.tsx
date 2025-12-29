import { useState } from 'react'
import {
  Heart,
  ExternalLink,
  Edit,
  Trash2,
  Image as ImageIcon,
  ChefHat,
  Play,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import type { Doc, Id } from '~convex/_generated/dataModel'

// Tag configuration with labels and colors
const TAG_CONFIG: Record<
  string,
  { label: string; icon: typeof ChefHat; className: string }
> = {
  home: {
    label: 'Family Recipe',
    icon: ChefHat,
    className:
      'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40',
  },
  video: {
    label: 'Video',
    icon: Play,
    className:
      'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/40',
  },
}

/**
 * Determine which placeholder icon to show based on recipe source
 */
function getRecipePlaceholderIcon(recipe: Doc<'recipes'>) {
  if (!recipe.link) return ChefHat
  if (recipe.link.includes('youtube.com') || recipe.link.includes('youtu.be')) {
    return Play
  }
  return ImageIcon
}

interface RecipeListItemProps {
  recipe: Doc<'recipes'>
  onToggleFavorite: (id: Id<'recipes'>) => void
  onEdit: (recipe: Doc<'recipes'>) => void
  onDelete: (id: Id<'recipes'>) => void
}

export function RecipeListItem({
  recipe,
  onToggleFavorite,
  onEdit,
  onDelete,
}: RecipeListItemProps) {
  const hasDetails = recipe.ingredients.length > 0 || !!recipe.notes
  const [imageError, setImageError] = useState(false)

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden card-hover">
      <div className="flex">
        {/* Image Section */}
        {recipe.imageUrl && !imageError ? (
          <div className="shrink-0 w-24 sm:w-36">
            <img
              src={recipe.imageUrl}
              alt={recipe.name || 'Recipe'}
              className="w-full h-full object-cover aspect-square"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="shrink-0 w-24 sm:w-36 bg-muted/30 flex items-center justify-center aspect-square">
            {(() => {
              const PlaceholderIcon = getRecipePlaceholderIcon(recipe)
              return (
                <PlaceholderIcon className="size-8 text-muted-foreground/30" />
              )
            })()}
          </div>
        )}

        {/* Content Section */}
        <div className="flex-1 p-4 sm:p-6 min-w-0">
          <div className="space-y-3 sm:space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <a
                  href={recipe.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-base sm:text-lg hover:text-primary transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="truncate">{recipe.name || recipe.link}</span>
                  <ExternalLink className="size-3.5 sm:size-4 text-muted-foreground group-hover:text-primary shrink-0" />
                </a>
                {recipe.cuisine && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{recipe.cuisine}</p>
                )}
                {recipe.description && (
                  <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1 hidden sm:block">
                    {recipe.description}
                  </p>
                )}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {recipe.tags.map((tag) => {
                      const config = TAG_CONFIG[tag]
                      if (!config) return null
                      const TagIcon = config.icon
                      return (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={`text-[10px] sm:text-xs py-0.5 ${config.className}`}
                        >
                          <TagIcon className="size-3" />
                          {config.label}
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 -mr-2 -mt-1"
                onClick={() => onToggleFavorite(recipe._id)}
              >
                <Heart
                  className={`size-5 transition-colors ${recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground/40 hover:text-red-400'}`}
                />
              </Button>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1 sm:pt-2">
              {hasDetails && (
                <Link
                  to={`/recipes/$recipeId`}
                  params={{ recipeId: recipe._id }}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  View Details
                </Link>
              )}
              <div className="flex gap-2 sm:ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-initial"
                  onClick={() => onEdit(recipe)}
                >
                  <Edit className="size-4" />
                  <span className="sm:inline">Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(recipe._id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
