'use client'

import { useState } from 'react'

const VISIBLE_LIMIT = 5

export function TagFilter({
  tags,
  value,
  onChange,
}: {
  tags: string[]
  value: string
  onChange: (value: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const visibleTags = expanded ? tags : tags.slice(0, VISIBLE_LIMIT)
  const hiddenCount = tags.length - visibleTags.length

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Tag</span>
      <button
        type="button"
        onClick={() => onChange('all')}
        className={
          value === 'all'
            ? 'rounded-full border border-primary bg-primary px-3 py-1 text-sm text-primary-foreground'
            : 'rounded-full border border-border bg-panel px-3 py-1 text-sm text-muted-foreground hover:text-foreground'
        }
      >
        All
      </button>
      {visibleTags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onChange(tag)}
          className={
            value === tag
              ? 'rounded-full border border-primary bg-primary px-3 py-1 text-sm text-primary-foreground'
              : 'rounded-full border border-border bg-panel px-3 py-1 text-sm text-muted-foreground hover:text-foreground'
          }
        >
          {tag}
        </button>
      ))}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="rounded-full border border-dashed border-border px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
        >
          +{hiddenCount} more
        </button>
      )}
      {expanded && tags.length > VISIBLE_LIMIT && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="rounded-full border border-dashed border-border px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
        >
          Show less
        </button>
      )}
    </div>
  )
}
