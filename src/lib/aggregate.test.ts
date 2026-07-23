import { afterEach, describe, expect, it, vi } from 'vitest'
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
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('merges posts from sources that succeed when failed sources are not configured', async () => {
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

  it('fails the build when no configured source returns posts', async () => {
    vi.stubEnv('HASHNODE_HOST', 'abdur-rakib.hashnode.dev')
    vi.stubEnv('MEDIUM_USERNAME', '')
    vi.stubEnv('FAIL_ON_POST_SOURCE_ERROR', 'true')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { combinePosts } = await import('./aggregate')

    await expect(combinePosts()).rejects.toThrow('No configured post source returned trustworthy posts')
    errorSpy.mockRestore()
  })

  it('preserves partial results when another configured source succeeds', async () => {
    vi.stubEnv('HASHNODE_HOST', 'abdur-rakib.hashnode.dev')
    vi.stubEnv('MEDIUM_USERNAME', '@abdur-rakib')
    vi.stubEnv('FAIL_ON_POST_SOURCE_ERROR', 'true')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { combinePosts } = await import('./aggregate')

    await expect(combinePosts()).resolves.toEqual([mediumPost])
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
