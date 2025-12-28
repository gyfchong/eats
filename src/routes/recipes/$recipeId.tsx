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
    return <div className="p-6 sm:p-8 text-muted-foreground">Recipe not found</div>
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-6 sm:py-8 max-w-3xl animate-fade-up">
      <Link to="/recipes">
        <Button variant="ghost" size="sm" className="mb-4 sm:mb-6 -ml-2">
          <ArrowLeft className="size-4 mr-1.5" />
          Back
        </Button>
      </Link>

      <div className="bg-card border border-border/50 rounded-2xl p-5 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-display mb-2">
          {recipe.name || recipe.link}
        </h1>

        {recipe.cuisine && (
          <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">{recipe.cuisine}</p>
        )}

        {recipe.ingredients.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-display mb-3 sm:mb-4">Ingredients</h2>
            <ul className="space-y-2 sm:space-y-3">
              {recipe.ingredients.map((ingredient: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-sm sm:text-base">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recipe.notes && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-display mb-3 sm:mb-4">Notes</h2>
            <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">{recipe.notes}</p>
          </div>
        )}

        <a
          href={recipe.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block sm:inline-block"
        >
          <Button className="w-full sm:w-auto">Visit Recipe Page</Button>
        </a>
      </div>
    </div>
  )
}
