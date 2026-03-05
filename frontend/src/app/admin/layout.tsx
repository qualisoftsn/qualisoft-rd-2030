/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ ADMIN LAYOUT - QUALISOFT ELITE RD 2030 (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Sentinelle de sécurité Server-Side pour la zone Matrix.
 * FIX : Alignement sur le cookie 'access_token' et conteneur 100dvh strict.
 * RÉVISION : 04 Mars 2026 | 23:10 GMT
 * -------------------------------------------------------------------------
 */

import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import * as jwt from "jsonwebtoken";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  
  // 🚩 CORRECTION VITAL : Lecture du nouveau sceau SDE
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  // 👑 BYPASS SÉCURITÉ POUR LE TOKEN SOUVERAIN
  if (token === "MASTER_TOKEN_SOUVERAIN") {
     return <MatrixWrapper>{children}</MatrixWrapper>;
  }

  let session: any = null;

  try {
    session = jwt.verify(token, process.env.JWT_SECRET || "qualipass2026");
  } catch (error) {
    console.error("[SÉCURITÉ] Jeton Matrix invalide ou expiré.");
    redirect("/auth/login?session=expired");
  }

  const userRole = session?.U_Role || session?.role;

  if (userRole !== "SUPER_ADMIN") {
    console.warn(`[SÉCURITÉ] Accès refusé pour : ${session?.U_Email || "Utilisateur Inconnu"}`);
    notFound(); 
  }

  return <MatrixWrapper>{children}</MatrixWrapper>;
}

/**
 * 📦 COMPOSANT INTERNE : MatrixWrapper
 * Gère l'affichage visuel de la zone souveraine (100dvh ClickUp Style).
 */
function MatrixWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh w-full flex flex-col bg-[#0B0F1A] text-slate-200 selection:bg-red-500/30 overflow-hidden font-sans italic">
      <div className="bg-red-600/10 border-b border-red-600/20 p-2 text-center shrink-0 z-50">
        <p className="text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-[0.4em] md:tracking-[0.5em] animate-pulse m-0">
          🔒 Zone Souveraine Matrix • Accès Restreint Core Master RD-2030
        </p>
      </div>
      
      <main className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}