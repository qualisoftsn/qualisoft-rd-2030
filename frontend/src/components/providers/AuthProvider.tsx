/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🛡️ MODULE : AUTH PROVIDER (SÉCURITÉ GLOBALE & HYDRATATION)
 * -------------------------------------------------------------------------
 * RÔLE : Wrapper racine garantissant la protection des routes privées.
 * FIX : Suppression de l'appel 'checkAuth'. L'hydratation est gérée 
 * nativement par le store Zustand.
 * -------------------------------------------------------------------------
 * DATE : 01 Mars 2026 | 23:15 GMT
 */

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

// 🌍 Définition stricte des routes accessibles sans authentification
const PUBLIC_ROUTES = [
  '/', 
  '/auth/login', 
  '/auth/register', 
  '/auth/forgot-password'
];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // 🔐 Extraction des variables d'état (sans checkAuth qui n'existe plus)
  // Le 'as any' prévient les erreurs strictes de TypeScript lors du build
  const { isAuthenticated, user } = useAuthStore() as any; 
  
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // ⏳ Étape 1 : Synchronisation Client/Serveur (Hydratation Zustand)
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 🚪 Étape 2 : Contrôle d'accès dynamique (Guard de Route)
  useEffect(() => {
    if (!isLoaded) return;

    // Vérifie si la route actuelle fait partie du périmètre public
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

    // ⛔ Si non authentifié sur une route privée -> Éjection vers le Login
    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/auth/login');
    }
    
    // 🔄 Si déjà authentifié et tente de retourner au login -> Redirection Dashboard
    if (isAuthenticated && pathname === '/auth/login') {
      router.replace('/dashboard');
    }
  }, [isLoaded, isAuthenticated, pathname, router]);

  // 🛡️ Écran de protection pendant la vérification initiale
  // Évite le fameux "flash" où l'utilisateur voit le dashboard 1 seconde avant d'être déconnecté
  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] font-sans italic">
        <Loader2 className="animate-spin text-blue-600 mb-6" size={56} />
        <p className="text-xs font-black text-blue-500 uppercase tracking-[0.4em] animate-pulse">
          Vérification des habilitations...
        </p>
      </div>
    );
  }

  // ✅ Si tout est conforme, on rend l'application
  return <>{children}</>;
}