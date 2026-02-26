// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* 🚀 OPTIMISATION ELITE : Mode Standalone pour Docker */
//   output: 'standalone',
  
//   /* 🛡️ SÉCURITÉ & RÉSEAU */
//   reactStrictMode: true,
//   poweredByHeader: false, // Discrétion de la stack pour la sécurité

//   /* 🎨 CONFIGURATION ASSETS & IMAGES */
//   images: {
//     // ✅ FIX : remotePatterns remplace domains (déprécié)
//     remotePatterns: [
//       {
//         protocol: 'http',
//         hostname: 'localhost',
//       },
//       {
//         protocol: 'https',
//         hostname: 'elite.qualisoft.sn',
//       }
//     ],
//   },

//   /* ⚡ TURBOPACK OPTIMIZATIONS */
//   experimental: {
//   },
// };

// export default nextConfig;

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' data: https://*.qualisoft.sn;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://*.qualisoft.sn;
              frame-src 'none';
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim(),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/auth/login',
        destination: '/login',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;