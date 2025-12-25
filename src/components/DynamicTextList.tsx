import type { FieldApi } from '@tanstack/react-form'
import { useStore } from '@tanstack/react-store'
import { Plus, X } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

interface DynamicTextListProps {
  field: FieldApi<any, any, any, any, string[]>
  label: string
  placeholder?: string
}

export function DynamicTextList({ field, label, placeholder = 'Enter item' }: DynamicTextListProps) {
  const items = useStore(field.store, (state) => state.value || [])

  const addItem = () => {
    field.handleChange([...items, ''])
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    field.handleChange(newItems)
  }

  const updateItem = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index] = value
    field.handleChange(newItems)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xl font-bold">{label}</Label>
        <Button type="button" size="sm" variant="outline" onClick={addItem}>
          <Plus className="size-4 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items yet. Click "Add" to create one.</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                placeholder={placeholder}
                onChange={(e) => updateItem(index, e.target.value)}
                onBlur={field.handleBlur}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={() => removeItem(index)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {useStore(field.store, (state) => state.meta.isTouched && state.meta.errors.length > 0) && (
        <div className="space-y-1">
          {useStore(field.store, (state) => state.meta.errors).map((error) => (
            <div key={typeof error === 'string' ? error : error.toString()} className="text-sm text-red-500 font-bold">
              {typeof error === 'string' ? error : error.toString()}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
