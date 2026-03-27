/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📋 MODULE : ActionsView (Process Action Tracking)
 * RÔLE : Suivi des levées d'écarts par processus
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { KeyboardEvent, useCallback } from 'react';
import { Clock, CheckCircle2, AlertTriangle, Users, Shield, ExternalLink } from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ActionStatus = 'EN_COURS' | 'CLOTUREE' | 'ANNULEE' | 'EN_RETARD';

export interface ActionResponsable {
  U_Id?: string;
  U_FirstName?: string;
  U_LastName?: string;
  U_Email?: string;
}

export interface Action {
  ACT_Id: string;
  ACT_Title: string;
  ACT_Description?: string;
  ACT_Status: ActionStatus;
  ACT_Deadline?: string;
  ACT_Responsable?: ActionResponsable;
  ACT_ProcessusId?: string;
  ACT_CreatedAt?: string;
  ACT_UpdatedAt?: string;
}

export interface ActionsViewProps {
  actions?: Action[];
  onActionClick?: (action: Action) => void;
  emptyMessage?: string;
  className?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const STATUS_CONFIG: Record<ActionStatus, { label: string; color: string; bg: string; border: string }> = {
  EN_COURS: { label: 'EN COURS', color: 'text-blue-400', bg: 'bg-blue-600/10', border: 'border-blue-600/20' },
  CLOTUREE: { label: 'CLÔTURÉE', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ANNULEE: { label: 'ANNULÉE', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  EN_RETARD: { label: 'EN RETARD', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

// ============================================================================
// SOUS-COMPOSANT : ACTION CARD
// ============================================================================

interface ActionCardProps {
  action: Action;
  onClick?: (action: Action) => void;
}

function ActionCard({ action, onClick }: ActionCardProps) {
  const status = STATUS_CONFIG[action.ACT_Status] || STATUS_CONFIG.EN_COURS;
  
  const handleClick = useCallback(() => {
    onClick?.(action);
  }, [action, onClick]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'INDÉFINIE';
    try {
      return new Date(dateString).toLocaleDateString('fr-SN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'INDÉFINIE';
    }
  };

  const isOverdue = action.ACT_Status === 'EN_RETARD';

  return (
    <article 
      className={cn(
        "bg-white/5 p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] border border-white/5 hover:border-blue-500/40 hover:bg-blue-600/5 transition-all group relative overflow-hidden focus-within:border-blue-500/30 focus-within:ring-2 focus-within:ring-blue-400",
        isOverdue && "border-red-500/20 hover:border-red-500/40"
      )}
      role="article"
      aria-label={`Action: ${action.ACT_Title}`}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="flex justify-between items-start mb-4 md:mb-6">
        <h4 
          className={cn(
            "font-black text-white text-base md:text-lg lg:text-xl uppercase italic tracking-tighter m-0 pr-8 md:pr-10 group-hover:text-blue-400 transition-colors truncate flex-1",
            isOverdue && "text-red-400"
          )}
        >
          {action.ACT_Title}
        </h4>
        <span 
          className={cn(
            "px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black border uppercase tracking-widest whitespace-nowrap",
            status.bg, status.color, status.border
          )}
          role="status"
          aria-label={`Statut: ${status.label}`}
        >
          {status.label}
        </span>
      </div>
      
      <p className="text-slate-400 text-[10px] md:text-xs mb-6 md:mb-8 font-medium leading-relaxed italic pr-8 md:pr-12 line-clamp-2">
        {action.ACT_Description || "Description scellée en attente..."}
      </p>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 lg:gap-10 text-[8px] md:text-[9px] font-black text-slate-500 uppercase italic border-t border-white/5 pt-4 md:pt-6">
        <div className={cn(
          "flex items-center gap-1.5 md:gap-2 group-hover:text-white transition-colors",
          isOverdue && "text-red-400"
        )}>
          <Clock size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-blue-400" aria-hidden="true" /> 
          <span>
            Échéance :{' '}
            <span className={cn("text-slate-200", isOverdue && "text-red-200")}>
              {formatDate(action.ACT_Deadline)}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2 text-blue-400">
          <Users size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" /> 
          <span>
            Agent :{' '}
            <span className="underline decoration-blue-500/30 text-white">
              {action.ACT_Responsable?.U_LastName 
                ? `${action.ACT_Responsable.U_LastName}${action.ACT_Responsable.U_FirstName ? ` ${action.ACT_Responsable.U_FirstName.charAt(0)}.` : ''}`
                : 'NON ASSIGNÉ'
              }
            </span>
          </span>
        </div>
        {onClick && (
          <button 
            type="button"
            className="ml-auto flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
            aria-label={`Voir les détails de ${action.ACT_Title}`}
          >
            <span className="text-[8px] md:text-[9px] uppercase tracking-widest hidden sm:inline">Détails</span>
            <ExternalLink size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  message: string;
}

function EmptyState({ message }: EmptyStateProps) {
  return (
    <div 
      className="p-12 md:p-16 lg:p-20 text-center border-2 md:border-4 border-dashed border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3rem] bg-white/2 italic"
      role="status"
      aria-label={message}
    >
      <Shield size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-slate-700 mx-auto mb-4 md:mb-6 opacity-20" aria-hidden="true" />
      <p className="text-slate-500 text-[9px] md:text-[10px] lg:text-xs font-black uppercase tracking-widest m-0">
        {message}
      </p>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ActionsView({ 
  actions = [], 
  onActionClick,
  emptyMessage = "Registre des actions vierge",
  className 
}: ActionsViewProps) {
  if (!actions || actions.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div 
      className={cn("space-y-3 md:space-y-4 lg:space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 italic font-sans text-left", className)}
      role="list"
      aria-label="Liste des actions correctives"
    >
      {actions.map((action) => (
        <ActionCard 
          key={action.ACT_Id}
          action={action}
          onClick={onActionClick}
        />
      ))}
    </div>
  );
}