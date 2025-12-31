import type { ReactNode } from 'react'
import { Heart, ExternalLink, Edit, Trash2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

/* ─────────────────────────────────────────────────────────────────────────────
   ListItemCard - Base card container with consistent styling
─────────────────────────────────────────────────────────────────────────────── */

interface ListItemCardProps {
  children: ReactNode
  className?: string
}

/**
 * Base container for list items with consistent card styling.
 * Provides hover effects and responsive padding.
 */
export function ListItemCard({ children, className }: ListItemCardProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border/50 rounded-xl overflow-hidden card-hover',
        className,
      )}
    >
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   ListItemHeader - Title, external link, and favorite button
─────────────────────────────────────────────────────────────────────────────── */

interface ListItemHeaderProps {
  title: string
  href: string
  subtitle?: ReactNode
  isFavorite?: boolean
  onToggleFavorite?: () => void
  children?: ReactNode
}

/**
 * Header section with external link, favorite toggle, and optional subtitle.
 */
export function ListItemHeader({
  title,
  href,
  subtitle,
  isFavorite,
  onToggleFavorite,
  children,
}: ListItemHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-base sm:text-lg hover:text-primary transition-colors inline-flex items-center gap-2 group"
        >
          <span className="truncate">{title}</span>
          <ExternalLink className="size-3.5 sm:size-4 text-muted-foreground group-hover:text-primary shrink-0" />
        </a>
        {subtitle}
        {children}
      </div>
      {onToggleFavorite && (
        <Button
          size="icon"
          variant="ghost"
          className="shrink-0 -mr-2 -mt-1"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={cn(
              'size-5 transition-colors',
              isFavorite
                ? 'fill-red-500 text-red-500'
                : 'text-muted-foreground/40 hover:text-red-400',
            )}
          />
        </Button>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   ListItemActions - Edit, delete, and optional view details link
─────────────────────────────────────────────────────────────────────────────── */

interface ListItemActionsProps {
  onEdit: () => void
  onDelete: () => void
  editLabel?: string
  deleteLabel?: string
  children?: ReactNode
}

/**
 * Action buttons section with edit, delete, and optional custom actions.
 */
export function ListItemActions({
  onEdit,
  onDelete,
  editLabel = 'Edit',
  deleteLabel,
  children,
}: ListItemActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1 sm:pt-2">
      {children}
      <div className="flex gap-2 sm:ml-auto">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 sm:flex-initial"
          onClick={onEdit}
        >
          <Edit className="size-4" />
          <span className="sm:inline">{editLabel}</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
          aria-label={deleteLabel || 'Delete'}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   ListItemImage - Optional image section for cards with thumbnails
─────────────────────────────────────────────────────────────────────────────── */

interface ListItemImageProps {
  src?: string
  alt: string
  fallback?: ReactNode
  onError?: () => void
}

/**
 * Image section for list items with fallback support.
 */
export function ListItemImage({
  src,
  alt,
  fallback,
  onError,
}: ListItemImageProps) {
  if (!src) {
    return (
      <div className="shrink-0 w-24 sm:w-36 bg-muted/30 flex items-center justify-center aspect-square">
        {fallback}
      </div>
    )
  }

  return (
    <div className="shrink-0 w-24 sm:w-36">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover aspect-square"
        onError={onError}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   ListItemContent - Content wrapper with consistent spacing
─────────────────────────────────────────────────────────────────────────────── */

interface ListItemContentProps {
  children: ReactNode
  className?: string
}

/**
 * Content section wrapper with consistent padding and spacing.
 */
export function ListItemContent({ children, className }: ListItemContentProps) {
  return (
    <div className={cn('flex-1 p-4 sm:p-6 min-w-0', className)}>
      <div className="space-y-3 sm:space-y-4">{children}</div>
    </div>
  )
}
