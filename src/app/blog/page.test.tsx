import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Post } from '@/lib/types'

const post: Post = {
  id: 'devto-a', title: 'Custom Kong Plugins', slug: 'a', excerpt: 'excerpt', content: 'body',
  contentFormat: 'markdown', coverImage: null, publishedAt: '2026-05-01T00:00:00.000Z',
  tags: ['kong'], source: 'devto', alsoOn: [], originalUrl: 'https://dev.to/a', isPaywalled: false,
}

vi.mock('@/lib/aggregate', () => ({
  getAllPosts: vi.fn(async () => [post]),
}))

describe('BlogPage', () => {
  it('renders the heading and post list', async () => {
    const { default: BlogPage } = await import('./page')
    const ui = await BlogPage()
    render(ui)

    expect(screen.getByRole('heading', { level: 1, name: 'Blog' })).toBeTruthy()
    expect(screen.getByText('Custom Kong Plugins')).toBeTruthy()
  })
})
