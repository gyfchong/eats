import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '~convex/_generated/api'
import type { Id } from '~convex/_generated/dataModel'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Badge } from '~/components/ui/badge'
import {
  Calendar,
  ChefHat,
  Salad,
  Check,
  ArrowLeft,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react'
import { cn } from '~/lib/utils'

export const Route = createFileRoute('/meal-plans/$planId')({
  component: MealPlanViewPage,
})

function MealPlanViewPage() {
  const { planId } = Route.useParams()
  const { data: plan } = useSuspenseQuery(
    convexQuery(api.mealPlans.get, { id: planId as Id<'mealPlans'> }),
  )

  const updateMutation = useConvexMutation(api.mealPlans.update)
  const markAsMadeMutation = useConvexMutation(api.mealPlans.markRecipeAsMade)
  const deleteMutation = useConvexMutation(api.mealPlans.remove)

  // Generate day options
  const dayOptions = Array.from({ length: plan.numDays }, (_, i) => {
    const date = new Date(plan.startDate)
    date.setDate(date.getDate() + i)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    const dayNum = date.getDate()
    return {
      value: i + 1,
      label: `Day ${i + 1} - ${dayName} ${dayNum}`,
    }
  })

  const handleDayChange = async (
    recipeId: Id<'recipes'>,
    newDay: number | undefined,
  ) => {
    const updatedRecipes = plan.recipes.map((r) =>
      r.recipeId === recipeId ? { ...r, assignedDay: newDay } : r,
    )
    await updateMutation({
      id: planId as Id<'mealPlans'>,
      recipes: updatedRecipes,
    })
  }

  const handleMarkAsMade = async (recipeId: Id<'recipes'>) => {
    await markAsMadeMutation({
      recipeId,
      mealPlanId: planId as Id<'mealPlans'>,
    })
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this meal plan?')) {
      await deleteMutation({ id: planId as Id<'mealPlans'> })
      window.location.href = '/meal-plans'
    }
  }

  // Format date range for display
  const startDate = new Date(plan.startDate)
  const endDate = new Date(plan.endDate)
  const dateRangeDisplay = `${startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} - ${endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`

  // Separate main dishes and sides
  const mainDishes = plan.recipesWithDetails.filter((r) => !r.isSide)
  const sides = plan.recipesWithDetails.filter((r) => r.isSide)

  // Group by assigned day for overview
  const recipesByDay = new Map<number | 'unassigned', typeof plan.recipesWithDetails>()
  recipesByDay.set('unassigned', [])
  for (let i = 1; i <= plan.numDays; i++) {
    recipesByDay.set(i, [])
  }
  for (const recipe of plan.recipesWithDetails) {
    const day = recipe.assignedDay ?? 'unassigned'
    recipesByDay.get(day)?.push(recipe)
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-6 sm:py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <Link
            to="/meal-plans"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            All Plans
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display">
                {dateRangeDisplay}
              </h1>
              <p className="text-muted-foreground">
                {plan.numDays} day meal plan
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Day Overview */}
      <section className="mb-8">
        <h2 className="font-semibold text-lg mb-4">Schedule Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {dayOptions.map((day) => {
            const recipes = recipesByDay.get(day.value) || []
            const date = new Date(plan.startDate)
            date.setDate(date.getDate() + day.value - 1)

            return (
              <div
                key={day.value}
                className={cn(
                  'p-3 rounded-lg border text-center',
                  recipes.length > 0
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border/50 bg-muted/30',
                )}
              >
                <p className="text-xs text-muted-foreground">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className="font-semibold text-lg">
                  {date.getDate()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {recipes.length} {recipes.length === 1 ? 'dish' : 'dishes'}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Main Dishes */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <ChefHat className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Main Dishes</h2>
          <Badge variant="secondary" className="ml-auto">
            {mainDishes.length}
          </Badge>
        </div>
        <div className="space-y-3">
          {mainDishes.map((item, index) => (
            <RecipeRow
              key={item.recipeId}
              recipe={item.recipe}
              assignedDay={item.assignedDay}
              dayOptions={dayOptions}
              onDayChange={(day) => handleDayChange(item.recipeId, day)}
              onMarkAsMade={() => handleMarkAsMade(item.recipeId)}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Sides */}
      {sides.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Salad className="w-5 h-5 text-accent-foreground" />
            <h2 className="font-semibold text-lg">Sides</h2>
            <Badge variant="secondary" className="ml-auto">
              {sides.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {sides.map((item, index) => (
              <RecipeRow
                key={item.recipeId}
                recipe={item.recipe}
                assignedDay={item.assignedDay}
                dayOptions={dayOptions}
                onDayChange={(day) => handleDayChange(item.recipeId, day)}
                onMarkAsMade={() => handleMarkAsMade(item.recipeId)}
                index={index}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

interface RecipeRowProps {
  recipe: {
    _id: Id<'recipes'>
    name?: string
    cuisine?: string
    imageUrl?: string
    link: string
  } | null
  assignedDay: number | undefined
  dayOptions: { value: number; label: string }[]
  onDayChange: (day: number | undefined) => void
  onMarkAsMade: () => void
  index: number
}

function RecipeRow({
  recipe,
  assignedDay,
  dayOptions,
  onDayChange,
  onMarkAsMade,
  index,
}: RecipeRowProps) {
  const [imageError, setImageError] = useState(false)
  const [justMarked, setJustMarked] = useState(false)

  if (!recipe) {
    return (
      <div className="p-4 bg-muted/30 rounded-xl text-muted-foreground">
        Recipe not found
      </div>
    )
  }

  const handleMarkAsMade = async () => {
    await onMarkAsMade()
    setJustMarked(true)
    setTimeout(() => setJustMarked(false), 2000)
  }

  return (
    <div
      className="flex items-center gap-4 p-3 bg-card border border-border/50 rounded-xl animate-fade-up"
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      {/* Image */}
      <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted/30">
        {recipe.imageUrl && !imageError ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name || 'Recipe'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <a
          href={recipe.link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:text-primary transition-colors line-clamp-1"
        >
          {recipe.name || 'Untitled Recipe'}
        </a>
        {recipe.cuisine && (
          <p className="text-sm text-muted-foreground">{recipe.cuisine}</p>
        )}
      </div>

      {/* Day Selector */}
      <Select
        value={assignedDay?.toString() ?? 'unassigned'}
        onValueChange={(v) =>
          onDayChange(v === 'unassigned' ? undefined : parseInt(v))
        }
      >
        <SelectTrigger className="w-[140px] sm:w-[180px]">
          <SelectValue placeholder="Assign day" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {dayOptions.map((day) => (
            <SelectItem key={day.value} value={day.value.toString()}>
              {day.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Mark as Made Button */}
      <Button
        size="sm"
        variant={justMarked ? 'default' : 'outline'}
        onClick={handleMarkAsMade}
        className={cn(
          'shrink-0 transition-all',
          justMarked && 'bg-green-600 hover:bg-green-600 border-green-600',
        )}
      >
        <Check className="w-4 h-4" />
        <span className="hidden sm:inline ml-1">
          {justMarked ? 'Made!' : 'Made'}
        </span>
      </Button>
    </div>
  )
}
