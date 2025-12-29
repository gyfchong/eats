import { createFileRoute, redirect } from '@tanstack/react-router'

function generateWizardId(): string {
  return Math.random().toString(36).substring(2, 10)
}

export const Route = createFileRoute('/meal-plans/new/')({
  beforeLoad: () => {
    const wizardId = generateWizardId()
    throw redirect({
      to: '/meal-plans/new/$wizardId/days',
      params: { wizardId },
    })
  },
  component: () => null,
})
