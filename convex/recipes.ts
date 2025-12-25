import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

/**
 * List all recipes, optionally filtering by favorites
 * Returns recipes in descending order by creation time (newest first)
 */
export const list = query({
  args: {
    favoritesOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let recipesQuery = ctx.db
      .query('recipes')
      .withIndex('by_creation_time')
      .order('desc')

    const recipes = await recipesQuery.collect()

    // Filter by favorites if requested
    if (args.favoritesOnly) {
      return recipes.filter((recipe) => recipe.isFavorite)
    }

    return recipes
  },
})

/**
 * Get a single recipe by ID
 */
export const get = query({
  args: {
    id: v.id('recipes'),
  },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.id)

    if (!recipe) {
      throw new Error('Recipe not found')
    }

    return recipe
  },
})

/**
 * Add a new recipe
 * All fields except isFavorite (which defaults to false)
 */
export const add = mutation({
  args: {
    link: v.string(),
    name: v.optional(v.string()),
    cuisine: v.optional(v.string()),
    ingredients: v.array(v.string()),
    mealTypes: v.array(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate link is not empty
    if (!args.link.trim()) {
      throw new Error('Link is required')
    }

    return await ctx.db.insert('recipes', {
      link: args.link,
      name: args.name,
      cuisine: args.cuisine,
      isFavorite: false, // Default to false
      ingredients: args.ingredients,
      mealTypes: args.mealTypes,
      notes: args.notes,
    })
  },
})

/**
 * Update an existing recipe
 */
export const update = mutation({
  args: {
    id: v.id('recipes'),
    link: v.string(),
    name: v.optional(v.string()),
    cuisine: v.optional(v.string()),
    ingredients: v.array(v.string()),
    mealTypes: v.array(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.id)

    if (!recipe) {
      throw new Error('Recipe not found')
    }

    // Validate link is not empty
    if (!args.link.trim()) {
      throw new Error('Link is required')
    }

    return await ctx.db.patch(args.id, {
      link: args.link,
      name: args.name,
      cuisine: args.cuisine,
      ingredients: args.ingredients,
      mealTypes: args.mealTypes,
      notes: args.notes,
    })
  },
})

/**
 * Toggle the favorite status of a recipe
 */
export const toggleFavorite = mutation({
  args: {
    id: v.id('recipes'),
  },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.id)

    if (!recipe) {
      throw new Error('Recipe not found')
    }

    return await ctx.db.patch(args.id, {
      isFavorite: !recipe.isFavorite,
    })
  },
})

/**
 * Delete a recipe
 */
export const remove = mutation({
  args: {
    id: v.id('recipes'),
  },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.id)

    if (!recipe) {
      throw new Error('Recipe not found')
    }

    return await ctx.db.delete(args.id)
  },
})
