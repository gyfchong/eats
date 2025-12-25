import { Heart, ExternalLink, Edit, Trash2 } from 'lucide-react'
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
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 flex items-center gap-2">
            <a href={restaurant.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-lg hover:underline">
              {restaurant.name || restaurant.link}
            </a>
            <ExternalLink className="size-4 text-gray-400" />
          </div>
          <Button size="icon" variant="ghost" onClick={() => onToggleFavorite(restaurant._id)}>
            <Heart className={`size-5 ${restaurant.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-300'}`} />
          </Button>
        </div>

        {/* Suburb */}
        <p className="font-medium text-sm text-gray-700">{restaurant.suburb}</p>

        {/* Cuisine */}
        {restaurant.cuisine && <p className="text-sm text-gray-600">{restaurant.cuisine}</p>}

        {/* Meal Types */}
        {restaurant.mealTypes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {restaurant.mealTypes.map((type) => (
              <Badge key={type} variant="secondary" className="capitalize">
                {type}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {hasDishes && (
            <Link
              to={`/restaurants/$restaurantId`}
              params={{ restaurantId: restaurant._id }}
              className="text-sm text-blue-600 hover:underline"
            >
              View Details
            </Link>
          )}
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(restaurant)}>
              <Edit className="size-4" />
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(restaurant._id)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
