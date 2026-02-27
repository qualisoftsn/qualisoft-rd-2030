/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import * as jwt from "jsonwebtoken";
import React from "react";

/**
 * 🛰️ ADMIN LAYOUT - QUALISOFT ELITE RD 2030
 * RÔLE : Sentinelle de sécurité pour la zone Matrix (SUPER_ADMIN uniquement).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Récupération du Cookie Store (Next.js 15)
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  // 2. Si aucun jeton n'est présent -> Redirection vers la porte d'entrée
  if (!token) {
    redirect("/auth/login");
  }

  let session: any = null;

  try {
    // 3. Décodage et vérification du Jeton (Utilisation du secret Kernel)
    session = jwt.verify(token, process.env.JWT_SECRET || "qualipass2026");
  } catch (error) {
    // Jeton expiré ou corrompu
    redirect("/auth/login");
  }

  /**
   * 🛡️ LE TEST DE SOUVERAINETÉ Matrix
   * Seul un utilisateur possédant le rôle SUPER_ADMIN (Abdoulaye Thiongane)
   * peut franchir cette porte.
   */
  const userRole = session?.U_Role;

  if (userRole !== "SUPER_ADMIN") {
    // 🚨 ALERTE : Tentative d'intrusion détectée sur la zone Matrix
    console.warn(
      `[SÉCURITÉ] Accès Matrix bloqué pour : ${session?.U_Email || "Inconnu"}`
    );
    
    // On renvoie une 404 pour masquer l'existence même de l'interface admin
    notFound(); 
  }

  // 4. ACCÈS AUTORISÉ : Déploiement de l'interface Matrix
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Bannière de Contrôle Matrix */}
      <div className="bg-red-900/20 border-b border-red-900/50 p-2 text-center">
        <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">
          🔒 Zone Souveraine Matrix • Accès Restreint Core Master
        </p>
      </div>
      
      <main>
        {children}
      </main>
    </div>
  );
}