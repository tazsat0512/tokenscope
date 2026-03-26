import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@reivo/shared'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.clerk.com https://img.clerk.com; font-src 'self'; connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://api.stripe.com; frame-src https://*.clerk.accounts.dev https://challenges.cloudflare.com https://js.stripe.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
