import { Suspense } from 'react'
import { createFileRoute, getRouteApi, useNavigate } from '@tanstack/react-router'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '~convex/_generated/api'
import type { Id } from '~convex/_generated/dataModel'
import { WizardStep } from '~/components/WizardStep'
import { RecipeSelector } from '~/components/meal-plan/RecipeSelector'
import { RecipeSelectorSkeleton } from '~/components/meal-plan/Skeletons'
import { getStepNavigation, STEP_PATHS, parseRecipeIds, type MealPlanSearch } from './wizard-utils'

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
  const nav = getStepNavigation('sides')

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
    if (nav.prevStep) {
      navigate({
        to: STEP_PATHS[nav.prevStep],
        params: { wizardId },
        search,
      })
    }
  }

  const goNext = () => {
    if (nav.nextStep) {
      navigate({
        to: STEP_PATHS[nav.nextStep],
        params: { wizardId },
        search,
      })
    }
  }

  return (
    <WizardStep
      title="Add Some Sides"
      subtitle="Optional: Pick some side dishes to complement your meals"
      currentStep={nav.currentStep}
      totalSteps={nav.totalSteps}
      canGoBack={nav.canGoBack}
      canGoForward={nav.canGoForward}
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
