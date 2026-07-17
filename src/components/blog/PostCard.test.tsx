import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostCard } from './PostCard'
import type { Post } from '@/lib/types'

const post: Post = {
  id: 'devto-kong-plugins',
  title: 'Custom Kong Plugins to Block Unauthorized API Traffic',
  slug: 'kong-plugins',
  excerpt: 'A verification layer that cut fraudulent requests by 90%.',
  content: 'word '.repeat(400),
  contentFormat: 'markdown',
  coverImage: null,
  publishedAt: '2026-05-01T00:00:00.000Z',
  tags: ['kong', 'security', 'api-gateway', 'devops'],
  source: 'devto',
  alsoOn: ['hashnode'],
  originalUrl: 'https://dev.to/abdur-rakib/kong-plugins',
  isPaywalled: false,
}

describe('PostCard', () => {
  it('links to the original post in a new tab', () => {
    render(<PostCard post={post} />)
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe(post.originalUrl)
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('renders the title and excerpt', () => {
    render(<PostCard post={post} />)
    expect(screen.getByText(post.title)).toBeTruthy()
    expect(screen.getByText(post.excerpt)).toBeTruthy()
  })

  it('renders a badge for the primary source and each alsoOn source', () => {
    render(<PostCard post={post} />)
    expect(screen.getByText('dev.to')).toBeTruthy()
    expect(screen.getByText('hashnode')).toBeTruthy()
  })

  it('renders at most 3 tags', () => {
    render(<PostCard post={post} />)
    expect(screen.getAllByText(/^(kong|security|api-gateway|devops)$/)).toHaveLength(3)
  })
})
