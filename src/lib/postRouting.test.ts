import { describe, expect, it } from 'vitest'
import type { Post } from './types'
import { hasOnSitePage, postHref } from './postRouting'

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'hashnode-x', title: 'X', slug: 'x', excerpt: '', content: '<p>body</p>',
    contentFormat: 'html', readingMinutes: 1, coverImage: null, publishedAt: '2026-01-01T00:00:00.000Z',
    tags: [], source: 'hashnode', alsoOn: [], originalUrl: 'https://hashnode.dev/x', isPaywalled: false,
    ...overrides,
  }
}

describe('postRouting', () => {
  it('treats a full HTML, non-paywalled post as on-site', () => {
    expect(hasOnSitePage(makePost())).toBe(true)
  })

  it('keeps paywalled posts link-out', () => {
    expect(hasOnSitePage(makePost({ isPaywalled: true }))).toBe(false)
  })

  it('keeps empty-content and non-HTML posts link-out', () => {
    expect(hasOnSitePage(makePost({ content: '' }))).toBe(false)
    expect(hasOnSitePage(makePost({ contentFormat: 'markdown' }))).toBe(false)
  })

  it('returns the internal path for on-site posts and the original URL otherwise', () => {
    expect(postHref(makePost())).toBe('/blog/x')
    expect(postHref(makePost({ isPaywalled: true }))).toBe('https://hashnode.dev/x')
  })
})