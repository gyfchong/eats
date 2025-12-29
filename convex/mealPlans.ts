import { mutation, query } from './_generated/server'
import { paginationOptsValidator } from 'convex/server'
import { v } from 'convex/values'

/**
 * Get total count of meal plans (used for recommendation rotation)
 */
export const getPlanCount = query({
  args: {},
  handler: async (ctx) => {
    const plans = await ctx.db.query('mealPlans').collect()
    return plans.length
  },
})

/**
 * Get top 6 most-made recipes, rotated based on plan count
 * Uses modulo to offset which 6 recipes appear as recommendations
 */
export const getTopMadeRecipes = query({
  args: {},
  handler: async (ctx) => {
    // Get all recipe usage counts
    const usageRecords = await ctx.db.query('recipeUsage').collect()

    // Count usage per recipe
    const usageCounts = new Map<string, number>()
    for (const record of usageRecords) {
      const recipeId = record.recipeId
      usageCounts.set(recipeId, (usageCounts.get(recipeId) || 0) + 1)
    }

    // Get all recipes
    const recipes = await ctx.db.query('recipes').collect()

    // Sort by usage count (descending)
    const sortedRecipes = recipes
      .map((recipe) => ({
        ...recipe,
        usageCount: usageCounts.get(recipe._id) || 0,
      }))
      .sort((a, b) => b.usageCount - a.usageCount)

    // Get plan count for rotation
    const planCount = await ctx.db.query('mealPlans').collect()
    const offset = (planCount.length * 6) % Math.max(sortedRecipes.length, 1)

    // Return 6 recipes with rotation
    const rotatedRecipes = [
      ...sortedRecipes.slice(offset),
      ...sortedRecipes.slice(0, offset),
    ]

    return rotatedRecipes.slice(0, 6)
  },
})

/**
 * Get recommended side dishes
 * Returns top sides based on usage, with rotation
 */
export const getRecommendedSides = query({
  args: {},
  handler: async (ctx) => {
    // Get all recipes that are sides
    const allRecipes = await ctx.db
      .query('recipes')
      .withIndex('by_mealType_sides', (q) => q.eq('mealType_sides', true))
      .collect()

    // Get usage counts
    const usageRecords = await ctx.db.query('recipeUsage').collect()
    const usageCounts = new Map<string, number>()
    for (const record of usageRecords) {
      usageCounts.set(record.recipeId, (usageCounts.get(record.recipeId) || 0) + 1)
    }

    // Sort by usage count
    const sortedSides = allRecipes
      .map((recipe) => ({
        ...recipe,
        usageCount: usageCounts.get(recipe._id) || 0,
      }))
      .sort((a, b) => b.usageCount - a.usageCount)

    // Get plan count for rotation
    const planCount = await ctx.db.query('mealPlans').collect()
    const offset = (planCount.length * 4) % Math.max(sortedSides.length, 1)

    // Return 4 sides with rotation
    const rotatedSides = [
      ...sortedSides.slice(offset),
      ...sortedSides.slice(0, offset),
    ]

    return rotatedSides.slice(0, 4)
  },
})

/**
 * Create a new meal plan
 */
export const create = mutation({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    numDays: v.number(),
    recipes: v.array(
      v.object({
        recipeId: v.id('recipes'),
        assignedDay: v.optional(v.number()),
        isSide: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Validate dates
    if (!args.startDate || !args.endDate) {
      throw new Error('Start and end dates are required')
    }

    if (args.numDays < 1 || args.numDays > 14) {
      throw new Error('Number of days must be between 1 and 14')
    }

    return await ctx.db.insert('mealPlans', {
      startDate: args.startDate,
      endDate: args.endDate,
      numDays: args.numDays,
      recipes: args.recipes,
      status: 'active',
    })
  },
})

/**
 * Update an existing meal plan
 */
export const update = mutation({
  args: {
    id: v.id('mealPlans'),
    recipes: v.optional(
      v.array(
        v.object({
          recipeId: v.id('recipes'),
          assignedDay: v.optional(v.number()),
          isSide: v.boolean(),
        }),
      ),
    ),
    status: v.optional(
      v.union(v.literal('draft'), v.literal('active'), v.literal('completed')),
    ),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.id)

    if (!plan) {
      throw new Error('Meal plan not found')
    }

    const updates: Partial<typeof plan> = {}
    if (args.recipes !== undefined) {
      updates.recipes = args.recipes
    }
    if (args.status !== undefined) {
      updates.status = args.status
    }

    return await ctx.db.patch(args.id, updates)
  },
})

/**
 * Get a single meal plan by ID with full recipe details
 */
export const get = query({
  args: {
    id: v.id('mealPlans'),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.id)

    if (!plan) {
      throw new Error('Meal plan not found')
    }

    // Fetch full recipe details for each recipe in the plan
    const recipesWithDetails = await Promise.all(
      plan.recipes.map(async (planRecipe) => {
        const recipe = await ctx.db.get(planRecipe.recipeId)
        return {
          ...planRecipe,
          recipe,
        }
      }),
    )

    return {
      ...plan,
      recipesWithDetails,
    }
  },
})

/**
 * List all meal plans with pagination
 */
export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(
      v.union(v.literal('draft'), v.literal('active'), v.literal('completed')),
    ),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query('mealPlans')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .paginate(args.paginationOpts)
    }

    return await ctx.db
      .query('mealPlans')
      .withIndex('by_startDate')
      .order('desc')
      .paginate(args.paginationOpts)
  },
})

/**
 * List all meal plans (non-paginated, for simple list)
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('mealPlans')
      .withIndex('by_startDate')
      .order('desc')
      .collect()
  },
})

/**
 * Mark a recipe as made (records usage)
 */
export const markRecipeAsMade = mutation({
  args: {
    recipeId: v.id('recipes'),
    mealPlanId: v.optional(v.id('mealPlans')),
  },
  handler: async (ctx, args) => {
    // Verify recipe exists
    const recipe = await ctx.db.get(args.recipeId)
    if (!recipe) {
      throw new Error('Recipe not found')
    }

    // Record usage
    return await ctx.db.insert('recipeUsage', {
      recipeId: args.recipeId,
      mealPlanId: args.mealPlanId,
      madeAt: Date.now(),
    })
  },
})

/**
 * Delete a meal plan
 */
export const remove = mutation({
  args: {
    id: v.id('mealPlans'),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.id)

    if (!plan) {
      throw new Error('Meal plan not found')
    }

    return await ctx.db.delete(args.id)
  },
})

/**
 * Get usage count for a specific recipe
 */
export const getRecipeUsageCount = query({
  args: {
    recipeId: v.id('recipes'),
  },
  handler: async (ctx, args) => {
    const usageRecords = await ctx.db
      .query('recipeUsage')
      .withIndex('by_recipe', (q) => q.eq('recipeId', args.recipeId))
      .collect()

    return usageRecords.length
  },
})
