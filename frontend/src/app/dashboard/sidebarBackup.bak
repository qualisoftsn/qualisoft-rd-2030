"use client";

import {
  Activity, ChevronDown, Crown, Database, 
  LayoutDashboard, LogOut, Network, Settings2, 
  Terminal, Users, ShieldAlert, XCircle, 
  FileText, ClipboardCheck, AlertTriangle, BarChart,
  Zap
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import React, { useMemo, useState, useEffect } from "react";
import { signOut } from "next-auth/react";

/**
 * 🛰️ INTERFACE SOUVERAINE
 */
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

export default function Sidebar({ user, isSuperAdmin }: { user: SidebarUser; isSuperAdmin: boolean; }) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["pole-pilotage", "smi-core"]);
  const [isImpersonated, setIsImpersonated] = useState<boolean>(false);

  /**
   * 🛡️ UNITÉ DE DÉTECTION SCELLÉE
   * On utilise requestAnimationFrame pour éviter l'erreur de setState synchrone.
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

  const menuGroups: MenuGroup[] = useMemo(() => {
    const getPath = (defaultPath: string, tab: string) => {
        return isPilote ? `/dashboard/processus/cockpit/${assignedProcessId}?tab=${tab}` : defaultPath;
    };

    const groups: MenuGroup[] = [
      {
        id: "pole-pilotage",
        label: "📊 PILOTAGE & STRATÉGIE",
        icon: Activity,
        items: [
          { title: "Cockpit de Direction", path: getPath("/dashboard/admin_rq", "General"), icon: LayoutDashboard, access: "ALL" },
          { title: "Objectifs SMQ", path: "/dashboard/objectifs", icon: Network, access: "ALL" },
          { title: "Organisation", path: "/dashboard/organization", icon: FileText, access: "ALL" },
          { title: "Indicateurs de Performance", path: "/dashboard/indicators", icon: BarChart, access: "MANAGER" },
          { title: "Cartographie des Processus", path: "/dashboard/processus", icon: BarChart, access: "MANAGER" },
          { title: "Statistiques", path: "/dashboard/stats", icon: FileText, access: "ALL" },
          { title: "Observateur", path: "/dashboard/observateur", icon: FileText, access: "ALL" },
          { title: "Cockpit Exécutif SMI", path: "/dashboard/smi-global", icon: FileText, access: "ALL" },
        ],
      },
      {
        id: "smi-core1",
        label: "🛡️ GESTION DES RISQUES",
        icon: ShieldAlert,
        items: [
          { title: "Registre des Risques", path: "/dashboard/risks", icon: Zap, access: "ALL" },
          { title: "Notifications", path: "/dashboard/notifications", icon: FileText, access: "ALL" },
          { title: "Aspects Environnementaux", path: "/dashboard/environment", icon: AlertTriangle, access: "ALL" },
          { title: "Conformité Légale", path: "/dashboard/requirements", icon: FileText, access: "ALL" },
        ],
      },
      {
        id: "smi-core2",
        label: "🛡️ OPERATIONS & SECURITE",
        icon: ShieldAlert,
        items: [
          { title: "Gestion Documentaire", path: "/dashboard/ged", icon: Zap, access: "ALL" },
          { title: "Actifs & Assets", path: "/dashboard/equipment", icon: AlertTriangle, access: "ALL" },
          { title: "Tiers - Partenaires", path: "/dashboard/tiers", icon: FileText, access: "ALL" },
          { title: "Plan de Continuité - PCA", path: "/dashboard/process-review", icon: FileText, access: "ALL" },
          { title: "Veille réglementaire & conformité", path: "/dashboard/requirements", icon: FileText, access: "ALL" },
        ],
      },
      {
        id: "smi-core3",
        label: "🛡️ EVALUATION & PERFORMANCE",
        icon: ShieldAlert,
        items: [
          { title: "Centre d'Audits", path: "/dashboard/audit-center", icon: Zap, access: "ALL" },
          { title: "Gouvernance", path: "/dashboard/gouvernance", icon: Zap, access: "ALL" },
          { title: "Direction - pilotage", path: "/dashboard/direction", icon: FileText, access: "ALL" },
          { title: "Enquêtes & Satisfaction", path: "/dashboard/quality/surveys", icon: AlertTriangle, access: "ALL" },
          { title: "Revue de Direction", path: "/dashboard/management-review", icon: FileText, access: "ALL" },
          { title: "COPIL - Préparation", path: "/dashboard/gouvernance/copil", icon: FileText, access: "ALL" },
          { title: "Veille légale - compliance", path: "/dashboard/gouvernance/compliance", icon: FileText, access: "ALL" },
        ],
      },

      {
        id: "pole-audit",
        label: "🔍 AMELIORATION CONTINUE",
        icon: ClipboardCheck,
        items: [
          { title: "Actions Correctives - CAPA", path: "/dashboard/actions", icon: ClipboardCheck, access: "MANAGER" },
          { title: "Non-Conformités", path: "/dashboard/non-conformites", icon: FileText, access: "MANAGER" },
          { title: "Réclamations", path: "/dashboard/reclamations", icon: Zap, access: "ALL" },
          { title: "Alertes", path: "/dashboard/alerts", icon: Zap, access: "ALL" },
          { title: "PAQ", path: "/dashboard/paq", icon: Zap, access: "ALL" },
          { title: "Environnement", path: "/dashboard/environment", icon: Zap, access: "ALL" },
          { title: "Amélioration continue", path: "/dashboard/improvement", icon: Zap, access: "ALL" },
          { title: "Innovation & Suggestions", path: "/dashboard/continuous-improvement", icon: FileText, access: "MANAGER" },
        ],
      },

      {
        id: "smi-core4",
        label: "🛡️ ENVIRONNEMENT & SECURITE",
        icon: ShieldAlert,
        items: [
          { title: "Causeries", path: "/dashboard/sse/causeries", icon: Zap, access: "ALL" },
          { title: "Incidents", path: "/dashboard/environment/incidents", icon: FileText, access: "ALL" },
          { title: "Consommations", path: "/dashboard/environment/consumptions", icon: FileText, access: "ALL" },
          { title: "Gestion des déchets", path: "/dashboard/environment/wastes", icon: FileText, access: "ALL" },
          { title: "Analyses", path: "/dashboard/sse/analytics", icon: Zap, access: "ALL" },
          { title: "Planning", path: "/dashboard/gouvernance/planning", icon: Zap, access: "ALL" },
          { title: "Sessions", path: "/dashboard/gouvernance/sessions", icon: Zap, access: "ALL" },
          { title: "Rapports", path: "/dashboard/sse", icon: AlertTriangle, access: "ALL" },
          
        ],
      },
      {
        id: "smi-core5",
        label: "🛡️ FORMATIONS & COMPETENCES",
        icon: ShieldAlert,
        items: [
          { title: "Ressources humaines", path: "/dashboard/rh", icon: Zap, access: "ALL" },
          { title: "Formations", path: "/dashboard/formations", icon: Zap, access: "ALL" },
          { title: "Conformité", path: "/dashboard/gouvernance/compliance", icon: Zap, access: "ALL" },
          { title: "Pilotage Certifications", path: "/dashboard/tb-certif", icon: Zap, access: "ALL" },
          { title: "Exigences", path: "/dashboard/requirements", icon: AlertTriangle, access: "ALL" },
          
        ],
      },

      {
        id: "smi-core6",
        label: "🛡️ SENEGAL LEGAL",
        icon: ShieldAlert,
        items: [
          { title: "Regsitre Conformité légal", path: "/dashboard/senegal-legal", icon: Zap, access: "ALL" },
          { title: "ISO 9001", path: "/dashboard/checklists/iso9001", icon: Zap, access: "ALL" },
          { title: "ISO 14001", path: "/dashboard/checklists/iso14001", icon: FileText, access: "ALL" },
          { title: "Certifications", path: "/dashboard/tb-certif", icon: Zap, access: "ALL" },
          { title: "Actifs & Assets", path: "/dashboard/equipment", icon: AlertTriangle, access: "ALL" },
          { title: "Plan de Continuité - PCA", path: "/dashboard/organization", icon: FileText, access: "ALL" },
          { title: "GED - Bibliothèque", path: "/dashboard/bibliotheque", icon: FileText, access: "ALL" },
          { title: "Archives", path: "/dashboard/archives", icon: FileText, access: "ALL" },
        ],
      },

      {
        id: "admin",
        label: "⚙️ CONFIGURATION",
        icon: Settings2,
        items: [
          { title: "Sites", path: "/dashboard/sites", icon: Zap, access: "ALL" },
          { title: "Types d'unités", path: "/dashboard/org-units-type", icon: Zap, access: "ALL" },
          { title: "Unités organiques", path: "/dashboard/org-units", icon: Zap, access: "ALL" },
          { title: "Types de processus", path: "/dashboard/processus-type", icon: Zap, access: "ALL" },
          { title: "Processus", path: "/dashboard/processus", icon: Zap, access: "ALL" },
          { title: "Collaborateurs", path: "/dashboard/users", icon: Users, access: "ADMIN" },
          { title: "Paramètres Nœud", path: "/dashboard/admin/setup", icon: Settings2, access: "ADMIN" },
          { title: "Menu Principal", path: "/dashboard/menu", icon: Settings2, access: "ADMIN" },
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
          { title: "Console", path: "/dashboard/superadmin/console", icon: FileText, access: "SUPERADMIN" },
          { title: "Sécurité", path: "/dashboard/superadmin/security", icon: FileText, access: "SUPERADMIN" },
          { title: "Clientéle", path: "/dashboard/superadmin/tenants", icon: FileText, access: "SUPERADMIN" },
          { title: "Transactions", path: "/dashboard/superadmin/transactions", icon: FileText, access: "SUPERADMIN" },
          { title: "Provisioning", path: "/admin/provisioning", icon: Database, access: "SUPERADMIN" },
        ],
      });
    }
    return groups;
  }, [isSuperAdmin, isPilote, assignedProcessId, isImpersonated]);

  return (
    <aside className={`w-80 h-screen flex flex-col fixed left-0 top-0 z-40 border-r transition-all duration-300 font-sans italic shadow-2xl
      ${isImpersonated ? "bg-[#1e1b1b] border-amber-900/50" : "bg-[#0F172A] border-white/5"}`}>
      
      {isImpersonated && (
        <div className="bg-amber-600 px-4 py-2 flex items-center justify-between animate-pulse shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-white" />
            <span className="text-[10px] font-black uppercase text-white tracking-widest leading-none">Contrôle Souverain</span>
          </div>
          <button onClick={exitImpersonation} className="text-white hover:scale-110 transition-transform"><XCircle size={16} /></button>
        </div>
      )}

      <div className={`p-8 shrink-0 border-b border-white/5 ${isImpersonated ? "bg-[#282525]" : "bg-[#111A2E]"}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-white/10 shadow-lg">
             <Image src="/assets/QsLogo.svg" alt="Qualisoft" width={32} height={32} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-white">QUALI<span className="text-blue-500">SOFT</span></h1>
            <p className={`text-[8px] font-black uppercase tracking-[0.3em] mt-1 ${isImpersonated ? "text-amber-500" : "text-slate-500"}`}>
              {isSuperAdmin ? "Sovereign Node" : "Elite System"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-6 py-8 space-y-4 custom-scrollbar">
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter(hasAccess);
          if (visibleItems.length === 0) return null;
          const isExpanded = expandedGroups.includes(group.id);

          return (
            <div key={group.id} className="space-y-2">
              <button
                onClick={() => setExpandedGroups(p => p.includes(group.id) ? p.filter(g => g !== group.id) : [...p, group.id])}
                className="w-full flex items-center justify-between py-2 rounded-xl group text-left"
              >
                <div className="flex items-center gap-3">
                  <group.icon size={16} className={isExpanded ? "text-blue-500" : "text-slate-600 group-hover:text-slate-400"} />
                  <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isExpanded ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`}>{group.label}</span>
                </div>
                <ChevronDown size={12} className={`text-slate-600 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>

              {isExpanded && (
                <div className="pl-3 space-y-1 border-l border-white/5 ml-2">
                  {visibleItems.map((item, idx) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link key={idx} href={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                        ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-500 hover:text-white hover:bg-white/5"}`}>
                        <item.icon size={14} className={isActive ? "text-white" : "text-slate-600"} />
                        <span className="text-[10px] font-bold uppercase tracking-wide">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className={`p-6 border-t border-white/5 ${isImpersonated ? "bg-[#181616]" : "bg-[#0B1222]"}`}>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-lg
              ${isSuperAdmin ? "bg-amber-600 text-white" : "bg-blue-600 text-white"}`}>
              {user?.U_FirstName?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-black truncate text-white uppercase italic leading-none mb-1">{user?.U_FirstName} {user?.U_LastName}</p>
              <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{user?.U_Role}</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/auth/login" })} className="p-2 text-slate-600 hover:text-red-400 transition-colors hover:bg-red-500/10 rounded-lg">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}