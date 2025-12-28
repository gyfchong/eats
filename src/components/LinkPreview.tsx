import { ExternalLink, AlertCircle, RefreshCw, Image as ImageIcon } from 'lucide-react'
import { Skeleton } from '~/components/ui/skeleton'
import { Button } from '~/components/ui/button'
import type { LinkPreviewData } from '~/hooks/useLinkPreview'

interface LinkPreviewProps {
  preview: LinkPreviewData | null
  isLoading: boolean
  error: string | null
  onRetry?: () => void
  url?: string
}

export function LinkPreview({ preview, isLoading, error, onRetry, url }: LinkPreviewProps) {
  // Loading state
  if (isLoading) {
    return <LinkPreviewSkeleton />
  }

  // Error state
  if (error) {
    return (
      <div className="border border-border/50 rounded-lg p-4 bg-muted/30">
        <div className="flex items-center gap-3 text-muted-foreground">
          <AlertCircle className="size-5 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm">Unable to load preview</p>
            <p className="text-xs text-muted-foreground/70 truncate">{error}</p>
          </div>
          {onRetry && (
            <Button size="sm" variant="ghost" onClick={onRetry}>
              <RefreshCw className="size-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  // No preview data
  if (!preview) {
    return null
  }

  // Success state with preview
  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-card">
      <div className="flex gap-4">
        {/* Image */}
        {preview.imageUrl ? (
          <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32">
            <img
              src={preview.imageUrl}
              alt={preview.title || 'Link preview'}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Hide broken images
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        ) : (
          <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-muted/50 flex items-center justify-center">
            <ImageIcon className="size-8 text-muted-foreground/40" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 min-w-0">
          {preview.siteName && (
            <p className="text-xs text-muted-foreground mb-1 truncate">{preview.siteName}</p>
          )}
          {preview.title && (
            <h3 className="font-medium text-sm sm:text-base line-clamp-2 mb-1">{preview.title}</h3>
          )}
          {preview.description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {preview.description}
            </p>
          )}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
            >
              <ExternalLink className="size-3" />
              <span className="truncate max-w-[200px]">{new URL(url).hostname}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function LinkPreviewSkeleton() {
  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-card">
      <div className="flex gap-4">
        <Skeleton className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-none" />
        <div className="flex-1 p-3 sm:p-4 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  )
}

export { LinkPreviewSkeleton }
