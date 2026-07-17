import { ImageResponse } from 'next/og'
import { site } from '@/config/site'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
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
        <div style={{ fontSize: 28, color: '#a1a1aa', marginBottom: 16 }}>{site.location}</div>
        <div style={{ fontSize: 64, fontWeight: 700 }}>{site.name}</div>
        <div style={{ fontSize: 32, color: '#a1a1aa', marginTop: 12 }}>{site.role}</div>
      </div>
    ),
    { ...size }
  )
}
