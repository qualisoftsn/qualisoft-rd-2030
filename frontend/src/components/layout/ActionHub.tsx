/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * ⚡ MODULE : ACTION HUB TACTIQUE (ELITE-SDE)
 * RÔLE : Orchestration dynamique des titres et leviers opérationnels
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useMemo, useCallback, useState, KeyboardEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Plus, FileDown, Filter, ChevronRight, 
  Zap, ShieldCheck, LayoutGrid, Target, 
  Users, MapPin, Search, Loader2, AlertCircle,
  Download, X
} from 'lucide-react';
import { cn } from '@/core/utils/cn';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'USER' | 'HR' | 'QHSE' | 'FINANCE' | 'PROCUREMENT' | 'OBSERVATEUR';

export interface UserAuth {
  U_Id: string;
  U_Email: string;
  U_FirstName: string;
  U_LastName: string;
  U_Role: UserRole;
  U_TenantId?: string;
  U_TenantName?: string;
  U_IsActive?: boolean;
}

export interface AuthState {
  user: UserAuth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setLogin: (credentials: { token: string; user: UserAuth }) => void;
  setLogout: () => void;
}

export interface RouteContext {
  title: string;
  icon: React.ElementType;
  color: string;
  action?: string;
  actionPath?: string;
  permissions?: UserRole[];
  description?: string;
}

export interface ActionHubProps {
  className?: string;
  onActionClick?: (action: string) => void;
}

export interface ActionButtonProps {
  icon: React.ElementType;
  tooltip: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  'aria-label'?: string;
}

export interface Breadcrumb {
  label: string;
  path: string;
  isCurrent: boolean;
}

// ============================================================================
// CONSTANTES & CONFIGURATION
// ============================================================================

const ROUTE_MAPPING: Record<string, RouteContext> = {
  '/dashboard': { 
    title: 'Cockpit Stratégique', 
    icon: LayoutGrid, 
    color: 'text-blue-400',
    description: 'Vue d\'ensemble des indicateurs QHSE'
  },
  '/workspace/sites': { 
    title: 'Gestion des Sites', 
    icon: MapPin, 
    color: 'text-emerald-400', 
    action: 'Nouveau Site',
    actionPath: '/workspace/sites/nouveau',
    permissions: ['ADMIN', 'MANAGER', 'SUPER_ADMIN'],
    description: 'Administration des établissements du GIE'
  },
  '/workspace/structure': { 
    title: 'Architecture SMI', 
    icon: Target, 
    color: 'text-purple-400', 
    action: 'Ajouter Unité',
    actionPath: '/workspace/structure/unite/nouveau',
    permissions: ['ADMIN', 'SUPER_ADMIN'],
    description: 'Organisation hiérarchique et processus'
  },
  '/workspace/users': { 
    title: 'Registre Citoyen', 
    icon: Users, 
    color: 'text-blue-400', 
    action: 'Enrôler Agent',
    actionPath: '/workspace/users/invite',
    permissions: ['ADMIN', 'HR', 'SUPER_ADMIN'],
    description: 'Gestion des accès et profils utilisateurs'
  },
  '/workspace/tiers': { 
    title: 'Registre des Tiers', 
    icon: ShieldCheck, 
    color: 'text-amber-400', 
    action: 'Nouveau Partenaire',
    actionPath: '/workspace/tiers/nouveau',
    permissions: ['ADMIN', 'PROCUREMENT', 'SUPER_ADMIN'],
    description: 'Fournisseurs, prestataires et parties intéressées'
  },
  '/admin/matrix': { 
    title: 'Matrix Master Control', 
    icon: Zap, 
    color: 'text-blue-500',
    permissions: ['SUPER_ADMIN'],
    description: 'Administration globale de la plateforme'
  },
  '/admin/payments': { 
    title: 'Closing Financier', 
    icon: FileDown, 
    color: 'text-emerald-400',
    permissions: ['ADMIN', 'FINANCE', 'SUPER_ADMIN'],
    description: 'Réconciliations et rapports comptables'
  },
  '/risks': { 
    title: 'Registre des Risques', 
    icon: ShieldCheck, 
    color: 'text-rose-400', 
    action: 'Indexer Risque',
    actionPath: '/risks/nouveau',
    permissions: ['ADMIN', 'QHSE', 'SUPER_ADMIN'],
    description: 'Cartographie et suivi des risques ISO 31000'
  },
};

const DEFAULT_CONTEXT: RouteContext = { 
  title: 'Qualisoft Elite', 
  icon: Zap, 
  color: 'text-slate-400',
  description: 'Plateforme de gestion QHSE conforme OHADA'
};

// ============================================================================
// SOUS-COMPOSANT : ACTION BUTTON
// ============================================================================

function ActionButton({ 
  icon: Icon, 
  tooltip, 
  onClick, 
  disabled = false,
  loading = false,
  className,
  'aria-label': ariaLabel 
}: ActionButtonProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const handleClick = useCallback(() => {
    if (disabled || loading) return;
    onClick?.();
  }, [disabled, loading, onClick]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button 
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
      onFocus={() => setIsTooltipVisible(true)}
      onBlur={() => setIsTooltipVisible(false)}
      disabled={disabled || loading}
      className={cn(
        "p-2 md:p-2.5 lg:p-3 bg-white/5 rounded-lg md:rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A] relative group/btn",
        (disabled || loading) && "opacity-50 cursor-not-allowed hover:bg-white/5 hover:text-slate-400",
        className
      )}
      aria-label={ariaLabel || tooltip}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      title={tooltip}
      tabIndex={0}
    >
      {loading ? (
        <Loader2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" aria-hidden="true" />
      ) : (
        <Icon size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
      )}
      
      {/* Tooltip accessible */}
      <span 
        className={cn(
          "absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#0F172A] border border-white/10 px-2 md:px-3 py-1 md:py-1.5 rounded-lg whitespace-nowrap text-[6px] md:text-[7px] font-black uppercase tracking-widest text-blue-400 shadow-2xl z-50 transition-all pointer-events-none",
          isTooltipVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        )}
        role="tooltip"
        aria-hidden={!isTooltipVisible}
      >
        {tooltip}
      </span>
    </button>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL : ACTION HUB
// ============================================================================

export default function ActionHub({ className, onActionClick }: ActionHubProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore() as AuthState;
  
  const [isExporting, setIsExporting] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  // Détection du contexte de route
  const context = useMemo((): RouteContext => {
    if (!pathname) return DEFAULT_CONTEXT;
    
    // Correspondance exacte d'abord
    if (ROUTE_MAPPING[pathname]) return ROUTE_MAPPING[pathname];
    
    // Correspondance par préfixe (ex: /dashboard/finances → /dashboard)
    const baseRoute = pathname.split('/').slice(0, 3).join('/');
    if (ROUTE_MAPPING[baseRoute]) return ROUTE_MAPPING[baseRoute];
    
    return DEFAULT_CONTEXT;
  }, [pathname]);

  // Vérification des permissions
  const canPerformAction = useMemo((): boolean => {
    if (!context.permissions || context.permissions.length === 0) return true;
    if (!user?.U_Role) return false;
    
    const userRole = user.U_Role.toUpperCase() as UserRole;
    return context.permissions.includes(userRole) || userRole === 'SUPER_ADMIN';
  }, [context.permissions, user?.U_Role]);

  const Icon = context.icon;

  // Actions globales
  const handleExport = useCallback(async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    const toastId = toast.loading("Génération du rapport...");
    
    try {
      // Simulation d'export - à remplacer par appel API réel
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Déclenchement du téléchargement
      const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), route: pathname }, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${pathname?.replace(/\//g, '-') || 'data'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Export téléchargé avec succès", { id: toastId });
      onActionClick?.('export');
      
    } catch (error) {
      console.error("❌ Erreur export:", error);
      toast.error("Échec de l'export. Réessayez.", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, pathname, onActionClick]);

  const handleFilter = useCallback(() => {
    setIsFiltering(prev => !prev);
    onActionClick?.('filter');
    toast.info("Panneau de filtres ouvert", { duration: 2000 });
  }, [onActionClick]);

  const handlePrimaryAction = useCallback(() => {
    if (!canPerformAction) {
      toast.error("Permissions insuffisantes pour cette action", { duration: 4000 });
      return;
    }
    
    if (context.actionPath) {
      router.push(context.actionPath);
    } else {
      toast.info(`Action "${context.action}" déclenchée`, { duration: 3000 });
    }
    
    onActionClick?.(context.action?.toLowerCase().replace(/\s+/g, '_') || 'primary');
  }, [canPerformAction, context.action, context.actionPath, router, onActionClick]);

  // Breadcrumbs dynamiques
  const breadcrumbs = useMemo((): Breadcrumb[] => {
    if (!pathname) return [];
    
    const parts = pathname.split('/').filter(Boolean);
    return parts.map((part, index) => ({
      label: part.toUpperCase(),
      path: '/' + parts.slice(0, index + 1).join('/'),
      isCurrent: index === parts.length - 1,
    }));
  }, [pathname]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && isFiltering) {
      setIsFiltering(false);
    }
  };

  return (
    <div 
      className={cn(
        "w-full h-14 md:h-16 lg:h-20 border-b border-white/5 bg-[#0B0F1A]/80 backdrop-blur-md flex items-center justify-between px-3 md:px-6 lg:px-8 shrink-0 animate-in fade-in slide-in-from-top-2 duration-300",
        className
      )}
      role="region"
      aria-label="Barre d'actions contextuelles"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      
      {/* 🧭 SECTION GAUCHE : BREADCRUMBS & TITRE DYNAMIQUE */}
      <div className="flex flex-col gap-0.5 md:gap-1 min-w-0 flex-1">
        {/* Breadcrumbs (Desktop) */}
        {breadcrumbs.length > 0 && (
          <nav 
            className="hidden sm:flex items-center gap-1 md:gap-1.5 text-[6px] md:text-[7px] lg:text-[8px] font-black uppercase tracking-widest text-slate-500 italic"
            aria-label="Fil d'Ariane"
            role="navigation"
          >
            <button 
              onClick={() => router.push('/dashboard')}
              className="hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-0.5 md:px-1"
              aria-label="Retour au tableau de bord"
            >
              SDE-CORE
            </button>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                <ChevronRight size={8} className="w-2 h-2 opacity-30 shrink-0" aria-hidden="true" />
                {crumb.isCurrent ? (
                  <span className="text-blue-400 truncate max-w-[80px] md:max-w-[120px] lg:max-w-[150px]" aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <button 
                    onClick={() => router.push(crumb.path)}
                    className="hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-0.5 md:px-1 truncate max-w-[60px] md:max-w-[100px] lg:max-w-[120px]"
                  >
                    {crumb.label}
                  </button>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        
        {/* Titre + Icône */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div 
            className={cn(
              "hidden sm:flex p-1.5 md:p-2 rounded-lg md:rounded-xl bg-white/5 border border-white/5 shrink-0", 
              context.color
            )}
            aria-hidden="true"
          >
            <Icon size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm md:text-base lg:text-lg xl:text-xl font-black uppercase italic tracking-tighter text-white m-0 truncate leading-none">
              {context.title}
            </h2>
            {context.description && (
              <p className="hidden md:block text-[6px] md:text-[7px] lg:text-[8px] text-slate-500 uppercase tracking-widest italic mt-0.5 truncate">
                {context.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 🛠️ SECTION DROITE : LEVIERS OPÉRATIONNELS */}
      <div className="flex items-center gap-1 md:gap-1.5 lg:gap-2">
        {/* Actions secondaires */}
        <div className="hidden lg:flex items-center gap-0.5 md:gap-1 border-r border-white/5 pr-2 md:pr-3 mr-1 md:mr-2">
           <ActionButton 
             icon={Filter} 
             tooltip="Filtrer la vue" 
             onClick={handleFilter}
             disabled={isFiltering}
             aria-label={isFiltering ? "Filtres actifs" : "Ouvrir les filtres"}
           />
           <ActionButton 
             icon={Download} 
             tooltip="Exporter les données" 
             onClick={handleExport}
             disabled={isExporting}
             loading={isExporting}
             aria-label={isExporting ? "Export en cours" : "Exporter les données"}
           />
        </div>

        {/* ACTION PRIMAIRE CONTEXTUELLE */}
        {context.action && canPerformAction && (
          <button 
            type="button"
            onClick={handlePrimaryAction}
            className="bg-blue-600 text-white px-3 md:px-4 lg:px-5 xl:px-6 py-1.5 md:py-2 lg:py-2.5 rounded-lg md:rounded-xl font-black uppercase text-[7px] md:text-[8px] lg:text-[9px] xl:text-[10px] tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 flex items-center gap-1 md:gap-1.5 lg:gap-2 border-none cursor-pointer active:scale-95 group focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]"
            aria-label={`Créer: ${context.action}`}
          >
            <Plus 
              size={12}
              className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 shrink-0 group-hover:rotate-90 transition-transform duration-300" 
              strokeWidth={3} 
              aria-hidden="true" 
            />
            <span className="hidden sm:inline">{context.action}</span>
          </button>
        )}
        
        {/* Message permission refusée */}
        {context.action && !canPerformAction && (
          <span 
            className="hidden sm:flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 lg:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[6px] md:text-[7px] lg:text-[8px] font-black uppercase tracking-widest italic"
            role="status"
            aria-live="polite"
          >
            <AlertCircle size={10} className="w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" />
            <span className="hidden lg:inline">Action réservée</span>
          </span>
        )}

        {/* INDICATEUR DE SÉCURITÉ */}
        <div 
          className="hidden md:flex w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-lg md:rounded-xl bg-emerald-500/5 border border-emerald-500/10 items-center justify-center text-emerald-400 shadow-inner cursor-help transition-all hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-400 shrink-0" 
          title="Session sécurisée • TLS 1.3 • Chiffrement AES-256"
          role="status"
          aria-label="Connexion sécurisée active"
          tabIndex={0}
        >
          <ShieldCheck size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 hover:scale-110 transition-transform" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}