import { Plus, X } from 'lucide-react'
import type { Doc } from '~convex/_generated/dataModel'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { StarRating } from '~/components/StarRating'

type Dish = Doc<'restaurants'>['dishes'][number]

interface DynamicDishListProps {
  field: {
    state: {
      value: Dish[]
      meta: {
        isTouched: boolean
        errors: Array<string | { toString(): string } | undefined>
      }
    }
    handleChange: (value: Dish[]) => void
    handleBlur: () => void
  }
  label?: string
}

export function DynamicDishList({ field, label = 'Dishes' }: DynamicDishListProps) {
  const items = field.state.value || []

  const addItem = () => {
    field.handleChange([...items, { name: '', rating: undefined }])
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_: Dish, i: number) => i !== index)
    field.handleChange(newItems)
  }

  const updateName = (index: number, name: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], name }
    field.handleChange(newItems)
  }

  const updateRating = (index: number, rating: number | undefined) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], rating }
    field.handleChange(newItems)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base sm:text-lg font-semibold">{label}</Label>
        <Button type="button" size="sm" variant="outline" onClick={addItem}>
          <Plus className="size-4 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No dishes yet. Click "Add" to create one.</p>
        ) : (
          items.map((item: Dish, index: number) => (
            <div key={index} className="p-3 bg-muted/30 rounded-lg space-y-2 sm:space-y-0 sm:flex sm:gap-2 sm:items-center sm:p-0 sm:bg-transparent sm:rounded-none">
              <div className="flex-1">
                <Input
                  value={item.name}
                  placeholder="Dish name"
                  onChange={(e) => updateName(index, e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full text-sm sm:text-base"
                />
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2">
                <StarRating value={item.rating || 0} onChange={(rating) => updateRating(index, rating)} interactive size="sm" />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removeItem(index)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
        <div className="space-y-1">
          {field.state.meta.errors.map((error) =>
            error ? (
              <div key={typeof error === 'string' ? error : error.toString()} className="text-sm text-red-500 font-bold">
                {typeof error === 'string' ? error : error.toString()}
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
