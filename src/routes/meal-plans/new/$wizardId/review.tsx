import { Suspense, useState } from 'react'
import { createFileRoute, getRouteApi, useNavigate } from '@tanstack/react-router'
import { convexQuery } from '@convex-dev/react-query'
import { useConvexMutation } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '~convex/_generated/api'
import type { Id } from '~convex/_generated/dataModel'
import { WizardStep } from '~/components/WizardStep'
import { PlanSummary } from '~/components/meal-plan/PlanSummary'
import { PlanSummarySkeleton } from '~/components/meal-plan/Skeletons'
import {
  getStepNavigation,
  STEP_PATHS,
  parseRecipeIds,
  calculateDateRange,
  calculateEndDate,
} from './wizard-utils'

const parentRoute = getRouteApi('/meal-plans/new/$wizardId')

export const Route = createFileRoute('/meal-plans/new/$wizardId/review')({
  component: ReviewStep,
})

function ReviewStep() {
  const navigate = useNavigate()
  const { wizardId } = parentRoute.useParams()
  const search = parentRoute.useSearch()
  const createMutation = useConvexMutation(api.mealPlans.create)
  const [isCreating, setIsCreating] = useState(false)

  const { numDays, startDate, recipeIds, sideIds } = search
  const selectedRecipeIds = parseRecipeIds(recipeIds)
  const selectedSideIds = parseRecipeIds(sideIds)
  const dateRangeDisplay = calculateDateRange(startDate, numDays)
  const nav = getStepNavigation('review')

  const goBack = () => {
    if (nav.prevStep) {
      navigate({
        to: STEP_PATHS[nav.prevStep],
        params: { wizardId },
        search,
      })
    }
  }

  const handleCreatePlan = async () => {
    if (!startDate) return

    setIsCreating(true)
    try {
      const recipeIdArray = recipeIds?.split(',').filter(Boolean) || []
      const sideIdArray = sideIds?.split(',').filter(Boolean) || []

      const planId = await createMutation({
        startDate,
        endDate: calculateEndDate(startDate, numDays),
        numDays,
        recipes: [
          ...recipeIdArray.map((id) => ({
            recipeId: id as Id<'recipes'>,
            assignedDay: undefined,
            isSide: false,
          })),
          ...sideIdArray.map((id) => ({
            recipeId: id as Id<'recipes'>,
            assignedDay: undefined,
            isSide: true,
          })),
        ],
      })

      navigate({ to: '/meal-plans/$planId', params: { planId } })
    } catch (error) {
      console.error('Failed to create meal plan:', error)
      setIsCreating(false)
    }
  }

  return (
    <WizardStep
      title="Review Your Plan"
      subtitle="Everything look good? Let's create your meal plan!"
      currentStep={nav.currentStep}
      totalSteps={nav.totalSteps}
      canGoBack={nav.canGoBack}
      canGoForward={false}
      onBack={goBack}
      onNext={() => {}}
      hideNavigation
    >
      <Suspense fallback={<PlanSummarySkeleton />}>
        <ReviewStepContent
          recipeIds={selectedRecipeIds}
          sideIds={selectedSideIds}
          numDays={numDays}
          dateRangeDisplay={dateRangeDisplay}
          onCreatePlan={handleCreatePlan}
          isCreating={isCreating}
        />
      </Suspense>
    </WizardStep>
  )
}

function ReviewStepContent({
  recipeIds,
  sideIds,
  numDays,
  dateRangeDisplay,
  onCreatePlan,
  isCreating,
}: {
  recipeIds: Id<'recipes'>[]
  sideIds: Id<'recipes'>[]
  numDays: number
  dateRangeDisplay: string
  onCreatePlan: () => Promise<void>
  isCreating: boolean
}) {
  const { data: allRecipes } = useSuspenseQuery(
    convexQuery(api.recipes.list, {}),
  )

  const selectedRecipes = allRecipes.filter((r) => recipeIds.includes(r._id))
  const selectedSides = allRecipes.filter((r) => sideIds.includes(r._id))

  return (
    <PlanSummary
      numDays={numDays}
      dateRangeDisplay={dateRangeDisplay}
      selectedRecipes={selectedRecipes}
      selectedSides={selectedSides}
      onCreatePlan={onCreatePlan}
      isCreating={isCreating}
    />
  )
}
