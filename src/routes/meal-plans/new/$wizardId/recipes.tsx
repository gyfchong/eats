import { Suspense, useState } from 'react'
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

export const Route = createFileRoute('/meal-plans/new/$wizardId/recipes')({
  component: RecipesStep,
})

function RecipesStep() {
  const navigate = useNavigate()
  const { wizardId } = parentRoute.useParams()
  const search = parentRoute.useSearch()
  const [validationError, setValidationError] = useState('')

  const { recipeIds } = search
  const selectedRecipeIds = parseRecipeIds(recipeIds)
  const nav = getStepNavigation('recipes')

  const updateSearch = (updates: Partial<MealPlanSearch>) => {
    navigate({
      to: '.',
      search: { ...search, ...updates },
      replace: true,
    })
  }

  const toggleRecipe = (recipeId: Id<'recipes'>) => {
    setValidationError('')
    const current = new Set(selectedRecipeIds)
    if (current.has(recipeId)) {
      current.delete(recipeId)
    } else {
      current.add(recipeId)
    }
    updateSearch({ recipeIds: Array.from(current).join(',') })
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
    setValidationError('')

    if (selectedRecipeIds.length === 0) {
      setValidationError('Please select at least one recipe')
      return
    }

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
      title="Choose Your Dishes"
      subtitle="Select the recipes you want to make this week"
      currentStep={nav.currentStep}
      totalSteps={nav.totalSteps}
      canGoBack={nav.canGoBack}
      canGoForward={nav.canGoForward}
      onBack={goBack}
      onNext={goNext}
      nextLabel={`Continue with ${selectedRecipeIds.length} recipe${selectedRecipeIds.length !== 1 ? 's' : ''}`}
    >
      <Suspense fallback={<RecipeSelectorSkeleton />}>
        <RecipeStepContent
          selectedIds={selectedRecipeIds}
          onToggleSelection={toggleRecipe}
          validationError={validationError}
        />
      </Suspense>
    </WizardStep>
  )
}

function RecipeStepContent({
  selectedIds,
  onToggleSelection,
  validationError,
}: {
  selectedIds: Id<'recipes'>[]
  onToggleSelection: (id: Id<'recipes'>) => void
  validationError?: string
}) {
  const { data: recommendations } = useSuspenseQuery(
    convexQuery(api.mealPlans.getTopMadeRecipes, {}),
  )

  return (
    <RecipeSelector
      mode="recipes"
      recommendations={recommendations}
      selectedIds={selectedIds}
      onToggleSelection={onToggleSelection}
      validationError={validationError}
    />
  )
}
