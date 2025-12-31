import { MapPin } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Badge } from '~/components/ui/badge'
import {
  ListItemCard,
  ListItemHeader,
  ListItemActions,
} from '~/components/ui/list-item-card'
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
    <ListItemCard className="p-4 sm:p-6">
      <div className="space-y-3 sm:space-y-4">
        <ListItemHeader
          title={restaurant.name || restaurant.link}
          href={restaurant.link}
          isFavorite={restaurant.isFavorite}
          onToggleFavorite={() => onToggleFavorite(restaurant._id)}
          subtitle={
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
          }
        />

        {/* Meal Types */}
        {restaurant.mealTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {restaurant.mealTypes.map((type) => (
              <Badge
                key={type}
                variant="secondary"
                className="capitalize text-xs px-2 py-0.5"
              >
                {type}
              </Badge>
            ))}
          </div>
        )}

        <ListItemActions
          onEdit={() => onEdit(restaurant)}
          onDelete={() => onDelete(restaurant._id)}
        >
          {hasDishes && (
            <Link
              to="/restaurants/$restaurantId"
              params={{ restaurantId: restaurant._id }}
              className="text-sm text-primary hover:underline font-medium"
            >
              View Dishes
            </Link>
          )}
        </ListItemActions>
      </div>
    </ListItemCard>
  )
}
