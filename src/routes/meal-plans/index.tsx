import { Suspense } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '~convex/_generated/api'
import type { Id } from '~convex/_generated/dataModel'
import { Button } from '~/components/ui/button'
import { MealPlanCard, MealPlanCardSkeleton } from '~/components/MealPlanCard'
import { Calendar, Plus } from 'lucide-react'

export const Route = createFileRoute('/meal-plans/')({
  component: MealPlansPage,
})

function MealPlansPage() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-6 sm:py-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display">Meal Plans</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/meal-plans/new">
            <Plus className="w-4 h-4 mr-2" />
            New Meal Plan
          </Link>
        </Button>
      </div>

      <Suspense fallback={<MealPlanCardSkeleton />}>
        <MealPlansList />
      </Suspense>
    </div>
  )
}

function MealPlansList() {
  const { data: plans } = useSuspenseQuery(
    convexQuery(api.mealPlans.listAll, {}),
  )
  const deleteMutation = useConvexMutation(api.mealPlans.remove)

  const handleDelete = async (id: Id<'mealPlans'>, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this meal plan?')) {
      await deleteMutation({ id })
    }
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
          <Calendar className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-xl font-display mb-2">No meal plans yet</h2>
        <p className="text-muted-foreground mb-6">
          Create your first meal plan to get started!
        </p>
        <Button asChild>
          <Link to="/meal-plans/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Plan
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {plans.map((plan, index) => (
        <MealPlanCard
          key={plan._id}
          plan={plan}
          index={index}
          onDelete={(e) => handleDelete(plan._id, e)}
        />
      ))}
    </div>
  )
}
