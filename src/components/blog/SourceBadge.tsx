import type { PostSource } from '@/lib/types'

const LABELS: Record<PostSource, string> = {
  devto: 'dev.to',
  hashnode: 'hashnode',
  medium: 'medium',
}

export function SourceBadge({ source }: { source: PostSource }) {
  return (
    <span className="rounded-md bg-panel-2 px-1.5 py-0.5 font-mono text-[10.5px] font-semibold lowercase text-foreground">
      {LABELS[source]}
    </span>
  )
}
