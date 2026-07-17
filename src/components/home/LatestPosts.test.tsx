import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LatestPosts } from './LatestPosts'
import type { Post } from '@/lib/types'

function makePost(id: string, title: string, publishedAt: string): Post {
  return {
    id, title, slug: id, excerpt: '', content: '', contentFormat: 'markdown', coverImage: null,
    publishedAt, tags: [], source: 'devto', alsoOn: [], originalUrl: 'https://dev.to/x', isPaywalled: false,
  }
}

describe('LatestPosts', () => {
  it('renders at most 3 posts', () => {
    const posts = [
      makePost('a', 'Post A', '2026-04-01T00:00:00.000Z'),
      makePost('b', 'Post B', '2026-03-01T00:00:00.000Z'),
      makePost('c', 'Post C', '2026-02-01T00:00:00.000Z'),
      makePost('d', 'Post D', '2026-01-01T00:00:00.000Z'),
    ]
    render(<LatestPosts posts={posts} />)
    expect(screen.getByText('Post A')).toBeTruthy()
    expect(screen.getByText('Post C')).toBeTruthy()
    expect(screen.queryByText('Post D')).toBeNull()
  })

  it('shows an empty state when there are no posts', () => {
    render(<LatestPosts posts={[]} />)
    expect(screen.getByText(/no posts yet/i)).toBeTruthy()
  })
})
