import type { Post, PostSource } from './types'

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function dedupeAndSort(posts: Post[]): Post[] {
  const byTitle = new Map<string, Post>()

  for (const post of posts) {
    const key = normalizeTitle(post.title)
    const existing = byTitle.get(key)

    if (!existing) {
      byTitle.set(key, { ...post, alsoOn: [...post.alsoOn] })
      continue
    }

    const earlier = post.publishedAt < existing.publishedAt ? post : existing
    const later = post.publishedAt < existing.publishedAt ? existing : post

    const alsoOn = Array.from(
      new Set([...existing.alsoOn, ...post.alsoOn, later.source])
    ).filter((source): source is PostSource => source !== earlier.source)

    byTitle.set(key, { ...earlier, alsoOn })
  }

  return Array.from(byTitle.values()).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  )
}
