import { ImageResponse } from 'next/og'
import { getAllPosts } from '@/lib/aggregate'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ source: string; slug: string }>
}) {
  const { source, slug } = await params
  const posts = await getAllPosts()
  const post = posts.find((p) => p.source === source && p.slug === slug)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#09090b',
          color: '#fafafa',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 24, color: '#a1a1aa', marginBottom: 20 }}>{post?.source ?? 'blog'}</div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.15 }}>{post?.title ?? 'Post not found'}</div>
      </div>
    ),
    { ...size }
  )
}
