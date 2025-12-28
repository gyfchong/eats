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
})
