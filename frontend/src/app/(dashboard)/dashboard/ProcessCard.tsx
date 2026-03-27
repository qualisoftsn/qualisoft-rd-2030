/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📊 COMPOSANT : ProcessCard (ISO 9001 §4.4 / §9.1)
 * RÔLE : Monitoring Performance (KPI) & Risques
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { KeyboardEvent } from 'react';
import { ArrowUpRight, AlertTriangle, CheckCircle2, Target, AlertCircle } from 'lucide-react';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface IndicatorValue {
  IV_Actual: number;
  IV_Date?: string;
  IV_Comment?: string;
}

export interface Indicator {
  IND_Id?: string;
  IND_Cible: number;
  IND_Values?: IndicatorValue[];
  IND_Name?: string;
  IND_Unit?: string;
}

export interface Risk {
  RS_Id?: string;
  RS_Score: number;
  RS_Libelle: string;
  RS_Severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  RS_Status?: string;
}

export interface ProcessData {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_Description?: string;
  PR_Indicators?: Indicator[];
  PR_Risks?: Risk[];
  PR_IsActive?: boolean;
  PR_OwnerId?: string;
  PR_Owner?: {
    U_FirstName: string;
    U_LastName: string;
  };
}

export interface ProcessCardProps {
  process: ProcessData;
  onClick?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ProcessCard({ process, onClick, onKeyDown }: ProcessCardProps) {
  const kpi = process.PR_Indicators?.[0];
  const actual = kpi?.IND_Values?.[0]?.IV_Actual ?? 0;
  const target = kpi?.IND_Cible || 1;
  const performance = Math.min((actual / target) * 100, 100);

  const risk = process.PR_Risks?.[0];
  const isHighRisk = (risk?.RS_Score ?? 0) > 10;
  const isOptimal = performance >= 95;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <article 
      className="bg-[#0F172A] border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-500/50 transition-all group shadow-2xl relative overflow-hidden text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
      role="article"
      aria-label={`Processus: ${process.PR_Libelle}`}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute -inset-px bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" aria-hidden="true" />

      <div className="flex justify-between items-start mb-4 md:mb-6 relative z-10">
        <div className="min-w-0 flex-1">
          <span className="text-[8px] md:text-[9px] font-black text-blue-400 uppercase tracking-widest italic leading-none">
            {process.PR_Code || 'PROC-000'}
          </span>
          <h3 className="text-base md:text-lg font-black text-white mt-1 md:mt-1.5 group-hover:text-blue-400 transition-colors tracking-tighter italic leading-tight truncate">
            {process.PR_Libelle}
          </h3>
        </div>
        <div 
          className={cn(
            "p-2 md:p-2.5 rounded-lg md:rounded-xl border transition-all shrink-0",
            isOptimal 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          )}
          aria-hidden="true"
        >
          {isOptimal ? (
            <CheckCircle2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" strokeWidth={2.5} />
          ) : (
            <AlertTriangle size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" strokeWidth={2.5} />
          )}
        </div>
      </div>

      <div className="space-y-3 md:space-y-4 relative z-10" role="group" aria-label="Indicateurs de performance">
        <div className="flex justify-between items-end text-[8px] md:text-[9px] font-black uppercase italic tracking-widest leading-none">
          <div className="flex items-center gap-1.5 md:gap-2 text-slate-500">
            <Target size={12} className="w-3 h-3 md:w-3.5 md:h-3.5" aria-hidden="true" /> 
            Indice Performance
          </div>
          <span 
            className={cn("tabular-nums", isOptimal ? 'text-emerald-400' : 'text-white')}
            aria-label={`Performance: ${performance.toFixed(1)}%`}
          >
            {performance.toFixed(1)}%
          </span>
        </div>
        <div 
          className="h-1.5 md:h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner"
          role="progressbar"
          aria-valuenow={Math.round(performance)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progression: ${performance.toFixed(1)}%`}
        >
          <div 
            className={cn(
              "h-full transition-all duration-1000 ease-out",
              isOptimal 
                ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                : 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]'
            )} 
            style={{ width: `${performance}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="mt-4 md:mt-6 lg:mt-8 pt-4 md:pt-5 border-t border-white/5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1" role="status" aria-live="polite">
          <div 
            className={cn(
              "w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0",
              isHighRisk 
                ? 'bg-red-500 animate-pulse shadow-[0_0_10px_red]' 
                : 'bg-slate-700'
            )}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="text-[7px] md:text-[8px] text-slate-600 uppercase font-black italic tracking-tighter m-0">
              Risque Majeur
            </p>
            <p className="text-[9px] md:text-[10px] text-white font-bold uppercase italic mt-0.5 md:mt-1 truncate m-0">
              {risk?.RS_Libelle || 'R.A.S'}
            </p>
          </div>
        </div>
        <button 
          type="button"
          className="p-1.5 md:p-2 text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg md:rounded-xl transition-all cursor-pointer bg-transparent border-none shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={`Voir les détails de ${process.PR_Libelle}`}
          tabIndex={-1}
        >
          <ArrowUpRight size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
        </button>
      </div>
      
      {isHighRisk && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-0.5 md:h-1 bg-red-600/30" 
          aria-hidden="true" 
        />
      )}
    </article>
  );
}