/**
 * CHEMIN ABSOLU : /src/app/layout.tsx
 * RÔLE : Layout racine avec protection de session et aiguillage public/privé.
 */

"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Lecture de l'état global
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  // Définition des zones publiques (Landing Page et Auth)
  const isPublicPage = pathname === '/' || pathname.startsWith('/auth');

  useEffect(() => {
    // CAS 1 : Page Publique (Landing / Login)
    // On autorise l'affichage immédiat sans vérifier le token
    if (isPublicPage) {
      setIsReady(true);
      return;
    }

    // CAS 2 : Pages Privées (Dashboard / Admin)
    // On attend que Zustand ait fini de lire le stockage local
    if (isInitialized) {
      if (!isAuthenticated) {
        // Redirection vers le login si aucune session trouvée
        router.replace("/auth/login");
      } else {
        // Session valide, on libère l'interface
        setIsReady(true);
      }
    }
  }, [isAuthenticated, isInitialized, pathname, isPublicPage, router]);

  // --- RENDU DU LOADER MATRIX ---
  // On ne l'affiche QUE pour les pages privées en cours de vérification
  if (!isReady && !isPublicPage) {
    return (
      <html lang="fr">
        <body className="bg-[#0B0F1A]">
          <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic animate-pulse">
              Vérification des accès Matrix...
            </p>
          </div>
        </body>
      </html>
    );
  }

  // --- RENDU GLOBAL (Landing Page & Dashboard) ---
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="bg-[#0B0F1A] text-white antialiased">
        {children}
      </body>
    </html>
  );
}