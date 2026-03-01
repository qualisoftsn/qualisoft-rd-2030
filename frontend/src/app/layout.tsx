/**
 * 🛰️ ROOT LAYOUT - QUALISOFT ELITE SOUVERAIN
 * -------------------------------------------------------------------------
 * RÔLE : Structure HTML globale (Zéro NextAuth, 100% Custom JWT)
 * -------------------------------------------------------------------------
 */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Qualisoft Elite RD 2030',
  description: 'Souveraineté Numérique et Gestion Multi-Tenant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} bg-[#0B0F1A] text-slate-200 min-h-screen antialiased selection:bg-blue-500/30`}>
        {/* On affiche directement les enfants, sans SessionProvider de NextAuth */}
        {children}
        
        {/* Système de notifications Toast */}
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  );
}