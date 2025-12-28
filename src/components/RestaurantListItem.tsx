import { Heart, ExternalLink, Edit, Trash2, MapPin } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import type { Doc, Id } from '~convex/_generated/dataModel'

interface RestaurantListItemProps {
  restaurant: Doc<'restaurants'>
  onToggleFavorite: (id: Id<'restaurants'>) => void
  onEdit: (restaurant: Doc<'restaurants'>) => void
  onDelete: (id: Id<'restaurants'>) => void
}

export function RestaurantListItem({
  restaurant,
  onToggleFavorite,
  onEdit,
  onDelete,
}: RestaurantListItemProps) {
  const hasDishes = restaurant.dishes.length > 0

  return (
    <div className="bg-card border border-border/50 rounded-xl p-4 sm:p-6 card-hover">
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <a
              href={restaurant.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-base sm:text-lg hover:text-primary transition-colors inline-flex items-center gap-2 group"
            >
              <span className="truncate">{restaurant.name || restaurant.link}</span>
              <ExternalLink className="size-3.5 sm:size-4 text-muted-foreground group-hover:text-primary shrink-0" />
            </a>
            {/* Suburb with icon */}
            <p className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mt-1">
              <MapPin className="size-3 sm:size-3.5 shrink-0" />
              <span>{restaurant.suburb}</span>
              {restaurant.cuisine && (
                <>
                  <span className="mx-1">·</span>
                  <span>{restaurant.cuisine}</span>
                </>
              )}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0 -mr-2 -mt-1"
            onClick={() => onToggleFavorite(restaurant._id)}
          >
            <Heart
              className={`size-5 transition-colors ${restaurant.isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground/40 hover:text-red-400'}`}
            />
          </Button>
        </div>

        {/* Meal Types */}
        {restaurant.mealTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {restaurant.mealTypes.map((type) => (
              <Badge key={type} variant="secondary" className="capitalize text-xs px-2 py-0.5">
                {type}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions - stacked on mobile */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1 sm:pt-2">
          {hasDishes && (
            <Link
              to={`/restaurants/$restaurantId`}
              params={{ restaurantId: restaurant._id }}
              className="text-sm text-primary hover:underline font-medium"
            >
              View Dishes
            </Link>
          )}
          <div className="flex gap-2 sm:ml-auto">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 sm:flex-initial"
              onClick={() => onEdit(restaurant)}
            >
              <Edit className="size-4" />
              <span className="sm:inline">Edit</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(restaurant._id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
