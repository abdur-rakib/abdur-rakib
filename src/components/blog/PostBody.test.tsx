import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostBody } from './PostBody'
import type { Post } from '@/lib/types'

function makePost(overrides: Partial<Post>): Post {
  return {
    id: 'x', title: 'x', slug: 'x', excerpt: '', content: '', contentFormat: 'markdown',
    coverImage: null, publishedAt: '2026-01-01T00:00:00.000Z', tags: [], source: 'devto',
    alsoOn: [], originalUrl: 'https://dev.to/x', isPaywalled: false, ...overrides,
  }
}

describe('PostBody', () => {
  it('renders markdown content as HTML', () => {
    const post = makePost({ content: '# Heading\n\nBody text.', contentFormat: 'markdown' })
    render(<PostBody post={post} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Heading' })).toBeTruthy()
    expect(screen.getByText('Body text.')).toBeTruthy()
  })

  it('renders sanitized HTML content directly', () => {
    const post = makePost({ content: '<p>Already sanitized.</p>', contentFormat: 'html' })
    render(<PostBody post={post} />)
    expect(screen.getByText('Already sanitized.')).toBeTruthy()
  })
})
