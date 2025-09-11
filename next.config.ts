import type { NextConfig } from "next";

// Security headers configuration - DISABLED for network testing
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  // Disabled Strict-Transport-Security for local network testing
  // {
  //   key: 'Strict-Transport-Security',
  //   value: 'max-age=63072000; includeSubDomains; preload'
  // },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  // Disabled X-Frame-Options for network testing
  // {
  //   key: 'X-Frame-Options',
  //   value: 'SAMEORIGIN'
  // },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  // Disabled Referrer-Policy for network testing
  // {
  //   key: 'Referrer-Policy',
  //   value: 'strict-origin-when-cross-origin'
  // },
  // Disabled Permissions-Policy for network testing
  // {
  //   key: 'Permissions-Policy',
  //   value: 'camera=(), microphone=(), geolocation=()'
  // },
  // Disabled Content-Security-Policy for network testing
  // {
  //   key: 'Content-Security-Policy',
  //   value: [
  //     "default-src 'self'",
  //     "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://accounts.google.com",
  //     "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  //     "font-src 'self' https://fonts.gstatic.com data:",
  //     "img-src 'self' data: https://images.unsplash.com https://img.youtube.com https://i.ytimg.com https://www.google-analytics.com",
  //     "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://responsivedesignchecker.com https://responsivetesttool.com https://ui.dev https://oauth2.googleapis.com https://www.googleapis.com https://accounts.google.com https://*.s3.eu-north-1.amazonaws.com https://*.s3.amazonaws.com",
  //     "frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://responsivedesignchecker.com https://responsivetesttool.com https://ui.dev https://accounts.google.com https://*.s3.eu-north-1.amazonaws.com https://*.s3.amazonaws.com",
  //     "object-src 'none'",
  //     "base-uri 'self'",
  //     "form-action 'self'",
  //     "frame-ancestors 'self' https://responsivedesignchecker.com https://responsivetesttool.com https://ui.dev",
  //     "media-src 'self' https://www.youtube.com https://youtube.com https://*.s3.eu-north-1.amazonaws.com https://*.s3.amazonaws.com",
  //     "upgrade-insecure-requests"
  //   ].join('; ')
  // }
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'files2.heygen.ai',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  // Enable experimental features for better security
  serverExternalPackages: ['dompurify'],
  // Disable X-Powered-By header for security
  poweredByHeader: false,
  // Configure server timeout (if supported by your hosting platform)
  serverRuntimeConfig: {
    // Increase timeout for API routes
    maxDuration: 1800, // 30 minutes in seconds
  },
  // Increase function timeout for Vercel/Cloudflare
  experimental: {
    serverComponentsExternalPackages: ['dompurify'],
  },
};

export default nextConfig;
