import { describe, expect, it, vi } from 'vitest'
import type { Post } from './types'

const mediumPost: Post = {
  id: 'medium-b', title: 'B', slug: 'b', excerpt: '', content: '', contentFormat: 'markdown',
  readingMinutes: 1, coverImage: null, publishedAt: '2026-02-01T00:00:00.000Z', tags: [], source: 'medium',
  alsoOn: [], originalUrl: 'https://medium.com/b', isPaywalled: false,
}

vi.mock('./sources/hashnode', () => ({
  fetchHashnode: vi.fn(async () => {
    throw new Error('hashnode is down')
  }),
}))
vi.mock('./sources/medium', () => ({
  fetchMedium: vi.fn(async () => [mediumPost, undefined] as Post[]),
}))

describe('combinePosts', () => {
  it('merges posts from sources that succeed and ignores sources that fail', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { combinePosts } = await import('./aggregate')
    const result = await combinePosts()

    expect(result).toHaveLength(1)
    expect(result.map((p) => p.id)).toEqual(['medium-b'])
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('hashnode source failed'),
      expect.any(Error)
    )
    errorSpy.mockRestore()
  })

  it('sorts the merged result by publishedAt descending', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { combinePosts } = await import('./aggregate')
    const result = await combinePosts()

    expect(result[0].id).toBe('medium-b')
    errorSpy.mockRestore()
  })
})
