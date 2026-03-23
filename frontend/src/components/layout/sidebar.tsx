/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🔱 MODULE : SIDEBAR SOUVERAINE (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Navigation pilotée par le Registre de Vérité ISO & Grade User
 * VERSION : 3.0 - Fix JSX namespace + Typing strict + Accessibilité WCAG AA
 * DESIGN : Elite MS, w-[300px] strict, Glassmorphism, Responsive
 * SÉCURITÉ : Isolation Kernel (Zustand) - Zéro NextAuth
 * RÉVISION : 19 Mars 2026 | Production OVH
 * -------------------------------------------------------------------------
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import * as LucideIcons from "lucide-react";
import { cn } from "@/core/utils/cn";
import { MASTER_NAV } from "@/core/config/navigation";
import { useAuthStore } from "@/store/authStore";
import { 
  ChevronDown, LogOut, ShieldCheck, 
  Settings2, AlertCircle, Loader2
} from "lucide-react";

// ============================================================================
// TYPES & INTERFACES (Strict Typing)
// ============================================================================

export interface NavItem {
  path: string;
  title: string;
  desc: string;
  icon: keyof typeof LucideIcons;
  iso?: string;
  roles?: string[];
}

export interface NavGroup {
  id: string;
  label: string;
  iso: string;
  items: NavItem[];
  roles?: string[];
}

export interface UserData {
  U_Id?: string;
  U_FirstName?: string;
  U_LastName?: string;
  U_Role?: string;
  U_Email?: string;
  U_Avatar?: string;
  U_IsActive?: boolean;
}

export interface SidebarProps {
  isSuperAdmin?: boolean;
  className?: string;
}

// ============================================================================
// CONSTANTES & CONFIGURATION
// ============================================================================

const DEFAULT_USER: UserData = {
  U_FirstName: "Utilisateur",
  U_LastName: "Elite",
  U_Role: "USER",
};

const EXPANDED_GROUPS_DEFAULT = ["strategie", "amelioration", "workspace"];

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  SUPER_ADMIN: { bg: 'bg-amber-600/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  ADMIN: { bg: 'bg-emerald-600/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  MANAGER: { bg: 'bg-blue-600/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  USER: { bg: 'bg-slate-600/20', text: 'text-slate-400', border: 'border-slate-500/30' },
};

// ============================================================================
// UTILITAIRES (Pure Functions - SSR Safe)
// ============================================================================

const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0).toUpperCase() || "U";
  const last = lastName?.charAt(0).toUpperCase() || "";
  return first + last;
};

const getRoleBadgeClasses = (role?: string, isSuperAdmin?: boolean): string => {
  if (isSuperAdmin) return ROLE_COLORS.SUPER_ADMIN.bg + ' ' + ROLE_COLORS.SUPER_ADMIN.text + ' ' + ROLE_COLORS.SUPER_ADMIN.border;
  const key = (role || 'USER') as keyof typeof ROLE_COLORS;
  const colors = ROLE_COLORS[key] || ROLE_COLORS.USER;
  return colors.bg + ' ' + colors.text + ' ' + colors.border;
};

// ============================================================================
// SOUS-COMPOSANT : ICON RENDERER (Fix JSX namespace)
// ============================================================================

interface IconRendererProps {
  iconName: keyof typeof LucideIcons;
  active: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

function IconRenderer({ iconName, active, className, size = 'md' }: IconRendererProps) {
  // Mapping des tailles en pixels pour lucide-react
  const sizeMap = { sm: 14, md: 18, lg: 24 };
  const pixelSize = sizeMap[size];
  
  const Icon = LucideIcons[iconName] || LucideIcons.HelpCircle;
  
  return (
    <Icon 
      size={pixelSize}
      strokeWidth={active ? 3 : 2}
      className={cn(
        "transition-all duration-300 flex-shrink-0",
        active 
          ? "text-white drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]" 
          : "text-slate-600 group-hover:text-blue-500",
        className
      )}
      aria-hidden="true"
    />
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL : SIDEBAR
// ============================================================================

export default function Sidebar({ isSuperAdmin = false, className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();
  
  const [expandedGroups, setExpandedGroups] = useState<string[]>(EXPANDED_GROUPS_DEFAULT);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Montage du composant (évite les erreurs d'hydratation)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Gestion de la déconnexion
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("❌ Erreur déconnexion:", error);
      router.push("/auth/login");
    }
  }, [logout, router]);

  // Toggle des groupes de navigation
  const toggleGroup = useCallback((id: string) => {
    setExpandedGroups(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  // Vérification des permissions par rôle
  const canAccessGroup = useCallback((group: NavGroup): boolean => {
    if (!group.roles) return true;
    if (isSuperAdmin) return true;
    const userRole = user?.U_Role || "USER";
    return group.roles.includes(userRole);
  }, [isSuperAdmin, user?.U_Role]);

  const canAccessItem = useCallback((item: NavItem): boolean => {
    if (!item.roles) return true;
    if (isSuperAdmin) return true;
    const userRole = user?.U_Role || "USER";
    return item.roles.includes(userRole);
  }, [isSuperAdmin, user?.U_Role]);

  // États de chargement (SSR safe)
  if (!mounted || isLoading) {
    return (
      <aside 
        className="w-[300px] h-full flex flex-col items-center justify-center bg-[#0B0F1A] border-r border-white/5"
        role="status"
        aria-live="polite"
      >
        <Loader2 size={32} className="text-blue-600 animate-spin mb-4" aria-hidden="true" />
        <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black italic">
          Chargement Kernel...
        </p>
      </aside>
    );
  }

  // Utilisateur non connecté
  if (!user) {
    return (
      <aside className="w-[300px] h-full flex flex-col items-center justify-center bg-[#0B0F1A] border-r border-white/5 p-6">
        <AlertCircle size={40} className="text-amber-500 mb-4" aria-hidden="true" />
        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black italic text-center mb-4">
          Session non authentifiée
        </p>
        <button
          onClick={() => router.push("/auth/login")}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30 border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Se connecter
        </button>
      </aside>
    );
  }

  const safeUser = user as UserData;

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================

  return (
    <aside 
      className={cn(
        "w-[300px] h-full flex flex-col font-sans italic overflow-hidden select-none shrink-0 bg-[#0B0F1A] border-r border-white/5 shadow-2xl",
        className
      )}
      role="navigation"
      aria-label="Menu principal de navigation"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* 🔱 BRANDING : IDENTITÉ SÉCURISÉE */}
      <header className="h-24 flex items-center gap-5 px-8 border-b border-white/5 bg-[#0F172A]/50 shrink-0" role="banner">
        <div className="relative group">
          <div 
            className="absolute -inset-1 bg-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" 
            aria-hidden="true" 
          />
          <div className="relative w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-white/10 shadow-2xl shrink-0 overflow-hidden">
            <Image 
              src="/images/qslogo.png" 
              alt="Qualisoft Elite - Logo" 
              width={28} 
              height={28} 
              priority 
              className="object-contain"
            />
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-black tracking-tighter text-white m-0 leading-none uppercase">
            QUALI<span className="text-blue-600">SOFT</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <p className="text-[7px] text-slate-500 font-black uppercase tracking-[0.3em] m-0 italic">
              Elite Kernel v3.0.1
            </p>
          </div>
        </div>
      </header>

      {/* 🧭 ENGINE : MOTEUR DE NAVIGATION */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6" role="navigation">
        
        {/* Configuration SMI (Admin uniquement) */}
        {safeUser?.U_Role === 'ADMIN' && (
          <section className="mb-8" aria-label="Administration">
            <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mb-4 pl-2 italic">
              Administration Workspace
            </p>
            <Link 
              href="/workspace/setup" 
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl transition-all no-underline border border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
                pathname.includes('/workspace') 
                  ? "bg-emerald-600/10 border-emerald-500/20 text-emerald-400" 
                  : "text-slate-500 hover:bg-white/5 hover:text-emerald-400"
              )}
            >
              <IconRenderer iconName="Settings2" active={pathname.includes('/workspace')} />
              <span className="text-[10px] font-black uppercase tracking-widest">Configuration SMI</span>
            </Link>
          </section>
        )}

        {/* Groupes de navigation principaux */}
        {(MASTER_NAV as NavGroup[]).map((group) => {
          // Filtrage par permissions
          if (!canAccessGroup(group)) return null;
          if (group.id === "matrix" && !isSuperAdmin) return null;
          
          const isExpanded = expandedGroups.includes(group.id);

          return (
            <section key={group.id} className="space-y-2" aria-label={group.label}>
              <button 
                onClick={() => toggleGroup(group.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleGroup(group.id);
                  }
                }}
                aria-expanded={isExpanded}
                aria-controls={`nav-group-${group.id}`}
                className={cn(
                  "w-full flex items-center justify-between p-2 rounded-xl transition-all border-none bg-transparent cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
                  isExpanded ? "bg-white/5" : "hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className={cn(
                      "p-2 rounded-lg transition-all duration-300", 
                      isExpanded 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                        : "bg-white/5 text-slate-700 group-hover:bg-blue-600/20"
                    )}
                    aria-hidden="true"
                  >
                    <IconRenderer 
                      iconName={group.items[0]?.icon || 'HelpCircle'} 
                      active={isExpanded} 
                    />
                  </div>
                  <div className="text-left leading-none">
                    <span 
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest transition-colors duration-300", 
                        isExpanded ? "text-white" : "text-slate-600 group-hover:text-blue-400"
                      )}
                    >
                      {group.label}
                    </span>
                    <p className="text-[6px] font-black text-slate-800 mt-1.5 m-0 tracking-widest">
                      {group.iso}
                    </p>
                  </div>
                </div>
                <ChevronDown 
                  size={14} 
                  className={cn(
                    "text-slate-800 transition-transform duration-500 flex-shrink-0", 
                    isExpanded && "rotate-180 text-blue-500"
                  )} 
                  aria-hidden="true"
                />
              </button>

              {/* Sous-menu déroulant */}
              {isExpanded && (
                <div 
                  id={`nav-group-${group.id}`}
                  className="pl-6 ml-4 border-l border-white/5 space-y-1 mt-2 animate-in slide-in-from-top-2 duration-300"
                  role="menu"
                >
                  {group.items.filter(canAccessItem).map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link 
                        key={item.path} 
                        href={item.path} 
                        className={cn(
                          "flex items-center gap-4 p-3.5 rounded-xl transition-all no-underline relative group/link focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 focus:ring-offset-[#0B0F1A]", 
                          isActive 
                            ? "bg-blue-600/10 text-white shadow-sm translate-x-1 border border-blue-500/20" 
                            : "text-slate-500 hover:text-blue-400 hover:bg-white/5 hover:translate-x-0.5"
                        )}
                        role="menuitem"
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {isActive && (
                          <div 
                            className="absolute left-0 w-1 h-4 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]" 
                            aria-hidden="true" 
                          />
                        )}
                        <IconRenderer iconName={item.icon} active={isActive} />
                        <div className="flex flex-col min-w-0">
                          <span 
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest truncate transition-colors", 
                              isActive ? "text-blue-400" : ""
                            )}
                          >
                            {item.title}
                          </span>
                          <span className="text-[6px] font-bold opacity-30 lowercase truncate tracking-tight text-slate-400">
                            {item.desc}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </nav>

      {/* 👤 IDENTITY FOOTER */}
      <footer className="p-6 bg-[#0F172A]/80 border-t border-white/5 shrink-0" role="contentinfo">
        <div 
          className="p-3 bg-black/40 border border-white/5 rounded-3xl flex items-center justify-between shadow-inner group/user transition-all hover:border-white/10"
          role="group"
          aria-label="Profil utilisateur"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div 
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border border-white/10 shrink-0 shadow-2xl transition-transform duration-300 group-hover/user:rotate-12", 
                isSuperAdmin 
                  ? "bg-gradient-to-br from-amber-500 to-amber-700 text-white" 
                  : "bg-gradient-to-br from-blue-500 to-blue-700 text-white"
              )}
              aria-hidden="true"
            >
              {getInitials(safeUser?.U_FirstName, safeUser?.U_LastName)}
            </div>
            
            {/* Infos utilisateur */}
            <div className="text-left min-w-0 leading-tight">
              <p className="text-[10px] font-black text-white m-0 truncate uppercase tracking-tighter">
                {safeUser?.U_FirstName || 'Utilisateur'} {safeUser?.U_LastName || ''}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheck 
                  size={10} 
                  className={isSuperAdmin ? "text-amber-500" : "text-blue-500"} 
                  aria-hidden="true" 
                />
                <span 
                  className={cn(
                    "text-[7px] font-black tracking-widest m-0 uppercase italic truncate px-1.5 py-0.5 rounded border",
                    getRoleBadgeClasses(safeUser?.U_Role, isSuperAdmin)
                  )}
                >
                  {safeUser?.U_Role || 'USER'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Bouton déconnexion */}
          <button 
            onClick={handleLogout}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLogout();
              }
            }}
            className="text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 transition-all border-none bg-transparent cursor-pointer p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1 focus:ring-offset-[#0B0F1A]"
            title="DÉCONNEXION"
            aria-label="Se déconnecter de l'espace Matrix"
            type="button"
          >
            <LogOut size={16} aria-hidden="true" />
          </button>
        </div>
        
        {/* Version info */}
        <p className="text-[6px] text-slate-700 uppercase tracking-[0.4em] text-center mt-4 italic">
          © 2026 Qualisoft Elite • Multi-Tenant Sécurisé
        </p>
      </footer>

      {/* GLOBAL STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(37, 99, 235, 0.3); 
          border-radius: 10px; 
        }
        :focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </aside>
  );
}