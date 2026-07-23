import { XMLParser } from 'fast-xml-parser'
import type { Post } from '../types'
import { estimateReadingMinutes } from '../readingTime'
import { sanitizeMediumContent } from './mediumSanitize'

interface MediumItem {
  title: string
  link: string
  guid: string
  pubDate: string
  category?: string | string[]
  'content:encoded': string
  description?: string
}

const parser = new XMLParser({ ignoreAttributes: false })

export async function fetchMedium(): Promise<Post[]> {
  const username = process.env.MEDIUM_USERNAME
  if (!username) return []

  const res = await fetch(`https://medium.com/feed/${username}`)
  if (!res.ok) {
    throw new Error(`Medium feed fetch failed: ${res.status}`)
  }

  const xml = await res.text()
  const parsed = parser.parse(xml)
  const rawItems = parsed?.rss?.channel?.item ?? []
  const items: MediumItem[] = Array.isArray(rawItems) ? rawItems : [rawItems]

  const posts = items.flatMap((item) => {
    try {
      return [toPost(item)]
    } catch (error) {
      console.error('[medium] skipped malformed feed item:', error)
      return []
    }
  })
  if (items.length > 0 && posts.length === 0) {
    throw new Error('Medium feed contained no valid items')
  }
  return posts
}

function excerptFromHtml(html: string, maxLength = 160): string {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= maxLength) return text
  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`
}

function toPost(item: MediumItem): Post {
  if (!item.title || !item.link || !item.pubDate || !item['content:encoded']) {
    throw new Error('Medium feed item is missing required fields')
  }

  const publishedAt = new Date(item.pubDate)
  if (Number.isNaN(publishedAt.getTime())) {
    throw new Error(`Medium feed item has invalid pubDate: ${item.pubDate}`)
  }

  const { html, isPaywalled } = sanitizeMediumContent(item['content:encoded'])
  const tags = ([] as string[]).concat(item.category ?? [])
  const slug = item.link.split('/').pop()?.split('?')[0] ?? item.guid

  return {
    id: `medium-${slug}`,
    title: item.title,
    slug,
    excerpt: item.description ?? excerptFromHtml(html),
    content: html,
    contentFormat: 'html',
    readingMinutes: estimateReadingMinutes(html, 'html'),
    coverImage: null,
    publishedAt: publishedAt.toISOString(),
    tags,
    source: 'medium',
    alsoOn: [],
    originalUrl: item.link,
    isPaywalled,
  }
}
