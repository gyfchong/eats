import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  recipes: defineTable({
    link: v.string(),
    name: v.optional(v.string()),
    cuisine: v.optional(v.string()),
    isFavorite: v.boolean(),
    ingredients: v.array(v.string()),
    mealTypes: v.array(v.string()),
    notes: v.optional(v.string()),
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
  }),
})
