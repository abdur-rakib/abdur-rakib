import type { Post } from '../types'

interface DevtoArticle {
  id: number
  title: string
  slug: string
  description: string
  cover_image: string | null
  published_at: string
  tag_list: string[]
  url: string
}

interface DevtoArticleFull extends DevtoArticle {
  body_markdown: string
}

const DEVTO_API = 'https://dev.to/api/articles'

export async function fetchDevto(): Promise<Post[]> {
  const username = process.env.DEVTO_USERNAME
  if (!username) return []

  const listRes = await fetch(`${DEVTO_API}?username=${username}&per_page=100`)
  if (!listRes.ok) {
    throw new Error(`dev.to list fetch failed: ${listRes.status}`)
  }
  const articles: DevtoArticle[] = await listRes.json()

  const full = await Promise.all(
    articles.map(async (article) => {
      const res = await fetch(`${DEVTO_API}/${article.id}`)
      if (!res.ok) {
        throw new Error(`dev.to article fetch failed: ${res.status}`)
      }
      return (await res.json()) as DevtoArticleFull
    })
  )

  return full.map(toPost)
}

function toPost(article: DevtoArticleFull): Post {
  return {
    id: `devto-${article.slug}`,
    title: article.title,
    slug: article.slug,
    excerpt: article.description,
    content: article.body_markdown,
    contentFormat: 'markdown',
    coverImage: article.cover_image,
    publishedAt: article.published_at,
    tags: article.tag_list,
    source: 'devto',
    alsoOn: [],
    originalUrl: article.url,
    isPaywalled: false,
  }
}
