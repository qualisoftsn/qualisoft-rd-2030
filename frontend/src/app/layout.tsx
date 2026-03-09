// AJOUT CRUCIAL : L'import du CSS qui redonne vie à ton design Tailwind
import './globals.css'; 
// (Si ton fichier CSS est ailleurs, par exemple import '@/core/styles/globals.css', ajuste le chemin)

import React from 'react';
import type { Metadata } from 'next';
import LayoutClient from './layout-client';

export const metadata: Metadata = {
  title: 'Qualisoft Elite | Management System',
  description: 'Le standard de la digitalisation QHSE.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-[#0B0F1A] text-white overflow-x-hidden m-0 p-0 antialiased">
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}