/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, FolderTree, TrendingUp, BarChart3, Target, 
  AlertOctagon, ShieldAlert, ClipboardCheck, Map, Network, 
  Users, LogOut, Crown, Building2, ChevronRight, Lock, Zap, Settings2, 
  FileBarChart, Terminal, Database, ShieldCheck, Sparkles,
  FileText, ClipboardList, CheckSquare, MessageSquare, Wrench, 
  Users2, Globe, Activity, HardHat, FileSearch
} from 'lucide-react';

const menuGroups = [
  {
    group: "Pilotage Stratégique",
    items: [
      { title: "Cockpit Direction", path: "/dashboard", icon: LayoutDashboard, access: "BASIC" },
      { title: "Revue de Direction", path: "/dashboard/management-review", icon: FileBarChart, access: "ELITE" },
      { title: "Revue de Processus", path: "/dashboard/process-review", icon: FileSearch, access: "ELITE" },
    ]
  },

  {
    group: "Gouvernance",
    items: [
      { title: "Compliance", path: "/dashboard/gouvernance/compliance", icon: LayoutDashboard, access: "BASIC" },
      { title: "Planning", path: "/dashboard/gouvernance/planning", icon: FileBarChart, access: "ELITE" },
      { title: "Sessions", path: "/dashboard/gouvernance/sessions", icon: FileSearch, access: "ELITE" },
    ]
  },

  {
    group: "Structure & Organisation",
    items: [
      { title: "Organisation", path: "/dashboard/management-review", icon: Network, access: "BASIC" },
      { title: "Unités", path: "/dashboard/org-units", icon: Network, access: "BASIC" },
      { title: "Cartographie Processus", path: "/dashboard/processus", icon: FolderTree, access: "BASIC" },
      { title: "Sites & Filiales", path: "/dashboard/sites", icon: Map, access: "BASIC" },
      { title: "Tiers & Parties Int.", path: "/dashboard/tiers", icon: Globe, access: "BASIC" },
    ]
  },
  {
    group: "Performance & Risques",
    items: [
      { title: "Indicateurs & KPI", path: "/dashboard/indicators", icon: BarChart3, access: "BASIC" },
      { title: "Risques & Opportunités", path: "/dashboard/risks", icon: TrendingUp, access: "BASIC" },
      { title: "Plan d'Actions (PAQ)", path: "/dashboard/paq", icon: ClipboardList, access: "BASIC" },
      { title: "Gestion des Actions", path: "/dashboard/actions", icon: CheckSquare, access: "BASIC" },
    ]
  },
  {
    group: "Système de Management (SMI)",
    items: [
      { title: "GED (Documentation)", path: "/dashboard/ged", icon: FileText, access: "BASIC" },
      { title: "Audits Internes", path: "/dashboard/audits", icon: ClipboardCheck, access: "ELITE" },
      { title: "Non Conformités", path: "/dashboard/non-conformites", icon: AlertOctagon, access: "BASIC" },
      { title: "Réclamations", path: "/dashboard/reclamations", icon: MessageSquare, access: "BASIC" },
    ]
  },
  {
    group: "Supports & Métiers",
    items: [
      { title: "Ressources Humaines", path: "/dashboard/rh/matrice", icon: Users2, access: "BASIC" },
      { title: "Santé Sécurité (SSE)", path: "/dashboard/sse", icon: HardHat, access: "BASIC" },
      { title: "Équipements & Maint.", path: "/dashboard/equipements", icon: Wrench, access: "BASIC" },
    ]
  },
  {
    group: "Administration",
    items: [
      { title: "Gestion Équipe", path: "/dashboard/users", icon: Users, access: "ADMIN_ONLY" },
      { title: "Paramètres Système", path: "/dashboard/settings", icon: Settings2, access: "ADMIN_ONLY" },
    ]
  },
  {
    group: "Qualisoft Propriétaire",
    items: [
      { title: "Console SuperAdmin", path: "/dashboard/superadmin/console", icon: Terminal, access: "OWNER_ONLY" },
      { title: "Gestion Tenants", path: "/dashboard/superadmin/tenants", icon: Database, access: "OWNER_ONLY" },
      { title: "Sécurité Master", path: "/dashboard/superadmin/security", icon: ShieldCheck, access: "OWNER_ONLY" },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch (e) { console.error("Err session"); }
    }
    setIsDemo(localStorage.getItem('demoMode') === 'true');
  }, []);

  const getStatus = (accessType: string) => {
    if (!user) return { locked: true, hidden: false };
    const isAdmin = user.U_Role === 'ADMIN';
    const isOwner = user.U_Role === 'SUPERADMIN' || user.U_Email?.includes('@qualisoft.sn');
    const isElite = user.U_Tenant?.T_Plan === 'ENTREPRISE';

    if (accessType === 'OWNER_ONLY') return { locked: !isOwner, hidden: false };
    if (accessType === 'ELITE') return { locked: !(isAdmin && isElite), hidden: false };
    if (accessType === 'ADMIN_ONLY') return { locked: !isAdmin, hidden: false };
    return { locked: false, hidden: false };
  };

  const toggleDemoMode = () => {
    const newMode = !isDemo;
    localStorage.setItem('demoMode', newMode.toString());
    setIsDemo(newMode);
    window.location.reload();
  };
  function handleLogout(event: React.MouseEvent<HTMLButtonElement>): void {
    // Ton code de déconnexion ici
    console.log("Déconnexion demandée");
    // Exemple : throw new Error('Function not implemented.'); 
  }
  return (
    <aside className="w-72 h-screen bg-[#0F172A] text-white flex flex-col fixed left-0 top-0 z-40 border-r border-white/5 shadow-2xl italic">
      
      {/* HEADER */}
      <div className="p-6 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center border border-white/10 shadow-lg shadow-blue-600/20">
              <span className="font-black text-xl text-white">Q</span>
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tighter leading-none text-white">Qualisoft</h1>
              <p className="text-[8px] text-blue-400 font-bold uppercase tracking-[0.2em] mt-1 italic">SMI Expert RD</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
          <Building2 size={14} className="text-blue-500" />
          <p className="text-[9px] font-black truncate uppercase text-slate-200 tracking-widest italic">
            {user?.U_Tenant?.T_Name || "Instance Active"}
          </p>
        </div>
      </div>

      {/* NAVIGATION : LISTE COMPLÈTE DES 21+ FONCTIONNALITÉS */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-7 scrollbar-hide pb-20">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="px-4 text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
              {group.group}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.path;
                const { locked } = getStatus(item.access);
                return (
                  <Link
                    key={item.path}
                    href={locked ? "#" : item.path}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 group ${
                      active 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-1' 
                        : locked 
                          ? 'opacity-20 cursor-not-allowed' 
                          : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className={`${active ? 'text-white' : locked ? 'text-slate-700' : 'group-hover:text-blue-400'}`} />
                      <span className="text-[10px] font-black uppercase tracking-tight">{item.title}</span>
                    </div>
                    {locked && <Lock size={10} className="text-slate-700" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* DÉMO EXPRESS */}
        <div className="pt-4">
          <button 
            onClick={toggleDemoMode}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
              isDemo ? 'bg-amber-500 text-white border-amber-400 shadow-amber-500/20' : 'bg-blue-600/5 text-blue-400 border-blue-500/20 hover:bg-blue-600 hover:text-white'
            }`}
          >
            <Sparkles size={16} className={isDemo ? "animate-pulse" : ""} />
            <span className="text-[9px] font-black uppercase tracking-widest">{isDemo ? "Quitter Démo" : "Démo Express"}</span>
          </button>
        </div>
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-white/5 bg-[#0B1222] shrink-0">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0">
              {user?.U_FirstName?.[0]}{user?.U_LastName?.[0]}
            </div>
            <div className="overflow-hidden font-black uppercase">
              <p className="text-[10px] truncate text-slate-100 leading-none italic">{user?.U_FirstName} {user?.U_LastName}</p>
              <p className="text-[7px] text-blue-500 mt-1 tracking-widest">{user?.U_Role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors p-1"><LogOut size={16} /></button>
        </div>
      </div>
    </aside>
  );
}