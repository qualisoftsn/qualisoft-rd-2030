/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import apiClient from "@/core/api/api-client";
import { AuthUser, useAuthStore } from "@/store/authStore";
import {
  Activity, AlertTriangle, Award, BookOpen, Boxes, Building, Building2,
  ChevronDown, ClipboardCheck, Contact, Crown, Database, FileSearch,
  FileText, FolderOpen, Gavel, GitBranch, GraduationCap, HardHat,
  LayoutDashboard, Leaf, LineChart, LogOut, Map as MapIcon,
  Network, Presentation, RefreshCw, Settings2, ShieldCheck, Star,
  Target, Terminal, Trash2, Truck, UserCircle, Users, Users2, Workflow,
  Zap // Ajouté pour le pôle Opérations
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

// --- Interfaces ---
interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  access: "ALL" | "MANAGER" | "ADMIN" | "RH" | "QSE" | "DIRECTION" | "SUPERADMIN";
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
  const [tenantName, setTenantName] = useState<string>("Chargement...");
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>("PLATINE ÉLITE");

  // ÉTAT INITIAL : On active tous les groupes pour la vue d'ensemble
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "pole-pilotage", "pole-architecture", "pole-operations", "pole-qualite", "pole-hse", "admin", "superadmin"
  ]);

  const userRole = useMemo(() => user?.U_Role?.toUpperCase() || "", [user]);
  const isPilote = userRole === "PILOTE" && !!user.assignedProcessId;

  useEffect(() => {
    // Récupération dynamique du Partenaire
    apiClient.get("/tenants/current")
      .then((res) => {
        setTenantName(res.data.T_Name);
        setSubscriptionPlan(res.data.T_Plan || "PLATINE ÉLITE");
      })
      .catch(() => setTenantName("INSTANCE PARTENAIRE"));
  }, []);

  const roles = useMemo(() => ({
    isDirection: ["DIRECTEUR", "DG", "PRESIDENT", "RQ"].includes(userRole) || isSuperAdmin,
    isQSE: ["RQ", "QSE", "AUDITEUR"].includes(userRole) || isSuperAdmin,
    isRH: ["RH", "DRH"].includes(userRole) || isSuperAdmin,
    isManager: ["MANAGER", "CHEF", "PILOTE"].includes(userRole) || isSuperAdmin,
    isAdmin: ["ADMIN"].includes(userRole) || isSuperAdmin,
  }), [userRole, isSuperAdmin]);

  const hasAccess = (item: MenuItem): boolean => {
    if (isSuperAdmin) return true;
    switch (item.access) {
      case "ALL": return true;
      case "DIRECTION": return roles.isDirection;
      case "QSE": return roles.isQSE;
      case "RH": return roles.isRH;
      case "MANAGER": return roles.isManager;
      case "ADMIN": return roles.isAdmin;
      case "SUPERADMIN": return isSuperAdmin;
      default: return false;
    }
  };

  // LOGIQUE PILOTE (Garde inchangée)
  const getPath = (defaultPath: string, tab: string) =>
    isPilote ? `/dashboard/processus/cockpit/${user.assignedProcessId}?tab=${tab}` : defaultPath;

  const menuGroups: MenuGroup[] = useMemo(() => {
    const baseGroups: MenuGroup[] = [
      {
        // 1. PÔLE PILOTAGE (Stratégie & Direction)
        id: "pole-pilotage",
        label: "📊 PILOTAGE & STRATÉGIE",
        icon: Activity,
        items: [
          { title: "Tableau de Bord Certification", path: getPath("/dashboard/tb-certif", "Tableau de Certification"), icon: LayoutDashboard, access: "ALL" },
          { title: "Objectifs SMQ", path: "/dashboard/objectifs", icon: Network, access: "ALL" },
          { title: "Gestion PAQ", path: getPath("/dashboard/paq", "PAQs"), icon: Gavel, access: "ALL" },
          { title: "Alertes & Echéances", path: getPath("/dashboard/alerts", "Alertes et échéances"), icon: AlertTriangle, access: "ALL" },
          { title: "Revues Direction", path: "/dashboard/management-review", icon: Presentation, access: "ADMIN" },
          { title: "Instances COPIL", path: "/dashboard/gouvernance/copil", icon: Users2, access: "ADMIN" },
        ],
      },
      {
        // 2. PÔLE ARCHITECTURE (Système & Risques)
        id: "pole-architecture",
        label: "🏗️ ARCHITECTURE & RISQUES",
        icon: GitBranch,
        items: [
          { title: "Cartographie", path: "/dashboard/direction", icon: MapIcon, access: "ALL" },
          { title: "Fiches Processus", path: "/dashboard/processus", icon: GitBranch, access: "ALL" },
          { title: "Objectifs & Kpis", path: getPath("/dashboard/objectifs", "KPI"), icon: LineChart, access: "ALL" },
          { title: "Gestion des Risques", path: getPath("/dashboard/risks", "RISQUES"), icon: Target, access: "ADMIN" },
        ],
      },
      {
        // 3. PÔLE OPÉRATIONS (Amélioration & Logistique)
        id: "pole-operations",
        label: "🚀 OPÉRATIONS & AMÉLIORATION",
        icon: Zap,
        items: [
          { title: "Gestion des Actions", path: getPath("/dashboard/actions", "ACTIONS"), icon: Workflow, access: "ALL" },
          { title: "Tableau de bord Actions", path: "/dashboard/actions-tab", icon: Workflow, access: "ALL" },
          { title: "Équipements", path: getPath("/dashboard/equipment", "EQUIPEMENTS"), icon: Building2, access: "ALL" },
          { title: "Tiers (Fournisseurs-Etats)", path: "/dashboard/tiers", icon: Truck, access: "ALL" },
          { title: "Réclamations", path: "/dashboard/reclamations", icon: Contact, access: "ALL" },
        ],
      },
      {
        // 4. PÔLE QUALITÉ (Conformité & Documents)
        id: "pole-qualite",
        label: "🛡️ QUALITÉ & DOCUMENTS",
        icon: ShieldCheck,
        items: [
          { title: "GED Qualité", path: getPath("/dashboard/ged", "GED"), icon: FolderOpen, access: "ALL" },
          { title: "Audits Internes", path: "/dashboard/audits", icon: ClipboardCheck, access: "ADMIN" },
          { title: "Non-Conformités", path: "/dashboard/non-conformites", icon: AlertTriangle, access: "ALL", badge: 3 },
          { title: "Bibliothèque", path: "/dashboard/bibliotheque", icon: BookOpen, access: "ALL" },
          { title: "Checklist ISO 9001", path: "/dashboard/checklists/iso9001", icon: Target, access: "ADMIN" },
          { title: "Checklist ISO 14001", path: "/dashboard/checklists/iso14001", icon: Leaf, access: "ADMIN" },
          { title: "Légal Sénégal", path: "/dashboard/senegal-legal", icon: FileText, access: "ADMIN" },
          { title: "Générateur Rapports", path: "/dashboard/audit-center/report-generator", icon: FileText, access: "ADMIN" },
        ],
      },
      {
        // 5. PÔLE HSE (Ressources & Sécurité)
        id: "pole-hse",
        label: "🌱 HSE & COMPÉTENCES",
        icon: HardHat,
        items: [
          { title: "GPEC & Compétences", path: getPath("/dashboard/rh", "RH"), icon: Award, access: "ADMIN" },
          { title: "Dossiers RH", path: "/dashboard/users", icon: UserCircle, access: "ADMIN" },
          { title: "Formations", path: "/dashboard/formations", icon: GraduationCap, access: "ADMIN" },
          { title: "Cockpit SSE", path: "/dashboard/environment", icon: Activity, access: "ADMIN" },
          { title: "Consommations", path: "/dashboard/environment/consumptions", icon: Workflow, access: "ADMIN" },
          { title: "Déchets", path: "/dashboard/environment/wastes", icon: Trash2, access: "ADMIN" },
          { title: "Incidents", path: "/dashboard/environment/incidents", icon: AlertTriangle, access: "ADMIN" },
          { title: "Causeries", path: "/dashboard/sse/causeries", icon: Users, access: "ADMIN" },
        ],
      },
      {
        // 6. ADMIN (Technique)
        id: "admin",
        label: "⚙️ PARAMÈTRES",
        icon: Settings2,
        items: [
          { title: "Utilisateurs", path: "/dashboard/users", icon: Users, access: "ADMIN" },
          { title: "Types de processus", path: "/dashboard/processus-type", icon: Workflow, access: "ADMIN" },
          { title: "Types d'unité", path: "/dashboard/org-units-type", icon: Boxes, access: "ADMIN" },
          { title: "Sites", path: "/dashboard/sites", icon: MapIcon, access: "ADMIN" },
          { title: "Unités organiques", path: "/dashboard/org-units", icon: Building2, access: "ADMIN" },
          { title: "Configuration", path: "/dashboard/settings", icon: Settings2, access: "SUPERADMIN" },
        ],
      },
    ];

    if (isSuperAdmin) {
      baseGroups.push({
        id: "superadmin",
        label: "👑 CONSOLE SOUVERAINE",
        icon: Crown,
        items: [
          { title: "Master Console", path: "/dashboard/superadmin/console", icon: Terminal, access: "SUPERADMIN" },
          { title: "Tenants Matrix", path: "/dashboard/superadmin/tenants", icon: Database, access: "SUPERADMIN" },
        ],
      });
    }

    return baseGroups;
  }, [isSuperAdmin, isPilote, user.assignedProcessId, userRole]);

  const handleLogout = () => { logout(); window.location.href = "/auth/login"; };

  return (
    <aside className="w-80 h-screen bg-[#0F172A] text-white flex flex-col fixed left-0 top-0 z-40 border-r border-white/5 shadow-2xl font-sans overflow-hidden italic">
      
      {/* --- SECTION BRANDING & LOGO --- */}
      <div className="p-6 shrink-0 border-b border-white/5 bg-[#111A2E] relative overflow-hidden">
        {/* Décor subtil */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="relative w-14 h-14 shrink-0 bg-white rounded-2xl p-1 shadow-lg flex items-center justify-center overflow-hidden border border-white/10 group transition-transform hover:scale-105">
             <Image 
                src="/QsLogo.svg" 
                alt="Qualisoft Logo" 
                width={56}
                height={56}
                priority 
                className="object-contain filter drop-shadow-md"
             />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-xl font-black uppercase tracking-tighter leading-none text-white drop-shadow-sm">QUALISOFT</h1>
            <p className={`text-[9px] font-bold uppercase tracking-[0.3em] mt-1.5 transition-colors ${isSuperAdmin ? "text-amber-500" : "text-blue-400"}`}>
              {isSuperAdmin ? "ADMINISTRATEUR SOUVERAIN" : "SMI EXPERT SYSTEM"}
            </p>
          </div>
        </div>

        {/* 🏢 PARTENAIRE CARD */}
        <div className="mb-4 px-4 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:border-blue-500/30 transition-colors">
          <p className="text-[7px] font-black uppercase text-blue-500/80 tracking-widest mb-1.5 italic">Partenaire</p>
          <h2 className="text-[11px] font-bold uppercase text-white truncate italic tracking-tight leading-tight">
            {tenantName}
          </h2>
        </div>

        {/* ✨ PLAN SOUSCRIT CARD */}
        <div className="relative overflow-hidden rounded-2xl p-px bg-linear-to-br from-blue-500/50 to-transparent shadow-inner">
          <div className="relative bg-[#0F172A]/80 backdrop-blur-md rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <ShieldCheck size={18} className="text-blue-400" />
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-[7px] font-black uppercase text-slate-400 tracking-[0.2em] leading-none mb-1 italic">
                  PLAN SOUSCRIT
                </p>
                <h2 className="text-[11px] font-black uppercase truncate italic tracking-tight leading-none bg-clip-text text-transparent bg-linear-to-r from-white to-slate-300">
                  {subscriptionPlan}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- NAVIGATION DÉTAILLÉE --- */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-3 custom-scrollbar">
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        `}</style>

        {menuGroups.map((group) => {
          const visibleItems = group.items.filter((item) => hasAccess(item));
          if (visibleItems.length === 0) return null;
          const isExpanded = expandedGroups.includes(group.id);
          const GroupIcon = group.icon;

          return (
            <div key={group.id} className="space-y-1">
              {/* Header du groupe (Style Premium) */}
              <button
                onClick={() => setExpandedGroups(p => p.includes(group.id) ? p.filter(g => g !== group.id) : [...p, group.id])}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-white/5 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <GroupIcon size={18} className={`transition-colors duration-300 ${isExpanded ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "text-slate-500 group-hover:text-slate-300"}`} />
                  <span className={`text-[10.5px] font-black uppercase tracking-[0.15em] italic transition-colors duration-300 ${isExpanded ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>
                    {group.label}
                  </span>
                </div>
                <ChevronDown size={14} className={`text-slate-600 transition-transform duration-300 ${isExpanded ? "rotate-180 text-blue-400" : ""}`} />
              </button>

              {/* Liste des items */}
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? "max-h-125 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="pl-2 space-y-0.5 border-l border-white/5 ml-4 mt-1">
                  {visibleItems.map((item, idx) => {
                    const isActive = pathname === item.path || (item.path.includes("/cockpit") && pathname.includes("/cockpit"));
                    
                    return (
                      <Link
                        key={`${group.id}-${idx}`}
                        href={item.path}
                        className={`relative flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 group/item
                          ${isActive 
                            ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)] translate-x-1" 
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-blue-300 rounded-r-full shadow-[0_0_10px_#60a5fa]" />
                        )}
                        
                        <div className="flex items-center gap-3 overflow-hidden">
                          <item.icon size={15} className={`shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-500 group-hover/item:text-slate-300"}`} />
                          {/* Typographie améliorée : Majuscule, sans italic pour la lisibilité */}
                          <span className="text-[10px] font-bold uppercase tracking-wide truncate leading-none">
                            {item.title}
                          </span>
                        </div>

                        {item.badge && (
                          <span className="flex items-center justify-center min-w-4.5 h-4.5 bg-red-500/90 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 rounded-full shadow-md border border-red-400/30 animate-pulse">
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

      {/* --- PROFILE SECTION (Footer) --- */}
      <div className="p-5 border-t border-white/5 bg-[#0B1222]">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-linear-to-r from-white/5 to-transparent border border-white/5 hover:border-blue-500/30 transition-all group cursor-default">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0 shadow-lg transition-transform group-hover:scale-105 ${isSuperAdmin ? "bg-linear-to-br from-amber-500 to-amber-700 border border-amber-400/30" : "bg-linear-to-br from-blue-600 to-blue-800 border border-blue-400/30"}`}>
              {user?.U_FirstName?.[0]}{user?.U_LastName?.[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-slate-100 truncate leading-none mb-0.5">{user?.U_FirstName} {user?.U_LastName}</p>
              <p className={`text-[8px] font-bold uppercase tracking-widest ${isSuperAdmin ? "text-amber-500/80" : "text-blue-400/80"}`}>{user?.U_Role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            title="Déconnexion"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}