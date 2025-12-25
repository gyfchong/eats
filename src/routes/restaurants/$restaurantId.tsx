import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '~convex/_generated/api'
import type { Id } from '~convex/_generated/dataModel'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { StarRating } from '~/components/StarRating'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/restaurants/$restaurantId')({
  component: RestaurantDetail,
})

function RestaurantDetail() {
  const { restaurantId } = useParams({ from: Route.fullPath })
  const { data: restaurant } = useSuspenseQuery(
    convexQuery(api.restaurants.get, { id: restaurantId as Id<'restaurants'> }),
  )

  if (!restaurant) {
    return <div className="p-8">Restaurant not found</div>
  }

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <Link to="/restaurants">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="size-4 mr-2" />
          Back to Restaurants
        </Button>
      </Link>

      <div className="bg-white border rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">
          {restaurant.name || restaurant.link}
        </h1>
        <p className="text-xl text-gray-700 font-semibold mb-4">
          {restaurant.suburb}
        </p>

        {restaurant.cuisine && (
          <p className="text-lg text-gray-600 mb-4">{restaurant.cuisine}</p>
        )}

        {restaurant.mealTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {restaurant.mealTypes.map((type) => (
              <Badge key={type} variant="secondary" className="capitalize">
                {type}
              </Badge>
            ))}
          </div>
        )}

        {restaurant.dishes.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Dishes</h2>
            <div className="space-y-3">
              {restaurant.dishes.map((dish, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <span className="font-medium">{dish.name}</span>
                  {dish.rating && <StarRating value={dish.rating} size="sm" />}
                </div>
              ))}
            </div>
          </div>
        )}

        <a
          href={restaurant.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block"
        >
          <Button>Visit Restaurant</Button>
        </a>
      </div>
    </div>
  )
}
