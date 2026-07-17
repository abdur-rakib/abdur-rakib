import { cache } from 'react'
import type { Post } from './types'
import { fetchHashnode } from './sources/hashnode'
import { fetchMedium } from './sources/medium'
import { dedupeAndSort } from './dedupe'

const SOURCE_NAMES = ['hashnode', 'medium'] as const

export async function combinePosts(): Promise<Post[]> {
  const results = await Promise.allSettled([fetchHashnode(), fetchMedium()])

  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.error(`[aggregate] ${SOURCE_NAMES[i]} source failed:`, result.reason)
    }
  })

  const posts = results
    .filter((r): r is PromiseFulfilledResult<Post[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .filter((post): post is Post => Boolean(post))

  return dedupeAndSort(posts)
}

export const getAllPosts = cache(combinePosts)
