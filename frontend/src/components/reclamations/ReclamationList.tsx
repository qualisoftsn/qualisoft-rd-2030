/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📋 MODULE : ReclamationList (Claims Registry Table)
 * RÔLE : Registre tabulaire des dossiers Qualité
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { KeyboardEvent, useCallback } from 'react';
import { ShieldAlert, ExternalLink, Eye } from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type WorkflowStatus = 'NOUVELLE' | 'EN_ANALYSE' | 'ACTION_EN_COURS' | 'TRAITEE' | 'REJETEE';

export interface Tier {
  TR_Id: string;
  TR_Name: string;
  TR_Type?: string;
  TR_Email?: string;
}

export interface Reclamation {
  REC_Id: string;
  REC_Reference: string;
  REC_Object: string;
  REC_Status: WorkflowStatus;
  REC_DateReceipt: string;
  REC_Tier?: Tier;
  REC_TierName?: string;
  REC_Gravity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  REC_CreatedAt?: string;
  REC_UpdatedAt?: string;
}

export interface ReclamationListProps {
  reclamations?: Reclamation[];
  onReclamationClick?: (reclamation: Reclamation) => void;
  emptyMessage?: string;
  className?: string;
}

export interface StatusBadgeProps {
  status: WorkflowStatus;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const STATUS_CONFIG: Record<WorkflowStatus, { label: string; color: string; bg: string; border: string }> = {
  NOUVELLE: { label: 'NOUVELLE', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  EN_ANALYSE: { label: 'EN ANALYSE', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  ACTION_EN_COURS: { label: 'ACTION EN COURS', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  TRAITEE: { label: 'TRAITÉE', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  REJETEE: { label: 'REJETÉE', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

// ============================================================================
// SOUS-COMPOSANT : STATUS BADGE
// ============================================================================

function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NOUVELLE;
  
  return (
    <span 
      className={cn(
        "px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase border italic whitespace-nowrap inline-block",
        config.bg, config.color, config.border
      )}
      role="status"
      aria-label={`Statut: ${config.label}`}
    >
      {config.label}
    </span>
  );
}

// ============================================================================
// SOUS-COMPOSANT : TABLE ROW
// ============================================================================

interface ReclamationRowProps {
  reclamation: Reclamation;
  onClick?: (reclamation: Reclamation) => void;
}

function ReclamationRow({ reclamation, onClick }: ReclamationRowProps) {
  const handleClick = useCallback(() => {
    onClick?.(reclamation);
  }, [reclamation, onClick]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('fr-SN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  const tierName = reclamation.REC_Tier?.TR_Name || reclamation.REC_TierName || 'AGENT_EXT';

  return (
    <tr 
      className="hover:bg-blue-50/30 transition-all cursor-pointer group focus-within:bg-blue-50/50 focus:outline-none"
      role="row"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Réclamation: ${reclamation.REC_Reference}`}
    >
      <td className="px-4 md:px-6 lg:px-8 py-4 md:py-5" role="gridcell">
        <span className="text-[10px] md:text-sm font-black text-blue-500 tracking-tighter hover:text-blue-600 transition-colors flex items-center gap-1 md:gap-2">
          #{reclamation.REC_Reference}
          <ExternalLink size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
        </span>
      </td>
      <td className="px-4 md:px-6 lg:px-8 py-4 md:py-5" role="gridcell">
        <span className="text-[10px] md:text-sm font-bold text-slate-800 uppercase tracking-tight truncate block max-w-[200px] md:max-w-[300px]">
          {reclamation.REC_Object}
        </span>
      </td>
      <td className="px-4 md:px-6 lg:px-8 py-4 md:py-5" role="gridcell">
        <span className="text-[10px] md:text-sm font-black text-slate-500 uppercase truncate block max-w-[150px] md:max-w-[200px]">
          {tierName}
        </span>
      </td>
      <td className="px-4 md:px-6 lg:px-8 py-4 md:py-5 text-center" role="gridcell">
        <StatusBadge status={reclamation.REC_Status} />
      </td>
      <td className="px-4 md:px-6 lg:px-8 py-4 md:py-5 text-right" role="gridcell">
        <span className="text-[9px] md:text-[10px] lg:text-[11px] text-slate-500 font-mono font-black tabular-nums">
          {formatDate(reclamation.REC_DateReceipt)}
        </span>
      </td>
    </tr>
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
    <tr role="row">
      <td colSpan={5} className="py-16 md:py-20 lg:py-24 text-center" role="status">
        <ShieldAlert size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mx-auto text-slate-300 mb-3 md:mb-4" aria-hidden="true" />
        <p className="text-[9px] md:text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest">
          {message}
        </p>
      </td>
    </tr>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ReclamationList({ 
  reclamations = [], 
  onReclamationClick,
  emptyMessage = "Le registre est vierge",
  className 
}: ReclamationListProps) {
  const handleClick = useCallback((reclamation: Reclamation) => {
    onReclamationClick?.(reclamation);
  }, [onReclamationClick]);

  return (
    <div 
      className={cn(
        "mt-8 md:mt-10 lg:mt-12 overflow-hidden bg-white shadow-xl md:shadow-2xl rounded-2xl md:rounded-3xl border border-slate-100 italic",
        className
      )}
      role="region"
      aria-label="Registre des réclamations"
    >
      <div className="overflow-x-auto" role="region" aria-label="Tableau des réclamations" tabIndex={0}>
        <table className="min-w-full divide-y divide-slate-100 text-left" role="table">
          <thead className="bg-slate-50/50" role="rowgroup">
            <tr role="row">
              <th 
                className="px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase text-slate-400 tracking-widest" 
                scope="col"
                role="columnheader"
              >
                Référence
              </th>
              <th 
                className="px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase text-slate-400 tracking-widest" 
                scope="col"
                role="columnheader"
              >
                Objet
              </th>
              <th 
                className="px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase text-slate-400 tracking-widest" 
                scope="col"
                role="columnheader"
              >
                Tiers
              </th>
              <th 
                className="px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase text-slate-400 tracking-widest text-center" 
                scope="col"
                role="columnheader"
              >
                Statut Workflow
              </th>
              <th 
                className="px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase text-slate-400 tracking-widest text-right" 
                scope="col"
                role="columnheader"
              >
                Réception
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50" role="rowgroup">
            {reclamations.length > 0 ? (
              reclamations.map((rec) => (
                <ReclamationRow 
                  key={rec.REC_Id}
                  reclamation={rec}
                  onClick={handleClick}
                />
              ))
            ) : (
              <EmptyState message={emptyMessage} />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}