import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

// Meal type boolean fields for efficient filtering
const mealTypeFields = {
  mealType_breakfast: v.optional(v.boolean()),
  mealType_lunch: v.optional(v.boolean()),
  mealType_dinner: v.optional(v.boolean()),
  mealType_dessert: v.optional(v.boolean()),
  mealType_sides: v.optional(v.boolean()),
  mealType_snacks: v.optional(v.boolean()),
  mealType_drinks: v.optional(v.boolean()),
  mealType_savoury: v.optional(v.boolean()),
  mealType_sweet: v.optional(v.boolean()),
}

export default defineSchema({
  recipes: defineTable({
    link: v.string(),
    name: v.optional(v.string()),
    cuisine: v.optional(v.string()),
    isFavorite: v.boolean(),
    ingredients: v.array(v.string()),
    mealTypes: v.array(v.string()),
    notes: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    // Denormalized meal type fields for efficient filtering
    ...mealTypeFields,
  })
    .index('by_favorite', ['isFavorite'])
    .index('by_cuisine', ['cuisine'])
    .index('by_mealType_breakfast', ['mealType_breakfast'])
    .index('by_mealType_lunch', ['mealType_lunch'])
    .index('by_mealType_dinner', ['mealType_dinner'])
    .index('by_mealType_dessert', ['mealType_dessert'])
    .index('by_mealType_sides', ['mealType_sides'])
    .index('by_mealType_snacks', ['mealType_snacks'])
    .index('by_mealType_drinks', ['mealType_drinks'])
    .index('by_mealType_savoury', ['mealType_savoury'])
    .index('by_mealType_sweet', ['mealType_sweet'])
    .searchIndex('search_name', {
      searchField: 'name',
      filterFields: ['isFavorite', 'cuisine'],
    }),

  restaurants: defineTable({
    link: v.string(),
    name: v.optional(v.string()),
    suburb: v.string(),
    cuisine: v.optional(v.string()),
    mealTypes: v.array(v.string()),
    isFavorite: v.boolean(),
    dishes: v.array(
      v.object({
        name: v.string(),
        rating: v.optional(v.number()), // 1-5 stars
      }),
    ),
    // Denormalized meal type fields for efficient filtering
    ...mealTypeFields,
  })
    .index('by_favorite', ['isFavorite'])
    .index('by_cuisine', ['cuisine'])
    .index('by_suburb', ['suburb'])
    .index('by_mealType_breakfast', ['mealType_breakfast'])
    .index('by_mealType_lunch', ['mealType_lunch'])
    .index('by_mealType_dinner', ['mealType_dinner'])
    .index('by_mealType_dessert', ['mealType_dessert'])
    .index('by_mealType_sides', ['mealType_sides'])
    .index('by_mealType_snacks', ['mealType_snacks'])
    .index('by_mealType_drinks', ['mealType_drinks'])
    .index('by_mealType_savoury', ['mealType_savoury'])
    .index('by_mealType_sweet', ['mealType_sweet'])
    .searchIndex('search_name', {
      searchField: 'name',
      filterFields: ['isFavorite', 'cuisine', 'suburb'],
    }),

  // Meal planning tables
  recipeUsage: defineTable({
    recipeId: v.id('recipes'),
    mealPlanId: v.optional(v.id('mealPlans')),
    madeAt: v.number(), // timestamp
  })
    .index('by_recipe', ['recipeId'])
    .index('by_madeAt', ['madeAt']),

  mealPlans: defineTable({
    startDate: v.string(), // ISO date string (YYYY-MM-DD)
    endDate: v.string(),
    numDays: v.number(),
    recipes: v.array(
      v.object({
        recipeId: v.id('recipes'),
        assignedDay: v.optional(v.number()), // 1-indexed day number
        isSide: v.boolean(),
      }),
    ),
    status: v.union(v.literal('draft'), v.literal('active'), v.literal('completed')),
  })
    .index('by_startDate', ['startDate'])
    .index('by_status', ['status']),
})
