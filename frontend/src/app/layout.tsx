"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // ✅ On récupère isInitialized pour savoir si Zustand a fini de lire le localStorage
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  const isPublicPage = pathname === '/' || pathname.startsWith('/auth');

  useEffect(() => {
    // 1. Si la page est publique, on ne bloque JAMAIS l'affichage
    if (isPublicPage) {
      setIsReady(true);
      return;
    }

    // 2. Pour les pages privées, on attend que Zustand soit prêt
    if (isInitialized) {
      if (!isAuthenticated) {
        router.replace("/auth/login");
      } else {
        setIsReady(true);
      }
    }
  }, [isAuthenticated, isInitialized, pathname, isPublicPage, router]);

  // Loader Matrix : Uniquement pour les pages privées en attente
  if (!isReady && !isPublicPage) {
    return (
      <html lang="fr">
        <body className="bg-[#0B0F1A]">
          <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">
              Vérification des accès Matrix...
            </p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="fr" className="scroll-smooth">
      <body className="bg-[#0B0F1A] text-white antialiased">
        {children}
      </body>
    </html>
  );
}