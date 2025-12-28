import { useEffect, useRef, useCallback, useSyncExternalStore } from 'react'

/**
 * Shared animation frame loop using modern RAF patterns.
 * All subscribers share a single animation loop for optimal performance.
 */

type AnimationCallback = (time: DOMHighResTimeStamp) => void

// Singleton animation loop manager
class AnimationLoop {
  private subscribers = new Set<AnimationCallback>()
  private frameId: number | null = null
  private isRunning = false

  subscribe(callback: AnimationCallback): () => void {
    this.subscribers.add(callback)
    this.start()

    return () => {
      this.subscribers.delete(callback)
      if (this.subscribers.size === 0) {
        this.stop()
      }
    }
  }

  private start() {
    if (this.isRunning) return
    this.isRunning = true
    this.loop()
  }

  private stop() {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId)
      this.frameId = null
    }
    this.isRunning = false
  }

  private loop = () => {
    if (!this.isRunning) return

    this.frameId = requestAnimationFrame((time) => {
      // Use a single timestamp for all subscribers (synchronized animations)
      this.subscribers.forEach((callback) => callback(time))
      this.loop()
    })
  }
}

// Singleton instance
const animationLoop = new AnimationLoop()

/**
 * Hook to subscribe to the shared animation frame loop.
 * Uses requestAnimationFrame for smooth 60fps+ animations.
 */
export function useAnimationFrame(callback: AnimationCallback) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const stableCallback: AnimationCallback = (time) => {
      callbackRef.current(time)
    }

    return animationLoop.subscribe(stableCallback)
  }, [])
}

/**
 * Shared shimmer animation state using useSyncExternalStore.
 * Provides a synchronized progress value (0-1) for all shimmer effects.
 */

const SHIMMER_DURATION = 1800 // ms for one complete cycle

class ShimmerStore {
  private progress = 0
  private startTime: DOMHighResTimeStamp | null = null
  private listeners = new Set<() => void>()
  private unsubscribe: (() => void) | null = null

  getProgress = (): number => {
    return this.progress
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)

    // Start animation loop when first subscriber joins
    if (this.listeners.size === 1) {
      this.startTime = null
      this.unsubscribe = animationLoop.subscribe(this.onFrame)
    }

    return () => {
      this.listeners.delete(listener)

      // Stop animation loop when last subscriber leaves
      if (this.listeners.size === 0 && this.unsubscribe) {
        this.unsubscribe()
        this.unsubscribe = null
      }
    }
  }

  private onFrame = (time: DOMHighResTimeStamp) => {
    if (this.startTime === null) {
      this.startTime = time
    }

    const elapsed = time - this.startTime
    // Smooth easing: ease-in-out cubic for more natural feel
    const rawProgress = (elapsed % SHIMMER_DURATION) / SHIMMER_DURATION

    // Apply easing for smoother visual effect
    this.progress = this.easeInOutCubic(rawProgress)

    // Notify all listeners
    this.listeners.forEach((listener) => listener())
  }

  // Cubic ease-in-out for smooth acceleration/deceleration
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }
}

const shimmerStore = new ShimmerStore()

/**
 * Hook that returns the current shimmer animation progress (0-1).
 * All components using this hook will animate in perfect sync.
 */
export function useShimmerProgress(): number {
  return useSyncExternalStore(shimmerStore.subscribe, shimmerStore.getProgress)
}

/**
 * Hook that applies shimmer animation to an element via CSS custom properties.
 * Uses RAF for timing but CSS transforms for GPU-accelerated rendering.
 */
export function useShimmerRef<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useAnimationFrame((time) => {
    if (!ref.current) return

    // Calculate progress within the cycle
    const progress = ((time % SHIMMER_DURATION) / SHIMMER_DURATION) * 200 - 100

    // Use CSS custom property for GPU-accelerated transform
    ref.current.style.setProperty('--shimmer-x', `${progress}%`)
  })

  return ref
}

/**
 * Prefers-reduced-motion aware animation hook.
 * Returns true if animations should be reduced/disabled.
 */
export function usePrefersReducedMotion(): boolean {
  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const subscribe = useCallback((callback: () => void) => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', callback)
    return () => mediaQuery.removeEventListener('change', callback)
  }, [])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
