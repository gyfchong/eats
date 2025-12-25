import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '~convex/_generated/api'
import { Button } from '~/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import type { Id } from '~convex/_generated/dataModel'

export const Route = createFileRoute('/recipes/$recipeId')({
  component: RecipeDetail,
})

function RecipeDetail() {
  const { recipeId } = useParams({ from: Route.fullPath })
  const { data: recipe } = useSuspenseQuery(
    convexQuery(api.recipes.get, { id: recipeId as Id<'recipes'> }),
  )

  if (!recipe) {
    return <div className="p-8">Recipe not found</div>
  }

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <Link to="/recipes">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="size-4 mr-2" />
          Back to Recipes
        </Button>
      </Link>

      <div className="bg-white border rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-4">
          {recipe.name || recipe.link}
        </h1>

        {recipe.cuisine && (
          <p className="text-lg text-gray-600 mb-4">{recipe.cuisine}</p>
        )}

        {recipe.ingredients.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-xl leading-none">•</span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recipe.notes && (
          <div>
            <h2 className="text-2xl font-semibold mb-3">Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{recipe.notes}</p>
          </div>
        )}

        <a
          href={recipe.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block"
        >
          <Button>Visit Recipe Page</Button>
        </a>
      </div>
    </div>
  )
}
