//* eslint-disable react-hooks/exhaustive-deps */
"use client";

import apiClient from "@/core/api/api-client";
import { AuthUser, useAuthStore } from "@/store/authStore";
import {
  Activity,
  AlertTriangle,
  Award,
  BookOpen,
  Building,
  Building2,
  ChevronDown,
  ClipboardCheck,
  Contact,
  Crown,
  Database,
  FileSearch,
  FolderOpen,
  Gavel,
  GitBranch,
  GraduationCap,
  HardHat,
  LayoutDashboard,
  LineChart,
  LogOut,
  Map as MapIcon,
  Network,
  Presentation,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Star,
  Target,
  Terminal,
  Truck,
  UserCircle,
  Users,
  Users2,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  access:
    | "ALL"
    | "MANAGER"
    | "ADMIN"
    | "RH"
    | "QSE"
    | "DIRECTION"
    | "SUPERADMIN";
  badge?: number;
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
  user: AuthUser;
  isSuperAdmin: boolean;
}) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const [processLabel, setProcessLabel] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "ch4_ch5",
    "ch8",
  ]);

  const userRole = useMemo(() => user?.U_Role?.toUpperCase() || "", [user]);
  const isPilote = userRole === "PILOTE" && !!user.assignedProcessId;

  // 📡 Récupération ultra-rapide du libellé du processus
  useEffect(() => {
    if (isPilote && user.assignedProcessId) {
      apiClient
        .get(`/processus/${user.assignedProcessId}`)
        .then((res) => setProcessLabel(res.data.PR_Libelle))
        .catch(() => setProcessLabel("Processus non défini"));
    }
  }, [isPilote, user.assignedProcessId]);

  const roles = useMemo(
    () => ({
      isDirection:
        ["DIRECTEUR", "DG", "PRESIDENT", "RQ"].includes(userRole) ||
        isSuperAdmin,
      isQSE: ["RQ", "QSE", "AUDITEUR"].includes(userRole) || isSuperAdmin,
      isRH: ["RH", "DRH"].includes(userRole) || isSuperAdmin,
      isManager:
        ["MANAGER", "CHEF", "PILOTE"].includes(userRole) || isSuperAdmin,
      isAdmin: ["ADMIN"].includes(userRole) || isSuperAdmin,
    }),
    [userRole, isSuperAdmin],
  );

  const hasAccess = (item: MenuItem): boolean => {
    if (isSuperAdmin) return true;
    switch (item.access) {
      case "ALL":
        return true;
      case "DIRECTION":
        return roles.isDirection;
      case "QSE":
        return roles.isQSE;
      case "RH":
        return roles.isRH;
      case "MANAGER":
        return roles.isManager;
      case "ADMIN":
        return roles.isAdmin;
      case "SUPERADMIN":
        return isSuperAdmin;
      default:
        return false;
    }
  };

  const menuGroups: MenuGroup[] = useMemo(() => {
    const getPath = (defaultPath: string, tab: string) => {
      return isPilote
        ? `/dashboard/processus/cockpit/${user.assignedProcessId}?tab=${tab}`
        : defaultPath;
    };

    const baseGroups: MenuGroup[] = [
      {
        id: "ch4_ch5",
        label: "Context & Leadership",
        icon: Building,
        items: [
          {
            title: "Cockpit SMI",
            path: isPilote
              ? `/dashboard/processus/cockpit/${user.assignedProcessId}`
              : "/dashboard",
            icon: LayoutDashboard,
            access: "ALL",
          },
          {
            title: "PAQ & Processus",
            path: getPath("/dashboard/actions", "ACTIONS"),
            icon: Gavel,
            access: "ALL",
          },
          {
            title: "Objectifs SMQ",
            path: "/dashboard/objectifs",
            icon: Network,
            access: "ALL",
          },
          {
            title: "Revues Direction",
            path: "/dashboard/management-review",
            icon: Presentation,
            access: "ADMIN",
          },
        ],
      },
      {
        id: "ch6",
        label: "Planning (§6)",
        icon: Target,
        items: [
          {
            title: "Objectifs & Kpis",
            path: getPath("/dashboard/objectifs", "KPI"),
            icon: LineChart,
            access: "ALL",
          },
          {
            title: "Gestion des Risques",
            path: getPath("/dashboard/risks", "RISQUES"),
            icon: Target,
            access: "ADMIN",
          },
          {
            title: "Instances COPIL",
            path: "/dashboard/gouvernance/copil",
            icon: Users2,
            access: "ADMIN",
          },
        ],
      },
      {
        id: "ch7",
        label: "Support (§7)",
        icon: HardHat,
        items: [
          {
            title: "GPEC & Compétences",
            path: getPath("/dashboard/rh", "RH"),
            icon: Award,
            access: "ADMIN",
          },
          {
            title: "Dossiers RH",
            path: "/dashboard/users",
            icon: UserCircle,
            access: "ADMIN",
          },
          {
            title: "Formations",
            path: "/dashboard/formations",
            icon: GraduationCap,
            access: "ADMIN",
          },
          {
            title: "GED Qualité",
            path: getPath("/dashboard/ged", "GED"),
            icon: FolderOpen,
            access: "ALL",
          },
          {
            title: "Bibliothèque",
            path: "/dashboard/bibliotheque",
            icon: BookOpen,
            access: "ALL",
          },
          {
            title: "Équipements",
            path: getPath("/dashboard/equipment", "EQUIPEMENTS"),
            icon: Building2,
            access: "ALL",
          },
        ],
      },
      {
        id: "ch8",
        label: "Opérations (§8)",
        icon: Activity,
        items: [
          {
            title: "Cartographie",
            path: "/dashboard/direction",
            icon: MapIcon,
            access: "ALL",
          },
          {
            title: "Fiches Processus",
            path: "/dashboard/processus",
            icon: GitBranch,
            access: "ALL",
          },
          {
            title: "Tableau de bord Actions",
            path: "/dashboard/actions-tab",
            icon: Workflow,
            access: "ALL",
          },
          {
            title: "Tiers / Achats",
            path: "/dashboard/tiers",
            icon: Truck,
            access: "ALL",
          },
          {
            title: "Réclamations",
            path: "/dashboard/reclamations",
            icon: Contact,
            access: "ALL",
          },
        ],
      },
      {
        id: "ch9_ch10",
        label: "Performance (§9-10)",
        icon: RefreshCw,
        items: [
          {
            title: "Indicateurs (KPI)",
            path: getPath("/dashboard/indicators", "KPI"),
            icon: Activity,
            access: "ALL",
          },
          {
            title: "Centre des Audits",
            path: "/dashboard/audit-center",
            icon: ClipboardCheck,
            access: "ADMIN",
          },
          {
            title: "Audits Internes",
            path: "/dashboard/audits",
            icon: ClipboardCheck,
            access: "ADMIN",
          },
          {
            title: "Non-Conformités",
            path: "/dashboard/non-conformites",
            icon: AlertTriangle,
            access: "ALL",
            badge: 3,
          },
          {
            title: "Archives",
            path: "/dashboard/archives",
            icon: FileSearch,
            access: "ADMIN",
          },
        ],
      },
     {
        id: "ENV-01",
        label: "Environnement",
        icon: Settings2,
        items: [
          {
            title: "Cockpit SSE",
            path: "/dashboard/environment",
            icon: Users,
            access: "ADMIN",
          },
          {
            title: "Consommations",
            path: "/dashboard/environment/consumptions",
            icon: Users,
            access: "ADMIN",
          },
          {
            title: "Déchets",
            path: "/dashboard/environment/wastes",
            icon: Users,
            access: "ADMIN",
          },
          {
            title: "Incidents",
            path: "/dashboard/environment/incidents",
            icon: Users,
            access: "ADMIN",
          },
          {
            title: "Causeries",
            path: "/dashboard/environment/causeries",
            icon: Users,
            access: "ADMIN",
          },
        ],
      },

      {
        id: "admin",
        label: "Paramètres",
        icon: Settings2,
        items: [
          {
            title: "Utilisateurs",
            path: "/dashboard/users",
            icon: Users,
            access: "ADMIN",
          },
          {
            title: "Types de processus",
            path: "/dashboard/processus-type",
            icon: Users,
            access: "ADMIN",
          },
          {
            title: "Type d'unité organique",
            path: "/dashboard/org-units-type",
            icon: Users,
            access: "ADMIN",
          },
          {
            title: "Sites",
            path: "/dashboard/sites",
            icon: Users,
            access: "ADMIN",
          },
          {
            title: "Unités organiques",
            path: "/dashboard/org-units",
            icon: Users,
            access: "ADMIN",
          },
          {
            title: "Configuration",
            path: "/dashboard/settings",
            icon: Settings2,
            access: "SUPERADMIN",
          },
        ],
      },
    ];

    if (isSuperAdmin) {
      baseGroups.push({
        id: "superadmin",
        label: "Console Souveraine",
        icon: Crown,
        items: [
          {
            title: "Master Console",
            path: "/dashboard/superadmin/console",
            icon: Terminal,
            access: "SUPERADMIN",
          },
          {
            title: "Tenants Matrix",
            path: "/dashboard/superadmin/tenants",
            icon: Database,
            access: "SUPERADMIN",
          },
        ],
      });
    }

    return baseGroups;
  }, [isSuperAdmin, isPilote, user.assignedProcessId]);

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
  };

  return (
    <aside className="w-72 h-screen bg-[#0F172A] text-white flex flex-col fixed left-0 top-0 z-40 border-r border-white/5 shadow-2xl italic font-sans overflow-hidden">
      {/* 🟢 BRANDING SECTION */}
      <div className="p-6 shrink-0 border-b border-white/5 bg-[#111A2E]">
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shadow-lg ${isSuperAdmin ? "bg-amber-500" : "bg-blue-600"}`}
          >
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tighter leading-none italic text-white">
              Qualisoft
            </h1>
            <p
              className={`text-[8px] font-bold uppercase tracking-[0.3em] mt-1 ${isSuperAdmin ? "text-amber-500" : "text-blue-400"}`}
            >
              {isSuperAdmin ? "SUPER ADMIN" : "SMI EXPERT"}
            </p>
          </div>
        </div>

        {/* ✨ MISE EN ÉVIDENCE DU PROCESSUS (SURBRILLANCE) ✨ */}
        <div
          className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-700 border ${
            isPilote
              ? "bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              : "bg-white/5 border-white/10"
          }`}
        >
          <div className="flex items-center gap-3 relative z-10">
            {isPilote ? (
              <Star
                size={16}
                className="text-amber-400 fill-amber-400 animate-pulse shrink-0"
              />
            ) : (
              <Building2 size={16} className="text-blue-500 shrink-0" />
            )}
            <div className="overflow-hidden">
              <p className="text-[7px] font-black uppercase text-slate-500 tracking-[0.2em] leading-none mb-1.5 italic">
                {isPilote ? "DOMAINE DE PILOTAGE" : "ORGANISATION"}
              </p>
              <h2
                className={`text-[11px] font-black uppercase truncate italic tracking-tight leading-none ${isPilote ? "text-blue-400" : "text-white"}`}
              >
                {isPilote
                  ? processLabel || "Chargement..."
                  : user?.U_LastName || "Instance Active"}
              </h2>
            </div>
          </div>
          {isPilote && (
            <div className="absolute top-0 right-0 p-1 opacity-20">
              <GitBranch
                size={40}
                className="text-blue-500 -rotate-12 translate-x-4 -translate-y-2"
              />
            </div>
          )}
        </div>
      </div>

      {/* 🧭 NAVIGATION SCROLLABLE */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter((item) => hasAccess(item));
          if (visibleItems.length === 0) return null;
          const isExpanded = expandedGroups.includes(group.id);
          const GroupIcon = group.icon;

          return (
            <div key={group.id} className="mb-2">
              <button
                onClick={() =>
                  setExpandedGroups((prev) =>
                    prev.includes(group.id)
                      ? prev.filter((g) => g !== group.id)
                      : [...prev, group.id],
                  )
                }
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <GroupIcon
                    size={18}
                    className="text-slate-500 group-hover:text-blue-400 transition-colors"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white italic">
                    {group.label}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-slate-600 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ${isExpanded ? "max-h-screen opacity-100 mt-2" : "max-h-0 opacity-0"}`}
              >
                <div className="pl-6 space-y-1 border-l border-white/5 ml-6">
                  {visibleItems.map((item, idx) => {
                    const active =
                      pathname === item.path ||
                      (pathname.includes("/cockpit") &&
                        item.path.includes(pathname.split("?")[0]));
                    return (
                      <Link
                        key={`${group.id}-${idx}`}
                        href={item.path}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1" : "text-slate-500 hover:text-white hover:translate-x-1"}`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon
                            size={14}
                            className={active ? "text-white" : "opacity-40"}
                          />
                          <span className="text-[10px] font-black uppercase italic tracking-tight">
                            {item.title}
                          </span>
                        </div>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* 👤 PROFILE SECTION */}
      <div className="p-6 border-t border-white/5 bg-[#0B1222]">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 group hover:border-blue-500/30 transition-all">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black text-white shrink-0 shadow-lg ${isSuperAdmin ? "bg-amber-500" : "bg-blue-600"}`}
            >
              {user?.U_FirstName?.[0]}
              {user?.U_LastName?.[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black uppercase text-slate-100 truncate italic leading-none">
                {user?.U_FirstName}
              </p>
              <p
                className={`text-[7px] font-black uppercase mt-1 tracking-widest ${isSuperAdmin ? "text-amber-500" : "text-blue-500"}`}
              >
                {user?.U_Role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
