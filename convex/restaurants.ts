import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

/**
 * List all restaurants, optionally filtering by favorites
 * Returns restaurants in descending order by creation time (newest first)
 */
export const list = query({
  args: {
    favoritesOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let restaurantsQuery = ctx.db
      .query('restaurants')
      .withIndex('by_creation_time')
      .order('desc')

    const restaurants = await restaurantsQuery.collect()

    // Filter by favorites if requested
    if (args.favoritesOnly) {
      return restaurants.filter((restaurant) => restaurant.isFavorite)
    }

    return restaurants
  },
})

/**
 * Get a single restaurant by ID
 */
export const get = query({
  args: {
    id: v.id('restaurants'),
  },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.id)

    if (!restaurant) {
      throw new Error('Restaurant not found')
    }

    return restaurant
  },
})

/**
 * Add a new restaurant
 * All fields except isFavorite (which defaults to false)
 */
export const add = mutation({
  args: {
    link: v.string(),
    name: v.optional(v.string()),
    suburb: v.string(),
    cuisine: v.optional(v.string()),
    mealTypes: v.array(v.string()),
    dishes: v.array(
      v.object({
        name: v.string(),
        rating: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Validate link is not empty
    if (!args.link.trim()) {
      throw new Error('Link is required')
    }

    // Validate suburb is not empty
    if (!args.suburb.trim()) {
      throw new Error('Suburb is required')
    }

    return await ctx.db.insert('restaurants', {
      link: args.link,
      name: args.name,
      suburb: args.suburb,
      cuisine: args.cuisine,
      mealTypes: args.mealTypes,
      isFavorite: false, // Default to false
      dishes: args.dishes,
    })
  },
})

/**
 * Update an existing restaurant
 */
export const update = mutation({
  args: {
    id: v.id('restaurants'),
    link: v.string(),
    name: v.optional(v.string()),
    suburb: v.string(),
    cuisine: v.optional(v.string()),
    mealTypes: v.array(v.string()),
    dishes: v.array(
      v.object({
        name: v.string(),
        rating: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.id)

    if (!restaurant) {
      throw new Error('Restaurant not found')
    }

    // Validate link is not empty
    if (!args.link.trim()) {
      throw new Error('Link is required')
    }

    // Validate suburb is not empty
    if (!args.suburb.trim()) {
      throw new Error('Suburb is required')
    }

    return await ctx.db.patch(args.id, {
      link: args.link,
      name: args.name,
      suburb: args.suburb,
      cuisine: args.cuisine,
      mealTypes: args.mealTypes,
      dishes: args.dishes,
    })
  },
})

/**
 * Toggle the favorite status of a restaurant
 */
export const toggleFavorite = mutation({
  args: {
    id: v.id('restaurants'),
  },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.id)

    if (!restaurant) {
      throw new Error('Restaurant not found')
    }

    return await ctx.db.patch(args.id, {
      isFavorite: !restaurant.isFavorite,
    })
  },
})

/**
 * Delete a restaurant
 */
export const remove = mutation({
  args: {
    id: v.id('restaurants'),
  },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.id)

    if (!restaurant) {
      throw new Error('Restaurant not found')
    }

    return await ctx.db.delete(args.id)
  },
})
