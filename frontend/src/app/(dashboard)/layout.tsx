/**
 * CHEMIN ABSOLU : /src/app/(dashboard)/layout.tsx
 * PROJET : Qualisoft Elite (Frontend)
 * RÔLE : Layout sécurisé via JWT Souverain (Zéro Next-Auth)
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as jwt from "jsonwebtoken";
import React from "react";
import TrialBanner from '@/components/TrialBanner';
import Sidebar from '../dashboard/sidebar'; 

export default async function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // 1. Récupération du token depuis les cookies (Next.js 15)
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  // 2. Redirection si aucun jeton n'est présent
  if (!token) {
    redirect('/auth/login');
  }

  let user: any = null;

  try {
    // 3. Décodage du jeton avec le secret du Kernel
    // On caste en 'any' pour accéder aux propriétés Matrix (U_Role, tenantId)
    user = jwt.verify(token, process.env.JWT_SECRET || "qualipass2026");
  } catch (error) {
    // Si le token est corrompu ou expiré
    redirect('/auth/login');
  }

  // 4. Extraction des radicaux de sécurité Matrix
  const isSuperAdmin = 
    user.U_Role === 'SUPER_ADMIN' || 
    user.U_Email === 'ab.thiongane@qualisoft.sn';
  
  const isTrial = user.tenantId === 'ESSAI';

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans">
      {/* 🚩 Injection des données utilisateur dans le Banner */}
      <TrialBanner user={user} isSuperAdmin={isSuperAdmin} />
      
      <div className={isTrial ? 'pt-20' : ''}>
        <div className="flex">
          {/* 🚩 Injection des données utilisateur dans la Sidebar */}
          <Sidebar user={user} isSuperAdmin={isSuperAdmin} />
          
          <main className="flex-1 ml-72 min-h-screen relative overflow-hidden bg-slate-900/50">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}