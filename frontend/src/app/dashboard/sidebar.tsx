/* eslint-disable @typescript-eslint/no-unused-vars */
// File: frontend/src/app/dashboard/sidebar.tsx
"use client";

import {
  LayoutDashboard, Presentation, Users2, LineChart, Target,
  Network, GitBranch, Workflow, Map as MapIcon,
  Users, GraduationCap, Award, Building2,
  ClipboardList, CheckSquare, FolderKanban, Calendar, GanttChart,
  FileText, FolderOpen, FileSearch, ShieldCheck,
  AlertTriangle, TrendingUp, Activity, RefreshCw,
  Search, ClipboardCheck, FileCheck, Scale,
  Truck, Handshake, UserCircle, Contact,
  HardHat, Leaf, HeartPulse, AlertOctagon,
  Building, Gavel, BookOpen, Lock,
  Settings2, Database, Terminal, Crown, LogOut, Info, ChevronDown
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useMemo } from "react";
import { AuthUser, useAuthStore } from '@/store/authStore';

interface SidebarProps {
  user: AuthUser;
  isSuperAdmin: boolean;
}

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  access: "ALL" | "MANAGER" | "ADMIN" | "RH" | "QSE" | "DIRECTION" | "SUPERADMIN";
  description: string;
  badge?: number;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: MenuItem[];
}

export default function Sidebar({ user, isSuperAdmin }: SidebarProps) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const [hoveredItem, setHoveredItem] = useState<MenuItem | null>(null);
  const [mousePos, setMousePos] = useState({ y: 0 });
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["pilotage", "processus"]);

  const userRole = useMemo(() => user?.U_Role?.toUpperCase() || "", [user]);
  
  // --- LOGIQUE DE DROITS SÉCURISÉE ---
  const roles = useMemo(() => ({
    isDirection: ["DIRECTEUR", "DG", "PRESIDENT", "DIRECTEUR_GENERAL", "RQ"].includes(userRole) || isSuperAdmin,
    isQSE: ["RQ", "RESPONSABLE_QUALITE", "QSE", "AUDITEUR"].includes(userRole) || isSuperAdmin,
    isRH: ["RH", "DRH", "RESPONSABLE_RH"].includes(userRole) || isSuperAdmin,
    isManager: ["MANAGER", "CHEF_EQUIPE", "RESPONSABLE"].includes(userRole) || isSuperAdmin,
    isAdmin: ["ADMIN", "ADMINISTRATEUR"].includes(userRole) || isSuperAdmin,
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

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]
    );
  };

  // --- ARCHITECTURE SMI ISO 9001 (SANS DOUBLONS) ---
  const menuGroups: MenuGroup[] = useMemo(() => {
    const baseGroups: MenuGroup[] = [
      {
        id: "pilotage",
        label: "Pilotage & Direction",
        icon: LayoutDashboard,
        items: [
          { title: "Cockpit SMI", path: "/dashboard", icon: LayoutDashboard, access: "ALL", description: "Vue synthétique des indicateurs critiques" },
          { title: "Objectifs & Kpis", path: "/dashboard/objectifs", icon: LineChart, access: "ALL", description: "Indicateurs de performance (§9.1)" },
          { title: "Revues Direction", path: "/dashboard/management-review", icon: Presentation, access: "DIRECTION", description: "Comptes-rendus (§9.3)" },
          { title: "Instances COPIL", path: "/dashboard/gouvernance/copil", icon: Users2, access: "MANAGER", description: "Comités de pilotage" },
        ]
      },
      {
        id: "processus",
        label: "Processus & Flux",
        icon: Network,
        items: [
          { title: "Cartographie", path: "/dashboard/direction", icon: MapIcon, access: "ALL", description: "Vision macro des processus" },
          { title: "Fiches Processus", path: "/dashboard/processus", icon: GitBranch, access: "ALL", description: "SWOT et fiches d'identité" },
          { title: "Workflows", path: "/dashboard/workflows", icon: Workflow, access: "MANAGER", description: "Gestion des circuits de validation" },
          { title: "Mesures", path: "/dashboard/indicators", icon: Activity, access: "ALL", description: "Saisie des données" },
        ]
      },
      {
        id: "organisation",
        label: "Organisation & RH",
        icon: Users,
        items: [
          { title: "Organigramme", path: "/dashboard/org-units", icon: Network, access: "ALL", description: "Unités organiques" },
          { title: "Compétences", path: "/dashboard/rh", icon: Award, access: "RH", description: "Référentiels et matrices (§7.2)" },
          { title: "Formations", path: "/dashboard/formations", icon: GraduationCap, access: "RH", description: "Plan annuel de formation" },
          { title: "Population", path: "/dashboard/collaborateurs", icon: UserCircle, access: "RH", description: "Dossiers collaborateurs" },
        ]
      },
      {
        id: "conformite",
        label: "Audits & Amélioration",
        icon: Search,
        items: [
          { title: "Audits Internes", path: "/dashboard/audits", icon: ClipboardCheck, access: "QSE", description: "Programme d'audits (§9.2)" },
          { title: "Non-Conformités", path: "/dashboard/non-conformites", icon: AlertTriangle, access: "ALL", description: "Gestion des écarts", badge: 3 },
          { title: "Risques", path: "/dashboard/risks", icon: AlertOctagon, access: "MANAGER", description: "Analyse des risques (§6.1)" },
          { title: "Actions (PAQ)", path: "/dashboard/improvement", icon: Target, access: "ALL", description: "Plan d'Amélioration Qualité" },
        ]
      },
      {
        id: "tiers",
        label: "Tiers & Relations",
        icon: Handshake,
        items: [
          { title: "Fournisseurs", path: "/dashboard/tiers", icon: Truck, access: "ALL", description: "Évaluation et suivi (§8.4)" },
          { title: "Réclamations", path: "/dashboard/reclamations", icon: Contact, access: "ALL", description: "Satisfaction client (§9.1.2)" },
        ]
      },
      {
        id: "documents",
        label: "GED & Traçabilité",
        icon: FileText,
        items: [
          { title: "GED Qualité", path: "/dashboard/ged", icon: FolderOpen, access: "ALL", description: "Maîtrise documentaire (§7.5)" },
          { title: "Bibliothèque", path: "/dashboard/bibliotheque", icon: BookOpen, access: "ALL", description: "Normes et référentiels" },
          { title: "Archives", path: "/dashboard/archives", icon: FileSearch, access: "QSE", description: "Traçabilité historique" },
        ]
      },
      {
        id: "admin",
        label: "Paramètres",
        icon: Settings2,
        items: [
          { title: "Utilisateurs", path: "/dashboard/users", icon: Users, access: "ADMIN", description: "Droits et accès" },
          { title: "Configuration", path: "/dashboard/settings", icon: Settings2, access: "ADMIN", description: "Paramètres instance" },
        ]
      }
    ];

    if (isSuperAdmin) {
      baseGroups.push({
        id: "superadmin",
        label: "Console Souveraine",
        icon: Crown,
        items: [
          { title: "Master Console", path: "/dashboard/superadmin/console", icon: Terminal, access: "SUPERADMIN", description: "Monitoring infrastructure" },
          { title: "Tenants Matrix", path: "/dashboard/superadmin/tenants", icon: Database, access: "SUPERADMIN", description: "Gestion Multi-Tenant" },
        ]
      });
    }

    return baseGroups;
  }, [isSuperAdmin]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("master_access");
    window.location.href = "/auth/login";
  };

  return (
    <>
      <aside className="w-72 h-screen bg-[#0F172A] text-white flex flex-col fixed left-0 top-0 z-40 border-r border-white/5 shadow-2xl italic font-sans">
        
        {/* BRANDING SECTION */}
        <div className="p-6 shrink-0 border-b border-white/5 bg-[#111A2E]">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shadow-lg ${isSuperAdmin ? "bg-amber-500" : "bg-blue-600"}`}>
              <span className="font-black text-xl text-white not-italic">{isSuperAdmin ? "M" : "Q"}</span>
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter leading-none italic">Qualisoft</h1>
              <p className={`text-[8px] font-bold uppercase tracking-[0.3em] mt-1 ${isSuperAdmin ? "text-amber-500" : "text-blue-400"}`}>
                {isSuperAdmin ? "SUPER ADMIN" : "SMI EXPERT"}
              </p>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2 overflow-hidden">
            <Building2 size={14} className="text-blue-500 shrink-0" />
            <p className="text-[10px] font-black truncate uppercase text-slate-400 tracking-wider italic leading-none">
              {user?.tenantId || "Instance Active"}
            </p>
          </div>
        </div>

        {/* NAVIGATION SCROLLABLE */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2 scrollbar-hide">
          {menuGroups.map((group) => {
            const visibleItems = group.items.filter(item => hasAccess(item));
            if (visibleItems.length === 0) return null;

            const isExpanded = expandedGroups.includes(group.id);
            const GroupIcon = group.icon;

            return (
              <div key={group.id} className="mb-2">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <GroupIcon size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white italic">
                      {group.label}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`text-slate-600 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? "max-h-125 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                  <div className="pl-6 space-y-1 border-l border-white/5 ml-6">
                    {visibleItems.map((item, idx) => {
                      const active = pathname === item.path;
                      // Correction de la clé : id du groupe + path + index
                      return (
                        <Link
                          key={`${group.id}-${item.path}-${idx}`}
                          href={item.path}
                          onMouseEnter={(e) => {
                            setHoveredItem(item);
                            setMousePos({ y: e.currentTarget.getBoundingClientRect().top });
                          }}
                          onMouseLeave={() => setHoveredItem(null)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                            active 
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1" 
                              : "text-slate-500 hover:text-white hover:translate-x-1"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon size={14} className={active ? "text-white" : "opacity-40"} />
                            <span className="text-[10px] font-black uppercase italic tracking-tight">{item.title}</span>
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

        {/* PROFILE SECTION */}
        <div className="p-6 border-t border-white/5 bg-[#0B1222]">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 group hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black text-white shrink-0 shadow-lg ${isSuperAdmin ? "bg-amber-500" : "bg-blue-600"}`}>
                {user?.U_FirstName?.[0]}{user?.U_LastName?.[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-black uppercase text-slate-100 truncate italic leading-none">{user?.U_FirstName}</p>
                <p className={`text-[7px] font-black uppercase mt-1 tracking-widest ${isSuperAdmin ? "text-amber-500" : "text-blue-500"}`}>
                  {user?.U_Role}
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* INTELLIGENT TOOLTIP */}
      {hoveredItem && (
        <div
          style={{ top: mousePos.y }}
          className="fixed left-72 ml-4 w-64 p-6 rounded-4xl bg-[#0F172A] border border-blue-600/30 shadow-3xl z-50 pointer-events-none backdrop-blur-xl animate-in fade-in slide-in-from-left-2 duration-300"
        >
          <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
            <Info size={12} className="text-blue-500" />
            <span className="text-[9px] font-black uppercase text-slate-500 italic tracking-[0.2em]">Documentation SMI</span>
          </div>
          <p className="text-[10px] text-slate-200 leading-relaxed font-bold uppercase italic tracking-tight">
            {hoveredItem.description}
          </p>
        </div>
      )}
    </>
  );
}