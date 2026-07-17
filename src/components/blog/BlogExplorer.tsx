'use client'

import { useMemo, useState } from 'react'
import type { Post } from '@/lib/types'
import { PostCard } from './PostCard'
import { TagFilter } from './TagFilter'

export function BlogExplorer({ posts }: { posts: Post[] }) {
  const [tag, setTag] = useState('all')

  const tags = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(), [posts])

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
