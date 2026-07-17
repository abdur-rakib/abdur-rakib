export type PostSource = 'hashnode' | 'medium'

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  /** Full post body. Server-only — stripped before serializing to client components. */
  content?: string
  contentFormat: 'markdown' | 'html'
  readingMinutes: number
  coverImage: string | null
  publishedAt: string
  tags: string[]
  source: PostSource
  alsoOn: PostSource[]
  originalUrl: string
  isPaywalled: boolean
}
