import { useEffect, useRef, useState } from 'react'
import type { Doc } from '~convex/_generated/dataModel'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { MealTypeCheckboxGroup } from '~/components/MealTypeCheckboxGroup'
import { DynamicTextList } from '~/components/DynamicTextList'
import { LinkPreview } from '~/components/LinkPreview'
import { useRecipeForm } from '~/hooks/useRecipeForm'
import { useLinkPreview } from '~/hooks/useLinkPreview'

interface RecipeFormProps {
  recipe?: Doc<'recipes'>
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

export function RecipeForm({ recipe, open, onClose, onSaved }: RecipeFormProps) {
  const form = useRecipeForm(recipe, () => {
    onSaved?.()
    onClose()
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
          <DialogTitle className="font-display text-xl sm:text-2xl">{recipe ? 'Edit Recipe' : 'Add Recipe'}</DialogTitle>
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
                <Label htmlFor="link">Recipe Link *</Label>
                <Input
                  id="link"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value)
                    setLinkValue(e.target.value)
                  }}
                  onBlur={field.handleBlur}
                  placeholder="https://example.com/recipe"
                  className="mt-1"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-red-500 text-sm mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
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
              <div>
                <Label htmlFor="name">Recipe Name</Label>
                <Input
                  id="name"
                  value={field.state.value ?? ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="e.g., Chocolate Cake"
                  className="mt-1"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={field.state.value ?? ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Brief description of the recipe"
                  className="mt-1"
                  rows={2}
                />
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

          <form.Field name="ingredients">
            {(field) => <DynamicTextList field={field} label="Ingredients" placeholder="Enter ingredient" />}
          </form.Field>

          <form.Field name="notes">
            {(field) => (
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={field.state.value ?? ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Additional notes about the recipe"
                  className="mt-1"
                  rows={3}
                />
              </div>
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
