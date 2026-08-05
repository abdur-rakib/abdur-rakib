import type { Post } from './types'

/**
 * A post gets its own on-site page when we hold a full, trustworthy body:
 * non-empty content, not paywalled, and rendered as HTML. Paywalled or
 * truncated sources (e.g. Medium members-only stories) stay link-out.
 */
export function hasOnSitePage(post: Post): boolean {
  return post.source === 'hashnode' && Boolean(post.content) && post.contentFormat === 'html' && !post.isPaywalled
}

/**
 * Link target for a post card. On-site posts open our own page; everything
 * else opens the original article on its platform.
 */
export function postHref(post: Post): string {
  return hasOnSitePage(post) ? `/blog/${post.slug}` : post.originalUrl
}
