import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Post } from '@/lib/types'

const normalPost: Post = {
  id: 'devto-a', title: 'Custom Kong Plugins', slug: 'kong-plugins', excerpt: 'excerpt',
  content: '# Body\n\nText.', contentFormat: 'markdown', coverImage: null,
  publishedAt: '2026-05-01T00:00:00.000Z', tags: ['kong'], source: 'devto', alsoOn: [],
  originalUrl: 'https://dev.to/a', isPaywalled: false,
}

const paywalledPost: Post = {
  ...normalPost,
  id: 'medium-b', slug: 'paywalled-post', source: 'medium', isPaywalled: true,
  originalUrl: 'https://medium.com/p/b', contentFormat: 'html', content: '<p>Teaser.</p>',
}

vi.mock('@/lib/aggregate', () => ({
  getAllPosts: vi.fn(async () => [normalPost, paywalledPost]),
}))

describe('PostPage', () => {
  it('renders the full body for a normal post', async () => {
    const { default: PostPage } = await import('./page')
    const ui = await PostPage({ params: Promise.resolve({ source: 'devto', slug: 'kong-plugins' }) })
    render(ui)

    expect(screen.getByRole('heading', { level: 1, name: 'Custom Kong Plugins' })).toBeTruthy()
    expect(screen.getByText('Text.')).toBeTruthy()
  })

  it('renders the excerpt and a link to Medium for a paywalled post', async () => {
    const { default: PostPage } = await import('./page')
    const ui = await PostPage({ params: Promise.resolve({ source: 'medium', slug: 'paywalled-post' }) })
    render(ui)

    expect(screen.getByText('excerpt')).toBeTruthy()
    expect(screen.queryByText('Teaser.')).toBeNull()
    const link = screen.getByRole('link', { name: /read full article on medium/i })
    expect(link.getAttribute('href')).toBe('https://medium.com/p/b')
  })
})
