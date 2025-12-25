import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '~convex/_generated/api'
import type { Doc } from '~convex/_generated/dataModel'

const recipeSchema = z.object({
  link: z.string().url({ message: 'Please enter a valid URL' }),
  name: z.string().optional(),
  cuisine: z.string().optional(),
  mealTypes: z.array(z.string()),
  ingredients: z.array(z.string()),
  notes: z.string().optional(),
})

export function useRecipeForm(recipe: Doc<'recipes'> | undefined, onSuccess: () => void) {
  const addMutation = useConvexMutation(api.recipes.add)
  const updateMutation = useConvexMutation(api.recipes.update)

  return useForm({
    defaultValues: {
      link: recipe?.link ?? '',
      name: recipe?.name ?? '',
      cuisine: recipe?.cuisine ?? '',
      mealTypes: recipe?.mealTypes ?? [],
      ingredients: recipe?.ingredients ?? [],
      notes: recipe?.notes ?? '',
    },
    onSubmit: async ({ value }) => {
      // Validate with Zod
      const validated = recipeSchema.parse(value)

      // Submit to Convex
      if (recipe) {
        await updateMutation({ id: recipe._id, ...validated })
      } else {
        await addMutation(validated)
      }

      onSuccess()
    },
    onSubmitInvalid: ({ value, formApi }) => {
      try {
        recipeSchema.parse(value)
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
