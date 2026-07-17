'use client'

import type { PostSource } from '@/lib/types'

const OPTIONS: { value: PostSource | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'devto', label: 'dev.to' },
  { value: 'hashnode', label: 'Hashnode' },
  { value: 'medium', label: 'Medium' },
]

export function SourceFilter({
  value,
  onChange,
}: {
  value: PostSource | 'all'
  onChange: (value: PostSource | 'all') => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Source</span>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={
            value === opt.value
              ? 'rounded-full border border-primary bg-primary px-3 py-1 text-sm text-primary-foreground'
              : 'rounded-full border border-border bg-panel px-3 py-1 text-sm text-muted-foreground hover:text-foreground'
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
