import type { ReactNode } from 'react'
import type { AnyFieldApi } from '@tanstack/react-form'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { cn } from '~/lib/utils'

/* ─────────────────────────────────────────────────────────────────────────────
   FormField - Base wrapper with label and error display
─────────────────────────────────────────────────────────────────────────────── */

interface FormFieldProps {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  children: ReactNode
  className?: string
}

/**
 * Base form field wrapper providing consistent label and error styling.
 * Use with TanStack Form's field render prop pattern.
 */
export function FormField({
  label,
  htmlFor,
  required,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && ' *'}
      </Label>
      {children}
      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   TextField - Text input with FormField wrapper
─────────────────────────────────────────────────────────────────────────────── */

interface TextFieldProps {
  field: AnyFieldApi
  label: string
  placeholder?: string
  required?: boolean
  type?: 'text' | 'email' | 'url' | 'tel'
  className?: string
  onChange?: (value: string) => void
}

/**
 * Text input field integrated with TanStack Form.
 * Handles value binding, blur events, and error display.
 */
export function TextField({
  field,
  label,
  placeholder,
  required,
  type = 'text',
  className,
  onChange,
}: TextFieldProps) {
  const error = field.state.meta.errors.length > 0
    ? field.state.meta.errors[0]?.toString()
    : undefined

  return (
    <FormField
      label={label}
      htmlFor={field.name}
      required={required}
      error={error}
      className={className}
    >
      <Input
        id={field.name}
        type={type}
        value={field.state.value ?? ''}
        onChange={(e) => {
          field.handleChange(e.target.value)
          onChange?.(e.target.value)
        }}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </FormField>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   TextAreaField - Textarea with FormField wrapper
─────────────────────────────────────────────────────────────────────────────── */

interface TextAreaFieldProps {
  field: AnyFieldApi
  label: string
  placeholder?: string
  required?: boolean
  rows?: number
  className?: string
}

/**
 * Textarea field integrated with TanStack Form.
 * Handles value binding, blur events, and error display.
 */
export function TextAreaField({
  field,
  label,
  placeholder,
  required,
  rows = 3,
  className,
}: TextAreaFieldProps) {
  const error = field.state.meta.errors.length > 0
    ? field.state.meta.errors[0]?.toString()
    : undefined

  return (
    <FormField
      label={label}
      htmlFor={field.name}
      required={required}
      error={error}
      className={className}
    >
      <Textarea
        id={field.name}
        value={field.state.value ?? ''}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </FormField>
  )
}
