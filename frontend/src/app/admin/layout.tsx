/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. On rÃ©cupÃ¨re la session cÃ´tÃ© serveur (Inviolable)
  const session = await getServerSession(authOptions);

  // 2. Si pas connectÃ© -> Dehors
  if (!isAuthenticated?.user) {
    redirect("/auth/login");
  }

  // 3. LE TEST ULTIME : Est-ce un SUPER_ADMIN ?
  // On caste en 'any' car TypeScript peut Ãªtre strict sur les types Ã©tendus
  const userRole = (session.user as any).U_Role;

  if (userRole !== "SUPER_ADMIN") {
    // ðŸš¨ ALERTE : Un utilisateur connectÃ© (ex: Admin SDE) essaie de forcer l'URL
    console.warn(`[SÃ‰CURITÃ‰] Tentative d'accÃ¨s Matrix bloquÃ©e pour : ${session.user.email}`);
    
    // OPTION RADICALE : On renvoie une 404.
    // L'utilisateur pensera que la page n'existe pas.
    notFound(); 
  }

  // 4. Si on arrive ici, c'est le CHEF. On affiche l'interface.
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Tu peux ajouter ici une banniÃ¨re "Matrix" visible sur toutes les pages admin */}
      <div className="bg-red-900/20 border-b border-red-900/50 p-2 text-center">
        <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">
          ðŸ”’ Zone Souveraine Matrix â€¢ AccÃ¨s Restreint
        </p>
      </div>
      {children}
    </div>
  );
}