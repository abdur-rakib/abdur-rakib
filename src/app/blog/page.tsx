import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/aggregate'
import { PostCard } from '@/components/blog/PostCard'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Blog — Abdur Rakib',
  description:
    'Long-form writing on backend architecture — microservices, event-driven systems, message queues, and API gateways — aggregated live from Hashnode and Medium.',
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="flex flex-col gap-8">
      <div>
        {posts.length > 0 && (
          <p className="mb-3 font-mono text-xs uppercase tracking-wide text-muted-foreground">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} · newest first
          </p>
        )}
        <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-2 max-w-[62ch] text-muted-foreground">
          Everything I publish, in one feed. Deep dives on backend architecture —
          microservices, event-driven workflows, message brokers, and the
          API-gateway plumbing behind them — pulled live from Hashnode and Medium.
          Cross-posts are merged into a single card, and every card opens the
          original piece.
        </p>
      </div>
      <hr className="border-border" />
      {posts.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No posts yet — new writing from Hashnode and Medium will surface here.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
