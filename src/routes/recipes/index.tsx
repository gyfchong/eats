import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '~convex/_generated/api'
import type { Doc, Id } from '~convex/_generated/dataModel'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import { Label } from '~/components/ui/label'
import { RecipeForm } from '~/components/RecipeForm'
import { RecipeListItem } from '~/components/RecipeListItem'
import { useSuspenseQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/recipes/')({
  component: RecipesList,
})

function RecipesList() {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Doc<'recipes'> | undefined>(undefined)

  const { data: recipes } = useSuspenseQuery(
    convexQuery(api.recipes.list, {
      favoritesOnly: showFavoritesOnly,
    }),
  )

  const toggleFavoriteMutation = useConvexMutation(api.recipes.toggleFavorite)
  const removeMutation = useConvexMutation(api.recipes.remove)

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
        <Switch
          checked={showFavoritesOnly}
          onCheckedChange={setShowFavoritesOnly}
        />
        <Label>Show favorites only</Label>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No recipes yet. Add one to get started!
        </div>
      ) : (
        <div className="space-y-4">
          {recipes.map((recipe: Doc<'recipes'>) => (
            <RecipeListItem
              key={recipe._id}
              recipe={recipe}
              onToggleFavorite={async (id) =>
                await toggleFavoriteMutation({ id })
              }
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
          setEditingRecipe(undefined)
        }}
        onSaved={() => {
          setIsAddModalOpen(false)
          setEditingRecipe(undefined)
        }}
      />
    </div>
  )
}
