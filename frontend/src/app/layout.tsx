/**
 * ARCHITECTURE : App Router (Next.js 16)
 * RÔLE : Point d'entrée racine du SMI Qualisoft ELITE.
 * FONCTION : Centralise les contextes (Auth, Tenant, Trial) et définit la structure HTML de base.
 */

import "./globals.css";
import React from "react";
import { Toaster } from "sonner";

// 🔐 Authentification : Gère la session NextAuth
import AuthProvider from "@/components/providers/AuthProvider"; 
// 🔄 Synchronisation : Assure la cohérence de la session entre onglets
import AuthSync from "@/components/auth/AuthSync"; 
// 🏢 Contexte Client : Gère les données spécifiques au Tenant (Client)
import { TenantProvider } from "@/context/TenantContext";
// ⏳ Gestion d'Essai : Gère les restrictions et bannières de la version Trial
import { TrialProvider } from "@/components/providers/TrialProvider";

export const metadata = {
  title: "Qualisoft ELITE",
  description: "Pilotage souverain de votre conformité et management QSE",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="antialiased bg-[#0B0F1A] text-slate-200 selection:bg-blue-500/30">
        
        {/* 1. Couche Auth : Nécessaire pour identifier l'utilisateur avant tout contexte métier */}
        <AuthProvider>
          
          {/* 2. Couche Tenant : Injecte les données de l'organisation une fois authentifié */}
          <TenantProvider>
            
            {/* 3. Couche Trial : Surveille l'état de la licence sur toutes les routes dashboard */}
            <TrialProvider>
              
              {/* 4. Couche Sync : Maintient l'état applicatif cohérent */}
              <AuthSync>
                
                {/* 🚀 Contenu de l'application (Pages & Dashboards) */}
                {children}
                
              </AuthSync>
              
            </TrialProvider>
          </TenantProvider>
        </AuthProvider>

        {/* 🍞 Notification System (Design Elite) */}
        <Toaster position="top-right" richColors closeButton />
        
      </body>
    </html>
  );
}