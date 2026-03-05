/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🔱 MODULE : NAVIGATION STRATÉGIQUE (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Navigation ClickUp-Style / RBAC Matrix.
 * RÉVISION : 06 Mars 2026 | 00:05 GMT
 */

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity, AlertTriangle, Archive, BarChart3, ChevronDown, 
  ClipboardCheck, Database, FileCheck2, FileText, 
  FolderLock, GitBranch, HardHat, LayoutDashboard, Leaf, 
  LogOut, Network, Scale, Settings2, ShieldAlert, 
  ShieldCheck, Target, Terminal, Users, 
  BookOpen, Fingerprint, Microscope,
  CreditCard, Layout, FileSearch, Zap} from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { Role } from '@/types/elite-sde';
import { cn } from "@/core/utils/cn";

export default function Sidebar({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore() as any;
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["pilotage", "master"]);

  const navigation = useMemo(() => [
    {
      id: "pilotage",
      label: "I. Stratégie & Pilotage",
      icon: Activity,
      items: [
        { title: "Cockpit Exécutif", path: "/dashboard", icon: LayoutDashboard, access: ["ALL"] },
        { title: "Revue de Direction", path: "/dashboard/revue-direction", icon: FileSearch, access: [Role.ADMIN, Role.RQ, Role.DIRECTION] },
        { title: "Objectifs & Cibles", path: "/dashboard/objectifs", icon: Target, access: ["ALL"] },
        { title: "Indicateurs KPI", path: "/dashboard/indicators", icon: BarChart3, access: [Role.ADMIN, Role.RQ] },
      ]
    },
    {
      id: "documentaire",
      label: "II. Maîtrise Documentaire",
      icon: FolderLock,
      items: [
        { title: "GED Bibliothèque", path: "/dashboard/ged", icon: FileText, access: ["ALL"] },
        { title: "Approbations Flux", path: "/dashboard/workflows", icon: GitBranch, access: [Role.ADMIN, Role.RQ], badge: "3" },
        { title: "Archives SMI", path: "/dashboard/archives", icon: Archive, access: [Role.ADMIN, Role.RQ] },
        { title: "Veille Réglementaire", path: "/dashboard/veilles", icon: Scale, access: ["ALL"] },
      ]
    },
    {
      id: "processus",
      label: "III. Performance",
      icon: GitBranch,
      items: [
        { title: "Cartographie Master", path: "/dashboard/processus", icon: Network, access: [Role.ADMIN, Role.RQ] },
        { title: "Analyse des Risques", path: "/dashboard/risks", icon: AlertTriangle, access: ["ALL"] },
        { title: "Fiches Processus", path: "/dashboard/process-sheets", icon: BookOpen, access: ["ALL"] },
      ]
    },
    {
      id: "audit",
      label: "IV. Audit & CAPA",
      icon: ClipboardCheck,
      items: [
        { title: "Centre d'Audit", path: "/dashboard/audit-center", icon: FileCheck2, access: ["ALL"] },
        { title: "Non-Conformités", path: "/dashboard/non-conformites", icon: ShieldAlert, access: ["ALL"], badge: "NEW" },
        { title: "Registre Preuves", path: "/dashboard/evidences", icon: Microscope, access: [Role.ADMIN, Role.RQ] },
        { title: "Plan d'Actions", path: "/dashboard/actions", icon: Zap, access: ["ALL"] },
      ]
    },
    {
      id: "hseq",
      label: "V. Santé & Sécurité",
      icon: HardHat,
      items: [
        { title: "Hub HSE Global", path: "/dashboard/sse", icon: ShieldCheck, access: ["ALL"] },
        { title: "Incidents & AT/MP", path: "/dashboard/incidents", icon: AlertTriangle, access: ["ALL"] },
        { title: "Gestion Déchets", path: "/dashboard/waste", icon: Leaf, access: ["ALL"] },
      ]
    },
    {
      id: "admin",
      label: "VI. Configuration",
      icon: Settings2,
      items: [
        { title: "Organisation Sites", path: "/dashboard/organization", icon: Database, access: [Role.ADMIN] },
        { title: "Annuaire Agents", path: "/dashboard/users", icon: Users, access: [Role.ADMIN] },
        { title: "Registre Tiers", path: "/dashboard/tiers", icon: Users, access: [Role.ADMIN] },
      ]
    },
    {
      id: "master",
      label: "VII. Administration",
      icon: Fingerprint,
      items: [
        { title: "Matrix Control", path: "/dashboard/matrix", icon: Layout, access: [] },
        { title: "Flux Financiers", path: "/admin/payments", icon: CreditCard, access: [] },
        { title: "Sécurité & Logs", path: "/dashboard/matrix/logs", icon: Terminal, access: [] },
      ]
    }
  ], []);

  const filteredNav = useMemo(() => {
    return navigation.map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (isSuperAdmin) return true;
        if (group.id === "master") return false;
        if (item.access.includes("ALL")) return true;
        return item.access.includes(user?.U_Role as Role);
      })
    })).filter(g => g.items.length > 0);
  }, [navigation, user, isSuperAdmin]);

  const toggleGroup = (id: string) => setExpandedGroups(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <aside className={cn("w-[320px] h-screen fixed left-0 top-0 z-60 flex flex-col border-r-2 border-white/5 transition-all font-black uppercase italic bg-[#0B0F1A] shadow-4xl")}>
      
      {/* 🔱 BRANDING */}
      <div className="p-10 border-b-2 border-white/5 flex items-center gap-6 bg-[#151A2D] shrink-0">
        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center border-4 border-white/10 shadow-2xl shrink-0">
          <Image src="/images/qslogo.png" alt="QS" width={38} height={38} priority />
        </div>
        <div className="text-left leading-none">
          <h1 className="text-2xl font-black tracking-tighter text-white m-0 uppercase">QUALI<span className="text-blue-600">SOFT</span></h1>
          <p className="text-[10px] text-slate-500 tracking-[0.4em] mt-3 m-0">ELITE MATRIX OS</p>
        </div>
      </div>

      {/* 🧭 NAVIGATION (Internal Scroll Only) */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
        {filteredNav.map((group) => {
          const isExp = expandedGroups.includes(group.id);
          const GroupIcon = group.icon;
          return (
            <div key={group.id} className="space-y-4 text-left">
              <button onClick={() => toggleGroup(group.id)} className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-all border-none bg-transparent cursor-pointer group">
                <div className="flex items-center gap-5">
                  <div className={cn("p-2.5 rounded-lg transition-colors", isExp ? "bg-blue-600/20 text-blue-500" : "bg-white/5 text-slate-600")}>
                    <GroupIcon size={18} strokeWidth={3} />
                  </div>
                  <span className={cn("text-[11px] tracking-widest transition-colors", isExp ? "text-white" : "text-slate-600 group-hover:text-slate-300")}>{group.label}</span>
                </div>
                <ChevronDown size={14} className={cn("text-slate-700 transition-transform", isExp && "rotate-180 text-blue-500")} />
              </button>

              {isExp && (
                <div className="pl-6 ml-4 border-l-2 border-white/5 space-y-2 animate-in slide-in-from-top-2">
                  {group.items.map((item, idx) => {
                    const isActive = pathname === item.path;
                    const ItemIcon = item.icon;
                    return (
                      <Link key={idx} href={item.path} className={cn("flex items-center justify-between p-4 rounded-2xl transition-all group/link", isActive ? "bg-blue-600 text-white shadow-xl shadow-blue-900/30 translate-x-1" : "text-slate-500 hover:text-white hover:bg-white/5")}>
                        <div className="flex items-center gap-5">
                          <ItemIcon size={16} className={cn(isActive ? "text-white" : "text-slate-700 group-hover/link:text-blue-500")} />
                          <span className="text-[10px] tracking-widest">{item.title}</span>
                        </div>
                        {item.badge && <span className="bg-amber-500 text-black text-[7px] font-black px-2 py-0.5 rounded-md animate-pulse">{item.badge}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 👤 ATOMIC PROFIL BOX */}
      <div className="p-10 bg-[#151A2D] border-t-2 border-white/5 shrink-0">
         <div className="p-6 bg-black/40 border border-white/5 rounded-[2.5rem] flex items-center justify-between group shadow-inner">
            <div className="flex items-center gap-5 min-w-0">
               <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black border-2 border-white/10 shrink-0 shadow-lg", isSuperAdmin ? "bg-amber-600" : "bg-blue-600")}>
                 {user?.U_FirstName?.[0]}
               </div>
               <div className="text-left min-w-0">
                  <p className="text-[12px] font-black text-white m-0 truncate leading-none mb-2">{user?.U_FirstName} {user?.U_LastName}</p>
                  <p className="text-[9px] text-slate-600 tracking-widest m-0 truncate italic uppercase leading-none">{isSuperAdmin ? "MASTER" : user?.U_Role}</p>
               </div>
            </div>
            <button onClick={() => { logout(); }} className="text-slate-700 hover:text-rose-500 transition-colors border-none bg-transparent cursor-pointer"><LogOut size={20}/></button>
         </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </aside>
  );
}