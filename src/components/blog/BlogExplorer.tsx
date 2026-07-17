'use client'

import { useMemo, useState } from 'react'
import type { Post, PostSource } from '@/lib/types'
import { PostCard } from './PostCard'
import { SourceFilter } from './SourceFilter'
import { TagFilter } from './TagFilter'

export function BlogExplorer({ posts }: { posts: Post[] }) {
  const [source, setSource] = useState<PostSource | 'all'>('all')
  const [tag, setTag] = useState('all')

  const tags = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(), [posts])

  const filtered = useMemo(
    () =>
      posts.filter(
        (post) =>
          (source === 'all' || post.source === source || post.alsoOn.includes(source)) &&
          (tag === 'all' || post.tags.includes(tag))
      ),
    [posts, source, tag]
  )

  return (
    <div className="flex flex-col gap-6">
      <SourceFilter value={source} onChange={setSource} />
      <TagFilter tags={tags} value={tag} onChange={setTag} />
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No posts match these filters.</p>
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
