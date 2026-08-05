import { afterEach, describe, expect, it, vi } from 'vitest'

const posts = [
  {
    id: 'hashnode-a', title: 'On-site post', slug: 'on-site-post', excerpt: '', content: '<p>body</p>',
    contentFormat: 'html', readingMinutes: 2, coverImage: null, publishedAt: '2026-05-01T00:00:00.000Z',
    tags: [], source: 'hashnode', alsoOn: [], originalUrl: 'https://hashnode.dev/on-site-post', isPaywalled: false,
  },
  {
    id: 'medium-b', title: 'Paywalled post', slug: 'paywalled-post', excerpt: '', content: '<p>short</p>',
    contentFormat: 'html', readingMinutes: 1, coverImage: null, publishedAt: '2026-04-01T00:00:00.000Z',
    tags: [], source: 'medium', alsoOn: [], originalUrl: 'https://medium.com/@x/paywalled-post', isPaywalled: true,
  },
]

vi.mock('@/lib/aggregate', () => ({
  getAllPosts: vi.fn(async () => posts),
}))

describe('sitemap', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('lists static routes and on-site post URLs, skipping link-out posts', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com')
    vi.resetModules()
    const { default: sitemap } = await import('./sitemap')

    expect(await sitemap()).toEqual([
      { url: 'https://example.com' },
      { url: 'https://example.com/blog/' },
      { url: 'https://example.com/blog/on-site-post/' },
    ])
  })
})
