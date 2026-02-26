// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/core/providers/auth-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Qualisoft Elite - Système de Management Intégré',
  description: 'Plateforme SaaS de gestion qualité ISO 9001, 14001, 45001 pour les entreprises sénégalaises',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {/* ✅ PROVIDER D'AUTHENTIFICATION POUR TOUTE L'APP */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}