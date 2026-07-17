'use client'

export function TagFilter({
  tags,
  value,
  onChange,
}: {
  tags: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Tag</span>
      <button
        type="button"
        onClick={() => onChange('all')}
        className={
          value === 'all'
            ? 'rounded-full border border-primary bg-primary px-3 py-1 text-sm text-primary-foreground'
            : 'rounded-full border border-border bg-panel px-3 py-1 text-sm text-muted hover:text-foreground'
        }
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onChange(tag)}
          className={
            value === tag
              ? 'rounded-full border border-primary bg-primary px-3 py-1 text-sm text-primary-foreground'
              : 'rounded-full border border-border bg-panel px-3 py-1 text-sm text-muted hover:text-foreground'
          }
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
