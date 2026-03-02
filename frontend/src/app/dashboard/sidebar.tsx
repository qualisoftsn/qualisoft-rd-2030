/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : src/app/(dashboard)/sidebar.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Épine dorsale de la Matrix OS - Navigation & Droits Régaliens.
 * VERSION : 10.0.0 (Elite SDE - Zéro Compromis)
 * CONFORMITÉ : ISO 9001 (Approche Processus) & ISO 27001 (Contrôle d'accès).
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
  LogOut, Network, Rocket, Scale, Settings2, ShieldAlert, 
  ShieldCheck, Target, Terminal, Users, XCircle, Zap, 
  LucideIcon, BookOpen, Fingerprint, Microscope
} from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { Role, User } from '@/types/elite-sde';

// --- 🔱 INTERFACES SCELLÉES ---
export interface SidebarProps {
  user: User;
  isSuperAdmin: boolean;
}

interface MenuItem {
  title: string;
  path: string;
  icon: LucideIcon;
  access: (Role | "ALL" | "MASTER")[];
  badge?: string;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: MenuItem[];
}

export default function Sidebar({ user, isSuperAdmin }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  
  // État d'expansion pour les dossiers métier
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["pilotage", "processus"]);
  const [isImpersonated, setIsImpersonated] = useState<boolean>(false);

  useEffect(() => {
    // Détection du jeton d'autorité Master (impersonation)
    setIsImpersonated(document.cookie.includes('MASTER_TOKEN_SOUVERAIN'));
  }, []);

  /**
   * 🛡️ MOTEUR DE PERMISSIONS (ISO 27001)
   * Filtrage granulaire des modules selon le rôle scellé.
   */
  const filterAccessibleItems = (items: MenuItem[]) => {
    return items.filter(item => {
      if (isSuperAdmin) return true;
      if (item.access.includes("ALL")) return true;
      if (item.access.includes("MASTER") && !isSuperAdmin) return false;
      return item.access.includes(user?.U_Role as Role);
    });
  };

  const handleLogout = () => {
    document.cookie = "qualisoft_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Lax";
    logout();
    router.push("/auth/login");
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  /**
   * 🗺️ CARTOGRAPHIE DU SYSTÈME (Navigation Master)
   */
  const navigation: MenuGroup[] = useMemo(() => [
    {
      id: "pilotage",
      label: "I. Stratégie & Pilotage",
      icon: Activity,
      items: [
        { title: "Cockpit Exécutif", path: "/dashboard/smi-global", icon: Target, access: ["ALL"] },
        { title: "Revue de Direction", path: "/dashboard/revue-direction", icon: Leaf, access: [Role.ADMIN, Role.RQ, Role.DIRECTION] },
        { title: "Objectifs & Cibles", path: "/dashboard/objectifs", icon: Network, access: ["ALL"] },
        { title: "Tableaux de Bord KPI", path: "/dashboard/indicators", icon: BarChart3, access: [Role.ADMIN, Role.RQ, Role.MANAGER] },
      ]
    },
    {
      id: "documentaire",
      label: "II. Maîtrise Documentaire",
      icon: FolderLock,
      items: [
        { title: "GED (Bibliothèque)", path: "/dashboard/ged", icon: FileText, access: ["ALL"] },
        { title: "Workflow d'Approbation", path: "/dashboard/workflows", icon: GitBranch, access: [Role.ADMIN, Role.RQ, Role.MANAGER] },
        { title: "Archives Légales", path: "/dashboard/archives", icon: Archive, access: [Role.ADMIN, Role.RQ] },
        { title: "Veille Réglementaire", path: "/dashboard/veilles", icon: Scale, access: ["ALL"] },
      ]
    },
    {
      id: "processus",
      label: "III. Performance Processus",
      icon: GitBranch,
      items: [
        { title: "Cartographie Master", path: "/dashboard/processus", icon: Network, access: [Role.ADMIN, Role.RQ, Role.MANAGER] },
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
        { title: "Non-Conformités", path: "/dashboard/non-conformites", icon: ShieldAlert, access: [Role.ADMIN, Role.RQ, Role.MANAGER], badge: "NEW" },
        { title: "Actions (CAPA/PAQ)", path: "/dashboard/actions", icon: Zap, access: ["ALL"] },
        { title: "Évaluations Tiers", path: "/dashboard/evaluations", icon: Microscope, access: [Role.ADMIN, Role.RQ] },
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
      label: "Config. Système",
      icon: Settings2,
      items: [
        { title: "Unités & Sites", path: "/dashboard/organization", icon: Database, access: [Role.ADMIN] },
        { title: "Gestion des Utilisateurs", path: "/dashboard/users", icon: Users, access: [Role.ADMIN] },
        { title: "Paramètres Matrix", path: "/dashboard/settings", icon: Fingerprint, access: [Role.ADMIN] },
      ]
    }
  ], []);

  return (
    <aside className={`w-80 h-screen fixed left-0 top-0 z-50 flex flex-col border-r-2 transition-all duration-500 font-sans italic shadow-4xl 
      ${isImpersonated ? "bg-[#1A1212] border-amber-600/30" : "bg-[#0B0F1A] border-white/5"}`}>
      
      {/* 🚩 BANDEAU D'AUTORITÉ MASTER */}
      {isImpersonated && (
        <div className="bg-amber-600 px-6 py-2.5 flex items-center justify-between animate-pulse shrink-0 shadow-lg">
          <div className="flex items-center gap-2">
            <Fingerprint size={14} className="text-white" />
            <span className="text-[10px] font-black uppercase text-white tracking-widest">Master Override</span>
          </div>
          <button onClick={() => window.location.href="/admin/matrix"} className="text-white hover:scale-110 transition-all bg-transparent border-none cursor-pointer">
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* 🔝 LOGO & BRANDING */}
      <div className={`p-8 border-b-2 border-white/5 flex items-center gap-5 shrink-0 ${isImpersonated ? "bg-[#110D0D]" : "bg-[#151A2D]"}`}>
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border-4 border-white/10 shadow-2xl shrink-0 group">
          <Image src="/images/qslogo.png" alt="Qualisoft" width={32} height={32} className="group-hover:scale-110 transition-transform" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white m-0 leading-none">QUALI<span className="text-blue-600">SOFT</span></h1>
          <p className={`text-[9px] font-black uppercase tracking-[0.4em] mt-2 leading-none ${isImpersonated ? "text-amber-500" : "text-slate-500"}`}>
            {isSuperAdmin ? "Matrix Master Node" : "Elite Sovereign OS"}
          </p>
        </div>
      </div>

      {/* 🧭 NAVIGATION MÉTIER */}
      <nav className="flex-1 overflow-y-auto px-6 py-8 space-y-6 custom-scrollbar scrollbar-hide">
        {navigation.map((group) => {
          const visibleItems = filterAccessibleItems(group.items);
          if (visibleItems.length === 0) return null;
          const isExpanded = expandedGroups.includes(group.id);

          return (
            <div key={group.id} className="space-y-2">
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
                  {visibleItems.map((item, idx) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link 
                        key={idx} 
                        href={item.path} 
                        className={`flex items-center justify-between py-3 px-5 rounded-2xl transition-all group/link relative
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

      {/* 👤 PROFIL SÉCURISÉ & ÉJECTION */}
      <div className={`p-8 border-t-2 border-white/5 shrink-0 ${isImpersonated ? "bg-[#110D0D]" : "bg-[#151A2D]"}`}>
        <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-3xl shadow-inner group">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black border-2 border-white/10 shrink-0 shadow-lg
              ${isSuperAdmin ? "bg-amber-600 text-white shadow-amber-900/20" : "bg-blue-600 text-white shadow-blue-900/20"}`}>
              {user?.U_FirstName?.[0] || "Q"}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-black text-white uppercase italic leading-none truncate mb-2 group-hover:text-blue-500 transition-colors">
                {user?.U_FirstName} {user?.U_LastName}
              </p>
              <div className="flex items-center gap-2">
                {isSuperAdmin && <Crown size={10} className="text-amber-500" />}
                <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest leading-none truncate">
                  {isSuperAdmin ? "Master Architect" : user?.U_Role}
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-3 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border-none bg-transparent cursor-pointer"
            title="DÉCONNEXION SYSTÈME"
          >
            <LogOut size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37, 99, 235, 0.1); border-radius: 10px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </aside>
  );
}