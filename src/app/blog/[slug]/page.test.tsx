import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Post } from '@/lib/types'

const post: Post = {
  id: 'hashnode-cong', title: 'Custom Kong Plugins', slug: 'custom-kong-plugins',
  excerpt: 'A verification layer that cut fraudulent requests by 90%.',
  content: '<h2>Intro</h2><p>Why we built this <a href="https://example.com">gate</a>.</p>',
  contentFormat: 'html', readingMinutes: 3, coverImage: 'https://cdn.hashnode.com/cover.png',
  publishedAt: '2026-05-01T00:00:00.000Z', tags: ['kong', 'security'],
  source: 'hashnode', alsoOn: ['medium'], originalUrl: 'https://hashnode.dev/custom-kong-plugins', isPaywalled: false,
}

const paywalled: Post = {
  ...post,
  id: 'medium-pw', slug: 'paywalled', source: 'medium',
  content: '<p>members only</p>', originalUrl: 'https://medium.com/@x/paywalled', isPaywalled: true,
}

vi.mock('@/lib/aggregate', () => ({
  getAllPosts: vi.fn(async () => [post, paywalled]),
}))

describe('PostPage', () => {
  it('renders the article for an on-site post', async () => {
    const { default: PostPage } = await import('./page')
    const ui = await PostPage({ params: Promise.resolve({ slug: 'custom-kong-plugins' }) })
    render(ui)

    expect(screen.getByRole('heading', { level: 1, name: post.title })).toBeTruthy()
    expect(screen.getByText(/why we built this/i)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'All posts' })).toBeTruthy()
    expect(screen.getByText('hashnode')).toBeTruthy()
    expect(screen.getByText('medium')).toBeTruthy()
  })

  it('sanitizes the content body and externalises content links', async () => {
    const { default: PostPage } = await import('./page')
    const ui = await PostPage({ params: Promise.resolve({ slug: 'custom-kong-plugins' }) })
    const { container } = render(ui)

    const contentLink = container.querySelector('article a[href="https://example.com"]')
    expect(contentLink).toBeTruthy()
    expect(contentLink?.getAttribute('target')).toBe('_blank')
    expect(contentLink?.getAttribute('rel')).toContain('noopener noreferrer')
  })

  it('exposes a canonical link back to the original post', async () => {
    const { generateMetadata } = await import('./page')
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'custom-kong-plugins' }) })
    expect(meta.alternates?.canonical).toBe(post.originalUrl)
  })

  it('does not generate an on-site page for a paywalled post', async () => {
    const { generateStaticParams } = await import('./page')
    const slugs = await generateStaticParams()
    expect(slugs.map((entry) => entry.slug)).not.toContain('paywalled')
  })
})