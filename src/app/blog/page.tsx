import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/aggregate'
import { BlogExplorer } from '@/components/blog/BlogExplorer'

export const revalidate = 21600

export const metadata: Metadata = {
  title: 'Blog — Abdur Rakib',
  description: 'Posts aggregated from dev.to, Hashnode, and Medium.',
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-2 max-w-[56ch] text-muted">
          Every post I publish, pulled from all three platforms into one feed.
          Cross-posts are de-duplicated; each post links back to its original.
        </p>
      </div>
      <BlogExplorer posts={posts} />
      <p className="border-t border-border pt-6 text-center font-mono text-xs text-muted-foreground">
        Aggregated from dev.to · Hashnode · Medium
      </p>
    </div>
  )
}
