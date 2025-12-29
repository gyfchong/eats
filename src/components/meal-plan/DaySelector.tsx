import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'
import { Minus, Plus, Calendar } from 'lucide-react'

interface DaySelectorProps {
  numDays: number
  startDate: string
  dateRangeDisplay: string
  onNumDaysChange: (days: number) => void
  onStartDateChange: (date: string) => void
  validationError?: string
}

export function DaySelector({
  numDays,
  startDate,
  dateRangeDisplay,
  onNumDaysChange,
  onStartDateChange,
  validationError,
}: DaySelectorProps) {
  const handleIncrement = () => {
    if (numDays < 14) {
      onNumDaysChange(numDays + 1)
    }
  }

  const handleDecrement = () => {
    if (numDays > 1) {
      onNumDaysChange(numDays - 1)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-8">
      {/* Number of days selector */}
      <div className="space-y-3">
        <Label htmlFor="numDays" className="text-base font-medium">
          How many days are you planning for?
        </Label>
        <div className="flex items-center justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleDecrement}
            disabled={numDays <= 1}
            className="h-12 w-12 rounded-full"
          >
            <Minus className="h-5 w-5" />
          </Button>

          <div className="flex items-center justify-center w-24">
            <span className="text-5xl font-display tabular-nums">{numDays}</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleIncrement}
            disabled={numDays >= 14}
            className="h-12 w-12 rounded-full"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {numDays === 1 ? '1 day' : `${numDays} days`}
        </p>
      </div>

      {/* Start date picker */}
      <div className="space-y-3">
        <Label htmlFor="startDate" className="text-base font-medium">
          Starting from
        </Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="pl-10 text-center text-lg h-12"
          />
        </div>
      </div>

      {/* Date range preview */}
      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <p className="text-sm text-muted-foreground mb-1">Your meal plan will cover</p>
        <p className="text-xl font-medium">{dateRangeDisplay}</p>
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
          <p className="text-sm text-destructive font-medium">{validationError}</p>
        </div>
      )}
    </div>
  )
}
