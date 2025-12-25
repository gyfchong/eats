import { useState } from 'react'
import { z } from 'zod'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '~convex/_generated/api'
import type { Doc } from '~convex/_generated/dataModel'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { MealTypeCheckboxGroup } from '~/components/MealTypeCheckboxGroup'
import { DynamicDishList } from '~/components/DynamicDishList'

const restaurantSchema = z.object({
  link: z.string().url('Please enter a valid URL'),
  name: z.string().optional(),
  suburb: z.string().min(1, 'Suburb is required'),
  cuisine: z.string().optional(),
  mealTypes: z.array(z.string()),
  dishes: z.array(z.object({ name: z.string(), rating: z.number().optional() })),
})

type RestaurantFormData = z.infer<typeof restaurantSchema>

interface RestaurantFormProps {
  restaurant?: Doc<'restaurants'>
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

export function RestaurantForm({ restaurant, open, onClose, onSaved }: RestaurantFormProps) {
  const [formData, setFormData] = useState<RestaurantFormData>(() => ({
    link: restaurant?.link ?? '',
    name: restaurant?.name ?? '',
    suburb: restaurant?.suburb ?? '',
    cuisine: restaurant?.cuisine ?? '',
    mealTypes: restaurant?.mealTypes ?? [],
    dishes: restaurant?.dishes ?? [],
  }))

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addMutation = useConvexMutation(api.restaurants.add)
  const updateMutation = useConvexMutation(api.restaurants.update)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      const validated = restaurantSchema.parse(formData)
      setIsSubmitting(true)

      if (restaurant) {
        await updateMutation({
          id: restaurant._id,
          ...validated,
        })
      } else {
        await addMutation(validated)
      }

      onSaved?.()
      onClose()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const path = err.path.join('.')
          newErrors[path] = err.message
        })
        setErrors(newErrors)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{restaurant ? 'Edit Restaurant' : 'Add Restaurant'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="link">Restaurant Link *</Label>
            <Input
              id="link"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://example.com"
              className="mt-1"
            />
            {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link}</p>}
          </div>

          <div>
            <Label htmlFor="name">Restaurant Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Mario's Pizzeria"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="suburb">Suburb *</Label>
            <Input
              id="suburb"
              value={formData.suburb}
              onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
              placeholder="e.g., North Melbourne"
              className="mt-1"
            />
            {errors.suburb && <p className="text-red-500 text-sm mt-1">{errors.suburb}</p>}
          </div>

          <div>
            <Label htmlFor="cuisine">Cuisine</Label>
            <Input
              id="cuisine"
              value={formData.cuisine}
              onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
              placeholder="e.g., Italian"
              className="mt-1"
            />
          </div>

          <div>
            <MealTypeCheckboxGroup
              field={{
                state: { value: formData.mealTypes, meta: { isTouched: true, errors: [] } },
                handleChange: (value) => setFormData({ ...formData, mealTypes: value }),
                handleBlur: () => {},
                store: { getState: () => ({ meta: { errors: [] } }) as any },
              } as any}
              label="Meal Types"
            />
          </div>

          <div>
            <DynamicDishList
              field={{
                state: { value: formData.dishes, meta: { isTouched: true, errors: [] } },
                handleChange: (value) => setFormData({ ...formData, dishes: value }),
                handleBlur: () => {},
                store: { getState: () => ({ meta: { errors: [] } }) as any },
              } as any}
              label="Dishes"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : restaurant ? 'Update' : 'Add'} Restaurant
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
