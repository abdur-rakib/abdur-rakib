'use client'

import { useMemo, useState } from 'react'
import type { Post } from '@/lib/types'
import { PostCard } from './PostCard'
import { TagFilter } from './TagFilter'

export function BlogExplorer({ posts }: { posts: Post[] }) {
  const [tag, setTag] = useState('all')

  const tags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const post of posts) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag]) => tag)
  }, [posts])

  const filtered = useMemo(
    () => posts.filter((post) => tag === 'all' || post.tags.includes(tag)),
    [posts, tag]
  )

  return (
    <div className="flex flex-col gap-6">
      <TagFilter tags={tags} value={tag} onChange={setTag} />
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No posts match these filters.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
