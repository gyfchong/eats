import { useState } from 'react'
import { createFileRoute, getRouteApi, useNavigate } from '@tanstack/react-router'
import { WizardStep } from '~/components/WizardStep'
import { DaySelector } from '~/components/meal-plan/DaySelector'
import {
  getStepNavigation,
  STEP_PATHS,
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
  const nav = getStepNavigation('days')

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
      title="Plan Your Week"
      subtitle="How many days would you like to plan for?"
      currentStep={nav.currentStep}
      totalSteps={nav.totalSteps}
      canGoBack={nav.canGoBack}
      canGoForward={nav.canGoForward}
      onBack={() => {}}
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
