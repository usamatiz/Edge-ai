import type { NextConfig } from "next";

// Security headers configuration
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https://images.unsplash.com https://img.youtube.com https://i.ytimg.com https://www.google-analytics.com",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://responsivedesignchecker.com https://responsivetesttool.com https://ui.dev",
      "frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://responsivedesignchecker.com https://responsivetesttool.com https://ui.dev",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self' https://responsivedesignchecker.com https://responsivetesttool.com https://ui.dev",
      "media-src 'self' https://www.youtube.com https://youtube.com",
      "upgrade-insecure-requests"
    ].join('; ')
  }
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
};

export default nextConfig;
