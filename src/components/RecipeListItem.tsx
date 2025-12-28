import { Heart, ExternalLink, Edit, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import type { Doc, Id } from '~convex/_generated/dataModel'

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

  return (
    <div className="bg-card border border-border/50 rounded-xl p-4 sm:p-6 card-hover">
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
            {/* Cuisine - moved to header area on mobile */}
            {recipe.cuisine && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{recipe.cuisine}</p>
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

        {/* Actions - stacked on mobile */}
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
  )
}
