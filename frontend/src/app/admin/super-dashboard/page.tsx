/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useMemo } from "react";
import { 
  useAuthStore 
} from '@/store/authStore';
import { 
  Search, Info, ChevronRight, LayoutGrid, Target, LineChart, 
  Presentation, Users2, Map as MapIcon, GitBranch, Workflow, 
  Activity, Users, Award, GraduationCap, UserCircle, ClipboardCheck, 
  AlertTriangle, AlertOctagon, Truck, Contact, FolderOpen, BookOpen, 
  FileSearch, Users as UsersIcon, Settings2, Crown, Terminal, Database,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// --- TYPES REPRIS DE LA SIDEBAR ---
interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  access: string;
  description: string;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: MenuItem[];
}

export default function DashboardMenuHub() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.U_Role === "SUPERADMIN"; // À adapter selon ton store
  const [search, setSearch] = useState("");

  const userRole = useMemo(() => user?.U_Role?.toUpperCase() || "", [user]);

  // --- LOGIQUE D'ACCÈS IDENTIQUE À LA SIDEBAR ---
  const roles = useMemo(() => ({
    isDirection: ["DIRECTEUR", "DG", "PRESIDENT", "DIRECTEUR_GENERAL", "RQ"].includes(userRole) || isSuperAdmin,
    isQSE: ["RQ", "RESPONSABLE_QUALITE", "QSE", "AUDITEUR"].includes(userRole) || isSuperAdmin,
    isRH: ["RH", "DRH", "RESPONSABLE_RH"].includes(userRole) || isSuperAdmin,
    isManager: ["MANAGER", "CHEF_EQUIPE", "RESPONSABLE"].includes(userRole) || isSuperAdmin,
    isAdmin: ["ADMIN", "ADMINISTRATEUR"].includes(userRole) || isSuperAdmin,
  }), [userRole, isSuperAdmin]);

  const hasAccess = (item: any): boolean => {
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

  // --- LES GROUPES DE FONCTIONS (Mapping exact de la sidebar) ---
  const menuGroups: MenuGroup[] = [
    {
      id: "pilotage", label: "Pilotage & Direction", icon: LayoutGrid,
      items: [
        { title: "Cockpit SMI", path: "/dashboard", icon: LayoutGrid, access: "ALL", description: "Vue synthétique des indicateurs critiques" },
        { title: "Objectifs & Kpis", path: "/dashboard/objectifs", icon: LineChart, access: "ALL", description: "Indicateurs de performance (§9.1)" },
        { title: "Revues Direction", path: "/dashboard/management-review", icon: Presentation, access: "DIRECTION", description: "Comptes-rendus (§9.3)" },
        { title: "Instances COPIL", path: "/dashboard/gouvernance/copil", icon: Users2, access: "MANAGER", description: "Comités de pilotage" },
      ]
    },
    {
      id: "processus", label: "Processus & Flux", icon: GitBranch,
      items: [
        { title: "Cartographie", path: "/dashboard/direction", icon: MapIcon, access: "ALL", description: "Vision macro des processus" },
        { title: "Fiches Processus", path: "/dashboard/processus", icon: GitBranch, access: "ALL", description: "SWOT et fiches d'identité" },
        { title: "Workflows", path: "/dashboard/workflows", icon: Workflow, access: "MANAGER", description: "Gestion des circuits de validation" },
        { title: "Mesures", path: "/dashboard/indicators", icon: Activity, access: "ALL", description: "Saisie des données" },
      ]
    },
    {
        id: "organisation", label: "Organisation & RH", icon: Users,
        items: [
          { title: "Organigramme", path: "/dashboard/org-units", icon: LayoutGrid, access: "ALL", description: "Unités organiques" },
          { title: "Compétences", path: "/dashboard/rh", icon: Award, access: "RH", description: "Référentiels et matrices (§7.2)" },
          { title: "Formations", path: "/dashboard/formations", icon: GraduationCap, access: "RH", description: "Plan annuel de formation" },
          { title: "Population", path: "/dashboard/collaborateurs", icon: UserCircle, access: "RH", description: "Dossiers collaborateurs" },
        ]
    },
    {
        id: "conformite", label: "Audits & Amélioration", icon: ClipboardCheck,
        items: [
          { title: "Audits Internes", path: "/dashboard/audits", icon: ClipboardCheck, access: "QSE", description: "Programme d'audits (§9.2)" },
          { title: "Non-Conformités", path: "/dashboard/non-conformites", icon: AlertTriangle, access: "ALL", description: "Gestion des écarts" },
          { title: "Risques", path: "/dashboard/risks", icon: AlertOctagon, access: "MANAGER", description: "Analyse des risques (§6.1)" },
          { title: "Actions (PAQ)", path: "/dashboard/improvement", icon: Target, access: "ALL", description: "Plan d'Amélioration Qualité" },
        ]
    },
    {
        id: "tiers", label: "Tiers & Relations", icon: Truck,
        items: [
          { title: "Fournisseurs", path: "/dashboard/tiers", icon: Truck, access: "ALL", description: "Évaluation et suivi (§8.4)" },
          { title: "Réclamations", path: "/dashboard/reclamations", icon: Contact, access: "ALL", description: "Satisfaction client (§9.1.2)" },
        ]
    },
    {
        id: "documents", label: "GED & Traçabilité", icon: FolderOpen,
        items: [
          { title: "GED Qualité", path: "/dashboard/ged", icon: FolderOpen, access: "ALL", description: "Maîtrise documentaire (§7.5)" },
          { title: "Bibliothèque", path: "/dashboard/bibliotheque", icon: BookOpen, access: "ALL", description: "Normes et référentiels" },
          { title: "Archives", path: "/dashboard/archives", icon: FileSearch, access: "QSE", description: "Traçabilité historique" },
        ]
    }
  ];

  if (isSuperAdmin) {
    menuGroups.push({
      id: "superadmin", label: "Console Souveraine", icon: Crown,
      items: [
        { title: "Master Console", path: "/dashboard/superadmin/console", icon: Terminal, access: "SUPERADMIN", description: "Monitoring infrastructure" },
        { title: "Tenants Matrix", path: "/dashboard/superadmin/tenants", icon: Database, access: "SUPERADMIN", description: "Gestion Multi-Tenant" },
      ]
    });
  }

  // Filtrage par recherche
  const filteredGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      hasAccess(item) && 
      (item.title.toLowerCase().includes(search.toLowerCase()) || 
       item.description.toLowerCase().includes(search.toLowerCase()))
    )
  })).filter(group => group.items.length > 0);

  return (
    <main className="min-h-screen bg-[#0B0F1A] ml-72 p-10 font-sans italic relative overflow-hidden">
      
      {/* EFFETS DE FOND */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-blue-600/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-75 h-75 bg-indigo-600/5 blur-[100px] rounded-full -z-10" />

      {/* HEADER HUB */}
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <LayoutGrid className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white leading-none">
              Centre de <span className="text-blue-600">Commandement</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500 mt-2">
              Explorateur de fonctions Qualisoft SMI • ISO 9001:2015
            </p>
          </div>
        </div>

        {/* RECHERCHE */}
        <div className="mt-8 relative max-w-2xl group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Rechercher une fonction, un processus, un module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0F172A] border border-white/10 rounded-4xl py-6 pl-16 pr-8 text-sm font-black uppercase italic text-white outline-none focus:border-blue-500/50 transition-all shadow-2xl"
          />
        </div>
      </header>

      {/* GRID DES GROUPES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {filteredGroups.map((group) => (
          <div key={group.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 px-2">
              <group.icon size={18} className="text-blue-500" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
                {group.label}
              </h2>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            <div className="grid gap-3">
              {group.items.map((item, idx) => (
                <Link 
                  key={idx}
                  href={item.path}
                  className="group bg-[#0F172A]/60 border border-white/5 p-5 rounded-3xl hover:bg-blue-600 hover:border-blue-400 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <item.icon size={18} className="text-blue-400 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase italic text-white leading-none">
                          {item.title}
                        </h3>
                        <p className="text-[9px] font-bold uppercase text-slate-500 mt-2 leading-relaxed group-hover:text-white/70 max-w-50">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" size={16} />
                  </div>
                  
                  {/* EFFET DE HOVER BACKGROUND */}
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER HUB */}
      <footer className="fixed bottom-0 left-72 right-0 p-8 bg-linear-to-t from-[#0B0F1A] to-transparent pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-end">
           <div className="bg-blue-600/10 border border-blue-600/20 backdrop-blur-xl rounded-2xl px-6 py-3 pointer-events-auto flex items-center gap-3">
             <Info size={14} className="text-blue-400" />
             <span className="text-[9px] font-black uppercase italic text-slate-400 tracking-widest">
               Accès restreint selon habilitation §7.2
             </span>
           </div>
        </div>
      </footer>
    </main>
  );
}