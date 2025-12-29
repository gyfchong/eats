import { action } from './_generated/server'
import { v } from 'convex/values'

/**
 * Fetch and extract logo/favicon URL from a website
 */
async function extractLogoFromMeta(url: string): Promise<string | null> {
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

    // Try to extract og:logo meta tag
    const ogLogoMatch = html.match(
      /<meta\s+property="og:logo"\s+content="([^"]+)"/i,
    )
    if (ogLogoMatch) return ogLogoMatch[1]

    // Try apple-touch-icon
    const appleTouchMatch = html.match(
      /<link\s+rel="apple-touch-icon"\s+href="([^"]+)"/i,
    )
    if (appleTouchMatch) return appleTouchMatch[1]

    // Try favicon
    const faviconMatch = html.match(/<link\s+rel="icon"\s+href="([^"]+)"/i)
    if (faviconMatch) return faviconMatch[1]

    // Try shortcut icon
    const shortcutMatch = html.match(
      /<link\s+rel="shortcut icon"\s+href="([^"]+)"/i,
    )
    if (shortcutMatch) return shortcutMatch[1]

    return null
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error)
    return null
  }
}

/**
 * Update recipe images with logos for those that don't have images
 */
export const updateRecipeLogosChunk = action({
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
      `Processing chunk ${chunkNumber}/${totalChunks}: recipes ${startIdx + 1}-${endIdx} (${endIdx - startIdx} recipes for logos)`,
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
        const logoUrl = await extractLogoFromMeta(recipe.link)

        if (logoUrl) {
          // Update recipe with logo URL using mutation
          await ctx.runMutation('recipes:update' as any, {
            id: recipe._id,
            link: recipe.link,
            name: recipe.name,
            cuisine: recipe.cuisine,
            ingredients: recipe.ingredients,
            mealTypes: recipe.mealTypes,
            notes: recipe.notes,
            description: recipe.description,
            imageUrl: logoUrl,
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
