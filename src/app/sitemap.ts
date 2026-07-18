import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/blog'].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }))
}
