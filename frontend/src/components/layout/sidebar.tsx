/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🔱 MODULE : SIDEBAR SOUVERAINE (ELITE SDE)
 * ---------------------------------------------------------------------------
 * RÔLE : Navigation pilotée par le Registre de Vérité ISO.
 * DESIGN : ClickUp High-Density / Ultra-Responsive PWA.
 * ---------------------------------------------------------------------------
 * DATE : 06 Mars 2026 | 00:30 GMT
 */

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { cn } from "@/core/utils/cn";
import { MASTER_NAV } from "@/core/config/navigation";
import { useAuthStore } from "@/store/authStore";
import { ChevronDown, LogOut, ShieldCheck, Activity } from "lucide-react";

export default function Sidebar({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore() as any;
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["strategie", "amelioration"]);

  const handleLogout = () => { logout(); router.push("/auth/login"); };

  const toggleGroup = (id: string) => 
    setExpandedGroups(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const renderIcon = (iconName: string, active: boolean) => {
    const Icon = (Icons as any)[iconName] || Icons.HelpCircle;
    return <Icon size={16} strokeWidth={active ? 3 : 2} className={active ? "text-white" : "text-slate-700"} />;
  };

  return (
    <aside className="w-[320px] h-screen fixed left-0 top-0 z-100 flex flex-col border-r-2 border-white/5 bg-[#0B0F1A] font-black uppercase italic shadow-4xl overflow-hidden">
      
      {/* 🔱 BRANDING SECTION */}
      <div className="p-8 border-b-2 border-white/5 flex items-center gap-6 bg-[#151A2D] shrink-0">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border-4 border-white/10 shadow-2xl shrink-0">
          <Image src="/images/qslogo.png" alt="Qualisoft" width={32} height={32} priority />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-black tracking-tighter text-white m-0 leading-none">QUALI<span className="text-blue-600">SOFT</span></h1>
          <p className="text-[8px] text-slate-500 tracking-[0.4em] mt-2 m-0 opacity-60">Elite Matrix OS v9.5</p>
        </div>
      </div>

      {/* 🧭 NAVIGATION ENGINE */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {MASTER_NAV.map((group) => {
          if (group.id === "matrix" && !isSuperAdmin) return null;
          const isExp = expandedGroups.includes(group.id);

          return (
            <div key={group.id} className="space-y-3">
              <button onClick={() => toggleGroup(group.id)} className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-all border-none bg-transparent cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-lg transition-all", isExp ? "bg-blue-600/20 text-blue-500" : "bg-white/5 text-slate-700")}>
                    {renderIcon(group.items[0].icon, isExp)}
                  </div>
                  <div className="text-left leading-none">
                    <span className={cn("text-[10px] tracking-widest transition-colors", isExp ? "text-white" : "text-slate-600")}>{group.label}</span>
                    <p className="text-[6px] text-slate-800 mt-1 m-0 tracking-[0.2em]">{group.iso}</p>
                  </div>
                </div>
                <ChevronDown size={12} className={cn("text-slate-800 transition-transform duration-500", isExp && "rotate-180 text-blue-500")} />
              </button>

              {isExp && (
                <div className="pl-6 ml-4 border-l-2 border-white/5 space-y-1.5 animate-in slide-in-from-top-4 duration-500">
                  {group.items.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link key={item.path} href={item.path} className={cn("flex items-center gap-4 p-3.5 rounded-xl transition-all group/link relative", isActive ? "bg-blue-600 text-white shadow-xl translate-x-1" : "text-slate-500 hover:text-white hover:bg-white/5")}>
                        {renderIcon(item.icon, isActive)}
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] tracking-widest truncate">{item.title}</span>
                          <span className="text-[6px] opacity-30 lowercase truncate">{item.desc}</span>
                        </div>
                        {isActive && <div className="absolute -left-1.5 w-1 h-5 bg-white rounded-full" />}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 👤 IDENTITY SECTION */}
      <div className="p-8 bg-[#151A2D] border-t-2 border-white/5 shrink-0">
        <div className="p-4 bg-black/40 border border-white/5 rounded-4xl flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border-2 border-white/10 shrink-0", isSuperAdmin ? "bg-amber-600 shadow-amber-900/40" : "bg-blue-600 shadow-blue-900/40")}>
              {user?.U_FirstName?.[0]}
            </div>
            <div className="text-left min-w-0 leading-none">
              <p className="text-[10px] font-black text-white m-0 truncate mb-1.5">{user?.U_FirstName} {user?.U_LastName}</p>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={10} className={isSuperAdmin ? "text-amber-500" : "text-blue-500"} />
                <p className="text-[7px] text-slate-600 tracking-widest m-0 uppercase italic truncate">{user?.U_Role}</p>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-700 hover:text-rose-500 transition-colors border-none bg-transparent cursor-pointer p-0"><LogOut size={18} /></button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 0px; }` }} />
    </aside>
  );
}