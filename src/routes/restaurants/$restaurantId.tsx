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
    return <div className="p-6 sm:p-8 text-muted-foreground">Restaurant not found</div>
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-6 sm:py-8 max-w-3xl animate-fade-up">
      <Link to="/restaurants">
        <Button variant="ghost" size="sm" className="mb-4 sm:mb-6 -ml-2">
          <ArrowLeft className="size-4 mr-1.5" />
          Back
        </Button>
      </Link>

      <div className="bg-card border border-border/50 rounded-2xl p-5 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-display mb-1">
          {restaurant.name || restaurant.link}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground font-medium mb-4">
          {restaurant.suburb}
        </p>

        {restaurant.cuisine && (
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">{restaurant.cuisine}</p>
        )}

        {restaurant.mealTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6">
            {restaurant.mealTypes.map((type: string) => (
              <Badge key={type} variant="secondary" className="capitalize text-xs px-2 py-0.5">
                {type}
              </Badge>
            ))}
          </div>
        )}

        {restaurant.dishes.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-display mb-4">Dishes</h2>
            <div className="space-y-0 divide-y divide-border/50">
              {restaurant.dishes.map((dish: { name: string; rating?: number }, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <span className="font-medium text-sm sm:text-base">{dish.name}</span>
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
          className="block sm:inline-block"
        >
          <Button className="w-full sm:w-auto">Visit Restaurant</Button>
        </a>
      </div>
    </div>
  )
}
