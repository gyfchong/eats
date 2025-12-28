import { useState, useEffect, useCallback, useRef } from 'react'
import { useAction } from 'convex/react'
import { api } from '~convex/_generated/api'

export interface LinkPreviewData {
  title: string | null
  description: string | null
  imageUrl: string | null
  siteName: string | null
}

export interface UseLinkPreviewResult {
  preview: LinkPreviewData | null
  isLoading: boolean
  error: string | null
  refetch: () => void
}

const DEBOUNCE_MS = 500

export function useLinkPreview(url: string): UseLinkPreviewResult {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLinkPreview = useAction(api.linkPreview.fetchLinkPreview)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastFetchedUrlRef = useRef<string>('')

  const fetchPreview = useCallback(
    async (targetUrl: string) => {
      // Skip if we already fetched this URL
      if (targetUrl === lastFetchedUrlRef.current && preview) {
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchLinkPreview({ url: targetUrl })

        if (result.error) {
          setError(result.error)
          setPreview(null)
        } else {
          setPreview({
            title: result.title,
            description: result.description,
            imageUrl: result.imageUrl,
            siteName: result.siteName,
          })
          lastFetchedUrlRef.current = targetUrl
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch preview')
        setPreview(null)
      } finally {
        setIsLoading(false)
      }
    },
    [fetchLinkPreview, preview],
  )

  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Validate URL before fetching
    if (!url.trim()) {
      setPreview(null)
      setError(null)
      setIsLoading(false)
      lastFetchedUrlRef.current = ''
      return
    }

    try {
      new URL(url) // Validate URL format
    } catch {
      setPreview(null)
      setError(null)
      setIsLoading(false)
      return
    }

    // Debounce the fetch
    setIsLoading(true)
    debounceTimerRef.current = setTimeout(() => {
      fetchPreview(url)
    }, DEBOUNCE_MS)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [url, fetchPreview])

  const refetch = useCallback(() => {
    if (url.trim()) {
      try {
        new URL(url)
        lastFetchedUrlRef.current = '' // Reset to force refetch
        fetchPreview(url)
      } catch {
        // Invalid URL, do nothing
      }
    }
  }, [url, fetchPreview])

  return { preview, isLoading, error, refetch }
}
