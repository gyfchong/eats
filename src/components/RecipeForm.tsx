import { useState } from 'react'
import { z } from 'zod'
import { useMutation } from 'convex/react'
import { api } from '~convex/_generated/api'
import type { Doc, Id } from '~convex/_generated/dataModel'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { MealTypeCheckboxGroup } from '~/components/MealTypeCheckboxGroup'
import { DynamicTextList } from '~/components/DynamicTextList'

const recipeSchema = z.object({
  link: z.string().url('Please enter a valid URL'),
  name: z.string().optional(),
  cuisine: z.string().optional(),
  mealTypes: z.array(z.string()),
  ingredients: z.array(z.string()),
  notes: z.string().optional(),
})

type RecipeFormData = z.infer<typeof recipeSchema>

interface RecipeFormProps {
  recipe?: Doc<'recipes'>
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

export function RecipeForm({ recipe, open, onClose, onSaved }: RecipeFormProps) {
  const [formData, setFormData] = useState<RecipeFormData>(() => ({
    link: recipe?.link ?? '',
    name: recipe?.name ?? '',
    cuisine: recipe?.cuisine ?? '',
    mealTypes: recipe?.mealTypes ?? [],
    ingredients: recipe?.ingredients ?? [],
    notes: recipe?.notes ?? '',
  }))

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addMutation = useMutation(api.recipes.add)
  const updateMutation = useMutation(api.recipes.update)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      const validated = recipeSchema.parse(formData)
      setIsSubmitting(true)

      if (recipe) {
        await updateMutation({
          id: recipe._id,
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
          <DialogTitle>{recipe ? 'Edit Recipe' : 'Add Recipe'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="link">Recipe Link *</Label>
            <Input
              id="link"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://example.com/recipe"
              className="mt-1"
            />
            {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link}</p>}
          </div>

          <div>
            <Label htmlFor="name">Recipe Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Chocolate Cake"
              className="mt-1"
            />
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
            <DynamicTextList
              field={{
                state: { value: formData.ingredients, meta: { isTouched: true, errors: [] } },
                handleChange: (value) => setFormData({ ...formData, ingredients: value }),
                handleBlur: () => {},
                store: { getState: () => ({ meta: { errors: [] } }) as any },
              } as any}
              label="Ingredients"
              placeholder="Enter ingredient"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about the recipe"
              className="mt-1"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : recipe ? 'Update' : 'Add'} Recipe
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
