/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🔱 MODULE : SIDEBAR SOUVERAINE (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Navigation pilotée par le Registre de Vérité ISO & Grade User.
 * DESIGN : ClickUp High-Density, PWA Optimized (Mobile Drawer, Desktop Collapse).
 * DYNAMIQUE : Zéro-Scroll adaptatif, Occupation intégrale de l'espace.
 * SÉCURITÉ : Isolation Kernel (Zustand) - Zéro NextAuth.
 * RÉVISION : 09 Mars 2026 | 14:15 GMT
 * -------------------------------------------------------------------------
 */

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { cn } from "@/core/utils/cn";
import { MASTER_NAV } from "@/core/config/navigation";
import { useAuthStore } from "@/store/authStore";
import { 
  ChevronDown, LogOut, ShieldCheck, Activity, 
  Settings2, ChevronLeft, ChevronRight, Menu, X
} from "lucide-react";

interface SidebarProps {
  isSuperAdmin: boolean;
}

export default function Sidebar({ isSuperAdmin }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore() as any;
  
  // 🎛️ ÉTATS DE L'INTERFACE (CLICKUP STYLE)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["strategie", "amelioration"]);
  const [isCollapsed, setIsCollapsed] = useState(false); // Mode fin sur PC
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Tiroir PWA sur Mobile

  // Fermer le tiroir mobile lors du changement de route
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => { 
    logout(); 
    router.push("/auth/login"); 
  };

  const toggleGroup = (id: string) => {
    if (isCollapsed) setIsCollapsed(false); // Déploie la sidebar si on clique sur un groupe
    setExpandedGroups(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // 🎨 MOTEUR DE RENDU DES ICÔNES DYNAMIQUE
  const renderIcon = useCallback((iconName: string, active: boolean, isGroupAction = false) => {
    const Icon = (Icons as any)[iconName] || Icons.HelpCircle;
    return (
      <Icon 
        size={isCollapsed && isGroupAction ? 22 : 18} 
        strokeWidth={active ? 2.5 : 2} 
        className={cn(
          "transition-all duration-300 shrink-0", 
          active ? "text-blue-500 drop-shadow-[0_0_8px_rgba(37,99,235,0.8)]" : "text-slate-500 group-hover:text-blue-400"
        )} 
      />
    );
  }, [isCollapsed]);

  return (
    <>
      {/* 📱 BOUTON DÉCLENCHEUR PWA (VISIBLE UNIQUEMENT SUR MOBILE) */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-[#0B0F1A] border border-white/10 rounded-xl text-white shadow-xl"
      >
        <Menu size={20} />
      </button>

      {/* 🌑 OVERLAY SOMBRE POUR MOBILE */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 🔱 SIDEBAR PRINCIPALE */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 h-dvh flex flex-col border-r border-white/5 bg-[#0B0F1A] font-sans italic shadow-4xl select-none transition-all duration-300 ease-in-out shrink-0",
          isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "lg:w-20" : "lg:w-72"
        )}
      >
        {/* 🔘 BOUTON DE RÉTRACTION CLICKUP (DESKTOP SEULEMENT) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-10 bg-blue-600 text-white w-6 h-6 rounded-full items-center justify-center shadow-lg hover:scale-110 transition-transform z-50 border border-white/10 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* 📱 BOUTON FERMETURE (MOBILE SEULEMENT) */}
        <button 
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute right-4 top-6 text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* 🔱 BRANDING : IDENTITÉ SÉCURISÉE */}
        <div className={cn("h-24 flex items-center border-b border-white/5 bg-[#0F172A]/50 shrink-0 transition-all overflow-hidden", isCollapsed ? "justify-center px-0" : "gap-4 px-6")}>
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 bg-blue-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-white/10 shadow-2xl overflow-hidden">
              <Image src="/images/qslogo.png" alt="Qualisoft" width={24} height={24} priority />
            </div>
          </div>
          
          {!isCollapsed && (
            <div className="min-w-0 flex flex-col animate-in fade-in duration-500">
              <h1 className="text-lg font-black tracking-tighter text-white m-0 leading-none uppercase">
                QUALI<span className="text-blue-600">SOFT</span>
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <p className="text-[7px] text-slate-500 font-black uppercase tracking-[0.3em] m-0 italic truncate">Elite Kernel v3.0</p>
              </div>
            </div>
          )}
        </div>

        {/* 🧭 ENGINE : MOTEUR DE NAVIGATION HAUTE DENSITÉ */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar py-6 space-y-1">
          
          {/* RACCOURCI WORKSPACE (ADMIN CLIENT) */}
          {user?.U_Role === 'ADMIN' && (
             <div className="mb-6 px-3">
                {!isCollapsed && <p className="text-[7px] font-black text-slate-700 uppercase tracking-[0.4em] mb-3 pl-3 italic">Administration</p>}
                <Link href="/workspace/setup" className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all no-underline border",
                  pathname.includes('/workspace') 
                    ? "bg-emerald-600/10 border-emerald-500/20 text-emerald-400" 
                    : "border-transparent text-slate-500 hover:bg-white/5",
                  isCollapsed ? "justify-center" : ""
                )}
                title={isCollapsed ? "Configuration SMI" : undefined}>
                  <Settings2 size={18} className="shrink-0" />
                  {!isCollapsed && <span className="text-[9px] font-black uppercase tracking-widest truncate">Configuration SMI</span>}
                </Link>
             </div>
          )}

          {/* GÉNÉRATION DYNAMIQUE DEPUIS MASTER_NAV */}
          <div className="px-3 space-y-2">
            {MASTER_NAV.map((group) => {
              if (group.id === "matrix" && !isSuperAdmin) return null;
              
              const isExp = expandedGroups.includes(group.id) && !isCollapsed;
              const hasActiveChild = group.items.some(item => pathname === item.path || pathname.startsWith(`${item.path}/`));

              return (
                <div key={group.id} className="space-y-1">
                  {/* HEADER DU GROUPE */}
                  <button 
                    onClick={() => toggleGroup(group.id)} 
                    className={cn(
                      "w-full flex items-center p-2.5 rounded-xl transition-all border border-transparent cursor-pointer group",
                      isCollapsed ? "justify-center hover:bg-white/5" : "justify-between hover:bg-white/5",
                      hasActiveChild && isCollapsed ? "bg-blue-600/10 border-blue-500/20" : ""
                    )}
                    title={isCollapsed ? group.label : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-1.5 rounded-lg transition-all", 
                        isExp || (hasActiveChild && isCollapsed) ? "text-blue-500" : "text-slate-600"
                      )}>
                        {renderIcon(group.items[0].icon, isExp || hasActiveChild, true)}
                      </div>
                      
                      {!isCollapsed && (
                        <div className="text-left leading-none min-w-0">
                          <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors block truncate", isExp || hasActiveChild ? "text-white" : "text-slate-500 group-hover:text-blue-400")}>
                            {group.label}
                          </span>
                        </div>
                      )}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown size={14} className={cn("text-slate-700 transition-transform duration-300 shrink-0", isExp && "rotate-180 text-blue-500")} />
                    )}
                  </button>

                  {/* ENFANTS DU GROUPE (MASQUÉS SI COLLAPSÉ) */}
                  {isExp && !isCollapsed && (
                    <div className="pl-5 ml-4 border-l-2 border-white/5 space-y-1 my-2 animate-in slide-in-from-top-2 duration-300">
                      {group.items.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                          <Link 
                            key={item.path} 
                            href={item.path} 
                            className={cn(
                              "flex items-center gap-3 p-2.5 rounded-xl transition-all no-underline relative group/link", 
                              isActive ? "bg-blue-600/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                            )}
                          >
                            {isActive && <div className="absolute -left-4.5 top-1/2 -translate-y-1/2 w-0.75 h-6 bg-blue-600 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,1)]" />}
                            {renderIcon(item.icon, isActive)}
                            <div className="flex flex-col min-w-0">
                              <span className={cn("text-[9px] font-black uppercase tracking-widest truncate", isActive ? "text-blue-400" : "")}>{item.title}</span>
                              <span className="text-[7px] font-bold text-slate-600 lowercase truncate tracking-tight">{item.desc}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* 👤 FOOTER : UTILISATEUR & PARAMÈTRES */}
        <div className="p-4 bg-[#0F172A]/80 border-t border-white/5 shrink-0">
          <div className={cn(
            "p-3 bg-black/40 border border-white/5 rounded-2xl flex items-center transition-all shadow-inner group/user",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            
            <div className={cn("flex items-center min-w-0", isCollapsed ? "justify-center" : "gap-3")}>
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border-2 border-white/10 shrink-0 shadow-xl transition-transform group-hover/user:rotate-6", 
                isSuperAdmin ? "bg-amber-600 text-white" : "bg-blue-600 text-white"
              )} title={isCollapsed ? `${user?.U_FirstName} ${user?.U_LastName}` : undefined}>
                {user?.U_FirstName?.[0] || 'U'}
              </div>
              
              {!isCollapsed && (
                <div className="text-left min-w-0 leading-tight">
                  <p className="text-[10px] font-black text-white m-0 truncate uppercase tracking-tighter">{user?.U_FirstName} {user?.U_LastName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck size={10} className={isSuperAdmin ? "text-amber-500" : "text-blue-500"} />
                    <p className="text-[7px] font-black text-slate-500 tracking-widest m-0 uppercase italic truncate">{user?.tenantId || 'MATRIX'}</p>
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button 
                onClick={handleLogout} 
                className="text-slate-600 hover:text-rose-500 transition-all border-none bg-transparent cursor-pointer p-2 hover:bg-rose-500/10 rounded-lg shrink-0"
                title="Déconnexion Sécurisée"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>

          {/* TELEMETRY */}
          {!isCollapsed && (
            <div className="mt-3 flex items-center justify-center gap-2 opacity-30">
               <Activity size={8} className="text-blue-500" />
               <p className="text-[6px] font-black text-white uppercase tracking-[0.4em] m-0">Sovereign Node Active</p>
            </div>
          )}
        </div>

        {/* 🧪 CSS : HIDE SCROLLBAR */}
        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 0px; }
          .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        ` }} />
      </aside>
    </>
  );
}