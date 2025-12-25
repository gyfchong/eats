import { Heart, ExternalLink, Edit, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
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
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 flex items-center gap-2">
            <a
              href={recipe.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-lg hover:underline"
            >
              {recipe.name || recipe.link}
            </a>
            <ExternalLink className="size-4 text-gray-400" />
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onToggleFavorite(recipe._id)}
          >
            <Heart
              className={`size-5 ${recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-300'}`}
            />
          </Button>
        </div>

        {/* Cuisine */}
        {recipe.cuisine && (
          <p className="text-sm text-gray-600">{recipe.cuisine}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {hasDetails && (
            <Link
              to={`/recipes/$recipeId`}
              params={{ recipeId: recipe._id }}
              className="text-sm text-blue-600 hover:underline"
            >
              View Details
            </Link>
          )}
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(recipe)}>
              <Edit className="size-4" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
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
