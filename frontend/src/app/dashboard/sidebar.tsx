"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertOctagon, BarChart3, Building2, CheckSquare, ClipboardCheck, ClipboardList,
  Crown, Database, FileBarChart, FileSearch, FileText, FolderTree, Globe,
  HardHat, LayoutDashboard, Lock, LogOut, Map, MessageSquare, Network,
  Settings2, ShieldCheck, Terminal, TrendingUp, Users, Users2, Wrench,
} from "lucide-react";

// --- INTERFACES ---
interface Tenant {
  T_Name: string;
  T_Plan: string;
  T_SubscriptionStatus: 'ACTIVE' | 'TRIAL' | 'EXPIRED';
  T_SubscriptionEndDate?: string;
}

interface UserProfile {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email: string;
  U_Role: string;
  U_TenantName?: string;
  U_Tenant?: Tenant;
}

interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
  access: 'BASIC' | 'ELITE' | 'ADMIN_ONLY' | 'OWNER_ONLY';
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // 1. DÉFINITION DES GROUPES
  const menuGroups: MenuGroup[] = [
    {
      group: "Pilotage Stratégique",
      items: [
        { title: "Cockpit Direction", path: "/dashboard", icon: LayoutDashboard, access: "BASIC" },
        { title: "Revue de Direction", path: "/dashboard/management-review", icon: FileBarChart, access: "ELITE" },
        { title: "Revue de Processus", path: "/dashboard/process-review", icon: FileSearch, access: "ELITE" },
      ],
    },
    {
      group: "Gouvernance",
      items: [
        { title: "Compliance", path: "/dashboard/gouvernance/compliance", icon: ShieldCheck, access: "BASIC" },
        { title: "Planning", path: "/dashboard/gouvernance/planning", icon: ClipboardList, access: "ELITE" },
        { title: "Sessions", path: "/dashboard/gouvernance/sessions", icon: MessageSquare, access: "ELITE" },
      ],
    },
    {
      group: "Structure & Organisation",
      items: [
        { title: "Unités", path: "/dashboard/org-units", icon: Network, access: "BASIC" },
        { title: "Cartographie Processus", path: "/dashboard/processus", icon: FolderTree, access: "BASIC" },
        { title: "Sites & Filiales", path: "/dashboard/sites", icon: Map, access: "BASIC" },
        { title: "Tiers & Parties Int.", path: "/dashboard/tiers", icon: Globe, access: "BASIC" },
      ],
    },
    {
      group: "Performance & Risques",
      items: [
        { title: "Indicateurs & KPI", path: "/dashboard/indicators", icon: BarChart3, access: "BASIC" },
        { title: "Risques & Opportunités", path: "/dashboard/risks", icon: TrendingUp, access: "BASIC" },
        { title: "Plan d'Actions (PAQ)", path: "/dashboard/paq", icon: ClipboardList, access: "BASIC" },
        { title: "Gestion des Actions", path: "/dashboard/actions", icon: CheckSquare, access: "BASIC" },
      ],
    },
    {
      group: "Système de Management",
      items: [
        { title: "GED (Documentation)", path: "/dashboard/ged", icon: FileText, access: "BASIC" },
        { title: "Audits Internes", path: "/dashboard/audits", icon: ClipboardCheck, access: "ELITE" },
        { title: "Non Conformités", path: "/dashboard/non-conformites", icon: AlertOctagon, access: "BASIC" },
        { title: "Réclamations", path: "/dashboard/reclamations", icon: MessageSquare, access: "BASIC" },
      ],
    },
    {
      group: "Supports & Métiers",
      items: [
        { title: "Ressources Humaines", path: "/dashboard/rh/matrice", icon: Users2, access: "BASIC" },
        { title: "Santé Sécurité (SSE)", path: "/dashboard/sse", icon: HardHat, access: "BASIC" },
        { title: "Équipements & Maint.", path: "/dashboard/equipements", icon: Wrench, access: "BASIC" },
      ],
    },
    {
      group: "Administration",
      items: [
        { title: "Gestion Équipe", path: "/dashboard/users", icon: Users, access: "ADMIN_ONLY" },
        { title: "Paramètres Système", path: "/dashboard/settings", icon: Settings2, access: "ADMIN_ONLY" },
      ],
    },
    {
      group: "Qualisoft Propriétaire",
      items: [
        { title: "Console SuperAdmin", path: "/dashboard/superadmin/console", icon: Terminal, access: "OWNER_ONLY" },
        { title: "Gestion Tenants", path: "/dashboard/superadmin/tenants", icon: Database, access: "OWNER_ONLY" },
        { title: "Sécurité Master", path: "/dashboard/superadmin/security", icon: ShieldCheck, access: "OWNER_ONLY" },
      ],
    },
  ];

  // 2. EFFET DE CHARGEMENT ASYNCHRONE
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      } catch {
        console.error("Session Error");
      }
    }
    
    // ⚡ FIX : On retarde légèrement le montage pour éviter le "cascading render"
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const isMaster = useMemo(() => {
    const role = user?.U_Role?.toUpperCase();
    return role === 'SUPER_ADMIN' || role === 'SUPERADMIN' || user?.U_Email === 'ab.thiongane@qualisoft.sn';
  }, [user]);

  const getStatus = (accessType: string) => {
    if (isMaster) return { locked: false };
    if (!user) return { locked: true };

    const tenant = user.U_Tenant;
    const role = user.U_Role?.toUpperCase();
    const isTrial = tenant?.T_SubscriptionStatus === 'TRIAL';
    const endDate = tenant?.T_SubscriptionEndDate ? new Date(tenant.T_SubscriptionEndDate) : null;
    const isTrialActive = isTrial && endDate && new Date() <= endDate;

    if (isTrialActive) return { locked: false };

    const isAdmin = role === "ADMIN" || isMaster;
    const isElitePlan = tenant?.T_Plan === "ELITE" || tenant?.T_Plan === "ENTREPRISE" || tenant?.T_Plan === "GROUPE";

    if (accessType === "OWNER_ONLY") return { locked: !isMaster }; 
    if (accessType === "ELITE") return { locked: !isElitePlan };
    if (accessType === "ADMIN_ONLY") return { locked: !isAdmin };

    return { locked: false };
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  if (!isMounted) return <aside className="w-72 h-screen bg-[#0F172A]" />;

  return (
    <aside className="w-72 h-screen bg-[#0F172A] text-white flex flex-col fixed left-0 top-0 z-40 border-r border-white/5 shadow-2xl italic font-sans">
      
      <div className="p-8 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border border-white/10 shadow-lg ${isMaster ? "bg-amber-500" : "bg-blue-600"}`}>
              <span className="font-black text-2xl text-white italic">{isMaster ? "M" : "Q"}</span>
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter leading-none text-white italic">Qualisoft</h1>
              <p className={`text-[8px] font-bold uppercase tracking-[0.3em] mt-1 italic ${isMaster ? "text-amber-500" : "text-blue-400"}`}>
                {isMaster ? "SUPER_ADMIN" : "SMI EXPERT RD"}
              </p>
            </div>
          </div>
          {isMaster && <Crown size={16} className="text-amber-500 animate-pulse" />}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-inner">
          <Building2 size={14} className={isMaster ? "text-amber-500" : "text-blue-500"} />
          <p className="text-[10px] font-black truncate uppercase text-slate-200 tracking-widest italic leading-none">
            {isMaster ? "AUTORITÉ SUPRÊME" : (user?.U_TenantName || "Instance Active")}
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-6 py-2 space-y-8 custom-scrollbar pb-24">
        {menuGroups.map((group: MenuGroup, idx: number) => {
          if (group.group === "Qualisoft Propriétaire" && !isMaster) return null;

          return (
            <div key={idx} className="space-y-3">
              <h3 className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
                <span className={`w-1 h-1 rounded-full ${isMaster ? "bg-amber-500" : "bg-blue-600"}`} />
                {group.group}
              </h3>
              <div className="space-y-1">
                {group.items.map((item: MenuItem) => {
                  const active = pathname === item.path;
                  const { locked } = getStatus(item.access);
                  
                  return (
                    <Link
                      key={item.path}
                      href={locked ? "#" : item.path}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                        active ? "bg-blue-600 text-white shadow-lg translate-x-2" : 
                        locked ? "opacity-20 cursor-not-allowed pointer-events-none" : 
                        "text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-2"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={16} className={`${active ? "text-white" : locked ? "text-slate-800" : "group-hover:text-blue-400"}`} />
                        <span className="text-[10px] font-black uppercase tracking-tight italic">{item.title}</span>
                      </div>
                      {locked && <Lock size={10} className="text-slate-800" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 bg-[#0B1222] shrink-0">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black text-white shrink-0 ${isMaster ? "bg-amber-500" : "bg-blue-600"}`}>
              {isMaster ? "AT" : (user?.U_FirstName?.[0] || "U")}
            </div>
            <div className="overflow-hidden font-black uppercase italic leading-tight">
              <p className="text-[10px] truncate text-slate-100">{user?.U_FirstName} {user?.U_LastName}</p>
              <p className={`text-[7px] mt-1 tracking-widest ${isMaster ? "text-amber-500" : "text-blue-500"}`}>
                {isMaster ? "SUPER_ADMIN" : (user?.U_Role || "USER")}
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-all p-2 rounded-xl active:scale-90">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}