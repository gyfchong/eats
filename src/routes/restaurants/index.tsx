import { Suspense, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '~convex/_generated/api'
import type { Doc, Id } from '~convex/_generated/dataModel'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import { Label } from '~/components/ui/label'
import { RestaurantForm } from '~/components/RestaurantForm'
import { RestaurantListItem } from '~/components/RestaurantListItem'
import { RestaurantListSkeleton } from '~/components/RestaurantListItemSkeleton'

export const Route = createFileRoute('/restaurants/')({
  component: RestaurantsPage,
})

function RestaurantsPage() {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState<Doc<'restaurants'> | undefined>(undefined)

  return (
    <div className="container mx-auto px-4 sm:px-8 py-6 sm:py-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display">Restaurants</h1>
        <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
          Add Restaurant
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6 p-3 sm:p-0 bg-card sm:bg-transparent rounded-xl sm:rounded-none border sm:border-0 border-border/50">
        <Switch
          checked={showFavoritesOnly}
          onCheckedChange={setShowFavoritesOnly}
        />
        <Label className="text-sm sm:text-base">Show favorites only</Label>
      </div>

      <Suspense fallback={<RestaurantListSkeleton count={4} />}>
        <RestaurantsList
          showFavoritesOnly={showFavoritesOnly}
          onEdit={setEditingRestaurant}
        />
      </Suspense>

      <RestaurantForm
        restaurant={editingRestaurant}
        open={isAddModalOpen || !!editingRestaurant}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingRestaurant(undefined)
        }}
        onSaved={() => {
          setIsAddModalOpen(false)
          setEditingRestaurant(undefined)
        }}
      />
    </div>
  )
}

interface RestaurantsListProps {
  showFavoritesOnly: boolean
  onEdit: (restaurant: Doc<'restaurants'>) => void
}

function RestaurantsList({ showFavoritesOnly, onEdit }: RestaurantsListProps) {
  const { data: restaurants } = useSuspenseQuery(
    convexQuery(api.restaurants.list, {
      favoritesOnly: showFavoritesOnly,
    }),
  )

  const toggleFavoriteMutation = useConvexMutation(api.restaurants.toggleFavorite)
  const removeMutation = useConvexMutation(api.restaurants.remove)

  const handleDelete = async (id: Id<'restaurants'>) => {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      await removeMutation({ id })
    }
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 text-muted-foreground">
        <p className="text-lg">No restaurants yet</p>
        <p className="text-sm mt-1">Add one to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {restaurants.map((restaurant: Doc<'restaurants'>, index: number) => (
        <div key={restaurant._id} className="animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
          <RestaurantListItem
            restaurant={restaurant}
            onToggleFavorite={async (id) =>
              await toggleFavoriteMutation({ id })
            }
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        </div>
      ))}
    </div>
  )
}
