import Link from 'next/link'
import type { Post } from '@/lib/types'
import { PostCard } from '@/components/blog/PostCard'

export function LatestPosts({ posts }: { posts: Post[] }) {
  const latest = posts.slice(0, 3)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Latest writing</h2>
        <Link href="/blog" className="text-sm text-accent hover:underline">
          All posts →
        </Link>
      </div>
      {latest.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts yet — check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
