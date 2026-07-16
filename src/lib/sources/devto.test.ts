import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchDevto } from './devto'

const ARTICLE_LIST = [
  {
    id: 1,
    title: 'Custom Kong Plugins to Block Unauthorized API Traffic',
    slug: 'custom-kong-plugins',
    description: 'A verification layer that cut fraudulent requests by 90%.',
    cover_image: null,
    published_at: '2026-05-01T00:00:00.000Z',
    tag_list: ['kong', 'security'],
    url: 'https://dev.to/abdur-rakib/custom-kong-plugins',
  },
]

const ARTICLE_FULL = {
  ...ARTICLE_LIST[0],
  body_markdown: '# Custom Kong Plugins\n\nFull article body here.',
}

describe('fetchDevto', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('returns an empty array when DEVTO_USERNAME is unset', async () => {
    vi.stubEnv('DEVTO_USERNAME', '')
    const result = await fetchDevto()
    expect(result).toEqual([])
  })

  it('fetches the article list then full body for each article', async () => {
    vi.stubEnv('DEVTO_USERNAME', 'abdur-rakib')
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('/api/articles?')) {
        return new Response(JSON.stringify(ARTICLE_LIST), { status: 200 })
      }
      return new Response(JSON.stringify(ARTICLE_FULL), { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchDevto()

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'devto-custom-kong-plugins',
      title: 'Custom Kong Plugins to Block Unauthorized API Traffic',
      slug: 'custom-kong-plugins',
      content: '# Custom Kong Plugins\n\nFull article body here.',
      contentFormat: 'markdown',
      source: 'devto',
      alsoOn: [],
      tags: ['kong', 'security'],
      originalUrl: 'https://dev.to/abdur-rakib/custom-kong-plugins',
      isPaywalled: false,
    })
  })

  it('throws when the article list fetch fails', async () => {
    vi.stubEnv('DEVTO_USERNAME', 'abdur-rakib')
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 500 })))

    await expect(fetchDevto()).rejects.toThrow('dev.to list fetch failed: 500')
  })
})
