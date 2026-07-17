import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/aggregate'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts()

  const staticRoutes = ['', '/blog', '/resume'].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }))

  const postRoutes = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.source}/${post.slug}`,
    lastModified: new Date(post.publishedAt),
  }))

  return [...staticRoutes, ...postRoutes]
}
