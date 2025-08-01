import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // ❗ Build will succeed even if there are TS errors
    ignoreBuildErrors: true
  },
  // Optional: also skip ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true
  }
}

export default nextConfig
