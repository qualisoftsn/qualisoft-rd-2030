/**
 * CHEMIN ABSOLU : /src/app/layout.tsx
 */
"use client";

import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  const isPublicPage = pathname === "/" || pathname.startsWith("/auth");

  useEffect(() => {
    // Force l'affichage immédiat pour les pages publiques
    if (isPublicPage) {
      setIsReady(true);
      return;
    }

    // Gestion des pages privées
    if (isInitialized) {
      if (!isAuthenticated) {
        router.replace("/auth/login");
      } else {
        setIsReady(true);
      }
    }

    // Sécurité : Si après 3 secondes on est toujours bloqué, on libère (fail-safe)
    const safetyTimer = setTimeout(() => setIsReady(true), 3000);
    return () => clearTimeout(safetyTimer);
  }, [isAuthenticated, isInitialized, pathname, isPublicPage, router]);

  if (!isReady && !isPublicPage) {
    return (
      <html lang="fr">
        <body className="bg-[#0B0F1A]">
          <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic animate-pulse">
              Synchronisation Matrix...
            </p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="fr" className="scroll-smooth">
      <body className="bg-[#0B0F1A] text-white antialiased">{children}</body>
    </html>
  );
}
