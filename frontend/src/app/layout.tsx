/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ ROOT LAYOUT - QUALISOFT ELITE SOUVERAIN
 * -------------------------------------------------------------------------
 * RÔLE : Structure HTML globale et Point d'ancrage du Noyau de Sécurité.
 * FONCTION : Activation de l'AuthProvider (Zéro NextAuth) & Toaster Sonner.
 * RÉVISION : 03 Mars 2026 | 00:55 GMT
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import AuthProvider from './providers'; // Importation du Provider Fusionné
import { TrialProvider } from '@/providers/TrialProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Qualisoft Elite RD 2026',
  description: 'Souveraineté Numérique et Gestion Multi-Tenant Matrix OS',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#0B0F1A] text-slate-200 min-h-screen antialiased selection:bg-blue-500/30 overflow-x-hidden`}>
        
        {/* 🛡️ SENTINELLE MATRIX : Englobe l'application pour le contrôle d'accès */}
        <AuthProvider>
          
          <main className="relative flex flex-col min-h-screen">
             {children}
          </main>

        </AuthProvider>
        
        {/* 🔔 SYSTÈME DE NOTIFICATIONS ELITE */}
        <Toaster 
          position="top-right" 
          theme="dark" 
          richColors 
          closeButton
          toastOptions={{
            style: {
              background: '#0F172A',
              border: '1px solid rgba(255,255,255,0.05)',
              color: '#F8FAFC',
              fontStyle: 'italic',
              fontFamily: 'var(--font-inter)',
              borderRadius: '1.5rem',
            },
          }}
        />
      </body>
    </html>
  );
}