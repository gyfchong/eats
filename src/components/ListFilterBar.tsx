import { Search, X } from 'lucide-react'
import { Input } from '~/components/ui/input'
import { Switch } from '~/components/ui/switch'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

interface ListFilterBarProps {
  // Filter values
  searchQuery: string
  favoritesOnly: boolean
  cuisine: string | undefined
  mealType: string | undefined
  suburb?: string | undefined // restaurants only

  // Options
  cuisineOptions: string[]
  mealTypeOptions: string[]
  suburbOptions?: string[] // restaurants only

  // Handlers
  onSearchChange: (value: string) => void
  onFavoritesOnlyChange: (value: boolean) => void
  onCuisineChange: (value: string | undefined) => void
  onMealTypeChange: (value: string | undefined) => void
  onSuburbChange?: (value: string | undefined) => void
  onReset: () => void

  // State
  hasActiveFilters: boolean
}

export function ListFilterBar({
  searchQuery,
  favoritesOnly,
  cuisine,
  mealType,
  suburb,
  cuisineOptions,
  mealTypeOptions,
  suburbOptions,
  onSearchChange,
  onFavoritesOnlyChange,
  onCuisineChange,
  onMealTypeChange,
  onSuburbChange,
  onReset,
  hasActiveFilters,
}: ListFilterBarProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Favorites toggle */}
        <div className="flex items-center gap-2">
          <Switch
            checked={favoritesOnly}
            onCheckedChange={onFavoritesOnlyChange}
          />
          <Label className="text-sm">Favorites only</Label>
        </div>

        {/* Cuisine select */}
        {cuisineOptions.length > 0 && (
          <Select
            value={cuisine ?? 'all'}
            onValueChange={(v) => onCuisineChange(v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Cuisine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cuisines</SelectItem>
              {cuisineOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Meal type select */}
        <Select
          value={mealType ?? 'all'}
          onValueChange={(v) => onMealTypeChange(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Meal type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All meal types</SelectItem>
            {mealTypeOptions.map((m) => (
              <SelectItem key={m} value={m} className="capitalize">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Suburb select (restaurants only) */}
        {suburbOptions && onSuburbChange && suburbOptions.length > 0 && (
          <Select
            value={suburb ?? 'all'}
            onValueChange={(v) => onSuburbChange(v === 'all' ? undefined : v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {suburbOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Reset button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground"
          >
            <X className="size-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
