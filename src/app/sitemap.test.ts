import { afterEach, describe, expect, it, vi } from 'vitest'

describe('sitemap', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('omits synthetic modification times and uses exported route URLs', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com')
    vi.resetModules()
    const { default: sitemap } = await import('./sitemap')

    expect(sitemap()).toEqual([
      { url: 'https://example.com' },
      { url: 'https://example.com/blog/' },
    ])
  })
})
