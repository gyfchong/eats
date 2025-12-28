import { mutation, query } from './_generated/server'
import { paginationOptsValidator } from 'convex/server'
import { v } from 'convex/values'

/**
 * Helper to convert mealTypes array to boolean fields for efficient indexing
 */
function mealTypesToBooleans(mealTypes: string[]) {
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
 * Map meal type string to the corresponding index name
 */
const mealTypeIndexMap: Record<string, 'by_mealType_breakfast' | 'by_mealType_lunch' | 'by_mealType_dinner' | 'by_mealType_dessert' | 'by_mealType_sides' | 'by_mealType_snacks' | 'by_mealType_drinks' | 'by_mealType_savoury' | 'by_mealType_sweet'> = {
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
const mealTypeFieldMap: Record<string, 'mealType_breakfast' | 'mealType_lunch' | 'mealType_dinner' | 'mealType_dessert' | 'mealType_sides' | 'mealType_snacks' | 'mealType_drinks' | 'mealType_savoury' | 'mealType_sweet'> = {
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
 * List restaurants with pagination and filtering
 * Supports text search, favorites filter, cuisine filter, suburb filter, and meal type filter
 */
export const listPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    favoritesOnly: v.optional(v.boolean()),
    cuisine: v.optional(v.string()),
    suburb: v.optional(v.string()),
    mealType: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { paginationOpts, favoritesOnly, cuisine, suburb, mealType, searchQuery } = args

    // Get the meal type field name for filtering
    const mealTypeField = mealType ? mealTypeFieldMap[mealType] : undefined

    // If search query provided, use search index
    if (searchQuery?.trim()) {
      let searchResults = ctx.db
        .query('restaurants')
        .withSearchIndex('search_name', (q) => {
          let search = q.search('name', searchQuery)
          if (favoritesOnly) {
            search = search.eq('isFavorite', true)
          }
          if (cuisine) {
            search = search.eq('cuisine', cuisine)
          }
          if (suburb) {
            search = search.eq('suburb', suburb)
          }
          return search
        })

      // Apply mealType filter if present (not supported in search index)
      if (mealTypeField) {
        searchResults = searchResults.filter((q) =>
          q.eq(q.field(mealTypeField), true),
        )
      }

      return await searchResults.paginate(paginationOpts)
    }

    // Use meal type index if specified
    if (mealType && mealTypeIndexMap[mealType]) {
      const mealTypeQuery = ctx.db
        .query('restaurants')
        .withIndex(mealTypeIndexMap[mealType], (q) =>
          q.eq(mealTypeFieldMap[mealType], true),
        )
        .order('desc')

      // Apply additional filters
      const conditions: ((q: any) => any)[] = []
      if (favoritesOnly) {
        conditions.push((q) => q.eq(q.field('isFavorite'), true))
      }
      if (cuisine) {
        conditions.push((q) => q.eq(q.field('cuisine'), cuisine))
      }
      if (suburb) {
        conditions.push((q) => q.eq(q.field('suburb'), suburb))
      }

      if (conditions.length === 0) {
        return await mealTypeQuery.paginate(paginationOpts)
      }
      if (conditions.length === 1) {
        return await mealTypeQuery.filter(conditions[0]).paginate(paginationOpts)
      }

      return await mealTypeQuery
        .filter((q) => {
          let result = conditions[0](q)
          for (let i = 1; i < conditions.length; i++) {
            result = q.and(result, conditions[i](q))
          }
          return result
        })
        .paginate(paginationOpts)
    }

    // Favorites filter takes priority
    if (favoritesOnly) {
      const favoritesQuery = ctx.db
        .query('restaurants')
        .withIndex('by_favorite', (q) => q.eq('isFavorite', true))
        .order('desc')

      const conditions: ((q: any) => any)[] = []
      if (cuisine) {
        conditions.push((q) => q.eq(q.field('cuisine'), cuisine))
      }
      if (suburb) {
        conditions.push((q) => q.eq(q.field('suburb'), suburb))
      }

      if (conditions.length === 0) {
        return await favoritesQuery.paginate(paginationOpts)
      }
      if (conditions.length === 1) {
        return await favoritesQuery.filter(conditions[0]).paginate(paginationOpts)
      }

      return await favoritesQuery
        .filter((q) => q.and(conditions[0](q), conditions[1](q)))
        .paginate(paginationOpts)
    }

    // Suburb filter
    if (suburb) {
      const suburbQuery = ctx.db
        .query('restaurants')
        .withIndex('by_suburb', (q) => q.eq('suburb', suburb))
        .order('desc')

      if (cuisine) {
        return await suburbQuery
          .filter((q) => q.eq(q.field('cuisine'), cuisine))
          .paginate(paginationOpts)
      }

      return await suburbQuery.paginate(paginationOpts)
    }

    // Cuisine filter
    if (cuisine) {
      return await ctx.db
        .query('restaurants')
        .withIndex('by_cuisine', (q) => q.eq('cuisine', cuisine))
        .order('desc')
        .paginate(paginationOpts)
    }

    // Default: all restaurants by creation time
    return await ctx.db
      .query('restaurants')
      .withIndex('by_creation_time')
      .order('desc')
      .paginate(paginationOpts)
  },
})

/**
 * Get all unique cuisines from restaurants
 */
export const getCuisines = query({
  args: {},
  handler: async (ctx) => {
    const restaurants = await ctx.db.query('restaurants').collect()
    const cuisines = [
      ...new Set(restaurants.map((r) => r.cuisine).filter(Boolean)),
    ] as string[]
    return cuisines.sort()
  },
})

/**
 * Get all unique suburbs from restaurants
 */
export const getSuburbs = query({
  args: {},
  handler: async (ctx) => {
    const restaurants = await ctx.db.query('restaurants').collect()
    const suburbs = [
      ...new Set(restaurants.map((r) => r.suburb).filter(Boolean)),
    ] as string[]
    return suburbs.sort()
  },
})

/**
 * Get all meal types that are actually used in restaurants
 */
export const getMealTypes = query({
  args: {},
  handler: async (ctx) => {
    const restaurants = await ctx.db.query('restaurants').collect()
    const usedMealTypes = new Set<string>()
    for (const restaurant of restaurants) {
      for (const mealType of restaurant.mealTypes) {
        usedMealTypes.add(mealType)
      }
    }
    // Return in a consistent order
    const allMealTypes = [
      'breakfast',
      'lunch',
      'dinner',
      'dessert',
      'sides',
      'snacks',
      'drinks',
      'savoury',
      'sweet',
    ]
    return allMealTypes.filter((mt) => usedMealTypes.has(mt))
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
      ...mealTypesToBooleans(args.mealTypes),
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
      ...mealTypesToBooleans(args.mealTypes),
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
