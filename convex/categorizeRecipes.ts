import { action } from './_generated/server'
import { api } from './_generated/api'
import { v } from 'convex/values'

/**
 * Check if link is a YouTube video
 */
function isYouTubeLink(link: string): boolean {
  return link.includes('youtube.com') || link.includes('youtu.be')
}

/**
 * Extract YouTube video ID and construct thumbnail URL
 */
export function getYouTubeThumbnail(link: string): string | null {
  // Handle youtube.com/watch?v=ID format
  const watchMatch = link.match(/youtube\.com\/watch\?v=([^&\s]+)/)
  if (watchMatch) {
    return `https://img.youtube.com/vi/${watchMatch[1]}/mqdefault.jpg`
  }

  // Handle youtu.be/ID format
  const shortMatch = link.match(/youtu\.be\/([^?\s]+)/)
  if (shortMatch) {
    return `https://img.youtube.com/vi/${shortMatch[1]}/mqdefault.jpg`
  }

  // Handle youtube.com/shorts/ID format
  const shortsMatch = link.match(/youtube\.com\/shorts\/([^?\s]+)/)
  if (shortsMatch) {
    return `https://img.youtube.com/vi/${shortsMatch[1]}/mqdefault.jpg`
  }

  return null
}

interface CategorizeResult {
  updated: number
  skipped: number
  failed: number
  processed: number
  chunkNumber: number
  totalChunks: number
}

/**
 * Categorize recipes and assign tags based on their source
 * Processes recipes in chunks for parallel execution
 */
export const categorizeRecipesChunk = action({
  args: {
    chunkNumber: v.number(),
    totalChunks: v.number(),
  },
  handler: async (ctx, args): Promise<CategorizeResult> => {
    const { chunkNumber, totalChunks } = args

    // Fetch all recipes
    const allRecipes = await ctx.runQuery(api.recipes.list, {})

    // Calculate chunk boundaries
    const chunkSize = Math.ceil(allRecipes.length / totalChunks)
    const startIdx = (chunkNumber - 1) * chunkSize
    const endIdx =
      chunkNumber === totalChunks ? allRecipes.length : startIdx + chunkSize
    const recipesToProcess = allRecipes.slice(startIdx, endIdx)

    console.log(
      `Processing chunk ${chunkNumber}/${totalChunks}: recipes ${startIdx + 1}-${endIdx} (${recipesToProcess.length} recipes)`,
    )

    const results: CategorizeResult = {
      updated: 0,
      skipped: 0,
      failed: 0,
      processed: recipesToProcess.length,
      chunkNumber,
      totalChunks,
    }

    for (const recipe of recipesToProcess) {
      try {
        const tags: string[] = []
        let imageUrl = recipe.imageUrl

        // Categorize by link
        if (!recipe.link || recipe.link === '') {
          // Personal/family recipe - no external link
          tags.push('home')
        } else if (isYouTubeLink(recipe.link)) {
          // YouTube video recipe - use video icon instead of thumbnail
          tags.push('video')
          imageUrl = undefined // Clear image so video icon shows
        }

        // Only update if we have tags to add
        if (tags.length > 0 || imageUrl !== recipe.imageUrl) {
          await ctx.runMutation(api.recipes.update, {
            id: recipe._id,
            link: recipe.link,
            name: recipe.name,
            cuisine: recipe.cuisine,
            ingredients: recipe.ingredients,
            mealTypes: recipe.mealTypes,
            notes: recipe.notes,
            description: recipe.description,
            imageUrl: imageUrl,
            tags: tags,
          })
          results.updated++
        } else {
          results.skipped++
        }
      } catch (error) {
        console.error(`Error processing recipe ${recipe._id}:`, error)
        results.failed++
      }

      // Rate limiting
      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(undefined)
        }, 200),
      )
    }

    return results
  },
})
