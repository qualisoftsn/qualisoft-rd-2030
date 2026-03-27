/* eslint-disable @typescript-eslint/no-unused-vars */
import './globals.css';

import React from 'react';
import type { Metadata, Viewport } from 'next';
import LayoutClient from './layout-client';
import Providers from './providers';

// ============================================================================
// METADATA (SEO)
// ============================================================================

export const metadata: Metadata = {
  title: {
    default: 'Qualisoft Elite | Management System',
    template: '%s | Qualisoft Elite'
  },
  description: 'Le standard de la digitalisation QHSE. ISO 9001, 14001, 45001.',
  keywords: ['QHSE', 'ISO 9001', 'ISO 14001', 'ISO 45001', 'Sénégal', 'Afrique', 'Management'],
  authors: [{ name: 'Qualisoft Elite', url: 'https://qualisoft.sn' }],
  creator: 'Qualisoft Elite',
  publisher: 'Qualisoft Corporate',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_SN',
    url: 'https://qualisoft.sn',
    siteName: 'Qualisoft Elite',
    title: 'Qualisoft Elite | Management System',
    description: 'Le standard de la digitalisation QHSE.',
    images: [
      {
        url: '/images/qs-og-image.png',
        width: 1200,
        height: 630,
        alt: 'Qualisoft Elite - Dashboard QHSE',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qualisoft Elite | Management System',
    description: 'Le standard de la digitalisation QHSE.',
    images: ['/images/qs-twitter-image.png'],
    creator: '@qualisoft_sn',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0F1A' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#0B0F1A] text-white overflow-x-hidden m-0 p-0 antialiased selection:bg-blue-600/30 selection:text-white">
        {/* Skip Link for Accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-black focus:uppercase focus:text-[10px] focus:tracking-widest"
        >
          Aller au contenu principal
        </a>
        
        <Providers>
          <LayoutClient>
            <main id="main-content" className="min-h-screen">
              {children}
            </main>
          </LayoutClient>
        </Providers>
      </body>
    </html>
  );
}