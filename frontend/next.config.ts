import type { NextConfig } from "next";

/**
 * 🛰️ QUALISOFT ELITE - CONFIGURATION NEXT.JS SOUVERAINE
 * -------------------------------------------------------------------------
 * RÔLE : Pilotage des en-têtes et du moteur de build.
 * OPTIMISÉ POUR : OVH / Docker / ISO 27001
 * RÉPARATION : Correction de la syntaxe ESLint et libération connect-src.
 * RÉVISION : 03 Mars 2026 | 23:45 GMT
 * -------------------------------------------------------------------------
 */

const nextConfig: NextConfig = {
  /* 🚀 1. OPTIMISATION DOCKER (VITAL POUR OVH & KUBERNETES) */
  output: "standalone",

  /* 🛡️ 2. PARAMÈTRES DE RIGUEUR TECHNIQUE */
  reactStrictMode: true,
  poweredByHeader: false, // Sécurité : Éradication de la signature technologique

  /* 🎨 3. SÉCURITÉ DES IMAGES (Multi-Tenant & Cross-Domain) */
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

  /* 🔒 4. HEADERS DE SÉCURITÉ ISO 27001 (Durcissement Matrix) */
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

  /* 🔀 5. ROUTAGE DE SÉCURITÉ (Aiguillage Souverain) */
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/auth/login",
        permanent: true,
      },
    ];
  },

  /* ⚙️ 6. CONFIGURATION DE COMPILATION (Standard Elite) */
  typescript: {
    // Rigueur absolue sur les types avant le déploiement
    ignoreBuildErrors: false, 
  },
  eslint: {
    // Blocage du build si le standard de codage Elite n'est pas respecté
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;