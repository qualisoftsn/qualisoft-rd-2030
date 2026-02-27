import type { NextConfig } from "next";

/**
 * 🛰️ QUALISOFT ELITE - CONFIGURATION NEXT.JS SOUVERAINE
 * OPTIMISÉ POUR : OVH / Docker / ISO 27001
 */
const nextConfig: NextConfig = {
  /* 🚀 1. OPTIMISATION DOCKER (VITAL POUR OVH) */
  output: "standalone",

  /* 🛡️ 2. PARAMÈTRES GLOBAUX */
  reactStrictMode: true,
  poweredByHeader: false, // Sécurité : Masque la signature "X-Powered-By: Next.js"

  /* 🎨 3. SÉCURITÉ DES IMAGES (Multi-Tenant) */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "elite.qualisoft.sn",
      },
      {
        protocol: "https",
        hostname: "*.qualisoft.sn",
      }
    ],
  },

  /* 🔒 4. HEADERS DE SÉCURITÉ ISO 27001 (0 Tracker Externe) */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' data: https://*.qualisoft.sn;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://*.qualisoft.sn wss://*.qualisoft.sn;
              frame-src 'none';
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, " ").trim(),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  /* 🔀 5. ROUTAGE DE SÉCURITÉ */
  async redirects() {
    return [
      {
        // Capture les anciens liens /login et les redirige vers l'architecture propre
        source: "/login",
        destination: "/auth/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;