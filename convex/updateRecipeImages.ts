import { action } from './_generated/server'
import { v } from 'convex/values'

/**
 * Fetch and extract image URL from page meta tags
 */
async function extractImageFromMeta(url: string): Promise<string | null> {
  if (!url || !url.startsWith('http')) {
    return null
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) return null

    const html = await response.text()

    // Try to extract og:image meta tag
    const ogImageMatch = html.match(
      /<meta\s+property="og:image"\s+content="([^"]+)"/i,
    )
    if (ogImageMatch) return ogImageMatch[1]

    // Fallback: try twitter:image
    const twitterMatch = html.match(
      /<meta\s+name="twitter:image"\s+content="([^"]+)"/i,
    )
    if (twitterMatch) return twitterMatch[1]

    // Fallback: try standard image meta tag
    const imageMatch = html.match(
      /<meta\s+name="image"\s+content="([^"]+)"/i,
    )
    if (imageMatch) return imageMatch[1]

    return null
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error)
    return null
  }
}

/**
 * Update recipe images in a specific chunk
 */
export const updateRecipeImagesChunk = action({
  args: {
    chunkNumber: v.number(),
    totalChunks: v.number(),
  },
  handler: async (ctx: any, args) => {
    const { chunkNumber, totalChunks } = args

    // Fetch all recipes using Convex API
    const allRecipes = await ctx.runQuery('recipes:list' as any)

    // Calculate chunk boundaries
    const chunkSize = Math.ceil(allRecipes.length / totalChunks)
    const startIdx = (chunkNumber - 1) * chunkSize
    const endIdx =
      chunkNumber === totalChunks ? allRecipes.length : startIdx + chunkSize

    const recipesToProcess = allRecipes.slice(startIdx, endIdx)

    console.log(
      `Processing chunk ${chunkNumber}/${totalChunks}: recipes ${startIdx + 1}-${endIdx} (${endIdx - startIdx} recipes)`,
    )

    const results = {
      updated: 0,
      skipped: 0,
      failed: 0,
      processed: recipesToProcess.length,
      chunkNumber,
      totalChunks,
    }

    for (const recipe of recipesToProcess) {
      // Skip if no link
      if (!recipe.link) {
        results.skipped++
        continue
      }

      // Skip if already has image
      if (recipe.imageUrl) {
        results.skipped++
        continue
      }

      try {
        const imageUrl = await extractImageFromMeta(recipe.link)

        if (imageUrl) {
          // Update recipe with new image URL using mutation
          await ctx.runMutation('recipes:update' as any, {
            id: recipe._id,
            link: recipe.link,
            name: recipe.name,
            cuisine: recipe.cuisine,
            ingredients: recipe.ingredients,
            mealTypes: recipe.mealTypes,
            notes: recipe.notes,
            description: recipe.description,
            imageUrl: imageUrl,
          })
          results.updated++
        } else {
          results.skipped++
        }
      } catch (error) {
        console.error(`Error processing recipe ${recipe._id}:`, error)
        results.failed++
      }

      // Rate limiting: small delay to avoid overwhelming servers
      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(undefined)
        }, 500),
      )
    }

    return results
  },
})
