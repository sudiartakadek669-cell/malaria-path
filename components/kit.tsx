'use client'

import { useEffect, useId, useRef, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function GlassCard({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('glass rounded-2xl p-4 md:p-6', className)}>{children}</section>
}

export function SectionTitle({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-md shadow-sky-500/25">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-base font-bold text-foreground text-balance md:text-lg">{title}</h2>
          {description && <p className="text-sm text-muted-foreground text-pretty">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

export const inputClass =
  'h-11 w-full rounded-xl border border-input bg-white/80 px-3.5 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground/70 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-sky-50/60 disabled:text-muted-foreground read-only:bg-sky-50/70 read-only:text-sky-900'

export function Field({
  label,
  children,
  hint,
  error,
  className,
  htmlFor,
}: {
  label: string
  children: ReactNode
  hint?: string
  error?: string
  className?: string
  htmlFor?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-wide text-sky-900/70">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export function SelectInput({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  required,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  options: readonly string[] | { value: string; label: string }[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
}) {
  return (
    <select
      id={id}
      value={value}
      required={required}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputClass, 'appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 fill=%27none%27 stroke=%27%230284c7%27 stroke-width=%272%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E")] bg-[right_0.85rem_center] bg-no-repeat pr-10')}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) =>
        typeof opt === 'string' ? (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ) : (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ),
      )}
    </select>
  )
}

export function ChoiceGroup({
  value,
  onChange,
  options,
  label,
}: {
  value: string
  onChange: (value: string) => void
  options: readonly string[]
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt)}
            className={cn(
              'h-11 flex-1 rounded-xl border px-3 text-sm font-medium transition',
              active
                ? 'border-sky-500 bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'border-input bg-white/80 text-sky-900/80 hover:border-sky-300 hover:bg-sky-50',
            )}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/30 hover:from-sky-500 hover:to-sky-700',
  secondary: 'border border-sky-200 bg-white/80 text-sky-700 hover:bg-sky-50',
  ghost: 'text-sky-700 hover:bg-sky-50',
  danger: 'bg-destructive text-white shadow-md shadow-red-500/25 hover:bg-red-700',
  success: 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
        buttonVariants[variant],
        className,
      )}
    />
  )
}

export function IconAction({
  label,
  tone = 'sky',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  tone?: 'sky' | 'amber' | 'red' | 'emerald'
}) {
  const tones = {
    sky: 'text-sky-600 hover:bg-sky-100',
    amber: 'text-amber-600 hover:bg-amber-50',
    red: 'text-red-600 hover:bg-red-50',
    emerald: 'text-emerald-600 hover:bg-emerald-50',
  }
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 [&_svg]:size-4',
        tones[tone],
      )}
    />
  )
}

export function Badge({
  children,
  tone = 'sky',
}: {
  children: ReactNode
  tone?: 'sky' | 'red' | 'emerald' | 'amber' | 'slate'
}) {
  const tones = {
    sky: 'bg-sky-100 text-sky-700 ring-sky-200',
    red: 'bg-red-50 text-red-700 ring-red-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', tones[tone])}>
      {children}
    </span>
  )
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-sky-950/30 backdrop-blur-sm animate-in fade-in" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-white bg-white/95 shadow-2xl shadow-sky-900/20 outline-none backdrop-blur-xl animate-in slide-in-from-bottom-4 sm:rounded-3xl',
          sizes[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white px-5 py-4">
          <div>
            <h3 id={titleId} className="text-base font-bold text-foreground">
              {title}
            </h3>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <IconAction label="Tutup" onClick={onClose}>
            <X />
          </IconAction>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}

export function StatCard({
  label,
  value,
  icon,
  tone = 'sky',
  sub,
}: {
  label: string
  value: ReactNode
  icon?: ReactNode
  tone?: 'sky' | 'red' | 'emerald' | 'amber'
  sub?: string
}) {
  const tones = {
    sky: 'from-sky-400 to-sky-600 shadow-sky-500/25',
    red: 'from-rose-400 to-red-600 shadow-red-500/25',
    emerald: 'from-emerald-400 to-emerald-600 shadow-emerald-500/25',
    amber: 'from-amber-400 to-orange-500 shadow-amber-500/25',
  }
  return (
    <div className="glass flex items-center gap-3 rounded-2xl p-4">
      {icon && (
        <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md [&_svg]:size-5', tones[tone])}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}

export function DetailGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-sky-100 bg-sky-50/50 px-3.5 py-2.5">
          <dt className="text-xs font-semibold uppercase tracking-wide text-sky-900/60">{item.label}</dt>
          <dd className="mt-0.5 text-sm font-medium text-foreground break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function FormActions({
  onCancel,
  submitLabel,
  icon,
}: {
  onCancel?: () => void
  submitLabel: string
  icon?: ReactNode
}) {
  return (
    <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      {onCancel && (
        <Button variant="secondary" onClick={onCancel}>
          Batal
        </Button>
      )}
      <Button type="submit" className="h-11 px-6">
        {icon}
        {submitLabel}
      </Button>
    </div>
  )
}
