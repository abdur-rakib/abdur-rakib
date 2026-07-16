import { XMLParser } from 'fast-xml-parser'
import type { Post } from '../types'
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

  return items.map(toPost)
}

function toPost(item: MediumItem): Post {
  const { html, isPaywalled } = sanitizeMediumContent(item['content:encoded'])
  const tags = ([] as string[]).concat(item.category ?? [])
  const slug = item.link.split('/').pop()?.split('?')[0] ?? item.guid

  return {
    id: `medium-${slug}`,
    title: item.title,
    slug,
    excerpt: item.description ?? html.replace(/<[^>]+>/g, '').slice(0, 160),
    content: html,
    contentFormat: 'html',
    coverImage: null,
    publishedAt: new Date(item.pubDate).toISOString(),
    tags,
    source: 'medium',
    alsoOn: [],
    originalUrl: item.link,
    isPaywalled,
  }
}
