import { useState } from 'react'
import { Check, Image as ImageIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import type { Id } from '~convex/_generated/dataModel'
import { cn } from '~/lib/utils'

interface DayOption {
  value: number
  label: string
}

interface RecipeRowProps {
  recipe: {
    _id: Id<'recipes'>
    name?: string
    cuisine?: string
    imageUrl?: string
    link: string
  } | null
  assignedDay: number | undefined
  dayOptions: DayOption[]
  onDayChange: (day: number | undefined) => void
  onMarkAsMade: () => void
  index?: number
}

/**
 * Row component for displaying a recipe in meal plan detail view.
 * Includes day assignment and mark-as-made functionality.
 */
export function RecipeRow({
  recipe,
  assignedDay,
  dayOptions,
  onDayChange,
  onMarkAsMade,
  index = 0,
}: RecipeRowProps) {
  const [imageError, setImageError] = useState(false)
  const [justMarked, setJustMarked] = useState(false)

  if (!recipe) {
    return (
      <div className="p-4 bg-muted/30 rounded-xl text-muted-foreground">
        Recipe not found
      </div>
    )
  }

  const handleMarkAsMade = async () => {
    await onMarkAsMade()
    setJustMarked(true)
    setTimeout(() => setJustMarked(false), 2000)
  }

  return (
    <div
      className="flex items-center gap-4 p-3 bg-card border border-border/50 rounded-xl animate-fade-up"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Image */}
      <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted/30">
        {recipe.imageUrl && !imageError ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.name || 'Recipe'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <a
          href={recipe.link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:text-primary transition-colors line-clamp-1"
        >
          {recipe.name || 'Untitled Recipe'}
        </a>
        {recipe.cuisine && (
          <p className="text-sm text-muted-foreground">{recipe.cuisine}</p>
        )}
      </div>

      {/* Day Selector */}
      <Select
        value={assignedDay?.toString() ?? 'unassigned'}
        onValueChange={(v) =>
          onDayChange(v === 'unassigned' ? undefined : parseInt(v))
        }
      >
        <SelectTrigger className="w-[140px] sm:w-[180px]">
          <SelectValue placeholder="Assign day" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {dayOptions.map((day) => (
            <SelectItem key={day.value} value={day.value.toString()}>
              {day.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Mark as Made Button */}
      <Button
        size="sm"
        variant={justMarked ? 'default' : 'outline'}
        onClick={handleMarkAsMade}
        className={cn(
          'shrink-0 transition-all',
          justMarked && 'bg-green-600 hover:bg-green-600 border-green-600',
        )}
      >
        <Check className="w-4 h-4" />
        <span className="hidden sm:inline ml-1">
          {justMarked ? 'Made!' : 'Made'}
        </span>
      </Button>
    </div>
  )
}
