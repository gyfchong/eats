import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '~convex/_generated/api'
import type { Id } from '~convex/_generated/dataModel'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import { Label } from '~/components/ui/label'
import { RecipeForm } from '~/components/RecipeForm'
import { RecipeListItem } from '~/components/RecipeListItem'

export const Route = createFileRoute('/recipes/')({
  component: RecipesList,
})

function RecipesList() {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState(null)

  const recipes = useQuery(api.recipes.list, { favoritesOnly: showFavoritesOnly })
  const toggleFavoriteMutation = useMutation(api.recipes.toggleFavorite)
  const removeMutation = useMutation(api.recipes.remove)

  const handleDelete = async (id: Id<'recipes'>) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      await removeMutation({ id })
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Recipes</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>Add Recipe</Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Switch checked={showFavoritesOnly} onCheckedChange={setShowFavoritesOnly} />
        <Label>Show favorites only</Label>
      </div>

      {recipes === undefined ? (
        <div className="text-center py-8">Loading recipes...</div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No recipes yet. Add one to get started!</div>
      ) : (
        <div className="space-y-4">
          {recipes.map((recipe) => (
            <RecipeListItem
              key={recipe._id}
              recipe={recipe}
              onToggleFavorite={async (id) => await toggleFavoriteMutation({ id })}
              onEdit={(recipe) => setEditingRecipe(recipe)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <RecipeForm
        recipe={editingRecipe}
        open={isAddModalOpen || !!editingRecipe}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingRecipe(null)
        }}
        onSaved={() => {
          setIsAddModalOpen(false)
          setEditingRecipe(null)
        }}
      />
    </div>
  )
}
