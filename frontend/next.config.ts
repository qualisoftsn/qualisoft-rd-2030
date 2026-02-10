import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 🚀 OPTIMISATION ELITE : Mode Standalone pour Docker */
  output: 'standalone',
  
  /* 🛡️ SÉCURITÉ & RÉSEAU */
  reactStrictMode: true,
  poweredByHeader: false, // Discrétion de la stack pour la sécurité

  /* 🎨 CONFIGURATION ASSETS & IMAGES */
  images: {
    // ✅ FIX : remotePatterns remplace domains (déprécié)
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'elite.qualisoft.sn',
      }
    ],
  },

  /* ⚡ TURBOPACK OPTIMIZATIONS */
  experimental: {
  },
};

export default nextConfig;