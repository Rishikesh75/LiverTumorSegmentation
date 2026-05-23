import type { NextConfig } from 'next'

const backend = process.env.BACKEND_URL ?? 'http://localhost:8080'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${backend}/api/:path*` },
      { source: '/oauth2/:path*', destination: `${backend}/oauth2/:path*` },
      {
        source: '/login/oauth2/:path*',
        destination: `${backend}/login/oauth2/:path*`,
      },
    ]
  },
}

export default nextConfig
