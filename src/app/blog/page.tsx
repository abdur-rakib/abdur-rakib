import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/aggregate'
import { BlogExplorer } from '@/components/blog/BlogExplorer'

export const revalidate = 21600

export const metadata: Metadata = {
  title: 'Blog — Abdur Rakib',
  description: 'Writing on backend engineering, system design, and the tradeoffs behind building reliable software.',
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-2 max-w-[60ch] text-muted-foreground">
          Notes on backend architecture, distributed systems, and the debugging
          sessions that taught me the most. Every post lands in one feed here —
          duplicates across platforms are merged, and each card links back to
          the original piece.
        </p>
      </div>
      <hr className="border-border" />
      <BlogExplorer posts={posts} />
    </div>
  )
}
