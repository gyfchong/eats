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
 * List recipes with pagination and filtering
 * Supports text search, favorites filter, cuisine filter, and meal type filter
 */
export const listPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    favoritesOnly: v.optional(v.boolean()),
    cuisine: v.optional(v.string()),
    mealType: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { paginationOpts, favoritesOnly, cuisine, mealType, searchQuery } = args

    // Get the meal type field name for filtering
    const mealTypeField = mealType ? mealTypeFieldMap[mealType] : undefined

    // If search query provided, use search index
    if (searchQuery?.trim()) {
      let searchResults = ctx.db
        .query('recipes')
        .withSearchIndex('search_name', (q) => {
          let search = q.search('name', searchQuery)
          if (favoritesOnly) {
            search = search.eq('isFavorite', true)
          }
          if (cuisine) {
            search = search.eq('cuisine', cuisine)
          }
          return search
        })

      // Apply mealType filter if present
      if (mealTypeField) {
        searchResults = searchResults.filter((q) =>
          q.eq(q.field(mealTypeField), true),
        )
      }

      return await searchResults.paginate(paginationOpts)
    }

    // Use meal type index if specified (most selective for this use case)
    if (mealType && mealTypeIndexMap[mealType]) {
      const mealTypeQuery = ctx.db
        .query('recipes')
        .withIndex(mealTypeIndexMap[mealType], (q) =>
          q.eq(mealTypeFieldMap[mealType], true),
        )
        .order('desc')

      // Apply additional filters
      if (favoritesOnly && cuisine) {
        return await mealTypeQuery
          .filter((q) =>
            q.and(
              q.eq(q.field('isFavorite'), true),
              q.eq(q.field('cuisine'), cuisine),
            ),
          )
          .paginate(paginationOpts)
      }
      if (favoritesOnly) {
        return await mealTypeQuery
          .filter((q) => q.eq(q.field('isFavorite'), true))
          .paginate(paginationOpts)
      }
      if (cuisine) {
        return await mealTypeQuery
          .filter((q) => q.eq(q.field('cuisine'), cuisine))
          .paginate(paginationOpts)
      }

      return await mealTypeQuery.paginate(paginationOpts)
    }

    // Favorites filter takes priority
    if (favoritesOnly) {
      const favoritesQuery = ctx.db
        .query('recipes')
        .withIndex('by_favorite', (q) => q.eq('isFavorite', true))
        .order('desc')

      if (cuisine) {
        return await favoritesQuery
          .filter((q) => q.eq(q.field('cuisine'), cuisine))
          .paginate(paginationOpts)
      }

      return await favoritesQuery.paginate(paginationOpts)
    }

    // Cuisine filter without favorites
    if (cuisine) {
      return await ctx.db
        .query('recipes')
        .withIndex('by_cuisine', (q) => q.eq('cuisine', cuisine))
        .order('desc')
        .paginate(paginationOpts)
    }

    // Default: all recipes by creation time
    return await ctx.db
      .query('recipes')
      .withIndex('by_creation_time')
      .order('desc')
      .paginate(paginationOpts)
  },
})

/**
 * Get all unique cuisines from recipes
 */
export const getCuisines = query({
  args: {},
  handler: async (ctx) => {
    const recipes = await ctx.db.query('recipes').collect()
    const cuisines = [
      ...new Set(recipes.map((r) => r.cuisine).filter(Boolean)),
    ] as string[]
    return cuisines.sort()
  },
})

/**
 * Get all meal types that are actually used in recipes
 */
export const getMealTypes = query({
  args: {},
  handler: async (ctx) => {
    const recipes = await ctx.db.query('recipes').collect()
    const usedMealTypes = new Set<string>()
    for (const recipe of recipes) {
      for (const mealType of recipe.mealTypes) {
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
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
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
      description: args.description,
      imageUrl: args.imageUrl,
      ...mealTypesToBooleans(args.mealTypes),
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
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
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
      description: args.description,
      imageUrl: args.imageUrl,
      ...mealTypesToBooleans(args.mealTypes),
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
