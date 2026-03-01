/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import * as jwt from "jsonwebtoken";
import React from "react";

/**
 * 🛰️ ADMIN LAYOUT - QUALISOFT ELITE RD 2030
 * -------------------------------------------------------------------------
 * RÔLE : Sentinelle de sécurité Server-Side pour la zone Matrix.
 * -------------------------------------------------------------------------
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Récupération du Cookie Store (Next.js 15)
  const cookieStore = await cookies();
  
  // 🚩 CORRECTION : On utilise le nom exact scellé dans le login
  const token = cookieStore.get("qualisoft_token")?.value;

  // 2. Si aucun jeton n'est présent -> Redirection immédiate vers le Login
  if (!token) {
    redirect("/auth/login");
  }

  // 👑 BYPASS SÉCURITÉ POUR LE TOKEN SOUVERAIN (Abdoulaye Thiongane)
  // Permet d'accéder à la console même si le backend est en maintenance
  if (token === "MASTER_TOKEN_SOUVERAIN") {
     return <MatrixWrapper>{children}</MatrixWrapper>;
  }

  let session: any = null;

  try {
    /**
     * 3. VÉRIFICATION DU JETON
     * On utilise le secret partagé avec le Backend NestJS.
     * Si le secret n'est pas dans le .env, on utilise le fallback de sécurité.
     */
    session = jwt.verify(token, process.env.JWT_SECRET || "qualipass2026");
  } catch (error) {
    // Jeton expiré, corrompu ou signature invalide
    console.error("[SÉCURITÉ] Jeton Matrix invalide ou expiré.");
    redirect("/auth/login");
  }

  /**
   * 🛡️ LE TEST DE SOUVERAINETÉ MATRIX
   * Seul un utilisateur avec le rôle SUPER_ADMIN peut franchir cette porte.
   */
  const userRole = session?.U_Role || session?.role; // Supporte les deux formats de payload

  if (userRole !== "SUPER_ADMIN") {
    // 🚨 ALERTE : Tentative d'accès non autorisé
    console.warn(`[SÉCURITÉ] Accès refusé pour : ${session?.U_Email || "Utilisateur Inconnu"}`);
    
    // On renvoie une 404 pour "masquer" l'existence de la console aux intrus
    notFound(); 
  }

  // 4. ACCÈS ACCORDÉ
  return <MatrixWrapper>{children}</MatrixWrapper>;
}

/**
 * 📦 COMPOSANT INTERNE : MatrixWrapper
 * Gère l'affichage visuel de la zone souveraine.
 */
function MatrixWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-200 selection:bg-red-500/30">
      {/* Bannière de Contrôle Matrix - Identité Visuelle Master */}
      <div className="bg-red-600/10 border-b border-red-600/20 p-3 text-center sticky top-0 z-100 backdrop-blur-md">
        <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.5em] animate-pulse">
          🔒 Zone Souveraine Matrix • Accès Restreint Core Master RD-2030
        </p>
      </div>
      
      <main className="relative">
        {children}
      </main>
    </div>
  );
}