import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Post } from '@/lib/types'
import { hasOnSitePage, postHref } from '@/lib/postRouting'
import { SourceBadge } from './SourceBadge'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function PostCard({ post }: { post: Post }) {
  const onSite = hasOnSitePage(post)
  const content = (
    <>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <SourceBadge source={post.source} />
        {post.alsoOn.map((source) => (
          <SourceBadge key={source} source={source} />
        ))}
        <span>{formatDate(post.publishedAt)}</span>
        <span>{post.readingMinutes} min</span>
      </div>
      <h3 className="text-base font-semibold leading-snug">{post.title}</h3>
      <p className="text-sm text-muted-foreground">{post.excerpt}</p>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
        {post.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-border bg-panel-2 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
          >
            {tag}
          </span>
        ))}
        {onSite ? (
          <ArrowRight size={14} strokeWidth={2} className="ml-auto text-muted-2 group-hover:text-foreground" />
        ) : (
          <ArrowUpRight size={14} strokeWidth={2} className="ml-auto text-muted-2 group-hover:text-foreground" />
        )}
      </div>
    </>
  )

  const cardClasses =
    'group flex flex-col gap-2.5 rounded-xl border border-border bg-panel p-4.5 transition hover:-translate-y-0.5 hover:border-border-strong'

  if (onSite) {
    return (
      <Link href={postHref(post)} className={cardClasses}>
        {content}
      </Link>
    )
  }

  return (
    <a href={post.originalUrl} target="_blank" rel="noopener noreferrer" className={cardClasses}>
      {content}
    </a>
  )
}
