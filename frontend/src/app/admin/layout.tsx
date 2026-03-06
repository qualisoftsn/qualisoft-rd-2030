/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : MATRIX MASTER SENTINEL (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Protection périmétrique du Master Node (SuperAdmin).
 * DESIGN : 100dvh, Industrial Dark, Security Overlay.
 * RÉVISION : 06 Mars 2026 | 19:45 GMT
 * -------------------------------------------------------------------------
 */

import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import * as jwt from "jsonwebtoken";
import React from "react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) redirect("/auth/login");

  try {
    // Vérification cryptographique du grade
    const session: any = jwt.verify(token, process.env.JWT_SECRET || "qualisoft-secret-2026");
    if (session.U_Role !== "SUPER_ADMIN") notFound();
  } catch (err) {
    redirect("/auth/login?reason=session_expired");
  }

  return (
    <div className="h-dvh w-full flex flex-col bg-[#0B0F1A] text-slate-200 selection:bg-blue-600/30 overflow-hidden font-sans italic">
      {/* BANDEAU DE PROTOCOLE SDE */}
      <div className="bg-blue-600/10 border-b border-blue-600/20 p-2 text-center shrink-0 z-50">
        <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.5em] animate-pulse m-0">
          🔒 KERNEL MASTER-CORE : ACCÈS NIVEAU 0 • TOUTES LES OPÉRATIONS SONT SCELLÉES
        </p>
      </div>
      <main className="flex-1 min-h-0 relative flex flex-col">{children}</main>
    </div>
  );
}