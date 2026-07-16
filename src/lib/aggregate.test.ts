import { describe, expect, it, vi } from 'vitest'
import type { Post } from './types'

const devtoPost: Post = {
  id: 'devto-a', title: 'A', slug: 'a', excerpt: '', content: '', contentFormat: 'markdown',
  coverImage: null, publishedAt: '2026-01-01T00:00:00.000Z', tags: [], source: 'devto',
  alsoOn: [], originalUrl: 'https://dev.to/a', isPaywalled: false,
}
const hashnodePost: Post = {
  id: 'hashnode-b', title: 'B', slug: 'b', excerpt: '', content: '', contentFormat: 'markdown',
  coverImage: null, publishedAt: '2026-02-01T00:00:00.000Z', tags: [], source: 'hashnode',
  alsoOn: [], originalUrl: 'https://hashnode.dev/b', isPaywalled: false,
}

vi.mock('./sources/devto', () => ({ fetchDevto: vi.fn(async () => [devtoPost]) }))
vi.mock('./sources/hashnode', () => ({
  fetchHashnode: vi.fn(async () => {
    throw new Error('hashnode is down')
  }),
}))
vi.mock('./sources/medium', () => ({ fetchMedium: vi.fn(async () => [hashnodePost]) }))

describe('combinePosts', () => {
  it('merges posts from sources that succeed and ignores sources that fail', async () => {
    const { combinePosts } = await import('./aggregate')
    const result = await combinePosts()

    expect(result).toHaveLength(2)
    expect(result.map((p) => p.id).sort()).toEqual(['devto-a', 'hashnode-b'])
  })

  it('sorts the merged result by publishedAt descending', async () => {
    const { combinePosts } = await import('./aggregate')
    const result = await combinePosts()

    expect(result[0].id).toBe('hashnode-b')
    expect(result[1].id).toBe('devto-a')
  })
})
