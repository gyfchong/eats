import { createFileRoute, Outlet } from '@tanstack/react-router'
import { mealPlanSearchSchema } from './wizard-utils'

export const Route = createFileRoute('/meal-plans/new/$wizardId')({
  component: NewMealPlanLayout,
  validateSearch: mealPlanSearchSchema,
})

function NewMealPlanLayout() {
  return (
    <div className="container mx-auto px-4 sm:px-8 py-6 sm:py-8 max-w-4xl">
      <Outlet />
    </div>
  )
}
