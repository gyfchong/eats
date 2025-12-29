import { useState } from 'react'
import { createFileRoute, getRouteApi, useNavigate } from '@tanstack/react-router'
import { WizardStep } from '~/components/WizardStep'
import { DaySelector } from '~/components/meal-plan/DaySelector'
import {
  STEPS,
  calculateDateRange,
  type MealPlanSearch,
} from './wizard-utils'

const parentRoute = getRouteApi('/meal-plans/new/$wizardId')

export const Route = createFileRoute('/meal-plans/new/$wizardId/days')({
  component: DaysStep,
})

function DaysStep() {
  const navigate = useNavigate()
  const { wizardId } = parentRoute.useParams()
  const search = parentRoute.useSearch()
  const [validationError, setValidationError] = useState('')

  const { numDays, startDate } = search
  const dateRangeDisplay = calculateDateRange(startDate, numDays)

  const currentStepIndex = STEPS.indexOf('days')
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

  const handleNumDaysChange = (days: number) => {
    setValidationError('')
    updateSearch({ numDays: Math.max(1, Math.min(14, days)) })
  }

  const handleStartDateChange = (date: string) => {
    setValidationError('')
    updateSearch({ startDate: date })
  }

  const goBack = () => {
    // First step, can't go back
  }

  const goNext = () => {
    setValidationError('')

    if (!startDate) {
      setValidationError('Please select a start date')
      return
    }
    if (numDays < 1) {
      setValidationError('Please select at least 1 day')
      return
    }

    navigate({
      to: '/meal-plans/new/$wizardId/recipes',
      params: { wizardId },
      search,
    })
  }

  return (
    <WizardStep
      title="Plan Your Week"
      subtitle="How many days would you like to plan for?"
      currentStep={currentStepIndex}
      totalSteps={totalSteps}
      canGoBack={canGoBack}
      canGoForward={canGoForward}
      onBack={goBack}
      onNext={goNext}
    >
      <DaySelector
        numDays={numDays}
        startDate={startDate}
        dateRangeDisplay={dateRangeDisplay}
        onNumDaysChange={handleNumDaysChange}
        onStartDateChange={handleStartDateChange}
        validationError={validationError}
      />
    </WizardStep>
  )
}
