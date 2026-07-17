import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/aggregate'
import { PostBody } from '@/components/blog/PostBody'
import { SourceBadge } from '@/components/blog/SourceBadge'

export const revalidate = 21600

type PageParams = { source: string; slug: string }

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({ source: post.source, slug: post.slug }))
}

async function getPost(source: string, slug: string) {
  const posts = await getAllPosts()
  return posts.find((post) => post.source === source && post.slug === slug) ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>
}): Promise<Metadata> {
  const { source, slug } = await params
  const post = await getPost(source, slug)
  if (!post) return {}

  return {
    title: `${post.title} — Abdur Rakib`,
    description: post.excerpt,
    alternates: { canonical: post.originalUrl },
  }
}

export default async function PostPage({ params }: { params: Promise<PageParams> }) {
  const { source, slug } = await params
  const post = await getPost(source, slug)
  if (!post) notFound()

  return (
    <article className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <SourceBadge source={post.source} />
        {post.alsoOn.map((s) => (
          <SourceBadge key={s} source={s} />
        ))}
        <span>
          {new Date(post.publishedAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>
      <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
      {post.isPaywalled ? (
        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground">{post.excerpt}</p>
          <a
            href={post.originalUrl}
            className="w-fit rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Read full article on Medium →
          </a>
        </div>
      ) : (
        <PostBody post={post} />
      )}
    </article>
  )
}
