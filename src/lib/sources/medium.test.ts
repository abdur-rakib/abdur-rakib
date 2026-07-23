import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchMedium } from './medium'

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Abdur Rakib - Medium</title>
    <item>
      <title>Enforcing Coverage Thresholds in GitLab CI</title>
      <link>https://medium.com/@abdur-rakib/enforcing-coverage-thresholds-abc123</link>
      <guid>https://medium.com/p/abc123</guid>
      <pubDate>Wed, 04 Mar 2026 00:00:00 GMT</pubDate>
      <category>ci</category>
      <category>jest</category>
      <description>Failing the pipeline when tests slip below the line.</description>
      <content:encoded><![CDATA[<p>${'Full article body. '.repeat(40)}</p>]]></content:encoded>
    </item>
  </channel>
</rss>`

describe('fetchMedium', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('returns an empty array when MEDIUM_USERNAME is unset', async () => {
    vi.stubEnv('MEDIUM_USERNAME', '')
    const result = await fetchMedium()
    expect(result).toEqual([])
  })

  it('parses RSS items into normalized Post objects', async () => {
    vi.stubEnv('MEDIUM_USERNAME', '@abdur-rakib')
    vi.stubGlobal('fetch', vi.fn(async () => new Response(SAMPLE_RSS, { status: 200 })))

    const result = await fetchMedium()

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'medium-enforcing-coverage-thresholds-abc123',
      title: 'Enforcing Coverage Thresholds in GitLab CI',
      slug: 'enforcing-coverage-thresholds-abc123',
      excerpt: 'Failing the pipeline when tests slip below the line.',
      contentFormat: 'html',
      tags: ['ci', 'jest'],
      source: 'medium',
      alsoOn: [],
      originalUrl: 'https://medium.com/@abdur-rakib/enforcing-coverage-thresholds-abc123',
      isPaywalled: false,
    })
    expect(result[0].publishedAt).toBe(new Date('Wed, 04 Mar 2026 00:00:00 GMT').toISOString())
  })

  it('builds an excerpt from content when description is missing, without gluing words across tags', async () => {
    vi.stubEnv('MEDIUM_USERNAME', '@abdur-rakib')
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Abdur Rakib - Medium</title>
    <item>
      <title>React Interview Questions</title>
      <link>https://medium.com/@abdur-rakib/react-interview-questions-def456</link>
      <guid>https://medium.com/p/def456</guid>
      <pubDate>Wed, 04 Mar 2026 00:00:00 GMT</pubDate>
      <content:encoded><![CDATA[<figcaption>Photo by Lautaro Andreani on Unsplash</figcaption><p>${'Welcome to my new interview questions episode. '.repeat(10)}</p>]]></content:encoded>
    </item>
  </channel>
</rss>`
    vi.stubGlobal('fetch', vi.fn(async () => new Response(rss, { status: 200 })))

    const result = await fetchMedium()

    expect(result[0].excerpt).not.toMatch(/UnsplashWelcome/)
    expect(result[0].excerpt).toMatch(/^Photo by Lautaro Andreani on Unsplash Welcome to my new/)
    expect(result[0].excerpt.length).toBeLessThanOrEqual(161)
  })

  it('throws when the feed fetch fails', async () => {
    vi.stubEnv('MEDIUM_USERNAME', '@abdur-rakib')
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })))

    await expect(fetchMedium()).rejects.toThrow('Medium feed fetch failed: 404')
  })

  it('skips malformed items while preserving valid posts', async () => {
    vi.stubEnv('MEDIUM_USERNAME', '@abdur-rakib')
    const malformedItem = `<item><title>Broken</title><link>https://medium.com/broken</link><guid>broken</guid><pubDate>not-a-date</pubDate><content:encoded><![CDATA[<p>Broken</p>]]></content:encoded></item>`
    const rss = SAMPLE_RSS.replace('</channel>', `${malformedItem}</channel>`)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn(async () => new Response(rss, { status: 200 })))

    const result = await fetchMedium()

    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Enforcing Coverage Thresholds in GitLab CI')
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('skipped malformed feed item'),
      expect.any(Error)
    )
    errorSpy.mockRestore()
  })

  it('rejects a feed containing only malformed items', async () => {
    vi.stubEnv('MEDIUM_USERNAME', '@abdur-rakib')
    const rss = SAMPLE_RSS.replace('Wed, 04 Mar 2026 00:00:00 GMT', 'not-a-date')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn(async () => new Response(rss, { status: 200 })))

    await expect(fetchMedium()).rejects.toThrow('Medium feed contained no valid items')
    errorSpy.mockRestore()
  })
})
