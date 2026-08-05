import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { getAllPosts } from '@/lib/aggregate'
import { hasOnSitePage } from '@/lib/postRouting'
import { sanitizePostContent } from '@/lib/postContent'
import { SourceBadge } from '@/components/blog/SourceBadge'
import { site } from '@/config/site'
import { HashnodeIcon, MediumIcon } from '@/components/icons/BrandIcons'
import type { Post, PostSource } from '@/lib/types'

export const dynamic = 'force-static'
export const dynamicParams = false

interface PostPageParams {
  params: Promise<{ slug: string }>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const SOURCE_ICONS: Record<PostSource, typeof MediumIcon> = {
  hashnode: HashnodeIcon,
  medium: MediumIcon,
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.filter(hasOnSitePage).map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PostPageParams): Promise<Metadata> {
  const { slug } = await params
  const posts = await getAllPosts()
  const post = posts.find((candidate) => candidate.slug === slug)

  if (!post || !hasOnSitePage(post)) return {}

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: post.originalUrl },
    ...(post.coverImage ? { openGraph: { images: [post.coverImage] } } : {}),
  }
}

export default async function PostPage({ params }: PostPageParams) {
  const { slug } = await params
  const posts = await getAllPosts()
  const post = posts.find((candidate) => candidate.slug === slug)

  if (!post || !hasOnSitePage(post)) {
    notFound()
  }

  return (
    <article className="flex flex-col gap-6">
      <Link
        href="/blog"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} strokeWidth={2} />
        All posts
      </Link>

      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <SourceBadge source={post.source} />
          {post.alsoOn.map((source) => (
            <SourceBadge key={source} source={source} />
          ))}
          <span>{formatDate(post.publishedAt)}</span>
          <span>{post.readingMinutes} min read</span>
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
          {post.excerpt && (
            <p className="max-w-[65ch] text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
          )}
        </div>
      </header>

      {post.coverImage && (
        <div className="overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt=""
            loading="lazy"
            className="max-h-[420px] w-full object-cover"
          />
        </div>
      )}

      <div
        className="prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizePostContent(post.content ?? '') }}
      />

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-border bg-panel-2 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <footer className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-5">
        <OriginalLink post={post} />
        {post.alsoOn.map((source) => {
          const AlsoOnIcon = SOURCE_ICONS[source]
          return (
            <a
              key={source}
              href={site.socials[source]}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <AlsoOnIcon className="size-3.5" />
              Also on {source}
            </a>
          )
        })}
      </footer>
    </article>
  )
}

function OriginalLink({ post }: { post: Post }) {
  const Icon = SOURCE_ICONS[post.source]
  return (
    <a
      href={post.originalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent"
    >
      <Icon className="size-3.5" />
      Read the original on {post.source}
      <ExternalLink size={13} strokeWidth={2} />
    </a>
  )
}
