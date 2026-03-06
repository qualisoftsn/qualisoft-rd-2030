/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : SIDEBAR SOUVERAINE (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Navigation dynamique pilotée par le Registre Master.
 * FIX : Rétablissement des liens, Icon Resolver, Zéro NextAuth.
 * DESIGN : ClickUp High-Density / 100dvh.
 * ---------------------------------------------------------------------------
 * DATE : 06 Mars 2026 | 00:15 GMT
 */

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import * as Icons from "lucide-react"; // Importation globale pour le Resolver
import { useAuthStore } from '@/store/authStore';
import { MASTER_NAVIGATION } from '@/core/config/navigation';
import { cn } from "@/core/utils/cn";
import { ChevronDown, LogOut, ShieldCheck } from "lucide-react";

export default function Sidebar({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore() as any;
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["gouvernance", "amelioration"]);

  /**
   * 🧠 ICON RESOLVER
   * Transforme les chaînes de caractères du config en composants Lucide.
   */
  const renderIcon = (iconName: string, active: boolean) => {
    const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;
    return <IconComponent 
      size={18} 
      strokeWidth={active ? 3 : 2} 
      className={cn("transition-colors", active ? "text-white" : "text-slate-600")} 
    />;
  };

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  /**
   * 🛡️ RBAC FILTERING (Hardened)
   */
  const filteredNav = useMemo(() => {
    return MASTER_NAVIGATION.map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (isSuperAdmin) return true;
        if (group.id === "admin") return false; // Isolation du Kernel
        return true; // Par défaut, accès libre ou filtré par rôle agent
      })
    })).filter(g => g.items.length > 0);
  }, [isSuperAdmin]);

  const toggleGroup = (id: string) => 
    setExpandedGroups(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <aside className="w-[320px] h-screen fixed left-0 top-0 z-60 flex flex-col border-r-2 border-white/5 bg-[#0B0F1A] font-black uppercase italic shadow-4xl overflow-hidden">
      
      {/* 🔱 LOGO SECTION */}
      <div className="p-10 border-b-2 border-white/5 flex items-center gap-6 bg-[#151A2D] shrink-0">
        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center border-4 border-white/10 shadow-2xl shrink-0">
          <Image src="/images/qslogo.png" alt="Qualisoft" width={38} height={38} priority />
        </div>
        <div className="text-left">
          <h1 className="text-2xl font-black tracking-tighter text-white m-0 uppercase leading-none">QUALI<span className="text-blue-600">SOFT</span></h1>
          <p className="text-[9px] text-slate-500 tracking-[0.4em] mt-3 m-0 opacity-60 italic">Matrix SDE v8.5</p>
        </div>
      </div>

      {/* 🧭 NAVIGATION ENGINE */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
        {filteredNav.map((group) => {
          const isExp = expandedGroups.includes(group.id);
          const GroupIcon = (Icons as any)[group.items[0].icon] || Icons.Layers;

          return (
            <div key={group.id} className="space-y-4 text-left">
              <button 
                onClick={() => toggleGroup(group.id)} 
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-all border-none bg-transparent cursor-pointer group"
              >
                <div className="flex items-center gap-5">
                  <div className={cn("p-2.5 rounded-lg transition-all", isExp ? "bg-blue-600/20 text-blue-500 shadow-lg" : "bg-white/5 text-slate-700")}>
                    <GroupIcon size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className={cn("text-[11px] tracking-widest leading-none", isExp ? "text-white" : "text-slate-600")}>{group.label}</span>
                    <span className="text-[7px] text-slate-800 mt-1 tracking-widest">{group.iso}</span>
                  </div>
                </div>
                <ChevronDown size={14} className={cn("text-slate-700 transition-transform duration-500", isExp && "rotate-180 text-blue-500")} />
              </button>

              {isExp && (
                <div className="pl-6 ml-4 border-l-2 border-white/5 space-y-2 animate-in slide-in-from-top-4 duration-500">
                  {group.items.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link 
                        key={item.id} 
                        href={item.path} 
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl transition-all group/link relative",
                          isActive ? "bg-blue-600 text-white shadow-xl translate-x-1" : "text-slate-500 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-5">
                          {renderIcon(item.icon, isActive)}
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] tracking-widest truncate leading-none">{item.label}</span>
                            <span className="text-[7px] opacity-40 mt-1 truncate lowercase">{item.desc}</span>
                          </div>
                        </div>
                        {isActive && <div className="w-1 h-6 bg-white rounded-full absolute -left-1" />}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 👤 IDENTITY BLOCK */}
      <div className="p-8 bg-[#151A2D] border-t-2 border-white/5 shrink-0">
        <div className="p-5 bg-black/40 border border-white/5 rounded-[2.5rem] flex items-center justify-between shadow-inner group">
          <div className="flex items-center gap-4 min-w-0">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black border-2 border-white/10 shrink-0 shadow-lg",
              isSuperAdmin ? "bg-amber-600" : "bg-blue-600"
            )}>
              {user?.U_FirstName?.[0]}
            </div>
            <div className="text-left min-w-0">
              <p className="text-[12px] font-black text-white m-0 truncate leading-none mb-2 group-hover:text-blue-500 transition-colors">
                {user?.U_FirstName} {user?.U_LastName}
              </p>
              <div className="flex items-center gap-2">
                <ShieldCheck size={10} className={isSuperAdmin ? "text-amber-500" : "text-blue-500"} />
                <p className="text-[8px] text-slate-600 tracking-widest m-0 truncate uppercase italic leading-none">
                  {isSuperAdmin ? "Master Architect" : user?.U_Role}
                </p>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="p-3 text-slate-700 hover:text-rose-500 transition-all border-none bg-transparent cursor-pointer">
            <LogOut size={20} />
          </button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </aside>
  );
}