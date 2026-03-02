//* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : HUB DE COMMANDEMENT SÉCURISÉ (MATRIX NAVIGATION)
 * -------------------------------------------------------------------------
 * RÔLE : Point d'accès universel filtré par RBAC Souverain.
 * LOGIQUE : Zéro dépendance NextAuth • Détection de rôle via Store SDE.
 * DESIGN : Elite Industrial Dark • No-Scroll Base • Ultra-Dense.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 11:32 GMT
 */

"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useAuthStore } from '@/store/authStore';
import { 
  Search, Info, LayoutGrid, Target, LineChart, Presentation, 
  Users2, Map as MapIcon, GitBranch, Workflow, Activity, 
  Users, Award, GraduationCap, UserCircle, ClipboardCheck, 
  AlertTriangle, AlertOctagon, Truck, Contact, FolderOpen, 
  BookOpen, FileSearch, Crown, Terminal, Database, ArrowUpRight 
} from "lucide-react";
import Link from "next/link";

// --- 🏗️ TYPES DE STRUCTURE NAVIGATIONNELLE ---

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  access: "ALL" | "DIRECTION" | "QSE" | "RH" | "MANAGER" | "ADMIN" | "SUPERADMIN";
  description: string;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: MenuItem[];
}

export default function DashboardMenuHub() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  
  // 🔐 LOGIQUE DE SÉCURITÉ SOUVERAINE
  const userRole = useMemo(() => user?.U_Role?.toUpperCase() || "USER", [user]);
  const isSuperAdmin = useMemo(() => userRole === "SUPERADMIN", [userRole]);

  const roles = useMemo(() => ({
    isDirection: ["DIRECTEUR", "DG", "PRESIDENT", "RQ", "DIRECTEUR_GENERAL"].includes(userRole) || isSuperAdmin,
    isQSE: ["RQ", "RESPONSABLE_QUALITE", "QSE", "AUDITEUR"].includes(userRole) || isSuperAdmin,
    isRH: ["RH", "DRH", "RESPONSABLE_RH"].includes(userRole) || isSuperAdmin,
    isManager: ["MANAGER", "CHEF_EQUIPE", "RESPONSABLE"].includes(userRole) || isSuperAdmin,
    isAdmin: ["ADMIN", "ADMINISTRATEUR"].includes(userRole) || isSuperAdmin,
  }), [userRole, isSuperAdmin]);

  const hasAccess = useCallback((item: MenuItem): boolean => {
    if (isSuperAdmin) return true;
    switch (item.access) {
      case "ALL": return true;
      case "DIRECTION": return roles.isDirection;
      case "QSE": return roles.isQSE;
      case "RH": return roles.isRH;
      case "MANAGER": return roles.isManager;
      case "ADMIN": return roles.isAdmin;
      default: return false;
    }
  }, [roles, isSuperAdmin]);

  // 🗄️ RÉFÉRENTIEL DES MODULES SMI (ISO 9001:2015)
  const menuGroups = useMemo((): MenuGroup[] => {
    const baseGroups: MenuGroup[] = [
      {
        id: "pilotage", label: "Pilotage & Direction", icon: LayoutGrid,
        items: [
          { title: "Cockpit SMI", path: "/dashboard", icon: LayoutGrid, access: "ALL", description: "Tableau de bord centralisé et alertes" },
          { title: "Objectifs & KPIs", path: "/dashboard/indicators", icon: LineChart, access: "ALL", description: "Performance stratégique (§9.1)" },
          { title: "Revues Direction", path: "/dashboard/management-review", icon: Presentation, access: "DIRECTION", description: "Décisions stratégiques (§9.3)" },
          { title: "Gouvernance COPIL", path: "/dashboard/gouvernance/copil", icon: Users2, access: "MANAGER", description: "Comités de pilotage et tactique" },
        ]
      },
      {
        id: "processus", label: "Processus & Flux", icon: GitBranch,
        items: [
          { title: "Cartographie", path: "/dashboard/cartographie", icon: MapIcon, access: "ALL", description: "Interactions des processus" },
          { title: "Fiches Identité", path: "/dashboard/processus", icon: GitBranch, access: "ALL", description: "SWOT et ressources processus" },
          { title: "Workflows SDE", path: "/dashboard/workflows", icon: Workflow, access: "MANAGER", description: "Circuits de validation scellés" },
          { title: "Saisie Mesures", path: "/dashboard/indicators/entry", icon: Activity, access: "ALL", description: "Collecte des données terrain" },
        ]
      },
      {
        id: "organisation", label: "Organisation & RH", icon: Users,
        items: [
          { title: "Organigramme", path: "/dashboard/organisation", icon: LayoutGrid, access: "ALL", description: "Structure hiérarchique Matrix" },
          { title: "Compétences", path: "/dashboard/rh/skills", icon: Award, access: "RH", description: "Matrice des habilitations (§7.2)" },
          { title: "Plan Formation", path: "/dashboard/rh/training", icon: GraduationCap, access: "RH", description: "Développement du capital humain" },
          { title: "Population", path: "/dashboard/rh/staff", icon: UserCircle, access: "RH", description: "Dossiers scellés collaborateurs" },
        ]
      },
      {
        id: "conformite", label: "Audits & Amélioration", icon: ClipboardCheck,
        items: [
          { title: "Audits Internes", path: "/dashboard/audits", icon: ClipboardCheck, access: "QSE", description: "Programmation §9.2" },
          { title: "Non-Conformités", path: "/dashboard/non-conformites", icon: AlertTriangle, access: "ALL", description: "Gestion des écarts §10.2" },
          { title: "Analyse Risques", path: "/dashboard/risks", icon: AlertOctagon, access: "MANAGER", description: "Maîtrise des incertitudes §6.1" },
          { title: "PAQ Amélioration", path: "/dashboard/improvement", icon: Target, access: "ALL", description: "Plan d'actions consolidé" },
        ]
      },
      {
        id: "tiers", label: "Tiers & Relations", icon: Truck,
        items: [
          { title: "Fournisseurs", path: "/dashboard/tiers", icon: Truck, access: "ALL", description: "Performance prestataires §8.4" },
          { title: "Réclamations", path: "/dashboard/reclamations", icon: Contact, access: "ALL", description: "Écoute Client §9.1.2" },
        ]
      },
      {
        id: "documents", label: "GED & Traçabilité", icon: FolderOpen,
        items: [
          { title: "GED Qualité", path: "/dashboard/ged", icon: FolderOpen, access: "ALL", description: "Informations documentées §7.5" },
          { title: "Archives SMI", path: "/dashboard/archives", icon: FileSearch, access: "QSE", description: "Rétention et preuves d'audit" },
        ]
      }
    ];

    if (isSuperAdmin) {
      baseGroups.push({
        id: "superadmin", label: "Console Souveraine", icon: Crown,
        items: [
          { title: "Matrix Console", path: "/dashboard/superadmin/console", icon: Terminal, access: "SUPERADMIN", description: "Monitoring Kernel & Logs" },
          { title: "Multi-Tenants", path: "/dashboard/superadmin/tenants", icon: Database, access: "SUPERADMIN", description: "Isolation et flux clients" },
        ]
      });
    }

    return baseGroups;
  }, [isSuperAdmin]);

  // 🔍 MOTEUR DE RECHERCHE & FILTRAGE SÉCURISÉ
  const filteredGroups = useMemo(() => {
    return menuGroups.map(group => ({
      ...group,
      items: group.items.filter(item => 
        hasAccess(item) && 
        (item.title.toLowerCase().includes(search.toLowerCase()) || 
         item.description.toLowerCase().includes(search.toLowerCase()))
      )
    })).filter(group => group.items.length > 0);
  }, [search, menuGroups, hasAccess]);

  return (
    <main className="min-h-screen bg-[#0B0F1A] ml-0 lg:ml-72 p-8 lg:p-12 font-sans italic relative overflow-hidden text-left selection:bg-blue-600/30">
      
      {/* 🔮 ATMOSPHERE MATRIX */}
      <div className="absolute top-0 right-0 w-150 h-150 bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

      <header className="mb-14 animate-in fade-in slide-in-from-top-6 duration-700 mt-12 lg:mt-0">
        <div className="flex items-center gap-6 mb-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center shadow-4xl shadow-blue-900/40 border border-blue-400/20">
            <LayoutGrid className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic text-white leading-none m-0">
              Command <span className="text-blue-600">Center</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mt-4 leading-none">
              Navigation Holistique SMI Qualisoft • Kernel v3.0 Elite
            </p>
          </div>
        </div>

        <div className="mt-10 relative max-w-3xl group">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={22} />
          <input 
            type="text"
            placeholder="Rechercher une fonction (ex: Audits, NC, RH...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0F172A]/90 border border-white/5 rounded-[2.5rem] py-7 pl-16 pr-8 text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-600 focus:bg-[#0F172A] transition-all shadow-2xl placeholder:text-slate-700 tracking-widest"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pb-40">
        {filteredGroups.map((group) => (
          <section key={group.id} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4 px-4">
              <group.icon size={16} className="text-blue-500" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic m-0">
                {group.label}
              </h2>
              <div className="flex-1 h-px bg-linear-to-r from-white/10 to-transparent" />
            </div>

            <div className="grid gap-5">
              {group.items.map((item, idx) => (
                <Link 
                  key={idx}
                  href={item.path}
                  className="group bg-[#0F172A]/50 border border-white/5 p-7 rounded-[2.5rem] hover:bg-blue-600 hover:border-blue-400 hover:translate-x-3 transition-all duration-500 relative overflow-hidden shadow-xl block no-underline"
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5 shadow-inner">
                        <item.icon size={24} className="text-blue-500 group-hover:text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-base font-black uppercase italic text-white leading-none mb-3 m-0">
                          {item.title}
                        </h3>
                        <p className="text-[9px] font-bold uppercase text-slate-500 mt-1 leading-relaxed group-hover:text-white/80 max-w-45 m-0">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="text-slate-800 group-hover:text-white transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" size={20} />
                  </div>
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-700" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="fixed bottom-0 left-0 lg:left-72 right-0 p-10 bg-linear-to-t from-[#0B0F1A] via-[#0B0F1A]/90 to-transparent pointer-events-none z-30">
        <div className="max-w-7xl mx-auto flex justify-end">
           <div className="bg-blue-600/10 border border-blue-600/20 backdrop-blur-3xl rounded-2xl px-8 py-5 pointer-events-auto flex items-center gap-4 shadow-4xl animate-in slide-in-from-right-10 duration-1000">
             <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_12px_#3b82f6]" />
             <Info size={18} className="text-blue-400" />
             <span className="text-[9px] font-black uppercase italic text-slate-400 tracking-[0.3em] leading-none">
               Identité : {user?.U_FirstName} {user?.U_LastName} • Rôle : {userRole} • SDE Protection §7.5 Active
             </span>
           </div>
        </div>
      </footer>
    </main>
  );
}