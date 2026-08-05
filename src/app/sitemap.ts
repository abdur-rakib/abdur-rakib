import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/aggregate'
import { hasOnSitePage } from '@/lib/postRouting'

export const dynamic = 'force-static'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts()
  const postUrls = posts
    .filter(hasOnSitePage)
    .map((post) => ({ url: `${BASE_URL}/blog/${post.slug}/` }))

  return [
    { url: `${BASE_URL}` },
    { url: `${BASE_URL}/blog/` },
    ...postUrls,
  ]
}
