import type { Post } from '@/lib/types'
import { SourceBadge } from './SourceBadge'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

export function PostCard({ post }: { post: Post }) {
  return (
    <a
      href={post.originalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col gap-2.5 rounded-xl border border-border bg-panel p-4.5 transition hover:-translate-y-0.5 hover:border-border-strong"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <SourceBadge source={post.source} />
        {post.alsoOn.map((source) => (
          <SourceBadge key={source} source={source} />
        ))}
        <span>{formatDate(post.publishedAt)}</span>
        <span>{readingTime(post.content)} min</span>
      </div>
      <h3 className="text-base font-semibold leading-snug">{post.title}</h3>
      <p className="text-sm text-muted-foreground">{post.excerpt}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {post.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-border bg-panel-2 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  )
}
