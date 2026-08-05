import type { Post } from './types'

/** Link target for a post card. Every post has an internal detail page. */
export function postHref(post: Post): string {
  return `/blog/${post.slug}`
}
