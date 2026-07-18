import { getAllPosts } from '@/lib/aggregate'
import { Hero } from '@/components/home/Hero'
import { LatestPosts } from '@/components/home/LatestPosts'

export const dynamic = 'force-static'

export default async function HomePage() {
  const posts = await getAllPosts()

  return (
    <div className="flex flex-col gap-8">
      <Hero />
      <hr className="border-border" />
      <LatestPosts posts={posts} />
    </div>
  )
}
