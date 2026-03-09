/**
 * 🌍 MODULE : ROOT LAYOUT (ELITE-SDE RD-2030)
 * -------------------------------------------------------------------------
 * RÔLE : Enveloppe principale de TOUTE l'application (Landing, Auth, Dashboard).
 * FIX CRITIQUE : Suppression de la Sidebar ici pour ne pas polluer les pages publiques.
 * RÉVISION : 09 Mars 2026 | 16:35 GMT
 * -------------------------------------------------------------------------
 */

import React from 'react';
import type { Metadata } from 'next';
import LayoutClient from './layout-client';

// Métadonnées SEO et PWA globales
export const metadata: Metadata = {
  title: 'Qualisoft Elite | Management System',
  description: 'Le standard industriel de la digitalisation QHSE.',
  themeColor: '#0B0F1A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-[#0B0F1A] text-white overflow-x-hidden custom-scrollbar m-0 p-0 antialiased selection:bg-blue-600/30 selection:text-blue-200">
        
        {/* Le LayoutClient gère l'hydratation Zustand et l'écran de chargement */}
        <LayoutClient>
          {/* C'est ici que viennent s'insérer soit la Landing, soit le Login, soit le Dashboard */}
          {children}
        </LayoutClient>

        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        `}} />
      </body>
    </html>
  );
}