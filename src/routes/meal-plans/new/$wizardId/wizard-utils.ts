import { z } from 'zod'
import type { Id } from '~convex/_generated/dataModel'

// Helper functions
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function calculateEndDate(startDate: string, numDays: number): string {
  const start = new Date(startDate)
  const end = new Date(start)
  end.setDate(start.getDate() + numDays - 1)
  return end.toISOString().split('T')[0]
}

export function calculateDateRange(
  startDate: string | undefined,
  numDays: number,
): string {
  if (!startDate) return ''

  const start = new Date(startDate)
  const end = new Date(calculateEndDate(startDate, numDays))

  const formatOpts: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  }
  const startStr = start.toLocaleDateString('en-US', formatOpts)
  const endOpts: Intl.DateTimeFormatOptions = {
    ...formatOpts,
    year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined,
  }
  const endStr = end.toLocaleDateString('en-US', endOpts)

  if (start.getFullYear() !== end.getFullYear()) {
    return `${startStr}, ${start.getFullYear()} - ${endStr}`
  }
  return `${startStr} - ${endStr}, ${end.getFullYear()}`
}

// Search params schema
export const mealPlanSearchSchema = z.object({
  numDays: z.number().min(1).max(14).optional().default(7),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .default(getTodayISO()),
  recipeIds: z.string().optional(),
  sideIds: z.string().optional(),
})

export type MealPlanSearch = z.infer<typeof mealPlanSearchSchema>

// Steps configuration
export const STEPS = ['days', 'recipes', 'sides', 'review'] as const
export type Step = (typeof STEPS)[number]

// Parse comma-separated IDs from URL
export function parseRecipeIds(recipeIds: string | undefined): Id<'recipes'>[] {
  return recipeIds
    ? (recipeIds.split(',').filter(Boolean) as Id<'recipes'>[])
    : []
}
