import type { ReactNode } from 'react'
import { Button } from '~/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WizardStepProps {
  title: string
  subtitle?: string
  children: ReactNode
  currentStep: number
  totalSteps: number
  canGoBack: boolean
  canGoForward: boolean
  onBack: () => void
  onNext: () => void
  nextLabel?: string
  hideNavigation?: boolean
}

export function WizardStep({
  title,
  subtitle,
  children,
  currentStep,
  totalSteps,
  canGoBack,
  canGoForward,
  onBack,
  onNext,
  nextLabel = 'Continue',
  hideNavigation = false,
}: WizardStepProps) {
  return (
    <div className={`grid h-[calc(100vh-8rem)] ${hideNavigation ? 'grid-rows-[auto_auto_1fr]' : 'grid-rows-[auto_auto_1fr_auto]'}`}>
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 px-4 py-6">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentStep
                ? 'w-8 bg-primary'
                : index < currentStep
                  ? 'w-2 bg-primary/60'
                  : 'w-2 bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Header */}
      <div className="text-center px-4 pb-8">
        <h2 className="text-2xl sm:text-3xl font-display mb-2">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground text-sm sm:text-base">{subtitle}</p>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto px-4 pr-4">{children}</div>

      {/* Sticky Navigation */}
      {!hideNavigation && (
        <div className="sticky bottom-0 left-0 right-0 flex justify-between items-center px-4 py-4 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={!canGoBack}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={onNext}
            disabled={!canGoForward}
            className="gap-1"
          >
            {nextLabel}
            {canGoForward && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  )
}
