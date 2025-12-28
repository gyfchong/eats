import { createFileRoute, Link } from '@tanstack/react-router'
import { ChefHat, Utensils } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 sm:gap-10 p-6 sm:p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="text-center animate-fade-up">
        <h1 className="text-5xl sm:text-7xl font-display tracking-tight">Eats.</h1>
        <p className="mt-2 text-muted-foreground text-sm sm:text-base">Your culinary companion</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 w-full max-w-md sm:max-w-lg">
        <Link
          to="/recipes"
          className="group aspect-square flex flex-col items-center justify-center gap-3 sm:gap-4 bg-card border border-border/50 rounded-2xl sm:rounded-3xl shadow-sm card-hover animate-fade-up stagger-1"
        >
          <div className="p-3 sm:p-4 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
            <ChefHat className="size-8 sm:size-12" />
          </div>
          <span className="text-lg sm:text-2xl font-display">Recipes</span>
        </Link>

        <Link
          to="/restaurants"
          className="group aspect-square flex flex-col items-center justify-center gap-3 sm:gap-4 bg-card border border-border/50 rounded-2xl sm:rounded-3xl shadow-sm card-hover animate-fade-up stagger-2"
        >
          <div className="p-3 sm:p-4 rounded-xl bg-accent/30 text-accent-foreground group-hover:bg-accent-foreground group-hover:text-accent transition-colors duration-200">
            <Utensils className="size-8 sm:size-12" />
          </div>
          <span className="text-lg sm:text-2xl font-display">Restaurants</span>
        </Link>
      </div>
    </div>
  )
}
