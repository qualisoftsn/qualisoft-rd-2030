"use client";

import {
  AlertOctagon, BarChart3, Building2, CheckSquare, ClipboardCheck,
  ClipboardList, Crown, Database, FileBarChart, FileSearch,
  FileText, FolderTree, Globe, HardHat, LayoutDashboard,
  Lock, LogOut, Map, MessageSquare, Network, Settings2,
  ShieldCheck, Terminal, TrendingUp, Users, Users2, Wrench, Info
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

// --- INTERFACES DE STRUCTURE ---
interface Tenant {
  T_Name: string;
  T_Plan: string;
  T_SubscriptionStatus: "ACTIVE" | "TRIAL" | "EXPIRED";
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
  access: "BASIC" | "ELITE" | "ADMIN_ONLY" | "OWNER_ONLY";
  description: string; // 👈 Nouvelle propriété pour l'aide à la tâche
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
  const [hoveredItem, setHoveredItem] = useState<MenuItem | null>(null);
  const [mousePos, setMousePos] = useState({ y: 0 });

  // 1. DÉFINITION DES GROUPES AVEC INTELLIGENCE MÉTIER
  const menuGroups: MenuGroup[] = useMemo(() => [
    {
      group: "Pilotage Stratégique",
      items: [
        { title: "Cockpit Direction", path: "/dashboard", icon: LayoutDashboard, access: "BASIC", description: "Vue 360° des indicateurs de performance et de conformité globale." },
        { title: "Analyses", path: "/dashboard/stats", icon: Users2, access: "BASIC", description: "Outils statistiques avancés pour l'analyse des tendances SMI." },
        { title: "Revue de Direction", path: "/dashboard/management-review", icon: FileBarChart, access: "ELITE", description: "Planification et enregistrement des revues de direction ISO 9001." },
        { title: "Revue de Processus", path: "/dashboard/process-review", icon: FileSearch, access: "ELITE", description: "Évaluation périodique de l'efficacité de chaque processus métier." },
      ],
    },
    {
      group: "Gouvernance",
      items: [
        { title: "Compliance", path: "/dashboard/gouvernance/compliance", icon: ShieldCheck, access: "BASIC", description: "Suivi de la conformité réglementaire et normative (ISO/MASE)." },
        { title: "Planning", path: "/dashboard/gouvernance/planning", icon: ClipboardList, access: "ELITE", description: "Calendrier maître des audits, réunions et jalons stratégiques." },
        { title: "Sessions", path: "/dashboard/gouvernance/sessions", icon: MessageSquare, access: "ELITE", description: "Gestion des comptes-rendus et décisions des comités de pilotage." },
      ],
    },
    {
      group: "Structure & Organisation",
      items: [
        { title: "Unités", path: "/dashboard/org-units", icon: Network, access: "BASIC", description: "Gestion de l'organigramme et des unités organiques du tenant." },
        { title: "Cartographie Processus", path: "/dashboard/processus", icon: FolderTree, access: "BASIC", description: "Définition des interactions entre processus et fiches d'identité." },
        { title: "Sites & Filiales", path: "/dashboard/sites", icon: Map, access: "BASIC", description: "Administration multi-sites et déploiement géographique du SMI." },
        { title: "Tiers & Parties Int.", path: "/dashboard/tiers", icon: Globe, access: "BASIC", description: "Analyse des attentes et besoins des parties intéressées (§4.2)." },
      ],
    },
    {
      group: "Performance & Risques",
      items: [
        { title: "Indicateurs & KPI", path: "/dashboard/indicators", icon: BarChart3, access: "BASIC", description: "Saisie et suivi des indicateurs de performance processus." },
        { title: "Risques & Opportunités", path: "/dashboard/risks", icon: TrendingUp, access: "BASIC", description: "Évaluation et traitement des risques opérationnels et stratégiques." },
        { title: "Plan d'Actions (PAQ)", path: "/dashboard/paq", icon: ClipboardList, access: "BASIC", description: "Pilotage des plans d'actions qualité et projets d'amélioration." },
        { title: "Gestion des Actions", path: "/dashboard/actions", icon: CheckSquare, access: "BASIC", description: "Suivi opérationnel des actions correctives et préventives." },
      ],
    },
    {
      group: "Système de Management",
      items: [
        { title: "GED (Documentation)", path: "/dashboard/ged", icon: FileText, access: "BASIC", description: "Maîtrise des informations documentées et cycle de vie documentaire." },
        { title: "Audits Internes", path: "/dashboard/audits", icon: ClipboardCheck, access: "ELITE", description: "Programme annuel, plans d'audits et rapports de constat." },
        { title: "Non Conformités", path: "/dashboard/non-conformites", icon: AlertOctagon, access: "BASIC", description: "Enregistrement et traitement des écarts et dérogations." },
        { title: "Réclamations", path: "/dashboard/reclamations", icon: MessageSquare, access: "BASIC", description: "Gestion du feedback client et des actions de rétablissement." },
      ],
    },
    {
      group: "Supports & Métiers",
      items: [
        { title: "Ressources Humaines", path: "/dashboard/rh", icon: Users2, access: "BASIC", description: "Gestion administrative et suivi des effectifs de l'instance." },
        { title: "Ressources Humaines - Map", path: "/dashboard/rh/matrice", icon: Users2, access: "BASIC", description: "Matrice de polyvalence et pilotage des compétences (GPEC)." },
        { title: "Santé Sécurité (SSE)", path: "/dashboard/sse", icon: HardHat, access: "BASIC", description: "Analyse des accidents, causeries et conformité sécurité." },
        { title: "Équipements & Maint.", path: "/dashboard/equipements", icon: Wrench, access: "BASIC", description: "Registre des équipements et planification de la maintenance." },
      ],
    },
    {
      group: "Administration",
      items: [
        { title: "Gestion Équipe", path: "/dashboard/users", icon: Users, access: "ADMIN_ONLY", description: "Contrôle des accès, rôles et habilitations des utilisateurs." },
        { title: "Paramètres Système", path: "/dashboard/settings", icon: Settings2, access: "ADMIN_ONLY", description: "Configuration des préférences, logos et identité du tenant." },
      ],
    },
    {
      group: "Qualisoft Propriétaire",
      items: [
        { title: "Console SuperAdmin", path: "/dashboard/superadmin/console", icon: Terminal, access: "OWNER_ONLY", description: "Pilotage centralisé de l'infrastructure Qualisoft Elite." },
        { title: "Transactions", path: "/dashboard/superadmin/transactions", icon: Terminal, access: "OWNER_ONLY", description: "Vérification des flux financiers et preuves de paiement." },
        { title: "Gestion Tenants", path: "/dashboard/superadmin/tenants", icon: Database, access: "OWNER_ONLY", description: "Provisionnement et cycle de vie des instances clients." },
        { title: "Sécurité Master", path: "/dashboard/superadmin/security", icon: ShieldCheck, access: "OWNER_ONLY", description: "Audit trail global et surveillance des logs noyau." },
      ],
    },
  ], []);

  // 2. INITIALISATION
  useEffect(() => {
    const storageRaw = localStorage.getItem("qualisoft-auth-storage");
    if (storageRaw) {
      try {
        const parsed = JSON.parse(storageRaw);
        const userData = parsed.state?.user;
        if (userData) setUser(userData);
      } catch {
        console.error("Erreur de parsing session");
      }
    }
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // 3. LOGIQUE MASTER
  const isMaster = useMemo(() => {
    const role = user?.U_Role?.toUpperCase();
    return role === "SUPER_ADMIN" || user?.U_Email === "ab.thiongane@qualisoft.sn";
  }, [user]);

  // 4. CALCUL DES VERROUS
  const getStatus = (accessType: string) => {
    if (isMaster) return { locked: false };
    if (!user) return { locked: true };
    const tenant = user.U_Tenant;
    const isTrial = tenant?.T_SubscriptionStatus === "TRIAL";
    const endDate = tenant?.T_SubscriptionEndDate ? new Date(tenant.T_SubscriptionEndDate) : null;
    const isTrialActive = isTrial && endDate && new Date() <= endDate;
    if (isTrialActive) return { locked: false };
    const isAdmin = user.U_Role === "ADMIN";
    const isElitePlan = tenant?.T_Plan === "ELITE" || tenant?.T_Plan === "ENTREPRISE";
    if (accessType === "OWNER_ONLY") return { locked: true };
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
    <>
      <aside className="w-72 h-screen bg-[#0F172A] text-white flex flex-col fixed left-0 top-0 z-40 border-r border-white/5 shadow-2xl italic font-sans overflow-hidden">
        {/* BRANDING */}
        <div className="p-8 shrink-0">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border border-white/10 shadow-lg ${isMaster ? "bg-amber-500 shadow-amber-500/20" : "bg-blue-600 shadow-blue-600/20"}`}>
                <span className="font-black text-2xl text-white">{isMaster ? "M" : "Q"}</span>
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
              {isMaster ? "CONTRÔLEUR MASTER" : user?.U_TenantName || "Instance Active"}
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-6 py-2 space-y-8 custom-scrollbar pb-24">
          {menuGroups.map((group, idx) => {
            if (group.group === "Qualisoft Propriétaire" && !isMaster) return null;
            return (
              <div key={idx} className="space-y-3">
                <h3 className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
                  <span className={`w-1 h-1 rounded-full ${isMaster ? "bg-amber-500" : "bg-blue-600"}`} />
                  {group.group}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = pathname === item.path;
                    const { locked } = getStatus(item.access);

                    return (
                      <Link
                        key={item.path}
                        href={locked ? "#" : item.path}
                        onMouseEnter={(e) => {
                          if (!locked) {
                            setHoveredItem(item);
                            setMousePos({ y: e.currentTarget.getBoundingClientRect().top });
                          }
                        }}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                          active
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-2"
                            : locked
                              ? "opacity-20 cursor-not-allowed pointer-events-none"
                              : "text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-2"
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

        {/* FOOTER USER CARD */}
        <div className="p-6 border-t border-white/5 bg-[#0B1222] shrink-0">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black text-white shrink-0 shadow-lg ${isMaster ? "bg-amber-500" : "bg-blue-600"}`}>
                {isMaster ? "AT" : user?.U_FirstName?.[0] || "U"}
              </div>
              <div className="overflow-hidden font-black uppercase italic leading-tight">
                <p className="text-[10px] truncate text-slate-100">{user?.U_FirstName} {user?.U_LastName}</p>
                <p className={`text-[7px] mt-1 tracking-widest ${isMaster ? "text-amber-500" : "text-blue-500"}`}>{isMaster ? "SUPER_ADMIN" : user?.U_Role || "USER"}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-all p-2 hover:bg-red-500/10 rounded-xl active:scale-90">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* TOOLTIP D'INTELLIGENCE MÉTIER */}
      {hoveredItem && (
        <div 
          style={{ top: mousePos.y }}
          className="fixed left-72 ml-4 w-64 bg-[#0F172A] border border-blue-600/30 p-5 rounded-3xl shadow-2xl z-[100] animate-in fade-in slide-in-from-left-2 duration-300 pointer-events-none backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-3 border-b border-white/5 pb-2">
            <Info size={12} className="text-blue-500" />
            <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 italic">Task Intelligence</p>
          </div>
          <p className="text-[10px] text-slate-200 leading-relaxed font-bold uppercase italic tracking-tight">
            {hoveredItem.description}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-blue-500" />
            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Qualisoft Elite RD 2030</p>
          </div>
        </div>
      )}
    </>
  );
}