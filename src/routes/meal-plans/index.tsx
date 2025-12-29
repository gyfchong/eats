import { Suspense } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '~convex/_generated/api'
import type { Doc, Id } from '~convex/_generated/dataModel'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'
import {
  Calendar,
  Plus,
  ChefHat,
  Salad,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import { cn } from '~/lib/utils'

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

      <Suspense fallback={<MealPlansListSkeleton />}>
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

interface MealPlanCardProps {
  plan: Doc<'mealPlans'>
  index: number
  onDelete: (e: React.MouseEvent) => void
}

function MealPlanCard({ plan, index, onDelete }: MealPlanCardProps) {
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

  const mainDishCount = plan.recipes.filter((r) => !r.isSide).length
  const sideCount = plan.recipes.filter((r) => r.isSide).length
  const assignedCount = plan.recipes.filter((r) => r.assignedDay).length
  const totalCount = plan.recipes.length

  // Determine if plan is in the past, current, or future
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const planStart = new Date(plan.startDate)
  planStart.setHours(0, 0, 0, 0)
  const planEnd = new Date(plan.endDate)
  planEnd.setHours(23, 59, 59, 999)

  const isPast = planEnd < today
  const isCurrent = planStart <= today && today <= planEnd

  return (
    <Link
      to="/meal-plans/$planId"
      params={{ planId: plan._id }}
      className={cn(
        'group flex items-center gap-4 p-4 sm:p-5 bg-card border rounded-xl transition-all animate-fade-up',
        'hover:border-primary/50 hover:shadow-md',
        isPast && 'opacity-60 hover:opacity-100',
        isCurrent && 'border-primary/50 ring-1 ring-primary/20',
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Calendar Icon */}
      <div
        className={cn(
          'shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center',
          isCurrent
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted/50 text-muted-foreground',
        )}
      >
        <span className="text-[10px] font-medium uppercase">
          {startDate.toLocaleDateString('en-US', { month: 'short' })}
        </span>
        <span className="text-lg font-bold leading-none">
          {startDate.getDate()}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-base sm:text-lg truncate">
            {dateRangeDisplay}
          </h3>
          {isCurrent && (
            <Badge variant="default" className="shrink-0">
              Active
            </Badge>
          )}
          {isPast && (
            <Badge variant="secondary" className="shrink-0">
              Past
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <ChefHat className="w-3.5 h-3.5" />
            {mainDishCount} {mainDishCount === 1 ? 'dish' : 'dishes'}
          </span>
          {sideCount > 0 && (
            <span className="flex items-center gap-1">
              <Salad className="w-3.5 h-3.5" />
              {sideCount} {sideCount === 1 ? 'side' : 'sides'}
            </span>
          )}
          <span className="text-xs">
            {assignedCount}/{totalCount} assigned
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
      </div>
    </Link>
  )
}

function MealPlansListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-5 bg-card border border-border/50 rounded-xl"
        >
          <Skeleton className="w-14 h-14 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="w-5 h-5 rounded" />
        </div>
      ))}
    </div>
  )
}
