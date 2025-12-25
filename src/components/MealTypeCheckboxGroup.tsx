import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'dessert', 'sides', 'snacks', 'drinks'] as const

type MealType = (typeof MEAL_TYPES)[number]

interface MealTypeCheckboxGroupProps {
  field: {
    state: {
      value: string[]
      meta: {
        isTouched: boolean
        errors: Array<string | { message: string } | undefined>
      }
    }
    handleChange: (value: string[]) => void
    handleBlur: () => void
  }
  label?: string
}

function ErrorMessages({ errors }: { errors: Array<string | { message: string } | undefined> }) {
  return (
    <>
      {errors.map((error) =>
        error ? (
          <div key={typeof error === 'string' ? error : error.message} className="text-red-500 mt-1 font-bold text-sm">
            {typeof error === 'string' ? error : error.message}
          </div>
        ) : null
      )}
    </>
  )
}

export function MealTypeCheckboxGroup({ field, label = 'Meal Types' }: MealTypeCheckboxGroupProps) {
  const errors = (field.state.meta.errors ?? []) as Array<string | { message: string } | undefined>
  const value = field.state.value || []

  const handleToggle = (mealType: MealType, checked: boolean) => {
    if (checked) {
      // Add meal type if not already present
      if (!value.includes(mealType)) {
        field.handleChange([...value, mealType])
      }
    } else {
      // Remove meal type
      field.handleChange(value.filter((v: string) => v !== mealType))
    }
  }

  const isChecked = (mealType: MealType) => {
    return value.includes(mealType)
  }

  return (
    <div className="space-y-3">
      <Label className="text-xl font-bold">{label}</Label>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {MEAL_TYPES.map((mealType) => (
          <div key={mealType} className="flex items-center space-x-2">
            <Checkbox
              id={`meal-type-${mealType}`}
              checked={isChecked(mealType)}
              onCheckedChange={(checked) => handleToggle(mealType, checked as boolean)}
              onBlur={field.handleBlur}
            />
            <Label htmlFor={`meal-type-${mealType}`} className="text-sm font-normal cursor-pointer capitalize">
              {mealType}
            </Label>
          </div>
        ))}
      </div>

      {field.state.meta.isTouched && errors.length > 0 && <ErrorMessages errors={errors} />}
    </div>
  )
}
