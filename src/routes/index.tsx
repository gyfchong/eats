import { createFileRoute, Link } from '@tanstack/react-router'
import { ChefHat, Utensils } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-6xl font-bold">Eats.</h1>

      <div className="flex gap-6">
        <Link
          to="/recipes"
          className="w-64 h-64 flex flex-col items-center justify-center gap-4 text-3xl font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-2xl transition-colors shadow-lg"
        >
          <ChefHat className="size-16" />
          Recipes
        </Link>

        <Link
          to="/restaurants"
          className="w-64 h-64 flex flex-col items-center justify-center gap-4 text-3xl font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-2xl transition-colors shadow-lg"
        >
          <Utensils className="size-16" />
          Restaurants
        </Link>
      </div>
    </div>
  )
}
