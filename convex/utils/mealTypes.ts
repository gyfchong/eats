/**
 * Shared meal type utilities for recipes and restaurants
 */

/**
 * All available meal types in display order
 */
export const ALL_MEAL_TYPES = [
  'breakfast',
  'lunch',
  'dinner',
  'dessert',
  'sides',
  'snacks',
  'drinks',
  'savoury',
  'sweet',
] as const

export type MealType = (typeof ALL_MEAL_TYPES)[number]

/**
 * Meal type field names for database storage
 */
export type MealTypeField =
  | 'mealType_breakfast'
  | 'mealType_lunch'
  | 'mealType_dinner'
  | 'mealType_dessert'
  | 'mealType_sides'
  | 'mealType_snacks'
  | 'mealType_drinks'
  | 'mealType_savoury'
  | 'mealType_sweet'

/**
 * Meal type index names for querying
 */
export type MealTypeIndex =
  | 'by_mealType_breakfast'
  | 'by_mealType_lunch'
  | 'by_mealType_dinner'
  | 'by_mealType_dessert'
  | 'by_mealType_sides'
  | 'by_mealType_snacks'
  | 'by_mealType_drinks'
  | 'by_mealType_savoury'
  | 'by_mealType_sweet'

/**
 * Map meal type string to the corresponding index name
 */
export const mealTypeIndexMap: Record<string, MealTypeIndex> = {
  breakfast: 'by_mealType_breakfast',
  lunch: 'by_mealType_lunch',
  dinner: 'by_mealType_dinner',
  dessert: 'by_mealType_dessert',
  sides: 'by_mealType_sides',
  snacks: 'by_mealType_snacks',
  drinks: 'by_mealType_drinks',
  savoury: 'by_mealType_savoury',
  sweet: 'by_mealType_sweet',
}

/**
 * Map meal type string to the corresponding field name
 */
export const mealTypeFieldMap: Record<string, MealTypeField> = {
  breakfast: 'mealType_breakfast',
  lunch: 'mealType_lunch',
  dinner: 'mealType_dinner',
  dessert: 'mealType_dessert',
  sides: 'mealType_sides',
  snacks: 'mealType_snacks',
  drinks: 'mealType_drinks',
  savoury: 'mealType_savoury',
  sweet: 'mealType_sweet',
}

/**
 * Helper to convert mealTypes array to boolean fields for efficient indexing
 */
export function mealTypesToBooleans(mealTypes: string[]) {
  return {
    mealType_breakfast: mealTypes.includes('breakfast') || undefined,
    mealType_lunch: mealTypes.includes('lunch') || undefined,
    mealType_dinner: mealTypes.includes('dinner') || undefined,
    mealType_dessert: mealTypes.includes('dessert') || undefined,
    mealType_sides: mealTypes.includes('sides') || undefined,
    mealType_snacks: mealTypes.includes('snacks') || undefined,
    mealType_drinks: mealTypes.includes('drinks') || undefined,
    mealType_savoury: mealTypes.includes('savoury') || undefined,
    mealType_sweet: mealTypes.includes('sweet') || undefined,
  }
}

/**
 * Filter a set of used meal types to only include valid meal types in display order
 */
export function filterUsedMealTypes(usedMealTypes: Set<string>): string[] {
  return ALL_MEAL_TYPES.filter((mt) => usedMealTypes.has(mt))
}
