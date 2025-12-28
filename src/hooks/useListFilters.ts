import { useState, useCallback, useMemo } from 'react'

export interface ListFilters {
  favoritesOnly: boolean
  cuisine: string | undefined
  mealType: string | undefined
  searchQuery: string
}

export interface RestaurantFilters extends ListFilters {
  suburb: string | undefined
}

export function useListFilters<T extends ListFilters>(initialFilters: T) {
  const [filters, setFilters] = useState<T>(initialFilters)

  const updateFilter = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const hasActiveFilters = useMemo(() => {
    return (
      filters.favoritesOnly ||
      !!filters.cuisine ||
      !!filters.mealType ||
      !!filters.searchQuery ||
      ('suburb' in filters && !!(filters as RestaurantFilters).suburb)
    )
  }, [filters])

  return {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
  }
}
