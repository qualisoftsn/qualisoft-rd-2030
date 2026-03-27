/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * ⏱️ MODULE : WorkflowTimeline (Approval Chain Visualization)
 * RÔLE : Monitoring visuel de la chaîne d'approbation (§7.5.2)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useMemo, useCallback, KeyboardEvent } from 'react';
import { CheckCircle2, Clock, AlertCircle, User, ChevronRight, Calendar, XCircle, GitMerge, ShieldCheck } from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ApprovalStatus = 'EN_ATTENTE' | 'APPROUVE' | 'REJETE' | 'EN_COURS';

export interface Approver {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_Role?: string;
}

export interface WorkflowStep {
  AW_Id: string;
  AW_Step: number;
  AW_Status: ApprovalStatus;
  AW_Comment?: string;
  AW_CreatedAt: string;
  AW_ApprovedAt?: string;
  AW_RejectedAt?: string;
  AW_Approver?: Approver | null;
  AW_RejectionReason?: string;
}

export interface WorkflowTimelineProps {
  steps?: WorkflowStep[];
  onStepClick?: (step: WorkflowStep) => void;
  className?: string;
  slaHours?: number;
}

export interface StepNodeProps {
  step: WorkflowStep;
  index: number;
  totalSteps: number;
  isLate: boolean;
  isDone: boolean;
  isCurrent: boolean;
  isRejected: boolean;
  isPending: boolean;
  onClick?: (step: WorkflowStep) => void;
  slaHours: number;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_SLA_HOURS = 48;

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  EN_ATTENTE: { label: 'En Attente', color: 'text-slate-400', bg: 'bg-slate-900', border: 'border-white/10', icon: Clock },
  APPROUVE: { label: 'Approuvé', color: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-400', icon: CheckCircle2 },
  REJETE: { label: 'Rejeté', color: 'text-red-400', bg: 'bg-red-600', border: 'border-red-500', icon: XCircle },
  EN_COURS: { label: 'En Cours', color: 'text-blue-400', bg: 'bg-blue-600', border: 'border-blue-400', icon: ShieldCheck },
};

// ============================================================================
// UTILITAIRES
// ============================================================================

const calculateHoursElapsed = (createdAt: string): number => {
  try {
    return (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  } catch {
    return 0;
  }
};

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('fr-SN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

const formatDateTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('fr-SN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

// ============================================================================
// SOUS-COMPOSANT : STEP NODE
// ============================================================================

function StepNode({ step, index, totalSteps, isLate, isDone, isCurrent, isRejected, isPending, onClick, slaHours }: StepNodeProps) {
  const StatusIcon = isDone 
    ? CheckCircle2 
    : isRejected 
    ? XCircle 
    : isLate 
    ? AlertCircle 
    : isCurrent 
    ? ShieldCheck 
    : Clock;

  const statusConfig = STATUS_CONFIG[step.AW_Status] || STATUS_CONFIG.EN_ATTENTE;

  const handleClick = useCallback(() => {
    onClick?.(step);
  }, [step, onClick]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const hoursElapsed = calculateHoursElapsed(step.AW_CreatedAt);
  const slaPercentage = Math.min(100, (hoursElapsed / slaHours) * 100);

  return (
    <div 
      className="relative z-10 flex flex-col items-center flex-1 min-w-[120px] md:min-w-[150px] lg:min-w-[180px]"
      role="listitem"
      aria-label={`Étape ${step.AW_Step}: ${statusConfig.label}`}
      tabIndex={onClick ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-clickable={!!onClick}
    >
      {/* Step Number Badge */}
      <div 
        className={cn(
          "absolute -top-2 md:-top-3 -right-2 md:-right-3 w-8 h-8 md:w-10 md:h-10 bg-[#0B0F1A] border-2 border-slate-700 rounded-lg md:rounded-xl flex items-center justify-center text-[9px] md:text-[10px] lg:text-[11px] font-black text-white shadow-xl",
          isLate && "border-red-500 bg-red-500/20"
        )}
        aria-hidden="true"
      >
        {step.AW_Step}
      </div>

      {/* Status Node */}
      <div 
        className={cn(
          "w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center border-4 transition-all duration-1000 relative shadow-2xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]",
          isDone ? "bg-emerald-500 border-emerald-400 text-white" : 
          isRejected ? "bg-red-600 border-red-500 text-white" :
          isLate ? "bg-red-600 border-red-500 text-white animate-pulse" :
          isCurrent ? "bg-blue-600 border-blue-400 text-white animate-pulse" :
          "bg-slate-800 border-white/10 text-slate-500 hover:border-slate-600"
        )}
        role="status"
        aria-label={`Statut: ${statusConfig.label}`}
        aria-current={isCurrent ? 'step' : undefined}
      >
        <StatusIcon size={24} className="w-6 h-6 md:w-8 md:h-8" aria-hidden="true" />
        
        {/* SLA Progress Ring (for pending steps) */}
        {isPending && !isLate && (
          <svg 
            className="absolute inset-0 w-full h-full -rotate-90" 
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 46}`}
              strokeDashoffset={`${2 * Math.PI * 46 * (1 - slaPercentage / 100)}`}
              className={cn(
                "transition-all duration-1000",
                slaPercentage > 80 ? "text-amber-400" : "text-blue-400"
              )}
            />
          </svg>
        )}
      </div>

      {/* Step Info */}
      <div className="mt-6 md:mt-8 lg:mt-10 text-center space-y-2 md:space-y-3 w-full max-w-[150px] md:max-w-[180px]">
        <h4 
          className={cn(
            "text-[9px] md:text-[10px] lg:text-[11px] font-black uppercase tracking-widest truncate",
            isLate ? "text-red-400" : "text-slate-200"
          )}
        >
          {step.AW_Comment || 'JALON VALIDATION'}
        </h4>
        
        <div 
          className={cn(
            "bg-white/5 rounded-lg md:rounded-xl p-3 md:p-4 border border-white/5 transition-all",
            onClick && "group-hover:border-blue-500/30 cursor-pointer"
          )}
        >
          <p className="text-[9px] md:text-[10px] font-black text-slate-200 uppercase m-0 leading-none truncate">
            {step.AW_Approver?.U_FirstName} {step.AW_Approver?.U_LastName || 'Non assigné'}
          </p>
          <p className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1 md:mt-1.5 m-0 italic truncate">
            {step.AW_Approver?.U_Role || '—'}
          </p>
        </div>

        {isDone && step.AW_ApprovedAt && (
          <div 
            className="flex items-center justify-center gap-1 md:gap-1.5 text-[8px] md:text-[9px] font-black text-emerald-400 uppercase tracking-widest"
            aria-label={`Approuvé le ${formatDate(step.AW_ApprovedAt)}`}
          >
            <Calendar size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" /> 
            {formatDate(step.AW_ApprovedAt)}
          </div>
        )}

        {isLate && (
          <div 
            className="py-1.5 md:py-2 px-3 md:px-4 bg-red-600/10 border border-red-600/20 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black text-red-400 uppercase italic tracking-widest animate-pulse"
            role="alert"
            aria-live="polite"
          >
            SLA EXPIRÉE ({Math.floor(hoursElapsed)}h)
          </div>
        )}

        {isRejected && step.AW_RejectionReason && (
          <div 
            className="py-1.5 md:py-2 px-3 md:px-4 bg-red-600/10 border border-red-600/20 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black text-red-400 uppercase italic tracking-widest"
            role="alert"
          >
            {step.AW_RejectionReason.substring(0, 30)}...
          </div>
        )}
      </div>

      {/* Connector Line (except last step) */}
      {index < totalSteps - 1 && (
        <div 
          className="absolute top-8 md:top-10 left-1/2 w-full h-1.5 md:h-2 -translate-x-1/2 z-0 hidden lg:block"
          aria-hidden="true"
        >
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              isDone ? "bg-emerald-500" : isLate ? "bg-red-500" : "bg-slate-800"
            )}
            style={{ width: `${isDone ? 100 : isPending ? slaPercentage : 0}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  className?: string;
}

function EmptyState({ className }: EmptyStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center p-12 md:p-16 lg:p-20 border-2 border-dashed border-white/5 rounded-2xl md:rounded-3xl bg-black/20 italic font-sans text-center",
        className
      )}
      role="status"
      aria-label="Aucun circuit de validation"
    >
      <GitMerge 
        size={48} 
        className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-slate-700 mb-4 md:mb-6 animate-pulse" 
        aria-hidden="true" 
      />
      <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-600 tracking-widest leading-relaxed">
        Aucun circuit de validation scellé détecté
      </p>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function WorkflowTimeline({ 
  steps = [], 
  onStepClick, 
  className,
  slaHours = DEFAULT_SLA_HOURS 
}: WorkflowTimelineProps) {
  // Sort steps by order
  const sortedSteps = useMemo(() => {
    return [...steps].sort((a, b) => a.AW_Step - b.AW_Step);
  }, [steps]);

  // Calculate step statuses
  const stepStatuses = useMemo(() => {
    return sortedSteps.map(step => {
      const hoursElapsed = calculateHoursElapsed(step.AW_CreatedAt);
      const isLate = step.AW_Status === 'EN_ATTENTE' && hoursElapsed > slaHours;
      const isDone = step.AW_Status === 'APPROUVE';
      const isRejected = step.AW_Status === 'REJETE';
      const isCurrent = step.AW_Status === 'EN_ATTENTE' && !isLate;
      const isPending = step.AW_Status === 'EN_ATTENTE' || step.AW_Status === 'EN_COURS';
      
      return { isLate, isDone, isRejected, isCurrent, isPending };
    });
  }, [sortedSteps, slaHours]);

  // Find current step for aria-current
  const currentStepIndex = sortedSteps.findIndex(s => s.AW_Status === 'EN_ATTENTE');

  if (!sortedSteps.length) {
    return <EmptyState className={className} />;
  }

  return (
    <div 
      className={cn(
        "w-full py-8 md:py-12 lg:py-16 overflow-x-auto custom-scrollbar italic font-sans bg-[#0B0F1A]/40 rounded-2xl md:rounded-3xl border border-white/5",
        className
      )}
      role="region"
      aria-label="Timeline du workflow d'approbation"
    >
      <div 
        className="relative flex justify-between items-start min-w-[800px] md:min-w-[1000px] max-w-7xl mx-auto px-8 md:px-12 lg:px-20"
        role="list"
        aria-label="Étapes d'approbation"
      >
        {/* Connection Line Background */}
        <div 
          className="absolute top-8 md:top-10 left-14 md:left-20 right-14 md:right-20 h-1.5 md:h-2 bg-gradient-to-r from-blue-600/40 via-slate-800 to-slate-900 z-0 rounded-full"
          aria-hidden="true"
        />
        
        {sortedSteps.map((step, idx) => {
          const statuses = stepStatuses[idx];
          
          return (
            <StepNode 
              key={step.AW_Id || idx}
              step={step}
              index={idx}
              totalSteps={sortedSteps.length}
              isLate={statuses.isLate}
              isDone={statuses.isDone}
              isCurrent={statuses.isCurrent}
              isRejected={statuses.isRejected}
              isPending={statuses.isPending}
              onClick={onStepClick}
              slaHours={slaHours}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div 
        className="mt-8 md:mt-10 lg:mt-12 flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8 px-4"
        role="list"
        aria-label="Légende des statuts"
      >
        {[
          { label: 'En Attente', color: 'bg-slate-800', border: 'border-white/10' },
          { label: 'En Cours', color: 'bg-blue-600', border: 'border-blue-400' },
          { label: 'Approuvé', color: 'bg-emerald-500', border: 'border-emerald-400' },
          { label: 'Rejeté', color: 'bg-red-600', border: 'border-red-500' },
          { label: 'SLA Expirée', color: 'bg-red-600', border: 'border-red-500 animate-pulse' },
        ].map((item) => (
          <div 
            key={item.label}
            className="flex items-center gap-1.5 md:gap-2"
            role="listitem"
          >
            <div 
              className={cn(
                "w-3 h-3 md:w-4 md:h-4 rounded-full border-2",
                item.color, item.border
              )}
              aria-hidden="true"
            />
            <span className="text-[7px] md:text-[8px] font-black uppercase text-slate-500 tracking-widest">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}