/**
 * 🛰️ QUALISOFT ELITE - CONFIGURATION NEXT.JS SOUVERAINE
 * -------------------------------------------------------------------------
 * RÉPARATION : Suppression du bloc 'eslint' (conflit avec Flat Config mjs).
 * OPTIMISÉ POUR : OVH / Docker / ISO 27001
 * RÉVISION : 04 Mars 2026 | 00:05 GMT
 * -------------------------------------------------------------------------
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 🚀 1. OPTIMISATION DOCKER */
  output: "standalone",

  /* 🛡️ 2. PARAMÈTRES DE RIGUEUR TECHNIQUE */
  reactStrictMode: true,
  poweredByHeader: false, 

  /* 🎨 3. SÉCURITÉ DES IMAGES (Multi-Tenant) */
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "elite.qualisoft.sn" },
      { protocol: "https", hostname: "*.qualisoft.sn" }
    ],
  },

  /* 🔒 4. HEADERS DE SÉCURITÉ ISO 27001 (Matrix Hardened) */
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
              img-src 'self' data: blob: https://*.qualisoft.sn;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://*.qualisoft.sn wss://*.qualisoft.sn http://localhost:9000;
              frame-src 'self';
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
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },

  /* 🔀 5. ROUTAGE DE SÉCURITÉ */
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/auth/login",
        permanent: true,
      },
    ];
  },

  /* ⚙️ 6. CONFIGURATION DE COMPILATION */
  typescript: {
    // On garde la rigueur sur le typage
    ignoreBuildErrors: false,
  }
  // ✅ Note : Le bloc eslint est retiré car géré par eslint.config.mjs
};

export default nextConfig;