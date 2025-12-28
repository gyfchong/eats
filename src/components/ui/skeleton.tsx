import { useRef, useEffect } from 'react'
import { cn } from '~/lib/utils'
import { usePrefersReducedMotion } from '~/hooks/useAnimationFrame'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circular' | 'rectangular'
}

// Shared animation state across all skeleton instances
const shimmerState = {
  frameId: null as number | null,
  elements: new Set<HTMLDivElement>(),
  isRunning: false,
  startTime: 0,
}

const SHIMMER_DURATION = 1800 // ms

function startShimmerLoop() {
  if (shimmerState.isRunning) return
  shimmerState.isRunning = true
  shimmerState.startTime = performance.now()

  const animate = (now: DOMHighResTimeStamp) => {
    if (!shimmerState.isRunning) return

    const elapsed = now - shimmerState.startTime
    // Linear progress for smooth continuous motion
    const rawProgress = (elapsed % SHIMMER_DURATION) / SHIMMER_DURATION
    // Transform to -100% to 100% range
    const translateX = rawProgress * 200 - 100

    // Batch DOM writes in a single frame
    shimmerState.elements.forEach((el) => {
      el.style.setProperty('--shimmer-x', `${translateX}%`)
    })

    shimmerState.frameId = requestAnimationFrame(animate)
  }

  shimmerState.frameId = requestAnimationFrame(animate)
}

function stopShimmerLoop() {
  if (shimmerState.frameId !== null) {
    cancelAnimationFrame(shimmerState.frameId)
    shimmerState.frameId = null
  }
  shimmerState.isRunning = false
}

function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const element = ref.current
    if (!element || prefersReducedMotion) return

    // Register element with shared animation loop
    shimmerState.elements.add(element)

    if (shimmerState.elements.size === 1) {
      startShimmerLoop()
    }

    return () => {
      shimmerState.elements.delete(element)

      if (shimmerState.elements.size === 0) {
        stopShimmerLoop()
      }
    }
  }, [prefersReducedMotion])

  return (
    <div
      ref={ref}
      className={cn(
        'skeleton-shimmer relative overflow-hidden isolate',
        'bg-gradient-to-br from-muted/60 via-muted/40 to-muted/60',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'rounded-md h-4',
        variant === 'rectangular' && 'rounded-xl',
        variant === 'default' && 'rounded-lg',
        // Fallback for reduced motion
        prefersReducedMotion && 'animate-pulse',
        className,
      )}
      {...props}
    />
  )
}

function SkeletonText({
  lines = 1,
  className,
  lastLineWidth = '60%',
}: {
  lines?: number
  className?: string
  lastLineWidth?: string
}) {
  return (
    <div className={cn('space-y-2.5', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className="h-4"
          style={{
            width: i === lines - 1 && lines > 1 ? lastLineWidth : '100%',
          }}
        />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonText }
