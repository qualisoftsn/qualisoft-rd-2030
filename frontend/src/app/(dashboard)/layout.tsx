/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * CHEMIN ABSOLU : /src/app/(dashboard)/layout.tsx
 * PROJET : Qualisoft Elite RD 2030 (Frontend)
 * RÔLE : Layout sécurisé Server-Side via JWT (Zéro Next-Auth)
 * -------------------------------------------------------------------------
 * MODIFICATION : Alignement sur le cookie 'qualisoft_token' et bypass Master.
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
  // 1. Récupération du Cookie Store (Next.js 15)
  const cookieStore = await cookies();
  
  // 🚩 CORRECTION : On pointe vers le nom de cookie défini dans ton login souverain
  const token = cookieStore.get("qualisoft_token")?.value;

  // 2. Redirection immédiate si le douanier ne voit pas de jeton
  if (!token) {
    redirect('/auth/login');
  }

  let user: any = null;

  // 👑 CAS PARTICULIER : BYPASS POUR LE TOKEN DE SECOURS MASTER
  if (token === "MASTER_TOKEN_SOUVERAIN") {
    user = {
      U_Email: 'ab.thiongane@qualisoft.sn',
      U_Role: 'SUPER_ADMIN',
      tenantId: 'MATRIX_CORE',
      U_FirstName: 'Abdoulaye',
      U_LastName: 'Thiongane'
    };
  } else {
    try {
      /**
       * 3. DÉCODAGE ET VALIDATION DU JETON
       * On utilise le secret partagé avec le Backend NestJS (qualipass2026).
       */
      user = jwt.verify(token, process.env.JWT_SECRET || "qualipass2026");
    } catch (error) {
      // Si le token est expiré, corrompu ou que la signature ne match pas
      console.error("[SÉCURITÉ] Jeton Dashboard invalide ou expiré.");
      redirect('/auth/login');
    }
  }

  // 4. EXTRACTION DES RADICAUX DE SÉCURITÉ MATRIX
  // On gère les deux formats possibles de payload (U_Role ou role)
  const isSuperAdmin = 
    user.U_Role === 'SUPER_ADMIN' || 
    user.role === 'SUPER_ADMIN' ||
    user.U_Email === 'ab.thiongane@qualisoft.sn';
  
  // Détection du mode Essai/Trial pour l'affichage du Banner
  const isTrial = user.tenantId === 'ESSAI' || user.T_Plan === 'TRIAL';

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white italic font-sans selection:bg-blue-500/30">
      
      {/* 🛠️ INJECTION DU CONTEXTE DANS LE BANNER DE TRIAL */}
      <TrialBanner user={user} isSuperAdmin={isSuperAdmin} />
      
      {/* Décalage du contenu si le Banner est présent */}
      <div className={isTrial ? 'pt-20' : ''}>
        <div className="flex">
          
          {/* 🛠️ SIDEBAR : NAVIGATION SOUVERAINE */}
          {/* On injecte l'objet user complet pour adapter les menus (Admin/User) */}
          <Sidebar user={user} isSuperAdmin={isSuperAdmin} />
          
          {/* ZONE DE CONTENU PRINCIPALE */}
          {/* ml-72 correspond à la largeur fixe de ta Sidebar (18rem) */}
          <main className="flex-1 ml-72 min-h-screen relative overflow-hidden bg-slate-900/50 backdrop-blur-3xl border-l border-white/5">
            {children}
            
            {/* Halo décoratif Matrix de fond */}
            <div className="absolute top-0 right-0 w-125 h-125 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
          </main>
        </div>
      </div>
    </div>
  );
}