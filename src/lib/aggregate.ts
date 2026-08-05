import type { Post } from './types'
import { fetchHashnode } from './sources/hashnode'
import { fetchMedium } from './sources/medium'
import { dedupeAndSort } from './dedupe'

const SOURCES = [
  { name: 'hashnode', configured: () => Boolean(process.env.HASHNODE_HOST), fetch: fetchHashnode },
  { name: 'medium', configured: () => Boolean(process.env.MEDIUM_USERNAME), fetch: fetchMedium },
] as const

export async function combinePosts(): Promise<Post[]> {
  const results = await Promise.allSettled(SOURCES.map((source) => source.fetch()))

  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      console.error(`[aggregate] ${SOURCES[i].name} source failed:`, result.reason)
    }
  })

  const configuredResults = results.filter((_, i) => SOURCES[i].configured())
  const hasTrustworthyPosts = configuredResults.some(
    (result) => result.status === 'fulfilled' && result.value.length > 0
  )
  if (
    process.env.FAIL_ON_POST_SOURCE_ERROR === 'true' &&
    configuredResults.length > 0 &&
    !hasTrustworthyPosts
  ) {
    throw new AggregateError(
      results.flatMap((result) => (result.status === 'rejected' ? [result.reason] : [])),
      'No configured post source returned trustworthy posts'
    )
  }

  const posts = results
    .filter((r): r is PromiseFulfilledResult<Post[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .filter((post): post is Post => Boolean(post))

  return dedupeAndSort(posts)
}

// Resolve the feed once per build process. Static export renders several
// independent prerender scopes (generateStaticParams, generateMetadata, page
// render) that do NOT share React's per-request cache(), so a module-scoped
// promise is what keeps every consumer on the exact same snapshot and avoids
// re-fetching the RSS endpoints for each scope. All pages are force-static,
// so dev and production builds both want this.
const postsPromise = combinePosts()

export const getAllPosts = () => postsPromise
