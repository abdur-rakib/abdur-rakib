export type PostSource = 'devto' | 'hashnode' | 'medium'

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  contentFormat: 'markdown' | 'html'
  coverImage: string | null
  publishedAt: string
  tags: string[]
  source: PostSource
  alsoOn: PostSource[]
  originalUrl: string
  isPaywalled: boolean
}
