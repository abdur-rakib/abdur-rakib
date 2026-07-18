import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 27,
            height: 27,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#09090b',
            color: '#fafafa',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'sans-serif',
            letterSpacing: -0.5,
            borderRadius: 7,
          }}
        >
          AR
        </div>
      </div>
    ),
    { ...size }
  )
}
