/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : HUB DE COMMANDEMENT (ISO 9001 §5.3)
 * RÔLE : Point d'accès universel scellé par RBAC Souverain
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, useMemo, useCallback, Suspense, ChangeEvent } from "react";
import { useAuthStore } from '@/store/authStore';
import { 
  Search, Info, LayoutGrid, Target, LineChart, Presentation, 
  Users2, Map as MapIcon, GitBranch, Workflow, Activity, 
  Users, Award, GraduationCap, UserCircle, ClipboardCheck, 
  AlertTriangle, AlertOctagon, Truck, Contact, FolderOpen, 
  FileSearch, Crown, Terminal, Database, RefreshCcw, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Role } from '@/types/elite-sde';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  access: "ALL" | Role;
  description: string;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: MenuItem[];
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCcw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL CONTENT
// ============================================================================

function MenuHubContent() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  
  const userRole = useMemo(() => user?.U_Role || Role.USER, [user]);
  const isSuperAdmin = useMemo(() => 
    userRole === Role.SUPER_ADMIN || user?.U_Email === "ab.thiongane@qualisoft.sn", 
  [userRole, user]);

  const hasAccess = useCallback((item: MenuItem): boolean => {
    if (isSuperAdmin) return true;
    if (item.access === "ALL") return true;
    return item.access === userRole;
  }, [userRole, isSuperAdmin]);

  const menuGroups = useMemo((): MenuGroup[] => {
    const baseGroups: MenuGroup[] = [
      {
        id: "pilotage", label: "I. Pilotage & Direction", icon: LayoutGrid,
        items: [
          { title: "Cockpit SMI", path: "/dashboard", icon: LayoutGrid, access: "ALL", description: "Tableau de bord centralisé §9.1" },
          { title: "Indicateurs", path: "/dashboard/indicators", icon: LineChart, access: "ALL", description: "Performance KPI stratégique" },
          { title: "Revues Direction", path: "/dashboard/management-review", icon: Presentation, access: Role.DIRECTION, description: "Décisions stratégiques §9.3" },
          { title: "Gouvernance COPIL", path: "/dashboard/gouvernance/copil", icon: Users2, access: Role.RQ, description: "Comités tactiques Matrix" },
        ]
      },
      {
        id: "processus", label: "II. Processus & Flux", icon: GitBranch,
        items: [
          { title: "Cartographie", path: "/dashboard/cartographie", icon: MapIcon, access: "ALL", description: "Interactions des processus" },
          { title: "Fiches Identité", path: "/dashboard/processus", icon: GitBranch, access: "ALL", description: "SWOT et ressources" },
          { title: "Workflows SDE", path: "/dashboard/workflows", icon: Workflow, access: Role.RQ, description: "Circuits de validation scellés" },
          { title: "Saisie Mesures", path: "/dashboard/indicators/entry", icon: Activity, access: "ALL", description: "Collecte de données terrain" },
        ]
      },
      {
        id: "organisation", label: "III. Organisation & RH", icon: Users,
        items: [
          { title: "Organigramme", path: "/dashboard/organisation", icon: LayoutGrid, access: "ALL", description: "Structure hiérarchique Matrix" },
          { title: "Compétences", path: "/dashboard/rh/skills", icon: Award, access: Role.ADMIN, description: "Habilitations §7.2" },
          { title: "Formations", path: "/dashboard/rh/training", icon: GraduationCap, access: Role.ADMIN, description: "Développement Capital Humain" },
          { title: "Collaborateurs", path: "/dashboard/rh/staff", icon: UserCircle, access: Role.ADMIN, description: "Dossiers scellés" },
        ]
      },
      {
        id: "conformite", label: "IV. Audits & Amélioration", icon: ClipboardCheck,
        items: [
          { title: "Audits Internes", path: "/dashboard/audits", icon: ClipboardCheck, access: Role.RQ, description: "Programmation annuelle §9.2" },
          { title: "Non-Conformités", path: "/dashboard/non-conformites", icon: AlertTriangle, access: "ALL", description: "Gestion des écarts §10.2" },
          { title: "Risques", path: "/dashboard/risks", icon: AlertOctagon, access: Role.RQ, description: "Maîtrise incertitudes §6.1" },
          { title: "PDCA / PAQ", path: "/dashboard/improvement", icon: Target, access: "ALL", description: "Amélioration continue §10.3" },
        ]
      },
      {
        id: "tiers", label: "V. Tiers & Relations", icon: Truck,
        items: [
          { title: "Fournisseurs", path: "/dashboard/tiers", icon: Truck, access: "ALL", description: "Performance prestataires §8.4" },
          { title: "Réclamations", path: "/dashboard/reclamations", icon: Contact, access: "ALL", description: "Écoute Client §9.1.2" },
        ]
      },
      {
        id: "documents", label: "VI. GED & Traçabilité", icon: FolderOpen,
        items: [
          { title: "GED Qualité", path: "/dashboard/ged", icon: FolderOpen, access: "ALL", description: "Infos documentées §7.5" },
          { title: "Archives SMI", path: "/dashboard/archives", icon: FileSearch, access: Role.RQ, description: "Preuves d'audit scellées" },
        ]
      }
    ];

    if (isSuperAdmin) {
      baseGroups.push({
        id: "superadmin", label: "VII. Console Souveraine", icon: Crown,
        items: [
          { title: "Matrix Console", path: "/dashboard/matrix", icon: Terminal, access: Role.SUPER_ADMIN, description: "Monitoring Kernel & Logs" },
          { title: "Multi-Tenants", path: "/dashboard/organization", icon: Database, access: Role.SUPER_ADMIN, description: "Isolation flux clients" },
        ]
      });
    }
    return baseGroups;
  }, [isSuperAdmin]);

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
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      
      {/* 🔮 ATMOSPHERE */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none z-0" aria-hidden="true" />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-10 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 mt-12 lg:mt-0">
        <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-4 md:gap-6 lg:gap-8">
          <div className="text-left w-full xl:w-auto">
            <div className="flex items-center gap-3 md:gap-4 lg:gap-5 mb-3 md:mb-4">
               <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl border border-blue-400/20">
                 <LayoutGrid className="text-white w-7 h-7 md:w-8 md:h-8" aria-hidden="true" />
               </div>
               <div>
                 <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0">Command <span className="text-blue-400">Center</span></h1>
                 <p className="text-slate-500 text-[8px] md:text-[9px] lg:text-[10px] tracking-widest m-0 mt-2 md:mt-3 italic uppercase">Hub Holistique SMI • Qualisoft Elite Matrix</p>
               </div>
            </div>
          </div>

          <div className="relative w-full xl:w-[31.25rem] group">
            <label htmlFor="module-search" className="sr-only">Rechercher un module</label>
            <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-400 transition-all pointer-events-none w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
            <input 
              id="module-search"
              type="text"
              placeholder="RECHERCHER MODULE (EX: AUDITS, NC...)"
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="w-full bg-black/40 border-2 border-white/5 rounded-2xl md:rounded-3xl py-2.5 md:py-3 lg:py-6 pl-10 md:pl-16 pr-4 md:pr-6 lg:pr-8 text-[9px] md:text-[10px] lg:text-[11px] font-black italic text-white outline-none focus:border-blue-500 transition-all shadow-2xl placeholder:text-slate-800 tracking-widest"
              aria-label="Filtrer les modules"
            />
          </div>
        </div>
      </header>

      {/* 📜 GRILLE DE MODULES */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-4 md:py-6">
        <div className="max-w-[100rem] mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 pb-16 md:pb-20">
          {filteredGroups.map((group) => {
            const GroupIcon = group.icon;
            return (
              <section key={group.id} className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex items-center gap-3 md:gap-4 px-2 md:px-4">
                  <GroupIcon size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-400" aria-hidden="true" />
                  <h2 className="text-[8px] md:text-[9px] lg:text-[10px] text-slate-500 tracking-widest m-0 leading-none">{group.label}</h2>
                  <div className="flex-1 h-px bg-white/5" aria-hidden="true" />
                </div>

                <div className="grid gap-3 md:gap-4" role="list" aria-label={group.label}>
                  {group.items.map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <Link 
                        key={idx}
                        href={item.path}
                        className="group bg-[#0F172A] border-2 border-white/5 p-4 md:p-5 lg:p-6 rounded-2xl md:rounded-3xl hover:border-blue-600/40 hover:bg-blue-600/5 transition-all duration-500 relative overflow-hidden shadow-xl flex items-center justify-between no-underline focus:outline-none focus:ring-2 focus:ring-blue-400"
                        role="listitem"
                        aria-label={`${item.title}: ${item.description}`}
                      >
                        <div className="flex items-center gap-3 md:gap-4 lg:gap-5 relative z-10 text-left">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <ItemIcon size={16} className="w-4 h-4 md:w-5 md:h-5 text-blue-400 group-hover:text-white" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-[11px] md:text-[12px] lg:text-[13px] font-black text-white m-0 tracking-tighter uppercase group-hover:text-blue-400 transition-colors">{item.title}</h3>
                            <p className="text-[7px] md:text-[8px] text-slate-600 mt-0.5 md:mt-1 m-0 tracking-widest line-clamp-1 group-hover:text-slate-400">{item.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 md:w-4.5 md:h-4.5 text-slate-800 group-hover:text-white transition-all transform group-hover:translate-x-1" aria-hidden="true" />
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* 🛰️ FOOTER */}
      <footer className="shrink-0 px-4 md:px-6 py-4 md:py-6 bg-[#0B0F1A] border-t border-white/5 z-40">
        <div className="max-w-[100rem] mx-auto flex justify-center md:justify-end">
          <div className="bg-blue-600/5 border border-blue-500/20 backdrop-blur-3xl rounded-xl md:rounded-2xl px-6 md:px-8 py-3 md:py-4 flex items-center gap-3 md:gap-4 shadow-2xl">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" aria-hidden="true" />
            <Info size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400" aria-hidden="true" />
            <span className="text-[8px] md:text-[9px] text-slate-500 tracking-widest m-0 leading-none">
              TERMINAL : {user?.U_FirstName} {user?.U_LastName} • ACCRÉDITATION : {userRole} • SDE §7.5 ACTIF
            </span>
          </div>
        </div>
      </footer>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function DashboardMenuHub() {
  return <Suspense fallback={<LoadingScreen label="Chargement du Hub Matrix..." />}><MenuHubContent /></Suspense>;
}