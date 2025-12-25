import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '~convex/_generated/api'
import type { Id } from '~convex/_generated/dataModel'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import { Label } from '~/components/ui/label'
import { RestaurantForm } from '~/components/RestaurantForm'
import { RestaurantListItem } from '~/components/RestaurantListItem'

export const Route = createFileRoute('/restaurants/')({
  component: RestaurantsList,
})

function RestaurantsList() {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState(null)

  const restaurants = useQuery(api.restaurants.list, { favoritesOnly: showFavoritesOnly })
  const toggleFavoriteMutation = useMutation(api.restaurants.toggleFavorite)
  const removeMutation = useMutation(api.restaurants.remove)

  const handleDelete = async (id: Id<'restaurants'>) => {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      await removeMutation({ id })
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Restaurants</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>Add Restaurant</Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Switch checked={showFavoritesOnly} onCheckedChange={setShowFavoritesOnly} />
        <Label>Show favorites only</Label>
      </div>

      {restaurants === undefined ? (
        <div className="text-center py-8">Loading restaurants...</div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No restaurants yet. Add one to get started!</div>
      ) : (
        <div className="space-y-4">
          {restaurants.map((restaurant) => (
            <RestaurantListItem
              key={restaurant._id}
              restaurant={restaurant}
              onToggleFavorite={async (id) => await toggleFavoriteMutation({ id })}
              onEdit={(restaurant) => setEditingRestaurant(restaurant)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <RestaurantForm
        restaurant={editingRestaurant}
        open={isAddModalOpen || !!editingRestaurant}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingRestaurant(null)
        }}
        onSaved={() => {
          setIsAddModalOpen(false)
          setEditingRestaurant(null)
        }}
      />
    </div>
  )
}
