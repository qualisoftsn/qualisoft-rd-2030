/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : HUB DE COMMANDEMENT (MATRIX NAVIGATION)
 * -------------------------------------------------------------------------
 * RÔLE : Point d'accès universel scellé par RBAC Souverain.
 * DESIGN : Elite High-Density, 100dvh, Zéro Scroll Global, ClickUp Style.
 * LOGIQUE : Élimination totale NextAuth • Moteur de recherche Kernel.
 * -------------------------------------------------------------------------
 * DATE : 05 Mars 2026 | 16:42 GMT
 */

"use client";

import React, { useState, useMemo, useCallback, Suspense } from "react";
import { useAuthStore } from '@/store/authStore';
import { 
  Search, Info, LayoutGrid, Target, LineChart, Presentation, 
  Users2, Map as MapIcon, GitBranch, Workflow, Activity, 
  Users, Award, GraduationCap, UserCircle, ClipboardCheck, 
  AlertTriangle, AlertOctagon, Truck, Contact, FolderOpen, 
  BookOpen, FileSearch, Crown, Terminal, Database, ArrowUpRight,
  RefreshCcw, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Role } from '@/types/elite-sde';

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

// --- 🏗️ TYPES DE STRUCTURE NAVIGATIONNELLE ---
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

function MenuHubContent() {
  const { user } = useAuthStore() as any;
  const [search, setSearch] = useState("");
  
  // 🔐 LOGIQUE DE SÉCURITÉ SOUVERAINE
  const userRole = useMemo(() => user?.U_Role || Role.USER, [user]);
  const isSuperAdmin = useMemo(() => 
    userRole === Role.SUPER_ADMIN || user?.U_Email === "ab.thiongane@qualisoft.sn", 
  [userRole, user]);

  const hasAccess = useCallback((item: MenuItem): boolean => {
    if (isSuperAdmin) return true;
    if (item.access === "ALL") return true;
    return item.access === userRole;
  }, [userRole, isSuperAdmin]);

  // 🗄️ RÉFÉRENTIEL DES MODULES SMI (ISO 9001:2015)
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
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full lg:pl-72 selection:bg-blue-600/30">
      
      {/* 🔮 ATMOSPHERE MATRIX BACKGROUND */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-blue-600/5 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* 🔝 HEADER SDE (Fixe) */}
      <header className="shrink-0 p-8 lg:p-10 border-b border-white/5 bg-[#0B0F1A]/95 backdrop-blur-xl z-40 mt-12 lg:mt-0">
        <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-8">
          <div className="text-left">
            <div className="flex items-center gap-5 mb-4">
               <div className="w-16 h-16 rounded-4xl bg-blue-600 flex items-center justify-center shadow-4xl border border-blue-400/20">
                 <LayoutGrid className="text-white" size={32} />
               </div>
               <div>
                 <h1 className="text-4xl lg:text-6xl tracking-tighter leading-none m-0">Command <span className="text-blue-600">Center</span></h1>
                 <p className="text-slate-500 text-[10px] tracking-[0.6em] m-0 mt-3 italic uppercase">Hub Holistique SMI • Qualisoft Elite Matrix</p>
               </div>
            </div>
          </div>

          <div className="relative w-full xl:w-125 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-all" size={22} />
            <input 
              type="text"
              placeholder="RECHERCHER MODULE (EX: AUDITS, NC...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border-2 border-white/5 rounded-[2.5rem] py-6 pl-16 pr-8 text-[11px] font-black italic text-white outline-none focus:border-blue-600 transition-all shadow-2xl placeholder:text-slate-800 tracking-widest"
            />
          </div>
        </div>
      </header>

      {/* 📜 GRILLE DE MODULES (Scroll Isolé) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
        <div className="max-w-400 mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 pb-20">
          {filteredGroups.map((group) => (
            <section key={group.id} className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex items-center gap-4 px-4">
                <group.icon size={14} className="text-blue-500" />
                <h2 className="text-[10px] text-slate-500 tracking-[0.4em] m-0 leading-none">{group.label}</h2>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <div className="grid gap-4">
                {group.items.map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link 
                      key={idx}
                      href={item.path}
                      className="group bg-[#151B2B] border-2 border-white/5 p-6 rounded-[2.5rem] hover:border-blue-600/40 hover:bg-blue-600/5 transition-all duration-500 relative overflow-hidden shadow-xl flex items-center justify-between no-underline"
                    >
                      <div className="flex items-center gap-5 relative z-10 text-left">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <ItemIcon size={20} className="text-blue-500 group-hover:text-white" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[13px] font-black text-white m-0 tracking-tighter uppercase group-hover:text-blue-400 transition-colors">{item.title}</h3>
                          <p className="text-[8px] text-slate-600 mt-1 m-0 tracking-widest line-clamp-1 group-hover:text-slate-400">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="text-slate-800 group-hover:text-white transition-all transform group-hover:translate-x-1" size={18} />
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* 🛰️ FOOTER DE SESSION (Fixe) */}
      <footer className="shrink-0 p-6 bg-[#0B0F1A] border-t border-white/5 z-40">
        <div className="max-w-400 mx-auto flex justify-center md:justify-end">
          <div className="bg-blue-600/5 border border-blue-500/20 backdrop-blur-3xl rounded-2xl px-8 py-4 flex items-center gap-4 shadow-4xl">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <Info size={16} className="text-blue-400" />
            <span className="text-[9px] text-slate-500 tracking-[0.3em] m-0 leading-none">
              TERMINAL : {user?.U_FirstName} {user?.U_LastName} • ACCRÉDITATION : {userRole} • SDE §7.5 ACTIF
            </span>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.1); border-radius: 10px; }
      `}} />
    </div>
  );
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-8 lg:pl-72 text-blue-500 italic font-black uppercase tracking-[0.5em]">
      <RefreshCcw className="animate-spin" size={70} strokeWidth={1} />
      <span className="text-[10px] animate-pulse text-center">{label}</span>
    </div>
  );
}

export default function DashboardMenuHub() {
  return <Suspense fallback={<LoadingScreen label="Chargement du Hub Matrix..." />}><MenuHubContent /></Suspense>;
}
