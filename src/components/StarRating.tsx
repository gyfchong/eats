import * as React from 'react'
import { Star } from 'lucide-react'
import { cn } from '~/lib/utils'

export interface StarRatingProps {
  /**
   * Current rating value (0-5)
   * 0 means no rating
   */
  value?: number
  /**
   * Callback when rating changes (for input mode)
   */
  onChange?: (rating: number | undefined) => void
  /**
   * Callback on blur
   */
  onBlur?: () => void
  /**
   * Whether the component is interactive (clickable)
   * Defaults to false (display mode)
   */
  interactive?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Size of stars
   */
  size?: 'sm' | 'md' | 'lg'
}

export function StarRating({
  value = 0,
  onChange,
  onBlur,
  interactive = false,
  className,
  size = 'md',
}: StarRatingProps) {
  const [hoveredStar, setHoveredStar] = React.useState<number | null>(null)

  // Clamp value between 0 and 5
  const clampedValue = Math.max(0, Math.min(5, value || 0))

  const handleStarClick = (rating: number) => {
    if (interactive && onChange) {
      // Toggle: if clicking same rating, clear it
      onChange(rating === clampedValue ? undefined : rating)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent, rating: number) => {
    if (interactive && onChange) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onChange(rating === clampedValue ? undefined : rating)
      }
    }
  }

  const getDisplayValue = () => {
    if (interactive && hoveredStar !== null) {
      return hoveredStar
    }
    return clampedValue
  }

  const displayValue = getDisplayValue()

  const sizeClasses = {
    sm: 'size-3.5',
    md: 'size-4',
    lg: 'size-5',
  }

  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`${clampedValue} out of 5 stars`}
      onMouseLeave={() => interactive && setHoveredStar(null)}
    >
      {[1, 2, 3, 4, 5].map((rating) => {
        const isFilled = rating <= displayValue
        const Element = interactive ? 'button' : 'div'

        return (
          <Element
            key={rating}
            type={interactive ? 'button' : undefined}
            role={interactive ? 'radio' : undefined}
            aria-checked={interactive ? rating === clampedValue : undefined}
            aria-label={interactive ? `${rating} star${rating > 1 ? 's' : ''}` : undefined}
            tabIndex={interactive ? 0 : undefined}
            disabled={!interactive}
            className={cn(
              'transition-all outline-none',
              interactive && 'cursor-pointer hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring rounded-sm p-0.5',
              !interactive && 'pointer-events-none',
            )}
            onClick={() => handleStarClick(rating)}
            onKeyDown={(e) => handleKeyDown(e, rating)}
            onMouseEnter={() => interactive && setHoveredStar(rating)}
            onBlur={onBlur}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors',
                isFilled
                  ? 'fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500'
                  : 'fill-none text-zinc-300 dark:text-zinc-600',
              )}
              strokeWidth={1.5}
            />
          </Element>
        )
      })}
    </div>
  )
}
