import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchHashnode } from './hashnode'

const GRAPHQL_RESPONSE = {
  data: {
    publication: {
      posts: {
        edges: [
          {
            node: {
              title: 'Offline-First React Native for Field Agents',
              slug: 'offline-first-react-native',
              brief: 'Syncing orders from remote areas reliably.',
              url: 'https://abdur-rakib.hashnode.dev/offline-first-react-native',
              publishedAt: '2026-04-01T00:00:00.000Z',
              tags: [{ name: 'react-native' }, { name: 'redux' }],
              coverImage: { url: 'https://cdn.hashnode.com/cover.png' },
              content: { markdown: '# Offline-First\n\nFull body.' },
            },
          },
        ],
      },
    },
  },
}

describe('fetchHashnode', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('returns an empty array when HASHNODE_HOST is unset', async () => {
    vi.stubEnv('HASHNODE_HOST', '')
    const result = await fetchHashnode()
    expect(result).toEqual([])
  })

  it('maps GraphQL posts to normalized Post objects', async () => {
    vi.stubEnv('HASHNODE_HOST', 'abdur-rakib.hashnode.dev')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(GRAPHQL_RESPONSE), { status: 200 }))
    )

    const result = await fetchHashnode()

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'hashnode-offline-first-react-native',
      title: 'Offline-First React Native for Field Agents',
      slug: 'offline-first-react-native',
      content: '# Offline-First\n\nFull body.',
      contentFormat: 'markdown',
      coverImage: 'https://cdn.hashnode.com/cover.png',
      tags: ['react-native', 'redux'],
      source: 'hashnode',
      alsoOn: [],
      originalUrl: 'https://abdur-rakib.hashnode.dev/offline-first-react-native',
      isPaywalled: false,
    })
  })

  it('returns an empty array when the publication is not found', async () => {
    vi.stubEnv('HASHNODE_HOST', 'abdur-rakib.hashnode.dev')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ data: { publication: null } }), { status: 200 }))
    )

    const result = await fetchHashnode()
    expect(result).toEqual([])
  })

  it('throws when the request fails', async () => {
    vi.stubEnv('HASHNODE_HOST', 'abdur-rakib.hashnode.dev')
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 500 })))

    await expect(fetchHashnode()).rejects.toThrow('Hashnode fetch failed: 500')
  })
})
