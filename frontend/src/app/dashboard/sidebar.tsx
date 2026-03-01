//* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * 🛰️ MODULE : SIDEBAR SOUVERAINE (MATRIX OS)
 * -------------------------------------------------------------------------
 * RÔLE : Navigation structurelle et gestion des privilèges QHSE.
 * VERSION : 9.0.0 (Zéro NextAuth / Intégration Elite-SDE)
 * -------------------------------------------------------------------------
 */

import {
  Activity, AlertTriangle, Archive, BarChart, ChevronDown,
  ClipboardCheck, Crown, Database, FileCheck2, FileText, FolderOpen,
  GitBranch, HardHat, LayoutDashboard, Leaf, LogOut, Network,
  Rocket, Scale, Settings2, ShieldAlert, ShieldCheck, Target, Terminal,
  Users, XCircle, Zap, LucideIcon
} from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { Role, User } from '@/types/elite-sde'; // ✅ Typage strict Elite-SDE
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// --- 🛰️ INTERFACES SCELLÉES ---
export interface SidebarProps {
  user: User; // Utilisation du type User officiel
  isSuperAdmin: boolean;
}

interface MenuItem {
  title: string;
  path: string;
  icon: LucideIcon;
  access: "ALL" | "MANAGER" | "ADMIN" | "SUPERADMIN";
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
  
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["pilotage", "onboarding"]);
  const [isImpersonated, setIsImpersonated] = useState<boolean>(false);

  /**
   * 🛡️ UNITÉ DE DÉTECTION D'INCARNATION
   * Vérifie si la session provient d'un jeton Master scellé.
   */
  useEffect(() => {
    const checkImpersonation = () => {
      const token = typeof window !== 'undefined' ? document.cookie.includes('qualisoft_token=MASTER_TOKEN_SOUVERAIN') : false;
      setIsImpersonated(token);
    };
    checkImpersonation();
  }, []);

  // Normalisation du rôle et détection du mode Pilote
  const userRole = user?.U_Role || "";
  const assignedProcessId = user?.U_AssignedProcessId; 
  const isPilote = userRole === Role.PILOTE && !!assignedProcessId;

  /**
   * 🧭 LOGIQUE D'ACCÈS RÉGALIENNE
   * Détermine la visibilité d'un module selon le rôle scellé en base.
   */
  const hasAccess = (item: MenuItem): boolean => {
    if (isSuperAdmin) return true;
    if (item.access === "ALL") return true;
    if (item.access === "SUPERADMIN") return isSuperAdmin;
    if (userRole === Role.ADMIN || userRole === Role.RQ || userRole === Role.DIRECTION) {
      return ["ADMIN", "MANAGER", "ALL"].includes(item.access);
    }
    return false;
  };

  const exitImpersonation = () => {
    // Suppression du cookie de secours et retour à la base
    document.cookie = "qualisoft_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Lax";
    window.location.href = "/admin/matrix";
  };

  const handleLogout = () => {
    document.cookie = "qualisoft_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Lax";
    logout();
    router.push("/auth/login");
  };

  /**
   * 🗺️ DICTIONNAIRE DE NAVIGATION (Harmonisé Elite-SDE)
   */
  const menuGroups: MenuGroup[] = useMemo(() => {
    const getPath = (defaultPath: string, tab: string) => {
      return isPilote
        ? `/dashboard/processus/cockpit/${assignedProcessId}?tab=${tab}`
        : defaultPath;
    };

    const groups: MenuGroup[] = [
      {
        id: "pilotage",
        label: "1. PILOTAGE & STRATÉGIE",
        icon: Activity,
        items: [
          { title: "Cockpit Exécutif SMI", path: "/dashboard/smi-global", icon: Target, access: "ALL" },
          { title: "Cockpit Direction", path: getPath("/dashboard/admin_rq", "General"), icon: LayoutDashboard, access: "ALL" },
          { title: "Objectifs & Cibles", path: "/dashboard/objectifs", icon: Network, access: "ALL" },
          { title: "Indicateurs (KPI)", path: "/dashboard/indicators", icon: BarChart, access: "MANAGER" },
          { title: "Gouvernance & COPIL", path: "/dashboard/gouvernance", icon: ShieldCheck, access: "ALL" },
        ],
      },
      {
        id: "onboarding",
        label: "2. DÉPLOIEMENT & SETUP",
        icon: Rocket,
        items: [
          { title: "Actions Prioritaires", path: "/dashboard/continuous-improvement", icon: Zap, access: "ADMIN" },
          { title: "Roadmap ISO", path: "/dashboard/tb-certif", icon: Target, access: "MANAGER" },
          { title: "Structure Organique", path: "/dashboard/organization", icon: Network, access: "ALL" },
        ],
      },
      {
        id: "documentaire",
        label: "3. GESTION DOCUMENTAIRE",
        icon: FolderOpen,
        items: [
          { title: "Bibliothèque (GED)", path: "/dashboard/ged", icon: FileText, access: "ALL" },
          { title: "Archives Légales", path: "/dashboard/archives", icon: Archive, access: "ALL" },
          { title: "Veille Réglementaire", path: "/dashboard/senegal-legal", icon: Scale, access: "ALL" },
          { title: "Checklists Normatives", path: "/dashboard/checklists", icon: FileCheck2, access: "ALL" },
        ],
      },
      {
        id: "processus-risques",
        label: "4. PROCESSUS & RISQUES",
        icon: GitBranch,
        items: [
          { title: "Cartographie", path: "/dashboard/processus", icon: GitBranch, access: "MANAGER" },
          { title: "Registre des Risques", path: "/dashboard/risks", icon: AlertTriangle, access: "ALL" },
          { title: "Revue de direction", path: "/dashboard/management-review", icon: Leaf, access: "ALL" },
          { title: "Revues de processus", path: "/dashboard/process-review", icon: Activity, access: "ALL" },
        ],
      },
      {
        id: "audit-amelioration",
        label: "5. AUDIT & AMÉLIORATION",
        icon: ShieldCheck,
        items: [
          { title: "Centre d'Audits", path: "/dashboard/audit-center", icon: FileCheck2, access: "ALL" },
          { title: "Non-Conformités", path: "/dashboard/non-conformites", icon: AlertTriangle, access: "MANAGER" },
          { title: "Actions (CAPA)", path: "/dashboard/actions", icon: ClipboardCheck, access: "MANAGER" },
          { title: "Plan d'Actions (PAQ)", path: "/dashboard/paq", icon: Zap, access: "ALL" },
          { title: "Réclamations", path: "/dashboard/reclamations", icon: FileText, access: "ALL" },
        ],
      },
      {
        id: "environnement-sse",
        label: "6. SANTÉ, SÉCU & ENV.",
        icon: Leaf,
        items: [
          { title: "Hub SSE / HSE", path: "/dashboard/environment", icon: HardHat, access: "ALL" },
          { title: "Causeries Sécurité", path: "/dashboard/sse/causeries", icon: Users, access: "ALL" },
          { title: "Incidents & Déchets", path: "/dashboard/environment/incidents", icon: AlertTriangle, access: "ALL" },
        ],
      },
      {
        id: "admin",
        label: "⚙️ CONFIGURATION",
        icon: Settings2,
        items: [
          { title: "Sites & Unités", path: "/dashboard/sites", icon: Database, access: "ALL" },
          { title: "Collaborateurs", path: "/dashboard/users", icon: Users, access: "ADMIN" },
          { title: "Paramètres Système", path: "/dashboard/admin/setup", icon: Settings2, access: "ADMIN" },
        ],
      },
    ];

    if (isSuperAdmin && !isImpersonated) {
      groups.push({
        id: "superadmin",
        label: "👑 CONSOLE MAÎTRE",
        icon: Crown,
        items: [
          { title: "Matrix Dashboard", path: "/admin/matrix", icon: Terminal, access: "SUPERADMIN" },
          { title: "Gestion Clients", path: "/dashboard/superadmin/tenants", icon: Database, access: "SUPERADMIN" },
        ],
      });
    }
    return groups;
  }, [isSuperAdmin, isPilote, assignedProcessId, isImpersonated]);

  return (
    <aside className={`w-[320px] h-screen flex flex-col fixed left-0 top-0 z-50 border-r-2 transition-all duration-500 font-sans italic shadow-2xl ${isImpersonated ? "bg-[#1A1515] border-amber-500/30" : "bg-[#0B0F1A] border-white/5"}`}>
      
      {/* 🔴 BANDEAU IMPERSONATION */}
      {isImpersonated && (
        <div className="bg-amber-600 px-6 py-3 flex items-center justify-between animate-pulse shrink-0">
          <div className="flex items-center gap-3">
            <ShieldAlert size={16} className="text-white" strokeWidth={3} />
            <span className="text-[11px] font-black uppercase text-white tracking-[0.3em] mt-1">Souveraineté Master</span>
          </div>
          <button onClick={exitImpersonation} className="text-white hover:scale-125 transition-all bg-transparent border-none cursor-pointer">
            <XCircle size={20} />
          </button>
        </div>
      )}

      {/* 🔝 LOGO */}
      <div className={`p-8 shrink-0 border-b-2 border-white/5 flex items-center gap-5 ${isImpersonated ? "bg-[#110D0D]" : "bg-[#151A2D]"}`}>
        <div className="w-14 h-14 bg-white rounded-[1.2rem] flex items-center justify-center border-4 border-white/10 shadow-xl">
          <Image src="/images/qslogo.png" alt="Qualisoft Elite" width={32} height={32} className="object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">QUALI<span className="text-blue-600">SOFT</span></h1>
          <p className={`text-[9px] font-black uppercase tracking-[0.4em] mt-2 leading-none ${isImpersonated ? "text-amber-500" : "text-slate-500"}`}>{isSuperAdmin ? "Matrix Node" : "Elite System"}</p>
        </div>
      </div>

      {/* 🧭 NAVIGATION */}
      <nav className="flex-1 overflow-y-auto px-6 py-10 space-y-6 custom-scrollbar scrollbar-hide">
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter(hasAccess);
          if (visibleItems.length === 0) return null;
          const isExpanded = expandedGroups.includes(group.id);

          return (
            <div key={group.id} className="space-y-3">
              <button onClick={() => setExpandedGroups(p => p.includes(group.id) ? p.filter(g => g !== group.id) : [...p, group.id])} className="w-full flex items-center justify-between py-3 px-2 rounded-xl group cursor-pointer border-none bg-transparent transition-colors hover:bg-white/5 text-left">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg transition-colors ${isExpanded ? "bg-blue-600/20 text-blue-500" : "bg-white/5 text-slate-500 group-hover:text-slate-300"}`}><group.icon size={16} strokeWidth={2.5} /></div>
                  <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${isExpanded ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`}>{group.label}</span>
                </div>
                <ChevronDown size={16} strokeWidth={3} className={`text-slate-600 transition-transform duration-300 ${isExpanded ? "rotate-180 text-blue-500" : ""}`} />
              </button>

              <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 mt-0"}`}>
                <div className="overflow-hidden pl-6 ml-4 border-l-2 border-white/5 space-y-2">
                  {visibleItems.map((item, idx) => {
                    const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
                    return (
                      <Link key={idx} href={item.path} className={`flex items-center gap-4 py-3 px-4 rounded-2xl transition-all duration-300 relative group/link ${isActive ? "bg-blue-600 text-white shadow-lg translate-x-1" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                        <item.icon size={14} strokeWidth={isActive ? 3 : 2} className={`${isActive ? "text-white" : "text-slate-500 group-hover/link:text-blue-400"}`} />
                        <span className={`text-[11px] uppercase tracking-widest ${isActive ? "font-black" : "font-bold"}`}>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* 👤 PROFIL & LOGOUT */}
      <div className={`p-8 border-t-2 border-white/5 shrink-0 ${isImpersonated ? "bg-[#110D0D]" : "bg-[#151A2D]"}`}>
        <div className="flex items-center justify-between p-4 rounded-3xl bg-black/40 border border-white/5 shadow-inner">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[14px] font-black shadow-lg border-2 border-white/10 shrink-0 ${isSuperAdmin ? "bg-amber-600" : "bg-blue-600"} text-white`}>
              {user?.U_FirstName?.[0] || "Q"}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-[12px] font-black truncate text-white uppercase italic leading-none mb-2">{user?.U_FirstName} {user?.U_LastName}</p>
              <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] leading-none truncate">{user?.U_Role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-3 text-slate-500 hover:text-rose-500 transition-all hover:bg-rose-500/10 rounded-xl border-none bg-transparent cursor-pointer">
            <LogOut size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}