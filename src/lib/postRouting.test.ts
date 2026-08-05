import { describe, expect, it } from 'vitest'
import type { Post } from './types'
import { postHref } from './postRouting'

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'hashnode-x', title: 'X', slug: 'x', excerpt: '', content: '<p>body</p>',
    contentFormat: 'html', readingMinutes: 1, coverImage: null, publishedAt: '2026-01-01T00:00:00.000Z',
    tags: [], source: 'hashnode', alsoOn: [], originalUrl: 'https://hashnode.dev/x', isPaywalled: false,
    ...overrides,
  }
}

describe('postRouting', () => {
  it('routes every supported post category to the internal page', () => {
    expect(postHref(makePost())).toBe('/blog/x')
    expect(postHref(makePost({ source: 'medium', content: '', contentFormat: 'markdown', isPaywalled: true }))).toBe('/blog/x')
  })
})
