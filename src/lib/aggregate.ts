import { cache } from 'react'
import type { Post } from './types'
import { fetchHashnode } from './sources/hashnode'
import { fetchMedium } from './sources/medium'
import { dedupeAndSort } from './dedupe'

export async function combinePosts(): Promise<Post[]> {
  const results = await Promise.allSettled([fetchHashnode(), fetchMedium()])

  const posts = results
    .filter((r): r is PromiseFulfilledResult<Post[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .filter((post): post is Post => Boolean(post))

  return dedupeAndSort(posts)
}

export const getAllPosts = cache(combinePosts)
