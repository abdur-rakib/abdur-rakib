import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchHashnode } from './hashnode'

const RSS_RESPONSE = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0">
<channel>
<title><![CDATA[Rakib's Tech Insights]]></title>
<item>
<title><![CDATA[Offline-First React Native for Field Agents]]></title>
<description><![CDATA[Syncing orders from remote areas reliably.]]></description>
<link>https://abdur-rakib.hashnode.dev/offline-first-react-native</link>
<guid isPermaLink="true">https://abdur-rakib.hashnode.dev/offline-first-react-native</guid>
<category><![CDATA[react-native]]></category>
<category><![CDATA[redux]]></category>
<dc:creator><![CDATA[Abdur Rakib]]></dc:creator>
<pubDate>Wed, 01 Apr 2026 00:00:00 GMT</pubDate>
<enclosure url="https://cdn.hashnode.com/cover.png" length="0" type="image/jpeg"/>
<content:encoded><![CDATA[<h1>Offline-First</h1><p>Full body.</p>]]></content:encoded>
</item>
</channel>
</rss>`

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

  it('maps RSS items to normalized Post objects', async () => {
    vi.stubEnv('HASHNODE_HOST', 'abdur-rakib.hashnode.dev')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(RSS_RESPONSE, { status: 200 }))
    )

    const result = await fetchHashnode()

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'hashnode-offline-first-react-native',
      title: 'Offline-First React Native for Field Agents',
      slug: 'offline-first-react-native',
      excerpt: 'Syncing orders from remote areas reliably.',
      content: '<h1>Offline-First</h1><p>Full body.</p>',
      contentFormat: 'html',
      coverImage: 'https://cdn.hashnode.com/cover.png',
      tags: ['react-native', 'redux'],
      source: 'hashnode',
      alsoOn: [],
      originalUrl: 'https://abdur-rakib.hashnode.dev/offline-first-react-native',
      isPaywalled: false,
    })
  })

  it('returns an empty array when the feed has no items', async () => {
    vi.stubEnv('HASHNODE_HOST', 'abdur-rakib.hashnode.dev')
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            '<?xml version="1.0"?><rss><channel><title>Empty</title></channel></rss>',
            { status: 200 }
          )
      )
    )

    const result = await fetchHashnode()
    expect(result).toEqual([])
  })

  it('throws when the request fails', async () => {
    vi.stubEnv('HASHNODE_HOST', 'abdur-rakib.hashnode.dev')
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 500 })))

    await expect(fetchHashnode()).rejects.toThrow('Hashnode feed fetch failed: 500')
  })
})
