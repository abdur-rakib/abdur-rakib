import { getAllPosts } from '@/lib/aggregate'
import { Hero } from '@/components/home/Hero'
import { LatestPosts } from '@/components/home/LatestPosts'

export const revalidate = 21600

export default async function HomePage() {
  const posts = await getAllPosts()

  return (
    <div className="flex flex-col gap-14">
      <Hero />
      <hr className="border-border" />
      <LatestPosts posts={posts} />
    </div>
  )
}
