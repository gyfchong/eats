import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '~convex/_generated/api'
import type { Doc } from '~convex/_generated/dataModel'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { TextField } from '~/components/ui/form-field'
import { MealTypeCheckboxGroup } from '~/components/MealTypeCheckboxGroup'
import { DynamicDishList } from '~/components/DynamicDishList'

const restaurantSchema = z.object({
  link: z.string().url({ message: 'Please enter a valid URL' }),
  name: z.string().optional(),
  suburb: z.string().min(1, 'Suburb is required'),
  cuisine: z.string().optional(),
  mealTypes: z.array(z.string()),
  dishes: z.array(z.object({ name: z.string(), rating: z.number().optional() })),
})

interface RestaurantFormProps {
  restaurant?: Doc<'restaurants'>
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

export function RestaurantForm({ restaurant, open, onClose, onSaved }: RestaurantFormProps) {
  const addMutation = useConvexMutation(api.restaurants.add)
  const updateMutation = useConvexMutation(api.restaurants.update)

  const form = useForm({
    defaultValues: {
      link: restaurant?.link ?? '',
      name: restaurant?.name ?? '',
      suburb: restaurant?.suburb ?? '',
      cuisine: restaurant?.cuisine ?? '',
      mealTypes: restaurant?.mealTypes ?? [],
      dishes: restaurant?.dishes ?? [],
    },
    onSubmit: async ({ value }) => {
      const validated = restaurantSchema.parse(value)
      if (restaurant) {
        await updateMutation({ id: restaurant._id, ...validated })
      } else {
        await addMutation(validated)
      }
      onSaved?.()
      onClose()
    },
    onSubmitInvalid: ({ value, formApi }) => {
      try {
        restaurantSchema.parse(value)
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.issues.forEach((issue) => {
            const fieldName = issue.path.join('.') as keyof typeof value
            formApi.setFieldMeta(fieldName, (prev) => ({
              ...prev,
              errors: [issue.message],
            }))
          })
        }
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl sm:text-2xl">
            {restaurant ? 'Edit Restaurant' : 'Add Restaurant'}
          </DialogTitle>
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
              <TextField
                field={field}
                label="Restaurant Link"
                placeholder="https://example.com"
                type="url"
                required
              />
            )}
          </form.Field>

          <form.Field name="name">
            {(field) => (
              <TextField
                field={field}
                label="Restaurant Name"
                placeholder="e.g., Mario's Pizzeria"
              />
            )}
          </form.Field>

          <form.Field name="suburb">
            {(field) => (
              <TextField
                field={field}
                label="Suburb"
                placeholder="e.g., North Melbourne"
                required
              />
            )}
          </form.Field>

          <form.Field name="cuisine">
            {(field) => (
              <TextField
                field={field}
                label="Cuisine"
                placeholder="e.g., Italian"
              />
            )}
          </form.Field>

          <form.Field name="mealTypes">
            {(field) => (
              <MealTypeCheckboxGroup field={field} label="Meal Types" />
            )}
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
