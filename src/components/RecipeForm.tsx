import { useEffect, useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '~convex/_generated/api'
import type { Doc } from '~convex/_generated/dataModel'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { TextField, TextAreaField } from '~/components/ui/form-field'
import { MealTypeCheckboxGroup } from '~/components/MealTypeCheckboxGroup'
import { DynamicTextList } from '~/components/DynamicTextList'
import { LinkPreview } from '~/components/LinkPreview'
import { useLinkPreview } from '~/hooks/useLinkPreview'

const recipeSchema = z.object({
  link: z.string().url({ message: 'Please enter a valid URL' }),
  name: z.string().optional(),
  cuisine: z.string().optional(),
  mealTypes: z.array(z.string()),
  ingredients: z.array(z.string()),
  notes: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

interface RecipeFormProps {
  recipe?: Doc<'recipes'>
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

export function RecipeForm({ recipe, open, onClose, onSaved }: RecipeFormProps) {
  const addMutation = useConvexMutation(api.recipes.add)
  const updateMutation = useConvexMutation(api.recipes.update)

  const form = useForm({
    defaultValues: {
      link: recipe?.link ?? '',
      name: recipe?.name ?? '',
      cuisine: recipe?.cuisine ?? '',
      mealTypes: recipe?.mealTypes ?? [],
      ingredients: recipe?.ingredients ?? [],
      notes: recipe?.notes ?? '',
      description: recipe?.description ?? '',
      imageUrl: recipe?.imageUrl ?? '',
    },
    onSubmit: async ({ value }) => {
      const validated = recipeSchema.parse(value)
      if (recipe) {
        await updateMutation({ id: recipe._id, ...validated })
      } else {
        await addMutation(validated)
      }
      onSaved?.()
      onClose()
    },
    onSubmitInvalid: ({ value, formApi }) => {
      try {
        recipeSchema.parse(value)
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

  // Track link value for preview
  const [linkValue, setLinkValue] = useState(recipe?.link ?? '')

  // Fetch link preview
  const { preview, isLoading, error, refetch } = useLinkPreview(linkValue)

  // Track if we've auto-filled from preview
  const hasAutoFilledRef = useRef(false)

  // Auto-fill name and description from preview (only once, and only for new recipes)
  useEffect(() => {
    if (!recipe && preview && !hasAutoFilledRef.current) {
      const currentName = form.getFieldValue('name')
      const currentDescription = form.getFieldValue('description')

      if (!currentName && preview.title) {
        form.setFieldValue('name', preview.title)
      }
      if (!currentDescription && preview.description) {
        form.setFieldValue('description', preview.description)
      }

      hasAutoFilledRef.current = true
    }
  }, [preview, recipe, form])

  // Store imageUrl in form when preview loads
  useEffect(() => {
    if (preview?.imageUrl) {
      form.setFieldValue('imageUrl', preview.imageUrl)
    }
  }, [preview?.imageUrl, form])

  // Reset auto-fill tracking when modal closes
  useEffect(() => {
    if (!open) {
      hasAutoFilledRef.current = false
      setLinkValue(recipe?.link ?? '')
    }
  }, [open, recipe?.link])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl sm:text-2xl">
            {recipe ? 'Edit Recipe' : 'Add Recipe'}
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
                label="Recipe Link"
                placeholder="https://example.com/recipe"
                type="url"
                required
                onChange={setLinkValue}
              />
            )}
          </form.Field>

          {/* Link Preview */}
          {linkValue && linkValue.startsWith('http') && (
            <LinkPreview
              preview={preview}
              isLoading={isLoading}
              error={error}
              onRetry={refetch}
              url={linkValue}
            />
          )}

          <form.Field name="name">
            {(field) => (
              <TextField
                field={field}
                label="Recipe Name"
                placeholder="e.g., Chocolate Cake"
              />
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <TextAreaField
                field={field}
                label="Description"
                placeholder="Brief description of the recipe"
                rows={2}
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

          <form.Field name="ingredients">
            {(field) => (
              <DynamicTextList
                field={field}
                label="Ingredients"
                placeholder="Enter ingredient"
              />
            )}
          </form.Field>

          <form.Field name="notes">
            {(field) => (
              <TextAreaField
                field={field}
                label="Notes"
                placeholder="Additional notes about the recipe"
                rows={3}
              />
            )}
          </form.Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : recipe ? 'Update' : 'Add'} Recipe
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
