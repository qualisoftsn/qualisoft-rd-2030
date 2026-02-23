"use client";

import {
  Activity,
  AlertTriangle,
  Archive,
  BarChart,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  Crown,
  Database,
  FileCheck2,
  FileText,
  FolderOpen,
  GitBranch,
  HardHat,
  LayoutDashboard,
  Leaf,
  Lock,
  LogOut,
  Network,
  Rocket,
  Scale,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Target,
  Terminal,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

// --- 🛰️ INTERFACE SOUVERAINE ---
export interface SidebarUser {
  U_Id: string;
  U_Email: string;
  U_Role: string;
  tenantId: string;
  U_FirstName?: string | null;
  U_LastName?: string | null;
  U_AssignedProcessId?: string | null;
}

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  access: "ALL" | "MANAGER" | "ADMIN" | "SUPERADMIN";
}

interface MenuGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: MenuItem[];
}

export default function Sidebar({
  user,
  isSuperAdmin,
}: {
  user: SidebarUser;
  isSuperAdmin: boolean;
}) {
  const pathname = usePathname();
  // Groupes ouverts par défaut (Stratégie & Déploiement)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "pilotage",
    "onboarding",
  ]);
  const [isImpersonated, setIsImpersonated] = useState<boolean>(false);

  /**
   * 🛡️ UNITÉ DE DÉTECTION SCELLÉE (Bypass SSR)
   */
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      const token = localStorage.getItem("master_token");
      if (token) setIsImpersonated(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  const userRole = user?.U_Role?.toUpperCase() || "";
  const assignedProcessId = user?.U_AssignedProcessId;
  const isPilote = userRole === "PILOTE" && !!assignedProcessId;

  /**
   * 🗺️ LOGIQUE D'ACCÈS ÉLARGIE (Sovereign Access)
   */
  const hasAccess = (item: MenuItem): boolean => {
    if (isSuperAdmin) return true;
    if (item.access === "ALL") return true;
    if (item.access === "SUPERADMIN") return isSuperAdmin;
    if (userRole === "ADMIN" || userRole === "ADMIN_RQ") {
      return ["ADMIN", "MANAGER", "ALL"].includes(item.access);
    }
    return false;
  };

  const exitImpersonation = () => {
    localStorage.removeItem("master_token");
    window.location.href = "/admin/matrix";
  };

  /**
   * 🗂️ DICTIONNAIRE DE NAVIGATION SDE CONSOLIDÉ (useMemo pur)
   */
  const menuGroups: MenuGroup[] = useMemo(() => {
    // Redirection dynamique pour les Pilotes de Processus
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
          {
            title: "Cockpit Exécutif SMI",
            path: "/dashboard/smi-global",
            icon: Target,
            access: "ALL",
          },
          {
            title: "Cockpit Direction",
            path: getPath("/dashboard/admin_rq", "General"),
            icon: LayoutDashboard,
            access: "ALL",
          },
          {
            title: "Objectifs & Cibles",
            path: "/dashboard/objectifs",
            icon: Network,
            access: "ALL",
          },
          {
            title: "Indicateurs (KPI)",
            path: "/dashboard/indicators",
            icon: BarChart,
            access: "MANAGER",
          },
          {
            title: "Gouvernance & COPIL",
            path: "/dashboard/gouvernance",
            icon: ShieldCheck,
            access: "ALL",
          },
        ],
      },
      {
        id: "onboarding",
        label: "2. DÉPLOIEMENT & SETUP",
        icon: Rocket,
        items: [
          {
            title: "Diagnostic & Plan (J0-J7)",
            path: "/dashboard/onboarding",
            icon: Zap,
            access: "ADMIN",
          },
          {
            title: "Roadmap ISO",
            path: "/dashboard/tb-certif",
            icon: Target,
            access: "MANAGER",
          },
          {
            title: "Structure & Organigramme",
            path: "/dashboard/organization",
            icon: Network,
            access: "ALL",
          },
        ],
      },
      {
        id: "documentaire",
        label: "3. GESTION DOCUMENTAIRE",
        icon: FolderOpen,
        items: [
          {
            title: "Bibliothèque (GED)",
            path: "/dashboard/ged",
            icon: FileText,
            access: "ALL",
          },
          {
            title: "Archives Légales",
            path: "/dashboard/archives",
            icon: Archive,
            access: "ALL",
          },
          {
            title: "Sénégal-Légal",
            path: "/dashboard/senegal-legal",
            icon: Leaf,
            access: "ALL",
          },
          {
            title: "Checklist-ISO 9001",
            path: "/dashboard/checklists/iso9001",
            icon: Leaf,
            access: "ALL",
          },
          {
            title: "Checklist-ISO 14001",
            path: "/dashboard/checklists/iso14001",
            icon: Leaf,
            access: "ALL",
          },
        ],
      },
      {
        id: "processus-risques",
        label: "4. PROCESSUS & RISQUES",
        icon: GitBranch,
        items: [
          {
            title: "Cartographie Processus",
            path: "/dashboard/processus",
            icon: GitBranch,
            access: "MANAGER",
          },
          {
            title: "Enqêtes",
            path: "/dashboard/quality/surveys",
            icon: Leaf,
            access: "MANAGER",
          },
          {
            title: "Registre des Risques",
            path: "/dashboard/risks",
            icon: AlertTriangle,
            access: "ALL",
          },
          {
            title: "Revue de direction",
            path: "/dashboard/management-review",
            icon: Leaf,
            access: "ALL",
          },
          {
            title: "Plan de Continuité (PCA)",
            path: "/dashboard/process-review",
            icon: Activity,
            access: "ALL",
          },
        ],
      },
      {
        id: "audit-amelioration",
        label: "5. AUDIT & AMÉLIORATION",
        icon: ShieldCheck,
        items: [
          {
            title: "Centre d'Audits",
            path: "/dashboard/audit-center",
            icon: FileCheck2,
            access: "ALL",
          },
          {
            title: "Non-Conformités (8D)",
            path: "/dashboard/non-conformites",
            icon: AlertTriangle,
            access: "MANAGER",
          },
          {
            title: "Causes & Racines",
            path: "/dashboard/quality/root-cause",
            icon: Leaf,
            access: "ALL",
          },
          {
            title: "Actions Correctives (CAPA)",
            path: "/dashboard/actions",
            icon: ClipboardCheck,
            access: "MANAGER",
          },
          {
            title: "Plan d'Actions (PAQ)",
            path: "/dashboard/paq",
            icon: Zap,
            access: "ALL",
          },
          {
            title: "Revue de Direction",
            path: "/dashboard/management-review",
            icon: FileText,
            access: "ALL",
          },
          {
            title: "Réclamations",
            path: "/dashboard/reclamations",
            icon: FileText,
            access: "ALL",
          },
          {
            title: "Statistiques & Agrégats",
            path: "/dashboard/improvement",
            icon: Leaf,
            access: "ALL",
          },
          {
            title: "Amélioration continue",
            path: "/dashboard/continuous-improvement",
            icon: Leaf,
            access: "ALL",
          },
        ],
      },
      {
        id: "it-security",
        label: "6. SÉCURITÉ IT (ISO 27001)",
        icon: Lock,
        items: [
          {
            title: "Conformité Légale & RGPD",
            path: "/dashboard/requirements",
            icon: Scale,
            access: "ALL",
          },
          {
            title: "Registre ANSD (Sénégal)",
            path: "/dashboard/senegal-legal",
            icon: Scale,
            access: "ALL",
          },
          {
            title: "Actifs IT & Sécurité",
            path: "/dashboard/equipment",
            icon: Database,
            access: "ALL",
          },
        ],
      },
      {
        id: "rh-competences",
        label: "7. FORMATIONS & RH",
        icon: Users,
        items: [
          {
            title: "Gestion des Compétences",
            path: "/dashboard/rh",
            icon: Users,
            access: "ALL",
          },
          {
            title: "Matrice des Compétences",
            path: "/dashboard/rh/matrice",
            icon: Network,
            access: "MANAGER",
          },
          {
            title: "Suivi des Formations",
            path: "/dashboard/formations",
            icon: BookOpen,
            access: "ALL",
          },
        ],
      },
      {
        id: "environnement-sse",
        label: "8. SÉCURITÉ & ENVIRONNEMENT",
        icon: Leaf,
        items: [
          {
            title: "Hub Santé/Sécurité (SSE)",
            path: "/dashboard/sse",
            icon: HardHat,
            access: "ALL",
          },
          {
            title: "Causeries Sécurité",
            path: "/dashboard/sse/causeries",
            icon: Users,
            access: "ALL",
          },
          {
            title: "Incidents & Impacts",
            path: "/dashboard/environment/incidents",
            icon: AlertTriangle,
            access: "ALL",
          },
          {
            title: "Déchets",
            path: "/dashboard/environment/wastes",
            icon: Leaf,
            access: "ALL",
          },
          {
            title: "Consommations",
            path: "/dashboard/environment/consumptions",
            icon: Leaf,
            access: "ALL",
          },
          {
            title: "Statistiques & Analyses",
            path: "/dashboard/environment/analytics",
            icon: Leaf,
            access: "ALL",
          },
        ],
      },
      {
        id: "admin",
        label: "⚙️ CONFIGURATION ELITE",
        icon: Settings2,
        items: [
          {
            title: "Sites & Implantations",
            path: "/dashboard/sites",
            icon: Database,
            access: "ALL",
          },
          {
            title: "Types d'unités organiques",
            path: "/dashboard/org-units-type",
            icon: Leaf,
            access: "ALL",
          },
          {
            title: "Unités Organiques",
            path: "/dashboard/org-units",
            icon: Network,
            access: "ALL",
          },
          {
            title: "Types de processus",
            path: "/dashboard/processus-type",
            icon: Leaf,
            access: "ALL",
          },
          {
            title: "Collaborateurs",
            path: "/dashboard/users",
            icon: Users,
            access: "ADMIN",
          },
          {
            title: "Paramètres Système",
            path: "/dashboard/admin/setup",
            icon: Settings2,
            access: "ADMIN",
          },
        ],
      },
    ];

    if (isSuperAdmin && !isImpersonated) {
      groups.push({
        id: "superadmin",
        label: "👑 CONSOLE MAÎTRE",
        icon: Crown,
        items: [
          {
            title: "Matrix Dashboard",
            path: "/admin/matrix",
            icon: Terminal,
            access: "SUPERADMIN",
          },
          {
            title: "Gestion Clients",
            path: "/dashboard/superadmin/tenants",
            icon: Database,
            access: "SUPERADMIN",
          },
          {
            title: "Transactions & Subs",
            path: "/dashboard/superadmin/transactions",
            icon: Activity,
            access: "SUPERADMIN",
          },
          {
            title: "Sécurité Globale",
            path: "/dashboard/superadmin/security",
            icon: ShieldAlert,
            access: "SUPERADMIN",
          },
        ],
      });
    }
    return groups;
  }, [isSuperAdmin, isPilote, assignedProcessId, isImpersonated]);

  return (
    <aside
      className={`w-[320px] h-screen flex flex-col fixed left-0 top-0 z-50 border-r-2 transition-all duration-500 font-sans italic shadow-2xl
      ${isImpersonated ? "bg-[#1A1515] border-amber-500/30" : "bg-[#0B0F1A] border-white/5"}`}
    >
      {/* 🔴 BANDEAU IMPERSONATION (SOVEREIGN MODE) */}
      {isImpersonated && (
        <div className="bg-amber-600 px-6 py-3 flex items-center justify-between animate-pulse shrink-0 shadow-lg">
          <div className="flex items-center gap-3">
            <ShieldAlert size={16} className="text-white" strokeWidth={3} />
            <span className="text-[11px] font-black uppercase text-white tracking-[0.3em] leading-none mt-1">
              Qualisoft Contrôle
            </span>
          </div>
          <button
            onClick={exitImpersonation}
            className="text-white hover:scale-125 hover:text-red-200 transition-all border-none bg-transparent cursor-pointer"
          >
            <XCircle size={20} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* 🔝 LOGO & BRANDING */}
      <div
        className={`p-8 shrink-0 border-b-2 border-white/5 flex items-center gap-5 ${isImpersonated ? "bg-[#110D0D]" : "bg-[#151A2D]"}`}
      >
        <div className="w-14 h-14 bg-white rounded-[1.2rem] flex items-center justify-center border-4 border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <Image
            src="/assets/QsLogo.svg"
            alt="Qualisoft Elite"
            width={32}
            height={32}
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
            QUALI<span className="text-blue-600">SOFT</span>
          </h1>
          <p
            className={`text-[9px] font-black uppercase tracking-[0.4em] mt-2 leading-none ${isImpersonated ? "text-amber-500" : "text-slate-500"}`}
          >
            {isSuperAdmin ? "Sovereign Node" : "Elite System"}
          </p>
        </div>
      </div>

      {/* 🧭 NAVIGATION DYNAMIQUE (ACCORDION ÉLÉGANT) */}
      <nav className="flex-1 overflow-y-auto px-6 py-10 space-y-6 custom-scrollbar">
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter(hasAccess);
          if (visibleItems.length === 0) return null;
          const isExpanded = expandedGroups.includes(group.id);

          return (
            <div key={group.id} className="space-y-3">
              <button
                onClick={() =>
                  setExpandedGroups((p) =>
                    p.includes(group.id)
                      ? p.filter((g) => g !== group.id)
                      : [...p, group.id],
                  )
                }
                className="w-full flex items-center justify-between py-3 px-2 rounded-xl group text-left cursor-pointer border-none bg-transparent transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg transition-colors ${isExpanded ? "bg-blue-600/20 text-blue-500" : "bg-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-slate-300"}`}
                  >
                    <group.icon size={16} strokeWidth={2.5} />
                  </div>
                  <span
                    className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors mt-0.5 ${isExpanded ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`}
                  >
                    {group.label}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  strokeWidth={3}
                  className={`text-slate-600 transition-transform duration-300 ${isExpanded ? "rotate-180 text-blue-500" : ""}`}
                />
              </button>

              {/* SOUS-MENU (AVEC LIGNE DIRECTRICE GAUCHE) */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 mt-0"}`}
              >
                <div className="overflow-hidden pl-6 ml-4 border-l-2 border-white/5 space-y-2">
                  {visibleItems.map((item, idx) => {
                    // Maintien de l'état actif même dans les sous-pages (ex: /dashboard/actions/nouveau)
                    const isActive =
                      pathname === item.path ||
                      pathname.startsWith(`${item.path}/`);

                    return (
                      <Link
                        key={idx}
                        href={item.path}
                        className={`flex items-center gap-4 py-3 px-4 rounded-2xl transition-all duration-300 relative overflow-hidden group/link
                          ${
                            isActive
                              ? "bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)] translate-x-1"
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        {/* Barre active latérale glowy */}
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
                        )}

                        <item.icon
                          size={14}
                          strokeWidth={isActive ? 3 : 2}
                          className={`${isActive ? "text-white" : "text-slate-500 group-hover/link:text-blue-400"} transition-colors`}
                        />
                        <span
                          className={`text-[11px] uppercase tracking-widest mt-0.5 ${isActive ? "font-black" : "font-bold"}`}
                        >
                          {item.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* 👤 PROFIL UTILISATEUR & DECONNEXION */}
      <div
        className={`p-8 border-t-2 border-white/5 shrink-0 ${isImpersonated ? "bg-[#110D0D]" : "bg-[#151A2D]"}`}
      >
        <div className="flex items-center justify-between p-4 rounded-3xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors shadow-inner">
          <div className="flex items-center gap-4 overflow-hidden">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[14px] font-black shadow-lg border-2 border-white/10 shrink-0
              ${isSuperAdmin ? "bg-amber-600 text-white" : "bg-blue-600 text-white"}`}
            >
              {user?.U_FirstName?.[0] || "Q"}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-[12px] font-black truncate text-white uppercase italic leading-none mb-2">
                {user?.U_FirstName || "SDE"} {user?.U_LastName || "USER"}
              </p>
              <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] leading-none truncate">
                {user?.U_Role || "GUEST_ROLE"}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="p-3 text-slate-500 hover:text-rose-500 transition-all hover:bg-rose-500/10 rounded-xl border-none bg-transparent cursor-pointer shrink-0 ml-2"
            title="Déconnexion sécurisée"
          >
            <LogOut size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3b82f6;
        }
      `}</style>
    </aside>
  );
}
