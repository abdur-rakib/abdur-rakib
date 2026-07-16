import { describe, expect, it } from 'vitest'
import { dedupeAndSort } from './dedupe'
import type { Post } from './types'

function makePost(overrides: Partial<Post>): Post {
  return {
    id: 'devto-test',
    title: 'Test Post',
    slug: 'test-post',
    excerpt: 'excerpt',
    content: 'content',
    contentFormat: 'markdown',
    coverImage: null,
    publishedAt: '2026-01-01T00:00:00.000Z',
    tags: [],
    source: 'devto',
    alsoOn: [],
    originalUrl: 'https://dev.to/test-post',
    isPaywalled: false,
    ...overrides,
  }
}

describe('dedupeAndSort', () => {
  it('passes through posts with unique titles unchanged', () => {
    const posts = [
      makePost({ id: 'a', title: 'Post A', publishedAt: '2026-01-01T00:00:00.000Z' }),
      makePost({ id: 'b', title: 'Post B', publishedAt: '2026-02-01T00:00:00.000Z' }),
    ]
    const result = dedupeAndSort(posts)
    expect(result).toHaveLength(2)
  })

  it('merges cross-posts with the same title, keeping the earliest as primary', () => {
    const posts = [
      makePost({
        id: 'medium-1',
        title: 'Designing an Auto-Recharge Engine',
        source: 'medium',
        publishedAt: '2026-03-05T00:00:00.000Z',
      }),
      makePost({
        id: 'devto-1',
        title: 'Designing an Auto-Recharge Engine',
        source: 'devto',
        publishedAt: '2026-03-01T00:00:00.000Z',
      }),
    ]
    const result = dedupeAndSort(posts)
    expect(result).toHaveLength(1)
    expect(result[0].source).toBe('devto')
    expect(result[0].publishedAt).toBe('2026-03-01T00:00:00.000Z')
    expect(result[0].alsoOn).toEqual(['medium'])
  })

  it('title match is case- and punctuation-insensitive', () => {
    const posts = [
      makePost({ id: 'a', title: 'Rate Limiting at the Gateway!', source: 'devto', publishedAt: '2026-01-01T00:00:00.000Z' }),
      makePost({ id: 'b', title: 'rate limiting at the gateway', source: 'hashnode', publishedAt: '2026-01-02T00:00:00.000Z' }),
    ]
    const result = dedupeAndSort(posts)
    expect(result).toHaveLength(1)
    expect(result[0].alsoOn).toEqual(['hashnode'])
  })

  it('sorts results by publishedAt descending', () => {
    const posts = [
      makePost({ id: 'a', title: 'Old Post', publishedAt: '2026-01-01T00:00:00.000Z' }),
      makePost({ id: 'b', title: 'New Post', publishedAt: '2026-06-01T00:00:00.000Z' }),
      makePost({ id: 'c', title: 'Mid Post', publishedAt: '2026-03-01T00:00:00.000Z' }),
    ]
    const result = dedupeAndSort(posts)
    expect(result.map((p) => p.title)).toEqual(['New Post', 'Mid Post', 'Old Post'])
  })
})
