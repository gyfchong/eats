import { useState } from 'react'
import { Image as ImageIcon, ChefHat, Play } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Badge } from '~/components/ui/badge'
import {
  ListItemCard,
  ListItemHeader,
  ListItemActions,
  ListItemImage,
  ListItemContent,
} from '~/components/ui/list-item-card'
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
  const PlaceholderIcon = getRecipePlaceholderIcon(recipe)

  return (
    <ListItemCard>
      <div className="flex">
        <ListItemImage
          src={!imageError ? recipe.imageUrl : undefined}
          alt={recipe.name || 'Recipe'}
          onError={() => setImageError(true)}
          fallback={<PlaceholderIcon className="size-8 text-muted-foreground/30" />}
        />

        <ListItemContent>
          <ListItemHeader
            title={recipe.name || recipe.link}
            href={recipe.link}
            isFavorite={recipe.isFavorite}
            onToggleFavorite={() => onToggleFavorite(recipe._id)}
            subtitle={
              <>
                {recipe.cuisine && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {recipe.cuisine}
                  </p>
                )}
                {recipe.description && (
                  <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1 hidden sm:block">
                    {recipe.description}
                  </p>
                )}
              </>
            }
          >
            {/* Tags */}
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
          </ListItemHeader>

          <ListItemActions
            onEdit={() => onEdit(recipe)}
            onDelete={() => onDelete(recipe._id)}
          >
            {hasDetails && (
              <Link
                to="/recipes/$recipeId"
                params={{ recipeId: recipe._id }}
                className="text-sm text-primary hover:underline font-medium"
              >
                View Details
              </Link>
            )}
          </ListItemActions>
        </ListItemContent>
      </div>
    </ListItemCard>
  )
}
