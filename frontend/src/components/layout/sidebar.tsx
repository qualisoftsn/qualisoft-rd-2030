/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🔱 MODULE : SIDEBAR SOUVERAINE (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Navigation pilotée par le Registre de Vérité ISO & Grade User.
 * DESIGN : Design Elite préservé, largeur w-[300px] pour occupation stricte.
 * SÉCURITÉ : Isolation Kernel (Zustand) - Zéro NextAuth.
 * RÉVISION : 09 Mars 2026 | 17:05 GMT
 * -------------------------------------------------------------------------
 */

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { cn } from "@/core/utils/cn";
import { MASTER_NAV } from "@/core/config/navigation";
import { useAuthStore } from "@/store/authStore";
import { 
  ChevronDown, LogOut, ShieldCheck, 
  Settings2
} from "lucide-react";

interface SidebarProps {
  isSuperAdmin: boolean;
}

export default function Sidebar({ isSuperAdmin }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore() as any;
  
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["strategie", "amelioration", "workspace"]);

  const handleLogout = () => { 
    logout(); 
    router.push("/auth/login"); 
  };

  const toggleGroup = (id: string) => 
    setExpandedGroups(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const renderIcon = useCallback((iconName: string, active: boolean) => {
    const Icon = (Icons as any)[iconName] || Icons.HelpCircle;
    return <Icon size={18} strokeWidth={active ? 3 : 2} className={cn("transition-all", active ? "text-white" : "text-slate-600 group-hover:text-blue-500")} />;
  }, []);

  return (
    <div className="w-75 h-full flex flex-col font-sans italic overflow-hidden shadow-4xl select-none shrink-0 bg-[#0B0F1A]">
      
      {/* 🔱 BRANDING : IDENTITÉ SÉCURISÉE */}
      <div className="h-24 flex items-center gap-5 px-8 border-b border-white/5 bg-[#0F172A]/50 shrink-0">
        <div className="relative group">
          <div className="absolute -inset-1 bg-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-white/10 shadow-2xl shrink-0 overflow-hidden">
            <Image src="/images/qslogo.png" alt="Qualisoft" width={28} height={28} priority />
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-black tracking-tighter text-white m-0 leading-none uppercase">
            QUALI<span className="text-blue-600">SOFT</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[7px] text-slate-500 font-black uppercase tracking-[0.3em] m-0 italic">Elite Kernel v3.0.1</p>
          </div>
        </div>
      </div>

      {/* 🧭 ENGINE : MOTEUR DE NAVIGATION */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        
        {user?.U_Role === 'ADMIN' && (
           <div className="mb-8">
              <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mb-4 pl-2 italic">Administration Workspace</p>
              <Link href="/workspace/setup" className={cn(
                "flex items-center gap-4 p-4 rounded-2xl transition-all no-underline border border-transparent",
                pathname.includes('/workspace') ? "bg-emerald-600/10 border-emerald-500/20 text-emerald-400" : "text-slate-500 hover:bg-white/5"
              )}>
                <Settings2 size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Configuration SMI</span>
              </Link>
           </div>
        )}

        {MASTER_NAV.map((group) => {
          if (group.id === "matrix" && !isSuperAdmin) return null;
          const isExp = expandedGroups.includes(group.id);

          return (
            <div key={group.id} className="space-y-2">
              <button 
                onClick={() => toggleGroup(group.id)} 
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-all border-none bg-transparent cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg transition-all", isExp ? "bg-blue-600 text-white shadow-lg" : "bg-white/5 text-slate-700")}>
                    {renderIcon(group.items[0].icon, isExp)}
                  </div>
                  <div className="text-left leading-none">
                    <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isExp ? "text-white" : "text-slate-600 group-hover:text-blue-400")}>{group.label}</span>
                    <p className="text-[6px] font-black text-slate-800 mt-1.5 m-0 tracking-widest">{group.iso}</p>
                  </div>
                </div>
                <ChevronDown size={14} className={cn("text-slate-800 transition-transform duration-500", isExp && "rotate-180 text-blue-500")} />
              </button>

              {isExp && (
                <div className="pl-6 ml-4 border-l border-white/5 space-y-1 mt-2 animate-in slide-in-from-top-2 duration-300">
                  {group.items.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link 
                        key={item.path} 
                        href={item.path} 
                        className={cn(
                          "flex items-center gap-4 p-3.5 rounded-xl transition-all no-underline relative group/link", 
                          isActive ? "bg-blue-600/10 text-white shadow-sm translate-x-1" : "text-slate-500 hover:text-blue-400 hover:bg-white/5"
                        )}
                      >
                        {isActive && <div className="absolute left-0 w-1 h-4 bg-blue-600 rounded-full" />}
                        {renderIcon(item.icon, isActive)}
                        <div className="flex flex-col min-w-0">
                          <span className={cn("text-[9px] font-black uppercase tracking-widest truncate", isActive ? "text-blue-400" : "")}>{item.title}</span>
                          <span className="text-[6px] font-bold opacity-30 lowercase truncate tracking-tight">{item.desc}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 👤 IDENTITY FOOTER */}
      <div className="p-6 bg-[#0F172A]/80 border-t border-white/5 shrink-0">
        <div className="p-3 bg-black/40 border border-white/5 rounded-3xl flex items-center justify-between shadow-inner group/user">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border border-white/10 shrink-0 shadow-2xl transition-transform group-hover/user:rotate-12", 
              isSuperAdmin ? "bg-amber-600 text-white" : "bg-blue-600 text-white"
            )}>
              {user?.U_FirstName?.[0] || 'U'}
            </div>
            <div className="text-left min-w-0 leading-tight">
              <p className="text-[10px] font-black text-white m-0 truncate uppercase tracking-tighter">{user?.U_FirstName} {user?.U_LastName}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheck size={10} className={isSuperAdmin ? "text-amber-500" : "text-blue-500"} />
                <p className="text-[7px] font-black text-slate-600 tracking-widest m-0 uppercase italic truncate">{user?.U_Role || 'USER'}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="text-slate-700 hover:text-rose-500 transition-all border-none bg-transparent cursor-pointer p-2 hover:bg-rose-500/10 rounded-xl"
            title="DÉCONNEXION"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}