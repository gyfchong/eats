import type { Doc } from '~convex/_generated/dataModel'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { MealTypeCheckboxGroup } from '~/components/MealTypeCheckboxGroup'
import { DynamicDishList } from '~/components/DynamicDishList'
import { useRestaurantForm } from '~/hooks/useRestaurantForm'

interface RestaurantFormProps {
  restaurant?: Doc<'restaurants'>
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

export function RestaurantForm({ restaurant, open, onClose, onSaved }: RestaurantFormProps) {
  const form = useRestaurantForm(restaurant, () => {
    onSaved?.()
    onClose()
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl sm:text-2xl">{restaurant ? 'Edit Restaurant' : 'Add Restaurant'}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4 sm:space-y-5"
        >
          <form.Field name="link">
            {(field) => (
              <div>
                <Label htmlFor="link">Restaurant Link *</Label>
                <Input
                  id="link"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="https://example.com"
                  className="mt-1"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-red-500 text-sm mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="name">
            {(field) => (
              <div>
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  value={field.state.value ?? ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g., Mario's Pizzeria"
                  className="mt-1"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="suburb">
            {(field) => (
              <div>
                <Label htmlFor="suburb">Suburb *</Label>
                <Input
                  id="suburb"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g., North Melbourne"
                  className="mt-1"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-red-500 text-sm mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="cuisine">
            {(field) => (
              <div>
                <Label htmlFor="cuisine">Cuisine</Label>
                <Input
                  id="cuisine"
                  value={field.state.value ?? ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g., Italian"
                  className="mt-1"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="mealTypes">
            {(field) => <MealTypeCheckboxGroup field={field} label="Meal Types" />}
          </form.Field>

          <form.Field name="dishes">
            {(field) => <DynamicDishList field={field} label="Dishes" />}
          </form.Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : restaurant ? 'Update' : 'Add'} Restaurant
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
