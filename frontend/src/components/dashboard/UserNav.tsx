/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 👤 MODULE : UserNav (User Identity & Credentials)
 * RÔLE : Gestion de l'identité et des accréditations (Zéro NextAuth)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, useMemo, useCallback, useEffect, KeyboardEvent, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { User as UserIcon, ShieldCheck, ChevronDown, Settings, LogOut, HelpCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/core/utils/cn';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export interface UserAuth {
  U_Id: string;
  U_Email: string;
  U_FirstName: string;
  U_LastName: string;
  U_Role: string;
  U_TenantId?: string;
  U_TenantName?: string;
  U_IsActive?: boolean;
  U_Avatar?: string;
}

export interface AuthState {
  user: UserAuth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setLogout: () => void;
}

export interface UserNavProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export interface DropdownMenuItem {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  danger?: boolean;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'RESP. QUALITÉ',
  ADMIN: 'ADMIN TENANT',
  MANAGER: 'MANAGER',
  USER: 'COLLABORATEUR',
  AUDITEUR: 'AUDITEUR',
  OBSERVATEUR: 'OBSERVATEUR',
};

const getRoleLabel = (role: string): string => {
  return ROLE_LABELS[role?.toUpperCase()] || role?.toUpperCase() || 'UTILISATEUR';
};

// ============================================================================
// SOUS-COMPOSANT : SKELETON LOADER
// ============================================================================

function SkeletonLoader() {
  return (
    <div 
      className="flex items-center gap-3 md:gap-4 opacity-20 animate-pulse italic"
      role="status"
      aria-label="Chargement du profil utilisateur"
      aria-busy="true"
    >
      <div className="flex flex-col items-end gap-1.5 md:gap-2">
        <div className="w-16 md:w-20 h-2 md:h-2.5 bg-slate-400 rounded-full" />
        <div className="w-12 md:w-16 h-1.5 md:h-2 bg-slate-300 rounded-full" />
      </div>
      <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-400 rounded-xl md:rounded-2xl" />
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : DROPDOWN MENU
// ============================================================================

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAuth;
  onLogout: () => void;
  variant: 'light' | 'dark';
}

function UserDropdown({ isOpen, onClose, user, onLogout, variant }: UserDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isDark = variant === 'dark';

  const menuItems: DropdownMenuItem[] = [
    {
      label: 'Mon Profil',
      icon: UserIcon,
      onClick: () => {
        router.push('/dashboard/profile');
        onClose();
      },
    },
    {
      label: 'Paramètres',
      icon: Settings,
      onClick: () => {
        router.push('/dashboard/settings');
        onClose();
      },
    },
    {
      label: 'Aide',
      icon: HelpCircle,
      onClick: () => {
        router.push('/dashboard/help');
        onClose();
      },
    },
    {
      label: 'Déconnexion',
      icon: LogOut,
      onClick: () => {
        onLogout();
        onClose();
      },
      danger: true,
    },
  ];

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape as any);
    }
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [isOpen, onClose]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className={cn(
        "absolute right-0 top-full mt-2 w-56 md:w-64 rounded-xl md:rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200",
        isDark 
          ? "bg-[#0F172A] border border-white/10" 
          : "bg-white border border-slate-200"
      )}
      role="menu"
      aria-label="Menu utilisateur"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* User Info Header */}
      <div className={cn("p-3 md:p-4 border-b", isDark ? "border-white/5 bg-white/2" : "border-slate-100 bg-slate-50")}>
        <p className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-tighter truncate", isDark ? "text-white" : "text-slate-900")}>
          {user.U_FirstName} {user.U_LastName}
        </p>
        <p className={cn("text-[7px] md:text-[8px] uppercase tracking-widest truncate mt-0.5", isDark ? "text-slate-400" : "text-slate-500")}>
          {user.U_Email}
        </p>
      </div>

      {/* Menu Items */}
      <div className="py-1 md:py-1.5" role="menubar">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              type="button"
              onClick={item.onClick}
              className={cn(
                "w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all focus:outline-none",
                isDark 
                  ? "focus:bg-white/5" 
                  : "focus:bg-slate-100",
                item.danger 
                  ? isDark
                    ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    : "text-red-500 hover:bg-red-50 hover:text-red-600"
                  : isDark
                    ? "text-slate-300 hover:bg-white/5 hover:text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
              role="menuitem"
              aria-label={item.label}
            >
              <Icon size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className={cn("p-2 md:p-3 border-t text-center", isDark ? "border-white/5 bg-white/2" : "border-slate-100 bg-slate-50")}>
        <p className={cn("text-[6px] md:text-[7px] uppercase tracking-widest", isDark ? "text-slate-500" : "text-slate-400")}>
          Qualisoft Elite RD-2026
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function UserNav({ className, variant = 'dark' }: UserNavProps) {
  const { user, setLogout } = useAuthStore() as AuthState;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const navRef = useRef<HTMLDivElement>(null);

  const isDark = variant === 'dark';

  const initials = useMemo(() => {
    if (!user) return "QS";
    return `${user.U_FirstName?.[0] || ""}${user.U_LastName?.[0] || ""}`.toUpperCase();
  }, [user]);

  const roleLabel = useMemo(() => {
    if (!user) return "UTILISATEUR";
    return getRoleLabel(user.U_Role);
  }, [user]);

  const handleToggleDropdown = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const handleCloseDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleDropdown();
    }
    if (e.key === 'Escape' && dropdownOpen) {
      handleCloseDropdown();
    }
  };

  const handleLogout = useCallback(() => {
    const toastId = toast.loading("Déconnexion en cours...");
    try {
      setLogout();
      toast.success("Déconnexion réussie", { id: toastId });
      router.push('/auth/login');
    } catch (error) {
      toast.error("Erreur de déconnexion", { id: toastId });
    }
  }, [setLogout, router]);

  // Squelette de chargement
  if (!user) {
    return <SkeletonLoader />;
  }

  return (
    <div 
      ref={navRef}
      className={cn("relative italic font-sans select-none", className)}
      role="button"
      aria-label={`Profil utilisateur: ${user.U_FirstName} ${user.U_LastName}`}
      aria-expanded={dropdownOpen}
      aria-haspopup="menu"
      tabIndex={0}
      onClick={handleToggleDropdown}
      onKeyDown={handleKeyDown}
    >
      <div 
        className={cn(
          "flex items-center gap-3 md:gap-4 lg:gap-5 cursor-pointer group transition-all duration-500",
          dropdownOpen && "opacity-100"
        )}
      >
        
        {/* User Info (Desktop) */}
        <div className="text-right hidden sm:flex flex-col items-end">
          <p className={cn(
            "text-[11px] md:text-[12px] lg:text-[13px] font-black uppercase tracking-tighter leading-none m-0 truncate max-w-[150px] md:max-w-[200px] transition-colors",
            isDark 
              ? "text-slate-900 group-hover:text-blue-500" 
              : "text-white group-hover:text-blue-400"
          )}>
            {user.U_FirstName} {user.U_LastName}
          </p>
          
          <div className={cn(
            "flex items-center justify-end gap-1.5 md:gap-2 mt-1 md:mt-1.5 px-2 md:px-3 py-1 rounded-lg md:rounded-xl border transition-all",
            isDark
              ? "bg-blue-600/5 border-blue-500/10 group-hover:border-blue-500/30"
              : "bg-white/10 border-white/20 group-hover:border-white/40"
          )}>
            <ShieldCheck size={10} className={cn("w-2.5 h-2.5 md:w-3 md:h-3", isDark ? "text-blue-500" : "text-blue-400")} aria-hidden="true" />
            <p className={cn(
              "text-[6px] md:text-[7px] lg:text-[8px] font-black uppercase tracking-widest m-0 leading-none truncate max-w-[120px] md:max-w-[150px]",
              isDark ? "text-blue-500" : "text-blue-300"
            )}>
              {roleLabel} • {user.U_TenantName || 'ELITE'}
            </p>
          </div>
        </div>
        
        {/* Avatar */}
        <div className="relative">
          <div 
            className={cn(
              "w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-[10px] md:text-sm shadow-xl border transition-all duration-500 relative overflow-hidden",
              isDark
                ? "bg-slate-950 text-white border-white/10 group-hover:bg-blue-600"
                : "bg-white text-slate-900 border-white/20 group-hover:bg-blue-500 group-hover:text-white",
              dropdownOpen && (isDark ? "bg-blue-600" : "bg-blue-500 text-white")
            )}
            aria-hidden="true"
          >
            <span className="relative z-10 tracking-tighter not-italic">{initials}</span>
            <div className={cn(
              "absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-700",
              isDark ? "bg-gradient-to-t from-blue-600/50 via-transparent to-transparent" : "bg-gradient-to-t from-blue-500/50 via-transparent to-transparent"
            )} />
          </div>
          {/* Online Status */}
          <div 
            className={cn(
              "absolute -bottom-0.5 md:-bottom-1 -right-0.5 md:-right-1 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 md:border-4",
              isDark ? "bg-emerald-500 border-[#0B0F1A]" : "bg-emerald-400 border-white"
            )}
            aria-label="Utilisateur en ligne"
            role="status"
          />
        </div>

        {/* Dropdown Arrow (Desktop) */}
        <ChevronDown 
          size={14} 
          className={cn(
            "w-3.5 h-3.5 md:w-4 md:h-4 hidden sm:block transition-all",
            isDark ? "text-slate-500 group-hover:text-white" : "text-slate-400 group-hover:text-white",
            dropdownOpen && "rotate-180"
          )} 
          aria-hidden="true" 
        />
      </div>

      {/* Dropdown Menu */}
      <UserDropdown 
        isOpen={dropdownOpen}
        onClose={handleCloseDropdown}
        user={user}
        onLogout={handleLogout}
        variant={variant}
      />
    </div>
  );
}