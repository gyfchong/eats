import { Suspense } from 'react'
import { createFileRoute, getRouteApi, useNavigate } from '@tanstack/react-router'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '~convex/_generated/api'
import type { Id } from '~convex/_generated/dataModel'
import { WizardStep } from '~/components/WizardStep'
import { RecipeSelector } from '~/components/meal-plan/RecipeSelector'
import { RecipeSelectorSkeleton } from '~/components/meal-plan/Skeletons'
import { STEPS, parseRecipeIds, type MealPlanSearch } from './wizard-utils'

const parentRoute = getRouteApi('/meal-plans/new/$wizardId')

export const Route = createFileRoute('/meal-plans/new/$wizardId/sides')({
  component: SidesStep,
})

function SidesStep() {
  const navigate = useNavigate()
  const { wizardId } = parentRoute.useParams()
  const search = parentRoute.useSearch()

  const { sideIds } = search
  const selectedSideIds = parseRecipeIds(sideIds)

  const currentStepIndex = STEPS.indexOf('sides')
  const totalSteps = STEPS.length
  const canGoBack = currentStepIndex > 0
  const canGoForward = currentStepIndex < totalSteps - 1

  const updateSearch = (updates: Partial<MealPlanSearch>) => {
    navigate({
      to: '.',
      search: { ...search, ...updates },
      replace: true,
    })
  }

  const toggleSide = (sideId: Id<'recipes'>) => {
    const current = new Set(selectedSideIds)
    if (current.has(sideId)) {
      current.delete(sideId)
    } else {
      current.add(sideId)
    }
    updateSearch({ sideIds: Array.from(current).join(',') })
  }

  const goBack = () => {
    navigate({
      to: '/meal-plans/new/$wizardId/recipes',
      params: { wizardId },
      search,
    })
  }

  const goNext = () => {
    navigate({
      to: '/meal-plans/new/$wizardId/review',
      params: { wizardId },
      search,
    })
  }

  return (
    <WizardStep
      title="Add Some Sides"
      subtitle="Optional: Pick some side dishes to complement your meals"
      currentStep={currentStepIndex}
      totalSteps={totalSteps}
      canGoBack={canGoBack}
      canGoForward={canGoForward}
      onBack={goBack}
      onNext={goNext}
      nextLabel={
        selectedSideIds.length > 0
          ? `Continue with ${selectedSideIds.length} side${selectedSideIds.length !== 1 ? 's' : ''}`
          : 'Skip sides'
      }
    >
      <Suspense fallback={<RecipeSelectorSkeleton />}>
        <SidesStepContent
          selectedIds={selectedSideIds}
          onToggleSelection={toggleSide}
        />
      </Suspense>
    </WizardStep>
  )
}

function SidesStepContent({
  selectedIds,
  onToggleSelection,
}: {
  selectedIds: Id<'recipes'>[]
  onToggleSelection: (id: Id<'recipes'>) => void
}) {
  const { data: recommendations } = useSuspenseQuery(
    convexQuery(api.mealPlans.getRecommendedSides, {}),
  )

  return (
    <RecipeSelector
      mode="sides"
      recommendations={recommendations}
      selectedIds={selectedIds}
      onToggleSelection={onToggleSelection}
    />
  )
}
