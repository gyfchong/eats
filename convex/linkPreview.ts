'use node'

import { action } from './_generated/server'
import { v } from 'convex/values'

export const fetchLinkPreview = action({
  args: {
    url: v.string(),
  },
  handler: async (_ctx, args) => {
    try {
      // Validate URL
      const parsedUrl = new URL(args.url)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return { title: null, description: null, imageUrl: null, siteName: null, error: 'Invalid protocol' }
      }

      // Fetch the page HTML with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(args.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)',
          Accept: 'text/html',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return { title: null, description: null, imageUrl: null, siteName: null, error: `HTTP ${response.status}` }
      }

      const html = await response.text()

      // Parse OG metadata using regex
      const getMetaContent = (property: string): string | null => {
        // Match og:property, twitter:property, or name="property"
        const patterns = [
          new RegExp(`<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
          new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${property}["']`, 'i'),
          new RegExp(`<meta[^>]+name=["']twitter:${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
          new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:${property}["']`, 'i'),
        ]
        for (const pattern of patterns) {
          const match = html.match(pattern)
          if (match?.[1]) return match[1]
        }
        return null
      }

      // Get title from og:title, or fall back to <title> tag
      let title = getMetaContent('title')
      if (!title) {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        title = titleMatch?.[1]?.trim() || null
      }

      // Get description from og:description or meta description
      let description = getMetaContent('description')
      if (!description) {
        const descPatterns = [
          /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
          /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i,
        ]
        for (const pattern of descPatterns) {
          const match = html.match(pattern)
          if (match?.[1]) {
            description = match[1]
            break
          }
        }
      }

      let imageUrl = getMetaContent('image')

      // Resolve relative image URLs
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = new URL(imageUrl, args.url).href
      }

      const siteName = getMetaContent('site_name')

      return { title, description, imageUrl, siteName, error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { title: null, description: null, imageUrl: null, siteName: null, error: message }
    }
  },
})
