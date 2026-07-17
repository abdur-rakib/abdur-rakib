import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlogExplorer } from './BlogExplorer'
import type { Post } from '@/lib/types'

function makePost(overrides: Partial<Post>): Post {
  return {
    id: 'devto-a', title: 'A', slug: 'a', excerpt: 'excerpt a', content: 'word '.repeat(200),
    contentFormat: 'markdown', coverImage: null, publishedAt: '2026-01-01T00:00:00.000Z',
    tags: [], source: 'devto', alsoOn: [], originalUrl: 'https://dev.to/a', isPaywalled: false,
    ...overrides,
  }
}

const posts: Post[] = [
  makePost({ id: 'devto-a', title: 'Rate Limiting at the Gateway', source: 'devto', tags: ['api-gateway'] }),
  makePost({ id: 'medium-b', title: 'Auto-Recharge Engine', source: 'medium', tags: ['nestjs'], publishedAt: '2026-02-01T00:00:00.000Z' }),
]

describe('BlogExplorer', () => {
  it('renders all posts by default', () => {
    render(<BlogExplorer posts={posts} />)
    expect(screen.getByText('Rate Limiting at the Gateway')).toBeTruthy()
    expect(screen.getByText('Auto-Recharge Engine')).toBeTruthy()
  })

  it('filters by source', async () => {
    const user = userEvent.setup()
    render(<BlogExplorer posts={posts} />)

    await user.click(screen.getByRole('button', { name: 'Medium' }))

    expect(screen.queryByText('Rate Limiting at the Gateway')).toBeNull()
    expect(screen.getByText('Auto-Recharge Engine')).toBeTruthy()
  })

  it('filters by tag', async () => {
    const user = userEvent.setup()
    render(<BlogExplorer posts={posts} />)

    await user.click(screen.getByRole('button', { name: 'nestjs' }))

    expect(screen.queryByText('Rate Limiting at the Gateway')).toBeNull()
    expect(screen.getByText('Auto-Recharge Engine')).toBeTruthy()
  })

  it('shows an empty state when no posts match', async () => {
    const user = userEvent.setup()
    render(<BlogExplorer posts={posts} />)

    await user.click(screen.getByRole('button', { name: 'Medium' }))
    await user.click(screen.getByRole('button', { name: 'api-gateway' }))

    expect(screen.getByText('No posts match these filters.')).toBeTruthy()
  })
})
