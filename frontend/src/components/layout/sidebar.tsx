/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🔱 MODULE : SIDEBAR SOUVERAINE (ELITE-SDE)
 * RÔLE : Navigation pilotée par le Registre de Vérité ISO & Grade User
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useState, useCallback, useEffect, KeyboardEvent, MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { cn } from "@/core/utils/cn";
import { MASTER_NAV } from "@/core/config/navigation";
import { useAuthStore } from "@/store/authStore";
import { 
  ChevronDown, LogOut, ShieldCheck, 
  Settings2, AlertCircle, Loader2, HelpCircle,
  LucideIcon
} from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'USER' | 'HR' | 'QHSE' | 'FINANCE' | 'PROCUREMENT' | 'OBSERVATEUR';

export interface NavItem {
  path: string;
  title: string;
  desc: string;
  icon: string;
  iso?: string;
  roles?: UserRole[];
}

export interface NavGroup {
  id: string;
  label: string;
  iso: string;
  items: NavItem[];
  roles?: UserRole[];
}

export interface UserData {
  U_Id?: string;
  U_FirstName?: string;
  U_LastName?: string;
  U_Role?: UserRole;
  U_Email?: string;
  U_Avatar?: string;
  U_IsActive?: boolean;
}

export interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

export interface SidebarProps {
  isSuperAdmin?: boolean;
  className?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_USER: UserData = {
  U_FirstName: "Utilisateur",
  U_LastName: "Elite",
  U_Role: "USER",
};

const EXPANDED_GROUPS_DEFAULT = ["strategie", "amelioration", "workspace"];

// Type guard pour les icons Lucide
const isValidIconName = (name: string): name is keyof typeof Icons => {
  return name in Icons;
};

// ============================================================================
// UTILITAIRES
// ============================================================================

const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0) || "U";
  const last = lastName?.charAt(0) || "";
  return (first + last).toUpperCase();
};

const getRoleBadgeColor = (role?: UserRole, isSuperAdmin?: boolean): string => {
  if (isSuperAdmin) return "bg-amber-600/20 text-amber-400 border-amber-500/30";
  if (role === "ADMIN") return "bg-emerald-600/20 text-emerald-400 border-emerald-500/30";
  if (role === "MANAGER") return "bg-blue-600/20 text-blue-400 border-blue-500/30";
  return "bg-slate-600/20 text-slate-400 border-slate-500/30";
};

// ============================================================================
// SOUS-COMPOSANT : ICON RENDERER
// ============================================================================

interface IconRendererProps {
  iconName: string;
  active: boolean;
  className?: string;
}

function IconRenderer({ iconName, active, className }: IconRendererProps) {
  const Icon: LucideIcon = isValidIconName(iconName) 
    ? Icons[iconName] 
    : HelpCircle;

  return (
    <Icon 
      strokeWidth={active ? 3 : 2} 
      className={cn(
        "transition-all duration-300 w-4 h-4 md:w-5 md:h-5", 
        active 
          ? "text-white drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]" 
          : "text-slate-500 group-hover:text-blue-400",
        className
      )} 
      aria-hidden="true"
    />
  );
}

// ============================================================================
// SOUS-COMPOSANT : NAV GROUP HEADER
// ============================================================================

interface NavGroupHeaderProps {
  group: NavGroup;
  isExpanded: boolean;
  onToggle: () => void;
  firstIcon: string;
}

function NavGroupHeader({ group, isExpanded, onToggle, firstIcon }: NavGroupHeaderProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <button 
      type="button"
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      aria-expanded={isExpanded}
      aria-controls={`nav-group-${group.id}`}
      className={cn(
        "w-full flex items-center justify-between p-2 rounded-xl transition-all border-none bg-transparent cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
        isExpanded ? "bg-white/5" : "hover:bg-white/5"
      )}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div 
          className={cn(
            "p-1.5 md:p-2 rounded-lg transition-all duration-300", 
            isExpanded 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
              : "bg-white/5 text-slate-500 group-hover:bg-blue-600/20 group-hover:text-blue-400"
          )}
          aria-hidden="true"
        >
          <IconRenderer iconName={firstIcon} active={isExpanded} />
        </div>
        <div className="text-left leading-none">
          <span 
            className={cn(
              "text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors duration-300", 
              isExpanded ? "text-white" : "text-slate-500 group-hover:text-blue-400"
            )}
          >
            {group.label}
          </span>
          <p className="text-[5px] md:text-[6px] font-black text-slate-600 mt-1 md:mt-1.5 m-0 tracking-widest">
            {group.iso}
          </p>
        </div>
      </div>
      <ChevronDown 
        size={12}
        className={cn(
          "text-slate-600 transition-transform duration-500 w-3 h-3 md:w-3.5 md:h-3.5 md:w-4 md:h-4", 
          isExpanded && "rotate-180 text-blue-400"
        )} 
        aria-hidden="true"
      />
    </button>
  );
}

// ============================================================================
// SOUS-COMPOSANT : NAV ITEM
// ============================================================================

interface NavItemLinkProps {
  item: NavItem;
  pathname: string;
  icon: string;
}

function NavItemLink({ item, pathname, icon }: NavItemLinkProps) {
  const isActive = pathname === item.path;

  return (
    <Link 
      href={item.path} 
      className={cn(
        "flex items-center gap-3 md:gap-4 p-3 md:p-3.5 rounded-xl transition-all no-underline relative group/link focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 focus:ring-offset-[#0B0F1A]", 
        isActive 
          ? "bg-blue-600/10 text-white shadow-sm translate-x-1 border border-blue-500/20" 
          : "text-slate-500 hover:text-blue-400 hover:bg-white/5 hover:translate-x-0.5"
      )}
      role="menuitem"
      aria-current={isActive ? 'page' : undefined}
    >
      {isActive && (
        <div 
          className="absolute left-0 w-1 h-3 md:h-4 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]" 
          aria-hidden="true" 
        />
      )}
      <IconRenderer iconName={icon} active={isActive} />
      <div className="flex flex-col min-w-0">
        <span 
          className={cn(
            "text-[8px] md:text-[9px] font-black uppercase tracking-widest truncate transition-colors", 
            isActive ? "text-blue-400" : ""
          )}
        >
          {item.title}
        </span>
        <span className="text-[5px] md:text-[6px] font-bold opacity-30 lowercase truncate tracking-tight text-slate-400">
          {item.desc}
        </span>
      </div>
    </Link>
  );
}

// ============================================================================
// SOUS-COMPOSANT : USER AVATAR
// ============================================================================

interface UserAvatarProps {
  firstName?: string;
  lastName?: string;
  isSuperAdmin?: boolean;
}

function UserAvatar({ firstName, lastName, isSuperAdmin }: UserAvatarProps) {
  return (
    <div 
      className={cn(
        "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-[9px] md:text-xs font-black border border-white/10 shrink-0 shadow-2xl transition-transform duration-300 group-hover/user:rotate-12", 
        isSuperAdmin 
          ? "bg-gradient-to-br from-amber-500 to-amber-700 text-white" 
          : "bg-gradient-to-br from-blue-500 to-blue-700 text-white"
      )}
      aria-hidden="true"
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function Sidebar({ isSuperAdmin = false, className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore() as AuthState;
  
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
      // Fallback : redirection forcée
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

  // État de chargement (évite le flash d'hydratation)
  if (!mounted || isLoading) {
    return (
      <div 
        className="w-72 md:w-80 h-full flex flex-col items-center justify-center bg-[#0B0F1A] border-r border-white/5"
        role="status"
        aria-live="polite"
        aria-label="Chargement du menu"
      >
        <Loader2 size={24} className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-blue-400 animate-spin mb-3 md:mb-4" aria-hidden="true" />
        <p className="text-[7px] md:text-[8px] text-slate-500 uppercase tracking-widest font-black italic">
          Chargement Kernel...
        </p>
      </div>
    );
  }

  // Utilisateur non connecté
  if (!user) {
    return (
      <div 
        className="w-72 md:w-80 h-full flex flex-col items-center justify-center bg-[#0B0F1A] border-r border-white/5 p-4 md:p-6"
        role="alert"
        aria-live="assertive"
      >
        <AlertCircle size={32} className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-amber-400 mb-3 md:mb-4" aria-hidden="true" />
        <p className="text-[8px] md:text-[9px] text-slate-400 uppercase tracking-widest font-black italic text-center mb-3 md:mb-4">
          Session non authentifiée
        </p>
        <button
          type="button"
          onClick={() => router.push("/auth/login")}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30 border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Se connecter à l'espace Matrix"
        >
          Se connecter
        </button>
      </div>
    );
  }

  const safeUser = user as UserData;

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================

  return (
    <aside 
      className={cn(
        "w-72 md:w-80 h-full flex flex-col font-sans italic overflow-hidden select-none shrink-0 bg-[#0B0F1A] border-r border-white/5 shadow-2xl",
        className
      )}
      role="navigation"
      aria-label="Menu principal de navigation"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* 🔱 BRANDING : IDENTITÉ SÉCURISÉE */}
      <header 
        className="h-20 md:h-24 flex items-center gap-3 md:gap-4 lg:gap-5 px-4 md:px-6 lg:px-8 border-b border-white/5 bg-[#0F172A]/50 shrink-0" 
        role="banner"
        aria-label="Identité Qualisoft Elite"
      >
        <div className="relative group">
          <div 
            className="absolute -inset-1 bg-blue-600 rounded-xl md:rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" 
            aria-hidden="true" 
          />
          <div className="relative w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl flex items-center justify-center border border-white/10 shadow-2xl shrink-0 overflow-hidden">
            <Image 
              src="/images/qslogo.png" 
              alt="Qualisoft Elite - Logo" 
              width={24}
              height={24}
              priority 
              className="object-contain w-6 h-6 md:w-7 md:h-7"
            />
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="text-base md:text-lg lg:text-xl font-black tracking-tighter text-white m-0 leading-none uppercase truncate">
            QUALI<span className="text-blue-400">SOFT</span>
          </h1>
          <div className="flex items-center gap-1.5 md:gap-2 mt-1 md:mt-1.5 lg:mt-2">
            <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <p className="text-[5px] md:text-[6px] lg:text-[7px] text-slate-500 font-black uppercase tracking-widest m-0 italic truncate">
              Elite Kernel v3.0.1
            </p>
          </div>
        </div>
      </header>

      {/* 🧭 ENGINE : MOTEUR DE NAVIGATION */}
      <nav 
        className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-4 lg:p-6 space-y-4 md:space-y-5 lg:space-y-6" 
        role="navigation"
        aria-label="Menu de navigation principal"
      >
        
        {/* Configuration SMI (Admin uniquement) */}
        {safeUser?.U_Role === 'ADMIN' && (
          <section className="mb-6 md:mb-8" aria-label="Administration">
            <p className="text-[6px] md:text-[7px] lg:text-[8px] font-black text-slate-600 uppercase tracking-widest mb-3 md:mb-4 pl-1 md:pl-2 italic">
              Administration Workspace
            </p>
            <Link 
              href="/workspace/setup" 
              className={cn(
                "flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg md:rounded-xl transition-all no-underline border border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
                pathname.includes('/workspace') 
                  ? "bg-emerald-600/10 border-emerald-500/20 text-emerald-400" 
                  : "text-slate-500 hover:bg-white/5 hover:text-emerald-400"
              )}
              aria-label="Accéder à la configuration SMI"
            >
              <Settings2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" aria-hidden="true" />
              <span className="text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest">Configuration SMI</span>
            </Link>
          </section>
        )}

        {/* Groupes de navigation principaux */}
        {MASTER_NAV.map((group: NavGroup) => {
          // Filtrage par permissions
          if (!canAccessGroup(group)) return null;
          if (group.id === "matrix" && !isSuperAdmin) return null;
          
          const isExpanded = expandedGroups.includes(group.id);
          const firstIcon = group.items[0]?.icon || 'HelpCircle';

          return (
            <section key={group.id} className="space-y-1 md:space-y-1.5" aria-label={group.label}>
              <NavGroupHeader 
                group={group}
                isExpanded={isExpanded}
                onToggle={() => toggleGroup(group.id)}
                firstIcon={firstIcon}
              />

              {/* Sous-menu déroulant */}
              {isExpanded && (
                <div 
                  id={`nav-group-${group.id}`}
                  className="pl-4 md:pl-6 ml-3 md:ml-4 border-l border-white/5 space-y-0.5 md:space-y-1 mt-1.5 md:mt-2 animate-in slide-in-from-top-2 duration-300"
                  role="menu"
                  aria-label={`Sous-menu ${group.label}`}
                >
                  {group.items.filter(canAccessItem).map((item) => (
                    <NavItemLink 
                      key={item.path} 
                      item={item}
                      pathname={pathname}
                      icon={item.icon}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </nav>

      {/* 👤 IDENTITY FOOTER */}
      <footer 
        className="p-3 md:p-4 lg:p-6 bg-[#0F172A]/80 border-t border-white/5 shrink-0" 
        role="contentinfo"
        aria-label="Informations utilisateur"
      >
        <div 
          className="p-2 md:p-3 bg-black/40 border border-white/5 rounded-2xl md:rounded-3xl flex items-center justify-between shadow-inner group/user transition-all hover:border-white/10"
          role="group"
          aria-label="Profil utilisateur"
        >
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            {/* Avatar */}
            <UserAvatar 
              firstName={safeUser?.U_FirstName}
              lastName={safeUser?.U_LastName}
              isSuperAdmin={isSuperAdmin}
            />
            
            {/* Infos utilisateur */}
            <div className="text-left min-w-0 leading-tight">
              <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-white m-0 truncate uppercase tracking-tighter">
                {safeUser?.U_FirstName || 'Utilisateur'} {safeUser?.U_LastName || ''}
              </p>
              <div className="flex items-center gap-1 md:gap-1.5 mt-0.5 md:mt-1">
                <ShieldCheck 
                  size={8}
                  className={cn("w-2 h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3", isSuperAdmin ? "text-amber-400" : "text-blue-400")} 
                  aria-hidden="true" 
                />
                <span 
                  className={cn(
                    "text-[5px] md:text-[6px] lg:text-[7px] font-black tracking-widest m-0 uppercase italic truncate px-1 md:px-1.5 py-0.5 rounded border",
                    getRoleBadgeColor(safeUser?.U_Role, isSuperAdmin)
                  )}
                >
                  {safeUser?.U_Role || 'USER'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Bouton déconnexion */}
          <button 
            type="button"
            onClick={handleLogout}
            onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLogout();
              }
            }}
            className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all border-none bg-transparent cursor-pointer p-1.5 md:p-2 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 focus:ring-offset-[#0B0F1A]"
            title="DÉCONNEXION"
            aria-label="Se déconnecter de l'espace Matrix"
          >
            <LogOut 
              size={14}
              className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform" 
              aria-hidden="true" 
            />
          </button>
        </div>
        
        {/* Version info */}
        <p className="text-[5px] md:text-[6px] text-slate-600 uppercase tracking-widest text-center mt-3 md:mt-4 italic">
          © 2026 Qualisoft Elite • Multi-Tenant Sécurisé
        </p>
      </footer>
    </aside>
  );
}