import { describe, expect, it } from 'vitest'
import { dedupeAndSort } from './dedupe'
import type { Post } from './types'

function makePost(overrides: Partial<Post>): Post {
  return {
    id: 'hashnode-test',
    title: 'Test Post',
    slug: 'test-post',
    excerpt: 'excerpt',
    content: 'content',
    contentFormat: 'markdown',
    readingMinutes: 1,
    coverImage: null,
    publishedAt: '2026-01-01T00:00:00.000Z',
    tags: [],
    source: 'hashnode',
    alsoOn: [],
    originalUrl: 'https://hashnode.dev/test-post',
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

  it('merges cross-posts with the same title, preferring Hashnode as primary', () => {
    const posts = [
      makePost({
        id: 'medium-1',
        title: 'Designing an Auto-Recharge Engine',
        source: 'medium',
        publishedAt: '2026-03-05T00:00:00.000Z',
      }),
      makePost({
        id: 'hashnode-1',
        title: 'Designing an Auto-Recharge Engine',
        source: 'hashnode',
        publishedAt: '2026-03-01T00:00:00.000Z',
      }),
    ]
    const result = dedupeAndSort(posts)
    expect(result).toHaveLength(1)
    expect(result[0].source).toBe('hashnode')
    expect(result[0].publishedAt).toBe('2026-03-01T00:00:00.000Z')
    expect(result[0].alsoOn).toEqual(['medium'])
  })

  it('uses a later Hashnode copy for routing while preserving the earliest date', () => {
    const posts = [
      makePost({
        id: 'medium-1',
        title: 'Designing an Auto-Recharge Engine',
        source: 'medium',
        slug: 'medium-copy',
        publishedAt: '2026-03-01T00:00:00.000Z',
      }),
      makePost({
        id: 'hashnode-1',
        title: 'Designing an Auto-Recharge Engine',
        source: 'hashnode',
        slug: 'hashnode-copy',
        contentFormat: 'html',
        publishedAt: '2026-03-05T00:00:00.000Z',
      }),
    ]

    const result = dedupeAndSort(posts)

    expect(result[0]).toMatchObject({
      source: 'hashnode',
      slug: 'hashnode-copy',
      publishedAt: '2026-03-01T00:00:00.000Z',
      alsoOn: ['medium'],
    })
  })

  it('title match is case- and punctuation-insensitive', () => {
    const posts = [
      makePost({ id: 'a', title: 'Rate Limiting at the Gateway!', source: 'medium', publishedAt: '2026-01-01T00:00:00.000Z' }),
      makePost({ id: 'b', title: 'rate limiting at the gateway', source: 'hashnode', publishedAt: '2026-01-02T00:00:00.000Z' }),
    ]
    const result = dedupeAndSort(posts)
    expect(result).toHaveLength(1)
    expect(result[0].source).toBe('hashnode')
    expect(result[0].alsoOn).toEqual(['medium'])
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
