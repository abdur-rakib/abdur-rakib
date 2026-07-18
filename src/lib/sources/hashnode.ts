import { XMLParser } from 'fast-xml-parser'
import type { Post } from '../types'
import { estimateReadingMinutes } from '../readingTime'

interface HashnodeItem {
  title: string
  link: string
  guid: string
  pubDate: string
  category?: string | string[]
  'content:encoded': string
  description?: string
  enclosure?: { '@_url'?: string }
}

const parser = new XMLParser({ ignoreAttributes: false })

export async function fetchHashnode(): Promise<Post[]> {
  const host = process.env.HASHNODE_HOST
  if (!host) return []

  const res = await fetch(`https://${host}/rss.xml`)
  if (!res.ok) {
    throw new Error(`Hashnode feed fetch failed: ${res.status}`)
  }

  const xml = await res.text()
  const parsed = parser.parse(xml)
  const rawItems = parsed?.rss?.channel?.item ?? []
  const items: HashnodeItem[] = Array.isArray(rawItems) ? rawItems : [rawItems]

  return items.map(toPost)
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

function toPost(item: HashnodeItem): Post {
  const html = item['content:encoded']
  const tags = ([] as string[]).concat(item.category ?? [])
  const slug = item.link.split('/').pop()?.split('?')[0] ?? item.guid

  return {
    id: `hashnode-${slug}`,
    title: item.title,
    slug,
    excerpt: item.description ? excerptFromHtml(item.description) : excerptFromHtml(html),
    content: html,
    contentFormat: 'html',
    readingMinutes: estimateReadingMinutes(html, 'html'),
    coverImage: item.enclosure?.['@_url'] ?? null,
    publishedAt: new Date(item.pubDate).toISOString(),
    tags,
    source: 'hashnode',
    alsoOn: [],
    originalUrl: item.link,
    isPaywalled: false,
  }
}
