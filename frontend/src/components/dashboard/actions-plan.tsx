/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📋 MODULE : ActionPlan (Corrective Actions Tracking)
 * RÔLE : Suivi opérationnel des actions correctives
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { KeyboardEvent } from 'react';
import { CheckCircle2, Clock, User, Calendar, MoreVertical, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export type ActionStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type ActionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Action {
  id: string;
  title: string;
  description?: string;
  status: ActionStatus;
  priority: ActionPriority;
  responsible: string;
  responsibleId?: string;
  dueDate: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  NC_Id?: string;
  AUDIT_Id?: string;
}

export interface ActionPlanProps {
  actions?: Action[];
  onActionClick?: (action: Action) => void;
  onActionMenuClick?: (action: Action, e: React.MouseEvent) => void;
  emptyMessage?: string;
  className?: string;
}

export interface ActionCardProps {
  action: Action;
  onClick?: (action: Action) => void;
  onMenuClick?: (action: Action, e: React.MouseEvent) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>, action: Action) => void;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const PRIORITY_CONFIG: Record<ActionPriority, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-200' },
  HIGH: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-200' },
  MEDIUM: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-200' },
  LOW: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-200' }
};

const STATUS_CONFIG: Record<ActionStatus, { bg: string; border: string; text: string; icon: React.ElementType }> = {
  DONE: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', icon: CheckCircle2 },
  IN_PROGRESS: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', icon: Clock },
  TODO: { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-600', icon: Clock },
  CANCELLED: { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-500', icon: Clock }
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date invalide';
    return date.toLocaleDateString('fr-SN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return 'Date invalide';
  }
};

// ============================================================================
// SOUS-COMPOSANT : ACTION CARD
// ============================================================================

function ActionCard({ action, onClick, onMenuClick, onKeyDown }: ActionCardProps) {
  const priorityConfig = PRIORITY_CONFIG[action.priority];
  const statusConfig = STATUS_CONFIG[action.status];
  const StatusIcon = statusConfig.icon;
  const isDone = action.status === 'DONE';

  const handleClick = () => {
    onClick?.(action);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
    onKeyDown?.(e, action);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMenuClick?.(action, e);
  };

  return (
    <article 
      className={cn(
        "group bg-white p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] border border-slate-200 hover:border-blue-500/50 hover:shadow-xl transition-all duration-500 relative overflow-hidden text-left focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-400",
        isDone && "opacity-75"
      )}
      role="article"
      aria-label={`Action: ${action.title}`}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute -right-2 md:-right-4 -bottom-2 md:-bottom-4 text-slate-100 opacity-20 rotate-12 pointer-events-none" aria-hidden="true">
        <ShieldCheck size={80} className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 relative z-10">
        <div className="space-y-2 md:space-y-3 lg:space-y-4 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <span className={cn(
              "px-2 md:px-3 lg:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[7px] md:text-[8px] font-black border uppercase tracking-widest inline-block",
              priorityConfig.bg, priorityConfig.text, priorityConfig.border
            )}>
              {action.priority}
            </span>
            <span className="text-slate-300 text-[8px] md:text-[9px] font-black tracking-widest leading-none">
              #{action.id}
            </span>
            {isDone && (
              <span className="text-emerald-500 text-[8px] md:text-[9px] font-black tracking-widest leading-none flex items-center gap-1">
                <CheckCircle2 size={10} className="w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" />
                Terminée
              </span>
            )}
          </div>
          
          <h3 className={cn(
            "text-base md:text-lg font-black text-slate-900 tracking-tighter m-0 leading-none truncate",
            "group-hover:text-blue-600 transition-colors"
          )}>
            {action.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-slate-500">
            <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-tight italic">
              <User size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-500" aria-hidden="true" /> 
              <span className="truncate max-w-[150px] md:max-w-[200px]">{action.responsible}</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-tight italic">
              <Calendar size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" /> 
              <span className="tabular-nums">{formatDate(action.dueDate)}</span>
            </div>
            {action.completedAt && isDone && (
              <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-tight italic text-emerald-500">
                <CheckCircle2 size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" /> 
                <span className="tabular-nums">{formatDate(action.completedAt)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 shrink-0">
          <div className="text-right">
            <div className={cn(
              "flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border inline-flex",
              statusConfig.bg, statusConfig.border, statusConfig.text
            )} role="status" aria-label={`Statut: ${action.status}`}>
              <StatusIcon size={12} className={cn("w-3 h-3 md:w-3.5 md:h-3.5", !isDone && "animate-pulse")} aria-hidden="true" />
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest leading-none">
                {action.status === 'IN_PROGRESS' ? 'EN COURS' : action.status}
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleMenuClick}
            className="p-1.5 md:p-2 text-slate-300 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors bg-transparent border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={`Options pour ${action.title}`}
            tabIndex={-1}
          >
            <MoreVertical size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  message?: string;
}

function EmptyState({ message = "Aucune action corrective" }: EmptyStateProps) {
  return (
    <div 
      className="py-12 md:py-16 lg:py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] bg-slate-50/50"
      role="status"
      aria-label={message}
    >
      <AlertCircle size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-slate-300 mb-4 md:mb-6" aria-hidden="true" />
      <p className="text-slate-500 text-[10px] md:text-[11px] font-black uppercase tracking-widest italic">
        {message}
      </p>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export function ActionPlan({ 
  actions = [], 
  onActionClick, 
  onActionMenuClick, 
  emptyMessage = "Aucune action corrective",
  className 
}: ActionPlanProps) {
  const data = Array.isArray(actions) ? actions : [];

  const handleCardKeyDown = (e: KeyboardEvent<HTMLDivElement>, action: Action) => {
    // Can add additional keyboard handling here
  };

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div 
      className={cn("space-y-3 md:space-y-4 animate-in fade-in duration-700 italic font-sans", className)}
      role="list"
      aria-label="Liste des actions correctives"
    >
      {data.map((action) => (
        <ActionCard 
          key={action.id}
          action={action}
          onClick={onActionClick}
          onMenuClick={onActionMenuClick}
          onKeyDown={handleCardKeyDown}
        />
      ))}
    </div>
  );
}

export default ActionPlan;