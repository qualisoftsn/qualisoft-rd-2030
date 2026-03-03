/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : Sidebar.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Navigation Stratégique & Contrôle Régalien Matrix OS.
 * VERSION : 11.0.0 (Souveraineté Intégrale)
 * RÉVISION : 03 Mars 2026 | 21:10 GMT
 * -------------------------------------------------------------------------
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Activity, AlertTriangle, Archive, BarChart3, ChevronDown, 
  ClipboardCheck, Crown, Database, FileCheck2, FileText, 
  FolderLock, GitBranch, HardHat, LayoutDashboard, Leaf, 
  LogOut, Network, Scale, Settings2, ShieldAlert, 
  ShieldCheck, Target, Terminal, Users, XCircle, Zap, 
  LucideIcon, BookOpen, Fingerprint, Microscope, History,
  CreditCard, Layout
} from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { Role } from '@/types/elite-sde'; // Utilisation du typage centralisé

// --- 🔱 TYPES DES CONTRATS ---
interface MenuItem {
  title: string;
  path: string;
  icon: LucideIcon;
  access: (Role | "ALL")[]; // "ALL" pour accès public interne
  badge?: string;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: MenuItem[];
}

export default function Sidebar({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore() as any;
  
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["pilotage", "processus", "master"]);
  
  // Détection de l'état de Mascarade (Impersonation)
  const isImpersonated = useMemo(() => !!user?.isImpersonated, [user]);

  /**
   * 🛡️ PROCÉDURE DE DÉCONNEXION SOUVERAINE
   * Nettoyage des cookies de session et reset du store Zustand.
   */
  const handleLogout = () => {
    // Suppression des cookies sur tous les scopes possibles
    document.cookie = "qualisoft_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    logout();
    router.push("/auth/login");
  };

  /**
   * 🗺️ CARTOGRAPHIE INTÉGRALE DES PROCESSUS (ISO 9001/14001/45001)
   */
  const navigation: MenuGroup[] = useMemo(() => [
    {
      id: "pilotage",
      label: "I. Stratégie & Pilotage",
      icon: Activity,
      items: [
        { title: "Cockpit Exécutif", path: "/dashboard", icon: Target, access: ["ALL"] },
        { title: "Revue de Direction", path: "/dashboard/revue-direction", icon: Leaf, access: [Role.ADMIN, Role.RQ, Role.DIRECTION] },
        { title: "Objectifs & Cibles", path: "/dashboard/objectifs", icon: Network, access: ["ALL"] },
        { title: "Tableaux de Bord KPI", path: "/dashboard/indicators", icon: BarChart3, access: [Role.ADMIN, Role.RQ, Role.ADMIN] },
      ]
    },
    {
      id: "documentaire",
      label: "II. Maîtrise Documentaire",
      icon: FolderLock,
      items: [
        { title: "GED (Bibliothèque)", path: "/dashboard/ged", icon: FileText, access: ["ALL"] },
        { title: "Workflow d'Approbation", path: "/dashboard/workflows", icon: GitBranch, access: [Role.ADMIN, Role.RQ, Role.ADMIN], badge: "3" },
        { title: "Archives Légales", path: "/dashboard/archives", icon: Archive, access: [Role.ADMIN, Role.RQ] },
        { title: "Veille Réglementaire", path: "/dashboard/veilles", icon: Scale, access: ["ALL"] },
      ]
    },
    {
      id: "processus",
      label: "III. Performance Processus",
      icon: GitBranch,
      items: [
        { title: "Cartographie Master", path: "/dashboard/processus", icon: Network, access: [Role.ADMIN, Role.RQ, Role.ADMIN] },
        { title: "Analyse des Risques", path: "/dashboard/risks", icon: AlertTriangle, access: ["ALL"] },
        { title: "Fiches Processus", path: "/dashboard/process-sheets", icon: BookOpen, access: ["ALL"] },
      ]
    },
    {
      id: "audit",
      label: "IV. Audit & Amélioration",
      icon: ClipboardCheck,
      items: [
        { title: "Planning des Audits", path: "/dashboard/audit-center", icon: FileCheck2, access: ["ALL"] },
        { title: "Non-Conformités", path: "/dashboard/non-conformites", icon: ShieldAlert, access: [Role.ADMIN, Role.RQ, Role.ADMIN], badge: "NEW" },
        { title: "Actions (CAPA/PAQ)", path: "/dashboard/actions", icon: Zap, access: ["ALL"] },
      ]
    },
    {
      id: "hseq",
      label: "V. Santé, Sécurité & Env.",
      icon: HardHat,
      items: [
        { title: "Hub HSE Global", path: "/dashboard/sse", icon: ShieldCheck, access: ["ALL"] },
        { title: "Incidents & AT/MP", path: "/dashboard/incidents", icon: AlertTriangle, access: ["ALL"] },
        { title: "Gestion des Déchets", path: "/dashboard/waste", icon: Leaf, access: ["ALL"] },
      ]
    },
    {
      id: "admin",
      label: "VI. Configuration",
      icon: Settings2,
      items: [
        { title: "Unités & Sites", path: "/dashboard/organization", icon: Database, access: [Role.ADMIN] },
        { title: "Utilisateurs", path: "/dashboard/users", icon: Users, access: [Role.ADMIN] },
      ]
    },
    // 👑 BLOC RÉGALIEN (Apparaît uniquement pour le Super Admin)
    {
      id: "master",
      label: "VII. Matrix Administration",
      icon: Fingerprint,
      items: [
        { title: "Matrix Cockpit", path: "/dashboard/matrix", icon: Layout, access: [] }, // Filtered by isSuperAdmin
        { title: "Console Closing", path: "/admin/payments", icon: CreditCard, access: [] },
      ]
    }
  ], []);

  /**
   * 🛡️ FILTRAGE DES DROITS D'ACCÈS
   */
  const filteredNav = useMemo(() => {
    return navigation.map(group => ({
      ...group,
      items: group.items.filter(item => {
        // 1. Le Super Admin voit TOUT par défaut (sauf s'il est en impersonnalisation, il reste Master)
        if (isSuperAdmin) return true;
        // 2. Ne pas afficher le groupe VII aux non-SuperAdmins
        if (group.id === "master" && !isSuperAdmin) return false;
        // 3. Accès "ALL" ou correspondance de rôle
        if (item.access.includes("ALL")) return true;
        return item.access.includes(user?.U_Role as Role);
      })
    })).filter(g => g.items.length > 0);
  }, [navigation, user, isSuperAdmin]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]);
  };

  return (
    <aside className={`w-80 h-screen fixed left-0 top-0 z-100 flex flex-col border-r-2 transition-all duration-500 font-sans italic shadow-4xl 
      ${isImpersonated ? "bg-[#1A1212] border-amber-600/30" : "bg-[#0B0F1A] border-white/5"}`}>
      
      {/* 2. BRANDING SECTION */}
      <div className={`p-8 border-b-2 border-white/5 flex items-center gap-5 shrink-0 ${isImpersonated ? "bg-[#110D0D]" : "bg-[#151A2D]"}`}>
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border-4 border-white/10 shadow-2xl shrink-0">
          <Image src="/images/qslogo.png" alt="Qualisoft" width={32} height={32} />
        </div>
        <div className="min-w-0 text-left">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white m-0 leading-none">QUALI<span className="text-blue-600">SOFT</span></h1>
          <p className={`text-[9px] font-black uppercase tracking-[0.4em] mt-2 leading-none ${isImpersonated ? "text-amber-500" : "text-slate-500"}`}>
            {isSuperAdmin ? "Matrix Master Node" : "Elite Sovereign OS"}
          </p>
        </div>
      </div>

      {/* 3. SCROLLABLE NAVIGATION */}
      <nav className="flex-1 overflow-y-auto px-6 py-10 space-y-8 custom-scrollbar">
        {filteredNav.map((group) => {
          const isExpanded = expandedGroups.includes(group.id);
          return (
            <div key={group.id} className="space-y-3 text-left">
              <button 
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between py-2 px-2 rounded-xl hover:bg-white/5 transition-all group cursor-pointer border-none bg-transparent"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg transition-colors ${isExpanded ? "bg-blue-600/20 text-blue-500" : "bg-white/5 text-slate-600"}`}>
                    <group.icon size={16} strokeWidth={2.5} />
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${isExpanded ? "text-white" : "text-slate-600"}`}>
                    {group.label}
                  </span>
                </div>
                <ChevronDown size={14} className={`text-slate-700 transition-transform duration-300 ${isExpanded ? "rotate-180 text-blue-500" : ""}`} />
              </button>

              {isExpanded && (
                <div className="pl-6 ml-4 border-l-2 border-white/5 space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                  {group.items.map((item, idx) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link 
                        key={idx} 
                        href={item.path} 
                        className={`flex items-center justify-between py-3.5 px-5 rounded-2xl transition-all group/link relative
                          ${isActive ? "bg-blue-600 text-white shadow-xl shadow-blue-900/20 translate-x-1" : "text-slate-500 hover:text-white hover:bg-white/5"}`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <item.icon size={14} className={`${isActive ? "text-white" : "text-slate-600 group-hover/link:text-blue-500"} transition-colors`} />
                          <span className={`text-[10px] uppercase tracking-widest truncate ${isActive ? "font-black" : "font-bold"}`}>
                            {item.title}
                          </span>
                        </div>
                        {item.badge && (
                          <span className="bg-amber-500 text-slate-950 text-[7px] font-black px-1.5 py-0.5 rounded-md animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 4. SECURE PROFILE SECTION */}
      <div className={`p-8 border-t-2 border-white/5 shrink-0 ${isImpersonated ? "bg-[#110D0D]" : "bg-[#151A2D]"}`}>
        <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-3xl shadow-inner group">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black border-2 border-white/10 shrink-0 shadow-lg
              ${isSuperAdmin ? "bg-amber-600 text-white shadow-amber-900/20" : "bg-blue-600 text-white shadow-blue-900/20"}`}>
              {user?.U_FirstName?.[0] || "A"}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[12px] font-black text-white uppercase italic leading-none truncate mb-2 group-hover:text-blue-500 transition-colors">
                {user?.U_FirstName} {user?.U_LastName}
              </p>
              <div className="flex items-center gap-2">
                <ShieldCheck size={10} className={isSuperAdmin ? "text-amber-500" : "text-blue-500"} />
                <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest leading-none truncate m-0 italic">
                  {isSuperAdmin ? "Master Architect" : user?.U_Role}
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-3 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border-none bg-transparent cursor-pointer"
            title="DÉCONNEXION"
          >
            <LogOut size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, 0.1); border-radius: 10px; }
      `}</style>

    </aside>
  );
}