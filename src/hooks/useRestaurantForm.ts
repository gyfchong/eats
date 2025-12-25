import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '~convex/_generated/api'
import type { Doc } from '~convex/_generated/dataModel'

const restaurantSchema = z.object({
  link: z.string().url({ message: 'Please enter a valid URL' }),
  name: z.string().optional(),
  suburb: z.string().min(1, 'Suburb is required'),
  cuisine: z.string().optional(),
  mealTypes: z.array(z.string()),
  dishes: z.array(z.object({ name: z.string(), rating: z.number().optional() })),
})

export function useRestaurantForm(restaurant: Doc<'restaurants'> | undefined, onSuccess: () => void) {
  const addMutation = useConvexMutation(api.restaurants.add)
  const updateMutation = useConvexMutation(api.restaurants.update)

  return useForm({
    defaultValues: {
      link: restaurant?.link ?? '',
      name: restaurant?.name ?? '',
      suburb: restaurant?.suburb ?? '',
      cuisine: restaurant?.cuisine ?? '',
      mealTypes: restaurant?.mealTypes ?? [],
      dishes: restaurant?.dishes ?? [],
    },
    onSubmit: async ({ value }) => {
      // Validate with Zod
      const validated = restaurantSchema.parse(value)

      // Submit to Convex
      if (restaurant) {
        await updateMutation({ id: restaurant._id, ...validated })
      } else {
        await addMutation(validated)
      }

      onSuccess()
    },
    onSubmitInvalid: ({ value, formApi }) => {
      try {
        restaurantSchema.parse(value)
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.issues.forEach((issue) => {
            const fieldName = issue.path.join('.') as any
            formApi.setFieldMeta(fieldName, (prev) => ({
              ...prev,
              errors: [issue.message],
            }))
          })
        }
      }
    },
  })
}
