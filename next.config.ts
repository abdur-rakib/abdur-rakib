import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/portfolio-site',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
