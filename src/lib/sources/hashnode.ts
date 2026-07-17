import type { Post } from '../types'
import { estimateReadingMinutes } from '../readingTime'

const HASHNODE_API = 'https://gql.hashnode.com'

const POSTS_QUERY = `
  query PublicationPosts($host: String!) {
    publication(host: $host) {
      posts(first: 50) {
        edges {
          node {
            title
            slug
            brief
            url
            publishedAt
            tags { name }
            coverImage { url }
            content { markdown }
          }
        }
      }
    }
  }
`

interface HashnodePostNode {
  title: string
  slug: string
  brief: string
  url: string
  publishedAt: string
  tags: { name: string }[]
  coverImage: { url: string } | null
  content: { markdown: string }
}

interface HashnodeResponse {
  data: {
    publication: {
      posts: { edges: { node: HashnodePostNode }[] }
    } | null
  }
}

export async function fetchHashnode(): Promise<Post[]> {
  const host = process.env.HASHNODE_HOST
  if (!host) return []

  const res = await fetch(HASHNODE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: POSTS_QUERY, variables: { host } }),
  })
  if (!res.ok) {
    throw new Error(`Hashnode fetch failed: ${res.status}`)
  }

  const json = (await res.json()) as HashnodeResponse
  const publication = json.data.publication
  if (!publication) return []

  return publication.posts.edges.map(({ node }) => toPost(node))
}

function toPost(node: HashnodePostNode): Post {
  return {
    id: `hashnode-${node.slug}`,
    title: node.title,
    slug: node.slug,
    excerpt: node.brief,
    content: node.content.markdown,
    contentFormat: 'markdown',
    readingMinutes: estimateReadingMinutes(node.content.markdown, 'markdown'),
    coverImage: node.coverImage?.url ?? null,
    publishedAt: node.publishedAt,
    tags: node.tags.map((tag) => tag.name),
    source: 'hashnode',
    alsoOn: [],
    originalUrl: node.url,
    isPaywalled: false,
  }
}
